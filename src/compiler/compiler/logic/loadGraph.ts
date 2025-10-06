import {
  arePathsEqual,
  type Graph,
  type GraphDiff,
  mergeGraphDiffs,
} from "@graph/graph";
import deepEqual from "deep-equal";
import type { Connection } from "@graph/connection";
import { type CompilerInternal } from "./compilerInternal";
import { connectionToID } from "./graphCache";

export async function loadGraphIntoCompiler(
  this: CompilerInternal,
  otherGraph: Graph
): Promise<GraphDiff> {
  this.graph.version = otherGraph.version;

  const otherNodes = new Map(
    otherGraph.nodes.map((node) => [node.identifier, node])
  );

  const otherConnections = new Map(
    otherGraph.connections.map((conn) => [connectionToID(conn), conn])
  );

  const addedIncludes = otherGraph.includes.filter(
    (include) => !this.graph.includes.some((i) => arePathsEqual(i, include))
  );

  const removedIncludes = this.graph.includes.filter(
    (include) => !otherGraph.includes.some((i) => arePathsEqual(i, include))
  );

  const addedNodes = otherGraph.nodes.filter(
    (otherNode) => !this.cache.hasNode(otherNode.identifier)
  );

  // TODO just add and remove all for now
  const addedGroups = otherGraph.groups;

  const addedConnections = otherGraph.connections.filter(
    (conn) => !this.cache.getConnectionById(connectionToID(conn))
  );

  const removedConnections: Connection[] = this.graph.connections.filter(
    (conn) => !otherConnections.has(connectionToID(conn))
  );

  // TODO just add and remove all for now
  const removedGroups = this.graph.groups.map((group) => group.id);

  const removedNodes = this.graph.nodes
    .filter((node) => !otherNodes.get(node.identifier))
    .map((node) => node.identifier);

  const modifiedNodes = this.graph.nodes.filter((node) => {
    const otherNode = otherNodes.get(node.identifier);
    if (!otherNode) return false;

    return !deepEqual(node, otherNode);
  });

  const removedUniforms = Object.keys(this.graph.uniforms).filter(
    (uniformId) => otherGraph.uniforms[uniformId]
  );

  // Uniforms that exist in both graphs but can have different definitions
  const modifiedUniforms = otherGraph.uniforms;

  let diff: GraphDiff = {};

  diff = mergeGraphDiffs([diff, this.removeGroups(removedGroups)]);
  diff = mergeGraphDiffs([diff, this.removeConnections(removedConnections)]);
  diff = mergeGraphDiffs([diff, this.removeNodes(removedNodes, false)]);
  diff = mergeGraphDiffs([diff, this.removeUniforms(removedUniforms)]);

  diff = mergeGraphDiffs([diff, this.removeIncludes(removedIncludes)]);
  const addedIncludesDiff = await this.addIncludes(addedIncludes);
  diff = mergeGraphDiffs([diff, addedIncludesDiff]);

  diff = mergeGraphDiffs([diff, this.updateUniforms(modifiedUniforms)]);
  diff = mergeGraphDiffs([diff, this.insertNodes(addedNodes)]);
  diff = mergeGraphDiffs([diff, this.addConnections(addedConnections)]);
  diff = mergeGraphDiffs([diff, this.insertGroups(addedGroups)]);

  diff.nodesWithModifiedProperties = diff.nodesWithModifiedProperties
    ? [...diff.nodesWithModifiedProperties, ...modifiedNodes]
    : modifiedNodes;
  const invalidatedNodeIds = this.invalidateNodes(
    modifiedNodes.map((node) => node.identifier)
  );

  if (invalidatedNodeIds.size > 0) {
    if (!diff.invalidatedNodeIds) {
      diff.invalidatedNodeIds = new Set();
    }

    for (const node of invalidatedNodeIds) {
      diff.invalidatedNodeIds.add(node);
    }
  }

  for (const node of modifiedNodes) {
    const otherNode = otherNodes.get(node.identifier);
    if (otherNode) {
      node.position = {
        ...otherNode.position,
      };
      node.parameters = {
        ...otherNode.parameters,
      };
    }
  }

  // TODO optimize, first information about added nodes is invalid cause connections aren't yet set:
  for (const addedNode of diff.addedNodes || []) {
    addedNode.instanceInfo = this.getNodeInfo(addedNode.node).instanceInfo;
  }

  return diff;
}

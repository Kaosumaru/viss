import { mergeGraphDiffs, type Graph, type GraphDiff } from "@graph/graph";
import type { CompilerInternal } from "./compilerInternal";

export function pasteNodes(
  compiler: CompilerInternal,
  graph: Graph,
  offsetX: number,
  offsetY: number
): GraphDiff {
  let resultingDiff: GraphDiff = {};
  const remappedNodeIds = new Map<string, string>();

  graph.nodes.forEach((node) => {
    const copiedNode = { ...node };
    copiedNode.position.x += offsetX;
    copiedNode.position.y += offsetY;

    if (compiler.hasNode(copiedNode.identifier)) {
      // If the node already exists, we need to generate a new identifier
      copiedNode.identifier = compiler.generateNodeId();
      remappedNodeIds.set(node.identifier, copiedNode.identifier);
    }

    const diff = compiler.addNode(copiedNode);
    resultingDiff = mergeGraphDiffs([resultingDiff, diff]);
  });

  graph.connections.forEach((connection) => {
    const sourceNodeId =
      remappedNodeIds.get(connection.from.nodeId) ?? connection.from.nodeId;
    const targetNodeId =
      remappedNodeIds.get(connection.to.nodeId) ?? connection.to.nodeId;

    const copiedConnection = {
      ...connection,
      from: { ...connection.from, nodeId: sourceNodeId },
      to: { ...connection.to, nodeId: targetNodeId },
    };

    const diff = compiler.addConnection(copiedConnection);
    resultingDiff = mergeGraphDiffs([resultingDiff, diff]);
  });

  return resultingDiff;
}

import type { NodeInfo } from "@compiler/nodes/compilerNode";
import type { Connection } from "./connection";
import type { Node } from "./node";
import type { Uniforms } from "./uniform";

export interface Graph {
  version: number;
  includes: GLSLInclude[];
  uniforms: Uniforms;
  nodes: Node[];
  connections: Connection[];
  // comments?: Comment[];
}

export interface GLSLInclude {
  name: string;
  content: string;
}

export interface AddedNodeInfo {
  node: Node;
  instanceInfo: NodeInfo;
}

export interface GraphDiff {
  addedNodes?: AddedNodeInfo[];
  removedNodes?: Node[];
  addedConnections?: Connection[];
  removedConnections?: Connection[];
  translatedNodes?: Set<string>;
  nodesWithModifiedProperties?: Node[];
  invalidatedNodeIds?: Set<string>;
  updatedUniforms?: Uniforms;

  warnings?: string[];
}

export function mergeGraphDiffs(diffs: GraphDiff[]): GraphDiff {
  return diffs.reduce((acc, diff) => {
    acc.addedNodes = [...(acc.addedNodes || []), ...(diff.addedNodes || [])];
    acc.removedNodes = [
      ...(acc.removedNodes || []),
      ...(diff.removedNodes || []),
    ];
    acc.addedConnections = [
      ...(acc.addedConnections || []),
      ...(diff.addedConnections || []),
    ];
    acc.removedConnections = [
      ...(acc.removedConnections || []),
      ...(diff.removedConnections || []),
    ];
    acc.invalidatedNodeIds =
      acc.invalidatedNodeIds || diff.invalidatedNodeIds
        ? new Set([
            ...(acc.invalidatedNodeIds || []),
            ...(diff.invalidatedNodeIds || []),
          ])
        : undefined;
    acc.nodesWithModifiedProperties = [
      ...(acc.nodesWithModifiedProperties || []),
      ...(diff.nodesWithModifiedProperties || []),
    ];
    acc.updatedUniforms =
      acc.updatedUniforms || diff.updatedUniforms
        ? {
            ...(acc.updatedUniforms || {}),
            ...(diff.updatedUniforms || {}),
          }
        : undefined;
    acc.warnings = [...(acc.warnings || []), ...(diff.warnings || [])];
    acc.translatedNodes =
      acc.translatedNodes || diff.translatedNodes
        ? new Set([
            ...(acc.translatedNodes || []),
            ...(diff.translatedNodes || []),
          ])
        : undefined;
    return acc;
  }, {} as GraphDiff);
}

import type { Graph } from "@graph/graph";
import { CompilerInternal } from "./compilerInternal";

export function copyNodes(
  compiler: CompilerInternal,
  nodeIds: string[]
): Graph {
  const nodesToCopy = new Set<string>(nodeIds);
  const result: Graph = {
    version: CompilerInternal.graphVersion,
    includes: [],
    nodes: [],
    connections: [],
  };

  nodeIds.forEach((nodeId) => {
    const node = compiler.getNodeById(nodeId);
    if (!node) {
      throw new Error(`Node with ID ${nodeId} does not exist.`);
    }

    const copiedNode = { ...node };
    result.nodes.push(copiedNode);
  });

  compiler.getGraph().connections.forEach((connection) => {
    if (
      nodesToCopy.has(connection.from.nodeId) &&
      nodesToCopy.has(connection.to.nodeId)
    ) {
      const copiedConnection = { ...connection };
      result.connections.push(copiedConnection);
    }
  });

  return result;
}

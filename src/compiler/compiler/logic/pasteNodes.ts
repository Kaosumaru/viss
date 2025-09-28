import { mergeGraphDiffs, type Graph, type GraphDiff } from "@graph/graph";
import type { CompilerInternal } from "./compilerInternal";
import type { Position } from "@graph/position";

export function pasteNodes(
  compiler: CompilerInternal,
  graph: Graph,
  offsetX: number,
  offsetY: number
): GraphDiff {
  let resultingDiff: GraphDiff = {};
  const remappedNodeIds = new Map<string, string>();

  const center = calculateGraphCenter(graph);

  graph.nodes.forEach((node) => {
    const copiedNode = { ...node };
    copiedNode.position.x += -center.x + offsetX;
    copiedNode.position.y += -center.y + offsetY;

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

  // TODO optimize, first information about added nodes is invalid cause connections aren't yet set:
  for (const addedNode of resultingDiff.addedNodes || []) {
    const newInfo = compiler.getInfo([addedNode.node.identifier]);
    if (newInfo[0]) {
      addedNode.instanceInfo = newInfo[0].instanceInfo;
    }
  }

  return resultingDiff;
}

function calculateGraphCenter(graph: Graph): Position {
  const positions = graph.nodes.map((node) => node.position);
  const centerX =
    positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
  const centerY =
    positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
  return { x: centerX, y: centerY };
}

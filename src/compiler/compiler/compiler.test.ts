import { Compiler } from "./compiler";
import { scalar, vector } from "@glsl/types/types";
import { expect, test } from "vitest";

test("getOutputType returns correct type for float literal", () => {
  const compiler = new Compiler({ noVariables: true });

  const { addedNodes } = compiler.addNode({
    nodeType: "float",
    position: { x: 0, y: 0 },
    parameters: {
      value: { type: "number", value: 42.0 },
    },
  });

  if (!addedNodes || addedNodes.length === 0) {
    throw new Error("Failed to add node");
  }

  const node = addedNodes[0];
  if (!node) {
    throw new Error("Node is undefined");
  }

  const nodeId = node.node.identifier;
  const outputType = compiler.getOutputType({ nodeId, socketId: "out" });

  expect(outputType).toEqual(scalar("float"));
});

test("getOutputType returns correct type for vector add operation", () => {
  const compiler = new Compiler({ noVariables: true });

  // Create two vector literals
  const { addedNodes: nodes1 } = compiler.addNode({
    nodeType: "vec3",
    position: { x: 0, y: 0 },
    parameters: {},
  });

  const { addedNodes: nodes2 } = compiler.addNode({
    nodeType: "vec3",
    position: { x: 100, y: 0 },
    parameters: {},
  });

  // Create add node
  const { addedNodes: addNodes } = compiler.addNode({
    nodeType: "add",
    position: { x: 200, y: 0 },
    parameters: {},
  });

  if (
    !nodes1 ||
    nodes1.length === 0 ||
    !nodes2 ||
    nodes2.length === 0 ||
    !addNodes ||
    addNodes.length === 0
  ) {
    throw new Error("Failed to add nodes");
  }

  const node1 = nodes1[0];
  const node2 = nodes2[0];
  const addNode = addNodes[0];

  if (!node1 || !node2 || !addNode) {
    throw new Error("Nodes are undefined");
  }

  const vec3Node1Id = node1.node.identifier;
  const vec3Node2Id = node2.node.identifier;
  const addNodeId = addNode.node.identifier;

  // Connect the nodes
  compiler.addConnection({
    from: { nodeId: vec3Node1Id, socketId: "out" },
    to: { nodeId: addNodeId, socketId: "a" },
  });

  compiler.addConnection({
    from: { nodeId: vec3Node2Id, socketId: "out" },
    to: { nodeId: addNodeId, socketId: "b" },
  });

  const outputType = compiler.getOutputType({
    nodeId: addNodeId,
    socketId: "out",
  });

  expect(outputType).toEqual(vector("float", 3));
});

test("getOutputType throws error for invalid socket id", () => {
  const compiler = new Compiler({ noVariables: true });

  const { addedNodes } = compiler.addNode({
    nodeType: "float",
    position: { x: 0, y: 0 },
    parameters: {
      value: { type: "number", value: 1.0 },
    },
  });

  if (!addedNodes || addedNodes.length === 0) {
    throw new Error("Failed to add node");
  }

  const node = addedNodes[0];
  if (!node) {
    throw new Error("Node is undefined");
  }

  const nodeId = node.node.identifier;

  expect(() => {
    compiler.getOutputType({ nodeId, socketId: "invalid_socket" });
  }).toThrow("Output socket with id invalid_socket not found");
});

test("getOutputType throws error for invalid node id", () => {
  const compiler = new Compiler({ noVariables: true });

  expect(() => {
    compiler.getOutputType({ nodeId: "invalid_node_id", socketId: "out" });
  }).toThrow("Node with id invalid_node_id not found");
});

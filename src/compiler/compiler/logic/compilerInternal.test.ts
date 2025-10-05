import { Compiler } from "@compiler/compiler";
import { scalar, vector } from "@glsl/types/types";
import { expect, test } from "vitest";

test("getInputType returns undefined when no connection exists", async () => {
  const compiler = new Compiler({ noVariables: true });
  await compiler.loadGraph({
    version: 1,
    includes: [],
    nodes: [
      {
        identifier: "add",
        nodeType: "add",
        position: { x: 0, y: 0 },
        parameters: {},
      },
    ],
    connections: [],
    uniforms: {},
  });

  const inputType = compiler.getInputType("add", "a");
  expect(inputType).toBeUndefined();
});

test("getInputType returns type of connected output socket", async () => {
  const compiler = new Compiler({ noVariables: true });
  await compiler.loadGraph({
    version: 1,
    includes: [],
    nodes: [
      {
        identifier: "float1",
        nodeType: "float",
        position: { x: 0, y: 0 },
        parameters: {
          value: { type: "number", value: 1.0 },
        },
      },
      {
        identifier: "add",
        nodeType: "add",
        position: { x: 0, y: 0 },
        parameters: {},
      },
    ],
    connections: [
      {
        from: {
          nodeId: "float1",
          socketId: "out",
        },
        to: {
          nodeId: "add",
          socketId: "a",
        },
      },
    ],
    uniforms: {},
  });

  const inputType = compiler.getInputType("add", "a");
  expect(inputType).toEqual(scalar("float"));
});

test("getInputType works with vector types", async () => {
  const compiler = new Compiler({ noVariables: true });
  await compiler.loadGraph({
    version: 1,
    includes: [],
    nodes: [
      {
        identifier: "vec2",
        nodeType: "vec2",
        position: { x: 0, y: 0 },
        parameters: {
          x: { type: "number", value: 1.0 },
          y: { type: "number", value: 2.0 },
        },
      },
      {
        identifier: "add",
        nodeType: "add",
        position: { x: 0, y: 0 },
        parameters: {},
      },
    ],
    connections: [
      {
        from: {
          nodeId: "vec2",
          socketId: "out",
        },
        to: {
          nodeId: "add",
          socketId: "a",
        },
      },
    ],
    uniforms: {},
  });

  const inputType = compiler.getInputType("add", "a");
  expect(inputType).toEqual(vector("float", 2));
});

test("getInputType returns undefined for non-existent socket", async () => {
  const compiler = new Compiler({ noVariables: true });
  await compiler.loadGraph({
    version: 1,
    includes: [],
    nodes: [
      {
        identifier: "add",
        nodeType: "add",
        position: { x: 0, y: 0 },
        parameters: {},
      },
    ],
    connections: [],
    uniforms: {},
  });

  const inputType = compiler.getInputType("add", "nonexistent");
  expect(inputType).toBeUndefined();
});

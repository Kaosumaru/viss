import { scalar, vector } from "@glsl/types/types";
import { expectedOutput, setup } from "@test/setup";
import { expect, test } from "vitest";

test("sqrt function", async () => {
  const c = await setup({
    a: {
      type: "float",
      params: {
        value: { type: "number", value: 4.0 },
      },
    },
    sqrt: {
      type: "sqrt",
    },
  })
    .connect("sqrt", "in", "a")
    .compile("sqrt");

  expect(c).toEqual(expectedOutput(`sqrt(4.0)`, scalar("float")));
});

test("sqrt function with vector", async () => {
  const c = await setup({
    a: {
      type: "vec3",
      params: {
        x: { type: "number", value: 4.0 },
        y: { type: "number", value: 9.0 },
        z: { type: "number", value: 16.0 },
      },
    },
    sqrt: {
      type: "sqrt",
    },
  })
    .connect("sqrt", "in", "a")
    .compile("sqrt");

  expect(c).toEqual(expectedOutput(`sqrt(vec3(4.0, 9.0, 16.0))`, vector("float", 3)));
});

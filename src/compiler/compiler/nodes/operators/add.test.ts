import { scalar } from "@glsl/types";
import { expectedOutput, setup } from "@test/setup";
import { expect, test } from "vitest";

test("add floats", () => {
  const c = setup({
    a: {
      type: "float",
      params: {
        value: { type: "number", value: 1.0 },
      },
    },
    b: {
      type: "float",
      params: {
        value: { type: "number", value: 2.0 },
      },
    },
    add: {
      type: "add",
    },
  }).compile("add");

  expect(c).toEqual(expectedOutput("1 + 2", scalar("float")));
});

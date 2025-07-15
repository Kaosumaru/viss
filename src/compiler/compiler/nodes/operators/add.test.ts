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
  })
    .connect("add", "a", "a")
    .connect("add", "b", "b")
    .compile("add");

  expect(c).toEqual(expectedOutput("(1.0) + (2.0)", scalar("float")));
});

import { scalar } from "@glsl/types";
import { expectedOutput, setup } from "@test/setup";
import { expect, test } from "vitest";

test("substract floats", () => {
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
    substract: {
      type: "substract",
    },
  })
    .connect("substract", "a", "a")
    .connect("substract", "b", "b")
    .compile("substract");

  expect(c).toEqual(expectedOutput("(1.0) - (2.0)", scalar("float")));
});

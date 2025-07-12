import { setup } from "@test/setup";
import { expect, test } from "vitest";

test("expect float literal to output float", () => {
  const c = setup({
    floatNode: {
      type: "float",
      params: {
        value: { type: "number", value: 1.0 },
      },
    },
  }).compile("floatNode");

  expect(c).toEqual({
    type: "float",
    value: 1.0,
  });
});

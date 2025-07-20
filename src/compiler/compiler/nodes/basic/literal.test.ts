import { scalar } from "@glsl/types";
import { expectedOutput, setup } from "@test/setup";
import { expect, test } from "vitest";

test("FloatLiteral", () => {
  const c = setup({
    floatNode: {
      type: "float",
      params: {
        value: { type: "number", value: 1.0 },
      },
    },
  }).compile("floatNode");

  expect(c).toEqual(expectedOutput("1.0", scalar("float"), true));
});

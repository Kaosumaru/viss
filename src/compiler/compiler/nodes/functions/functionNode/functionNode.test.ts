import { scalar } from "@glsl/types/types";
import { expectedOutput, setup } from "@test/setup";
import { expect, test } from "vitest";

test("sin function", async () => {
  const c = await setup({
    a: {
      type: "float",
      params: {
        value: { type: "number", value: 1.0 },
      },
    },
    sin: {
      type: "sin",
    },
  })
    .connect("sin", "in", "a")
    .compile("sin");

  expect(c).toEqual(expectedOutput(`sin(1.0)`, scalar("float")));
});

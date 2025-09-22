import { scalar, vector } from "@glsl/types/types";
import { setup } from "@test/setup";
import { expect, test } from "vitest";

test("PreviewNode", () => {
  const c = setup({
    floatNode: {
      type: "float",
      params: {
        value: { type: "number", value: 1.0 },
      },
    },
    preview: {
      type: "preview",
    },
  })
    .connect("preview", "in", "floatNode")
    .compile("preview");

  expect(c).toEqual({
    outputs: {
      out: {
        data: "1.0",
        trivial: true,
        type: scalar("float"),
      },
    },
    variables: [],
  });
});

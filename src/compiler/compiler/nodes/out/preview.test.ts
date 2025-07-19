import { vector } from "@glsl/types";
import { expectedOutput, setup } from "@test/setup";
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

  expect(c).toEqual(expectedOutput("vec4(vec3(1.0), 1.0)", vector("float", 4)));
});

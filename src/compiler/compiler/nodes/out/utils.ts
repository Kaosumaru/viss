import type { Expression } from "@compiler/context";
import { vector } from "@glsl/types";
import type { OutputExpression } from "../compilerNode";

export function createPreviewExpression(in_: Expression) {
  let outputExpression: OutputExpression | null = null;
  if (in_.type.id === "scalar") {
    outputExpression = {
      data: `vec4(vec3(${in_.data}), 1.0)`,
      type: vector(in_.type.type, 4),
    };
  } else if (in_.type.id === "vector") {
    const type = vector(in_.type.type, 4);
    if (in_.type.size === 2) {
      outputExpression = {
        data: `vec4(${in_.data}.xy, 0.0, 1.0)`,
        type,
      };
    } else if (in_.type.size === 3) {
      outputExpression = {
        data: `vec4(${in_.data}.xyz, 1.0)`,
        type,
      };
    } else if (in_.type.size === 4) {
      outputExpression = {
        data: in_.data,
        type: vector(in_.type.type, 4),
      };
    }
  }
  if (!outputExpression)
    throw new Error("Preview node only supports scalar inputs");

  // we are marking it as trivial so variable isn't emitted
  outputExpression.trivial = true;
  return outputExpression;
}

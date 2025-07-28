import type { Color } from "@graph/parameter";

export function toFloat(n: number): string {
  const expression = n.toLocaleString("en-GB", {
    minimumFractionDigits: 1,
  });
  return expression;
}

export function toVec4(color: Color): string {
  return `vec4(${toFloat(color[0])}, ${toFloat(color[1])}, ${toFloat(
    color[2]
  )}, ${toFloat(color[3])})`;
}

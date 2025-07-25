import type { GLSLInclude } from "@graph/graph";

const sampleInclude = `
float add(float a, float b) {
  return a + b;
}
`;

export function getBuiltInFunctions(): GLSLInclude[] {
  return [
    {
      name: "sampleInclude",
      content: sampleInclude,
    },
  ];
}
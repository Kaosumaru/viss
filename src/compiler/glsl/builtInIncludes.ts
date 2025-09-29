import type { GLSLInclude } from "@graph/graph";

const sampleInclude = `
#define PI 3.14159265358979323846

#pragma editor: preview, export
float add(float a, float b) {
  return a + b;
}

#pragma editor: preview, export
float spiral(vec2 uv, float time, float dis, float width, float blur)
{
    vec2 o=uv;
    float angle=atan(o.y,o.x);
    float l=length(o);
    float offset=l+(angle/(2.*PI))*dis;
    float circles=mod(offset-time,dis);
    return (smoothstep(circles-blur,circles,width)-smoothstep(circles,circles+blur,width));
}
`;

export function getBuiltInFunctions(): GLSLInclude[] {
  return [
    {
      name: "sampleInclude",
      content: sampleInclude,
      path: {
        kind: "workspace",
        path: "path/to/sampleInclude.glsl",
      },
    },
  ];
}

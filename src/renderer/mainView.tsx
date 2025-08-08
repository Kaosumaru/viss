import styled from "styled-components";
import { EditorView } from "./editorView";
import { PropertyView } from "./propertyView";
import { useCallback, useState } from "react";
import type { OnGraphChanged } from "./graph/editor";
import type { EditorAPI } from "./graph/interface";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  grid-template-rows: 2fr 3fr;
  grid-template-areas:
    "canvas result"
    "canvas result";
  box-sizing: border-box;
  height: 100vh;
`;

const Result = styled.div`
  grid-area: result;
  position: relative;
`;

const Canvas = styled.div`
  grid-area: canvas;
  position: relative;
`;

const defaultColor = "vec4(0.0, 0.0, 0.0, 1.0)";

const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
}
`;

export function MainView() {
  const [shader, setShader] = useState(fragmentShader); // Default color

  const [editorData, setEditorData] = useState<EditorAPI | undefined>(
    undefined
  );

  const onChanged: OnGraphChanged = useCallback((editorData) => {
    setEditorData(editorData);
    const newShader = editorData.compileNode();
    setShader(newShader ? newShader : defaultColor);
  }, []);

  return (
    <Layout>
      <Canvas>
        <EditorView onChanged={onChanged} />
      </Canvas>

      <Result>
        <PropertyView fragmentShader={shader} editorData={editorData} />
      </Result>
    </Layout>
  );
}

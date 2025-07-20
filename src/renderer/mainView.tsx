import styled from "styled-components";
import { EditorView, type EditorData } from "./editorView";
import { PropertyView } from "./propertyView";
import { useCallback, useState } from "react";
import type { OnGraphChanged, OnControlChanged } from "./editor";
import { compileGraph } from "./utils/compileGraph";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  grid-template-rows: 2fr 3fr;
  grid-template-areas:
    "canvas result"
    "canvas result";
  gap: 0.6em;
  padding: 0.6em;
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
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
}
`;

export function MainView() {
  const [shader, setShader] = useState(fragmentShader); // Default color

  const [editorData, setEditorData] = useState<EditorData | undefined>(
    undefined
  );

  const onChanged: OnGraphChanged = useCallback((editorData) => {
    setEditorData(editorData);
    const newShader = compileGraph(editorData);
    setShader(newShader ? newShader : defaultColor);
  }, []);

  const onControlChanged: OnControlChanged = useCallback(
    (editorData, nodeId, controlKey, value) => {
      console.log(
        `Control changed on node ${nodeId}, control ${controlKey}: ${value}`
      );
      // Recompile the graph when a control changes
      const newShader = compileGraph(editorData);
      setShader(newShader ? newShader : defaultColor);
    },
    []
  );

  return (
    <Layout>
      <Canvas>
        <EditorView onChanged={onChanged} onControlChanged={onControlChanged} />
      </Canvas>

      <Result>
        <PropertyView fragmentShader={shader} editorData={editorData} />
      </Result>
    </Layout>
  );
}

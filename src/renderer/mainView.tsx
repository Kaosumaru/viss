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

export function MainView() {
  const [color, setColor] = useState(
    "vec4(gl_FragCoord.x/500.0, gl_FragCoord.y/500.0, 0.5, 1.0)"
  ); // Default color

  const [editorData, setEditorData] = useState<EditorData | undefined>(
    undefined
  );

  const onChanged: OnGraphChanged = useCallback((editorData) => {
    setEditorData(editorData);
    const context = compileGraph(editorData);
    setColor(context?.mainOutput ? context.mainOutput : defaultColor);
  }, []);

  const onControlChanged: OnControlChanged = useCallback(
    (editorData, nodeId, controlKey, value) => {
      console.log(
        `Control changed on node ${nodeId}, control ${controlKey}: ${value}`
      );
      // Recompile the graph when a control changes
      const context = compileGraph(editorData);
      setColor(context?.mainOutput ? context.mainOutput : defaultColor);
    },
    []
  );

  return (
    <Layout>
      <Canvas>
        <EditorView onChanged={onChanged} onControlChanged={onControlChanged} />
      </Canvas>

      <Result>
        <PropertyView color={color} editorData={editorData} />
      </Result>
    </Layout>
  );
}

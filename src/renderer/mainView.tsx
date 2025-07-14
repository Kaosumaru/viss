import styled from "styled-components";
import { EditorView } from "./editorView";
import { PropertyView } from "./propertyView";
import { useCallback, useState } from "react";
import type { OnGraphChanged } from "./editor";
import { compileGraph } from "./compileGraph";

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

export function MainView() {
  const [color, setColor] = useState(
    "vec4(gl_FragCoord.x/500.0, gl_FragCoord.y/500.0, 0.5, 1.0)"
  ); // Default color

  const onChanged: OnGraphChanged = useCallback((editor) => {
    const context = compileGraph(editor);
    setColor(
      context?.mainOutput ? context.mainOutput : "vec4(0.0, 0.0, 0.0, 1.0)"
    );
  }, []);

  return (
    <Layout>
      <Canvas>
        <EditorView onChanged={onChanged} />
      </Canvas>

      <Result>
        <PropertyView color={color} />
      </Result>
    </Layout>
  );
}

import styled from "styled-components";
import { EditorView } from "./editorView";
import { PropertyView } from "./propertyView";
import { FloatingToolbar } from "./components/toolbar";
import { useCallback, useState } from "react";
import type { OnGraphChanged } from "./graph/editor";
import type { EditorAPI } from "./graph/interface";

const Layout = styled.div<{ $isPropertyViewVisible: boolean }>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$isPropertyViewVisible ? "1fr 0.3fr" : "1fr"};
  grid-template-rows: 2fr 3fr;
  grid-template-areas: ${(props) =>
    props.$isPropertyViewVisible
      ? '"canvas result" "canvas result"'
      : '"canvas canvas" "canvas canvas"'};
  box-sizing: border-box;
  height: 100vh;
`;

const Result = styled.div<{ $isVisible: boolean }>`
  grid-area: result;
  position: relative;
  display: ${(props) => (props.$isVisible ? "block" : "none")};
`;

const Canvas = styled.div`
  grid-area: canvas;
  position: relative;
`;

const defaultColor = "vec4(0.0, 0.0, 0.0, 1.0)";

const fragmentShader = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
}
`;

export function MainView() {
  const [shader, setShader] = useState(fragmentShader); // Default color
  const [isPropertyViewVisible, setIsPropertyViewVisible] = useState(true);

  const [editorData, setEditorData] = useState<EditorAPI | undefined>(
    undefined
  );

  const onChanged: OnGraphChanged = useCallback((editorData) => {
    setEditorData(editorData);
    const newShader = editorData.compileNode();
    setShader(newShader ? newShader : defaultColor);
  }, []);

  const handleTogglePropertyView = useCallback(() => {
    setIsPropertyViewVisible((prev) => !prev);
  }, []);

  return (
    <Layout $isPropertyViewVisible={isPropertyViewVisible}>
      <Canvas>
        <EditorView onChanged={onChanged} />
        <FloatingToolbar
          isPropertyViewVisible={isPropertyViewVisible}
          onTogglePropertyView={handleTogglePropertyView}
        />
      </Canvas>

      <Result $isVisible={isPropertyViewVisible}>
        <PropertyView fragmentShader={shader} editorData={editorData} />
      </Result>
    </Layout>
  );
}

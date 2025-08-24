import styled from "styled-components";
import { EditorView } from "./editorView";
import { PropertyView } from "./propertyView";
import { FloatingToolbar } from "./components/toolbar";
import { UniformsPanel } from "./components/uniforms/UniformsPanel";
import { useCallback, useState } from "react";
import type { OnGraphChanged } from "./graph/editor";
import type { EditorAPI } from "./graph/interface";

const Layout = styled.div<{ $sidebarVisible: boolean }>`
  display: grid;
  grid-template-columns: ${({ $sidebarVisible }) =>
    $sidebarVisible ? "1fr 300px" : "1fr"};
  grid-template-rows: 1fr;
  grid-template-areas: ${({ $sidebarVisible }) =>
    $sidebarVisible ? '"canvas sidebar"' : '"canvas"'};
  box-sizing: border-box;
  height: 100vh;
`;

const Canvas = styled.div`
  grid-area: canvas;
  position: relative;
  min-width: 0;
`;

const Sidebar = styled.div`
  grid-area: sidebar;
  height: 100%;
  background: #222;
  color: #fff;
  box-shadow: -2px 0 8px #0003;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FloatingPropertyView = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 998;
  display: ${(props) => (props.$isVisible ? "block" : "none")};
  pointer-events: ${(props) => (props.$isVisible ? "auto" : "none")};
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
  const [isUniformsPanelVisible, setIsUniformsPanelVisible] = useState(false);

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

  const handleToggleUniformsPanel = useCallback(() => {
    setIsUniformsPanelVisible((prev) => !prev);
  }, []);

  return (
    <Layout $sidebarVisible={isUniformsPanelVisible}>
      <Canvas>
        <EditorView onChanged={onChanged} />
        <FloatingToolbar
          isPropertyViewVisible={isPropertyViewVisible}
          onTogglePropertyView={handleTogglePropertyView}
          isUniformsPanelVisible={isUniformsPanelVisible}
          onToggleUniformsPanel={handleToggleUniformsPanel}
        />
        <FloatingPropertyView $isVisible={isPropertyViewVisible}>
          <PropertyView fragmentShader={shader} editorData={editorData} />
        </FloatingPropertyView>
      </Canvas>
      {isUniformsPanelVisible && (
        <Sidebar>
          {editorData && <UniformsPanel editorData={editorData} />}
        </Sidebar>
      )}
    </Layout>
  );
}

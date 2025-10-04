import styled from "styled-components";
import { EditorView } from "./editorView";
import { PreviewView } from "./previewView";
import { FloatingToolbar } from "./components/toolbar";
import { TabbedSidebar } from "./components/sidebar";
import { useCallback, useState } from "react";
import type { OnGraphChanged } from "./graph/editor";
import type { EditorAPI } from "./graph/interface";
import { EditorProvider } from "./context/editorProvider";

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

const FloatingPreviewView = styled.div<{ $isVisible: boolean; $isFullscreen: boolean }>`
  position: absolute;
  bottom: ${(props) => (props.$isFullscreen ? "0" : "16px")};
  right: ${(props) => (props.$isFullscreen ? "0" : "16px")};
  top: ${(props) => (props.$isFullscreen ? "0" : "auto")};
  left: ${(props) => (props.$isFullscreen ? "0" : "auto")};
  width: ${(props) => (props.$isFullscreen ? "100%" : "auto")};
  height: ${(props) => (props.$isFullscreen ? "100%" : "auto")};
  z-index: ${(props) => (props.$isFullscreen ? "999" : "998")};
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
  const [isPreviewViewVisible, setIsPreviewViewVisible] = useState(true);
  const [isPreviewViewFullscreen, setIsPreviewViewFullscreen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [editorData, setEditorData] = useState<EditorAPI | undefined>(
    undefined
  );

  const onChanged: OnGraphChanged = useCallback((editorData) => {
    setEditorData(editorData);
    const newShader = editorData.compileNode();
    setShader(newShader ? newShader : defaultColor);
  }, []);

  const handleTogglePreviewView = useCallback(() => {
    setIsPreviewViewVisible((prev) => !prev);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => !prev);
  }, []);

  const handleTogglePreviewViewFullscreen = useCallback(() => {
    setIsPreviewViewFullscreen((prev) => !prev);
  }, []);

  return (
    <EditorProvider editor={editorData}>
      <Layout $sidebarVisible={isSidebarVisible}>
        <Canvas>
          <EditorView onChanged={onChanged} />
          <FloatingToolbar
            isPreviewViewVisible={isPreviewViewVisible}
            onTogglePreviewView={handleTogglePreviewView}
            isSidebarVisible={isSidebarVisible}
            onToggleSidebar={handleToggleSidebar}
          />
          <FloatingPreviewView $isVisible={isPreviewViewVisible} $isFullscreen={isPreviewViewFullscreen}>
            <PreviewView 
              fragmentShader={shader} 
              onToggleFullscreen={handleTogglePreviewViewFullscreen}
              isFullscreen={isPreviewViewFullscreen}
            />
          </FloatingPreviewView>
        </Canvas>
        {isSidebarVisible && (
          <Sidebar>{editorData && <TabbedSidebar />}</Sidebar>
        )}
      </Layout>
    </EditorProvider>
  );
}

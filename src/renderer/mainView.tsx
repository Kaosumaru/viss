import styled from "styled-components";
import { EditorView } from "./editorView";
import { PropertyView } from "./propertyView";

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
  return (
    <Layout>
      <Canvas>
        <EditorView />
      </Canvas>

      <Result>
        <PropertyView />
      </Result>
    </Layout>
  );
}

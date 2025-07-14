import { useRete } from "rete-react-plugin";
import { createEditor } from "./editor";

export function EditorView() {
  const [ref] = useRete(createEditor);

  return <div ref={ref} style={{ height: "100vh" }}></div>;
}

import { useRete } from "rete-react-plugin";
import { createEditor, type OnGraphChanged } from "./editor";
import { useCallback } from "react";

export interface EditorViewProps {
  onChanged?: OnGraphChanged;
}

export function EditorView({ onChanged }: EditorViewProps) {
  const create = useCallback(
    (container: HTMLElement) => {
      return createEditor(container, onChanged);
    },
    [onChanged]
  );

  const [ref] = useRete(create);

  return <div ref={ref} style={{ height: "100vh" }}></div>;
}

import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";
import type { Position } from "@graph/position";
import { DisposeHelper } from "./utils/disposeHelper";

export class EditorKeybindings {
  constructor(editor: EditorAPI, area: AreaPlugin<Schemes, AreaExtra>) {
    this.editor = editor;
    this.area = area;

    area.container.tabIndex = 0;

    this.helper.add(() => {
      const cbkeydown = (event: KeyboardEvent) => {
        this.handleKeyDown(event);
      };
      window.addEventListener("keydown", cbkeydown);
      return () => {
        window.removeEventListener("keydown", cbkeydown);
      };
    });

    this.helper.add(() => {
      const cbmousemove = (event: MouseEvent) => {
        this.handleMouseMove(event);
      };
      window.addEventListener("mousemove", cbmousemove);
      return () => {
        window.removeEventListener("mousemove", cbmousemove);
      };
    });
  }
  handleMouseMove(event: MouseEvent) {
    const rect = this.area.container.getBoundingClientRect();
    this.mousePosition.x = event.clientX - rect.left;
    this.mousePosition.y = event.clientY - rect.top;
  }

  public handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Delete" || event.key === "Backspace") {
      const selectedNodes = this.editor.getSelectedNodes();
      if (selectedNodes.length > 0) {
        this.editor.deleteNodes(selectedNodes);
        event.preventDefault();
      }
    }

    if (event.key === "x" && (event.ctrlKey || event.metaKey)) {
      const selectedNodes = this.editor.getSelectedNodes();
      if (selectedNodes.length > 0) {
        const graphJson = this.editor.copyNodes(selectedNodes);
        navigator.clipboard.writeText(graphJson);
        this.editor.deleteNodes(selectedNodes);
        event.preventDefault();
      }
    }

    if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
      const selectedNodes = this.editor.getSelectedNodes();
      if (selectedNodes.length > 0) {
        const graphJson = this.editor.copyNodes(selectedNodes);
        navigator.clipboard.writeText(graphJson);
        event.preventDefault();
      }
    }
    if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
      navigator.clipboard.readText().then((graphJson) => {
        const offsetX = this.mousePosition.x;
        const offsetY = this.mousePosition.y;

        this.editor.pasteNodes(graphJson, "screen", offsetX, offsetY);
        event.preventDefault();
      });
    }
  }

  public destroy() {
    this.helper.dispose();
  }

  private mousePosition: Position = { x: 0, y: 0 };
  private editor: EditorAPI;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private helper = new DisposeHelper();
}

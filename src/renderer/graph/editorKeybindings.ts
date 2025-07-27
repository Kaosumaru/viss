import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";
import type { Position } from "@graph/position";

export class EditorKeybindings {
  constructor(editor: EditorAPI, area: AreaPlugin<Schemes, AreaExtra>) {
    this.editor = editor;
    this.area = area;

    area.container.tabIndex = 0;
    // Bind the keydown event to handle keybindings
    this.area.container.addEventListener("keydown", (event) => {
      this.handleKeyDown(event);
    });

    this.area.container.addEventListener("mousemove", (event) => {
      this.handleMouseMove(event);
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
    this.area.container.removeEventListener("keydown", this.handleKeyDown);
  }

  private mousePosition: Position = { x: 0, y: 0 };
  private editor: EditorAPI;
  private area: AreaPlugin<Schemes, AreaExtra>;
}

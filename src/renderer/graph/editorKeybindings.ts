import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";

export class EditorKeybindings {
  constructor(editor: EditorAPI, area: AreaPlugin<Schemes, AreaExtra>) {
    this.editor = editor;
    this.area = area;

    area.container.tabIndex = 0;
    // Bind the keydown event to handle keybindings
    this.area.container.addEventListener("keydown", (event) => {
      this.handleKeyDown(event);
    });
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
        this.editor.pasteNodes(graphJson, 0, 0);
        event.preventDefault();
      });
    }
  }

  public destroy() {
    this.area.container.removeEventListener("keydown", this.handleKeyDown);
  }

  private editor: EditorAPI;
  private area: AreaPlugin<Schemes, AreaExtra>;
}

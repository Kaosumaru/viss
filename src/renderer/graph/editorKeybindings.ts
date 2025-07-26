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
  }

  public destroy() {
    this.area.container.removeEventListener("keydown", this.handleKeyDown);
  }

  private editor: EditorAPI;
  private area: AreaPlugin<Schemes, AreaExtra>;
}

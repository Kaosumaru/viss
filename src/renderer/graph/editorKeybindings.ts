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

    // Add keydown event listener to call handleKeyDown
    this.helper.add(() => {
      const cbKeyDown = (event: KeyboardEvent) => {
        this.handleKeyDown(event);
      };
      this.area.container.addEventListener("keydown", cbKeyDown);
      return () => {
        this.area.container.removeEventListener("keydown", cbKeyDown);
      };
    });

    // Use native copy, cut, paste events instead of key combinations
    this.helper.add(() => {
      const cbCopy = (event: ClipboardEvent) => {
        const selectedNodes = this.editor.getSelectedNodes();
        if (selectedNodes.length > 0) {
          const graphJson = this.editor.copyNodes(selectedNodes);
          event.clipboardData?.setData("text/plain", graphJson);
          event.preventDefault();
        }
      };
      const cbCut = (event: ClipboardEvent) => {
        const selectedNodes = this.editor.getSelectedNodes();
        if (selectedNodes.length > 0) {
          const graphJson = this.editor.copyNodes(selectedNodes);
          event.clipboardData?.setData("text/plain", graphJson);
          this.editor.deleteNodes(selectedNodes);
          event.preventDefault();
        }
      };
      const cbPaste = (event: ClipboardEvent) => {
        const graphJson = event.clipboardData?.getData("text/plain");
        if (graphJson) {
          const offsetX = this.mousePosition.x;
          const offsetY = this.mousePosition.y;
          this.editor.pasteNodes(graphJson, "screen", offsetX, offsetY);
          event.preventDefault();
        }
      };
      this.area.container.addEventListener("copy", cbCopy);
      this.area.container.addEventListener("cut", cbCut);
      this.area.container.addEventListener("paste", cbPaste);
      return () => {
        this.area.container.removeEventListener("copy", cbCopy);
        this.area.container.removeEventListener("cut", cbCut);
        this.area.container.removeEventListener("paste", cbPaste);
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

  private handleMouseMove(event: MouseEvent) {
    const rect = this.area.container.getBoundingClientRect();
    this.mousePosition.x = event.clientX - rect.left;
    this.mousePosition.y = event.clientY - rect.top;
  }

  // Clipboard actions are now handled by native events
  // Delete key handling can remain if desired
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Delete" || event.key === "Backspace") {
      const selectedNodes = this.editor.getSelectedNodes();
      if (selectedNodes.length > 0) {
        this.editor.deleteNodes(selectedNodes);
        event.preventDefault();
      }
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

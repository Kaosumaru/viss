import type { NodeEditor } from "rete";
import type { EditorAPI } from "./interface";
import type { NodeType } from "@compiler/nodes/allNodes";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import type { OnGraphChanged } from "./editor";
import type { Schemes, AreaExtra } from "./node";
import { UICompilerNode } from "./nodes/compilerNode";
import type { PreviewControl } from "./nodes/controls/customPreviewControl";
import { CompilationHelper } from "./utils/compileGraph";
import { loadGraph } from "./utils/loadGraph";
import { saveGraph } from "./utils/saveGraph";

export class EditorAPIImp implements EditorAPI {
  constructor(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    onChanged?: OnGraphChanged
  ) {
    this.editor = editor;
    this.area = area;
    this.onChanged = onChanged;

    editor.addPipe((context) => {
      if (context.type === "noderemoved") {
        this.nodeToPreviewControl.delete(context.data.id);
      }
      if (
        context.type === "nodecreated" ||
        context.type === "noderemoved" ||
        context.type === "connectioncreated" ||
        context.type === "connectionremoved"
      ) {
        if (this.deserializing) {
          return context; // Skip during deserialization
        }
        this.scheduleGraphChange();
      }
      return context;
    });
  }

  async createNode(
    nodeType: NodeType,
    space: "screen" | "absolute",
    x?: number,
    y?: number,
    id?: string
  ): Promise<UICompilerNode> {
    const cb = () => {
      this.scheduleGraphChange();
    };
    const node = new UICompilerNode(nodeType, cb, this.compilationHelper);
    node.id = id || node.id; // Use provided ID or generate a new one

    if (node.previewControl) {
      this.nodeToPreviewControl.set(node.id, node.previewControl);
    }

    await this.editor.addNode(node);

    if (x !== undefined && y !== undefined) {
      // Convert screen coordinates to area coordinates
      const transform = this.area.area.transform;

      if (space === "screen") {
        x = (x - transform.x) / transform.k;
        y = (y - transform.y) / transform.k;
      }

      await this.area.translate(node.id, { x, y });
    }

    return node;
  }

  async deleteNode(nodeId: string) {
    const connectionsToRemove = this.editor
      .getConnections()
      .filter(
        (connection) =>
          connection.source === nodeId || connection.target === nodeId
      );

    // Remove all connections involving this node
    for (const connection of connectionsToRemove) {
      await this.editor.removeConnection(connection.id);
    }

    // Finally remove the node itself
    await this.editor.removeNode(nodeId);
  }

  async clear() {
    this.nodeToPreviewControl.clear();
    await this.editor.clear();
  }

  async loadGraph(graphJson: string): Promise<void> {
    this.deserializing = true; // Set the flag to skip onChanged during deserialization
    try {
      await this.clear();
      await loadGraph(graphJson, this, this.editor);
      AreaExtensions.zoomAt(this.area, this.editor.getNodes());
      this.scheduleGraphChange();
    } finally {
      this.deserializing = false; // Reset the flag after loading
    }
  }

  saveGraph() {
    return saveGraph(this.editor, this.area);
  }

  getNode(nodeId: string): UICompilerNode | undefined {
    const node = this.editor.getNode(nodeId);
    return node instanceof UICompilerNode ? node : undefined;
  }

  compileNode(nodeId?: string): string | undefined {
    return this.compilationHelper.compileNode(nodeId);
  }

  destroy() {
    this.area.destroy();
  }

  protected scheduleGraphChange() {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      if (!this.onChanged) return;
      this.compilationHelper.updateGraph(this.editor, this.area);
      this.onChanged(this);

      for (const [node, control] of this.nodeToPreviewControl) {
        control.shader = this.compilationHelper.compileNode(node);
        this.area.update("control", control.id);
      }
      this.timer = undefined;
    });
  }

  private nodeToPreviewControl = new Map<string, PreviewControl>();
  private editor: NodeEditor<Schemes>;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private deserializing = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private onChanged?: OnGraphChanged;
  private compilationHelper = new CompilationHelper();
}

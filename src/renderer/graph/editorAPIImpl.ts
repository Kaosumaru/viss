import type { NodeEditor } from "rete";
import type { EditorAPI } from "./interface";
import type { NodeType } from "@compiler/nodes/allNodes";
import { AreaPlugin } from "rete-area-plugin";
import type { OnGraphChanged } from "./editor";
import type { Schemes, AreaExtra } from "./node";
import { UICompilerNode } from "./nodes/compilerNode";
import type { PreviewControl } from "./nodes/controls/customPreviewControl";
import { CompilationHelper } from "./utils/compileGraph";
import type { FunctionDefinition } from "@glsl/function";
import type { AddedNodeInfo, GraphDiff } from "@graph/graph";
import type { Parameters } from "@graph/parameter";
import type { Connection } from "@graph/connection";
import { EditorKeybindings } from "./editorKeybindings";
import type { SelectableAPI } from "./extensions/selectable";
import type { Compiler } from "@compiler/compiler";

export class EditorAPIImp implements EditorAPI {
  constructor(
    compiler: Compiler,
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    selectable: SelectableAPI,
    onChanged?: OnGraphChanged
  ) {
    this.compilationHelper = new CompilationHelper(compiler);
    this.keybindings = new EditorKeybindings(this, area);
    this.editor = editor;
    this.area = area;
    this.selectable = selectable;
    this.onOutputChanged = onChanged;

    this.area.addPipe((context) => {
      if (this.deserializing) {
        return context;
      }
      if (context.type === "nodetranslated") {
        const { x, y } = context.data.position;
        this.compiler().translateNode(context.data.id, x, y);
      }
      return context;
    });

    editor.addPipe((context) => {
      if (this.deserializing) {
        return context;
      }
      if (context.type === "connectionremoved") {
        this.applyDiff(
          this.compiler().removeConnection(
            uiConnectionToConnection(context.data)
          )
        );
      }
      if (context.type === "connectioncreate") {
        context.data.id = generateUIConnectionId(context.data);
        const connection = uiConnectionToConnection(context.data);
        if (
          !this.compilationHelper
            .compiler()
            .canConnect(connection.from, connection.to)
        ) {
          return;
        }
      }
      if (context.type === "connectioncreated") {
        this.applyDiff(
          this.compiler().addConnection(uiConnectionToConnection(context.data))
        );
      }

      return context;
    });

    // TODO it's async
    this.applyDiff(this.compiler().getGraphAsDiff());
  }

  async createNode(
    nodeType: NodeType,
    space: "screen" | "absolute",
    x?: number,
    y?: number,
    params?: Parameters
  ) {
    if (x !== undefined && y !== undefined) {
      // Convert screen coordinates to area coordinates
      const transform = this.area.area.transform;

      if (space === "screen") {
        x = (x - transform.x) / transform.k;
        y = (y - transform.y) / transform.k;
      }
    }

    return this.applyDiff(
      this.compiler().addNode({
        nodeType,
        position: { x: x ?? 0, y: y ?? 0 },
        parameters: params ?? {},
      })
    );
  }

  async deleteNode(nodeId: string) {
    return this.applyDiff(this.compiler().removeNode(nodeId));
  }

  async deleteNodes(nodeIds: string[]) {
    if (nodeIds.length === 0) return;
    return this.applyDiff(this.compiler().removeNodes(nodeIds));
  }

  copyNodes(nodeIds: string[]): string {
    if (nodeIds.length === 0) return "";
    const graph = this.compiler().copyNodes(nodeIds);
    return JSON.stringify(graph);
  }

  async pasteNodes(
    json: string,
    space: "screen" | "absolute",
    offsetX: number,
    offsetY: number
  ): Promise<void> {
    if (!json) return;

    if (space === "screen") {
      const transform = this.area.area.transform;
      offsetX = (offsetX - transform.x) / transform.k;
      offsetY = (offsetY - transform.y) / transform.k;
    }
    const graph = JSON.parse(json);
    const diff = this.compiler().pasteNodes(graph, offsetX, offsetY);
    await this.applyDiff(diff);
    this.selectNodes(
      diff.addedNodes?.map((node) => node.node.identifier) || []
    );
  }

  async clear() {
    this.compiler().clearGraph();
    this.deserializing = true;
    await this.editor.clear();
    this.deserializing = false;
  }

  async loadGraph(graphJson: string): Promise<void> {
    await this.clear();
    return this.applyDiff(this.compiler().loadGraph(JSON.parse(graphJson)));
  }

  saveGraph() {
    return this.compiler().getGraph();
  }

  getNode(nodeId: string): UICompilerNode | undefined {
    const node = this.editor.getNode(nodeId);
    return node instanceof UICompilerNode ? node : undefined;
  }

  compileNode(nodeId?: string): string | undefined {
    return this.compilationHelper.compileNode(nodeId);
  }

  selectNodes(nodeIds: string[]) {
    // First, deselect all currently selected nodes

    const allNodes = this.editor.getNodes();
    for (const node of allNodes) {
      if (node.selected) {
        this.selectable.unselect(node.id);
      }
    }

    // Then select the specified nodes
    for (const nodeId of nodeIds) {
      const node = this.editor.getNode(nodeId);
      if (node) {
        this.selectable.select(nodeId, true);
      }
    }
  }

  destroy() {
    this.keybindings.destroy();
    this.area.destroy();
  }

  getCustomFunctions: () => FunctionDefinition[] = () => {
    return this.compilationHelper.getCustomFunctions();
  };

  getSelectedNodes(): string[] {
    // Get selected nodes from the editor
    const nodes = this.editor.getNodes();
    return nodes.filter((node) => node.selected).map((node) => node.id);
  }

  protected recompilePreviewNodes(nodes: Set<string>) {
    for (const nodeId of nodes) {
      const control = this.nodeToPreviewControl.get(nodeId);
      if (control) {
        control.shader = this.compilationHelper.compileNode(nodeId);
        this.area.update("control", control.id);
      }
    }
  }

  protected compiler() {
    return this.compilationHelper.compiler();
  }

  protected async applyDiff(diff: GraphDiff) {
    if (this.deserializing) {
      throw new Error("Cannot apply diff during deserialization");
    }

    try {
      this.deserializing = true;
      // todo operations on editor UI are asynchronous
      if (diff.removedConnections) {
        for (const connection of diff.removedConnections) {
          const id = getUIConnectionId(connection);
          if (!this.editor.getConnection(id)) {
            console.warn(`Connection ${id} not found in editor`);
            continue;
          }
          await this.editor.removeConnection(id);
        }
      }

      if (diff.addedNodes) {
        for (const node of diff.addedNodes) {
          await this.addNode(node);
        }
      }

      if (diff.removedNodes) {
        for (const node of diff.removedNodes) {
          this.nodeToPreviewControl.delete(node.identifier);
          await this.editor.removeNode(node.identifier);
        }
      }

      if (diff.addedConnections) {
        for (const connection of diff.addedConnections) {
          const id = getUIConnectionId(connection);
          const uiConnection = this.editor.getConnection(id);
          if (uiConnection) {
            uiConnection.type = connection.type;
            this.area.update("connection", uiConnection.id);
            continue;
          }
          await this.editor.addConnection(
            connectionToUIConnection(id, connection)
          );
        }
      }

      if (diff.invalidatedNodeIds) {
        this.recompilePreviewNodes(diff.invalidatedNodeIds);
        this.updateInputsOutputs(diff.invalidatedNodeIds);
        // TODO this should be only fired on output change
        this.reportChange();
      }
    } finally {
      this.deserializing = false;
    }
  }

  updateInputsOutputs(invalidatedNodeIds: Set<string>) {
    const infos = this.compiler().getInfo(Array.from(invalidatedNodeIds));
    for (const info of infos) {
      const node = this.getNode(info.node.identifier);
      if (!node) continue;
      node.updateNode(info.instanceInfo);
      this.area.update("node", node.id);
    }
  }

  protected reportChange() {
    try {
      if (this.onOutputChanged) {
        this.onOutputChanged(this);
      }
    } catch (e) {
      console.error("Error during onOutputChanged callback", e);
    }
  }

  protected async addNode(item: AddedNodeInfo) {
    const graphNode = item.node;
    const node = new UICompilerNode(
      graphNode.nodeType as NodeType,
      (id, paramName, value) => {
        this.applyDiff(this.compiler().updateParameter(id, paramName, value));
      },
      this.compilationHelper
    );
    node.updateNode(item.instanceInfo);
    node.updateControls(graphNode.parameters);

    node.id = graphNode.identifier;

    if (node.previewControl) {
      this.nodeToPreviewControl.set(node.id, node.previewControl);
    }

    await this.editor.addNode(node);
    await this.area.translate(node.id, {
      x: graphNode.position.x,
      y: graphNode.position.y,
    });
  }

  private nodeToPreviewControl = new Map<string, PreviewControl>();
  private editor: NodeEditor<Schemes>;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private onOutputChanged?: OnGraphChanged;
  private compilationHelper: CompilationHelper;
  private deserializing = false;
  private keybindings: EditorKeybindings;
  private selectable: SelectableAPI;
}

function uiConnectionToConnection(
  connection: Schemes["Connection"]
): Connection {
  return {
    from: {
      nodeId: connection.source,
      socketId: connection.sourceOutput,
    },
    to: {
      nodeId: connection.target,
      socketId: connection.targetInput,
    },
  };
}

function connectionToUIConnection(
  id: string,
  connection: Connection
): Schemes["Connection"] {
  return {
    id,
    source: connection.from.nodeId,
    sourceOutput: connection.from.socketId,
    target: connection.to.nodeId,
    targetInput: connection.to.socketId,
    type: connection.type,
  };
}

function getUIConnectionId(connection: Connection): string {
  return `${connection.from.nodeId}-${connection.from.socketId}->${connection.to.nodeId}-${connection.to.socketId}`;
}

function generateUIConnectionId(connection: Schemes["Connection"]): string {
  return `${connection.source}-${connection.sourceOutput}->${connection.target}-${connection.targetInput}`;
}

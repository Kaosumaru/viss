import type { NodeEditor } from "rete";
import type { EditorAPI } from "./interface";
import type { NodeType } from "@compiler/nodes/allNodes";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import type { OnGraphChanged } from "./editor";
import type { Schemes, AreaExtra } from "./node";
import { UICompilerNode } from "./nodes/compilerNode";
import { CompilationHelper } from "./utils/compileGraph";
import type { FunctionDefinition } from "@glsl/function";
import type { AddedNodeInfo, Graph, GraphDiff } from "@graph/graph";
import type { Parameters, ParameterValue } from "@graph/parameter";
import type { Connection } from "@graph/connection";
import { EditorKeybindings } from "./editorKeybindings";
import type { SelectableAPI } from "./extensions/selectable";
import type { Compiler } from "@compiler/compiler";
import { EditorVSExtension } from "./editorVSExtension";
import type { Uniform, Uniforms } from "@graph/uniform";
import type { ShaderEntryContextType } from "@renderer/components/shaderOverlay/ShaderEntryContext";

export class EditorAPIImp implements EditorAPI {
  constructor(
    compiler: Compiler,
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    selectable: SelectableAPI,
    overlayContext: ShaderEntryContextType,
    onChanged?: OnGraphChanged
  ) {
    this.overlayContext = overlayContext;
    this.compilationHelper = new CompilationHelper(compiler);
    this.keybindings = new EditorKeybindings(this, area);
    this.extension = new EditorVSExtension(this, area);
    this.editor = editor;
    this.area = area;
    this.selectable = selectable;
    this.onOutputChanged = onChanged;

    this.area.addPipe((context) => {
      if (this.deserializing) {
        return context;
      }
      if (context.type === "nodedragged") {
        const nodeView = this.area.nodeViews.get(context.data.id);
        if (!nodeView) return context;

        this.applyDiff(
          this.compiler().translateNode(
            context.data.id,
            nodeView.position.x,
            nodeView.position.y
          )
        );
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

    this.extension.initialize();
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

  uniforms: () => Uniforms = (): Uniforms => {
    return this.compiler().getGraph().uniforms;
  };

  updateUniform: (uniform: Uniform) => Promise<void> = (uniform: Uniform) => {
    this.overlayContext.updateUniform(uniform);
    return this.applyDiff(this.compiler().updateUniform(uniform));
  };

  updateUniformDefaultValue(name: string, defaultValue: ParameterValue) {
    const diff = this.applyDiff(
      this.compiler().updateUniformDefaultValue(name, defaultValue)
    );

    const uniform = this.compiler().getGraph().uniforms[name];
    if (uniform) {
      this.overlayContext.updateUniform(uniform);
    }

    return diff;
  }

  removeUniform: (uniformId: string) => Promise<void> = (uniformId: string) => {
    return this.applyDiff(this.compiler().removeUniform(uniformId));
  };

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
    this.extension.saveGraph(this.compiler().getGraph());
  }

  async loadGraphJSON(graphJson: string): Promise<void> {
    if (graphJson.trim() === "") {
      return this.clear();
    }
    return this.loadGraph(JSON.parse(graphJson));
  }

  async loadGraph(graph: Graph): Promise<void> {
    const noNodes = this.editor.getNodes().length === 0;
    await this.applyDiff(this.compiler().loadGraph(graph), true);
    if (noNodes) {
      AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    }
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
    this.extension.destroy();
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
      this.refreshShader(nodeId);
    }
  }

  protected refreshShader(nodeId: string) {
    const node = this.getNode(nodeId);
    if (node?.previewControl) {
      node.previewControl.shader = this.compileNode(nodeId);
      this.area.update("control", node.previewControl.id);
    }
  }

  protected compiler() {
    return this.compilationHelper.compiler();
  }

  protected async applyDiff(diff: GraphDiff, updateProperties = false) {
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

      if (diff.removedNodes) {
        for (const node of diff.removedNodes) {
          await this.editor.removeNode(node.identifier);
        }
      }

      if (diff.addedNodes) {
        for (const node of diff.addedNodes) {
          await this.addNode(node);
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

      if (diff.nodesWithModifiedProperties) {
        for (const node of diff.nodesWithModifiedProperties) {
          const uiNode = this.getNode(node.identifier);
          if (uiNode) {
            uiNode.updateControls(node.parameters);
            if (updateProperties) {
              await this.area.translate(node.identifier, {
                x: node.position.x,
                y: node.position.y,
              });

              this.area.update("node", uiNode.id);
            }
          } else {
            console.warn(`Node ${node.identifier} not found in editor`);
          }
        }
      }

      if (diff.invalidatedNodeIds) {
        this.recompilePreviewNodes(diff.invalidatedNodeIds);
        this.updateInputsOutputs(diff.invalidatedNodeIds);
        // TODO this should be only fired on output change
        this.reportChange();
      }

      const updatedJson =
        (diff.addedNodes?.length ?? 0) +
        (diff.removedNodes?.length ?? 0) +
        (diff.addedConnections?.length ?? 0) +
        (diff.removedConnections?.length ?? 0) +
        (diff.nodesWithModifiedProperties?.length ?? 0) +
        (diff.translatedNodes?.size ?? 0);

      if (updatedJson > 0) {
        this.extension.saveGraph(this.compiler().getGraph(), diff);
      }
    } finally {
      this.deserializing = false;
    }
  }

  protected updateInputsOutputs(invalidatedNodeIds: Set<string>) {
    const infos = this.compiler().getInfo(Array.from(invalidatedNodeIds));
    for (const info of infos) {
      const node = this.getNode(info.node.identifier);
      if (!node) continue;
      node.updateNode(info.instanceInfo, () => this.compileNode(node.id));
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
    node.id = graphNode.identifier;

    node.updateNode(item.instanceInfo, () => this.compileNode(node.id));
    node.updateControls(graphNode.parameters);

    await this.editor.addNode(node);
    await this.area.translate(node.id, {
      x: graphNode.position.x,
      y: graphNode.position.y,
    });
  }
  private editor: NodeEditor<Schemes>;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private onOutputChanged?: OnGraphChanged;
  private compilationHelper: CompilationHelper;
  private deserializing = false;
  private extension: EditorVSExtension;
  private keybindings: EditorKeybindings;
  private selectable: SelectableAPI;
  private overlayContext: ShaderEntryContextType;
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

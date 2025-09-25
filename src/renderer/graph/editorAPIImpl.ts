import type { NodeEditor } from "rete";
import type { EditorAPI, IUniformCallback } from "./interface";
import type { NodeType } from "@compiler/nodes/allNodes";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import type { OnGraphChanged } from "./editor";
import type { Schemes, AreaExtra } from "./node";
import { UICompilerNode } from "./nodes/compilerNode";
import type { FunctionDefinition } from "@glsl/function";
import type { AddedNodeInfo, Graph, GraphDiff } from "@graph/graph";
import type { Parameters, ParameterValue } from "@graph/parameter";
import type { Connection } from "@graph/connection";
import { EditorKeybindings } from "./editorKeybindings";
import type { SelectableAPI } from "./extensions/selectable";
import { Compiler, type CompilationOptions } from "@compiler/compiler";
import { EditorVSExtension } from "./editorVSExtension";
import type { Uniform, Uniforms } from "@graph/uniform";
import { compileNode } from "./utils/compileNode";
import { selectInclude as selectIncludeFile } from "@renderer/vscode/selectIncludeFile";

export class EditorAPIImp implements EditorAPI {
  constructor(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    selectable: SelectableAPI,
    onChanged?: OnGraphChanged
  ) {
    this.extension = new EditorVSExtension(this, area);
    this.keybindings = new EditorKeybindings(this, area);
    const options: CompilationOptions = {
      includeResolver: (includePaths: string[]) => {
        return this.extension.getFileContents(includePaths);
      },
    };
    this.compiler = new Compiler(options);

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

        void this.applyDiff(
          this.compiler.translateNode(
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
        void this.applyDiff(
          this.compiler.removeConnection(uiConnectionToConnection(context.data))
        );
      }
      if (context.type === "connectioncreate") {
        context.data.id = generateUIConnectionId(context.data);
        const connection = uiConnectionToConnection(context.data);
        if (!this.compiler.canConnect(connection.from, connection.to)) {
          return;
        }
      }
      if (context.type === "connectioncreated") {
        void this.applyDiff(
          this.compiler.addConnection(uiConnectionToConnection(context.data))
        );
      }

      return context;
    });

    // TODO it's async
    void this.applyDiff(this.compiler.getGraphAsDiff());

    void this.extension.initialize();
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
      this.compiler.addNode({
        nodeType,
        position: { x: x ?? 0, y: y ?? 0 },
        parameters: params ?? {},
      })
    );
  }

  addUniformCallback: (callback: IUniformCallback) => () => void = (
    callback: IUniformCallback
  ) => {
    this.uniformCallbacks.push(callback);

    for (const uniform of Object.values(this.uniforms())) {
      callback.updateUniform(uniform);
    }
    return () => {
      this.uniformCallbacks = this.uniformCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  };

  uniforms: () => Uniforms = (): Uniforms => {
    return this.compiler.getGraph().uniforms;
  };

  updateUniform: (uniform: Uniform) => Promise<void> = (uniform: Uniform) => {
    this.informAboutUniform(uniform);
    return this.applyDiff(this.compiler.updateUniform(uniform));
  };

  updateUniformDefaultValue(name: string, defaultValue: ParameterValue) {
    const diff = this.applyDiff(
      this.compiler.updateUniformDefaultValue(name, defaultValue)
    );

    const uniform = this.compiler.getGraph().uniforms[name];
    if (uniform) {
      this.informAboutUniform(uniform);
    }

    return diff;
  }

  removeUniform: (uniformId: string) => Promise<void> = (uniformId: string) => {
    return this.applyDiff(this.compiler.removeUniform(uniformId));
  };

  async deleteNode(nodeId: string) {
    return this.applyDiff(this.compiler.removeNode(nodeId));
  }

  async deleteNodeFromContextMenu(nodeId: string) {
    return this.applyDiff(this.compiler.removeNode(nodeId));
  }

  isNodeSelected(nodeId: string) {
    const selectedNodes = this.getSelectedNodes();
    return selectedNodes.includes(nodeId);
  }

  async deleteNodes(nodeIds: string[]) {
    if (nodeIds.length === 0) return;
    return this.applyDiff(this.compiler.removeNodes(nodeIds));
  }

  copyNodes(nodeIds: string[]): string {
    if (nodeIds.length === 0) return "";
    const graph = this.compiler.copyNodes(nodeIds);
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
    // TODO accept invalid files
    const graph = JSON.parse(json) as Graph;
    const diff = this.compiler.pasteNodes(graph, offsetX, offsetY);
    await this.applyDiff(diff);
    this.selectNodes(
      diff.addedNodes?.map((node) => node.node.identifier) || []
    );
  }

  async clear() {
    this.compiler.clearGraph();
    this.deserializing = true;
    await this.editor.clear();
    this.deserializing = false;
    this.extension.saveGraph(this.compiler.getGraph());
  }

  async loadGraphJSON(graphJson: string): Promise<void> {
    if (graphJson.trim() === "") {
      return this.clear();
    }
    return this.loadGraph(JSON.parse(graphJson) as Graph);
  }

  async loadGraph(graph: Graph): Promise<void> {
    const noNodes = this.editor.getNodes().length === 0;
    const diff = await this.compiler.loadGraph(graph);
    await this.applyDiff(diff, true);
    if (noNodes) {
      void AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    }
  }

  saveGraph() {
    return this.compiler.getGraph();
  }

  getNode(nodeId: string): UICompilerNode | undefined {
    const node = this.editor.getNode(nodeId);
    return node instanceof UICompilerNode ? node : undefined;
  }

  compileNode(nodeId?: string): string | undefined {
    return compileNode(this.compiler, nodeId);
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
    return this.compiler.getCustomFunctions();
  };

  getSelectedNodes(): string[] {
    // Get selected nodes from the editor
    const nodes = this.editor.getNodes();
    return nodes.filter((node) => node.selected).map((node) => node.id);
  }

  async addIncludeFromFile(): Promise<void> {
    const path = await selectIncludeFile();
    if (path) {
      return this.applyDiff(await this.compiler.addInclude(path));
    }
  }

  async addInclude(include: string): Promise<void> {
    return this.applyDiff(await this.compiler.addInclude(include));
  }

  removeInclude(include: string): Promise<void> {
    return this.applyDiff(this.compiler.removeInclude(include));
  }

  includes(): string[] {
    return this.compiler.includes();
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
      void this.area.update("control", node.previewControl.id);
    }
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

      if (diff.updatedUniforms) {
        for (const uniform of Object.values(diff.updatedUniforms)) {
          this.informAboutUniform(uniform);
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
            void this.area.update("connection", uiConnection.id);
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

              void this.area.update("node", uiNode.id);
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

      if (diff.warnings) {
        for (const warning of diff.warnings) {
          console.warn("Graph warning:", warning);
        }
      }

      const updatedJson =
        (diff.addedNodes?.length ?? 0) +
        (diff.removedNodes?.length ?? 0) +
        (diff.addedConnections?.length ?? 0) +
        (diff.removedConnections?.length ?? 0) +
        (diff.nodesWithModifiedProperties?.length ?? 0) +
        (diff.translatedNodes?.size ?? 0);

      if (updatedJson > 0) {
        this.extension.saveGraph(this.compiler.getGraph(), diff);
      }
    } finally {
      this.deserializing = false;
    }
  }

  protected updateInputsOutputs(invalidatedNodeIds: Set<string>) {
    const infos = this.compiler.getInfo(Array.from(invalidatedNodeIds));
    for (const info of infos) {
      const node = this.getNode(info.node.identifier);
      if (!node) continue;
      node.updateNode(info.instanceInfo, () => this.compileNode(node.id));
      void this.area.update("node", node.id);
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
        void this.applyDiff(
          this.compiler.updateParameter(id, paramName, value)
        );
      }
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

  protected informAboutUniform(uniform: Uniform) {
    this.uniformCallbacks.forEach((callback) => {
      callback.updateUniform(uniform);
    });
  }

  private editor: NodeEditor<Schemes>;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private onOutputChanged?: OnGraphChanged;
  private deserializing = false;
  private extension: EditorVSExtension;
  private keybindings: EditorKeybindings;
  private selectable: SelectableAPI;
  private uniformCallbacks: IUniformCallback[] = [];
  private compiler: Compiler;
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

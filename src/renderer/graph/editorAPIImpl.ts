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
import type { Connection } from "@graph/connection";

export class EditorAPIImp implements EditorAPI {
  constructor(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    onChanged?: OnGraphChanged
  ) {
    this.editor = editor;
    this.area = area;
    this.onOutputChanged = onChanged;

    editor.addPipe((context) => {
      if (context.type === "connectionremoved") {
        this.applyDiff(
          this.compiler().removeConnection(
            uiConnectionToConnection(context.data)
          )
        );
      }
      if (context.type === "connectioncreated") {
        this.applyDiff(
          this.compiler().addConnection(uiConnectionToConnection(context.data))
        );
      }
      return context;
    });
  }

  async createNode(
    nodeType: NodeType,
    space: "screen" | "absolute",
    x?: number,
    y?: number
  ) {
    if (x !== undefined && y !== undefined) {
      // Convert screen coordinates to area coordinates
      const transform = this.area.area.transform;

      if (space === "screen") {
        x = (x - transform.x) / transform.k;
        y = (y - transform.y) / transform.k;
      }
    }

    this.applyDiff(
      this.compiler().addNode({
        nodeType,
        position: { x: x ?? 0, y: y ?? 0 },
        inputs: {},
        outputs: {},
        parameters: {},
      })
    );
  }

  async deleteNode(nodeId: string) {
    this.applyDiff(this.compiler().removeNode(nodeId));
  }

  async clear() {
    this.compiler().clearGraph();
    await this.editor.clear();
  }

  async loadGraph(_graphJson: string): Promise<void> {
    await this.clear();
    this.applyDiff(this.compiler().loadGraph(JSON.parse(_graphJson)));
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

  destroy() {
    this.area.destroy();
  }

  getCustomFunctions: () => FunctionDefinition[] = () => {
    return this.compilationHelper.getCustomFunctions();
  };

  protected recompilePreviewNodes(nodes: string[]) {
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

  protected applyDiff(diff: GraphDiff) {
    // todo operations on editor UI are asynchronous
    if (diff.invalidatedNodeIds) {
      this.recompilePreviewNodes(Array.from(diff.invalidatedNodeIds));
      // TODO this should be only fired on output change
      if (this.onOutputChanged) {
        this.onOutputChanged(this);
      }
    }

    if (diff.addedNodes) {
      for (const node of diff.addedNodes) {
        this.addNode(node);
      }
    }

    if (diff.removedNodes) {
      for (const node of diff.removedNodes) {
        this.nodeToPreviewControl.delete(node.identifier);
        this.editor.removeNode(node.identifier);
      }
    }

    if (diff.addedConnections) {
      for (const connection of diff.addedConnections) {
        const id = getUIConnectionId(connection);
        if (this.editor.getConnection(id)) {
          continue; // already exists
        }
        this.editor.addConnection(connectionToUIConnection(id, connection));
      }
    }

    if (diff.removedConnections) {
      for (const connection of diff.removedConnections) {
        const c = this.editor
          .getConnections()
          .find(
            (c) =>
              c.source === connection.from.nodeId &&
              c.sourceOutput === connection.from.socketId &&
              c.target === connection.to.nodeId &&
              c.targetInput === connection.to.socketId
          );
        if (c) {
          this.editor.removeConnection(c.id);
        }
      }
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
  private compilationHelper = new CompilationHelper();
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
  };
}

function getUIConnectionId(
  connection: Connection
): string {
  return `${connection.from.nodeId}-${connection.from.socketId}-${connection.to.nodeId}-${connection.to.socketId}`;
}
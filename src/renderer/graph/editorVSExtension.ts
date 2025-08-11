import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";
import type {
  EditorToExtensionMessage,
  ExtensionToEditorMessage,
} from "../../../vscode-extension/src/messages";
import { DisposeHelper } from "./utils/disposeHelper";
import type { Graph, GraphDiff } from "@graph/graph";

export class EditorVSExtension {
  constructor(editor: EditorAPI, _area: AreaPlugin<Schemes, AreaExtra>) {
    this.helper.add(() => {
      const cb = (event: MessageEvent) => {
        this.handleWindowMessage(event);
      };
      window.addEventListener("message", cb);
      return () => {
        window.removeEventListener("message", cb);
      };
    });

    this.editor = editor;

    if (typeof acquireVsCodeApi === "function") {
      this.vscode = acquireVsCodeApi();
      console.log("Running in VS Code webview context");
    } else {
      this.vscode = undefined;
    }
  }

  public initialize() {
    const state = this.vscode?.getState();

    if (state) {
      this.loadGraph(state as Graph);
    } else {
      this.postMessage({
        type: "refreshContent",
      });
    }
  }

  public destroy() {
    this.helper.dispose();
  }

  public saveGraph(graph: Graph, _diff?: GraphDiff) {
    if (this.vscode === undefined || this.deserializing) {
      return;
    }
    this.postMessage({
      type: "saveGraph",
      json: graph,
      requestId: this.loadRequestId,
    });
  }

  private handleWindowMessage(event: MessageEvent) {
    console.log("Received message from webview:", event.data);
    const message = event.data as ExtensionToEditorMessage;
    this.handleMessage(message);
  }

  private async handleMessage(message: ExtensionToEditorMessage) {
    switch (message.type) {
      case "loadGraph":
        this.loadRequestId = message.requestId;
        try {
          await this.loadGraph(message.json as Graph);
        } finally {
          this.loadRequestId = undefined;
        }
        break;
      case "exportGraphRequest":
        this.postMessage({
          type: "exportGraphResponse",
          path: message.path,
          content: this.editor.compileNode(),
        });
        break;
    }
    console.warn("Unknown message type:", message.type);
  }

  private async loadGraph(json: Graph) {
    if (this.deserializing) {
      console.warn("Already deserializing, ignoring loadGraph message");
      return;
    }
    this.deserializing = true;
    try {
      await this.editor.loadGraph(json as Graph);
      this.vscode?.setState(json);
    } finally {
      this.deserializing = false;
    }
  }

  private postMessage(message: EditorToExtensionMessage) {
    this.vscode?.postMessage(message);
  }

  private deserializing = false;
  private loadRequestId?: number;
  private helper = new DisposeHelper();
  private editor: EditorAPI;
  private vscode: VSCode | undefined;
}

// Declare acquireVsCodeApi as a global function provided by VS Code webview
declare function acquireVsCodeApi(): VSCode;

type VSCode = {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

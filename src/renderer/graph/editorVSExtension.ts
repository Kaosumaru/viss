import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";
import type {
  EditorToExtensionMessage,
  ExtensionToEditorMessage,
} from "../../../vscode-extension/src/messages";
import { DisposeHelper } from "./utils/disposeHelper";
import type { Graph, GraphDiff } from "@graph/graph";
import type { Transform } from "rete-area-plugin/_types/area";

export class EditorVSExtension {
  constructor(editor: EditorAPI, area: AreaPlugin<Schemes, AreaExtra>) {
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
    this.area = area;

    if (typeof acquireVsCodeApi === "function") {
      this.vscode = acquireVsCodeApi();
      console.log("Running in VS Code webview context");
    } else {
      this.vscode = undefined;
    }
  }

  public async initialize() {
    const state = this.vscode?.getState() as State;

    if (state) {
      await this.loadGraph(state.graph);
      this.area.area.transform = state.areaTransform;
    } else {
      this.postMessage({
        type: "refreshContent",
      });
    }
  }

  public destroy() {
    const state: State = {
      graph: this.editor.saveGraph(),
      areaTransform: this.area.area.transform,
    };
    this.vscode?.setState(state);
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
  private area: AreaPlugin<Schemes, AreaExtra>;
  private vscode: VSCode | undefined;
}

// Declare acquireVsCodeApi as a global function provided by VS Code webview
declare function acquireVsCodeApi(): VSCode;

type VSCode = {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

interface State {
  graph: Graph;
  areaTransform: Transform;
}

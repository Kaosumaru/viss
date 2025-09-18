import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";
import type {
  EditorToExtensionMessage,
  ExtensionToEditorMessage,
  ShowOpenDialogRequestMessage,
  ShowOpenDialogResponseMessage,
  ToWebviewURIMessage,
  ToWebviewURIResponseMessage,
} from "../../../vscode-extension/src/messages";
import { DisposeHelper } from "./utils/disposeHelper";
import type { Graph, GraphDiff } from "@graph/graph";
import type { Transform } from "rete-area-plugin/_types/area";
import { AsyncRequestRouter } from "./utils/asyncRequestRouter";
import { AsyncRequestManager } from "./utils/asyncRequestManager";
import imgUrl from "./data/test.png";

export class EditorVSExtension {
  constructor(editor: EditorAPI, area: AreaPlugin<Schemes, AreaExtra>) {
    this.showOpenDialog = this.router.registerManager<
      ShowOpenDialogRequestMessage,
      ShowOpenDialogResponseMessage
    >("showOpenDialog", "showOpenDialogResponse", AsyncRequestManager);

    this.toWebviewURI = this.router.registerManager<
      ToWebviewURIMessage,
      ToWebviewURIResponseMessage
    >("toWebviewURI", "toWebviewURIResponse", AsyncRequestManager);

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

    if (this.vscode) {
      this.area.addPipe((context) => {
        if (context.type === "zoomed" || context.type === "translated") {
          this.saveState();
        }
        return context;
      });
    }
  }

  async selectImage(): Promise<string | undefined> {
    if (!this.vscode) {
      return imgUrl;
    }

    const response = await this.showOpenDialog({
      label: "Select Image",
      filters: { images: ["png", "jpg", "jpeg"] },
    });

    if (response) {
      console.log("Selected file URI:", response.relativePaths[0]);
      return response.relativePaths[0];
    }

    return undefined;
  }

  async relativePathToURL(path: string): Promise<string | undefined> {
    if (!this.vscode) {
      return imgUrl;
    }
    const response = await this.toWebviewURI({
      relativepaths: [path],
    });
    return response?.uris[0];
  }

  public destroy() {
    this.saveState();
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

  private saveState() {
    const state: State = {
      graph: this.editor.saveGraph(),
      areaTransform: this.area.area.transform,
    };
    this.vscode?.setState(state);
  }

  private handleWindowMessage(event: MessageEvent) {
    console.log("Received message from webview:", event.data);
    const message = event.data as ExtensionToEditorMessage;
    this.handleMessage(message);
  }

  private async handleMessage(message: ExtensionToEditorMessage) {
    if ("requestId" in message && message.requestId !== undefined) {
      if (this.router.handleResponse(message)) {
        return;
      }
    }

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

  public readonly showOpenDialog: (
    req: ShowOpenDialogRequestMessage["params"]
  ) => Promise<ShowOpenDialogResponseMessage["params"]>;

  public readonly toWebviewURI: (
    req: ToWebviewURIMessage["params"]
  ) => Promise<ToWebviewURIResponseMessage["params"]>;

  private router = new AsyncRequestRouter<EditorToExtensionMessage>((req) =>
    this.postMessage(req)
  );
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

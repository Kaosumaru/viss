import type { EditorAPI } from "./interface";
import { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes } from "./node";
import type {
  ExportGraphRequestMessage,
  LoadGraphMessage,
} from "../../../vscode-extension/src/messages/messages";
import type { Graph } from "@graph/graph";
import type { Transform } from "rete-area-plugin/_types/area";
import { vscode } from "@renderer/vscode/vscodeManager";
import { DisposeHelper } from "./utils/disposeHelper";
import { FrameEmitter } from "./utils/frameEmitter";

export class EditorVSExtension {
  constructor(editor: EditorAPI, area: AreaPlugin<Schemes, AreaExtra>) {
    this.editor = editor;
    this.area = area;

    this.helper.addDispose(
      vscode.addMessageListener<LoadGraphMessage>("loadGraph", (message) => {
        void this.onLoadGraphRequest(message);
      })
    );

    this.helper.addDispose(
      vscode.addMessageListener<ExportGraphRequestMessage>(
        "exportGraphRequest",
        (message) => {
          this.onExportGraphRequest(message);
        }
      )
    );

    this.helper.addDispose(
      vscode.addMessageListener("dispose", () => {
        this.saveGraph(true);
        this.saveState();
      })
    );
  }

  public async initialize() {
    const state = vscode.getState() as State | undefined;

    if (state) {
      await this.loadGraph(state.graph);
      this.area.area.transform = state.areaTransform;
    } else {
      vscode.postMessage({
        type: "refreshContent",
      });
    }

    // TODO we should get a dispose message from the extension host
    // but it seems that this is still needed - maybe transform is invalid?
    if (vscode.isAvailable) {
      this.area.addPipe((context) => {
        if (context.type === "zoomed" || context.type === "translated") {
          this.saveState();
        }
        return context;
      });
    } else {
      window.addEventListener("beforeunload", () => {
        this.saveState();
      });
    }
  }

  public destroy() {
    this.saveState();
  }

  public async getFileContents(paths: string[]): Promise<(string | null)[]> {
    if (!vscode.isAvailable) {
      return paths.map(() => null);
    }

    const response = await vscode.openFiles({
      relativePaths: paths,
    });

    return response.contents;
  }

  public saveGraph(immediate = false) {
    if (!vscode.isAvailable || this.deserializing) {
      return;
    }
    if (immediate) {
      this.saveEmitter.cancel();
      this.internalSaveGraph();
      return;
    }
    this.saveEmitter.emit();
  }

  internalSaveGraph() {
    if (!vscode.isAvailable || this.deserializing) {
      return;
    }

    vscode.postMessage({
      type: "saveGraph",
      json: this.editor.saveGraph(),
      requestId: this.loadRequestId,
    });
  }

  private saveState() {
    const state: State = {
      graph: this.editor.saveGraph(),
      areaTransform: this.area.area.transform,
    };
    vscode.setState(state);
  }

  private async loadGraph(json: Graph) {
    if (this.deserializing) {
      console.warn("Already deserializing, ignoring loadGraph message");
      return;
    }
    this.saveEmitter.cancel();
    this.deserializing = true;
    try {
      await this.editor.loadGraph(json);
    } finally {
      this.deserializing = false;
    }
  }

  private async onLoadGraphRequest(message: LoadGraphMessage): Promise<void> {
    this.loadRequestId = message.requestId;
    try {
      await this.loadGraph(message.json as Graph);
    } finally {
      this.loadRequestId = undefined;
    }
  }

  private onExportGraphRequest(message: ExportGraphRequestMessage) {
    vscode.postMessage({
      type: "exportGraphResponse",
      path: message.path,
      content: this.editor.compileNode(),
    });
  }

  private deserializing = false;
  private loadRequestId?: number;
  private helper = new DisposeHelper();
  private editor: EditorAPI;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private saveEmitter = new FrameEmitter(() => {
    this.internalSaveGraph();
  }, 10);
}

interface State {
  graph: Graph;
  areaTransform: Transform;
}

import type {
  EditorToExtensionMessage,
  ExtensionToEditorMessage,
  ShowOpenFileDialogRequest,
  ShowOpenFileDialogResponse,
  ShowOpenFolderDialogRequest,
  ShowOpenFolderDialogResponse,
  ToWebviewURIRequest,
  ToWebviewURIResponse,
} from "../../../vscode-extension/src/messages/messages";
import { AsyncRequestManager } from "./asyncRequestManager";
import { AsyncRequestRouter } from "./asyncRequestRouter";
import imgUrl from "./data/test.png";

class VSCodeManager {
  constructor() {
    if (this.isAvailable) {
      this.vscode = acquireVsCodeApi();
      console.log("Running in VS Code webview context");
    } else {
      this.vscode = undefined;
    }

    const cb = (event: MessageEvent) => {
      this.handleWindowMessage(event);
    };
    window.addEventListener("message", cb);

    this.showOpenFileDialog = this.router.registerManager<
      ShowOpenFileDialogRequest,
      ShowOpenFileDialogResponse
    >("showOpenFileDialog", "showOpenFileDialogResponse", AsyncRequestManager);

    this.showOpenFolderDialog = this.router.registerManager<
      ShowOpenFolderDialogRequest,
      ShowOpenFolderDialogResponse
    >(
      "showOpenFolderDialog",
      "showOpenFolderDialogResponse",
      AsyncRequestManager
    );

    this.toWebviewURI = this.router.registerManager<
      ToWebviewURIRequest,
      ToWebviewURIResponse
    >("toWebviewURI", "toWebviewURIResponse", AsyncRequestManager);
  }

  public readonly isAvailable = typeof acquireVsCodeApi === "function";

  async relativePathToURL(path: string): Promise<string | undefined> {
    if (!this.isAvailable) {
      return imgUrl;
    }
    const response = await this.toWebviewURI({
      relativepaths: [path],
    });
    return response.uris[0];
  }

  setState(state: unknown) {
    this.vscode?.setState(state);
  }

  getState(): unknown {
    return this.vscode?.getState();
  }

  public postMessage(message: EditorToExtensionMessage) {
    this.vscode?.postMessage(message);
  }

  public addMessageListener<T extends ExtensionToEditorMessage>(
    type: T["type"],
    listener: (message: T) => void
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    (this.listeners[type] as Array<(message: T) => void>).push(listener);

    return () => {
      const arr = this.listeners[type];
      if (arr) {
        this.listeners[type] = arr.filter((i) => i !== listener);
      }
    };
  }

  private handleWindowMessage(event: MessageEvent) {
    console.log("Received message from webview:", event.data);
    const message = event.data as ExtensionToEditorMessage;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message.type === undefined) {
      return;
    }

    if ("requestId" in message && message.requestId !== undefined) {
      if (this.router.handleResponse(message)) {
        return;
      }
    }

    const listeners = this.listeners[message.type];
    if (listeners) {
      listeners.forEach((listener) => {
        listener(message);
      });
    } else {
      console.warn("No listeners for message type:", message.type);
    }
  }

  private vscode: VSCode | undefined;

  public readonly showOpenFileDialog: (
    req: ShowOpenFileDialogRequest["params"]
  ) => Promise<ShowOpenFileDialogResponse["params"]>;

  public readonly showOpenFolderDialog: (
    req: ShowOpenFolderDialogRequest["params"]
  ) => Promise<ShowOpenFolderDialogResponse["params"]>;

  public readonly toWebviewURI: (
    req: ToWebviewURIRequest["params"]
  ) => Promise<ToWebviewURIResponse["params"]>;

  private router = new AsyncRequestRouter<EditorToExtensionMessage>((req) => {
    this.postMessage(req);
  });

  private listeners: {
    [K in ExtensionToEditorMessage["type"]]?: Array<(message: unknown) => void>;
  } = {};
}

export const vscode = new VSCodeManager();

// Declare acquireVsCodeApi as a global function provided by VS Code webview
declare function acquireVsCodeApi(): VSCode;

export type VSCode = {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

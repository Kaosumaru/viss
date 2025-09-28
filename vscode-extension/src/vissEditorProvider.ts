import * as vscode from "vscode";
import { getDocumentAsJson } from "./utils/utils";
import {
  EditorToExtensionMessage,
  SaveGraphMessage,
} from "./messages/messages";
import { postMessage } from "./utils/utils";
import { generateHTML } from "./utils/generateHTML";
import { handleMessage } from "./messageHandler";

export class VissEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new VissEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      VissEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = "viss.graphEditor";

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          if (this.ignoreNextUpdate) {
            this.ignoreNextUpdate = false;
            return;
          }
          this.requestIdCounter++;
          updateWebview(document, webviewPanel, this.requestIdCounter);
        }
      }
    );

    // Listen for document save events to write GLSL file
    const saveDocumentSubscription = vscode.workspace.onDidSaveTextDocument(
      async (savedDocument) => {
        if (savedDocument.uri.toString() === document.uri.toString()) {
          postMessage(webviewPanel, {
            type: "exportGraphRequest",
            path: document.uri.fsPath + ".glsl",
          });
        }
      }
    );

    // Make sure we get rid of the listeners when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      saveDocumentSubscription.dispose();

      // this won't work because the webview is already disposed
      // postMessage(webviewPanel, { type: "dispose" });
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) =>
      this.handleMessage(document, webviewPanel, e)
    );

    this.requestIdCounter++;
    updateWebview(document, webviewPanel, this.requestIdCounter);
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview) {
    // Local path to assets
    const assetsPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      "media",
      "assets"
    );

    // Uri to load assets in webview
    const assetsUri = webview.asWebviewUri(assetsPath);

    // Use a nonce to only allow specific scripts to be run
    return generateHTML(webview, assetsUri);
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(
    document: vscode.TextDocument,
    event: SaveGraphMessage
  ) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(event.json, null, 2)
    );

    return vscode.workspace.applyEdit(edit);
  }

  private async handleMessage(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    event: EditorToExtensionMessage
  ) {
    switch (event.type) {
      case "refreshContent":
        this.requestIdCounter++;
        updateWebview(document, webviewPanel, this.requestIdCounter);
        break;
      case "saveGraph":
        if (event.requestId !== this.requestIdCounter) {
          this.ignoreNextUpdate = true;
          this.updateTextDocument(document, event);
        }
        break;
      default: {
        handleMessage(document, webviewPanel, event);
        break;
      }
    }
  }

  ignoreNextUpdate = false;
  private requestIdCounter = 0;
}

function updateWebview(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  id: number
) {
  postMessage(webviewPanel, {
    type: "loadGraph",
    json: getDocumentAsJson(document),
    requestId: id,
  });
}

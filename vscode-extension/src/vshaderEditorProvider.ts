import * as vscode from "vscode";
import * as fs from "fs";
import { getNonce } from "./utils";
import {
  EditorToExtensionMessage,
  ExtensionToEditorMessage,
  SaveGraphMessage,
  ShowOpenDialogRequestMessage,
  ToWebviewURIMessage,
} from "./messages";

export class VShaderEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new VShaderEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      VShaderEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = "vshader.graphEditor";

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
      postMessage(webviewPanel, { type: "dispose" });
      changeDocumentSubscription.dispose();
      saveDocumentSubscription.dispose();
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
    const nonce = getNonce();

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>VShader Editor</title>
                <link rel="stylesheet" crossorigin href="${assetsUri}/index-Gpo72nnT.css">
            </head>
            <body style="padding:0px">
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${assetsUri}/index.js"></script>
            </body>
            </html>`;
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
      case "alert":
        vscode.window.showErrorMessage(event.text);
        break;
      case "showOpenDialog": {
        await showOpenDialog(document, webviewPanel, event);
        break;
      }
      case "refreshContent":
        this.requestIdCounter++;
        updateWebview(document, webviewPanel, this.requestIdCounter);
        break;
      case "exportGraphResponse":
        try {
          if (event.content) {
            fs.promises.writeFile(event.path, event.content, "utf8");
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to save GLSL file: ${error}`);
        }
        break;
      case "saveGraph":
        if (event.requestId !== this.requestIdCounter) {
          this.ignoreNextUpdate = true;
          this.updateTextDocument(document, event);
        }
        break;
      case "toWebviewURI": {
        toWebViewURI(event, document, webviewPanel);
        break;
      }
    }
  }

  ignoreNextUpdate = false;
  private requestIdCounter = 0;
}

function toWebViewURI(
  event: ToWebviewURIMessage,
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel
) {
  const uris = event.params.relativepaths.map((p) => {
    // Convert a workspace relative path to a webview uri
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
      return "";
    }
    const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, p);
    return webviewPanel.webview.asWebviewUri(fileUri).toString();
  });

  postMessage(webviewPanel, {
    type: "toWebviewURIResponse",
    requestId: event.requestId,
    params: {
      uris,
    },
  });
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

function postMessage(
  webviewPanel: vscode.WebviewPanel,
  message: ExtensionToEditorMessage
) {
  // Post a message to the webview
  webviewPanel.webview.postMessage(message);
}

/**
 * Try to get a current document as json text.
 */
function getDocumentAsJson(document: vscode.TextDocument): unknown {
  const text = document.getText();
  if (text.trim().length === 0) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Could not get document as json. Content is not valid json"
    );
  }
}

async function showOpenDialog(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  event: ShowOpenDialogRequestMessage
) {
  const fileUris = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: event.params.label,
    filters: event.params.filters,
  });

  const relativePaths: string[] = [];
  const pathToDocument = document.uri;

  for (const uri of fileUris || []) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const documentWorkspaceFolder =
      vscode.workspace.getWorkspaceFolder(pathToDocument);
    if (
      workspaceFolder?.uri.toString() !==
      documentWorkspaceFolder?.uri.toString()
    ) {
      vscode.window.showErrorMessage(
        "Please select a file within the current workspace."
      );
      continue;
    }

    // Make the uri relative
    relativePaths.push(vscode.workspace.asRelativePath(uri));
  }

  postMessage(webviewPanel, {
    type: "showOpenDialogResponse",
    requestId: event.requestId,
    params: {
      relativePaths,
    },
  });
}

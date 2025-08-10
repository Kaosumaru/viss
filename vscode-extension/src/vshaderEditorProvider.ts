import * as vscode from "vscode";
import * as fs from "fs";
import { getNonce } from "./utils";
import { EditorToExtensionMessage, ExtensionToEditorMessage, SaveGraphMessage } from "./messages";

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

  // Store the latest exported GLSL per document
  private documentGlslMap = new Map<string, string>();

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
          this.requestIdCounter ++;
          updateWebview(document, webviewPanel, this.requestIdCounter);
        }
      }
    );

    // Listen for document save events to write GLSL file
    const saveDocumentSubscription = vscode.workspace.onDidSaveTextDocument(
      async (savedDocument) => {
        if (savedDocument.uri.toString() === document.uri.toString()) {
          const exportedGlsl = this.documentGlslMap.get(document.uri.toString());
          if (exportedGlsl) {
            const glslPath = document.uri.fsPath + '.glsl';
            try {
              await fs.promises.writeFile(glslPath, exportedGlsl, 'utf8');
            } catch (error) {
              vscode.window.showErrorMessage(`Failed to save GLSL file: ${error}`);
            }
          }
        }
      }
    );

    // Make sure we get rid of the listeners when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      saveDocumentSubscription.dispose();
      // Clean up stored GLSL data
      this.documentGlslMap.delete(document.uri.toString());
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) =>
      this.handleMessage(document, webviewPanel, e)
    );

    this.requestIdCounter ++;
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
            <body>
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${assetsUri}/index.js"></script>
            </body>
            </html>`;
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(document: vscode.TextDocument, event: SaveGraphMessage) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(event.json, null, 2)
    );

    // Store the exported GLSL for writing when the document is saved
    if (event.exportedGlsl) {
      this.documentGlslMap.set(document.uri.toString(), event.exportedGlsl);
    }

    return vscode.workspace.applyEdit(edit);
  }

  private handleMessage(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    event: EditorToExtensionMessage
  ) {
    switch (event.type) {
      case "alert":
        vscode.window.showErrorMessage(event.text);
        break;
      case "refreshContent":
        this.requestIdCounter ++;
        updateWebview(document, webviewPanel, this.requestIdCounter);
        break;
      case "saveGraph":
        if (event.requestId !== this.requestIdCounter) {
          this.ignoreNextUpdate = true;
          this.updateTextDocument(document, event);
        }
        break;
    }
  }

  ignoreNextUpdate = false;
  private requestIdCounter = 0;
}

function updateWebview(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  id: number,
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
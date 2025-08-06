import * as vscode from "vscode";
import { getNonce } from "./utils";
import { EditorToExtensionEvent } from "./events";

export class VShaderEditorPanel {
  public static currentPanel: VShaderEditorPanel | undefined;
  public static readonly viewType = "vshaderEditor";

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (VShaderEditorPanel.currentPanel) {
      VShaderEditorPanel.currentPanel.panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      VShaderEditorPanel.viewType,
      "VShader Editor",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    );

    VShaderEditorPanel.currentPanel = new VShaderEditorPanel(
      panel,
      extensionUri
    );
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    VShaderEditorPanel.currentPanel = new VShaderEditorPanel(
      panel,
      extensionUri
    );
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    // Set the webview's initial html content
    this.update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Update the content based on view changes
    this.panel.onDidChangeViewState(
      (_e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
        if (this.panel.visible) {
          this.update();
        }
      },
      null,
      this.disposables
    );

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (message: EditorToExtensionEvent) => this.handleEvent(message),
      null,
      this.disposables
    );
  }

  public dispose() {
    VShaderEditorPanel.currentPanel = undefined;

    // Clean up our resources
    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      x?.dispose();
    }
  }

  private handleEvent(event: EditorToExtensionEvent) {
    switch (event.type) {
      case "alert":
        vscode.window.showErrorMessage(event.text);
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
  }

  private update() {
    const webview = this.panel.webview;
    this.panel.title = "VShader Editor";
    this.panel.webview.html = this.getHtmlForWebview(webview);
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    // Local path to assets
    const assetsPath = vscode.Uri.joinPath(
      this.extensionUri,
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
                <link rel="stylesheet" crossorigin href="${assetsUri}/index-B_N7Vb0j.css">
            </head>
            <body>
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${assetsUri}/index.js"></script>
            </body>
            </html>`;
  }
}

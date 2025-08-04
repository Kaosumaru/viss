import * as vscode from 'vscode';

/**
 * Provider for VShader graph editors.
 * 
 * This class handles the custom editor for .vgraph files, providing a webview-based
 * interface that embeds the VShader graph editor.
 */
export class VShaderGraphEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'vshader.graphEditor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Called when our custom editor is opened.
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.context.extensionUri,
                vscode.Uri.joinPath(this.context.extensionUri, '..', 'dist'),
                vscode.Uri.joinPath(this.context.extensionUri, '..', 'src')
            ]
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        // Hook up event handlers so that we can synchronize the webview with the text document.
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'save':
                    this.updateTextDocument(document, e.graph);
                    return;
                case 'error':
                    vscode.window.showErrorMessage(e.message);
                    return;
                case 'ready':
                    updateWebview();
                    return;
            }
        });

        updateWebview();
    }

    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vshader-editor.js');
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Local path to css styles
        const stylePathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vshader-editor.css');
        const styleUri = webview.asWebviewUri(stylePathOnDisk);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>VShader Graph Editor</title>
            </head>
            <body>
                <div id="vshader-editor-root"></div>
                <script nonce="${nonce}">
                    // Pass initial document content to the webview
                    window.initialGraphData = ${JSON.stringify(document.getText())};
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    /**
     * Write out the graph data to the document.
     */
    private updateTextDocument(document: vscode.TextDocument, graphData: any) {
        const edit = new vscode.WorkspaceEdit();

        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            JSON.stringify(graphData, null, 2)
        );

        return vscode.workspace.applyEdit(edit);
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

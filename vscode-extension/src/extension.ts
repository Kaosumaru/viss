import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('VShader Editor extension is now active!');

    const disposable = vscode.commands.registerCommand('vshader.openEditor', () => {
        VShaderEditorPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

class VShaderEditorPanel {
    public static currentPanel: VShaderEditorPanel | undefined;
    public static readonly viewType = 'vshaderEditor';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (VShaderEditorPanel.currentPanel) {
            VShaderEditorPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            VShaderEditorPanel.viewType,
            'VShader Editor',
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,
                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        VShaderEditorPanel.currentPanel = new VShaderEditorPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        VShaderEditorPanel.currentPanel = new VShaderEditorPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            (_e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: { command: string; text?: string }) => {
                switch (message.command) {
                    case 'alert':
                        if (message.text) {
                            vscode.window.showErrorMessage(message.text);
                        }
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        VShaderEditorPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = 'VShader Editor';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Local path to assets
        const assetsPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'assets');
        
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
                <script type="module" nonce="${nonce}" src="${assetsUri}/index-BVnhlanB.js"></script>
            </body>
            </html>`;
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

import { getNonce } from "./utils";
import * as vscode from "vscode";

export function generateHTML(webview: vscode.Webview, assetsUri: vscode.Uri) {
  const nonce = getNonce();

  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Viss Editor</title>
                <link rel="stylesheet" crossorigin href="${assetsUri}/index-Gpo72nnT.css">
            </head>
            <body style="padding:0px">
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${assetsUri}/index.js"></script>
            </body>
            </html>`;
}

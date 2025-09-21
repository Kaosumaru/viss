import * as vscode from "vscode";
import { postMessage } from "../utils/utils";
import { ToWebviewURIRequest } from "../messages/messages";

export function toWebViewURI(
  event: ToWebviewURIRequest,
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

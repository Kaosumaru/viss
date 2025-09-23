import * as vscode from "vscode";
import { postMessage, relativeToAbsolutePath } from "../utils/utils";
import { ToWebviewURIRequest } from "../messages/messages";

export function toWebViewURI(
  event: ToWebviewURIRequest,
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel
) {
  const uris = event.params.relativepaths.map((p) => {
    const fileUri = relativeToAbsolutePath(document, p);
    if (fileUri) {
      return webviewPanel.webview.asWebviewUri(fileUri).toString();
    }
    return "";
  });

  postMessage(webviewPanel, {
    type: "toWebviewURIResponse",
    requestId: event.requestId,
    params: {
      uris,
    },
  });
}

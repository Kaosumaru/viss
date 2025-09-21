import * as vscode from "vscode";
import { ExtensionToEditorMessage } from "../messages/messages";

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function postMessage(
  webviewPanel: vscode.WebviewPanel,
  message: ExtensionToEditorMessage
) {
  // Post a message to the webview
  webviewPanel.webview.postMessage(message);
}

/**
 * Try to get a current document as json text.
 */
export function getDocumentAsJson(document: vscode.TextDocument): unknown {
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

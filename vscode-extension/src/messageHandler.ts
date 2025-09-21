import { EditorToExtensionMessage } from "./messages/messages";
import * as vscode from "vscode";
import { showOpenFileDialog } from "./requests/showOpenFileDialog";
import { toWebViewURI } from "./requests/toWebViewURI";
import * as fs from "fs";

export async function handleMessage(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  event: EditorToExtensionMessage
) {
  switch (event.type) {
    case "alert":
      vscode.window.showErrorMessage(event.text);
      break;
    case "showOpenFileDialog": {
      await showOpenFileDialog(document, webviewPanel, event);
      break;
    }
    case "exportGraphResponse":
      try {
        if (event.content) {
          fs.promises.writeFile(event.path, event.content, "utf8");
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to save GLSL file: ${error}`);
      }
      break;

    case "toWebviewURI": {
      toWebViewURI(event, document, webviewPanel);
      break;
    }

    // handled in vshaderEditorProvider
    case "saveGraph":
      break;
    case "refreshContent":
      break;
  }
}

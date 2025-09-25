import { EditorToExtensionMessage } from "./messages/messages";
import * as vscode from "vscode";
import { selectFile } from "./requests/selectFile";
import { toWebViewURI } from "./requests/toWebViewURI";
import * as fs from "fs";
import { showOpenFolderDialog } from "./requests/showOpenFolderDialog";
import { openFiles } from "./requests/openFiles";

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
      await selectFile(document, webviewPanel, event);
      break;
    }
    case "openFiles": {
      await openFiles(document, webviewPanel, event);
      break;
    }
    case "showOpenFolderDialog": {
      await showOpenFolderDialog(document, webviewPanel, event);
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

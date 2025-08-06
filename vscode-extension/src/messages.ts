export interface AlertMessage {
  type: "alert";
  text: string;
}

export interface RefreshContentMessage {
  type: "refreshContent";
}

export interface SaveGraphMessage {
  type: "saveGraph";
  json: unknown;
}

export type EditorToExtensionMessage =
  | AlertMessage
  | RefreshContentMessage
  | SaveGraphMessage;

export interface LoadGraphMessage {
  type: "loadGraph";
  json: unknown;
}

export type ExtensionToEditorMessage = LoadGraphMessage;

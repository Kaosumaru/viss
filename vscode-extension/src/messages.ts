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
  requestId?: number;
}

export interface ExportGraphResponseMessage {
  type: "exportGraphResponse";
  path: string;
  content?: string;
}

export interface ShowOpenDialogRequestMessage {
  type: "showOpenDialog";
  label: string;
  filters?: Record<string, string[]>;
  requestId: number;
}

export type EditorToExtensionMessage =
  | AlertMessage
  | RefreshContentMessage
  | SaveGraphMessage
  | ExportGraphResponseMessage
  | ShowOpenDialogRequestMessage;

export interface ShowOpenDialogResponseMessage {
  type: "showOpenDialogResponse";
  requestId: number;
  fileUris: string[];
}

export interface LoadGraphMessage {
  type: "loadGraph";
  json: unknown;
  requestId?: number;
}

export interface ExportGraphRequestMessage {
  type: "exportGraphRequest";
  path: string;
}

export type ExtensionToEditorMessage =
  | LoadGraphMessage
  | ExportGraphRequestMessage
  | ShowOpenDialogResponseMessage;

export interface AlertEvent {
  type: "alert";
  text: string;
}

export type EditorToExtensionEvent = AlertEvent;

export interface LoadGraphEvent {
  type: "loadGraph";
  text: string;
}

export type ExtensionToEditorEvent = LoadGraphEvent;

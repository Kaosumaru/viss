import { vscode } from "./vscodeManager";
import imgUrl from "./data/test.png";

export async function selectInclude(): Promise<string | undefined> {
  if (!vscode.isAvailable) {
    return imgUrl;
  }

  const response = await vscode.showOpenFileDialog({
    label: "Select Include",
    filters: { images: ["glsl", "frag"] },
  });

  console.log("Selected file URI:", response.relativePaths[0]);
  return response.relativePaths[0];
}

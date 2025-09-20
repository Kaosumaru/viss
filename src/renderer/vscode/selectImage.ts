import { vscode } from "./vscodeManager";
import imgUrl from "./data/test.png";

export async function selectImage(): Promise<string | undefined> {
  if (!vscode.isAvailable) {
    return imgUrl;
  }

  const response = await vscode.showOpenDialog({
    label: "Select Image",
    filters: { images: ["png", "jpg", "jpeg"] },
  });

  if (response) {
    console.log("Selected file URI:", response.relativePaths[0]);
    return response.relativePaths[0];
  }

  return undefined;
}

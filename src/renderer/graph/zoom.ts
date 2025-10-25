import { Zoom } from "rete-area-plugin";
import type { OnZoom } from "rete-area-plugin/_types/zoom";

export class MyZoom extends Zoom {
  public initialize(
    container: HTMLElement,
    element: HTMLElement,
    onzoom: OnZoom
  ) {
    super.initialize(container, element, onzoom);
    this.container.removeEventListener("dblclick", this.dblclick);
  }
}

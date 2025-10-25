import { getUID, type NodeId } from "rete";
import { BaseAreaPlugin, Drag } from "rete-area-plugin";

import type { ExpectedSchemes, Position } from "./types";

interface Events {
  contextMenu?: null | (() => void);
  pick?: null | (() => void);
  translate?:
    | null
    | ((dx: number, dy: number, sources?: NodeId[]) => Promise<void>);
  drag?: null | (() => void);
}

export class Comment {
  id: string;
  dragHandler!: Drag;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  links: string[] = [];
  element!: HTMLElement;
  nested!: HTMLElement;
  prevPosition: null | Position = null;
  private isEditing = false;
  private originalText = "";

  public text: string;
  public area: BaseAreaPlugin<ExpectedSchemes, unknown>;
  private events?: Events;
  private lastClickTime = 0;
  private textAreaElement: HTMLTextAreaElement | null = null;

  constructor(
    text: string,
    area: BaseAreaPlugin<ExpectedSchemes, unknown>,
    events?: Events
  ) {
    this.id = getUID();
    this.text = text;
    this.area = area;
    this.events = events;
    this.element = document.createElement("div");
    this.nested = document.createElement("div");
    this.element.appendChild(this.nested);
    this.nested.addEventListener("mouseup", this.onMouseUp.bind(this));

    this.dragHandler = new Drag();

    this.dragHandler.initialize(
      this.nested,
      {
        getCurrentPosition: () => ({ x: this.x, y: this.y }),
        getZoom: () => 1,
      },
      {
        start: () => {
          if (this.isEditing) return;
          this.prevPosition = { ...area.area.pointer };

          if (this.events?.pick) {
            this.events.pick();
          }
        },
        translate: () => {
          if (this.isEditing) return;
          if (this.prevPosition) {
            const pointer = { ...area.area.pointer };
            const dx = pointer.x - this.prevPosition.x;
            const dy = pointer.y - this.prevPosition.y;

            void this.translate(dx, dy);
            this.prevPosition = pointer;
          }
        },
        drag: () => {
          if (this.isEditing) return;
          this.prevPosition = null;
          if (this.events?.drag) {
            this.events.drag();
          }
        },
      }
    );
    this.update();
  }

  linkTo(ids: NodeId[]) {
    this.links = ids;
  }

  linkedTo(nodeId: NodeId) {
    return this.links.includes(nodeId);
  }

  onMouseUp(_e: MouseEvent) {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastClickTime;

    if (timeDiff < 300) {
      this.startEditing(_e);
    }

    this.lastClickTime = currentTime;
  }

  startEditing(_e: MouseEvent) {
    if (this.isEditing) return;

    this.isEditing = true;
    this.originalText = this.text;

    // Create input element
    const input = document.createElement("textarea");
    input.value = this.text;
    input.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      resize: none;
      overflow: hidden;
      user-select: auto;
    `;

    // Clear the nested element and add input
    this.nested.innerHTML = "";
    this.nested.appendChild(input);

    // Focus and select all text
    input.focus();
    input.select();

    this.textAreaElement = input;

    // Handle key events
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.confirmEdit(input.value);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.cancelEdit();
      }
    };

    // Handle blur (when clicking outside)
    const handleBlur = () => {
      this.confirmEdit(input.value);
    };

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    input.addEventListener("keydown", handleKeyDown);
    input.addEventListener("blur", handleBlur);

    input.addEventListener("mouseup", stopPropagation);
    input.addEventListener("mousedown", stopPropagation);
    input.addEventListener("mousemove", stopPropagation);
  }

  confirmEdit(newText: string) {
    if (!this.isEditing) return;

    this.text = newText;
    this.isEditing = false;
    this.update();

    this.textAreaElement = null;
  }

  cancelEdit() {
    if (!this.isEditing) return;

    this.text = this.originalText;
    this.isEditing = false;

    this.update();
    this.textAreaElement = null;
  }

  onContextMenu(_e: MouseEvent) {
    if (this.events?.contextMenu) {
      this.events.contextMenu();
    }
  }

  async translate(dx: number, dy: number, sources?: NodeId[]) {
    this.x += dx;
    this.y += dy;

    if (this.events?.translate) {
      await this.events.translate(dx, dy, sources);
    }
    this.update();
  }

  select() {
    this.nested.classList.add("selected");
  }

  unselect() {
    this.nested.classList.remove("selected");
  }

  update() {
    if (!this.isEditing) {
      this.nested.innerText = this.text;
    }
    this.nested.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  destroy() {
    this.dragHandler.destroy();
  }
}

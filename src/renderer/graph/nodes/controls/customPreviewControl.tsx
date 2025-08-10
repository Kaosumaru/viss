import { useEffect, useRef } from "react";
import { ClassicPreset } from "rete";
import { ShaderEntry } from "../../../components/shaderOverlay/shaderEntry";
import { useShaderEntry } from "../../../components/shaderOverlay/ShaderEntryContext";

export class PreviewControl extends ClassicPreset.Control {
  nodeId: string;
  shader?: string;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
  }
}

export function CustomPreviewControl(props: { data: PreviewControl }) {
  const divRef = useRef<HTMLDivElement>(null);
  const shaderEntryRef = useRef<ShaderEntry | null>(null);
  const { addEntry, removeEntry, updateEntryPosition } = useShaderEntry();

  useEffect(() => {
    // Create shader entry
    const shaderEntry = new ShaderEntry();
    shaderEntryRef.current = shaderEntry;
    addEntry(shaderEntry);

    return () => {
      // Cleanup shader entry
      if (shaderEntryRef.current) {
        removeEntry(shaderEntryRef.current);
      }
    };
  }, [addEntry, removeEntry]);

  useEffect(() => {
    shaderEntryRef.current?.setShader(props.data.shader);
  }, [props.data.shader]);

  useEffect(() => {
    const updatePosition = () => {
      if (!divRef.current || !shaderEntryRef.current) return;

      const rect = divRef.current.getBoundingClientRect();
      updateEntryPosition(
        shaderEntryRef.current,
        rect.left,
        rect.top,
        rect.width,
        rect.height
      );
    };

    // Update position on mount and whenever the component might move
    updatePosition();

    // Use ResizeObserver to track size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    if (divRef.current) {
      resizeObserver.observe(divRef.current);
    }

    // Use MutationObserver to track position changes
    const mutationObserver = new MutationObserver(updatePosition);
    if (divRef.current) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    // Also update on scroll and resize
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updateEntryPosition]);

  // render small black square
  return (
    <div
      ref={divRef}
      style={{
        width: "180px",
        height: "180px",
        borderRadius: "2px",
      }}
    />
  );
}

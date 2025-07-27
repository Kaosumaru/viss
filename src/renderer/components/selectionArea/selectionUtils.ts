import type { SelectionRect } from "./SelectionArea";

/**
 * Utility function to check if a node element intersects with a selection rectangle
 */
export const isNodeInSelectionRect = (
  nodeElement: HTMLElement,
  rect: SelectionRect,
  containerElement: HTMLElement
): boolean => {
  const containerRect = containerElement.getBoundingClientRect();
  const nodeRect = nodeElement.getBoundingClientRect();

  // Convert selection rect to absolute coordinates
  const selectionLeft = Math.min(rect.startX, rect.endX) + containerRect.left;
  const selectionTop = Math.min(rect.startY, rect.endY) + containerRect.top;
  const selectionRight = Math.max(rect.startX, rect.endX) + containerRect.left;
  const selectionBottom = Math.max(rect.startY, rect.endY) + containerRect.top;

  // Check if node intersects with selection rectangle
  return !(
    nodeRect.right < selectionLeft ||
    nodeRect.left > selectionRight ||
    nodeRect.bottom < selectionTop ||
    nodeRect.top > selectionBottom
  );
};

/**
 * Utility function to get all nodes within a selection area for Rete.js editors
 */
export const getNodesInSelectionArea = (
  rect: SelectionRect,
  containerElement: HTMLElement
): string[] => {
  const nodeElements = containerElement.querySelectorAll("[data-node-id]");
  const selectedNodeIds: string[] = [];

  nodeElements.forEach((element) => {
    const nodeId = element.getAttribute("data-node-id");
    if (
      nodeId &&
      isNodeInSelectionRect(element as HTMLElement, rect, containerElement)
    ) {
      selectedNodeIds.push(nodeId);
    }
  });

  return selectedNodeIds;
};

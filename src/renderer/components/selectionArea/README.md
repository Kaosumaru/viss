# Selection Area Components

This directory contains React components for creating selection areas with middle-mouse button drag functionality.

## Components

### SelectionArea

The base selection area component that provides middle-click drag selection functionality.

```tsx
import { SelectionArea } from './components/selectionArea';

<SelectionArea
  onSelectionChange={(rect) => {
    // Called during selection drag
    console.log('Current selection:', rect);
  }}
  onSelectionComplete={(rect) => {
    // Called when selection is complete
    console.log('Final selection:', rect);
  }}
  disabled={false}
>
  <YourContent />
</SelectionArea>
```

**Props:**
- `children`: React.ReactNode - The content to render inside the selection area
- `onSelectionChange?: (rect: SelectionRect | null) => void` - Called during selection drag
- `onSelectionComplete?: (rect: SelectionRect) => void` - Called when selection is complete
- `disabled?: boolean` - Whether the selection is disabled
- `className?: string` - Additional CSS class
- `style?: React.CSSProperties` - Additional styles

### NodeSelectionArea

Enhanced selection area specifically designed for node editors like Rete.js.

```tsx
import { NodeSelectionArea, getNodesInSelectionArea } from './components/selectionArea';

const MyEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleNodeSelection = (nodeIds: string[]) => {
    // Handle selected nodes
    console.log('Selected nodes:', nodeIds);
  };

  const getNodesInArea = (rect: SelectionRect) => {
    if (!editorRef.current) return [];
    return getNodesInSelectionArea(rect, editorRef.current);
  };

  return (
    <NodeSelectionArea
      onNodeSelection={handleNodeSelection}
      getNodesInArea={getNodesInArea}
    >
      <div ref={editorRef}>
        {/* Your node editor content */}
      </div>
    </NodeSelectionArea>
  );
};
```

**Props:**
- `children`: React.ReactNode - The content to render inside the selection area
- `onNodeSelection?: (nodeIds: string[]) => void` - Called when node selection is complete
- `getNodesInArea?: (rect: SelectionRect) => string[]` - Function to get nodes within selection area
- `disabled?: boolean` - Whether the selection is disabled
- `className?: string` - Additional CSS class
- `style?: React.CSSProperties` - Additional styles

## Utility Functions

### isNodeInSelectionRect

Checks if a node element intersects with a selection rectangle.

```tsx
import { isNodeInSelectionRect } from './components/selectionArea';

const isSelected = isNodeInSelectionRect(nodeElement, selectionRect, containerElement);
```

### getNodesInSelectionArea

Gets all nodes within a selection area for Rete.js editors.

```tsx
import { getNodesInSelectionArea } from './components/selectionArea';

const selectedNodes = getNodesInSelectionArea(selectionRect, containerElement);
```

## Types

### SelectionRect

```tsx
interface SelectionRect {
  startX: number;  // Starting X coordinate
  startY: number;  // Starting Y coordinate
  endX: number;    // Ending X coordinate
  endY: number;    // Ending Y coordinate
}
```

## Usage Instructions

1. **Basic Selection**: Use `SelectionArea` for basic rectangular selection with visual feedback
2. **Node Selection**: Use `NodeSelectionArea` for selecting nodes in editors
3. **Middle Mouse Button**: Hold down the middle mouse button and drag to create selection
4. **Visual Feedback**: A dashed blue rectangle appears during selection
5. **Node Detection**: Nodes must have `data-node-id` attribute to be detected

## Integration with Existing Editor

The SelectionArea is now integrated with the main node editor in `EditorView.tsx`. The integration includes:

1. **Automatic Node Selection**: Middle-click and drag to select multiple nodes
2. **Editor API Integration**: Uses the existing `selectNodes` method from EditorAPI
3. **Node Detection**: Automatically detects nodes with `data-node-id` attributes
4. **Visual Feedback**: Selected nodes use the existing selection styling

### How it works:

The `NodeSelectionArea` component wraps the Rete.js editor container and:
- Listens for middle-mouse button drag events
- Calculates which nodes intersect with the selection rectangle
- Calls `editorRef.current.selectNodes(nodeIds)` to update the selection
- Integrates with the existing selectable extension for consistent behavior

### Usage:

The selection area is automatically available in the editor:
1. Hold down the middle mouse button
2. Drag to create a selection rectangle
3. Release to select all nodes within the rectangle
4. Selected nodes will be highlighted using the existing selection system

No additional setup is required - the feature is now part of the standard editor experience.
```

## Styling

The selection rectangle can be customized via CSS:

```css
/* Selection box style is applied inline, but you can override */
.selection-area .selection-box {
  border: 2px dashed #007acc;
  background-color: rgba(0, 122, 204, 0.1);
}
```

## Examples

- `SelectionAreaDemo.tsx` - Basic usage example
- `EditorSelectionExample.tsx` - Node editor integration example

# VShader Graph Editor - VS Code Extension

This VS Code extension provides a custom editor for `.vgraph` files, which contain visual shader graph definitions in JSON format.

## Features

- **Custom Editor**: Opens `.vgraph` files in a specialized visual graph editor
- **Live Editing**: Real-time synchronization between the graph editor and the underlying JSON document
- **Integration Ready**: Designed to embed your existing VShader graph editor

## Installation and Setup

### 1. Install Dependencies

```bash
cd vscode-extension
npm install
```

### 2. Compile the Extension

```bash
npm run compile
```

### 3. Integration with Your VShader Editor

To complete the integration with your existing VShader graph editor:

1. **Build your VShader project** to create distributable assets
2. **Copy the compiled assets** to the `media/` folder
3. **Update `vshader-editor.js`** to import and initialize your graph editor:

```javascript
// In vshader-editor.js, replace the placeholder implementation with:
import { createEditor } from '../path-to-your-compiled-editor';
import { Compiler } from '../path-to-your-compiled-compiler';

async function initializeRealEditor(container) {
    const compiler = new Compiler();
    const overlayContext = /* your overlay context */;
    
    const editorAPI = await createEditor(
        compiler,
        container,
        overlayContext,
        (editorData) => {
            // Handle graph changes
            currentGraphData = editorData.saveGraph();
            markDocumentDirty();
        }
    );
    
    // Load the current graph data
    if (currentGraphData) {
        await editorAPI.loadGraph(JSON.stringify(currentGraphData));
    }
    
    return editorAPI;
}
```

### 4. Test the Extension

1. Open VS Code
2. Press `F5` to launch the Extension Development Host
3. Open a `.vgraph` file
4. The custom editor should activate

## File Format

The extension works with `.vgraph` files containing JSON with this structure:

```json
{
  "version": 1,
  "includes": [],
  "nodes": [
    {
      "identifier": "unique_node_id",
      "nodeType": "output",
      "position": { "x": 400, "y": 200 },
      "parameters": {}
    }
  ],
  "connections": [
    {
      "from": { "nodeId": "source_node", "pinName": "output" },
      "to": { "nodeId": "target_node", "pinName": "input" },
      "type": { "primitive": "float", "dimensions": 4 }
    }
  ]
}
```

## Commands

- `vshader.openGraphEditor`: Open a file with the VShader Graph Editor

## Development

### Project Structure

```
vscode-extension/
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── extension.ts      # Extension entry point
│   └── vshaderGraphEditorProvider.ts  # Custom editor provider
└── media/
    ├── vshader-editor.js   # Webview script
    └── vshader-editor.css  # Webview styles
```

### Building

```bash
npm run compile     # Compile TypeScript
npm run watch       # Watch for changes
```

### Packaging

To create a `.vsix` package for distribution:

```bash
npm install -g @vscode/vsce
vsce package
```

## Integration Notes

The current implementation provides a placeholder editor that displays the JSON structure. To integrate your actual VShader graph editor:

1. **Bundle your editor**: Create a browser-compatible build of your React/Rete.js editor
2. **Include dependencies**: Make sure all required libraries (React, Material-UI, Rete.js, etc.) are included
3. **Handle the webview context**: Adapt your editor to work in VS Code's webview environment
4. **Implement save/load**: Connect the editor's state changes to VS Code's document system

The extension is designed to be a thin wrapper around your existing graph editor, providing the VS Code integration layer while preserving all your editor's functionality.

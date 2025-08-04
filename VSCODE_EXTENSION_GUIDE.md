# VShader Graph Editor - VS Code Extension Integration Guide

You now have a complete VS Code extension that opens `.vgraph` files in a custom editor! Here's what has been created and how to use it.

## 📁 What was created

```
vscode-extension/
├── package.json                           # Extension manifest
├── tsconfig.json                          # TypeScript configuration
├── README.md                              # Documentation
├── build.js                               # Build automation script
├── .vscode/
│   ├── launch.json                        # Debug configuration
│   └── tasks.json                         # Build tasks
├── src/
│   ├── extension.ts                       # Extension entry point
│   └── vshaderGraphEditorProvider.ts      # Custom editor provider
├── media/
│   ├── vshader-editor.js                  # Webview script (placeholder)
│   ├── vshader-editor.css                 # Webview styles
│   └── integration-helper.ts              # Integration utilities
└── out/                                   # Compiled JavaScript files
```

## 🚀 Testing the Extension

### 1. Open VS Code in the extension directory
```bash
cd vscode-extension
code .
```

### 2. Launch the Extension Development Host
- Press `F5` or go to **Run and Debug** → **Run Extension**
- This opens a new VS Code window with your extension loaded

### 3. Test with a .vgraph file
- In the Extension Development Host window, open the `sample-graph.vgraph` file
- The custom editor should activate automatically
- You'll see a placeholder editor showing the JSON structure

## 🔧 Integration with Your VShader Editor

The current implementation is a **placeholder**. To integrate your actual graph editor:

### Step 1: Build Your VShader Project
```bash
# In the main VShader directory
npm run build
# or
vite build
```

### Step 2: Update the Webview Script

Edit `media/vshader-editor.js` and replace the placeholder implementation with your actual editor:

```javascript
// Replace the initializePlaceholderEditor call with:
import { createEditor } from '../dist/your-compiled-editor.js';
import { Compiler } from '../dist/your-compiled-compiler.js';

async function initializeRealEditor(container) {
    const compiler = new Compiler();
    
    // Create your overlay context
    const overlayContext = {
        // Your shader overlay context implementation
    };
    
    const editorAPI = await createEditor(
        compiler,
        container,
        overlayContext,
        (editorData) => {
            // Handle graph changes
            currentGraphData = editorData.saveGraph();
            vscode.postMessage({
                type: 'save',
                graph: currentGraphData
            });
        }
    );
    
    // Load initial graph
    if (currentGraphData) {
        await editorAPI.loadGraph(JSON.stringify(currentGraphData));
    }
    
    return editorAPI;
}
```

### Step 3: Bundle Dependencies

You'll need to create a bundle that includes:
- Your compiled VShader editor
- React and React DOM
- Material-UI components
- Rete.js and related plugins
- Any other dependencies

Consider using a tool like Webpack or Vite to create a webview-compatible bundle.

### Step 4: Update Content Security Policy

If needed, update the CSP in `vshaderGraphEditorProvider.ts` to allow your bundled assets:

```typescript
const cspContent = `default-src 'none'; 
                   style-src ${webview.cspSource} 'unsafe-inline'; 
                   script-src 'nonce-${nonce}'; 
                   font-src ${webview.cspSource};
                   img-src ${webview.cspSource} data:;`;
```

## 🎯 Key Features Implemented

✅ **Custom Editor Registration**: `.vgraph` files automatically open in the custom editor
✅ **Document Synchronization**: Changes in the editor sync with VS Code's document system
✅ **Webview Integration**: Secure webview environment for your graph editor
✅ **Save/Load Support**: JSON serialization and deserialization
✅ **Error Handling**: Comprehensive error reporting
✅ **VS Code Integration**: Proper VS Code extension structure and configuration

## 🔄 How It Works

1. **File Association**: VS Code recognizes `.vgraph` files and opens them with your custom editor
2. **Webview Creation**: The extension creates a webview panel with your graph editor
3. **Document Sync**: Changes in the editor are saved back to the VS Code document
4. **State Management**: The editor maintains sync between the visual graph and JSON representation

## 📦 Publishing the Extension

When ready to distribute:

```bash
# Install VSCE (VS Code Extension manager)
npm install -g @vscode/vsce

# Package the extension
cd vscode-extension
vsce package

# This creates a .vsix file that can be installed in VS Code
```

## 🐛 Troubleshooting

### Extension doesn't activate
- Check the developer console in the Extension Development Host
- Ensure all TypeScript compiled successfully (`npm run compile`)

### Graph editor doesn't load
- Check browser developer tools in the webview
- Verify all required assets are bundled and accessible
- Check Content Security Policy restrictions

### Changes don't save
- Ensure the `vscode.postMessage` calls are working
- Check the message handling in `vshaderGraphEditorProvider.ts`

## 🎨 Customization

- **Styling**: Modify `media/vshader-editor.css` to match VS Code themes
- **Commands**: Add more commands in `package.json` and `extension.ts`
- **Settings**: Add extension settings for user preferences
- **Themes**: Support VS Code's light/dark theme switching

## 📖 Next Steps

1. **Complete the integration** by connecting your actual graph editor
2. **Test thoroughly** with various `.vgraph` files
3. **Add more features** like export/import, validation, etc.
4. **Polish the UI** to match VS Code's design language
5. **Package and distribute** your extension

The foundation is complete - you now have a fully functional VS Code extension that can host your VShader graph editor!

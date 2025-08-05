# VShader VS Code Extension Setup Guide

## What's Been Created

I've successfully created a custom VS Code extension for your VShader application! Here's what was set up:

### Extension Structure
```
vscode-extension/
├── package.json          # Extension manifest
├── src/
│   └── extension.ts      # Main extension code
├── media/                # Built application assets
│   ├── index.html
│   ├── vite.svg
│   └── assets/
│       ├── index-BVnhlanB.js  # Your bundled React app
│       └── index-B_N7Vb0j.css
├── out/                  # Compiled extension code
└── vshader-editor-0.0.1.vsix  # Installable extension package
```

## Installation Instructions

### Option 1: Install from VSIX file
1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X)
3. Click the "..." menu at the top of the Extensions view
4. Select "Install from VSIX..."
5. Navigate to and select: `d:\GitHub\vshader\vscode-extension\vshader-editor-0.0.1.vsix`

### Option 2: Development Mode
1. Open VS Code
2. Open the extension folder: `d:\GitHub\vshader\vscode-extension`
3. Press F5 to launch a new Extension Development Host window
4. The extension will be loaded automatically in the new window

## Usage

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "VShader: Open Editor"
3. Your visual shader editor will open in a new webview panel

## Features

✅ **Complete Integration**: Your React-based shader editor runs inside VS Code
✅ **Vite Build System**: Uses your existing Vite build configuration
✅ **Hot Reload Support**: Rebuild and reload the extension during development
✅ **Material-UI Theming**: Dark theme integrated with VS Code
✅ **WebView Security**: Proper CSP and nonce-based security

## Development Workflow

### Making Changes to Your App
1. Modify your React app in the main `src/` directory
2. Build and copy to extension:
   ```bash
   cd d:\GitHub\vshader
   npm run build
   npm run copy:dist
   ```
3. Reload the VS Code extension window (Ctrl+R in the Extension Development Host)

### Making Changes to the Extension
1. Modify files in `vscode-extension/src/`
2. Rebuild the extension:
   ```bash
   cd d:\GitHub\vshader\vscode-extension
   npm run build:extension
   ```
3. Reload the extension (Ctrl+R)

### Creating New VSIX Package
```bash
cd d:\GitHub\vshader\vscode-extension
vsce package
```

## Extension Features

- **Command**: `vshader.openEditor` - Opens the VShader editor
- **Title**: "VShader: Open Editor" in the command palette
- **Webview**: Secure embedded web application
- **Assets**: All your React app assets are properly bundled

## Next Steps

1. **Install and Test**: Try installing the extension and opening the editor
2. **Customize**: Modify the extension manifest in `package.json` to add more features
3. **Publish**: Consider publishing to the VS Code Marketplace using `vsce publish`

The extension successfully packages your entire VShader application using Vite and displays it within VS Code's webview system!

# VShader Editor Extension for VS Code

This VS Code extension integrates the VShader visual shader editor directly into your development environment.

## Features

- Visual shader editing interface
- Built with React and Material-UI
- Integrated into VS Code's webview
- Real-time shader compilation and preview

## Development

### Building the Extension

1. First, build the main application:
   ```bash
   cd ..
   npm install
   npm run build
   npm run copy:dist
   ```

2. Then build the extension:
   ```bash
   cd vscode-extension
   npm install
   npm run build
   ```

### Installing the Extension

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Click on the "..." menu and select "Install from VSIX..."
4. Select the generated .vsix file

### Running in Development

1. Open the extension folder in VS Code
2. Press F5 to run the extension in a new Extension Development Host window
3. In the new window, open the Command Palette (Ctrl+Shift+P)
4. Run the command "VShader: Open Editor"

## Usage

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "VShader: Open Editor"
3. The visual shader editor will open in a new panel

## Building for Distribution

To create a .vsix file for distribution:

```bash
npm install -g vsce
vsce package
```

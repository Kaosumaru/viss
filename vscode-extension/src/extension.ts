import * as vscode from 'vscode';
import { VShaderGraphEditorProvider } from './vshaderGraphEditorProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the custom editor provider
    const provider = new VShaderGraphEditorProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            VShaderGraphEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false,
            }
        )
    );

    // Register command to open files with the graph editor
    context.subscriptions.push(
        vscode.commands.registerCommand('vshader.openGraphEditor', (uri: vscode.Uri) => {
            vscode.commands.executeCommand('vscode.openWith', uri, VShaderGraphEditorProvider.viewType);
        })
    );

    console.log('VShader Graph Editor extension is now active!');
}

export function deactivate() {}

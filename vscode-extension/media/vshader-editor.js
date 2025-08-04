// VShader Graph Editor Webview Script
// This script runs in the webview context and communicates with the VS Code extension

(function() {
    'use strict';

    const vscode = acquireVsCodeApi();
    let currentGraphData = null;
    let editorAPI = null;

    // Initialize the editor when the page loads
    window.addEventListener('DOMContentLoaded', () => {
        initializeEditor();
    });

    function initializeEditor() {
        const root = document.getElementById('vshader-editor-root');
        if (!root) {
            showError('Failed to find editor root element');
            return;
        }

        // Show loading indicator
        showLoading();

        try {
            // Parse initial graph data
            const initialData = window.initialGraphData;
            if (initialData) {
                try {
                    currentGraphData = JSON.parse(initialData);
                } catch (parseError) {
                    console.warn('Failed to parse initial graph data:', parseError);
                    currentGraphData = createEmptyGraph();
                }
            } else {
                currentGraphData = createEmptyGraph();
            }

            // Create editor container
            const editorContainer = document.createElement('div');
            editorContainer.className = 'vshader-graph-container';
            editorContainer.id = 'graph-editor-container';
            
            // Create toolbar
            const toolbar = createToolbar();
            
            root.innerHTML = '';
            root.appendChild(toolbar);
            root.appendChild(editorContainer);

            // Initialize the graph editor
            // Note: In a real implementation, you would import and initialize your VShader editor here
            // For now, we'll create a placeholder that shows the graph structure
            initializePlaceholderEditor(editorContainer);

            // Notify VS Code that the editor is ready
            vscode.postMessage({
                type: 'ready'
            });

        } catch (error) {
            showError(`Failed to initialize editor: ${error.message}`);
        }
    }

    function createEmptyGraph() {
        return {
            version: 1,
            includes: [],
            nodes: [],
            connections: []
        };
    }

    function createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'vshader-toolbar';

        const saveButton = document.createElement('button');
        saveButton.className = 'vshader-button';
        saveButton.textContent = 'Save';
        saveButton.onclick = () => saveGraph();

        const clearButton = document.createElement('button');
        clearButton.className = 'vshader-button';
        clearButton.textContent = 'Clear';
        clearButton.onclick = () => clearGraph();

        const addNodeButton = document.createElement('button');
        addNodeButton.className = 'vshader-button';
        addNodeButton.textContent = 'Add Node';
        addNodeButton.onclick = () => addSampleNode();

        toolbar.appendChild(saveButton);
        toolbar.appendChild(clearButton);
        toolbar.appendChild(addNodeButton);

        return toolbar;
    }

    function initializePlaceholderEditor(container) {
        // This is a placeholder implementation
        // In a real implementation, you would:
        // 1. Import your VShader graph editor modules
        // 2. Create a Compiler instance
        // 3. Initialize the editor with createEditor()
        // 4. Load the graph data
        
        container.innerHTML = `
            <div style="padding: 20px; height: 100%; display: flex; flex-direction: column;">
                <h3 style="color: var(--vscode-foreground); margin: 0 0 16px 0;">VShader Graph Editor</h3>
                <div style="flex: 1; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 16px; overflow: auto;">
                    <h4 style="color: var(--vscode-foreground); margin: 0 0 12px 0;">Current Graph Structure:</h4>
                    <pre style="color: var(--vscode-foreground); font-family: var(--vscode-editor-font-family); font-size: 12px; margin: 0; white-space: pre-wrap;">${JSON.stringify(currentGraphData, null, 2)}</pre>
                </div>
                <div style="margin-top: 16px; padding: 12px; background: var(--vscode-textBlockQuote-background); border-left: 4px solid var(--vscode-textBlockQuote-border); border-radius: 4px;">
                    <p style="color: var(--vscode-foreground); margin: 0; font-size: 13px;"><strong>Integration Instructions:</strong></p>
                    <p style="color: var(--vscode-foreground); margin: 8px 0 0 0; font-size: 12px;">
                        To complete the integration, you need to:
                        <br>1. Build your VShader project and copy the compiled assets to the extension's media folder
                        <br>2. Import and initialize your graph editor in this script
                        <br>3. Connect the editor's save/load functionality to VS Code's document system
                    </p>
                </div>
            </div>
        `;

        hideLoading();
    }

    function addSampleNode() {
        // Add a sample node to demonstrate functionality
        const newNode = {
            identifier: `node_${Date.now()}`,
            nodeType: 'output',
            position: { x: Math.random() * 400, y: Math.random() * 300 },
            parameters: {}
        };

        currentGraphData.nodes.push(newNode);
        updateGraphDisplay();
        markDocumentDirty();
    }

    function clearGraph() {
        currentGraphData = createEmptyGraph();
        updateGraphDisplay();
        markDocumentDirty();
    }

    function updateGraphDisplay() {
        const container = document.getElementById('graph-editor-container');
        if (container) {
            // Update the placeholder display
            const pre = container.querySelector('pre');
            if (pre) {
                pre.textContent = JSON.stringify(currentGraphData, null, 2);
            }
        }
    }

    function saveGraph() {
        try {
            vscode.postMessage({
                type: 'save',
                graph: currentGraphData
            });
        } catch (error) {
            showError(`Failed to save graph: ${error.message}`);
        }
    }

    function markDocumentDirty() {
        // In a real implementation, you would mark the document as dirty
        // This would trigger VS Code to show the unsaved changes indicator
    }

    function showLoading() {
        const root = document.getElementById('vshader-editor-root');
        root.innerHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <div>Loading VShader Graph Editor...</div>
            </div>
        `;
    }

    function hideLoading() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    function showError(message) {
        console.error('VShader Editor Error:', message);
        
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create new error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        document.body.appendChild(errorElement);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 5000);

        vscode.postMessage({
            type: 'error',
            message: message
        });
    }

    // Listen for messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'update':
                try {
                    const newGraphData = JSON.parse(message.text);
                    currentGraphData = newGraphData;
                    updateGraphDisplay();
                } catch (error) {
                    showError(`Failed to parse graph data: ${error.message}`);
                }
                break;
        }
    });

    // Prevent context menu in webview
    document.addEventListener('contextmenu', e => e.preventDefault());
    
})();

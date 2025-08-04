/**
 * Integration Helper for VShader Graph Editor
 * 
 * This file provides utilities to help integrate the existing VShader graph editor
 * with the VS Code extension webview environment.
 */

// Type definitions for the Graph structure
export interface Graph {
    version: number;
    includes: GLSLInclude[];
    nodes: Node[];
    connections: Connection[];
}

export interface GLSLInclude {
    name: string;
    content: string;
}

export interface Node {
    identifier: string;
    nodeType: string;
    position: Position;
    parameters: Record<string, any>;
}

export interface Position {
    x: number;
    y: number;
}

export interface Connection {
    from: {
        nodeId: string;
        pinName: string;
    };
    to: {
        nodeId: string;
        pinName: string;
    };
    type?: {
        primitive: string;
        dimensions: number;
    };
}

// VS Code API interface
export interface VSCodeAPI {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}

// Message types for communication between webview and extension
export interface WebviewMessage {
    type: 'save' | 'update' | 'ready' | 'error';
    graph?: Graph;
    text?: string;
    message?: string;
}

/**
 * Factory function to create a webview-compatible version of your graph editor
 * 
 * @param container - The DOM element to mount the editor to
 * @param vscode - The VS Code API object
 * @param initialGraph - Initial graph data to load
 * @returns Promise resolving to the editor API
 */
export async function createWebviewGraphEditor(
    container: HTMLElement,
    vscode: VSCodeAPI,
    initialGraph?: Graph
): Promise<WebviewGraphEditorAPI> {
    // This is where you would integrate your actual graph editor
    // Example implementation:
    
    /*
    // Import your editor modules
    import { createEditor } from '../path-to-your-compiled-editor';
    import { Compiler } from '../path-to-your-compiled-compiler';
    
    // Create compiler instance
    const compiler = new Compiler();
    
    // Create overlay context (you may need to adapt this for webview)
    const overlayContext = {
        // Your overlay context implementation
    };
    
    // Create the editor
    const editorAPI = await createEditor(
        compiler,
        container,
        overlayContext,
        (editorData) => {
            // Handle graph changes
            const graph = editorData.saveGraph();
            vscode.postMessage({
                type: 'save',
                graph: graph
            });
        }
    );
    
    // Load initial graph if provided
    if (initialGraph) {
        await editorAPI.loadGraph(JSON.stringify(initialGraph));
    }
    
    return {
        loadGraph: async (graph: Graph) => {
            await editorAPI.loadGraph(JSON.stringify(graph));
        },
        saveGraph: () => {
            return editorAPI.saveGraph();
        },
        destroy: () => {
            editorAPI.destroy();
        }
    };
    */
    
    // Placeholder implementation for now
    return createPlaceholderEditor(container, vscode, initialGraph);
}

export interface WebviewGraphEditorAPI {
    loadGraph(graph: Graph): Promise<void>;
    saveGraph(): Graph;
    destroy(): void;
}

/**
 * Placeholder editor implementation
 * Replace this with the actual createWebviewGraphEditor implementation above
 */
async function createPlaceholderEditor(
    container: HTMLElement,
    vscode: VSCodeAPI,
    initialGraph?: Graph
): Promise<WebviewGraphEditorAPI> {
    let currentGraph = initialGraph || {
        version: 1,
        includes: [],
        nodes: [],
        connections: []
    };

    // Create a simple placeholder UI
    const editorDiv = document.createElement('div');
    editorDiv.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        box-sizing: border-box;
    `;

    const title = document.createElement('h3');
    title.textContent = 'VShader Graph Editor (Placeholder)';
    title.style.cssText = `
        color: var(--vscode-foreground);
        margin: 0 0 16px 0;
        font-family: var(--vscode-font-family);
    `;

    const graphDisplay = document.createElement('pre');
    graphDisplay.style.cssText = `
        flex: 1;
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-radius: 4px;
        padding: 16px;
        overflow: auto;
        color: var(--vscode-foreground);
        font-family: var(--vscode-editor-font-family);
        font-size: 12px;
        margin: 0;
        white-space: pre-wrap;
    `;

    const updateDisplay = () => {
        graphDisplay.textContent = JSON.stringify(currentGraph, null, 2);
    };

    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 16px;
    `;

    const addNodeButton = document.createElement('button');
    addNodeButton.textContent = 'Add Sample Node';
    addNodeButton.style.cssText = `
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: 1px solid var(--vscode-button-border);
        padding: 6px 12px;
        border-radius: 3px;
        cursor: pointer;
        font-family: var(--vscode-font-family);
        font-size: 12px;
    `;
    addNodeButton.onclick = () => {
        const newNode: Node = {
            identifier: `node_${Date.now()}`,
            nodeType: 'output',
            position: { x: Math.random() * 400, y: Math.random() * 300 },
            parameters: {}
        };
        currentGraph.nodes.push(newNode);
        updateDisplay();
        
        vscode.postMessage({
            type: 'save',
            graph: currentGraph
        });
    };

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Graph';
    clearButton.style.cssText = addNodeButton.style.cssText;
    clearButton.onclick = () => {
        currentGraph = {
            version: 1,
            includes: [],
            nodes: [],
            connections: []
        };
        updateDisplay();
        
        vscode.postMessage({
            type: 'save',
            graph: currentGraph
        });
    };

    editorDiv.appendChild(title);
    editorDiv.appendChild(graphDisplay);
    editorDiv.appendChild(buttonsDiv);
    buttonsDiv.appendChild(addNodeButton);
    buttonsDiv.appendChild(clearButton);

    container.appendChild(editorDiv);
    updateDisplay();

    return {
        async loadGraph(graph: Graph) {
            currentGraph = graph;
            updateDisplay();
        },
        saveGraph() {
            return currentGraph;
        },
        destroy() {
            container.removeChild(editorDiv);
        }
    };
}

/**
 * Utility function to adapt your existing editor for webview use
 */
export function adaptEditorForWebview() {
    // Handle webview-specific considerations:
    
    // 1. Disable context menus that won't work in webview
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // 2. Handle focus properly
    window.addEventListener('focus', () => {
        // Notify VS Code that the webview has focus
    });
    
    // 3. Handle keyboard shortcuts that might conflict with VS Code
    document.addEventListener('keydown', (e) => {
        // Handle or prevent certain keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    // Prevent default save, let VS Code handle it
                    e.preventDefault();
                    break;
                case 'z':
                    // Handle undo/redo appropriately
                    break;
            }
        }
    });
}

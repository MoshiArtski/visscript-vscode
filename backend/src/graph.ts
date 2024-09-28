import {GraphNode, VariableNode, IfElseNode, SetVariableNode, GetVariableNode} from './node';
import { Edge } from './edge';
import { Port } from './port';

export class Graph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: Edge[] = [];
    private variables: Map<string, { value: any, hasDefault: boolean }> = new Map();
    silentErrors: boolean;

    constructor(silentErrors = false) {
        this.nodes = new Map();
        this.edges = [];
        this.variables = new Map();
        this.silentErrors = silentErrors;
    }

    // Add a node to the graph
    addNode(node: GraphNode) {
        this.nodes.set(node.id, node);
    }

    // Add an edge to the graph
    addEdge(edge: Edge) {
        this.edges.push(edge);
    }

    // Remove a node and all its connected edges
    deleteNode(nodeId: string) {
        this.nodes.delete(nodeId);
        this.edges = this.edges.filter(edge => 
            edge.inputNodeId !== nodeId && edge.outputNodeId !== nodeId
        );
    }

    // Remove an edge
    deleteEdge(inputNodeId: string, outputNodeId: string, inputPortId: string, outputPortId: string) {
        this.edges = this.edges.filter(edge =>
            !(edge.inputNodeId === inputNodeId &&
              edge.outputNodeId === outputNodeId &&
              edge.inputPortId === inputPortId &&
              edge.outputPortId === outputPortId)
        );
    }

    // Validate if all required ports are connected for all nodes
    validateRequiredPortsForAllNodes(): boolean {
        let allPortsConnected = true;

        this.nodes.forEach((node) => {
            const nodeValid = node.validateRequiredPorts();
            if (!nodeValid) {
                allPortsConnected = false;
                if (!this.silentErrors) {
                    console.error(`Node ${node.id} has unconnected required ports.`);
                }
            }
        });

        return allPortsConnected;
    }

    // Generate Python code for a given node
    generateNodeCode(node: GraphNode): string {
        const context = {
            getVariable: (name: string) => {
                const connectedNode = this.getConnectedNode(node, name);
                if (connectedNode) {
                    return this.generateNodeCode(connectedNode);
                }
                return this.getVariableName(name);
            },
            setVariable: (name: string, value: any) => this.setVariable(name, value),
        };

        return node.generatePythonCode(context);
    }

    getConnectedNode(node: GraphNode, portId: string): GraphNode | null {
        const edge = this.edges.find(e =>
            (e.inputNodeId === node.id && e.inputPortId === portId) ||
            (e.outputNodeId === node.id && e.outputPortId === portId)
        );
        if (edge) {
            const connectedNodeId = edge.inputNodeId === node.id ? edge.outputNodeId : edge.inputNodeId;
            return this.nodes.get(connectedNodeId) || null;
        }
        return null;
    }

    // Helper method to get the node connected to a specific port
    getConnectedNodeToPort(node: GraphNode, portId: string): GraphNode | null {
        const edge = this.edges.find(edge =>
            edge.inputNodeId === node.id && edge.inputPortId === portId
        );
        if (edge) {
            return this.nodes.get(edge.outputNodeId) || null;
        }
        return null;
    }

    // Get a node by its ID
    getNodeById(id: string): GraphNode | undefined {
        return this.nodes.get(id);
    }

    // Check if a variable exists in the graph
    hasVariable(name: string): boolean {
        return this.variables.has(name);
    }

    // Add or update a variable in the graph
    setVariable(name: string, value: any) {
        if (this.variables.has(name)) {
            const variable = this.variables.get(name);
            if (variable) {
                variable.value = value;
            }
        } else {
            this.variables.set(name, { value, hasDefault: true });
        }
    }


    // Add a variable with an optional default value
    addVariable(name: string, value: any, hasDefault: boolean = false) {
        this.variables.set(name, { value, hasDefault });
    }

    // Delete a variable from the graph
    deleteVariable(name: string) {
        this.variables.delete(name);
    }

    // Get a variable's name for code generation
    getVariableName(name: string): string {
        return name;
    }

    // Generate Python code for variable declarations
    generateVariableDeclarations(): string {
        let variableCode = '';

        this.variables.forEach((variable, name) => {
            if (variable.hasDefault) {
                variableCode += `${name} = ${variable.value}\n`;
            }
        });

        return variableCode;
    }

    // Generate full Python code starting from a specific node
    // generateFullPythonCodeFromNode(startNodeId: string): string {
    //     let code = '';
    //
    //     // Generate variable declarations
    //     for (const [name, { value, hasDefault }] of this.variables.entries()) {
    //         if (hasDefault) {
    //             code += `${name} = ${value}\n`;
    //         }
    //     }
    //
    //     if (code) {
    //         code += '\n';  // Add an extra newline after variable declarations
    //     }
    //
    //     // Generate code for each node in topological order
    //     const sortedNodes = this.topologicalSort(startNodeId);
    //     const activeNodes = new Set<string>([startNodeId]);
    //     this.activateControlFlowNodes(startNodeId, activeNodes);
    //
    //     for (const nodeId of sortedNodes) {
    //         if (!activeNodes.has(nodeId)) continue;
    //
    //         const node = this.nodes.get(nodeId);
    //         if (node && !(node instanceof VariableNode)) {
    //             if (node instanceof IfElseNode) {
    //                 const condition = this.getConnectedNodeOutput(node, 'condition');
    //                 code += `if ${condition}:\n`;
    //                 code += this.generateControlFlowCode(node, 'if_true', 1, activeNodes);
    //                 code += 'else:\n';
    //                 code += this.generateControlFlowCode(node, 'if_false', 1, activeNodes);
    //             } else if (node instanceof SetVariableNode) {
    //                 const nodeCode = this.generateNodeCode(node);
    //                 code += nodeCode + '\n';
    //             } else {
    //                 const nodeCode = this.generateNodeCode(node);
    //                 code += this.indentCode(nodeCode) + '\n';
    //             }
    //         }
    //     }
    //
    //     return code.trim();
    // }

    indentCode(code: string, indent: number = 1): string {
        const indentation = '    '.repeat(indent);
        return code.split('\n').map(line => indentation + line).join('\n');
    }

    private formatIfElseCode(code: string): string {
        const lines = code.split('\n');
        return lines.map((line, index) => {
            if (index === 0 || line.trim().startsWith('else:')) {
                return line;
            } else {
                return '    ' + line;
            }
        }).join('\n');
    }

    topologicalSort(startNodeId: string): string[] {
        const visited = new Set<string>();
        const stack: string[] = [];

        const dfs = (nodeId: string) => {
            visited.add(nodeId);
            const outgoingEdges = this.edges.filter(edge => edge.inputNodeId === nodeId);
            for (const edge of outgoingEdges) {
                if (!visited.has(edge.outputNodeId)) {
                    dfs(edge.outputNodeId);
                }
            }
            stack.push(nodeId);
        };

        dfs(startNodeId);
        return stack.reverse();
    }

    // Method to connect nodes
    connectNodes(fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) {
        console.log(`Attempting to connect: ${fromNodeId}:${fromPortId} -> ${toNodeId}:${toPortId}`);

        const fromNode = this.getNodeById(fromNodeId);
        const toNode = this.getNodeById(toNodeId);

        if (!fromNode || !toNode) {
            console.error(`Invalid node IDs: ${fromNodeId}, ${toNodeId}`);
            throw new Error(`Invalid node IDs: ${fromNodeId}, ${toNodeId}`);
        }

        console.log('From node:', fromNode);
        console.log('To node:', toNode);

        let fromPort: Port | null = null;
        let toPort: Port | null = null;

        // Check output ports first, then input ports
        fromPort = fromNode.getOutputPort(fromPortId) || fromNode.getInputPort(fromPortId);
        toPort = toNode.getInputPort(toPortId) || toNode.getOutputPort(toPortId);

        console.log('From port:', fromPort);
        console.log('To port:', toPort);

        if (!fromPort || !toPort) {
            console.error(`Invalid port IDs: ${fromPortId}, ${toPortId}`);
            console.error('Available ports for fromNode:', fromNode.inputPorts, fromNode.outputPorts);
            console.error('Available ports for toNode:', toNode.inputPorts, toNode.outputPorts);
            throw new Error(`Invalid port IDs: ${fromPortId}, ${toPortId}`);
        }

        const edge = new Edge(fromNodeId, toNodeId, fromPortId, toPortId);
        this.addEdge(edge);

        fromPort.connect(toPort);
        toPort.connect(fromPort);
    }

    // Method to detect cycles
    detectCycle(startNodeId: string, targetNodeId: string): boolean {
        const visited = new Set<string>();
        const stack = [startNodeId];

        while (stack.length > 0) {
            const currentNodeId = stack.pop();
            if (currentNodeId === targetNodeId) {
                return true;
            }
            if (currentNodeId && !visited.has(currentNodeId)) {
                visited.add(currentNodeId);
                const currentNode = this.nodes.get(currentNodeId);
                if (currentNode) {
                    const outgoingEdges = this.edges.filter(edge => edge.inputNodeId === currentNodeId);
                    for (const edge of outgoingEdges) {
                        stack.push(edge.outputNodeId);
                    }
                }
            }
        }

        return false;
    }

    generateFullPythonCodeFromNode(startNodeId: string): string {
        let code = '';
        const generatedNodes = new Set<string>();
        const importStatements = new Set<string>();

        // Generate variable declarations
        for (const [name, { value, hasDefault }] of this.variables.entries()) {
            if (hasDefault) {
                code += `${name} = ${value}\n`;
            }
        }

        if (code) {
            code += '\n';  // Add an extra newline after variable declarations
        }

        // Generate code for each node in topological order
        const sortedNodes = this.topologicalSort(startNodeId);
        const activeNodes = new Set<string>([startNodeId]);
        this.activateControlFlowNodes(startNodeId, activeNodes);

        for (const nodeId of sortedNodes) {
            if (!activeNodes.has(nodeId) || generatedNodes.has(nodeId)) continue;

            const node = this.nodes.get(nodeId);
            if (node && !(node instanceof VariableNode)) {
                // Collect import statements
                node.imports.forEach(importStatement => importStatements.add(importStatement));

                if (node instanceof IfElseNode) {
                    const condition = this.getConnectedNodeOutput(node, 'condition');
                    code += `if ${condition}:\n`;
                    code += this.generateControlFlowCode(node, 'if_true', 1, activeNodes, generatedNodes);
                    code += 'else:\n';
                    code += this.generateControlFlowCode(node, 'if_false', 1, activeNodes, generatedNodes);
                } else if (node instanceof SetVariableNode) {
                    const nodeCode = this.generateNodeCode(node);
                    code += nodeCode + '\n';
                } else {
                    const nodeCode = this.generateNodeCode(node);
                    code += this.indentCode(nodeCode) + '\n';
                }

                generatedNodes.add(nodeId);  // Mark this node as generated
            }
        }

        // Add import statements at the top of the code
        const importCode = Array.from(importStatements).join('\n');
        if (importCode) {
            code = importCode + '\n\n' + code;
        }

        return code.trim();
    }

    generateControlFlowCode(node: IfElseNode, portId: string, indent: number, activeNodes: Set<string>, generatedNodes: Set<string>): string {
        const outputPort = node.outputPorts.find(port => port.id === portId);
        if (outputPort?.portType === 'control') {
            const connectedNode = this.getConnectedNode(node, portId);
            if (connectedNode && !generatedNodes.has(connectedNode.id)) {
                activeNodes.add(connectedNode.id);
                const nodeCode = this.generateNodeCode(connectedNode);
                generatedNodes.add(connectedNode.id);  // Mark this node as generated
                return this.indentCode(nodeCode, indent) + '\n';
            }
        }
        return '';
    }


    activateControlFlowNodes(nodeId: string, activeNodes: Set<string>) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        for (const port of node.outputPorts) {
            if (port.portType === 'control') {
                const connectedNode = this.getConnectedNode(node, port.id);
                if (connectedNode && !activeNodes.has(connectedNode.id)) {
                    activeNodes.add(connectedNode.id);
                    this.activateControlFlowNodes(connectedNode.id, activeNodes);
                }
            }
        }
    }

    // ... other methods ...

    getConnectedNodeOutput(node: GraphNode, portId: string): string {
        const connectedEdge = this.edges.find(edge => 
            edge.outputNodeId === node.id && edge.outputPortId === portId);
        
        if (connectedEdge) {
            const inputNode = this.getNodeById(connectedEdge.inputNodeId);
            if (inputNode) {
                if (inputNode instanceof GetVariableNode) {
                    return inputNode.variableName;
                } else {
                    return `(${this.generateNodeCode(inputNode).trim()})`;
                }
            }
        }
        return '';
    }
}
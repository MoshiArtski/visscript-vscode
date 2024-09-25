import { Node } from './node';
import { Edge } from './edge';

export class Graph {
    nodes: Map<string, Node>;
    edges: Edge[];
    variables: Map<string, any>;  // Map to keep track of variables (names and values)

    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.variables = new Map();
    }

    // Add a node to the graph
    addNode(node: Node) {
        this.nodes.set(node.id, node);
    }

    // Add an edge to the graph
    addEdge(edge: Edge) {
        this.edges.push(edge);
    }

    // Set a variable's value in the graph
    setVariable(name: string, value: any) {
        this.variables.set(name, value);  // Store the variable's value by its name
    }

    // Get a variable's name (for code generation)
    getVariableName(name: string): string {
        return name;  // Return the variable name for use in code generation
    }

    // Generate Python code for variable declarations at the top
    generateVariableDeclarations(): string {
        let variableCode = '';

        // Generate code to declare each variable and initialize with its value
        this.variables.forEach((value, name) => {
            if (value !== null && value !== undefined) {  // Skip null or undefined variables
                variableCode += `${name} = ${value}\n`;  // Declare and initialize variables at the top
            }
        });

        return variableCode;
    }

    // Generate Python code based on the nodes in the graph
    generatePythonCode(): string {
        let code = '';

        // First, generate variable declarations at the top
        code += this.generateVariableDeclarations();

        // Generate code for each node in the graph
        this.nodes.forEach(node => {
            const nodeCode = node.generatePythonCode({
                getVariable: (name: string) => this.getVariableName(name),  // Fetch variable name for code generation
                setVariable: (name: string, value: any) => this.setVariable(name, value),
                controlIn: 'True',   // Add control flow (optional, if needed)
                controlOut: 'True',  // Add control flow (optional, if needed)
            });
            code += nodeCode + '\n';
        });

        return code.trim(); // Return the combined code
    }
}

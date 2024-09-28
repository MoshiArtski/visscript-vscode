import { Port } from './port';
import { Graph } from './graph';  // Import Graph

type OptionType = 'string' | 'dropdown' | 'boolean' | 'number';

interface NodeOption {
    name: string;
    type: OptionType;
    value: any;
    availableIf?: (options: Record<string, any>) => boolean;
    choices?: string[];  // For dropdown type
}

export class GraphNode {
    id: string;
    name: string;
    description: string;  // Description of the node
    inputPorts: Port[];
    outputPorts: Port[];
    codeTemplate: string;
    imports: string[];
    meta: Record<string, any>;
    options: Record<string, NodeOption>;

    constructor(id: string, name: string, description: string, codeTemplate: string, imports: string | string[] = [], meta: Record<string, any> = {}, options: Record<string, NodeOption> = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.inputPorts = [];
        this.outputPorts = [];
        this.codeTemplate = codeTemplate;
        this.imports = Array.isArray(imports) ? imports : [imports];
        this.meta = meta;
        this.options = options;
    }

    // Add an input port with an optional description
    addInputPort(id: string, portType: 'data' | 'control', dataType: string | null = null, description: string = '', meta: Record<string, any> = {}): Port {
        const port = new Port(id, 'input', portType, this, dataType, description, false, meta);
        this.inputPorts.push(port);
        return port;
    }

    // Add an output port with an optional description
    addOutputPort(id: string, portType: 'data' | 'control', dataType: string | null = null, description: string = '', meta: Record<string, any> = {}): Port {
        const port = new Port(id, 'output', portType, this, dataType, description, false, meta);
        this.outputPorts.push(port);
        return port;
    }

    // Get input port by ID
    getInputPort(id: string): Port | null {
        return this.inputPorts.find(port => port.id === id) || null;
    }

    // Get output port by ID
    getOutputPort(id: string): Port | null {
        return this.outputPorts.find(port => port.id === id) || null;
    }

    // Validate required ports are connected
    validateRequiredPorts(): boolean {
        let allRequiredPortsConnected = true;

        this.inputPorts.forEach((port) => {
            // Only check required ports that are visible
            if (port.required && !port.hidden && !port.connectedPort) {
                console.error(`Port ${port.id} on node ${this.name} is required but not connected.`);
                allRequiredPortsConnected = false;
            }
        });

        return allRequiredPortsConnected;
    }

    // Generate Python code based on the node's code template
    generatePythonCode(values: Record<string, any>): string {
        try {
            return this.codeTemplate.replace(/\{(\w+)\}/g, (_, key) => values[key] || '');
        } catch (error) {
            const err = error as Error;  // Cast error to Error type
            console.error(`Error generating Python code for node ${this.id}: ${err.message}`);
            throw err;
        }
    }

    updateNode(updates: Partial<GraphNode>): void {
        Object.assign(this, updates);
        this.onUpdate();
    }

    onUpdate(): void {
        // This method can be overridden in derived classes
        // to perform custom logic when the node is updated
    }

    setOption(name: string, value: any): void {
        if (this.options[name]) {
            this.options[name].value = value;
            this.onUpdate();
        }
    }

    getOption(name: string): any {
        return this.options[name]?.value;
    }

    getAvailableOptions(): Record<string, NodeOption> {
        const availableOptions: Record<string, NodeOption> = {};
        for (const [name, option] of Object.entries(this.options)) {
            if (!option.availableIf || option.availableIf(this.getOptionsValues())) {
                availableOptions[name] = option;
            }
        }
        return availableOptions;
    }

    private getOptionsValues(): Record<string, any> {
        const values: Record<string, any> = {};
        for (const [name, option] of Object.entries(this.options)) {
            values[name] = option.value;
        }
        return values;
    }
}

// Usage of empty array in constructors
export class VariableNode extends GraphNode {
    constructor(id: string, variableName: string, value: any) {
        super(id, 'Variable', `{variableName} = {value}`, '');  // Pass empty string instead of array
    }
}

export class SetVariableNode extends GraphNode {
    variableName: string;

    constructor(id: string, variableName: string, graph: Graph) {
        super(id, 'SetVariable', '', '');
        this.variableName = variableName;
        this.addInputPort('input', 'data', 'any');
        this.addInputPort('controlIn', 'control', null);
        this.addInputPort('controlOut', 'control', null);
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const inputValue = context.getVariable('input');
        return `${this.variableName} = ${inputValue}`;
    }
}

export class GetVariableNode extends GraphNode {
    variableName: string;  // Define variableName as a property

    constructor(id: string, variableName: string, graph: Graph) {  // Use imported Graph
        // Check if the variable exists in the graph
        if (!graph.hasVariable(variableName)) {
            throw new Error(`Variable "${variableName}" does not exist in the graph.`);
        }
        super(id, 'GetVariable', '', '');  // Pass empty string instead of array
        this.variableName = variableName;  // Assign variableName in the constructor

        // Data output port
        this.addOutputPort('output', 'data', 'any');
    }

    // Generate Python code for GetVariableNode
    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        // Get the variable value from context
        return this.variableName;
    }
}

export class ArithmeticNode extends GraphNode {
    operator: string;

    constructor(id: string, name: string, operator: string) {
        super(id, name, '', '');
        this.operator = operator;
        this.addInputPort('left', 'data', 'number');
        this.addInputPort('right', 'data', 'number');
        this.addOutputPort('result', 'data', 'number');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const left = context.getVariable('left');
        const right = context.getVariable('right');
        return `(${left} ${this.operator} ${right})`;
    }
}

export class AdditionNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Addition', '+');
    }
}

export class SubtractionNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Subtraction', '-');
    }
}

export class MultiplicationNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Multiplication', '*');
    }
}

export class DivisionNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Division', '/');
    }
}

export class ModulusNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Modulus', '%');
    }
}

export class ExponentiationNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Exponentiation', '**');
    }
}

export class FloorDivisionNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Floor Division', '//');
    }
}

export class IfElseNode extends GraphNode {
    constructor(id: string) {
        super(id, 'IfElse', '', '');
        this.addInputPort('controlIn', 'control', null);
        this.addInputPort('condition', 'data', 'boolean');
        this.addOutputPort('if_true', 'control', null);
        this.addOutputPort('if_false', 'control', null);
    }

    generateNodeCode(graph: Graph): string {
        const condition = graph.getConnectedNodeOutput(this, 'condition');
        const ifTrueNode = graph.getConnectedNode(this, 'if_true');
        const ifFalseNode = graph.getConnectedNode(this, 'if_false');

        let code = `if (${condition}):\n`;

        // if (ifTrueNode) {
        //     const trueCode = graph.generateNodeCode(ifTrueNode);
        //     code += graph.indentCode(trueCode, 1);
        // }
        //
        // if (ifFalseNode) {
        //     code += `else:\n`;
        //     const falseCode = graph.generateNodeCode(ifFalseNode);
        //     code += graph.indentCode(falseCode, 1);
        // }

        return code;
    }
}

// Base class for comparison operators
export class ComparisonNode extends GraphNode {
    operator: string;

    constructor(id: string, name: string, operator: string) {
        super(id, name, '', '');
        this.operator = operator;
        this.addInputPort('left', 'data', 'any');
        this.addInputPort('right', 'data', 'any');
        this.addOutputPort('result', 'data', 'boolean');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const left = context.getVariable('left');
        const right = context.getVariable('right');
        return `(${left} ${this.operator} ${right})`;
    }
}

// Comparison operator nodes
export class EqualNode extends ComparisonNode {
    constructor(id: string) {
        super(id, 'Equal', '==');
    }
}

export class NotEqualNode extends ComparisonNode {
    constructor(id: string) {
        super(id, 'NotEqual', '!=');
    }
}

export class GreaterThanNode extends ComparisonNode {
    constructor(id: string) {
        super(id, 'GreaterThan', '>');
    }
}

export class LessThanNode extends ComparisonNode {
    constructor(id: string) {
        super(id, 'LessThan', '<');
    }
}

export class GreaterThanOrEqualNode extends ComparisonNode {
    constructor(id: string) {
        super(id, 'GreaterThanOrEqual', '>=');
    }
}

export class LessThanOrEqualNode extends ComparisonNode {
    constructor(id: string) {
        super(id, 'LessThanOrEqual', '<=');
    }
}

// Base class for logical operators
export class LogicalNode extends GraphNode {
    operator: string;

    constructor(id: string, name: string, operator: string) {
        super(id, name, '', '');
        this.operator = operator;
        this.addInputPort('left', 'data', 'boolean');
        this.addInputPort('right', 'data', 'boolean');
        this.addOutputPort('result', 'data', 'boolean');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const left = context.getVariable('left');
        const right = context.getVariable('right');
        return `(${left} ${this.operator} ${right})`;
    }
}

// Logical operator nodes
export class AndNode extends LogicalNode {
    constructor(id: string) {
        super(id, 'And', 'and');
    }
}

export class OrNode extends LogicalNode {
    constructor(id: string) {
        super(id, 'Or', 'or');
    }
}

export class NotNode extends GraphNode {
    constructor(id: string) {
        super(id, 'Not', '', '');
        this.addInputPort('input', 'data', 'boolean');
        this.addOutputPort('result', 'data', 'boolean');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const input = context.getVariable('input');
        return `(not ${input})`;
    }
}

export class VectorStoreNode extends GraphNode {
    constructor(id: string) {
        super(id, 'VectorStore', 'Vector store for document embeddings', '', ['from langchain.vectorstores import Pinecone, FAISS, Chroma']);

        this.options = {
            storeType: {
                name: 'Store Type',
                type: 'dropdown',
                value: 'pinecone',
                choices: ['pinecone', 'faiss', 'chroma']
            },
            useCache: {
                name: 'Use Cache',
                type: 'boolean',
                value: false
            },
            cacheType: {
                name: 'Cache Type',
                type: 'dropdown',
                value: 'in_memory',
                choices: ['in_memory', 'local_file'],
                availableIf: (options) => options.useCache
            },
            indexName: {
                name: 'Index Name',
                type: 'string',
                value: 'my_index'
            }
        };

        this.addInputPort('documents', 'data', 'Document[]');
        this.addInputPort('embeddings', 'data', 'Embeddings');
        this.addOutputPort('vectorStore', 'data', 'VectorStore');
    }

    onUpdate(): void {
        const storeType = this.getOption('storeType');
        const useCache = this.getOption('useCache');
        const cacheType = this.getOption('cacheType');
        const indexName = this.getOption('indexName');

        let codeTemplate = `
from langchain.vectorstores import ${storeType.charAt(0).toUpperCase() + storeType.slice(1)}
`;

        if (useCache) {
            codeTemplate += `
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import ${cacheType === 'local_file' ? 'LocalFileStore' : 'InMemoryByteStore'}

store = ${cacheType === 'local_file' ? 'LocalFileStore("./cache/")' : 'InMemoryByteStore()'}
cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embedder={embeddings},
    document_embedding_cache=store,
    namespace="${indexName}_namespace"
)
`;
        }

        codeTemplate += `
vector_store = ${storeType.charAt(0).toUpperCase() + storeType.slice(1)}.from_documents(
    documents={documents},
    embedding=${useCache ? 'cached_embedder' : '{embeddings}'},
    index_name="${indexName}"
)
`;

        this.codeTemplate = codeTemplate;
    }

    generatePythonCode(values: Record<string, any>): string {
        try {
            let code = this.codeTemplate;
            for (const [key, value] of Object.entries(values)) {
                code = code.replace(new RegExp(`{${key}}`, 'g'), String(value));
            }
            for (const [name, option] of Object.entries(this.options)) {
                code = code.replace(new RegExp(`{${name}}`, 'g'), String(option.value));
            }
            return code;
        } catch (error) {
            const err = error as Error;
            console.error(`Error generating Python code for node ${this.id}: ${err.message}`);
            throw err;
        }
    }
}
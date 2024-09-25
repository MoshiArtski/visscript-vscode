import { Port } from './port';

export class Node {
    id: string;
    name: string;
    inputPorts: Port[];
    outputPorts: Port[];
    codeTemplate: string; // Python code template

    constructor(id: string, name: string, codeTemplate: string) {
        this.id = id;
        this.name = name;
        this.inputPorts = [];
        this.outputPorts = [];
        this.codeTemplate = codeTemplate;
    }

    addInputPort(id: string, portType: 'data' | 'control', dataType: string | null) {
        this.inputPorts.push(new Port(id, 'input', portType, dataType));
    }

    addOutputPort(id: string, portType: 'data' | 'control', dataType: string | null) {
        this.outputPorts.push(new Port(id, 'output', portType, dataType));
    }

    generatePythonCode(values: Record<string, any>): string {
        return this.codeTemplate.replace(/\{(\w+)\}/g, (_, key) => values[key]);
    }
}

export class VariableNode extends Node {
    variableName: string;
    value: any;

    constructor(id: string, variableName: string, value: any) {
        super(id, 'Variable', `{variableName} = {value}`);
        this.variableName = variableName;
        this.value = value;

        // Specify the dataType as 'any' for the output port
        this.addOutputPort(variableName, 'data', 'any');
    }

    generatePythonCode(context: { setVariable: (name: string, value: any) => void }): string {
        // Store the variable in the context, but don't replace its name
        context.setVariable(this.variableName, this.value);
        return this.codeTemplate
            .replace('{variableName}', this.variableName)  // Retain the variable name
            .replace('{value}', this.value.toString());
    }
}



export class GetVariableNode extends Node {
    variableName: string;

    constructor(id: string, variableName: string) {
        super(id, 'GetVariable', '');  // No code template since it should not generate code
        this.variableName = variableName;

        // Specify the dataType as 'any' for the output port
        this.addOutputPort('output', 'data', 'any');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        // Return nothing because GetVariableNode should not generate code directly
        return '';
    }

    // Method to provide the variable name for other nodes to use
    getVariableName(): string {
        return this.variableName;
    }
}


export class SetVariableNode extends Node {
    variableName: string;

    constructor(id: string, variableName: string) {
        super(id, 'SetVariable', '{variable} = {input}');
        this.variableName = variableName;

        // Control flow ports
        this.addInputPort('controlIn', 'control', null);
        this.addOutputPort('controlOut', 'control', null);

        // Data port for input (to receive the result of an operation)
        this.addInputPort('input', 'data', 'any');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        // Fetch the input from connected nodes
        const input = context.getVariable('input');


        return '';
    }
}

export class IfElseNode extends Node {
    constructor(id: string, name: string) {
        // Add the codeTemplate argument when calling super
        const codeTemplate = `if {condition}:\n    {if_code}\nelse:\n    {else_code}`;
        super(id, name, codeTemplate);

        // Add ports for condition and the control flow
        this.addInputPort('condition', 'data', 'boolean'); // Input for condition (e.g., result from logical node)
        this.addOutputPort('if_code', 'control',null);          // Output for if branch
        this.addOutputPort('else_code', 'control',null);         // Output for else branch
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const condition = context.getVariable('condition');  // The condition for if-else (e.g., a > b or a and b)
        const ifCode = context.getVariable('if_code');       // The code to execute if the condition is true
        const elseCode = context.getVariable('else_code');   // The code to execute if the condition is false

        // Replace placeholders in the codeTemplate
        return this.codeTemplate
            .replace('{condition}', condition)
            .replace('{if_code}', ifCode || 'pass')
            .replace('{else_code}', elseCode || 'pass');
    }
}
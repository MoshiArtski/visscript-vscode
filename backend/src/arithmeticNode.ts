import { Node } from './node';

export class ArithmeticNode extends Node {
    operation: string;

    constructor(id: string, name: string, operation: string) {
        super(id, name, `{output} = {a} ${operation} {b}`);
        this.operation = operation;

        // Add data ports for input (numbers) and output (result)
        this.addInputPort('a', 'data', 'number');
        this.addInputPort('b', 'data', 'number');
        this.addOutputPort('output', 'data', 'number');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const a = context.getVariable('a');  // Expect variable name 'a'
        const b = context.getVariable('b');  // Expect variable name 'b'
        const output = 'result';

        // Generate the code with the variable names
        return this.codeTemplate
            .replace('{a}', a)
            .replace('{b}', b)
            .replace('{output}', output);
    }
}

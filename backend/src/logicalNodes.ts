import { Node } from './node';

class LogicalOperationNode extends Node {
    operation: string;

    constructor(id: string, name: string, operation: string) {
        super(id, name, `{output} = {a} ${operation} {b}`);
        this.operation = operation;

        // Add input ports for logical operation (a and b for binary ops, a only for unary ops)
        this.addInputPort('a', 'data', 'boolean');
        if (operation !== 'not') {  // Only 'not' is a unary operation, others need 'b'
            this.addInputPort('b', 'data', 'boolean');
        }

        // Add output port for the result
        this.addOutputPort('output', 'data', 'boolean');
    }

    generatePythonCode(context: { getVariable: (name: string) => any }): string {
        const a = context.getVariable('a');  // Get the variable name or value for 'a'
        let b = '';
        const output = 'result';  // Assume result is the output variable

        // For binary operations, get the value for 'b'
        if (this.operation !== 'not') {
            b = context.getVariable('b');
        }

        // For unary operations like 'not', only include 'a'
        if (this.operation === 'not') {
            return `${output} = not ${a}`;
        } else {
            return `${output} = ${a} ${this.operation} ${b}`;  // Example: result = a and b, result = a or b
        }
    }
}

// AND Node
export class AndNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'AndNode', 'and');
    }
}

// OR Node
export class OrNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'OrNode', 'or');
    }
}

// XOR Node
export class XorNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'XorNode', '^');
    }
}

// NOT Node
export class NotNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'NotNode', 'not');
    }
}

// Greater Than Node
export class GreaterThanNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'GreaterThanNode', '>');
    }
}

// Less Than Node
export class LessThanNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'LessThanNode', '<');
    }
}

// Greater Than or Equal To Node
export class GreaterThanOrEqualToNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'GreaterThanOrEqualToNode', '>=');
    }
}

// Less Than or Equal To Node
export class LessThanOrEqualToNode extends LogicalOperationNode {
    constructor(id: string) {
        super(id, 'LessThanOrEqualToNode', '<=');
    }
}

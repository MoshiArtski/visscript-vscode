import { ArithmeticNode } from './arithmeticNode';

export class MultiplyNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Multiply', '*');

        // Add data ports for input (numbers) and output (result)
        this.addInputPort('a', 'data', 'number');
        this.addInputPort('b', 'data', 'number');
        this.addOutputPort('output', 'data', 'number');
    }
}


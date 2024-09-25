import { ArithmeticNode } from './arithmeticNode';

export class AddNode extends ArithmeticNode {
    constructor(id: string) {
        super(id, 'Add', '+');

        // Add data ports for input (numbers) and output (result)
        this.addInputPort('a', 'data', 'number');
        this.addInputPort('b', 'data', 'number');
        this.addOutputPort('output', 'data', 'number');
    }
}

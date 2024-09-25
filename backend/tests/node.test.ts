import { VariableNode } from '../src/node';


test('VariableNode generates correct Python code', () => {
    const varNode = new VariableNode('1', 'x', 10);
    const code = varNode.generatePythonCode();

    expect(code).toBe('x = 10');
});

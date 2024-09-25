import { Graph } from '../src/graph';
import { GetVariableNode, SetVariableNode } from '../src/node';
import { AndNode, OrNode, XorNode, NotNode, GreaterThanNode, LessThanNode, GreaterThanOrEqualToNode, LessThanOrEqualToNode } from '../src/logicalNodes';
import { Edge } from '../src/edge';

// Helper function to run tests for binary logical nodes
const runBinaryLogicTest = (NodeClass: any, operation: string, a: any, b: any, expected: string) => {
    const graph = new Graph();

    // Create GetVariableNodes for 'a' and 'b'
    const getVarNodeA = new GetVariableNode('1', 'a');
    const getVarNodeB = new GetVariableNode('2', 'b');
    graph.addNode(getVarNodeA);
    graph.addNode(getVarNodeB);

    // Create a logical node (e.g., AndNode, OrNode)
    const logicalNode = new NodeClass('3');
    graph.addNode(logicalNode);

    // Set the result of the logical operation to a new variable 'result'
    const setResultNode = new SetVariableNode('4', 'result');
    graph.addNode(setResultNode);

    // Link the GetVariableNodes to the logical node
    graph.addEdge(new Edge(getVarNodeA.id, 'output', logicalNode.id, 'a'));
    graph.addEdge(new Edge(getVarNodeB.id, 'output', logicalNode.id, 'b'));

    // Link the output of the logical node to SetVariableNode 'result'
    graph.addEdge(new Edge(logicalNode.id, 'output', setResultNode.id, 'input'));

    // Generate Python code
    const code = graph.generatePythonCode();

    // Check the generated Python code
    expect(code).toContain(`result = a ${operation} b`);
};

// Helper function to run tests for unary logical nodes (NOT)
const runUnaryLogicTest = (NodeClass: any, operation: string, a: any, expected: string) => {
    const graph = new Graph();

    // Create GetVariableNode for 'a'
    const getVarNodeA = new GetVariableNode('1', 'a');
    graph.addNode(getVarNodeA);

    // Create a logical node (e.g., NotNode)
    const logicalNode = new NodeClass('2');
    graph.addNode(logicalNode);

    // Set the result of the logical operation to a new variable 'result'
    const setResultNode = new SetVariableNode('3', 'result');
    graph.addNode(setResultNode);

    // Link the GetVariableNode to the logical node
    graph.addEdge(new Edge(getVarNodeA.id, 'output', logicalNode.id, 'a'));

    // Link the output of the logical node to SetVariableNode 'result'
    graph.addEdge(new Edge(logicalNode.id, 'output', setResultNode.id, 'input'));

    // Generate Python code
    const code = graph.generatePythonCode();

    // Check the generated Python code
    expect(code).toContain(`result = ${operation} a`);
};

// Test for binary logical nodes (AND, OR, XOR, comparison)
test('Graph correctly handles AndNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(AndNode, 'and', true, false, 'result = a and b');
});

test('Graph correctly handles OrNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(OrNode, 'or', true, false, 'result = a or b');
});

test('Graph correctly handles XorNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(XorNode, '^', true, false, 'result = a ^ b');
});

test('Graph correctly handles GreaterThanNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(GreaterThanNode, '>', 5, 3, 'result = a > b');
});

test('Graph correctly handles LessThanNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(LessThanNode, '<', 3, 5, 'result = a < b');
});

test('Graph correctly handles GreaterThanOrEqualToNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(GreaterThanOrEqualToNode, '>=', 5, 5, 'result = a >= b');
});

test('Graph correctly handles LessThanOrEqualToNode and assigns result to SetVariableNode', () => {
    runBinaryLogicTest(LessThanOrEqualToNode, '<=', 5, 5, 'result = a <= b');
});

// Test for unary logical node (NOT)
test('Graph correctly handles NotNode and assigns result to SetVariableNode', () => {
    runUnaryLogicTest(NotNode, 'not', true, 'result = not a');
});

import { Graph } from '../src/graph';
import { GetVariableNode, SetVariableNode, IfElseNode } from '../src/node';
import { AndNode, GreaterThanNode } from '../src/logicalNodes';
import { Edge } from '../src/edge';

test('Graph handles IfElseNode with AndNode as condition and assigns correct result', () => {
    const graph = new Graph();

    // Set variables 'a' and 'b'
    graph.setVariable('a', true);
    graph.setVariable('b', false);

    // Create VariableNodes for 'a' and 'b'
    const getVarNodeA = new GetVariableNode('1', 'a');
    const getVarNodeB = new GetVariableNode('2', 'b');
    graph.addNode(getVarNodeA);
    graph.addNode(getVarNodeB);

    // Create an AndNode for the condition (a and b)
    const andNode = new AndNode('3');
    graph.addNode(andNode);

    // Create IfElseNode with the logical condition
    const ifElseNode = new IfElseNode('4', 'If a and b');
    graph.addNode(ifElseNode);

    // Create SetVariableNodes for the If and Else branches
    const setResultNodeIf = new SetVariableNode('5', 'result_if_true');
    const setResultNodeElse = new SetVariableNode('6', 'result_if_false');
    graph.addNode(setResultNodeIf);
    graph.addNode(setResultNodeElse);

    // Connect 'a' and 'b' to the AndNode
    graph.addEdge(new Edge(getVarNodeA.id, 'output', andNode.id, 'a'));
    graph.addEdge(new Edge(getVarNodeB.id, 'output', andNode.id, 'b'));

    // Connect AndNode output to IfElseNode condition
    graph.addEdge(new Edge(andNode.id, 'output', ifElseNode.id, 'condition'));

    // Connect IfElseNode branches to SetVariableNodes
    graph.addEdge(new Edge(ifElseNode.id, 'if_code', setResultNodeIf.id, 'input'));
    graph.addEdge(new Edge(ifElseNode.id, 'else_code', setResultNodeElse.id, 'input'));

    // Generate Python code
    const code = graph.generatePythonCode();

    // Check the generated Python code for the IfElse structure and logical condition
    expect(code).toContain('if a and b:');
    expect(code).toContain('result_if_true = ...');  // Fill in the expected action for if true
    expect(code).toContain('else:');
    expect(code).toContain('result_if_false = ...');  // Fill in the expected action for else
});

test('Graph handles IfElseNode with GreaterThanNode as condition and assigns correct result', () => {
    const graph = new Graph();

    // Set variables 'a' and 'b'
    graph.setVariable('a', 10);
    graph.setVariable('b', 5);

    // Create VariableNodes for 'a' and 'b'
    const getVarNodeA = new GetVariableNode('1', 'a');
    const getVarNodeB = new GetVariableNode('2', 'b');
    graph.addNode(getVarNodeA);
    graph.addNode(getVarNodeB);

    // Create a GreaterThanNode for the condition (a > b)
    const greaterThanNode = new GreaterThanNode('3');
    graph.addNode(greaterThanNode);

    // Create IfElseNode with the logical condition
    const ifElseNode = new IfElseNode('4', 'If a > b');
    graph.addNode(ifElseNode);

    // Create SetVariableNodes for the If and Else branches
    const setResultNodeIf = new SetVariableNode('5', 'result_if_true');
    const setResultNodeElse = new SetVariableNode('6', 'result_if_false');
    graph.addNode(setResultNodeIf);
    graph.addNode(setResultNodeElse);

    // Connect 'a' and 'b' to the GreaterThanNode
    graph.addEdge(new Edge(getVarNodeA.id, 'output', greaterThanNode.id, 'a'));
    graph.addEdge(new Edge(getVarNodeB.id, 'output', greaterThanNode.id, 'b'));

    // Connect GreaterThanNode output to IfElseNode condition
    graph.addEdge(new Edge(greaterThanNode.id, 'output', ifElseNode.id, 'condition'));

    // Connect IfElseNode branches to SetVariableNodes
    graph.addEdge(new Edge(ifElseNode.id, 'if_code', setResultNodeIf.id, 'input'));
    graph.addEdge(new Edge(ifElseNode.id, 'else_code', setResultNodeElse.id, 'input'));

    // Generate Python code
    const code = graph.generatePythonCode();

    // Check the generated Python code for the IfElse structure and logical condition
    expect(code).toContain('if a > b:');
    expect(code).toContain('result_if_true = ...');  // Fill in the expected action for if true
    expect(code).toContain('else:');
    expect(code).toContain('result_if_false = ...');  // Fill in the expected action for else
});

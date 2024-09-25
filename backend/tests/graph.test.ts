import { Graph } from '../src/graph';
import {VariableNode, SetVariableNode, GetVariableNode} from '../src/node';
import { IfElseNode } from '../src/IfElseNode';
import { AddNode } from '../src/addNode';
import { SubtractNode } from '../src/subtractNode';
import { MultiplyNode } from '../src/multiplyNode';
import { DivideNode } from '../src/divideNode';
import {Edge} from "../src/edge";

test('Graph generates Python code with variables declared at the top including result', () => {
    const graph = new Graph();

    // Set initial values for variables 'a', 'b', and declare 'result'
    graph.setVariable('a', 10);
    graph.setVariable('b', 5);
    graph.setVariable('result', null);  // Declare result variable

    // Create VariableNodes for 'a' and 'b'
    const getVarNodeA = new GetVariableNode('1', 'a');
    const getVarNodeB = new GetVariableNode('2', 'b');
    graph.addNode(getVarNodeA);
    graph.addNode(getVarNodeB);

    // Create AddNode to add 'a' and 'b'
    const addNode = new AddNode('3');
    graph.addNode(addNode);

    // Set the result of AddNode to a new variable 'result'
    const setResultNode = new SetVariableNode('4', 'result');
    graph.addNode(setResultNode);

    // Link the GetVariableNodes to AddNode
    graph.addEdge(new Edge(getVarNodeA.id, 'output', addNode.id, 'a'));
    graph.addEdge(new Edge(getVarNodeB.id, 'output', addNode.id, 'b'));

    // Link the output of AddNode to the SetVariableNode 'result'
    graph.addEdge(new Edge(addNode.id, 'output', setResultNode.id, 'input'));

    // Generate Python code
    const code = graph.generatePythonCode();

    // Check the generated Python code
    expect(code).toContain('a = 10');
    expect(code).toContain('b = 5');
    expect(code).toContain('result = a + b');
});


test('Graph correctly handles SubtractNode with two variables and assigns result to SetVariableNode', () => {
    const graph = new Graph();

    // Create two variable nodes for 'a' and 'b'
    const varNodeA = new VariableNode('1', 'a', 10);
    const varNodeB = new VariableNode('2', 'b', 5);
    graph.addNode(varNodeA);
    graph.addNode(varNodeB);

    // Create a SubtractNode to subtract 'b' from 'a'
    const subtractNode = new SubtractNode('3');
    graph.addNode(subtractNode);

    // Set the result of SubtractNode to a new variable 'result'
    const setVarNode = new SetVariableNode('4', 'result');
    graph.addNode(setVarNode);

    // Generate Python code
    const code = graph.generatePythonCode();

    // Verify the Python code contains the subtraction of 'b' from 'a' and assigns it to 'result'
    expect(code).toContain('a = 10');
    expect(code).toContain('b = 5');
    expect(code).toContain('result = a - b');
});

test('Graph correctly handles MultiplyNode with two variables and assigns result to SetVariableNode', () => {
    const graph = new Graph();

    // Create two variable nodes for 'a' and 'b'
    const varNodeA = new VariableNode('1', 'a', 10);
    const varNodeB = new VariableNode('2', 'b', 5);
    graph.addNode(varNodeA);
    graph.addNode(varNodeB);

    // Create a MultiplyNode to multiply 'a' and 'b'
    const multiplyNode = new MultiplyNode('3');
    graph.addNode(multiplyNode);

    // Set the result of MultiplyNode to a new variable 'result'
    const setVarNode = new SetVariableNode('4', 'result');
    graph.addNode(setVarNode);

    // Generate Python code
    const code = graph.generatePythonCode();

    // Verify the Python code contains the multiplication of 'a' and 'b' and assigns it to 'result'
    expect(code).toContain('a = 10');
    expect(code).toContain('b = 5');
    expect(code).toContain('result = a * b');
});

test('Graph correctly handles DivideNode with two variables and assigns result to SetVariableNode', () => {
    const graph = new Graph();

    // Create two variable nodes for 'a' and 'b'
    const varNodeA = new VariableNode('1', 'a', 10);
    const varNodeB = new VariableNode('2', 'b', 5);
    graph.addNode(varNodeA);
    graph.addNode(varNodeB);

    // Create a DivideNode to divide 'a' by 'b'
    const divideNode = new DivideNode('3');
    graph.addNode(divideNode);

    // Set the result of DivideNode to a new variable 'result'
    const setVarNode = new SetVariableNode('4', 'result');
    graph.addNode(setVarNode);

    // Generate Python code
    const code = graph.generatePythonCode();

    // Verify the Python code contains the division of 'a' by 'b' and assigns it to 'result'
    expect(code).toContain('a = 10');
    expect(code).toContain('b = 5');
    expect(code).toContain('result = a / b');
});

test('Graph correctly handles IfElseNode and assigns result based on condition', () => {
    const graph = new Graph();

    // Set initial values for variables 'a', 'b', and declare 'result'
    graph.setVariable('a', 10);
    graph.setVariable('b', 5);
    graph.setVariable('result', null);  // Declare result variable

    // Create VariableNodes for 'a' and 'b'
    const getVarNodeA = new GetVariableNode('1', 'a');
    const getVarNodeB = new GetVariableNode('2', 'b');
    graph.addNode(getVarNodeA);
    graph.addNode(getVarNodeB);

    // Create IfElseNode with condition (e.g., a > b)
    const ifElseNode = new IfElseNode('3', 'If a > b');
    graph.addNode(ifElseNode);

    // Set the result based on condition
    const setResultNodeIf = new SetVariableNode('4', 'result');
    const setResultNodeElse = new SetVariableNode('5', 'result');
    graph.addNode(setResultNodeIf);
    graph.addNode(setResultNodeElse);

    // Link the GetVariableNode 'a' and 'b' to the IfElseNode condition
    graph.addEdge(new Edge(getVarNodeA.id, 'output', ifElseNode.id, 'condition'));
    graph.addEdge(new Edge(getVarNodeB.id, 'output', ifElseNode.id, 'condition'));

    // Link If branch to set result to 'a'
    graph.addEdge(new Edge(ifElseNode.id, 'if_code', setResultNodeIf.id, 'input'));

    // Link Else branch to set result to 'b'
    graph.addEdge(new Edge(ifElseNode.id, 'else_code', setResultNodeElse.id, 'input'));

    // Generate Python code
    const code = graph.generatePythonCode();

    // Check that the code correctly contains the if-else structure and assigns result
    expect(code).toContain('if a > b:');
    expect(code).toContain('result = a');
    expect(code).toContain('else:');
    expect(code).toContain('result = b');
});
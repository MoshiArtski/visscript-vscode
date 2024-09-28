import { Graph } from '../src/graph';
import { SetVariableNode, GetVariableNode, AdditionNode, MultiplicationNode, SubtractionNode, GreaterThanNode, LessThanNode, EqualNode, AndNode, OrNode, NotNode, IfElseNode } from '../src/node';
import { VectorStoreNode } from '../src/node';

test('Simple arithmetic expression: c = a + b', () => {
    const graph = new Graph();

    // Add variables
    graph.addVariable('a', 1, true);
    graph.addVariable('b', 2, true);
    graph.addVariable('c', 0, true); // Initial value of c

    // Create nodes for expression: c = a + b
    const getA = new GetVariableNode('1', 'a', graph);
    const getB = new GetVariableNode('2', 'b', graph);
    const add = new AdditionNode('3');
    const setC = new SetVariableNode('4', 'c', graph);

    // Add nodes to the graph
    graph.addNode(getA);
    graph.addNode(getB);
    graph.addNode(add);
    graph.addNode(setC);

    // Connect nodes
    graph.connectNodes('1', 'output', '3', 'left'); // Connect a to left input of addition
    graph.connectNodes('2', 'output', '3', 'right'); // Connect b to right input of addition
    graph.connectNodes('3', 'result', '4', 'input'); // Connect result of addition to c

    // Generate code
    const code = graph.generateFullPythonCodeFromNode('4');

    // Expected code
    const expectedCode = `
a = 1
b = 2
c = 0

c = (a + b)
`.trim();

    expect(code).toBe(expectedCode);
});

test('Complex arithmetic expression: d = (a + b) * (c - (a * b))', () => {
    const graph = new Graph();

    // Add variables
    graph.addVariable('a', 2, true);
    graph.addVariable('b', 3, true);
    graph.addVariable('c', 10, true);
    graph.addVariable('d', 0, true); // Initial value of d

    // Create nodes for expression: d = (a + b) * (c - (a * b))
    const getA1 = new GetVariableNode('1', 'a', graph);
    const getB1 = new GetVariableNode('2', 'b', graph);
    const getA2 = new GetVariableNode('3', 'a', graph);
    const getB2 = new GetVariableNode('4', 'b', graph);
    const getC = new GetVariableNode('5', 'c', graph);
    const add = new AdditionNode('6');
    const multiply1 = new MultiplicationNode('7');
    const subtract = new SubtractionNode('8');
    const multiply2 = new MultiplicationNode('9');
    const setD = new SetVariableNode('10', 'd', graph);

    // Add nodes to the graph
    graph.addNode(getA1);
    graph.addNode(getB1);
    graph.addNode(getA2);
    graph.addNode(getB2);
    graph.addNode(getC);
    graph.addNode(add);
    graph.addNode(multiply1);
    graph.addNode(subtract);
    graph.addNode(multiply2);
    graph.addNode(setD);

    // Connect nodes
    graph.connectNodes('1', 'output', '6', 'left');  // a to addition
    graph.connectNodes('2', 'output', '6', 'right'); // b to addition
    graph.connectNodes('3', 'output', '7', 'left');  // a to multiplication
    graph.connectNodes('4', 'output', '7', 'right'); // b to multiplication
    graph.connectNodes('5', 'output', '8', 'left');  // c to subtraction
    graph.connectNodes('7', 'result', '8', 'right'); // (a * b) to subtraction
    graph.connectNodes('6', 'result', '9', 'left');  // (a + b) to multiplication
    graph.connectNodes('8', 'result', '9', 'right'); // (c - (a * b)) to multiplication
    graph.connectNodes('9', 'result', '10', 'input'); // Final result to d

    // Generate code
    const code = graph.generateFullPythonCodeFromNode('10');

    // Expected code
    const expectedCode = `
a = 2
b = 3
c = 10
d = 0

d = ((a + b) * (c - (a * b)))
`.trim();

    expect(code).toBe(expectedCode);
});

test('Complex expression with if-else and control flow: e = (a + b) if (c > (a * b)) else (c - (a * b))', () => {
    const graph = new Graph();

    // Add variables
    graph.addVariable('a', 2, true);
    graph.addVariable('b', 3, true);
    graph.addVariable('c', 10, true);
    graph.addVariable('e', 0, true);

    // Create nodes
    const getA1 = new GetVariableNode('1', 'a', graph);
    const getB1 = new GetVariableNode('2', 'b', graph);
    const getA2 = new GetVariableNode('3', 'a', graph);
    const getB2 = new GetVariableNode('4', 'b', graph);
    const getC1 = new GetVariableNode('5', 'c', graph);
    const getC2 = new GetVariableNode('6', 'c', graph);
    const add = new AdditionNode('7');
    const multiply = new MultiplicationNode('8');
    const subtract = new SubtractionNode('9');
    const greaterThan = new GreaterThanNode('10');
    const ifElse = new IfElseNode('11');
    const setE1 = new SetVariableNode('12', 'e', graph);
    const setE2 = new SetVariableNode('13', 'e', graph);

    // Add nodes to the graph
    [getA1, getB1, getA2, getB2, getC1, getC2, add, multiply, subtract, greaterThan, ifElse, setE1, setE2].forEach(node => graph.addNode(node));

    // Connect nodes
    graph.connectNodes('1', 'output', '7', 'left');
    graph.connectNodes('2', 'output', '7', 'right');
    graph.connectNodes('3', 'output', '8', 'left');
    graph.connectNodes('4', 'output', '8', 'right');
    graph.connectNodes('5', 'output', '10', 'left');
    graph.connectNodes('8', 'result', '10', 'right');
    graph.connectNodes('6', 'output', '9', 'left');
    graph.connectNodes('8', 'result', '9', 'right');
    graph.connectNodes('10', 'result', '11', 'condition');
    graph.connectNodes('7', 'result', '12', 'input');
    graph.connectNodes('9', 'result', '13', 'input');
    graph.connectNodes('11', 'if_true', '12', 'controlIn');
    graph.connectNodes('11', 'if_false', '13', 'controlIn');

    // Generate code
    const code = graph.generateFullPythonCodeFromNode('11');

    // Expected code
    const expectedCode = `
a = 2
b = 3
c = 10
e = 0

if ((c > (a * b))):
    e = (a + b)
else:
    e = (c - (a * b))
`.trim();

    expect(code).toBe(expectedCode);
});

test('Complex expression with multiple comparisons and logical operators', () => {
    const graph = new Graph();

    // Add variables
    graph.addVariable('a', 5, true);
    graph.addVariable('b', 10, true);
    graph.addVariable('c', 15, true);
    graph.addVariable('result', false, true);

    // Create nodes for expression: result = (a < b and b < c) or not (a == b)
    const getA1 = new GetVariableNode('1', 'a', graph);
    const getB1 = new GetVariableNode('2', 'b', graph);
    const getB2 = new GetVariableNode('3', 'b', graph);
    const getC = new GetVariableNode('4', 'c', graph);
    const getA2 = new GetVariableNode('5', 'a', graph);
    const getB3 = new GetVariableNode('6', 'b', graph);
    const lessThan1 = new LessThanNode('7');
    const lessThan2 = new LessThanNode('8');
    const equal = new EqualNode('9');
    const and = new AndNode('10');
    const not = new NotNode('11');
    const or = new OrNode('12');
    const setResult = new SetVariableNode('13', 'result', graph);

    // Add nodes to the graph
    [getA1, getB1, getB2, getC, getA2, getB3, lessThan1, lessThan2, equal, and, not, or, setResult].forEach(node => graph.addNode(node));

    // Connect nodes
    graph.connectNodes('1', 'output', '7', 'left');   // a to first less than
    graph.connectNodes('2', 'output', '7', 'right');  // b to first less than
    graph.connectNodes('3', 'output', '8', 'left');   // b to second less than
    graph.connectNodes('4', 'output', '8', 'right');  // c to second less than
    graph.connectNodes('5', 'output', '9', 'left');   // a to equal
    graph.connectNodes('6', 'output', '9', 'right');  // b to equal
    graph.connectNodes('7', 'result', '10', 'left');  // (a < b) to and
    graph.connectNodes('8', 'result', '10', 'right'); // (b < c) to and
    graph.connectNodes('9', 'result', '11', 'input'); // (a == b) to not
    graph.connectNodes('10', 'result', '12', 'left'); // (a < b and b < c) to or
    graph.connectNodes('11', 'result', '12', 'right');// not (a == b) to or
    graph.connectNodes('12', 'result', '13', 'input');// final result to setResult

    // Generate code
    const code = graph.generateFullPythonCodeFromNode('13');

    // Expected code
    const expectedCode = `
a = 5
b = 10
c = 15
result = false

result = (((a < b) and (b < c)) or (not (a == b)))
`.trim();

    expect(code).toBe(expectedCode);
});

test('VectorStoreNode generates correct Python code', () => {
    const node = new VectorStoreNode('1');
    node.setOption('storeType', 'pinecone');
    node.setOption('useCache', true);
    node.setOption('cacheType', 'in_memory');
    node.setOption('indexName', 'test_index');

    const values = {
        documents: 'documents_var',
        embeddings: 'embeddings_var'
    };

    const expectedCode = `
from langchain.vectorstores import Pinecone

from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()
cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embedder=embeddings_var,
    document_embedding_cache=store,
    namespace="test_index_namespace"
)

vector_store = Pinecone.from_documents(
    documents=documents_var,
    embedding=cached_embedder,
    index_name="test_index"
)
`;

    expect(node.generatePythonCode(values).trim()).toBe(expectedCode.trim());
});
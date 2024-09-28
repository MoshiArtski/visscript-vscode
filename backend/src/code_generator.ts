import { Graph } from './graph';
import { VariableNode } from './node';

export function generatePythonCodeFromGraph(graph: Graph): string {
    return graph.generateFullPythonCode();
}

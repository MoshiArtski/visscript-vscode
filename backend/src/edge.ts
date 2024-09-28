export class Edge {
    inputNodeId: string;
    outputNodeId: string;
    inputPortId: string;
    outputPortId: string;

    constructor(inputNodeId: string, outputNodeId: string, inputPortId: string, outputPortId: string) {
        this.inputNodeId = inputNodeId;
        this.outputNodeId = outputNodeId;
        this.inputPortId = inputPortId;
        this.outputPortId = outputPortId;
    }
}

export class Edge {
    fromNodeId: string;
    fromPortId: string;
    toNodeId: string;
    toPortId: string;

    constructor(fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) {
        this.fromNodeId = fromNodeId;
        this.fromPortId = fromPortId;
        this.toNodeId = toNodeId;
        this.toPortId = toPortId;
    }
}

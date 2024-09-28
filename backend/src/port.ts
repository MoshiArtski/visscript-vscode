import { GraphNode } from './node';  // Import GraphNode

export class Port {
    id: string;
    direction: 'input' | 'output';
    portType: 'data' | 'control';
    dataType: string | null;
    connectedPort: Port | null;
    parentNode: GraphNode;
    required: boolean;
    description: string;
    meta: Record<string, any>;
    hidden: boolean;

    constructor(
        id: string,
        direction: 'input' | 'output',
        portType: 'data' | 'control',
        parentNode: GraphNode,
        dataType: string | null = null,
        description: string = '',
        required: boolean = false,
        meta: Record<string, any> = {},
        hidden: boolean = false
    ) {
        this.id = id;
        this.direction = direction;
        this.portType = portType;
        this.dataType = dataType;
        this.connectedPort = null;
        this.parentNode = parentNode;
        this.description = description;
        this.required = required;
        this.meta = meta;
        this.hidden = hidden;
    }

    // Connect this port to another port
    connect(port: Port) {
        this.connectedPort = port;
    }

    // Disconnect this port
    disconnect() {
        this.connectedPort = null;
    }

    // Retrieve the node connected to this port
    getConnectedNode(): GraphNode | null {  // Change Node to GraphNode
        return this.connectedPort ? this.connectedPort.parentNode : null;
    }

    // Hide this port
    hide() {
        this.hidden = true;
        if (this.connectedPort) {
            this.disconnect();
            this.connectedPort.disconnect();
        }
    }

    // Unhide this port
    unhide() {
        this.hidden = false;
    }

    // Check if this port is hidden
    isHidden(): boolean {
        return this.hidden;
    }
}

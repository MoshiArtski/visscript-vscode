export class Port {
    id: string;
    type: 'input' | 'output';
    portType: 'data' | 'control'; // 'data' for value, 'control' for execution flow
    dataType: string | null;      // null for control ports

    constructor(id: string, type: 'input' | 'output', portType: 'data' | 'control', dataType: string | null = null) {
        this.id = id;
        this.type = type;
        this.portType = portType;
        this.dataType = dataType;
    }
}

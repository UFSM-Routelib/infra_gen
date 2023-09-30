export class GraphNode {
    id: number;
    coord: Coord;
    neighs: GraphNode[];

    constructor(id: number, coord: Coord) {
        this.id = id;
        this.coord = coord;
        this.neighs = new Array();
    }

    connect_to(node: GraphNode) {
        if (node.id === this.id || node.neighs.includes(this) || this.neighs.includes(node)) {
            return
        }

        console.log("connected: " + this.id.toString() + " to " + node.id.toString());
        this.neighs.push(node);
        node.neighs.push(this);
    }

    text_info(): string {
        return "id: "+this.id+ " latlng: "+this.coord.lat+" "+this.coord.lng+";";
    }

    csvfy(): string{
        return ""+this.id+","+this.coord.lat+","+this.coord.lng+",";
    }
}

export interface Coord {
    lat: number;
    lng: number;
}

export class Graph{
    nodes: Map<number, GraphNode>;   
    node_count: number;
    constructor(){
        this.nodes = new Map();
        this.node_count = 0;
    }

    add_node(c: Coord) {
        const n = new GraphNode(this.node_count, c);
        this.nodes.set(this.node_count, n);
        this.node_count += 1;
        return n;
    }

    remove_node(id: number) {
        const opt_node: GraphNode | undefined = this.nodes.get(id);
        if (opt_node === undefined) {
            return
        }
        const node = opt_node;

        this.nodes.forEach((v, _) => {
            if (v.neighs.includes(node)) {
                delete v.neighs[v.neighs.indexOf(node)];
            }
        })

        this.nodes.delete(id);
    }
    

    get_node(id: number): GraphNode | undefined {
        return this.nodes.get(id);
    }
}   

    


import * as L from "leaflet";

export class GraphNode {
    id: number;
    coord: Coord;
    neighs: GraphNode[];
    marker: L.Marker;
    lines: L.Polyline[];
    parent_map: L.Map;
    click_handler: L.LeafletEventHandlerFn;

    constructor(id: number, coord: Coord, map: L.Map, icon: L.Icon, click_handler: L.LeafletEventHandlerFn) {
        this.id = id;
        this.coord = coord;
        this.neighs = new Array();
        this.marker = L.marker(coord, {title: id.toString(), icon:icon}).addTo(map).on("click", click_handler);
        this.lines = new Array();
        this.parent_map = map;
        this.click_handler = click_handler;
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

    undraw() {
        this.parent_map.removeLayer(this.marker);
        this.lines.forEach(line => this.parent_map.removeLayer(line));
    }

    set_icon(icon: L.Icon) {
        this.parent_map.removeLayer(this.marker);
        this.marker = L.marker(this.coord, {title: this.id.toString(), icon:icon}).addTo(this.parent_map).on("click", this.click_handler);
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

    add_node(c: Coord, map: L.Map, icon: L.Icon, click_hadler: L.LeafletEventHandlerFn) {
        const n = new GraphNode(this.node_count, c, map, icon, click_hadler);
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
        
        node.undraw();

        this.nodes.delete(id);
    }
    

    get_node(id: number): GraphNode | undefined {
        return this.nodes.get(id);
    }
}   

    


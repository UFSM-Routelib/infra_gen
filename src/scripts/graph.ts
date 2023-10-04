import * as L from "leaflet";
import * as dom from "./dom";

export class GraphNode {
    id: number;
    coord: Coord;
    neighs: GraphNode[];
    marker: L.Marker;
    lines: L.Polyline[];
    click_handler: L.LeafletEventHandlerFn;
    parent_map: L.Map;

    constructor(id: number, coord: Coord, map: L.Map, icon: L.Icon, click_handler: L.LeafletEventHandlerFn) {
        this.id = id;
        this.coord = coord;
        this.neighs = new Array();
        this.marker = L.marker(coord, {title: id.toString(), icon:icon, draggable: true}).addTo(map).on("click", click_handler);
        this.lines = new Array();
        this.click_handler = click_handler;
        this.parent_map = map;
    }

    connect_to(node: GraphNode) {
        if (node.id === this.id || node.neighs.includes(this) || this.neighs.includes(node)) {
            return
        }

        console.log("connected: " + this.id.toString() + " to " + node.id.toString());
        this.neighs.push(node);
        node.neighs.push(this);

        const line = new L.Polyline([this.coord, node.coord], {
            color: '#ff0000',
            weight: 3,
            opacity: 1,
            smoothFactor: 1
        });
        this.lines.push(line);
        node.lines.push(line);
        line.addTo(this.parent_map);
    }

    text_info(): string {
        return "id: "+this.id+ " latlng: "+this.coord.lat+" "+this.coord.lng+";";
    }

    csvfy(): string{
        return ""+this.id+"\t"+this.coord.lat+"\t"+this.coord.lng+"\t";
    }

    undraw() {
        this.parent_map.removeLayer(this.marker);
        this.lines.forEach(line => {this.parent_map.removeLayer(line);});
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
    selected: GraphNode | undefined;
    map: L.Map

    constructor(map: L.Map){
        this.nodes = new Map();
        this.node_count = 0;
        this.map = map;
    }
       
    debug_info() {
        console.log(this.node_count);
        console.log(this.selected);
        console.log(this.nodes)
    }

    add_node(c: Coord, icon: L.Icon, click_hadler: L.LeafletEventHandlerFn, id?: number): GraphNode {
        if (id !== undefined) {
            if (this.nodes.has(id)) {
                const r_node = this.nodes.get(id);
                if (r_node === undefined) {
                    alert("something went very wrong: undefined node in map");
                    throw "undefined node in map";
                }
                return r_node;
            }

            const n = new GraphNode(id, c, this.map, icon, click_hadler);
            this.nodes.set(id, n);
            this.node_count += 1;
            return n;
        }

        id = this.node_count;
        while(this.nodes.has(id)){
            id += 1;
        }
        const n = new GraphNode(id, c, this.map, icon, click_hadler);
        this.nodes.set(id, n);
        this.node_count += 1;
        return n;
    }

    remove_node(id: number) {
        const opt_node: GraphNode | undefined = this.nodes.get(id);
        if (opt_node === undefined) {
            alert("fuck");
            return
        }
        const node = opt_node;

        node.undraw();
        this.nodes.forEach((v, _) => {
            if (v.neighs.includes(node)) {
                delete v.neighs[v.neighs.indexOf(node)];
            }
        })
        this.nodes.delete(id);
    }

    rm_selected(){
        if (this.selected !== undefined) {
            dom.set_node_info("Nothing selected | deleted " + this.selected.id);
            this.remove_node(this.selected.id);  
            this.selected = undefined;
        }
    }
    

    get_node(id: number): GraphNode | undefined {
        return this.nodes.get(id);
    }

    csvfy(): string{
        // header of the csv file
        let content: string = "FISICO_FONTE\tFONTEX\tFONTEY\tFISICO_NO\tNOX\tNOY\t\n"
        console.log(this.nodes);
        this.nodes.forEach((n, _) => {
            console.log("node: " + n.id);
            n.neighs.forEach((neigh) => {
                console.log("neigh: " + neigh.id);
                content = content.concat(n.csvfy().concat(neigh.csvfy())+"\n");
            });
        });
        return content;
    }

    download() {
        const a = document.createElement('a');
        const file = new Blob([this.csvfy()])
        a.href= URL.createObjectURL(file);
        a.download = "graph.csv";
        a.click();
        URL.revokeObjectURL(a.href);
    }

    load_csv(file: File, icon: L.Icon, high_icon: L.Icon) {
        file.text().then(
            text => {
                const lines = text.split("\n");
                const line_count = lines.length;
                const headers = lines[0].split("\t");
                for (let i = 1; i < line_count; i++){
                    const fields = lines[i].split("\t");
                    
                    const f_id = parseInt(fields[headers.indexOf("FISICO_FONTE")]);
                    const f_lat = parseFloat(fields[headers.indexOf("FONTEX")]);
                    const f_lng = parseFloat(fields[headers.indexOf("FONTEY")]);
                    const n_id = parseInt(fields[headers.indexOf("FISICO_NO")]);
                    const n_lat = parseFloat(fields[headers.indexOf("NOX")]);
                    const n_lng = parseFloat(fields[headers.indexOf("NOY")]);

                    if (isNaN(f_lat) || isNaN(f_lng) || isNaN(n_lat) || isNaN(n_lng)) {
                        continue;
                    }
                    const f_node = this.add_node({lat: f_lat, lng:f_lng}, icon, 
                        () => {
                            if (this.selected === undefined) {
                                this.selected = f_node; 
                                this.selected.set_icon(high_icon);
                                dom.set_node_info(this.selected.text_info());
                                return
                            }

                            if (this.selected.id === f_node.id) {
                                this.selected = undefined;
                                f_node.set_icon(icon);
                                dom.set_node_info("Nothing selected");
                                return;
                            }

                            this.selected.connect_to(f_node);

                            this.selected.set_icon(icon);
                            this.selected = f_node;
                            this.selected.set_icon(high_icon);
                            dom.set_node_info(this.selected.text_info());
                        }
                    , f_id);       
                    const n_node = this.add_node({lat: n_lat, lng:n_lng}, icon, 
                        () => {
                            if (this.selected === undefined) {
                                this.selected = n_node; 
                                this.selected.set_icon(high_icon);
                                dom.set_node_info(this.selected.text_info());
                                return
                            }

                            if (this.selected.id === n_node.id) {
                                this.selected = undefined;
                                n_node.set_icon(icon);
                                dom.set_node_info("Nothing selected");
                                return;
                            }

                            this.selected.connect_to(n_node);

                            this.selected.set_icon(icon);
                            this.selected = n_node;
                            this.selected.set_icon(high_icon);
                            dom.set_node_info(this.selected.text_info());
                        }
                    , n_id);
                    f_node.connect_to(n_node);
                }
            }
        );
    }
}   




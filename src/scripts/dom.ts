import { Graph, GraphNode } from "./graph";

export function set_node_info(info: string) {
    const n_info = document.getElementById("node-info-text");
    if (n_info === null) {
        return;
    }
    
    n_info.textContent = info;
}

export function handle_del_click(selected: GraphNode | undefined, g: Graph) {
    if (selected === undefined) {
        return 
    }
    g.remove_node(selected.id);
}

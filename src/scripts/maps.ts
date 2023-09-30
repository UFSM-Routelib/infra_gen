import * as L from "leaflet";
import {Graph, GraphNode} from "./graph";
import * as dom from "./dom";

async function initMap() {
    
    let map_opts: L.MapOptions = {
        center: [-29.91113120515485, -50.70384997933515],
        zoom:10
    }

    let map = L.map('map', map_opts)
    let layer = new L.TileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png');
    layer.addTo(map);
    
    const g = new Graph();
    let selected: GraphNode | undefined = undefined;
    const node_icon = new L.Icon({iconUrl: "http://localhost:3000/styles/images/node_icon.png", iconSize: [40, 40]})
    const highlighted_icon = new L.Icon({iconUrl: "http://localhost:3000/styles/images/selected_node_icon.png", iconSize: [40, 40]})

    document.getElementById("delete-node")?.addEventListener("click", () => {
        if (selected !== undefined) {
            g.remove_node(selected.id);  
            selected = undefined;
        }
    })

    document.getElementById("downloader")?.addEventListener("click", () => {
        g.download();
    })

    map.on("click", (event: any) => {        
        const node = g.add_node(event.latlng, map, node_icon,
        () => {
            if (selected === undefined) {
                selected = node; 
                selected.set_icon(highlighted_icon);
                dom.set_node_info(selected.text_info());
                return
            }

            if (selected.id === node.id) {
                selected = undefined;
                node.set_icon(node_icon);
                dom.set_node_info("Nothing selected");
                return;
            }

            selected.connect_to(node);
            
            // hopefuly leaflet has an optimization to not a gazilion identical lines on the exata same path
            const line = new L.Polyline([selected.coord, node.coord], {
                color: '#ff0000',
                weight: 3,
                opacity: 1,
                smoothFactor: 1
            }).addTo(map);

            selected.lines.push(line);
            node.lines.push(line);

            selected.set_icon(node_icon);
            selected = node;
            selected.set_icon(highlighted_icon);
            dom.set_node_info(selected.text_info());
        });
    });
}

window.onload = initMap;


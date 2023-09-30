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

    map.on("click", (event: any) => {        
        const added = g.add_node(event.latlng);


        const node_marker = L.marker([event.latlng.lat, event.latlng.lng], {title: added.id.toString(), icon:node_icon})
        .addTo(map)
        .on("click", () => {
            if (node_marker.options.title === undefined) {
                return
            }

            if (selected === undefined) {
                selected = g.get_node(parseInt(node_marker.options.title));
                if (selected === undefined) {
                    return;
                }
                dom.set_node_info(selected.text_info());
                return
            }

            const next = g.get_node(parseInt(node_marker.options.title));
            if (next === undefined) {
                return
            }

            if (selected.id === next.id) {
                selected = undefined;
                dom.set_node_info("Nothing selected");
                return;
            }

            selected.connect_to(next);
            
            // hopefuly leaflet has an optimization to not a gazilion identical lines on the exata same path
            new L.Polyline([selected.coord, next.coord], {
                color: '#ff0000',
                weight: 3,
                opacity: 1,
                smoothFactor: 1
            }).addTo(map);

            selected = next;
            dom.set_node_info(selected.text_info());
        });
    });
}

window.onload = initMap;


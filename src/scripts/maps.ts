import * as L from "leaflet";
import {Graph} from "./graph";
import * as dom from "./dom";

async function initMap() {
    
    let map_opts: L.MapOptions = {
        center: [-29.91113120515485, -50.70384997933515],
        zoom:10
    }

    let map = L.map('map', map_opts)
    let layer = new L.TileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png');
    
    const g = new Graph(map);
    layer.addTo(g.map);

    const node_icon = new L.Icon({iconUrl: "http://localhost:3000/styles/images/poste_icon.png", iconSize: [35, 35]})
    const highlighted_icon = new L.Icon({iconUrl: "http://localhost:3000/styles/images/selected_poste_icon.png", iconSize: [35, 35]})

    document.getElementById("delete-node")?.addEventListener("click", () => {
        g.rm_selected();
    })

    document.getElementById("downloader")?.addEventListener("click", () => {
        g.download();
    })

    document.getElementById("file_entry")?.addEventListener("change", () => {
        const input = (<HTMLInputElement>document.getElementById("file_entry"));
        const files = input?.files;
        if (files === null || files === undefined) {
            return;
        }
        g.load_csv(files[0], node_icon, highlighted_icon);
    })

    g.map.on("click", (event: any) => {        
        g.debug_info();
        const node = g.add_node(event.latlng, node_icon,
        //this function is repeated in g.load_csv() so thats a possible useful refactor
        () => {
            if (g.selected === undefined) {
                g.selected = node; 
                g.selected.set_icon(highlighted_icon);
                dom.set_node_info(g.selected.text_info());
                return
            }

            if (g.selected.id === node.id) {
                g.selected = undefined;
                node.set_icon(node_icon);
                dom.set_node_info("Nothing selected");
                return;
            }

            g.selected.connect_to(node);

            g.selected.set_icon(node_icon);
            g.selected = node;
            g.selected.set_icon(highlighted_icon);
            dom.set_node_info(g.selected.text_info());
        });
    });
}

window.onload = initMap;


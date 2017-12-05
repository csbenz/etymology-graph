


function display_cyto_vizu(jsonTree) {console.log('a');

	var cy = cytoscape({
	  container: document.getElementById("cyto") // container to render in
	});

	var eles = cy.add([
	  { group: "nodes", data: { id: "n0" }, position: { x: 100, y: 100 } },
	  { group: "nodes", data: { id: "n1" }, position: { x: 200, y: 200 } },
	  { group: "edges", data: { id: "e0", source: "n0", target: "n1" } }
	]);
}



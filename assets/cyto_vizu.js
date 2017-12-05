
function add_node(state, name, depth) {
	cy.add({
	    group: "nodes",
	    data: { 
	    	id: state,
	    	weight: 75,
	    	depth: depth,
	    	name: name },
	   // position: { x: 200, y: 200 }
	});
	//g.node(state).label = "<div>aa</div>";
	console.log('ADD ' + state + " " + name);
}
var i = 0;

function add_edge(from, to, label_name) {
	var edge_id = from + to;
	cy.add({
	    group: "edges",
	    data: { id: i, source: from, target: to },
	    //position: { x: 200, y: 200 }
	});
	i = i + 1;
	console.log(from + " " + to + " " + i);
}

function display_cyto_vizu(json_tree) {


/*
	var eles = cy.add([
	  { group: "nodes", data: { id: "n0" }, position: { x: 100, y: 100 } },
	  { group: "nodes", data: { id: "n1" }, position: { x: 200, y: 200 } },
	  { group: "edges", data: { id: "e0", source: "n0", target: "n1" } }
	]);
	*/

	var root_node_name = json_tree['name'];
	var root_node_language_name = json_tree['language_name'];
	var root_node_id = json_tree['short_url'];
	var root_depth = json_tree['depth'];

	var label_name = root_node_name;
	add_node(root_node_id, label_name, root_depth);
	//set_root_node(root_node_id);
	//style_node_default(root_node_id);

	var show_clusters = false;
	child_iter(json_tree, show_clusters);

	var options = {
	    name: 'concentric',
	    concentric: function( node ){
	    	console.log(node.data('depth'));
	      return 10 - node.data('depth'); // return node.degree()
	    },
	    levelWidth: function( nodes ){
	      return 1;
	    }
	  };

	var layout = cy.layout( options );
	layout.run();
}

function child_iter(node, show_clusters) {
	var parent_id = node['short_url'];
	var children = node['children'];

	if(!children) {
		return;
	}

	children.forEach(function(child) {
		var child_name = child['name'];
		var child_id = child['short_url'];
		var child_language_name = child['language_name'];
		var child_children = child['children'];
		var child_depth = child['depth'];

		var label_name = child_name;
		var edge_name = show_clusters ? '' : child_language_name;

	    add_node(child_id, label_name, child_depth);
		//style_node_default(child_id);

		add_edge(child_id, parent_id, edge_name);

		if(show_clusters) {
			add_cluster(child_language_name);
			set_cluster(child_id, child_language_name);
		}
		
		if(child_children) {
			child_iter(child, show_clusters);
		}			
	});
}


var cy = cytoscape({
  container: document.getElementById("cyto"), // container to render in
  //autounselectify: true,
  //fit: true,
  style: [
        {
          selector: 'node',
          style: {
          	'label': 'data(name)',
            'height': 80,
            'width': 80,
            'background-color': '#30c9bc'
          }
        },

        {
          selector: 'edge',
          style: {
            'curve-style': 'haystack',
            'haystack-radius': 0,
            'width': 8,
            'opacity': 0.5,
            'line-color': '#a8eae5'
          }
        }
      ]

});


function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

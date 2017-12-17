
function add_node(state, name, depth, isRoot) {
	cy.add({
	    group: "nodes",
	    data: { 
	    	id: state,
	    	weight: 75,
	    	depth: depth,
	    	name: name,
	    	isRoot: isRoot,
	    	isCluster: "false" },
	    //classes: 'background',
	    
	});
}


function add_node_with_parent(state, name, parent_state, depth, isRoot) {
	cy.add({
	    group: "nodes",
	    data: { 
	    	id: state,
	    	parent: parent_state,
	    	weight: 75,
	    	depth: depth,
	    	name: name,
	    	isRoot: isRoot,
	    	isCluster: "false"  },
	    //classes: 'background',
	    
	});
}

function add_edge(from, to, label_name) {
	var edge_id = from + to;
	cy.add({
	    group: "edges",
	    data: { id: edge_id, source: from, target: to, label: label_name },
	});
}

function add_cluster(state, name) {
	cy.add({
	    group: "nodes",
	    data: { 
	    	id: state,
	    	name: name,
	    	isCluster: "true" }
	    
	});
}

function display_cyto_vizu(json_tree) {
	var show_clusters_checked = document.getElementById('show_cluster_checkbox').checked;


	var root_node_name = json_tree['name'];
	var root_node_language_name = json_tree['language_name'];
	var root_node_language_code = json_tree['language_code'];
	var root_node_id = json_tree['short_url'];
	var root_depth = json_tree['depth'];

	var label_name = root_node_name;

	if(show_clusters_checked) {
		add_cluster(root_node_language_code, root_node_language_name);
		add_node_with_parent(root_node_id, label_name, root_node_language_code, root_depth, "true");
	} else {
		add_node(root_node_id, label_name, root_depth, "true");
	}
	//set_root_node(root_node_id);
	//style_node_default(root_node_id);

	//var show_clusters = false;
	child_iter(json_tree, show_clusters_checked);

/*
	var options = {
	    name: 'concentric',
	    concentric: function( node ){
	    	console.log(node.data('depth'));
	      return 10 - node.data('depth'); // return node.degree()
	    },
	    levelWidth: function( nodes ){
	      return 1;
	    },
	    directed: true,
	    spacingFactor: 1.75,
	    startAngle: Math.PI,
	    animate: true,
	  };
	  */
	  var options = {
	    name: 'cola', // cose 'cose-bilkent'
	    directed: true,
	    //randomize: true,
	    avoidOverlap: true, 
	    maxSimulationTime: 400000,
	    //flow: 'tree',
	    //axis: 'y',
	    //spacingFactor: 1.75,
	    //startAngle: Math.PI,
	    //animate: true,
	    fit: true
	  };
	  

	var layout = cy.layout( options );
	layout.run();

/*
	var nodes = cy.filter('node');
	var rootNode = nodes.leaves();
	console.log(rootNode);
	*/
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
		var child_language_code = child['language_code'];
		var child_children = child['children'];
		var child_depth = child['depth'];

		var label_name = child_name;
		var edge_name = show_clusters ? '' : child_language_name;

		if(show_clusters) {
			add_cluster(child_language_code, child_language_name);
		    add_node_with_parent(child_id, label_name, child_language_code, child_depth, "false");
		} else {
			add_node(child_id, label_name, child_depth, "false");
		}

		add_edge(child_id, parent_id, edge_name);

		if(child_children) {
			child_iter(child, show_clusters);
		}			
	});
}


var cy = cytoscape({
  container: document.getElementById("cyto"), // container to render in
 // autolock: true,
  //autounselectify: true,
  //fit: true,
  style: [
        {
          selector: "node[isCluster=\"false\"]",
          style: {
          	'label': 'data(name)',
          	'shape':'roundrectangle',
          	'background-color': '#81D4FA',
            'height': 25,
            'width': 'label',
            'padding': 20,
            'text-valign': 'center',
        	'text-halign': 'center'
          }
        } ,
        {
	        selector :'edge',
	        style: {
			  'curve-style': 'bezier', //'unbundled-bezier',
			  'target-arrow-shape': 'triangle',
			  'opacity': 0.8,
              'line-color': '#a8eae5'
			}
		},
		{
          selector: "node[isRoot=\"true\"]",
          style: {
          	'background-color': '#E57373'
          }
        },
        {
          selector: "node[isCluster=\"true\"]",
          style: {
          	'label': 'data(name)',
          	'text-valign': 'top',
        	'text-halign': 'center'

          }
        }
      ]

});

//cy.autoungrabify(true)


function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

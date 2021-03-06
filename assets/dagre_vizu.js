
// html div to display the tooltip on node mouse hover
var div = d3.select("#vizu_svg").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const DEFAULT_SCALE = 0.8;

// Variable for the 'do not reset graph on new new word' option
var noReset = false;

// Variables that keep arrays of the current nodes and edges in the graph
var currNodes = [];
var currEdges = [];
var currRoot;


var margin = {top: 20, right: 0, bottom: 0, left: 0};
var width = 1000 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;

var svg = d3.select("#vizu_svg").append("svg")
    .attr("id", "svg_container")
	.attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height);
var inner = svg.append("g");

// Create the input graph
var g;
reset_graph();

var render = new dagreD3.render();
render(inner, g);

var zoom_handler = d3.zoom()
        .scaleExtent([0.02, 8])
    	.on("zoom", zoom_actions);
zoom_handler(svg);

function zoom_actions(){
  inner.attr("transform", d3.event.transform);
}

// Add a node to the graph
function add_node(state, name) {
	if(!currNodes.map(n => n.short_url).includes(state)) {
		g.setNode(state, {
			label: name
		});
	}
}

// Add an edge to the graph
function add_edge(from, to, label_name) {
	var existingEdges = g.edges().map(e => e.v + e.w);

	g.setEdge(from, to, {
		label: label_name,
		curve: d3.curveBasis
	});
}

// Add a cluster (parent node) to the graph
function add_cluster(cluster) {
	//var rColor = strToHexColor(cluster);
	var rColor = 'd3d7e8';
	g.setNode(cluster, {label: cluster, clusterLabelPos: 'top', style: 'fill: #' + rColor});
	g.node(cluster).rx = 5;
}

// Set a cluster (parent node) for a node
function set_cluster(node, cluster) {
	g.setParent(node, cluster);
}

// Color a node
function set_root_node_style(state) {
	g.node(state).style = "fill: #f77";
}

// Set word as second order root (term I invented to describe a node that is a root for a descendant tree)
function set_second_order_root_node_style(state) {
	g.node(state).style = "fill: #7f7";
}

// Style a node with the default styling
function style_node_default(state) {
	var node = g.node(state);
	node.rx = node.ry = 5;
}

// Clear the visualization
function clear() {
	currNodes = [];
	currEdges = [];
	currRoot = undefined;
	reset_graph();
}


function reset_graph() {
	hide_tooltip();
	if(!noReset) {
		g = new dagreD3.graphlib.Graph({directed:true, compound:true, multigraph:false}).setGraph({});
		g.setGraph({
			nodesep: 70,
			ranksep: 50,
			rankdir: "LR",
			marginx: 20,
			marginy: 20
		});
	}
}

// Called on new search entered by user and after creating the initial data strcture
function add_to_dagre_vizu(nodes, edges, root_node, force_no_reset=false) {
	console.log(force_no_reset);

	if(!force_no_reset && !noReset) {
		clear();
	}

	currRoot = root_node;

	addNodesToVizu(nodes);
	addEdgesToVizu(edges);

	re_render(root_node, !force_no_reset);
}

// Add an array of node objects to the vizu
function addNodesToVizu(nodes) {
	for(i = 0; i < nodes.length; ++i) {
		addNodeToVizu(nodes[i]);
	}
}

// node object to node in vizu
function addNodeToVizu(node) {
	
	let show_clusters = document.getElementById('show_cluster_checkbox').checked;

	add_node(node.short_url, node.name);
	currNodes.push(node);

	style_node_default(node.short_url);

	if(show_clusters) {
		add_cluster(node.language_name);
		set_cluster(node.short_url, node.language_name);
	}

	if(node.isRoot) {
		set_root_node_style(node.short_url);
	}

	if(node.isSecondOrderRoot){
		set_second_order_root_node_style(node.short_url);
	}
}

// Add an array of edge objects to the vizu
function addEdgesToVizu(edges) {
	for(i = 0; i < edges.length; ++i) {
		addEdgeToVizu(edges[i]);
	}
}

// Edge object to edge in vizu
function addEdgeToVizu(edge) {
	currEdges.push(edge);

	let show_clusters = document.getElementById('show_cluster_checkbox').checked;

	add_edge(edge.source, edge.target, show_clusters ? '' : edge.language);
}

// Hide the tooltip div
function hide_tooltip() {
	div.transition()		
            .duration(150)		
            .style("opacity", 0);
	
}

// Render the graph vizu
function re_render(root_node, initial_render=false) {
	g.graph().transition = function(selection) {
      return selection.transition().duration(1000);
    };


	// re-render
	var render = new dagreD3.render();
    render(inner, g);

   	if(initial_render) {
		//zoom_handler.translateBy(svg, (width/2) - g.graph().width + 200,   (height/2) - (g.node(root_node).y)); //g.node(root_node).y
		zoom_handler.transform(svg, d3.zoomIdentity.scale(1));

		zoom_handler.scaleBy(svg, DEFAULT_SCALE);
		zoom_handler.translateBy(svg, (width*DEFAULT_SCALE/2) - g.node(root_node).x + 200,   (height*DEFAULT_SCALE/2) - (g.node(root_node).y));
	} else {
		centerGraphOnPoint(root_node);
	}

	zoom_handler.on('start', function() {
		hide_tooltip();
	})

	set_node_listeners();
}

// Set the listeners for all the nodes (clicks, mouse hover, ...)
function set_node_listeners() {
	svg.selectAll("g.node")
		.on("click", function(short_url) {

	  		var clickedNode = currNodes.filter(function( obj ) {
			  return obj.short_url == short_url;
			});

			if(clickedNode && clickedNode[0].isDescendant) {
				// If the clicked word is already a descendant, get its ancestors
				get_ancestors_from_short_url(short_url, true);
			} else {
				currRoot = short_url;
				get_descendants(short_url);
			}

	  	})
	  	.on("mouseover", function(d) {
	  	   let wiktionaryLink = wiktionaryLinkMap[d];

	  	   var xScale = height / g.graph().height;
	  	   var yScale = width / g.graph().width;
	       div.transition()
	         .duration(200)
	         .style("opacity", .9);
	       div .html(
	         '<a href= "' + wiktionaryLink + '" target="_blank">' + "Wiktionary page" + "</a>" + 
	         "<br/>" )     
	         .style("left", (d3.event.pageX) + "px")          
	         .style("top", (d3.event.pageY - 25) + "px");
	    });
	    
}

function centerGraphOnPoint(node, delay=500, duration=700) {
	if(!node){
		return;
	}

	function transform_fun() {
	  return d3.zoomIdentity
	      .translate((width/2)-g.node(node).x, (height/2)-g.node(node).y);
	}

	svg.transition()
      .delay(delay)
      .duration(duration)
      .call(zoom_handler.transform, transform_fun);
}

// Listener for the show cluster checkbox
function showClustersListener(checkbox) {
	reset_graph();
	add_to_dagre_vizu(currNodes, currEdges, currRoot);
}

// Listener for the no reset checkbox
function noResetListener(checkbox) {
	noReset = checkbox.checked;
}

function goToRootNodeButtonListener() {
	centerGraphOnPoint(currRoot, 0);
	
}

function selectedExampleListener() {
	console.log('ex');
	var select = document.getElementById('wordlist');
	var word = select.value;
	get_ancestors(word);
}


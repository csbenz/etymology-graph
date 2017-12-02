
// Create the input graph
var g = new dagreD3.graphlib.Graph({compound:true}).setGraph({});
g.setGraph({
	nodesep: 70,
	ranksep: 50,
	rankdir: "LR",
	marginx: 20,
	marginy: 20
});

// Add an array of states (node names)
function add_nodes(states) {
	states.forEach(add_node);
}

function add_node(state) {
	g.setNode(state, { label: state });
}

function add_edge(from, to, label_name) {
	g.setEdge(from, to, { label: label_name });
}

function add_cluster(cluster) {
	g.setNode(cluster, {label: cluster, clusterLabelPos: 'top', style: 'fill: #d3d7e8'});
}

function set_cluster(node, cluster) {
	g.setParent(node, cluster);
}

// Color a node
function set_root_node(state) {
	g.node(state).style = "fill: #f77";
}

function style_node_default(state) {
	var node = g.node(state);
  	node.rx = node.ry = 5;
}

function set_from_json(json_tree) {

	// Create root
	var root_node = json_tree['name'];
	add_node(root_node);
	set_root_node(root_node);
	style_node_default(root_node);

	child_iter(json_tree);


	var render = new dagreD3.render();
	render(inner, g);
}

function child_iter(node) {
	var name = node['name'];
	var children = node['children'];


	children.forEach(function(child) {
		var child_name = child['name'];
		var child_language_name = child['language_name'];
		var child_children = child['children'];

		add_node(child_name);
		style_node_default(child_name);

		//add_cluster(child_language_name);
		//set_cluster(child_name, child_language_name);

		add_edge(child_name, name, '');

		if(child_children) {
			child_iter(child);
		}
	});



}



var margin = {top: 20, right: 90, bottom: 50, left: 90};
var width = 1000 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var svg = d3.select(".core_div").append("svg")
	//.attr("width", width + margin.right + margin.left)
    //.attr("height", height + margin.top + margin.bottom);
	.attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height);
var inner = svg.append("g");
	//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Run the renderer. This is what draws the final graph.
var render = new dagreD3.render();
render(inner, g);


/* 
 * ZOOM BEHAVIOUR         
 */       
var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);

function zoom_actions(){
  inner.attr("transform", d3.event.transform);
}

zoom_handler(svg);

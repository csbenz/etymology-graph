
// Create the input graph
var g = new dagreD3.graphlib.Graph().setGraph({});
 g.setGraph({
    nodesep: 70,
    ranksep: 50,
    rankdir: "RL",
    marginx: 20,
    marginy: 20
  });

add_nodes(["Yuyu", "Toftof"]);
add_edge("Yuyu", "Toftof", "Love");

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

// Color a node
function set_root_node(state) {
	g.node(state).style = "fill: #f77";
}

// Set some general styles
g.nodes().forEach(function(v) {
  var node = g.node(v);
  node.rx = node.ry = 5;
});

// Set up zoom support



// -----------------------------------------------------------------
/*
// Fill node "A" with the color green
g.setNode("A", { style: "fill: #afa" });

// Make the label for node "B" bold
g.setNode("B", { labelStyle: "font-weight: bold" });

// Double the size of the font for node "C"
g.setNode("C", { labelStyle: "font-size: 2em" });

g.setNode("D", {});

g.setNode("E", {});

// Make the edge from "A" to "B" red, thick, and dashed
g.setEdge("A", "B", {
  style: "stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;",
  arrowheadStyle: "fill: #f66"
});

// Make the label for the edge from "C" to "B" italic and underlined
g.setEdge("C", "B", {
  label: "A to C",
  labelStyle: "font-style: italic; text-decoration: underline;"
});

// Make the edge between A and D smoother. 
// see available options for lineInterpolate here: https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate
g.setEdge("A", "D", {
  label: "line interpolation different",
  lineInterpolate: 'basis' 
});

g.setEdge("E", "D", {});

// Make the arrowhead blue
g.setEdge("A", "E", {
  label: "Arrowhead class",
  arrowheadClass: 'arrowhead'
});

 */

var margin = {top: 20, right: 90, bottom: 50, left: 90},
    width = 1880 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select(".core_div").append("svg")
	.attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom);
	//.attr("preserveAspectRatio", "xMinYMin meet")
    //.attr("viewBox", "0 0 " + width + " " + height);
var inner = svg.append("g");
	//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Run the renderer. This is what draws the final graph.
var render = new dagreD3.render();
render(inner, g);

//svg.attr('height', g.graph().height * initialScale + 40);

/* 
 * ZOOM BEHAVIOUR         
 */       
      
var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);

function zoom_actions(){
  inner.attr("transform", d3.event.transform);
}


zoom_handler(svg);


/*// Create the renderer
var render = new dagreD3.render();


var margin = {top: 20, right: 90, bottom: 50, left: 90},
    width = 1880 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;



// Set up an SVG group so that we can translate the final graph.
var svg = d3.select(".core_div").append("svg")
	.attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height);
var inner = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Run the renderer. This is what draws the final graph.
render(inner, g);

// Center the graph
var xCenterOffset = (svg.attr("width")) / 2;
inner.attr("transform", "translate(" + xCenterOffset + ", 20)");
svg.attr("height", g.graph().height + 40);

*/
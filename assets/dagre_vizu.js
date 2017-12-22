
// Create the input graph
var g;
reset_graph();

function add_node(state, name) {
	g.setNode(state, {
		label: name
	});
	//g.node(state).label = "<div>aa</div>";
}

function add_edge(from, to, label_name) {
	g.setEdge(from, to, {
		label: label_name,
		curve: d3.curveBasis
	});
}

function add_cluster(cluster) {
	//var rColor = strToHexColor(cluster);
	var rColor = 'd3d7e8';
	g.setNode(cluster, {label: cluster, clusterLabelPos: 'top', style: 'fill: #' + rColor});
	g.node(cluster).rx = 5;
}

function set_cluster(node, cluster) {
	g.setParent(node, cluster);
}

// Color a node
function set_root_node_style(state) {
	g.node(state).style = "fill: #f77";
}

function style_node_default(state) {
	var node = g.node(state);
  	node.rx = node.ry = 5;
}

var current_json;
var noReset = false;

function reset_graph() {
	if(!noReset) {
		g = new dagreD3.graphlib.Graph({directed:true, compound:true, multigraph:false}).setGraph({});
		g.setGraph({
			nodesep: 70,
			ranksep: 50,
			rankdir: "LR",
			marginx: 20,
			marginy: 20
			//ranksep: 25
		});
	}
}

function clear() {
	current_json = [];
	reset_graph();
}

function add_to_dagre_vizu(nodes, edges, root_node) {
	console.log(nodes);
	console.log(edges);

	clear();

	addNodes(nodes);
	addEdges(edges);

	g.graph().transition = function(selection) {
      return selection.transition().duration(500);
    };

	re_render(root_node);
	set_node_listeners();


}


function addNodes(nodes) {
	for(i = 0; i < nodes.length; ++i) {
		let cNode = nodes[i];
		add_node(cNode.short_url, cNode.name);
		style_node_default(cNode.short_url);

		if(cNode.isRoot) {
			set_root_node_style(cNode.short_url);
		}
	}
}

function addEdges(edges) {
	for(i = 0; i < edges.length; ++i) {
		let cEdge = edges[i];
		add_edge(cEdge.source, cEdge.target, cEdge.language);
	}
}

function re_render(root_node) {
	// re-render
	var render = new dagreD3.render();
    render(inner, g);

console.log(height);
console.log(g.graph().width);
    // Reset zoom
	zoom_handler.transform(svg, d3.zoomIdentity.scale(1));

	zoom_handler.translateBy(svg, width - g.graph().width,  (height/2) + (g.graph().width/2)); //g.node(root_node).y

	zoom_handler.on('start', function() {
		 div.transition()		
            .duration(150)		
            .style("opacity", 0);
	})

	/*

	var scale = width / g.graph().width; //Math.min(width / g.graph().width, height / g.graph().width);;
	zoom_handler.scaleBy(svg, scale);

	zoom_handler.translateBy(svg, (width/(2*scale)  - width),  (height/2) - (g.node(root_node_id).y));


	var scale = width / g.graph().width; //Math.min(width / g.graph().width, height / g.graph().width);;
	//zoom_handler.scaleBy(svg, scale);
	//zoom_handler.translateBy(svg, (width  - (g.graph().width ))* scale*2,  (height/2) - (g.node(root_node_id).y));

	zoom_handler.scaleBy(svg, scale);
	var screenOrigin = 960;
	zoom_handler.translateBy(svg, screenOrigin - (screenOrigin - this.zoom.translate()[0]) * scale / this.zoom.scale(),  (height/2) - (g.node(root_node_id).y)); // (width/2 - (g.node(root_node_id).x - width)) * scale

	
	console.log(width + " " + g.graph().width + " " + scale);
*/
}

var div = d3.select("#vizu_svg").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function set_node_listeners() {
	svg.selectAll("g.node")
		.on("click", function(id) {
	  		getDescendents(id);
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
	         .style("left", (d3.event.pageX) + "px")   //d3.page.eventX           
	         .style("top", (d3.event.pageY - 25) + "px");
	    });
	    
}







function child_iter(node, show_clusters) {
	var parent_id = node['short_url'];
	var children = node['children'];

	if(!children) {
		return;
	}

	//setTimeout(function(){
		children.forEach(function(child) {
			var child_name = child['name'];
			var child_id = child['short_url'];
			var child_language_name = child['language_name'];
			var child_children = child['children'];

			var label_name = get_node_label_text(child_name, child_language_name);
			var edge_name = show_clusters ? '' : child_language_name;

		    add_node(child_id, label_name);
			style_node_default(child_id);

			add_edge(child_id, parent_id, edge_name);

			if(show_clusters) {
				add_cluster(child_language_name);
				set_cluster(child_id, child_language_name);
			}
			
			if(child_children) {
				child_iter(child, show_clusters);
			}			
		});
		// re-render
	//	var render = new dagreD3.render();
	//	render(inner, g);
	//}, 0);
}

function get_node_label_text(name, language_name) {
	return name;
	//return name + "\n" + "<span style='font-size:16px'>" + language_name + "</span>";
}

function showClustersListener(checkbox) {
	reset_graph();
	set_from_json(current_json, checkbox.checked == true);
}

function noResetListener(checkbox) {
	noReset = checkbox.checked;
}

/*

var svgParentDiv = document.getElementById("cshow_cluster_div");
var pWidth = svgParentDiv.clientWidth;
var pHeight = svgParentDiv.clientHeight;

console.log(pWidth + " " + pHeight)
*/

var margin = {top: 20, right: 0, bottom: 0, left: 0};
var width = 1000 - margin.left - margin.right;
var height = 420 - margin.top - margin.bottom;

var svg = d3.select("#vizu_svg").append("svg")
	//.attr("width", width + margin.right + margin.left)
    //.attr("height", height + margin.top + margin.bottom);
    .attr("id", "svg_container")
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
function zoom_actions(){
  inner.attr("transform", d3.event.transform);
}

var zoom_handler = d3.zoom()
    	.on("zoom", zoom_actions);
zoom_handler(svg);


function strToHexColor(str) {
	return intToRGB(hashCode(str));
}

function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}
var width = 960,
    height = 500;
/*
var color = d3.scaleOrdinal(d3.schemeCategory20);


var nodes = [],
    links = [];

var force = cola.d3adaptor(d3)
    .nodes(nodes)
    .links(links)
    //.linkDistance(30)
    .size([width, height])
    .on("tick", tick)
    .symmetricDiffLinkLengths(5)
    .start(30)
    .avoidOverlaps(true);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll(".node");
var link = svg.selectAll(".link");


function start() {
	console.log('a');
    link = link.data(force.links(), function (d) { return d.source.id + "-" + d.target.id; });
    console.log(link);
    // Initial end positions are at the source... that way when we add a new target node with transitions,
    // the edges appear to grow out of the source
    
    link.enter().insert("line", ".node").attr("class", "link")
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.source.x; })
        .attr("y2", function (d) { return d.source.y; });
    link.exit().remove();
    	console.log(force.nodes());


    node = node.data(force.nodes(), function (d) { return d.id; });
    console.log(node);

    node.enter()
    	.append("circle")
    	.attr("class", function (d) { return "node " + d.id; })
    	.attr("r", 20);
    node.exit().remove();
    force.start();
    	console.log('c');

}

function tick() {
    node.transition().attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
    link.transition().attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
}

function display_cola_vizu(json_tree) {
    var a = { id: "a" }, b = { id: "b" }, c = { id: "c" };
    nodes.push(a, b, c);
    links.push({ source: a, target: b }, { source: a, target: c }, { source: b, target: c });
    start();
}
*/
//------------


var nodes = [],
    links = [];



var color = d3.scaleOrdinal(d3.schemeCategory20);

var cola = cola.d3adaptor(d3)
	.nodes(nodes)
    .links(links)
    .symmetricDiffLinkLengths(30)
    .on("tick", tick)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll(".node");
var link = svg.selectAll(".link");


var a = { id: "a" }, b = { id: "b" }, c = { id: "c" };
nodes.push(a, b, c);
links.push({ source: a, target: b }, { source: a, target: c }, { source: b, target: c });

function start() {
	/*
	console.log('a');
    link = link.data(force.links(), function (d) { return d.source.id + "-" + d.target.id; });
    console.log(link);
    // Initial end positions are at the source... that way when we add a new target node with transitions,
    // the edges appear to grow out of the source
    
    link.enter().insert("line", ".node").attr("class", "link")
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.source.x; })
        .attr("y2", function (d) { return d.source.y; });
    link.exit().remove();
    	console.log(force.nodes());


    node = node.data(force.nodes(), function (d) { return d.id; });

    node.enter()
    	.append("circle")
    	.attr("class", function (d) { return "node " + d.id; })
    	.attr("r", 20);
    node.exit().remove();
    force.start();
    */

/////////////////////////////////////////
/*
	cola.nodes(nodes)
        .links(links)
        .symmetricDiffLinkLengths(30)
        .start(30);
        */
        
   // link = link.data(cola.links(), function (d) { return d.source.id + "-" + d.target.id; });
   //link= cola.links();
    link = link.data(links, function (d) { return d.source.id + "-" + d.target.id; })
    	.enter().append("line")
        .attr("class", "link")
        .style("stroke-width", 2)
        .style("stroke", "#ff00ff"); //function (d) { return Math.sqrt(d.value);
    //link = links;

	//link.exit().remove();
   // node = node.data(cola.nodes(), function (d) { return d.id; });
   	//node = cola.nodes();

	node = node.data(nodes, function (d) { return d.id; })
	    .enter().append("circle")
        .attr("class", "node")
        .attr("r", 30)
        .style("fill", function (d) { return color(d.group); })
        .call(cola.drag);
    //node =  nodes;
        //.on("click", function (d) {
         //   d.fixed = true;
        //})
        //.call(cola.drag);

    //node.append("title")
    //    .text(function (d) { return d.name; });

    cola.on("tick", function () {
        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
    });
    cola.start();

}

function display_cola_vizu(json_tree) {
	
	
	d3.json("assets/coladata.json", function (error, graph) {
	    
	    start();
	    
	});

}



function showClustersListener(checkbox) {
	var a = nodes[0], b = nodes[1], c = nodes[2], d = { id: "d", x: 0, y: 0 };
    nodes.push(d);
    links.push({ source: a, target: b }, { source: c, target: b });
    start();
    
}



function tick() {
    node.transition().attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
    link.transition().attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
}
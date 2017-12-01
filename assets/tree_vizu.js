
const NODE_HEIGHT = 28;

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 50, left: 90},
    width = 1880 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".core_div").append("svg")
    //.attr("width", width + margin.right + margin.left)
    //.attr("height", height + margin.top + margin.bottom)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0; // For node id
var duration = 0;
var root;

// Arrow
svg.append("svg:defs").selectAll("marker")
    .data(["end"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 17)
    .attr("refY", 0)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5").style('fill', '#CCC');

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

function display_vizu(json_tree) {
    // Assigns parent, children, height, depth
    root = d3.hierarchy(json_tree, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = width;

    // Collapse after the second level
    //root.children.forEach(collapse);

    update(root);
}


// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  var treeData = treemap(root);

  var nodes = treeData.descendants();
  var links = treeData.descendants().slice(1);

  nodes.forEach(function(d){d.y = width - 200 - (d.depth * 180)});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  /*
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });
      */
  nodeEnter.append('rect')
      .attr('class', 'node')
      .attr("width", function(d) { return get_text_width(d.data.name)})
      .attr("height", NODE_HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr('cursor', 'pointer')
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "lightsteelblue";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".36em")
      .attr("x", function(d) {
          return get_text_width(d.data.name) - 7;
      })
      .attr("y", function(d) {
          return NODE_HEIGHT/2;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "end";
      })
      .text(function(d) { return d.data.name; });

   nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? get_text_width(d.data.name) : get_text_width(d.data.name);
      })
      .attr("y", function(d) {
          return d.children || d._children ? NODE_HEIGHT*1.5 : NODE_HEIGHT*1.5;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "end";
      })
      .text(function(d) { return "(" + d.data.language_name + ")"; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + (d.y  - get_text_width(d.data.name) / 2) + "," + (d.x - NODE_HEIGHT/2) + ")";
     });

  function get_text_width(text) {
  	return text.length * 8 + 15;
  }
  // Update the node attributes and style
  /*
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');
    */


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  /*
  nodeExit.select('circle')
    .attr('r', 1e-6);
    */

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      })
      .attr("marker-end", "url(#end)");

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent)}); //.projection(function(e) { return [e.x, width - e.y]}) })

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  function click(d) {

  	window.open(d.data.wiktionary_link);
/*
  	// TODO load new tree from clicked node
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
    */
  }

}

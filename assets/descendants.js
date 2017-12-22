
// Query the database for the descendants of a word, create the descendant tree, and render the descendant graph
function getDescendents(root_short_url) {
	var jsonQuery = 'http://etytree-virtuoso.wmflabs.org/sparql?default-graph-uri=&query=SELECT+*+{{+SELECT+DISTINCT+?descendant1+?label1+{++++?descendant1+dbetym:etymologicallyRelatedTo*+<${root_short_url}>+.++++OPTIONAL+{++++++++?descendant1+rdfs:label+?tmp1++++++++BIND+(STR(?tmp1)+AS+?label1)++++}+}}+}+&format=application/sparql-results+json&timeout=0&debug=on';

	var csvQuery =  `https://etytree-virtuoso.wmflabs.org/sparql?default-graph-uri=&query=SELECT+*+{{+`
		+ `SELECT+DISTINCT+?descendant1+?label1+{++++?descendant1+dbetym:etymologicallyRelatedTo*+<${root_short_url}>`
		+ `+.++++OPTIONAL+{++++++++?descendant1+rdfs:label+?tmp1++++++++BIND+(STR(?tmp1)+AS+?label1)++++}+}}+}+&format=text/csv&timeout=0&debug=on`;
	
	var request = createCORSRequest("get", csvQuery);

	if (request){
      request.onload = function(){

	      let allDescendents = d3.csvParse(request.responseText);
	      createDesendantTree(allDescendents, root_short_url);

      };
      request.onerror = function() {
            reject(new Error("Network Error"));
      };

      request.send();      
    } else {
      return;
    }
}

// Create and render the descendants of a word
function createDesendantTree(allDescendents, root_short_url) {

  var allDescendantNames = allDescendents.map(x => x.descendant1);


  let promises = [];
  allDescendents.forEach(function(descendent) {
  	var short_url = descendent.descendant1;
  	var name = descendent.label1;
  	var language_code = get_language_code(short_url);

    promises.push(getDirectAncestorsOnly(short_url, allDescendantNames, root_short_url));
  });

  Promise.all(promises).then(function() {
	re_render(root_short_url);
  });
}

// Get the direct ancestors for a given word
function getDirectAncestorsOnly(short_url, allDescendents, root_short_url) {
	return new Promise(function(resolve, reject) {
		let part1 = 'https://etytree-virtuoso.wmflabs.org/sparql?query=define%20sql%3Adescribe-mode%20%22CBD%22%20%20DESCRIBE%20%3Chttp%3A%2F%2F';
	    let part2 = short_url.substring(7); // remove http:// at beginning of string
	    let part3 = '%3E&output=text%2Fcsv';
	    let url = part1 + part2 + part3;

	    var request = createCORSRequest("get", url);

	    if (request){
	      request.onload = function(){

	          let ancestorsLines = d3.csvParse(request.responseText);

	          var word_name; // TODO get before looping
	          var etymologicallyRelatedTo = [];
	          var wiktionaryLink;
	          
	          ancestorsLines.forEach(function(d) {

	                 if(d.predicate.includes('label')) {
	                    word_name = d.object;
	                 } else if(d.predicate.includes('etymologicallyRelatedTo')) {
	                  let ancestor_short_url = d.object;
	                  etymologicallyRelatedTo.push(d.object);

	                  console.log('is related to: ' + ancestor_short_url);

	                 } else if(d.predicate.includes('etymologicallyEquivalentTo')) {
	                  let equivalentWord = d.object;
	                  console.log('Equivalent to: ' + equivalentWord);
	                 } else if(d.predicate.includes('http://www.w3.org/2000/01/rdf-schema#seeAlso')) {
	                  wiktionaryLink = d.object;
	                  wiktionaryLinkMap[short_url] = wiktionaryLink;
	                 }
	              });

	          let language_code = get_language_code(short_url);
  			  let language_name = get_language_name(language_code);

	          let nodeItem = {};
			  nodeItem["name"] = word_name;//equs.map(x => wordNameMap[x]).join(", ");
			  nodeItem["short_url"] = short_url;
			  nodeItem["language_code"] = language_code;
			  nodeItem["language_name"] = language_name;
			  nodeItem["wiktionary_link"] = wiktionaryLink;

			  if(root_short_url == short_url){
			    nodeItem["isSecondOrderRoot"] = true;
			  } else {
			  	nodeItem["isDescendant"] = true;
			  }

			  addNodeToVizu(nodeItem);

			  etymologicallyRelatedTo.forEach(function(ancestor_short_url) {
		  		if(allDescendents.includes(ancestor_short_url)) {
		  			var newEdge = {
				      source: ancestor_short_url,
				      target: short_url,
				      language: language_name
				    }
				    addEdgeToVizu(newEdge);
                  }
			  });
	            
	          resolve(short_url);

	      };
	      request.onerror = function() {
	            reject(new Error("Network Error"));
	      };
	      request.send();      
	    } else {
	      reject();
	      return;
	    }
	});
}

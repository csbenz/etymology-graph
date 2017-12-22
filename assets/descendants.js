
function export_table_to_csv(html, filename) {
	var csv = [];
	var rows = document.querySelectorAll("table tr");
	
    for (var i = 0; i < rows.length; i++) {
		var row = [], cols = rows[i].querySelectorAll("td, th");
		
        for (var j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        
		csv.push(row.join(","));		
	}

    // Download CSV
    download_csv(csv.join("\n"), filename);
}

class Data {
	constructor() {
		this.traversedWords = [];

		//Map of lists, key is short_url and value is all ancestors
		this.ancestorMap = {};

		//Map of lists, key is short_url and value is short_url of all equivalent words
		this.equivalentMap = {};

		//Map of lists, key is short_url and value is short_url of all equivalent words
		this.wordNameMap = {};

		// Map of 'tuple' ([array of equivalent words, ancestors])
		this.AncestorTree = [];

		this.wiktionaryLinkMap = {};

		this.treatedWords = [];
	}
}


function getDescendents(root_short_url) {
	queryDescendants(root_short_url);
}

function queryDescendants(root_short_url) {
	//let data = new Data();
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

function createDesendantTree(allDescendents, root_short_url) {

  var allDescendantNames = allDescendents.map(x => x.descendant1);

  let descendantNodes = [];
  allDescendents.forEach(function(descendent) {
  	var short_url = descendent.descendant1;
  	var name = descendent.label1;
  	var language_code = get_language_code(short_url);


    if(!g.nodes().includes(short_url) && short_url != root_short_url) {
    	add_node(short_url, name);
    } else {
    	console.log('Ignored already existing descendant: ' + short_url);
    }

    getDirectAncestorsOnly(short_url, allDescendantNames).then(function(result) {
    	console.log('got dir anc for   ' + result);
    });

  	re_render(root_short_url);

  	//add_node();
  	//search_root_short_url(url);

  });
}

function getDirectAncestorsOnly(short_url, allDescendents) {
	return new Promise(function(resolve, reject) {
		let part1 = 'https://etytree-virtuoso.wmflabs.org/sparql?query=define%20sql%3Adescribe-mode%20%22CBD%22%20%20DESCRIBE%20%3Chttp%3A%2F%2F';
	    let part2 = short_url.substring(7); // remove http:// at beginning of string
	    let part3 = '%3E&output=text%2Fcsv';
	    let url = part1 + part2 + part3;

	    var request = createCORSRequest("get", url);

	    if (request){
	      request.onload = function(){

	          let aa = d3.csvParse(request.responseText);

	          let promisess = [];
	          
	          aa.forEach(function(d) {

	                 if(d.predicate.includes('label')) {
	                    let word_name = d.object;
	                    console.log('Word: ' + word_name);
	                    //addWordName(short_url, word_name);

	                 } else if(d.predicate.includes('etymologicallyRelatedTo')) {
	                  let ancestor_short_url = d.object;
	                  console.log('is related to: ' + ancestor_short_url);
	                  console.log(allDescendents);
	                  if(allDescendents.includes(ancestor_short_url)) {
	                  	console.log('Adding edge: ' + ancestor_short_url + ' TO ' + short_url);
	                  	add_edge(ancestor_short_url, short_url, 'new');
	                  	re_render(short_url);
	                  } else {
	                  	console.log('no link');
	                  }
	                  //add_edge(ancestor_short_url, short_url, 'new');
	                 // re_render(short_url);

	                  //addAncestor(short_url, ancestor_short_url);

	                 // promisess.push(search_url(ancestor_short_url, depth + 1));

	                 } else if(d.predicate.includes('etymologicallyEquivalentTo')) {
	                  let equivalentWord = d.object;
	                  console.log('Equivalent to: ' + equivalentWord);
	                  //addEquivalent(short_url, equivalentWord);
	                 } else if(d.predicate.includes('http://www.w3.org/2000/01/rdf-schema#seeAlso')) {
	                  let wiktionaryLink = d.object;
	                  //wiktionaryLinkMap[short_url] = wiktionaryLink;
	                 }
	              });
	            

	          resolve(short_url);
	/*
	        Promise.all(promisess).then(function() {
	          resolve(short_url);
	        });
	        */

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


function getDescendentsGo(short_url) {
	/*
	var query = `https://etytree-virtuoso.wmflabs.org/sparql?query=`
		+ `SELECT * { { SELECT DISTINCT ?descendant1 ?label1 ?ee ?labele{    ?descendant1`
		+ `dbetym:etymologicallyRelatedTo* <{short_url}> .    `
		+ `OPTIONAL {        ?descendant1 rdfs:label ?tmp1        BIND (STR(?tmp1) AS ?label1)    }    ?ee rdf:type dbetym:EtymologyEntry .    `
		+ `?descendant1 dbnary:describes ?ee .    OPTIONAL {        ?ee rdfs:label ?tmp        BIND (STR(?tmp) AS ?labele)    } }}} `;
		*/

	/*

	var query = 'SELECT * {{ SELECT DISTINCT ?descendant1 ?label1 {    ?descendant1 '
		+ 'dbetym:etymologicallyRelatedTo* <${short_url}> .    OPTIONAL {        '
		+ '?descendant1 rdfs:label ?tmp1        BIND (STR(?tmp1) AS ?label1)    } }} } ';
*/
	noReset = true;

	var jsonQuery = 'http://etytree-virtuoso.wmflabs.org/sparql?default-graph-uri=&query=SELECT+*+{{+SELECT+DISTINCT+?descendant1+?label1+{++++?descendant1+dbetym:etymologicallyRelatedTo*+<${short_url}>+.++++OPTIONAL+{++++++++?descendant1+rdfs:label+?tmp1++++++++BIND+(STR(?tmp1)+AS+?label1)++++}+}}+}+&format=application/sparql-results+json&timeout=0&debug=on';

	var csvQuery =  `https://etytree-virtuoso.wmflabs.org/sparql?default-graph-uri=&query=SELECT+*+{{+`
		+ `SELECT+DISTINCT+?descendant1+?label1+{++++?descendant1+dbetym:etymologicallyRelatedTo*+<${short_url}>`
		+ `+.++++OPTIONAL+{++++++++?descendant1+rdfs:label+?tmp1++++++++BIND+(STR(?tmp1)+AS+?label1)++++}+}}+}+&format=text/csv&timeout=0&debug=on`;
	
	var request = createCORSRequest("get", csvQuery);

	if (request){
      request.onload = function(){

	      let aa = d3.csvParse(request.responseText);

	     // let promisess = [];
	      aa.forEach(function(d) {
	      	var url = d.descendant1;
	      	var label = d.label1;
	      	console.log('DESCENDANT ------------------------------------');
	      	console.log(label);

	      	console.log('URLL' + url);
	      	search_root_short_url(url);

/*
	         if(d.predicate.includes('label')) {
	            let word_name = d.object;
	            console.log('Word: ' + word_name);
	            addWordName(short_url, word_name);

	         } else if(d.predicate.includes('etymologicallyRelatedTo')) {
	          let ancestor_short_url = d.object;
	          console.log('is related to: ' + ancestor_short_url);

	          addAncestor(short_url, ancestor_short_url);

	          //promisess.push(search_url(ancestor_short_url, deepness + 1));

	         } else if(d.predicate.includes('etymologicallyEquivalentTo')) {
	          let equivalentWord = d.object;
	          console.log('Equivalent to: ' + equivalentWord);
	          addEquivalent(short_url, equivalentWord);
	         } else if(d.predicate.includes('http://www.w3.org/2000/01/rdf-schema#seeAlso')) {
	          let wiktionaryLink = d.object;
	          wiktionaryLinkMap[short_url] = wiktionaryLink;
	         }
	         */
	      });
/*
           Promise.all(promisess).then(function() {
             resolve(short_url);
           });
           */

      };
      request.onerror = function() {
            reject(new Error("Network Error"));
      };

      request.send();      
    } else {
      //reject();
      return;
    }
}
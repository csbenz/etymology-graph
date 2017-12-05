
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


function getDescendents(short_url) {
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

	var csvQuery =  `http://etytree-virtuoso.wmflabs.org/sparql?default-graph-uri=&query=SELECT+*+{{+`
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
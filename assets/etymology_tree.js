import * as d3 from 'd3';

const MAX_DEPTH = 11;

var rootWord = "";

// List, keeps track of the traversed short_urls
var traversedWords = [];

//Map of lists, key is short_url and value is all ancestors
var ancestorMap = {};

//Map of lists, key is short_url and value is short_url of all equivalent words
var equivalentMap = {};

//Map of lists, key is short_url and value is short_url of all equivalent words
var wordNameMap = {};

// Map of 'tuple' ([array of equivalent words, ancestors])
var AncestorTree = [];

var treatedWords = [];

function addAncestor(short_url, ancestor) {
  ancestorMap[short_url] = ancestorMap[short_url] || [];
  ancestorMap[short_url].push(ancestor);
}

function addEquivalent(short_url, equi) {
  equivalentMap[short_url] = equivalentMap[short_url] || [];
  equivalentMap[short_url].push(equi);
}

function addWordName(short_url, name) {
  wordNameMap[short_url] = wordNameMap[short_url] || [];
  wordNameMap[short_url].push(name);
}

function removeDuplicates(num) {
  var x,
      len=num.length,
      out=[],
      obj={};
 
  for (x=0; x<len; x++) {
    obj[num[x]]=0;
  }
  for (x in obj) {
    out.push(x);
  }
  return out;
}

function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        xhr.open(method, url, false); // true = async
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

function search_root_word(word) {
  let short_url = `http://etytree-virtuoso.wmflabs.org/dbnary/eng/__ee_1_${word}`;

  // Initialize vars
  rootWord = short_url;
  traversedWords = [];
  ancestorMap = {};
  equivalentMap = {};
  wordNameMap = {};
  AncestorTree = [];
  treatedWords = [];

  // Let's go babe
  search_url(short_url, 0);
}


function search_url(short_url, deepness) {
  if(deepness > MAX_DEPTH) {
    return;
  }

  if(traversedWords.includes(short_url)) {
    return;
  }

  traversedWords.push(short_url);

  let part1 = 'http://etytree-virtuoso.wmflabs.org/sparql?query=define%20sql%3Adescribe-mode%20%22CBD%22%20%20DESCRIBE%20%3Chttp%3A%2F%2F';
  let part2 = short_url.substring(7); // remove http:// at beginning of string
  let part3 = '%3E&output=text%2Fcsv';
  let url = part1 + part2 + part3;

  //console.log(url);

  var request = createCORSRequest("get", url);
  if (request){
      request.onload = function(){
          let aa = d3.csvParse(request.responseText);
          aa.forEach(function(d) {

                 if(d.predicate.includes('label')) {
                    let word_name = d.object;
                    console.log('Word: ' + word_name);
                    addWordName(short_url, word_name);

                 } else if(d.predicate.includes('etymologicallyRelatedTo')) {
                  let ancestor_short_url = d.object;
                  console.log('is related to: ' + ancestor_short_url);

                  addAncestor(short_url, ancestor_short_url);
                  search_url(ancestor_short_url, deepness + 1);

                 } else if(d.predicate.includes('etymologicallyEquivalentTo')) {
                  let equivalentWord = d.object;
                  console.log('Equivalent to: ' + equivalentWord);
                  addEquivalent(short_url, equivalentWord);
                 }
              });

      };
      request.send();
  }
}

// get all equivalents of word, Checks for equivalents of equivalent words recusively.
function getEquivalents(short_url, acc) {
  acc = acc.concat(short_url);

  let ancestor_equivalents = equivalentMap[short_url] || [];

  ancestor_equivalents.forEach(function(d) {
    if(!acc.includes(d)) {
      //acc = acc.concat(d);
      acc = acc.concat(getEquivalents(d, acc));
    }
  });

  return acc;
}

function getDirectAncestors(short_url) {
  let ancestor = ancestorMap[short_url];
  if(!ancestor) {
    return [];
  }
  let ancestor_equivalents = equivalentMap[ancestor] || [];

  let all_ancestors = ancestor.concat(ancestor_equivalents);

  return all_ancestors;
}


function getDirectAncestorsMany(short_urls) {
  if (!Array.isArray(short_urls)) {
    console.log('NOT AN ARRAY!');
    return [];
  }

  var ancestors = [];

  short_urls.forEach(function(short_url) {
    let direct_ancestors = getDirectAncestors(short_url);
    //console.log('direct ancestors: ' + direct_ancestors);
    ancestors = ancestors.concat(direct_ancestors);
  });

  ancestors = removeDuplicates(ancestors);

  return ancestors;
}

function showTreeRecur(words, deepness) {

  if(!words) {
    return;
  }

  let tabs = "\t".repeat(deepness); 

   words.forEach(function(word) {
    if(treatedWords.includes(word)) {
      return;
    }
    treatedWords.push(word);

    console.log(tabs + 'WORD: ' + wordNameMap[word]);
    let equs = getEquivalents(word, []);
    console.log(tabs + 'equivalent words: ' + equs.map(x => wordNameMap[x]));
    let ancestors = getDirectAncestorsMany(equs);
    console.log(tabs + 'ancestors: ' + ancestors.map(x => wordNameMap[x]));

    showTreeRecur(ancestors, deepness + 1);
  });
}



function handleInput(data) {
    search_root_word(this.value);

    console.log(ancestorMap);
    console.log(equivalentMap);
    console.log(wordNameMap);

    showTreeRecur([rootWord], 0);
}

export function createInputField() {

  var inputElement = document.createElement("input");
  inputElement.type = "text";

  inputElement.addEventListener("change", handleInput, false);
  
  
  var parent = document.getElementById("input_container");
  parent.appendChild(inputElement);

}

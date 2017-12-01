
//enter with this function and the word the user submitted
function handleInput(data) {
    search_root_word(data);

/*
    console.log(ancestorMap);
    console.log(equivalentMap);
    console.log(wordNameMap);

    //load_language_code_map();

   // showTreeRecur([rootWord], 0);

    let jsonTree = createJSONChild(rootWord);
    console.log(JSON.stringify(jsonTree));
    
    display_vizu(jsonTree);
    */
}

const MAX_DEPTH = 15;

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

var wiktionaryLinkMap = {};

var treatedWords = [];

var languageCodeMap = load_language_code_map();

function load_language_code_map() {
  var map = {};
  map['eng'] = "English";

  var psv = d3.dsvFormat(";");
  d3.text("./assets/language_codes.csv",function(error, rows){
    if (error) {
      throw error;
    }
    
    var rowss = psv.parse(rows);
    rowss.forEach(function(line) {
      var language_code = line['code'];
      var language_name = line['canonical name'];

      map[language_code] = language_name;
    });

  });

  return map;
}

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
        xhr.open(method, url, true); // true = async
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
  wiktionaryLinkMap = {};
  promises = [];

  // Let's go babe
  
  console.log('is this it? ' + promises.length);

  //promises.push(search_url(short_url, 0))

  search_url(short_url, 0).then(function(rr) {
    console.log('aaa ' + rr);
    console.log('bbb ' + promises.length);
    //Promise.all(promises).then(function(result) {
      console.log('WOLOLOOOOOOOOOO ' + promises.length);

      console.log(ancestorMap);
      console.log(equivalentMap);
      console.log(wordNameMap);

      //load_language_code_map();

     // showTreeRecur([rootWord], 0);

      //let jsonTree = createJSONChild(rootWord);
      //console.log(JSON.stringify(jsonTree));
      
      treatedWords = [];
      let jsonTree = createJSONChild(rootWord);
      display_vizu(jsonTree);

  /*
      window.setInterval(function(){
        /// call your function here
        treatedWords = [];
        let jsonTree = createJSONChild(rootWord);
        display_vizu(jsonTree);
      }, 300);
  */

    }, function(err) {
      console.log(err);
    });
 // });
}

var promises = [];

function search_url(short_url, deepness) {
  return new Promise(function(resolve, reject) {
    if(deepness > MAX_DEPTH) {
      console.log('this resolved 1 ' +promises.length);
      resolve();
      //return;
    }

    if(traversedWords.includes(short_url)) {
      console.log('this resolved 2 ' +promises.length);
      resolve();
      //return;
    }

    traversedWords.push(short_url);

    let part1 = 'https://etytree-virtuoso.wmflabs.org/sparql?query=define%20sql%3Adescribe-mode%20%22CBD%22%20%20DESCRIBE%20%3Chttp%3A%2F%2F';
    let part2 = short_url.substring(7); // remove http:// at beginning of string
    let part3 = '%3E&output=text%2Fcsv';
    let url = part1 + part2 + part3;

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
                  
                  //promises.push(search_url(ancestor_short_url, deepness + 1));
                  search_url(ancestor_short_url, deepness + 1).then(function(rrrr) {
                    console.log('this resolved 3 ' +promises.length);
                    resolve(short_url);
                  });
                  console.log('--------- ' + promises.length);

                 } else if(d.predicate.includes('etymologicallyEquivalentTo')) {
                  let equivalentWord = d.object;
                  console.log('Equivalent to: ' + equivalentWord);
                  addEquivalent(short_url, equivalentWord);
                 } else if(d.predicate.includes('http://www.w3.org/2000/01/rdf-schema#seeAlso')) {
                  let wiktionaryLink = d.object;
                  wiktionaryLinkMap[short_url] = wiktionaryLink;
                 }
              });

        //console.log('this resolved 3 ' +promises.length);
        //resolve(short_url);
          /*
        setTimeout(function(){
          console.log('this resolved 3 ' +promises.length);
          resolve();
            //do what you need here
        }, 1000);
        */
        

      };
      request.onerror = function() {
            reject(new Error("Network Error"));
      };
      request.send();
      //reject();
      
    } else {
      console.log('this resolved 4 ' +promises.length);
      resolve();
    }
  });
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
    //console.log(tabs + 'equivalent words: ' + equs.map(x => wordNameMap[x]));

    let ancestors = getDirectAncestorsMany(equs);
    //console.log(tabs + 'ancestors: ' + ancestors.map(x => wordNameMap[x]));

    showTreeRecur(ancestors, deepness + 1);
  });
}


function createJSONChild(word) {
  /*
  if(!word) {
    return [];
  }
  */

  let equs = getEquivalents(word, []);

  let language_code = get_language_code(word);
  let language_name = languageCodeMap[language_code];

  let item = {};
  item["name"] = equs.map(x => wordNameMap[x]).join(", ") + " [" + language_name + "]";
  item["language_code"] = language_code;
  item["language_name"] = languageCodeMap[language_code];
  item["wiktionary_link"] = wiktionaryLinkMap[word];

  
  let ancestors = getDirectAncestorsMany(equs);

  let childrenArray = [];
  ancestors.forEach(function(equ) {
    
    if(treatedWords.includes(equ)) {
      return [];
    }
    treatedWords.push(equ);

    
    let child = createJSONChild(equ);

    if(child) {
      childrenArray.push(child);
    }
  });

  if(childrenArray.length > 0) {
    item["children"] = childrenArray;
  }

  return item;
}

function get_language_code(short_url) {
  let prefix = 'http://etytree-virtuoso.wmflabs.org/dbnary/eng/';

  let parts = short_url.replace(prefix, '').split('/');
  let language_code = parts.length > 1 ? parts[0] : 'eng';

  return language_code;
}

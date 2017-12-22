

// Map of code languages to language names (e.g. 'eng' -> 'English')
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


function get_language_code(short_url) {
  let prefix = 'http://etytree-virtuoso.wmflabs.org/dbnary/eng/';

  let parts = short_url.replace(prefix, '').split('/');
  let language_code = parts.length > 1 ? parts[0] : 'eng';

  return language_code;
}

function get_language_name(language_code) {
  let tmp = languageCodeMap[language_code];
  if(!tmp) {
    tmp = languageCodeMap[language_code.slice(0,-1)];
  }

  return tmp;
}


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


var spritesmith = require('spritesmith');
var extend = require('node.extend');
var path = require('path');
var uniq = require('lodash').uniq;

var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var createCSSPropertiesFor = function(coords) {
  return 'background-position: ' + -coords.x + 'px ' + -coords.y + 'px';
};

var normalizeRest = function(rest) {
  rest = rest.replace(/(\s+|\n|\r)/, '');
  rest = rest ? ' ' + rest : rest;
  return rest;
};

var normalizeDelimiter = function(delimiter) {
  return delimiter === '}' ? ';\n}' : ';';
};

var defaultOptions = {
  name: 'sprite.png',
  path: 'images/sprites',
  prefix: '/images/sprites/'
};

var sprite = function(options, cssContent, callback) {
  options = extend(true, {}, defaultOptions, options);

  var prefixRegex = new RegExp(escapeRegExp(options.prefix));
  var urlRegex = new RegExp("url\\((?:'|\")?(" + escapeRegExp(options.prefix) + ".*?)(?:'|\")?\\)(?:(.*?|\\n*?|\\r*?))(;|})", 'gi');

  var extractPaths = function(content) {
    var paths = [];
    var match;

    while (match = urlRegex.exec(content)) {
      paths.push(match[1]);
    }

    return paths;
  };

  var removeBasePath = function(currentPath) {
    return currentPath.replace(prefixRegex, '');
  };

  var findPaths = function(content) {
    return extractPaths(content).map(removeBasePath);
  };

  var createFullPath = function(currentPath) {
    return path.join(options.path, currentPath);
  };

  var replaceUrlsWithSprite = function(content, coords) {
    return content.replace(urlRegex, function(match, path, rest, delimiter) {
      var coord = coords[createFullPath(removeBasePath(path))];
      var css = createCSSPropertiesFor(coord);

      rest = normalizeRest(rest);
      delimiter = normalizeDelimiter(delimiter);

      return 'url(' + options.name + ')' + rest + '; ' + css + delimiter;
    });
  };

  var paths = uniq(findPaths(cssContent));

  spritesmith({ src: paths.map(createFullPath) }, function(err, result) {
    if (err) { return callback(err); }

    var finalCSS = replaceUrlsWithSprite(cssContent, result.coordinates);
    var image = result.image;

    callback(null, finalCSS, image);
  });
};

module.exports = sprite;

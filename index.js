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
  return rest ? ' ' + rest : rest;
};

var normalizeDelimiter = function(delimiter) {
  return delimiter === '}' ? ';\n}' : ';';
};

var extractPaths = function(urlRegex, content) {
  var paths = [];
  var match;

  while (match = urlRegex.exec(content)) {
    paths.push(match[1]);
  }

  return paths;
};

var removeBasePath = function(prefixRegex, currentPath) {
  return currentPath.replace(prefixRegex, '');
};

var findPaths = function(prefixRegex, urlRegex, content) {
  return extractPaths(urlRegex, content).map(function(item) {
    return removeBasePath(prefixRegex, item);
  });
};

var createFullPath = function(basePath, currentPath) {
  return path.join(basePath, currentPath);
};

var replaceUrlsWithSprite = function(urlRegex, prefixRegex, options, content, coords) {
  return content.replace(urlRegex, function(match, path, rest, delimiter) {
    var coord = coords[createFullPath(options.path, removeBasePath(prefixRegex, path))];
    var css = createCSSPropertiesFor(coord);

    rest = normalizeRest(rest);
    delimiter = normalizeDelimiter(delimiter);

    return 'url(' + options.name + ')' + rest + '; ' + css + delimiter;
  });
};

var defaultOptions = {
  name: 'sprite.png',
  path: 'images/sprites',
  prefix: '/images/sprites/'
};

var getFullPaths = function(prefixRegex, urlRegex, basePath, cssContent) {
  var paths = uniq(findPaths(prefixRegex, urlRegex, cssContent));

  return paths.map(function(item) {
    return createFullPath(basePath, item);
  });
};

var sprite = function(options, cssContent, callback) {
  options = extend(true, {}, defaultOptions, options);

  var prefixRegex = new RegExp(escapeRegExp(options.prefix));
  var urlRegex = new RegExp("url\\((?:'|\")?(" + escapeRegExp(options.prefix) + ".*?)(?:'|\")?\\)(?:(.*?|\\n*?|\\r*?))(;|})", 'gi');

  var fullPaths = getFullPaths(prefixRegex, urlRegex, options.path, cssContent);

  spritesmith({ src: fullPaths }, function(err, result) {
    if (err) { return callback(err); }

    var finalCSS = replaceUrlsWithSprite(urlRegex, prefixRegex, options, cssContent, result.coordinates);
    var image = result.image;

    callback(null, finalCSS, image);
  });
};

module.exports = sprite;

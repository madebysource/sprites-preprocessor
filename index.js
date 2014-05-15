var spritesmith = require('spritesmith');
var File = require('vinyl');
var extend = require('node.extend');
var path = require('path');
var uniq = require('lodash').uniq;

var Readable = require('stream').Readable;
var Duplex = require('stream').Duplex;

var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var createCSSPropertiesFor = function(coords) {
  return 'background-position: ' + -coords.x + 'px ' + -coords.y + 'px';
};

var createCSSFile = function(name, content) {
  return new File({
    path: path.basename(name),
    contents: new Buffer(content, 'utf-8')
  });
};

var createImageFile = function(name, content) {
  return new File({
    path: path.basename(name),
    contents: content ? new Buffer(content, 'binary') : null
  });
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

var sprite = function(options) {
  options = extend(true, {}, defaultOptions, options);

  var stream = new Duplex({ objectMode: true });
  stream._read = function() {};

  stream.css = new Readable({ objectMode: true });
  stream.css._read = function() {};

  stream.image = new Readable({ objectMode: true });
  stream.image._read = function() {};

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

  stream._write = function(file, enc, callback) {
    if (file.isNull()) {
      stream.css.push(file);
      return callback();
    }

    var content = file.contents.toString(enc);
    var paths = uniq(findPaths(content));

    spritesmith({ src: paths.map(createFullPath) }, function(err, result) {
      if (err) { return stream.emit('error', err); }

      content = replaceUrlsWithSprite(content, result.coordinates);

      var css = createCSSFile(file.path, content);
      var image = createImageFile(options.name, result.image);

      stream.css.push(css);
      stream.image.push(image);

      stream.push(css);
      stream.push(image);

      stream.emit('end');

      callback();
    });
  };

  return stream;
};

module.exports = sprite;

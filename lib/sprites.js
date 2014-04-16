var spritesmith = require('spritesmith');
var File = require('vinyl');
var extend = require('node.extend');
var path = require('path');

var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

var extractPaths = function(content) {
  var paths = [];
  var regex = /url\('?(\/images\/sprites\/.*?)'?\)/gi;
  var match;

  while (match = regex.exec(content)) {
    paths.push(match[1]);
  }

  return paths;
};

var removeBasePath = function(currentPath) {
  return currentPath.replace(/\/images\/sprites\//, '');
};

var findPaths = function(content) {
  return extractPaths(content).map(removeBasePath);
};

var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var createCSSPropertiesFor = function(coords) {
  return 'background-position: ' + -coords.x + 'px ' + -coords.y + 'px;';
};

var createCSSFile = function(name, content) {
  return new File({
    path: name,
    contents: new Buffer(content, 'utf-8')
  });
};

var createImageFile = function(name, content) {
  return new File({
    path: name,
    contents: content ? new Buffer(content, 'binary') : null
  });
};

var defaultOptions = {
  name: 'sprite.png',
  path: 'images/sprites'
};

var sprite = function(options) {
  options = extend(true, {}, defaultOptions, options);

  var stream = new Writable({ objectMode: true });

  stream.css = new Readable({ objectMode: true });
  stream.css._read = function() {};

  stream.image = new Readable({ objectMode: true });
  stream.image._read = function() {};

  stream._write = function(file, enc, callback) {
    var self = this;

    if (file.isNull()) {
      self.css.push(file);
      return callback();
    }

    var content = file.contents.toString(enc);

    var paths = findPaths(content);

    var createFullPath = function(currentPath) {
      return path.join(options.path, currentPath);
    };

    spritesmith({ src: paths.map(createFullPath) }, function(err, result) {
      if (err) { return stream.emit('error', err); }

      paths.forEach(function(item) {
        var coords = result.coordinates[createFullPath(item)];

        var regex = new RegExp("url\\(/images/sprites\\/" + escapeRegExp(item) + ".*?\\)((.|\\n|\\r)*?)(;|})");
        content = content.replace(regex, 'url(' + options.name + ')$1;\n' + createCSSPropertiesFor(coords) + '$3');
      });

      self.css.push(createCSSFile(file.path, content));
      self.image.push(createImageFile(options.name, result.image));

      stream.emit('end');

      callback();
    });
  };

  return stream;
};

module.exports = sprite;

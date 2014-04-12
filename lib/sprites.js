var through = require('through2');
var spritesmith = require('spritesmith');
var File = require('vinyl');

var extractPaths = function(content) {
  var paths = [];
  var regex = /url\('?(.*?\/sprites\/.*?)'?\)/gi;
  var match;

  while (match = regex.exec(content)) {
    paths.push(match[1]);
  }

  return paths;
};

var removeBasePath = function(path) {
  return path.replace(/^.*\/sprites\//, '');
};

var findPaths = function(content) {
  return extractPaths(content).map(removeBasePath);
};

var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var createCSSPropertiesFor = function(coords) {
  var properties = '';
  properties += '  width: ' + coords.width + 'px;\n';
  properties += '  height: ' + coords.height + 'px;\n';
  properties += '  background-position: ' + -coords.x + 'px ' + -coords.y + 'px;';
  return properties;
};

var createCSSFile = function(name, content) {
  return new File({
    path: 'style.css',
    contents: new Buffer(content, 'utf-8')
  });
};

var createImageFile = function(name, content) {
  return new File({
    path: 'sprite.png',
    contents: new Buffer(content, 'binary')
  });
};

var sprite = function() {
  return through.obj(function(file, enc, callback) {
    var self = this;

    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      this.emit('error streaming is not supported');
      return callback();
    }

    var content = file.contents.toString(enc);

    var paths = findPaths(content);

    var createFullPath = function(path) {
      return file.cwd + '/images/sprites/' + path;
    };

    spritesmith({ src: paths.map(createFullPath) }, function(err, result) {
      if (err) { throw err; }

      paths.forEach(function(item) {
        var coords = result.coordinates[createFullPath(item)];

        var regex = new RegExp("url\\(.*?\\/sprites\\/" + escapeRegExp(item) + ".*?\\);");
        content = content.replace(regex, 'url(sprite.png);\n' + createCSSPropertiesFor(coords));
      });

      self.push(createCSSFile('style.css', content));
      self.push(createImageFile('sprite.png', result.image));

      callback();
    });
  });
};

module.exports = sprite;

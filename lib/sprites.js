var through = require('through2');
var spritesmith = require('spritesmith');

var File = require('vinyl');

var findPaths = function(content) {
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

var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var createCSSPropertiesFor = function(coords) {
  var properties = 'width: ' + coords.width + 'px;\n';
  properties += 'height: ' + coords.height + 'px;\n';
  properties += 'background-position: ' + -coords.x + 'px ' + -coords.y + 'px;';
  return properties;
};

var processCssFile = function(stream, file, callback) {
  var content = file._contents.toString();
  var paths = findPaths(content);
  paths = paths.map(removeBasePath);

  fullPaths = paths.map(function(item) {
    return file.cwd + '/images/sprites/' + item;
  });

  spritesmith({ src: fullPaths }, function(err, result) {
    if (err) { throw err; }

    paths.forEach(function(item) {
      var coords = result.coordinates[file.cwd + '/images/sprites/' + item];

      var regex = new RegExp("url\\(.*?\\/sprites\\/" + escapeRegExp(item) + ".*?\\);");
      content = content.replace(regex, 'url(sprite.png);\n' + createCSSPropertiesFor(coords));
    });

    stream.push(new File({
      path: 'style.css',
      contents: new Buffer(content, 'utf-8')
    }));

    stream.push(new File({
      path: 'sprite.png',
      contents: new Buffer(result.image, 'binary')
    }));

    callback();
  });
};

var sprite = function() {
  var stream = through.obj(function(chunk, enc, callback) {
    processCssFile(stream, chunk, callback);
  });

  return stream;
};

module.exports = sprite;

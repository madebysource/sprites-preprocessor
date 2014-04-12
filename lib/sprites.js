var through = require('through2');
var spritesmith = require('spritesmith');

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

var processCssFile = function(file, callback) {
  var content = file._contents.toString();
  var paths = findPaths(content);
  paths = paths.map(removeBasePath);

  paths = paths.map(function(item) {
    return file.cwd + '/images/sprites/' + item;
  });

  callback();
};

var sprite = function() {
  var stream = through.obj(function(chunk, enc, callback) {
    processCssFile(chunk, function() {
      callback();
    });
  });

  return stream;
};

module.exports = sprite;

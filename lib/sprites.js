var through = require('through2');

var sprite = function() {
  var files = [];

  return through.obj(function(chunk, enc, callback) {
    files.push(chunk);
    callback();
  }).on('end', function() {
  });
};

module.exports = sprite;

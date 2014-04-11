var through = require('through2');

var sprite = function() {
  return through(function(chunk, enc, callback) {
    callback();
  });
};

module.exports = sprite;

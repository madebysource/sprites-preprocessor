var assert = require('assert');
var sprite = require('../');
var File = require('vinyl');

describe('test', function() {
  it('returns same filename with null content', function(done) {
    var stream = sprite();

    stream.css.on('data', function(file) {
      assert.equal(file.path, 'css-filename.css');
      done();
    });

    stream.write(new File({
      path: 'css-filename.css'
    }));
  });

  it('returns same css file if there is no url', function(done) {
    var stream = sprite();

    stream.css.on('data', function(file) {
      assert.equal(file.path, 'css-filename.css');
      assert.equal('body { color: red; }', file.contents.toString());
    });

    stream.image.on('data', function(file) {
      assert.equal(file.path, 'sprite.png');
      assert.ok(file.isNull());
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { color: red; }', 'utf-8')
    }));

    stream.on('end', done);
  });
});
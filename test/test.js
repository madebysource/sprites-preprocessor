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

  it('takes name as argument', function(done) {
    var stream = sprite({ name: 'images.png' });

    stream.image.on('data', function(file) {
      assert.equal(file.path, 'images.png');
      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('', 'utf-8')
    }));
  });

  it('takes path as an argument', function(done) {
    var stream = sprite({ path: 'test/fixtures/' });

    stream.image.on('data', function(file) {
      assert.equal(file.isNull(), false);
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background: url(/images/sprites/a.png); }', 'utf-8')
    }));

    stream.on('end', done);
  });
});

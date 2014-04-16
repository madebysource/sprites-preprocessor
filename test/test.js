var assert = require('assert');
var sprite = require('../');
var File = require('vinyl');

describe('sprites', function() {
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
      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background: url(/images/sprites/a.png); }', 'utf-8')
    }));
  });

  it('rewrites sprite paths in css', function(done) {
    var stream = sprite({ path: 'test/fixtures/' });

    stream.css.on('data', function(file) {
      assert.equal('body { background: url(sprite.png);\nbackground-position: 0px 0px;; }', file.contents.toString());
      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background: url(/images/sprites/a.png); }', 'utf-8')
    }));
  });

  it('leaves attributes behind the url', function(done) {
    var stream = sprite({ path: 'test/fixtures/' });

    stream.css.on('data', function(file) {
      assert.equal('body { background: url(sprite.png) no-repeat;\nbackground-position: 0px 0px;; }', file.contents.toString());

      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background: url(/images/sprites/a.png) no-repeat; }', 'utf-8')
    }));
  });

  it('leaves normal image paths untouched', function(done) {
    var stream = sprite({ path: 'test/fixtures/' });

    stream.css.on('data', function(file) {
      assert.equal('body { background2: url(abcd.png); background: url(sprite.png);\nbackground-position: 0px 0px;; }', file.contents.toString());

      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background2: url(abcd.png); background: url(/images/sprites/a.png); }', 'utf-8')
    }));
  });

  it('generates correct background position', function(done) {
    var stream = sprite({ path: 'test/fixtures/' });

    stream.css.on('data', function(file) {
      assert.equal('body { background2: url(sprite.png);\nbackground-position: 0px 0px;; background: url(sprite.png);\nbackground-position: 0px -10px;; }',
                   file.contents.toString());

      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background2: url(/images/sprites/a.png); background: url(/images/sprites/b.png); }', 'utf-8')
    }));
  });

  it('emit error event on errors', function(done) {
    var stream = sprite({ path: 'test/fixtures/' });

    stream.on('error', function(err) {
      assert.equal(err.path, 'test/fixtures/non-existing-file.png');

      done();
    });

    stream.write(new File({
      path: 'css-filename.css',
      contents: new Buffer('body { background: url(/images/sprites/non-existing-file.png); }', 'utf-8')
    }));
  });
});

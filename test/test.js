var assert = require('assert');
var sprite = require('../');

describe('sprites', function() {
  it('returns same css file if there is no url', function(done) {
    sprite({}, 'body { color: red; }', function(err, css) {
      assert.equal(css, 'body { color: red; }');
      done();
    });
  });

  it('rewrites sprite path', function(done) {
    var css = 'body { background: url(/images/sprites/a.png); }';

    sprite({ path: 'test/fixtures/' }, css, function(err, css) {
      assert.equal(css, 'body { background: url(sprite.png); background-position: 0px 0px; }');

      done();
    });
  });

  it('rewrites url path with any quotes', function(done) {
    var css = 'body { background: url(\'/images/sprites/a.png\'); background: url("/images/sprites/b.png"); }';

    sprite({ path: 'test/fixtures/' }, css, function(err, css) {
      assert.equal(css,
                   'body { background: url(sprite.png); background-position: 0px 0px; background: url(sprite.png); background-position: 0px -10px; }');

      done();
    });
  });

  it('leaves normal image paths untouched', function(done) {
    var css = 'body { background: url(image.png); }';

    sprite({ path: 'test/fixtures/' }, css, function(err, css) {
      assert.equal(css, 'body { background: url(image.png); }');

      done();
    });
  });

  it('generates correct background position', function(done) {
    var css = 'body { background2: url(/images/sprites/a.png); background: url(/images/sprites/b.png); }';

    sprite({ path: 'test/fixtures/' }, css, function(err, css) {
      assert.equal(css, 'body { background2: url(sprite.png); background-position: 0px 0px; background: url(sprite.png); background-position: 0px -10px; }');
      done();
    });
  });

  it('reutrns error if there is non existing file', function(done) {
    var css = 'body { background: url(/images/sprites/non-existing-file.png); }';

    sprite({ path: 'test/fixtures/' }, css, function(err) {
      assert(err);
      done();
    });
  });

  it('takes css prefix path in options', function(done) {
    var css = 'body { background: url(prefix/a.png); }';

    sprite({ path: 'test/fixtures/', prefix: 'prefix/' }, css, function(err, css) {
      assert.equal(css, 'body { background: url(sprite.png); background-position: 0px 0px; }');

      done();
    });
  });

  it('uses same background position for same image use', function(done) {
    var css = 'body { background: url(/images/sprites/a.png); background: url(/images/sprites/a.png); }';

    sprite({ path: 'test/fixtures/' }, css, function(err, css) {
      assert.equal(css,
                   'body { background: url(sprite.png); background-position: 0px 0px; background: url(sprite.png); background-position: 0px 0px; }');

      done();
    });
  });

});

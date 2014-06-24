# sprites-preprocessor [![Build Status](https://secure.travis-ci.org/madebysource/sprites-preprocessor.png?branch=master)](https://travis-ci.org/madebysource/sprites-preprocessor)

> create sprite images from css files

## Install

```bash
$ npm install --save-dev sprites-preprocessor
```

## Usage

```js
var sprites = require('sprites-preprocessor');

var options = {
  name: 'sprite.png',
  path: 'images/sprites',
  prefix: '/images/sprites/'
};

sprites(options, 'body { background: url(/images/sprite/file.png); }', function(err, css, image) {
  // code
});
```

### Gulp usage

For gulp tasks there is gulp plugin [gulp-sprite-preprocessor](https://github.com/madebysource/gulp-sprites-preprocessor)

## API

### sprites(options)

#### Options

##### name

Type: `String`
Default: `sprite.png`

Name of the output sprite file.

##### path

Type: `String`
Default: `images/sprites`

Path to the source image files

##### prefix

Type: `String`
Default: `/images/sprites/`

Css prefix in image url to know what images transform into sprites

## License

[MIT license](http://opensource.org/licenses/mit-license.php)

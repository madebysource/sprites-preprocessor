# sprites-preprocessor [![Build Status](https://secure.travis-ci.org/madebysource/sprites-preprocessor.png?branch=master)](https://travis-ci.org/madebysource/sprites-preprocessor)

> create sprite images from css files

## Install

```bash
$ npm install --save-dev sprites-preprocessor
```

## Gulp Usage

```js
var sprites = require('sprites-preprocessor');

gulp.task('sprites', function(done) {
    gulp.src('main.css')
        .pipe(sprites())
        .pipe(gulp.dest('dist'))
        .on('end', done);
});
```

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

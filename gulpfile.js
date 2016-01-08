var pkg = require('./package.json'),
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  del = require('del'),
  through = require('through'),
  opn = require('opn'),
  server = require('./server/server.js'),
  isDist = (process.argv.indexOf('serve') === -1) //if serve not in args, then dist

gulp.task('js', ['clean:js'], function() {
  var stream = browserify({
    entries: './client/app.js',
    debug: true,
    transform: [babelify]
  }).bundle()

  return stream
  .pipe(isDist ? uglify() : through())
  .pipe(source('build.js'))
  .pipe(gulp.dest('build/assets/js'))
});

gulp.task('html', ['clean:html'], function() {
  return gulp.src('client/index.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('build'))
});

gulp.task('css', ['clean:css'], function() {
  return gulp.src('client/styles/main.styl')
    .pipe(stylus({
      'include css': true
    }))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: isDist ? false : true
      })
    )
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('build/assets/css'))
});

gulp.task('images', ['clean:images'], function() {
  return gulp.src('./client/images/**/*')
    .pipe(gulp.dest('build/assets/images'))
});

gulp.task('clean', function(done) {
  del('build', done);
});

gulp.task('clean:html', function(done) {
  del('build/index.html', done);
});

gulp.task('clean:js', function(done) {
  del('build/assets/js/build.js', done);
});

gulp.task('clean:css', function(done) {
  del('build/assets/css/build.css', done);
});

gulp.task('clean:images', function(done) {
  del('build/assets/images', done);
});

gulp.task('connect', ['build'], function(done){
  server.create(done)
});

gulp.task('reconnect', function(done){
  server.stop(() => {
    delete require.cache[require.resolve('./server/server.js')]
    server = require('./server/server.js')

    server.create(done);
  });
});

gulp.task('open', ['connect'], function (done) {
  opn('http://localhost:8080', done);
});

gulp.task('watch', function() {
  gulp.watch('client/**/*.html', ['html']);
  gulp.watch('client/styles/**/*.styl', ['css']);
  gulp.watch('client/images/**/*', ['images']);
  gulp.watch('client/**/*.js', ['js']);
  gulp.watch('server/**/*.js', ['reconnect']);
});

gulp.task('build', ['js', 'html', 'css', 'images']);

gulp.task('serve', ['open', 'watch']);

gulp.task('default', ['build']);

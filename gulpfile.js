var gulp = require('gulp')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var stylus = require('gulp-stylus')
var autoprefixer = require('gulp-autoprefixer')
var csso = require('gulp-csso')
var browserify = require('browserify')
var babelify = require('babelify')
var source = require('vinyl-source-stream')
var del = require('del')
var through = require('through')
var opn = require('opn')
var server = require('./server/server.js')
var isDist = (process.argv.indexOf('serve') === -1)

gulp.task('js', ['clean:js'], (done) => {
  var stream = browserify({
    entries: './client/index.js',
    debug: true,
    sourceType: 'module',
    transform: [babelify]
  }).bundle()

  stream
    .on('end', done)
    .on('error', (err) => {
      console.warn('Error building bundle.\n', err, err.stack)
      done()
    })
    .pipe(isDist ? uglify() : through())
    .pipe(source('build.js'))
    .pipe(gulp.dest('build/assets/js'))
})

gulp.task('html', ['clean:html'], (done) => {
  gulp.src('client/index.html')
    .on('end', done)
    .on('error', (err) => {
      console.warn('Error moving html.\n', err, err.stack)
      done()
    })
    .pipe(rename('index.html'))
    .pipe(gulp.dest('build'))
})

gulp.task('css', ['clean:css'], (done) => {
  gulp.src('client/styles/main.styl')
    .on('end', done)
    .on('error', (err) => {
      console.warn('Error building styling.\n', err, err.stack)
      done()
    })
    .pipe(stylus({
      'include css': true
    }))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: isDist
      })
    )
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('build/assets/css'))
})

gulp.task('images', ['clean:images'], (done) => {
  gulp.src('./client/images/**/*')
    .on('end', done)
    .on('error', (err) => {
      console.warn('Error moving images.\n', err, err.stack)
      done()
    })
    .pipe(gulp.dest('build/assets/images'))
})

gulp.task('clean', (done) => {
  del('build', done)
})

gulp.task('clean:html', (done) => {
  del('build/index.html', done)
})

gulp.task('clean:js', (done) => {
  del('build/assets/js/build.js', done)
})

gulp.task('clean:css', (done) => {
  del('build/assets/css/build.css', done)
})

gulp.task('clean:images', (done) => {
  del('build/assets/images', done)
})

gulp.task('connect', ['build'], (done) => {
  server.create(done)
})

gulp.task('reconnect', (done) => {
  server.stop(() => {
    delete require.cache[require.resolve('./server/server.js')]
    try {
      server = require('./server/server.js')

      server.create(done)
    } catch (err) {
      console.warn('Problem parsing server code.\n', err, err.stack)
      done()
    }
  })
})

gulp.task('open', ['connect'], (done) => {
  opn('http://localhost:8080', done)
})

gulp.task('watch', () => {
  gulp.watch('client/**/*.html', ['html'])
  gulp.watch('client/styles/**/*.styl', ['css'])
  gulp.watch('client/images/**/*', ['images'])
  gulp.watch('client/**/*.js', ['js'])
  gulp.watch('server/**/*.js', ['reconnect'])
})

gulp.task('build', ['js', 'html', 'css', 'images'])

gulp.task('serve', ['open', 'watch'])

gulp.task('default', ['build'])

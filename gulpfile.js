var gulp = require('gulp');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var connect = require('gulp-connect');
var historyApiFallback = require('connect-history-api-fallback');
var ngAnnotate = require('gulp-ng-annotate');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var del = require('del');
var deploy = require('gulp-gh-pages');

/**
 * build tasks
 */
gulp.task('compile-less', function () {
    return gulp.src('src/css/*.less')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(less())
        .pipe(plumber.stop())
        .pipe(gulp.dest('src/css'));
});

gulp.task('clean', function (cb) {
    del(['build/**'], cb);
});
gulp.task('copy-images', ['clean'], function () {
    return gulp.src('src/img/**/*.{jpg,png,gif,svg}')
        .pipe(gulp.dest('build/img'));
});
gulp.task('copy-data', ['clean'], function () {
    return gulp.src('src/data/**')
        .pipe(gulp.dest('build/data'));
});
gulp.task('copy-js-components', ['clean'], function () {
    return gulp.src('src/bower_components/**/*.js')
        .pipe(gulp.dest('build/bower_components'));
});

gulp.task('build-src', ['compile-less']);
gulp.task('build', ['build-src', 'copy-images', 'copy-data', 'copy-js-components'], function () {
    gulp.src('src/*.html')
        .pipe(usemin({
            css: [minifyCss(), 'concat', rev()],
            js: [ngAnnotate(), uglify({mangle: false}), rev()]
        }))
        .pipe(gulp.dest('build'));
});

/**
 * development server
 */
var serve = function (root) {
    connect.server({
        root: root,
        livereload: true,
        port: 8081,
        middleware: function () {
            return [historyApiFallback];
        }
    });
};
gulp.task('serve', function () {
    serve('src/')
});
gulp.task('serve-build', function () {
    serve('build/')
});

/**
 * livereload
 */
gulp.task('watch-files', function () {
    gulp.watch(['./src/css/**/*.less'], ['compile-less'], function () {
        gulp.src('./src/css/*.css').pipe(connect.reload());
    });
    gulp.watch(['./src/**/*.html', './src/css/*.css', './src/js/**/*.js'], function (event) {
        gulp.src(event.path).pipe(connect.reload());
    });
});

/**
 * deployment
 */
gulp.task('deploy', function () {
    return gulp.src('./build/**/*')
        .pipe(deploy());
});

/**
 * task groups
 */
gulp.task('watch', ['build-src', 'serve', 'watch-files']);
gulp.task('default', ['watch']);
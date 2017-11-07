const gulp = require('gulp'),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    path = require('path');

const PORT = 8010;

gulp.task('html', () => {
    gulp.src('./public/**/*.html')
        .pipe(connect.reload());
});

gulp.task('style', () => {
    gulp.src('./public/css/*.css')
        .pipe(connect.reload());
});

gulp.task('server', () => {
    connect.server({
        port: PORT,
        root: path.resolve('./public'),
        livereload: true
    });
    gulp.src(__filename).pipe(open({
        uri: `http://localhost:${PORT}`
    }));
    gulp.watch('./public/html/*.html', ['html']);
    gulp.watch('./public/css/*.css', ['style']);
});
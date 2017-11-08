const gulp = require('gulp'),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    watch = require('gulp-watch'),
    stream = require('stream'),
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path');

const PORT = 8010;
const tips = {};

gulp.task('html', () => {
    gulp.src('./public/**/*.html')
        .pipe(connect.reload());
});

gulp.task('style', () => {
    gulp.src('./public/css/*.css')
        .pipe(connect.reload());
});

gulp.task('dev', ['init-tip', 'dynamic-update-index', 'server']);

gulp.task('server', ['dynamic-update-index'], () => {
    connect.server({
        port: PORT,
        root: path.resolve('./public'),
        livereload: true
    });
    gulp.src(__filename).pipe(open({
        uri: `http://localhost:${PORT}`
    }));
    gulp.watch('./public/**/*.html', ['html']);
    gulp.watch('./public/css/*.css', ['style']);

});

gulp.task('dynamic-update-index', ['init-tip'], () => {
    watch('./public/html/*.html', {
        events: ['add', 'unlink']
    }, (e) => {
        if (e.event === 'unlink') {
            delete tips[e.relative];
        } else {
            tips[e.relative] = e.relative;
            e.path, ejs.renderFile('./dev/tip.ejs', {
                title: e.relative
            }, (err, html) => {
                fs.writeFileSync(e.path, html);
            });
        }
        renderIndexHtml();
    });
    renderIndexHtml();
});

gulp.task('init-tip', (done) => {
    const htmlPath = path.resolve('./public/html');
    var tipArray = fs.readdirSync(htmlPath);
    tipArray.forEach((fileName, index) => {
        var stream = fs.createReadStream(path.resolve(htmlPath, fileName), {
            encoding: 'utf-8',
            start: 0,
            end: 500
        });
        stream.on('data', (chunk) => {
            var title = /<title>[\r\n\s]*(.+)[\r\n\s]*<\/title>/.exec(chunk)[1];
            tips[fileName] = title;
            if (tipArray.length - 1 === index) {
                done();
            }
        });
    });
});

function renderIndexHtml() {
    var alinks = "";
    Object.keys(tips).forEach((path) => {
        alinks += `<li><a href="./html/${path}">${tips[path]}</a></li>`;
    });
    ejs.renderFile('./dev/index.ejs', {
        aTag: alinks
    }, (err, html) => {
        if (err) return console.error(err);
        fs.writeFileSync('./public/index.html', html);
    });
}
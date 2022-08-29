"use strict";


const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const rigger = require('gulp-rigger');
const inject = require('gulp-inject');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

const path = {
    src: {
        app: 'src/',
        html: 'src/**/*.{html,php}',
        layouts:  'src/layouts/**/*.html',
        js:   'src/js/**/*.js',
        style: {
            sass:    'src/scss/**/*.{scss,sass}'
        },
        img:   'src/images/**/*.*'
    },
    build: {
        html:  'build/',
        js:    'build/js/',
        css:   'build/css/',
        img:   'build/images/'
    }
};

const gulpSassOpts = {
    outputStyle: 'compressed',
    indentType: 'tab',
    indentWidth: 1,
    precision: 10
}

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: 'build'
        },
        injectChanges: true,
        host: 'localhost',
        port: 9000,
        logPrefix: 'dev'
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Optimize Images
function images() {
    return gulp
        .src(path.src.img)
        .pipe(newer(path.build.img))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({
                    quality: 90,
                    maxMemory: 400
                }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                    {removeViewBox: false},
                    {cleanupIDs: false},
                    {collapseGroups: false}
                    ]
                })
            ])
        )
        .pipe(gulp.dest(path.build.img));
}

// SCSS task
function scss() {
    return gulp
        .src(path.src.style.sass)
        .pipe(sourcemaps.init())
        .pipe(sass.sync(gulpSassOpts).on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browsersync.stream());
}

// scripts task
function scripts() {
    return gulp
        .src(path.src.js)
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(browsersync.stream());
}

// html index task
function htmlIndex() {
    return gulp.src(path.src.app +'index.html')
        .pipe(inject(
            gulp.src([path.src.html, '!'+path.src.app +'index.html', '!'+ path.src.layouts], { read: false }), {
                transform: function (filepath) {
                    if (filepath.slice(-5) === '.html') {
                        filepath = filepath.replace('/'+path.src.app, '');
                        return '<li><a href="' + filepath + '" target="_blank">' + filepath + '</a></li>';
                    }
                    return inject.transform.apply(inject.transform, arguments);
                }
            }
        )
    ).pipe(gulp.dest(path.build.html));
}
// html task
function html() {
    return gulp.src([path.src.html, '!'+path.src.layouts, '!'+path.src.app +'index.html'])
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(browsersync.stream());
}


// Clean assets
function clean() {
    return del(path.build.html);
}


// Watch files
function watchFiles() {
    gulp.watch(path.src.style.sass, scss);
    gulp.watch(path.src.js, scripts);
    gulp.watch([path.src.html, '!'+path.src.app +'index.html'], html);
    gulp.watch([path.src.html, '!'+path.src.app +'index.html', '!'+ path.src.layouts], htmlIndex);
    gulp.watch(path.src.img, images);
}


// define complex tasks
const build = gulp.parallel(scss, images, scripts, html, htmlIndex);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));


// export tasks
exports.images = images;
exports.scss = scss;
exports.scripts = scripts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;


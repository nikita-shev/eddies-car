"use strict";

const { src, dest, parallel, series, watch } = require('gulp');
const gulp = require('gulp'),
      browserSync = require('browser-sync'),
      connect = require('gulp-connect-php'),
      debug = require('gulp-debug'),
      plumber = require('gulp-plumber'),
      sourcemaps = require('gulp-sourcemaps'),
      cache = require('gulp-cache'),
      del = require('del'),
      sass = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      cleanCss = require('gulp-clean-css'),
      rename = require('gulp-rename'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      babel = require('gulp-babel'),
      jshint = require('gulp-jshint'),
      imagemin = require('gulp-imagemin'),
      imageminMozjpeg = require('imagemin-mozjpeg'),
      imageminPngquant = require('imagemin-pngquant');
      // spritesmith = require('gulp.spritesmith');



const path = {
    build:{
        css: 'build/css/',
        js: 'build/js/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        php: 'build/',
        html: 'build/'
    },
    prebuild:{
        css: 'prebuild/css/',
        watch: 'prebuild/css/*.css'
        // cssMap: 'prebuild/css/*.+(css.map|min.css.map)'
    },
    dev:{
        scss: 'dev/scss/main.+(scss|sass)',
        js: 'dev/js/main.js',
        mjs: 'dev/js/*.min.js',
        img: 'dev/img/**/*.*',
        fonts: 'dev/fonts/**/*.*',
        php: 'dev/**/*.php',
        html: 'dev/**/*.html'
    },
    watch:{
        scss: 'dev/scss/**/*.+(scss|sass)',
        js: 'dev/js/**/*.js',
        img: 'dev/img/**/*.*',
        fonts: 'dev/fonts/**/*.*',
        php: 'dev/**/*.php',
        html: 'dev/**/*.html'
    }
};


function cssBuild() {
    return src(path.dev.scss)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer({grid: 'autoplace'}))
        .pipe(dest(path.prebuild.css))
        .pipe(rename({suffix:'.min'}))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./'))
        .pipe(debug({title: 'SASS file:',}))
        .pipe(dest(path.prebuild.css))
        .pipe(browserSync.stream());
}

function cssPreBuild() {
    return gulp.src(path.prebuild.watch)
        .pipe(plumber())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream());
}

// function cssMap() {
//     return gulp.src(path.prebuild.cssMap)
//         .pipe(gulp.dest(path.build.css))
//         .pipe(browserSync.stream());
// }

function jsBuild() {
    return src(path.dev.js)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(path.build.js))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.build.js))
        .pipe(debug({
            title: 'JS file:',
        }))
        .pipe(browserSync.stream());
}

function allMinJs() {
    return src(path.dev.mjs)
        .pipe(dest(path.build.js));
}

// function concatFile() {
//     return src('dev/js/**/*.js')
//         .pipe(concat('script.min.js'))
//         .pipe(uglify())
//         .pipe(dest(path.build.js))
//         .pipe(browserSync.stream());
// }

function imgBuild() {
    return src(path.dev.img)
        .pipe(cache(imagemin([
            imageminMozjpeg({
                quality: 75, //60
                progressive: true,
                tune: "ms-ssim",
                smooth: 2
            }),
            imageminPngquant({
                quality: [0.65, 0.8], //65-80
                speed: 5,
                verbose: true
            })

        ],{verbose:true})))
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream());
}

/*Sprite*/
// gulp.task('sprite', function () {
//     let spriteData = gulp.src('dev/img/**/*.png').pipe(spritesmith({
//         imgName: 'sprite.png',
//         cssName: 'sprite.scss'
//     }));
//     return spriteData.pipe(gulp.dest('dev/sp/'));
// });


/*Sprite*/
// gulp.task('sprite', function (done) {
//    const spriteData = gulp.src('dev/img/advantages/*.png')
//        .pipe(spritesmith({
//         imgName: 'sprite.png',
//         // imgPath: 'build/img/sprite.png',
//         cssName: 'sprite.css'
//    }));
//    return spriteData.pipe(gulp.dest('dev/sp/'));
//    // spriteData.img.pipe(gulp.dest('./build/img/')); //путь готовой картинки
//    // spriteData.css.pipe(gulp.dest('./build/css/'));
//    done();
//
// });

// /*Sprite*/
// gulp.task('sprite', function () {
//     let spriteData = gulp.src('dev/img/advantages/*.png').pipe(spritesmith({
//         imgName: 'sprite.png',
//         cssName: 'sprite.css'
//     }));
//     return spriteData.pipe(gulp.dest('dev/sp/'));
// });


function fontsBuild() {
    return src(path.dev.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.stream());
}

function phpBuild() {
    return src(path.dev.php)
        .pipe(plumber())
        .pipe(dest(path.build.php));
}

function htmlBuild() {
    return src(path.dev.html)
        .pipe(plumber())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function delBuild() {
    return del(['build/**/*.*', '!build']);
}

function serverBuild() {
    connect.server({}, function () {
        browserSync({
            proxy: 'ALL-PROJECT',
            notify:true
        });
    });

    watch(path.watch.scss, series(cssBuild));
    watch(path.prebuild.watch, series(cssPreBuild));
    watch(path.watch.js, series(jsBuild));
    watch(path.watch.html, series(htmlBuild));
    watch(path.watch.php, series(phpBuild));
    watch(path.watch.img, series(imgBuild));
}

function clearCache() {
    cache.clearAll()
}

exports.del = delBuild;
exports.html = htmlBuild;
exports.php = phpBuild;
exports.css = cssBuild;
exports.cssPreBuild = cssPreBuild;
exports.js = jsBuild;
exports.allMinJs = allMinJs;
exports.fonts = fontsBuild;
exports.img = imgBuild;
exports.server = serverBuild;
exports.clearCache = clearCache;

exports.default = series(delBuild, htmlBuild, phpBuild, cssBuild, cssPreBuild, jsBuild, allMinJs, fontsBuild, imgBuild, serverBuild);

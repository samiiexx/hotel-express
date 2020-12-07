// Define plugins
const gulp = require('gulp'); // Obviously
const fileinclude = require('gulp-file-include'); // Include HTML partials
const sass = require('gulp-sass'); // SASS using Gulp
const autoprefixer = require('gulp-autoprefixer'); // For browser prefixes (Compatibility)
const imagemin = require('gulp-imagemin'); // Minify JPEG, PNG, GIF & SVG
const concat = require('gulp-concat'); // Concatenate files (especially JS)
const uglify = require('gulp-uglify'); // Compress/minify files
const browserSync = require('browser-sync').create(); // Live browser preview (also works in LAN)

// Define source and destination directories
const srcDir = 'src';
const destDir = 'public';

// Define gulp const
const { src, series, parallel, dest, watch } = require('gulp');

// Copy PHP files
function copyPhp() {
    return src(`${srcDir}/*.php`)
        .pipe(gulp.dest(destDir));
}

// Include HTML partials
function includeHtml() {
    return src(`${srcDir}/*.html`)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'

        }))
        .pipe(gulp.dest(destDir));
}

// Compile (and minify) SASS
let sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded' // 'expanded' OR 'compressed' 
};

function compileSass() {
    return src(`${srcDir}/sass/style.scss`)
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(destDir + '/css'));
}

// Compile and Minify JS

function minJs() {
    return src([`${srcDir}/js/!(index)*.js`, `${srcDir}/js/index.js`])
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest(destDir + '/js'));
}

// Minify Images
function minImg() {
    return src(`${srcDir}/images/*`)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 65, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest(destDir + '/images'));
}

// Browser sync
function browser() {
    return browserSync.init({
        notify: false,
        // open: false,
        server: {
            baseDir: destDir
        }
    });
}

// Watch files
function watchAll() {
    browser()
    watch(`${srcDir}/sass/*`).on('change', series(compileSass, browserSync.reload))
    watch(`${srcDir}/*.php`).on('change', series(copyPhp, browserSync.reload))
    watch(`${srcDir}/js/*`).on('change', series(minJs, browserSync.reload))
    watch(`${srcDir}/includes/*`).on('change', series(includeHtml, browserSync.reload))
    watch(`${srcDir}/*.html`).on('change', series(includeHtml, browserSync.reload))
    watch(`${srcDir}/images/*`).on('change', series(minImg, browserSync.reload))
        // Ctrl + C to end gulp watch
}

// Export tasks
exports.includeHtml = includeHtml;
exports.copyPhp = copyPhp;
exports.compileSass = compileSass;
exports.minImg = minImg;
exports.minJs = minJs;
exports.watchAll = watchAll;
exports.browser = browser;
exports.all = parallel(includeHtml, copyPhp, compileSass, minImg);
"use strict";

// Load plugins
const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const clean = require("gulp-clean");
const browserSync = require("browser-sync").create();
const header = require("gulp-header");
const pkg = require("./package.json");

// Set the banner content
const banner = [
  "/*!\n",
  " * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n",
  " * Copyright 2013-" + new Date().getFullYear(),
  " <%= pkg.author %>\n",
  " * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n",
  " */\n",
  "\n"
].join("");

// Clean vendor
function cleanVendor() {
  return gulp.src("./vendor/", { allowEmpty: true })
    .pipe(clean());
}

// Copy third party libraries from /node_modules into /vendor
function copyVendor() {
  // Bootstrap
  gulp.src([
    "./node_modules/bootstrap/dist/**/*",
    "!./node_modules/bootstrap/dist/css/bootstrap-grid*",
    "!./node_modules/bootstrap/dist/css/bootstrap-reboot*"
  ])
    .pipe(gulp.dest("./vendor/bootstrap"));

  // jQuery
  gulp.src([
    "./node_modules/jquery/dist/*",
    "!./node_modules/jquery/dist/core.js"
  ])
    .pipe(gulp.dest("./vendor/jquery"));

  // jQuery Easing
  gulp.src("./node_modules/jquery.easing/*.js")
    .pipe(gulp.dest("./vendor/jquery-easing"));

  // Simple Line Icons
  gulp.src("./node_modules/simple-line-icons/fonts/**")
    .pipe(gulp.dest("./vendor/simple-line-icons/fonts"));

  gulp.src("./node_modules/simple-line-icons/css/**")
    .pipe(gulp.dest("./vendor/simple-line-icons/css"));

  // Devicons
  gulp.src([
    "./node_modules/devicons/**/*",
    "!./node_modules/devicons/!PNG",
    "!./node_modules/devicons/!PNG/**/*",
    "!./node_modules/devicons/!SVG",
    "!./node_modules/devicons/!SVG/**/*"
  ])
    .pipe(gulp.dest("./vendor/devicons"));

  // Font Awesome
  gulp.src([
    "./node_modules/@fortawesome/**/*"
  ])
    .pipe(gulp.dest("./vendor"));
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(sass.sync({
      outputStyle: "expanded"
    }).on("error", sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(cssnano())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./css"))
    .pipe(browserSync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      "./js/*.js",
      "!./js/*.min.js"
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./js"))
    .pipe(browserSync.stream());
}

// Watch task
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch("./js/**/*", js);
  gulp.watch("./**/*.html").on("change", browserSync.reload);
}

// Define complex tasks
const vendor = gulp.series(cleanVendor, copyVendor);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.parallel(watchFiles, function() {
  browserSync.init({
    server: "./"
  });
});

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = cleanVendor;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;

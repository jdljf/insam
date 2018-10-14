const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require("gulp-uglify")
const browserify = require('gulp-browserify')
const rename = require('gulp-rename')
const extReplace = require("gulp-ext-replace")
const autoprefixer = require("gulp-autoprefixer")
const livereload = require('gulp-livereload')
const uglifycss = require("gulp-uglifycss")
const changed = require("gulp-changed")
const imagemin = require('gulp-imagemin') // 图片压缩
const pngquant = require('imagemin-pngquant') // 深度压缩

const logError = function(er) {
    console.log(er);
    this.emit("end");
};

function prod() {

//#默认启动的服务列表
    gulp.task('build', ['sass', "script", 'image', 'fonts', "lib", 'watch'])

//#映射 img 文件
    gulp.task("image", function() {
        gulp.src("static/img/**/*.{png,jpg,jpeg,gif,bmp,svg}").pipe(changed("public/static/img")).pipe(imagemin({
            progressive: true, // 无损压缩JPG图片
            svgoPlugins: [
                {
                    removeViewBox: false // 不移除svg的viewbox属性
                }
            ],
            use: [pngquant()] // 使用pngquant插件进行深度压缩
        })).on("error", logError).pipe(gulp.dest("assets/img")).pipe(livereload());
    });

//#映射 fonts 文件
    gulp.task("fonts", function() {
        gulp.src("static/fonts/**/*").pipe(gulp.dest("public/static/fonts")).pipe(livereload());
    });

//#映射lib 文件
    gulp.task("lib", function() {
        gulp.src("static/lib/**/*").pipe(gulp.dest("public/static/lib")).pipe(livereload());
    });

    gulp.task("html", function() {
        gulp.src("static/templates/**/*.html").pipe(livereload());
    });


//#编译scss文件
    gulp.task('sass', function() {
        gulp.src(["static/scss/**/*.{scss,css}"]).pipe(changed("public/static/css", {
            extension: ".min.css"
        })).pipe(sass()).on("error", logError).pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
            //.pipe uglifycss()
        })).pipe(rename({
            suffix: '.min'
        })).pipe(gulp.dest('public/static/css')).pipe(livereload());
    });

    //编译原生js文件
    gulp.task("script", function() {
        //.pipe uglify()
        gulp.src("static/js/**/*.js").pipe(rename({
            suffix: ".min"
        })).pipe(gulp.dest("public/static/js")).pipe(livereload());
    });

    //监控修改
    gulp.task("watch", function() {
        livereload.listen()

        gulp.watch("static/scss/**/*.{scss,css}", ['sass']);
        gulp.watch("static/js/**/*.js", ['script']);
        gulp.watch("static/templates/**/*.html", ['html']);
        gulp.watch("static/img/**/*.{png,jpg,jpeg,gif,bmp,svg}", ['image']);
        gulp.watch("static/fonts/**/*", ['fonts']);
        gulp.watch("static/lib/**/*", ['lib']);
    });

}

module.exports = prod;
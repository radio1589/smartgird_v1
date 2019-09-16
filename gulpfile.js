const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
//const less = require('gulp-less');
const sass = require('gulp-sass');
const smartgrid = require('smart-grid');

const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);

sass.compiler = require('node-sass');

/*
	1. browserSync для html
	2. 
		gulp-uncss - удаление неиспользуемого css
		gulp-group-css-media-queries - соединение media-запрос
	3. по желанию pug html препроц
*/

/*
let cssFiles = [
	'./node_modules/normalize.css/normalize.css',
	'./src/css/base.css',
	'./src/css/grid.css',
	'./src/css/humans.css'
];
*/

function clear(){
	return del('build/*');
}

function styles(){
	return gulp.src('./src/css/styles.scss')
			   .pipe(gulpif(isDev, sourcemaps.init()))
			   //.pipe(less())
			   .pipe(sass().on('error', sass.logError))
			   //.pipe(concat('style.css'))
			   .pipe(gcmq())
			   .pipe(autoprefixer({
		            browsers: ['> 0.1%'],
		            cascade: false
		        }))
			   //.on('error', console.error.bind(console))
			   .pipe(gulpif(isProd, cleanCSS({
			   		level: 2
			   })))
			   .pipe(gulpif(isDev, sourcemaps.write()))
			   .pipe(gulp.dest('./build/css'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function img(){
	return gulp.src('./src/img/**/*')
			   .pipe(gulp.dest('./build/img'))
}

function html(){
	return gulp.src('./src/*.html')
			   .pipe(gulp.dest('./build'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function watch(){
	if(isSync){
		browserSync.init({
	        server: {
	            baseDir: "./build/",
	        }
	    });
	}

	gulp.watch('./src/css/**/*', styles);
	gulp.watch('./src/**/*.html', html);
}

function grid(done){
	let settings = {
		outputStyle: 'sass',
		columns: 12,
    	offset: "10px",
    	//mobileFirst: true,
    	container: {
	        maxWidth: "1140px",
	        fields: "30px"
	    },
    	breakPoints: {
    		md: {
	            width: "920px",
	            fields: "15px"
	        },
	        sm: {
	            width: "720px"
	        },
	        xs: {
	            width: "576px"
	        },
	        xxs: {
				width: "420px"
	        }
    	}
	};

	smartgrid('./src/css', settings);
	done();
}

let build = gulp.series(clear, 
	gulp.parallel(styles, img, html)
);

gulp.task('build', build);
gulp.task('watch', gulp.series(build, watch));
gulp.task('grid', grid);
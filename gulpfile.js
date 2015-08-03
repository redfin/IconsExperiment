var del = require('del');
var generateComponents = require('./js/generateComponents.js');
var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var path = require('path');
var spritesmith = require('gulp.spritesmith');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');

var runTimestamp = Math.round(Date.now()/1000);
var fontName = 'redfinIcons';

var paths = {
	pngs: 'icons/png/*.png',
	svgs: 'icons/svg/*.svg',
	build: 'build'
}

gulp.task('generateSvgComponents', function() {
	return gulp.src(paths.svgs)
		.pipe(svgmin())
		.pipe(generateComponents({
			template: 'templates/svg-component.js',
			extFromTemplate: true,
			fileNameFromTemplate: false
		}))
		.pipe(gulp.dest(paths.build));
});

gulp.task('generateExperiment4', function() {
	return gulp.src(paths.svgs)
		.pipe(svgmin(function(file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				plugins: [{
					cleanupIDs: {
						prefix: prefix + '-',
						minify: true
					}
				}]
			}
		}))
		.pipe(svgstore())
		.pipe(generateComponents({
			template: 'templates/experiment4.html',
			extFromTemplate: true,
			fileNameFromTemplate: true
		}))
		.pipe(gulp.dest(paths.build));
});

gulp.task('sprite', function () {
	return gulp.src(paths.pngs)
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: 'sprite.css'
		})).
		pipe(gulp.dest(paths.build));
});

gulp.task('iconfont', function() {
	return gulp.src([paths.svgs])
		.pipe(iconfont({
			fontName: fontName, // required
			appendUnicode: false, // don't change source filenames
			formats: ['ttf', 'woff'],
			timestamp: runTimestamp // recommended to get consistent builds when watching files
		}))
		.pipe(iconfontCss({
			fontName: fontName
		}))
		.pipe(gulp.dest(paths.build));
});

gulp.task('svgstore', function() {
	return gulp.src(paths.svgs)
		.pipe(svgmin(function(file) {
			//...?
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				plugins: [{
					cleanupIDs: {
						prefix: prefix + '-',
						minify: true
					}
				}]
			}
		}))
		.pipe(svgstore())
		.pipe(gulp.dest(paths.build))
});

gulp.task('clean', function() {
	del([paths.build], function(err, paths) {
		console.log('Deleted: ' + paths.join(', '));
	});
});

gulp.task('default', ['clean', 'generateExperiment4', 'generateSvgComponents', 'iconfont', 'sprite', 'svgstore']);

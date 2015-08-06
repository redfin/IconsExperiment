var concat = require('gulp-concat');
var consolidate = require('gulp-consolidate');
var del = require('del');
var fontcustom = require('gulp-fontcustom');
var generateComponents = require('./js/generateComponents.js');
var gulp = require('gulp');
var replace = require('gulp-regex-replace');
var gutil = require('gulp-util');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var imageDataUri = require('gulp-image-data-uri');
var path = require('path');
var spritesmith = require('gulp.spritesmith');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');

var fontName = 'redfinIcons';
var runTimestamp = Math.round(Date.now()/1000);

var paths = {
	pngs: 'icons/png/*.png',
	svgs: 'icons/svg/*.svg',
	build: 'build'
}

gulp.task('dataUri', function() {
	return gulp.src(paths.svgs)
		.pipe(svgmin())
		.pipe(generateComponents({
			template: 'templates/css-component.css',
			extFromTemplate: true,
			fileNameFromTemplate: false
		}))
		.pipe(concat('data-uri.css'))
		.pipe(gulp.dest(paths.build));
});

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
		.pipe(replace({ regex: 'fill="[^"]*"', replace: '' }))
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
			formats: ['ttf', 'eot', 'woff', 'svg'],
			timestamp: runTimestamp // recommended to get consistent builds when watching files
		}))
		.on('glyphs', function(codepoints, options) {
			codepoints.forEach(function(glyph, idx, arr) {
				arr[idx].codepoint = glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase();
			});
			gulp.src('templates/icon-font.css')
				.pipe(consolidate('lodash', {
					glyphs: codepoints,
					fontName: options.fontName,
					fontPath: '/fonts/'
				}))
				.pipe(gulp.dest(paths.build));
		})
		.pipe(gulp.dest(paths.build));
});

gulp.task('fontcustom', function() {
	gulp.src(paths.svgs)
		.pipe(fontcustom({
			font_name: fontName + '2',
			'css-selector': '.icon-{{glyph}}'
		}))
		.pipe(gulp.dest(paths.build));
});

gulp.task('svgstore', function() {
	return gulp.src(paths.svgs)
		.pipe(replace({ regex: 'fill="[^"]*"', replace: '' }))
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
		.pipe(gulp.dest(paths.build))
});

gulp.task('copy-svgs', function() {
	return gulp.src(paths.svgs)
		.pipe(svgmin(function(file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				plugins: [{
					cleanupIDs: {
						prefix: prefix + '-',
						minify: true,
						remove: false
					}
				}]
			}
		}))
		.pipe(replace({ regex: 'fill="[^"]*"', replace: '' }))
		.pipe(replace({ regex: 'viewBox', replace: 'preserveAspectRatio="xMinYMin meet" viewBox' }))
		.pipe(gulp.dest(path.join(paths.build, 'svg')))
});

gulp.task('clean', function() {
	del([paths.build], function(err, paths) {
		console.log('Deleted: ' + paths.join(', '));
	});
});

gulp.task('default', ['copy-svgs', 'dataUri', 'fontcustom', 'generateExperiment4', 'generateSvgComponents', 'iconfont', 'sprite', 'svgstore']);

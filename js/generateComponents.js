var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-generate-components';

var prefix = "var elem = '";
function getPostfix(className) {
	return "'; " +
	"React.render(" +
		"<div dangerouslySetInnerHTML={{__html: elem }}></div>, " +
		"document.getElementById('icon-" + className + "')" +
	");";
}

function prefixStream() {
	var stream = through();
	stream.write(prefix);
	return stream;
}

function postfixStream(className) {
	var stream = through();
	stream.write(getPostfix(className));
	return stream;
}

function prefixBuffer() {
	return new Buffer(prefix);
}

function postfixBuffer(className) {
	return new Buffer(getPostfix(className));
};

// plugin level function (dealing with files)
function generateComponents() {
	// creating a stream through which each file will pass
	return through.obj(function(file, enc, cb) {

		if (file.isNull()) {
			return cb(null, file);
		}

		var iconName = path.basename(file.path, path.extname(file.path));
		console.log("generated component " + Buffer.concat([prefixBuffer(), file.contents, postfixBuffer(iconName)]).toString() + " for icon: " + iconName);
		file.path = path.join(path.dirname(file.path), iconName + '.js');
		console.log(file.path);
		if (file.isBuffer()) {
			file.contents = Buffer.concat([prefixBuffer(), file.contents, postfixBuffer(iconName)]);
		}

		if (file.isStream()) {
			// define the streamers that will transform the content
			var prefixStreamer = prefixStream();
			var postfixStreamer = postfixStream(iconName);
			// catch errors from the streamer and emit a gulp plugin error
			prefixStreamer.on('error', this.emit.bind(this, 'error'));
			postfixStreamer.on('error', this.emit.bind(this, 'error'));
			// start the transformation
			file.contents = file.contents.pipe(prefixStreamer).pipe(postfixStreamerl);
		}

		// tell the stream engine that we are done with this file
		return cb(null, file);
	});
}

// exporting the plugin main function
module.exports = generateComponents;

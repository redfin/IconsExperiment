var _ = require('lodash');
var fs = require('fs');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-generate-components';

function getTemplateFromFile(filePath) {
	return fs.readFileSync(filePath);
}

// plugin level function (dealing with files)
function generateComponents(opts) {
	// creating a stream through which each file will pass
	return through.obj(function(file, enc, cb) {

		if (file.isNull()) {
			return cb(null, file);
		}

		var extName, fileName, template, templatePath;
		templatePath = opts.template;
		template = getTemplateFromFile(templatePath);

		if (opts.fileNameFromTemplate) {
			fileName = path.basename(templatePath, path.extname(templatePath));
		} else {
			fileName = path.basename(file.path, path.extname(file.path));
		}

		if (opts.extFromTemplate) {
			extName = path.extname(templatePath);
		} else {
			extName = path.extname(file.path);
		}

		var component = _.template(template)({ contents: file.contents, fileName: fileName, filePath: file.path });
		file.path = path.join(path.dirname(file.path), fileName + extName);

		if (file.isBuffer()) {
			file.contents = new Buffer(component);
		}

		if (file.isStream()) {
			// TODO: Implement this...
			throw {name : "NotImplementedError", message : "File streams are not yet supported by this gulp plugin."};
		}

		// tell the stream engine that we are done with this file
		return cb(null, file);
	});
}

// exporting the plugin main function
module.exports = generateComponents;

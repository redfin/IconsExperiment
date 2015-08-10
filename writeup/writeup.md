# The Icons Experiment

## What's the problem?

Currently, visitors to [redfin.com](https://www.redfin.com/), especially visitors using a mobile device, are greeted with a set of icons that appear fuzzy or blurry.  For example, take a look at the heart icon we use for share search:

![Shared Search Icon](~/Desktop/saved-search.png)

Notice that the line the defines the outside of the heart is ill-defined, and slowly bleeds into the background color instead of being starkly defined.  As more and more users move to high pixel density displays ([over 500 ppi on their phones](http://gadgets.ndtv.com/mobiles/features/lg-g4-vs-samsung-galaxy-s6-vs-htc-one-m9-687073) and [over 200 ppi on their laptops](http://www.engadget.com/2015/03/11/chromebook-pixel-review-2015/)), customers are increasingly noticing that the icon assets we serve are low resolution.  To get these fuzzy icons, we're currently serving 450 KB of png sprite sheets, which break every time we change the size of an icon png and require manual attention to change the coordinates of all the icons.  We believe that to be the best real estate website on the internet, we improve our customers experience on the website, both in terms of appearance and performance.

## How are we going to fix this?

There are [lots](https://www.npmjs.com/search?q=icons) and [lots](http://search.maven.org/#search%7Cga%7C1%7Cicons) and [lots](https://rubygems.org/search?utf8=%E2%9C%93&query=icons) of ways to serve icons to your users -- 1014 different packages on [npmjs.org](npmjs.org) alone -- so to figure out the best way to serve icons, I
'll have to test many of them.  Currently, in the newer parts of our website, we're using Corvair, our local webserver built on top of Triton, our [node.js](nodejs.org)-based web server framework, which uses [gulp](http://gulpjs.com/) as its task runner.  To try to build the most future-proof solution that integrates into our existing infrastructure, we only investigated solutions that were automatable using [gulp](http://gulpjs.com/).  I also focused on solutions that would allow us to serve one set of icons, and then style their size and appearance using CSS so to reduce size on the wire and increase flexibility for our design team.

## What did we try?

I tried 6 different approaches to serving our icons.  As a experimental dataset, I used a set of 20 SVGs, including 2 icons that are malformed, representing two common errors the design team sometimes makes while exporting their icons from the programs they use to draw the icons.

To do the testing, I set up a [koa.js](http://koajs.com/) server using [io.js](https://iojs.org) as the runtime and [gulp](http://gulpjs.com/) as the task runner.  The server was very lightweight:

	"use strict";

	var koa = require("koa");
	var route = require("koa-route");
	var serve = require("koa-static");
	var gzip = require("koa-gzip");

	var port = 3001;
	var app = koa();
	app.use(gzip());

	app.use(serve("bower_components"));
	app.use(serve("build"));
	app.use(serve("js"));
	app.use(serve("stylesheets"));
	app.use(serve("views"));

	app.use(route.get("/", function() {
	  return this.redirect("/index.html");
	}));

	app.listen(port);
	console.log("listening on port " + port + ".");

Some notes on the server stack:
- I used [koa-static](https://www.npmjs.com/package/koa-static) to serve the resources.  Since some approaches wrote the image data into the HTML, CSS or JavaScript of the site, we didn't want to use a view engine, since the ability of the view engine to handle the data written into the html might have muddied our results.
- To get as close to a production environment, I used [koa-gzip](https://www.npmjs.com/package/koa-gzip) to zip up the static assets.  Since the SVG format is UTF-8 XML, it is very compressable.  It was not enough to merely compress some classes of assets, say the images, since some approaches wrote the image data into the HTML, CSS or JavaScript of the site.  
- I used [koa-route](https://www.npmjs.com/package/koa-route) instead of the more fully-featured [koa-router](https://www.npmjs.com/package/koa-router), since I had no need for the extra features.

### Control: png spritesheets

However unlikely, it is hypothetically possible that png spritesheets are still the most efficient way to serve icons, so I included a control group where I served png spritesheets.  Even if I decided to go with png spritesheets, however, I'd want to update the spritesheet generation process to be less brittle.  Npm has 40 different packages that can be used to generate spritesheets, so I trusted [this article](http://frontendbabel.info/articles/css-sprites-with-gulp/) when choosing a method for generating the spritesheet, and ended up using [gulp.spritesmith](https://www.npmjs.com/package/gulp.spritesmith).

The first hurdle we encountered was how to generate the pngs for the spritesheet, since the experimental dataset is SVGs.  We used [Inkscape](https://inkscape.org/en/) to generate pngs from svgs:

	for file in ~/icons-experiment/icons/svg/\*.svg; do
		inkscape -z -e ${file:r:s/svg/png/}24.png -w 22 -h 24 ${file}
		inkscape -z -e ${file:r:s/svg/png/}36.png -w 22 -h 36 ${file}
		inkscape -z -e ${file:r:s/svg/png/}48.png -w 22 -h 48 ${file}
		inkscape -z -e ${file:r:s/svg/png/}60.png -w 22 -h 60 ${file}
		inkscape -z -e ${file:r:s/svg/png/}72.png -w 22 -h 72 ${file}
	done

Technically, this gives the png spritesheets a leg up, since SVG solutions not only have to support mulitple styles, they also support multiple colors; however, since there isn't a simple way to change png colors at command line, and since the png spritesheet ended up being so much larger anyway, I was unconcerned by this.

To generate the png spritesheets, I used the following gulp target:

	gulp.task('sprite', function () {
		return gulp.src(paths.pngs)
			.pipe(spritesmith({
				imgName: 'sprite.png',
				cssName: 'sprite.css'
			})).
			pipe(gulp.dest(paths.build));
	});

We considered using an image minifier, but after testing [imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant), the gzipped spritesheet was the same size, so we didn't bother.


### SVGs as external components

[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) is a [widely-supported](http://caniuse.com/#feat=svg) [format for vector images](https://en.wikipedia.org/wiki/Vector_image_format) that seems to be a likely candidate for an efficient way to draw sharper icons.  Since they are just text describing how to draw and fill the image, they are fairly small to begin with, plus they are customizable, since they equally well describe how to draw a 32x32 icon as a 320x320 image.  Furthermore, they are UTF-8 encoded, which makes them particularly compressable, a 2.5:1 [compression ratio](https://en.wikipedia.org/wiki/Data_compression_ratio) in my testing (uses an svg with 20 embedded images as paths, see SVG store for how this was composed):

	$ wc -c svg.svg
	> 16058 svg.svg
	$ gzip -c svg.svg > svg.svg.gz
	$ wc -c svg.svg.gz
	> 6318 svg.svg.gz

To make sure that our svgs were as small as possible, I piped them first through an SVG minifier, [SVGMin](https://www.npmjs.com/package/gulp-svgmin), which uses [SVGO](https://github.com/svg/svgo) to optimize our SVGs.  I also had to make some minor chnages to the SVGs -- stripping out the fill so that it could be set using CSS, and adding a `preserveAspectRatio` attribute.  There's likely a more elegant solution, but I used a simple [regular expression replacement gulp plugin](https://www.npmjs.com/package/gulp-replace).  The final gulp target looks like:

	gulp.task('copy-svgs', function() {
		return gulp.src(paths.svgs)
			.pipe(svgmin())
			.pipe(replace({ regex: 'fill="[^"]\*"', replace: '' }))
			.pipe(replace({ regex: 'viewBox', replace: 'preserveAspectRatio="xMinYMin meet" viewBox' }))
			.pipe(gulp.dest(path.join(paths.build, 'svg')))
	});

I considered using a `<img>` tag for embedding the SVGs, but while it was simple, it left me unable to set the stroke and fill, so I ended up using what seems to be the most flexible way of adding an SVG to the DOM (and the method that all my SVG experiments ended up using), an `<svg>` tag:

	<svg class="icon" viewBox="-1 -1 26 26">
		<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="svg/agent.svg#Iconography"></use>
	</svg>

This does have one significant downside when used in React components.  Since SVGs are XML and not valid HTML, React doesn't allow me to inject them into tags without the use of [dangerouslySetInnerHTML](https://facebook.github.io/react/tips/dangerously-set-inner-html.html), for example, from the code that programmatically generates my page of 14000 icons:

	var iconsElems = [];
	var styles = {};
	for (var i = 0; i < ICONS.length; i++) {
		for (var j = 0; j < COLORS.length; j++) {
			for (var k = 0; k < SIZES.length; k++) {
				styles = {
					fill: COLORS[j],
					stroke: COLORS[j],
					height: SIZES[k].height,
					width: SIZES[k].width
				}
				var useTag = '<use style="height: ' + SIZES[k].height + '; width: ' + SIZES[k].width + ';" xlink:href="svg/' + ICONS[i] + '.svg#Iconography" />'
				iconsElems.push(<svg className="icon" viewBox={"-1 -1 26 26"} style={styles} dangerouslySetInnerHTML={{\__html: useTag }} />);
			}
		}
	}
	React.render(
		<div>{iconsElems}</div>,
		document.getElementById('icons')
	)

In theory, this opens up a vector for attack, whereby an attacker could manipulate our SVGs to embed executable code as a script tag into our SVGs and run JavaScript in our end-users browsers.  This is seems as if it would not be an academic concern -- should someone gain access to the SVGMin repository and upload a version of the plugin that adds malicious `<script>` tags into our SVGs, we would deploy the code into production happily.  In practice, we lock our dependencies to a single version, test upgrades, and cache the version from npm locally, so it would be very difficult to use this as an attack vector.  Also, it would be hypothetically possible to gain access to our production servers and then add the malicious code, but of course, if you already have access to the production server, there are much simpler vectors for attack than manipulating SVGs.  Furthermore, in my testing, the following SVG does not produce an alert, suggesting the XML is not evaluated as executable code:

	<?xml version="1.0" encoding="UTF-8"?>
	<svg width="22" height="24" preserveAspectRatio="xMinYMin meet" viewBox="0 0 22 24" xmlns="http://www.w3.org/2000/svg">
	  <title>icon-agent</title>
		<script type="text/javascript">
			alert("Hello attack vector!");
		</script>
		<g id="Iconography"  fill-rule="evenodd">
			<g id="ICONOGRAPHY---IDENTIFIERS-(24x24)" >
				<path d="M6.615 13.126l4.21 4.74c.1.112.274.112.374 0l4.178-4.716c2.054.382 3.34.977 3.655 1.335l.884 6.352C18.642 21.342 15.313 22 11 22s-7.64-.658-8.917-1.163l.884-6.35c.256-.328 1.5-.972 3.648-1.36M7.298 11c-.01 0-.02 0-.03.002-2.228.29-5.97 1.18-6.268 3.108l-1 7.182c0 .037.024.062.036.094-.017.058-.036.116-.036.175C0 22.91 5.477 24 11 24s11-1.092 11-2.44c0-.058-.02-.116-.036-.174.012-.032.036-.057.036-.094l-1-7.182c-.244-1.872-4.012-2.78-6.27-3.09l-.03-.002c-.08 0-.153.04-.202.11l-3.488 3.935-3.512-3.955c-.048-.068-.122-.108-.2-.108zM11 0C8.694 0 6 1.44 6 5.5 6 8.547 8.735 11 11 11s5-2.453 5-5.5C16 2.107 14.084 0 11 0zm0 2c2.48 0 3 1.903 3 3.5C14 7.432 12.185 9 11 9S8 7.432 8 5.5C8 2.455 9.88 2 11 2zm6.75 17h-3.5c-.138 0-.25-.112-.25-.25v-1.5c0-.138.112-.25.25-.25h3.5c.138 0 .25.112.25.25v1.5c0 .138-.112.25-.25.25z" id="icon-agent"/>
			</g>
		</g>
	</svg>

### Web fonts

The next experimental approach that I tried was generating web fonts.  Icon fonts use the Unicode [Private Use Areas](https://en.wikipedia.org/wiki/Private_Use_Areas), portions of the Unicode code point ranges that purposefully have no assigned glyph.  Your icons are then mapped to those code points, and the enclosing tag is given the font-family that corresponds to your generated font, and then the glyph drawn is your icon.  It can be kind of strange to use `font-size` to determine the size of your icons, but is a very compact way of sending images, since they are vectors.  We tried two different libraries for generating fonts: [iconfont](https://github.com/nfroidure/gulp-iconfont) and [fontcustom](https://github.com/johanbrook/gulp-fontcustom).  Both generate a full set of web fonts, including the two most widely supported, [ttf](http://caniuse.com/#feat=ttf) and [woff](http://caniuse.com/#feat=woff).

For [iconfont](https://github.com/nfroidure/gulp-iconfont), we used the following gulp target:

	gulp.task('iconfont', function() {
		return gulp.src([paths.svgs])
			.pipe(iconfont({
				fontName: fontName,
				appendUnicode: false,
				formats: ['ttf', 'eot', 'woff', 'svg'],
				timestamp: runTimestamp
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

I encountered a couple of "gotchas" while trying to use this gulp plugin.   The first was in our attempted use of the [gulp-iconfont-css](https://www.npmjs.com/package/gulp-iconfont-css) package, which produced css that did not work at all.  Per [the issue we filed on Github](https://github.com/nfroidure/gulp-iconfont/issues/73), the problem was that I were piping the images through the iconfont generator before the css generator, but I decided to use our own css template instead.  I generated it using [lodash templates](https://lodash.com/docs), as included in the [consolidate](https://www.npmjs.com/package/consolidate) module.  I used the following template:  

	@font-face {
		font-family: "<%= fontName %>";
		src: url('<%= fontName %>.eot');
		src: url('<%= fontName %>.eot?#iefix') format('eot'),
			url('<%= fontName %>.woff') format('woff'),
			url('<%= fontName %>.ttf') format('truetype'),
			url('<%= fontName %>.svg#<%= fontName %>') format('svg');
	}

	.icon:before {
		font-family: "<%= fontName %>";
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		font-style: normal;
		font-variant: normal;
		font-weight: normal;
		/* speak: none; only necessary if not using the private unicode range (firstGlyph option) \*/
		text-decoration: none;
		text-transform: none;
	}

	<% \_.each(glyphs, function(glyph) { %>
	.icon-<%= glyph.name %>:before {
		content: "\<%= glyph.codepoint %>";
	}
	<% }); %>

 The second was using the recommended `appendUnicode: true` option, which changes the name of the files on the filesystem by prepending the unicode codepoint assigned to the glyph produced to the file name.  This may be helpful for some solutions, but since we generated css classes that prepended the codepoint using a `:before` [psuedoselector to set element content](https://developer.mozilla.org/en-US/docs/Web/CSS/content), I had no need to know the codepoints directly, and it broke the other build targets.  Copying the SVGs to a temp folder, a la `gulp.src([paths.svg]).pipe(gulp.dest(paths.temp))` should allow the use of this option, should you find it helpful.

For [fontcustom](https://github.com/johanbrook/gulp-fontcustom), I used the following gulp target:

	gulp.task('fontcustom', function() {
		gulp.src(paths.svgs)
			.pipe(fontcustom({
				font_name: fontName + '2',
				'css-selector': '.icon-{{glyph}}'
			}))
			.pipe(gulp.dest(paths.build));
	});

Fontcustom had only one hiccough, and that was that it requires the [fontcustom gem](https://rubygems.org/gems/fontcustom/versions/1.3.8).  We were doing testing on OS X, so I used [Homebrew](http://brew.sh/) to install its dependencies:

	brew install fontforge --with-python
	brew install eot-utils
	gem install fontcustom

Were we to have decided to go with fontcustom as our final solution, we'd have to figure out how to install the dependencies on our [Bamboo build server](https://www.atlassian.com/software/bamboo).  I'm pretty sure we could get by creating a custom npm package with the dependencies checked in and storing it <!-- TODO: add " in our local npm cache, or "?  We have one, right? --> in a private npm repository such as [Sinopia](https://www.npmjs.com/package/sinopia).

### Using SVG as a background-image

This idea comes from [CSS Tricks](https://css-tricks.com/using-svg/) as well.  The idea is to write the svg directly into a stylesheet as a background-image like this (as a [lodash template](https://lodash.com/docs)):

	.<%= icon %> {
	  background: url('data:image/svg+xml;utf8,<%= svg %>');
	}

I couldn't find a [gulp](http://gulpjs.com/) plugin that generated this kind of stylesheet, or that ran a template for each file in a directory.  I tried to get one put together using [gulp-foreach](https://www.npmjs.com/package/gulp-foreach), [gulp-concat](https://www.npmjs.com/package/gulp-concat), and [gulp-consolidate](https://www.npmjs.com/package/gulp-consolidate), but I couldn't find a templating solution that took the piped data as data instead of the templates, so I wrote one myself: <!-- Can/should we release this as OSS? -->

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

			var component = \_.template(template)({ contents: file.contents, fileName: fileName, filePath: file.path });
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

Which is used like this:

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

### Using an SVG svgstore

This idea comes from [CSS Tricks](https://css-tricks.com/svg-symbol-good-choice-icons/) via [Fabrice Weinburg](https://github.com/FWeinb) and [TxHawks](https://github.com/TxHawks), as implemented in the [plugin gulp-svgstore](https://github.com/w0rm/gulp-svgstore).  We tried two variants, one that used [lodash templates](https://lodash.com/docs#template) to write the SVG store directly into the DOM, and a second that uses an [XHR](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) to load the SVGs asynchronously. The usage is very similar to adding external SVGs:

	<svg class="icon">
		<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#agent"></use>
	</svg>

And the gulp plugin is incredibly easy to use:

	gulp.task('svgstore', function() {
		return gulp.src(paths.svgs)
			.pipe(svgmin())
			.pipe(svgstore())
			.pipe(gulp.dest(paths.build))
	});

Adding the element to the DOM using a lodash template was fairly simple using the `generateComponents` gulp plugin I wrote for generating CSS from SVGs.  The XHR for the asynchronous version was the most complicated part of using this, but it's a simple request, and then simply adding the returned svg to an element that is hidden:

HTML:
	<div id="svgContainer" style="height: 0; width: 0; position: absolute; visibility: hidden"></div>

JavaScript:
	<script>
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "svg.svg",false);
		xhr.overrideMimeType("image/svg+xml");
		xhr.send("");
		document.getElementById("svgContainer").innerHTML = xhr.response;
	</script>

### Generating React components

At Redfin, we use [webpack](http://webpack.github.io/) to bundle our JavaScript into two bundles -- a common bundle that is shared by all pages on the site, and a bundle specific to each page.  Webpack takes a complex graph of dependencies and generates static assets from them.  The intuition, therefore, behind this method was taht we could use webpacks ability to reason about the dependency graph to only include those components required for a given page in the static page-specific bundle, and a common core of icons for all pages, by requiring the icons as components.  This was the third application of the `generateComponents` plugin, and used the following template:

	var Icon<%= fileName.replace(/-/,'') %> = React.createClass({
		displayName: "com.redfin.icons.<%= fileName %>",
		propTypes: {
			fill: React.PropTypes.string,
			width: React.PropTypes.string,
			height: React.PropTypes.string
		},
		getDefaultProps: function() {
			return {
				fill: "#585858",
				height: "24px",
				width: "24px"
			};
		},
		render: function() {
			var elem = '<%= contents %>';
			elem.replace(/fill="[^"]*"/, 'fill="' + this.props.fill + '"');
			elem.replace(/stroke="[^"]*"/, 'stroke="' + this.props.fill + '"');
			elem.replace(/width="[^"]*"/, 'width="' + this.props.width + '"');
			elem.replace(/height="[^"]*"/, 'height="' + this.props.height + '"');

			return (
				<div dangerouslySetInnerHTML={{\__html: elem }}></div>
			);
		}
	});

## What did we find?

Fairly early on, I eliminated the PNG spritesheets -- the spritesheets are just enormous compared to the size of the SVGs (139 KB for the PNG spritesheet which doesn't even support multiple colors vs 6.5 KB for all of the SVGs), and don't eliminate the blurriness.  Similarly, I discarded the stylesheet-embedded icons for much the same reason -- since the SVGs are embedded in CSS and displayed as background images, I couldn't find a way to adjust the size and color of the SVGs, which would mean that I would have to generate O((number of icons) x (number of colors) x (number of sizes)) CSS classes, which is simply unmanageable, and not particularly space-efficient.  I also eliminated the plan to generate React components, since their inclusion in page-specific bundles would necessitate re-downloading the same icons for every page, even if they share icons, instead of fetching them from the browser cache.  I considered including all of them in the common bundle, but if that is the case, then there is a lot of overhead (most notably maintenance of the SVG component template and `require` statements in components) for no benefit from Webpack.  The `gulp-iconfont` solution is remarkably poorly behaved -- the icons that it drew were significantly smaller than those produced by the other methods, and the font mishandles a number of different icons (most notably making circles and ovals screwy looking), so it was also fairly easy to eliminate.

Therefore, when it came time to measure the performance of the various methods I explored, there were only a couple of real competitors left to test: the two web fonts, the synchronous and asynchronous SVG stores, and serving external SVGs.  I only used Chrome to record the performance of our various methods, since Firefox requires starting and stopping recordings manually for performance measurements, which makes the experiment hard to reproduce (since the results can depend on when you click start/stop recording).  I spent a fair bit of time grokking the [Chrome Timeline](https://developer.chrome.com/devtools/docs/timeline), but here's what I found:

<table>
	<tr>
		<th>Experiment</th>
		<th>Total size (KB)</th>
		<th>Aggregate time (s)</th>
		<th>Load time (ms)</th>
		<th>Max JS Heap size (b)</th>
		<th>Time to first icon paint</th>
		<th>Total paint time</th>
	</tr>
	<tr>
		<td>gulp-fontcustom</td>
		<td>236</td>
		<td>3.25</td>
		<td>172</td>
		<td>16,246,072</td>
		<td>1270</td>
		<td>373</td>
	</tr>
	<tr>
		<td>SVG store (sync)</td>
		<td>237</td>
		<td>3.20</td>
		<td>173</td>
		<td>18,140,872</td>
		<td>908.82</td>
		<td>538</td>
	</tr>
	<tr>
		<td>SVG store (async)</td>
		<td>237</td>
		<td>3.26</td>
		<td>178</td>
		<td>18,079,912</td>
		<td>851</td>
		<td>516</td>
	</tr>
	<tr>
		<td>External SVGs</td>
		<td>246</td>
		<td>3.17</td>
		<td>148</td>
		<td>17,334,048</td>
		<td>820</td>
		<td>519</td>
	</tr>
</table>

From those results, and based on its ease of use and flexibility and its resistance to malformed SVGs that are produced by our design team, we decided to go with the asynchronous SVG store solution.  For us, the "flicker" time, or the time till the first icon appeared on the page was a very significant part of our decision making process, followed by the total size on the wire.  The `gulp-fontcustom` solution was surprisingly slow to run the full animation, though spends the smallest amount of its total time in paint, which [adversely affects scrolling](http://www.html5rocks.com/en/tutorials/speed/scrolling/). The external SVG solution took up more space on the wire, which adversely affects our customers on mobile.  The synchronous SVG store doesn't allow us to take advantage of the browser cache, so we decided to go with the asynchronous SVG store.

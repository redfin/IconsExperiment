# Icons-Experiment
This repo is an investigation to figure out what the "best" solution is for Redfin to serve its icons.  To see a more formal definition of best, see "What we hoped to achieve".

# Installation
1. Installed the toolchain -- see step 1 under Method for specific installation instructions.

2. Create a folder for the project, and clone the repo:
		mkdir ~/code/icons-experiment
		cd ~/code/icons-experiment
		git clone https://doug.wade@stash.redfin.com/scm/\~doug.wade/icons-experiment.git

3. Build the assets
		gulp

4. Start the server
		node index.js

5. View the experiments in your browser
		# Also, open -a "Firefox"; open -a "Chome"; open for your default browser
		open -a "Chromium" "http://localhost:3000"

6. Rebuild the changes
		gulp clean
		gulp

# TODOs:
	- Focus on 3, 4, 5, 6, 8
	- Get scroll test results
	- Get hard numbers on size
	- Change cache-control headers
	- Try moving the icons down 40 px and back up again
	- Talk to Tony Huang
	- Try the map page explosion

# Write-up
The note for the blog post I hope to turn this in to follow:

## What we hoped to achieve:
	1. Fix "fuzziness" on our existing icons / Satisfy the needs of Retina users
	2. Keep the total size down for mobile users / fast loading
	3. Make it less brittle than our Java-Maven-SpriteSheet solution that breaks every time we change the size of an icon.
	4. Keep total render time, including with scrolling and animations, to a minimum.
	5. Fit into our existing architecture effortlessly.

## Method:

1. I installed my toolchain
		brew install nodejs
		npm install -g n
		n io latest # We need to use a recent version of iojs to get generators support for koa
		npm install -g gulp
		npm install -g bower
		# fontcustom requirements
		brew install fontforge --with-python
		brew install eot-utils
		gem install fontcustom
2. I chose the methods to test:
	+ A traditional, png-based spritesheet.  I trusted [this article](http://frontendbabel.info/articles/css-sprites-with-gulp/) when choosing the best solution
	+ An icon-font generator.  I had to choose between [three](https://github.com/nfroidure/gulp-iconfont) [good-looking](https://github.com/nfroidure/gulp-svgicons2svgfont) [options](https://github.com/johanbrook/gulp-fontcustom).  I fairly quickly elimnated [gulp-fontcustom](https://github.com/johanbrook/gulp-fontcustom), since it doesn't look particularly well maintained, but struggled to choose between [gulp-iconfont](https://github.com/nfroidure/gulp-iconfont) and [gulp-svgicons2svgfont](https://github.com/nfroidure/gulp-svgicons2svgfont), but figured it didn't much matter since they're both written by [Nicholas Froidure](https://github.com/nfroidure).  I ultimately chose [gulp-iconfont](https://github.com/nfroidure/gulp-iconfont), since it had better code climate and test coverage numbers.
	+ An SVG symbol solution, as described in [this CSS Tricks article](https://css-tricks.com/svg-symbol-good-choice-icons/). It seems like there are two gulp solutions, [gulp-svgstore](https://github.com/w0rm/gulp-svgstore) and [gulp-svg-icons](https://github.com/coma/gulp-svg-icons).  I decided to use [gulp-svgstore](https://github.com/w0rm/gulp-svgstore), since it appears that [gulp-svg-icons](https://github.com/coma/gulp-svg-icons) only works for html that is fully-rendered before sending it from the server, since it rewrites existing `<icon-trophy>`s into `<svg>`s, and for our webapp, that can't happen on the build server, we need to rewrite in the browser.
3. Formulated a hypothesis.  I think that we'll end up going with the SVG symbol solution, since I think it'll get us the crispest icons and, once passed through [gulp-svgmin](https://github.com/ben-eb/gulp-svgmin), will take up very little space on the wire, and allow us to set stroke and fill.
4. I created a project space to work in:
		mkdir ~/icons-experiment
		npm init
		npm install --save koa koa-static koa-routes gulp gulp-svgstore gulp-iconfont gulp-iconfont-css gulp.spritesmith
		bower init
		bower install --save react
5. I copied a working set of existing Redfin icons to `~/icons-experiment/icons/svg`
		cp /path/to/existing/icons/*.svg ~/icons-experiment/icons/svg
6. I converted the existing svgs
		brew install xquartz
		brew install inkscape
		for file in ~/icons-experiment/icons/svg/*.svg; do
			inkscape -z -e ${file:r:s/svg/png/}.png -w 22 -h 24 ${file}
		done

7. I created a index page to link to the experiment pages at ~/icons-experiment/indx.html for ease of testing
		<!DOCTYPE html>
		<html>
		<head>
		<meta charset="UTF-8">
		</head>
		<body>
		<h1>LET'S DO SOME SCIENCE!</h1>
		<ul>
			<!-- Add one link per experiment -->
			<li><a href="/experiment1.html">Experiment 1</a></li>
		</body>
		</html>
8. I set up koa to serve my experiment pages, and the simple index page to link to the experiment:
		"use strict";

		var koa = require("koa");
		var route = require("koa-route");
		var serve = require("koa-static");
		var gzip = require("koa-gzip");

		var app = koa();
		app.use(gzip());

		app.use(serve("views"));
		app.use(serve("build"));
		app.use(serve("bower_components"));
		app.use(serve("js"))

		app.use(route.get("/", function() {
		  return this.redirect("/index.html");
		}));

		app.listen(3000);
		console.log("listening on port 3000.");

9. I started the server to make sure it works
		node index.js

10. Started in on the experiments!

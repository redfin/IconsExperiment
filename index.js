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

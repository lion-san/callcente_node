/// <reference path="typings/node/node.d.ts" />
var http = require("http");
var express = require('express');
var url = require("url");

/*function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");


    response.writeHead(200, {"Content-Type": "application/xml; charset=utf-8 "});
    var content = route(handle, pathname, request);
    response.write(content);
    response.end();
  }

  http.createServer(onRequest).listen(process.env.PORT);
  //var app = express.createServer(onRequest).listen(process.env.PORT);
  console.log("Server has started.");
}

exports.start = start;*/

var app = express.createServer();

app.get('/', function(req, res){
  res.send('Hello World');
});

app.listen(process.env.PORT);;

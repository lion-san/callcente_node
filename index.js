var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/request"] = requestHandlers.request;
handle["/runMyProess"] = requestHandlers.runMyProess;


server.start(router.route, handle);

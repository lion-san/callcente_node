/// <reference path="typings/node/node.d.ts" />
function route(handle, pathname, request) {
  console.log("About to route a request for " + pathname);

  if (typeof handle[pathname] === 'function') {
    return handle[pathname](request);
  }else{
    console.log("No request handler found for " + pathname);
    return "404 Not found";
  }
}

exports.route = route;

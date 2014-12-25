var express = require('express');
var router = express.Router();

var handler = require('../handler/requestHandlers');

/* GET users listing. */
//router.get('/start', function(req, res) {
router = {
  start : function(req, res) {
    res.send(
      handler.start(req));
  },
  
  request : function(req, res) { 
    res.send(
      handler.request(req));
  },
  
  runMyProcess : function(req, res) { 
    res.send(
      handler.runMyProcess(req));
  },
  
  callBackToCustomer : function(req, res) { 
    res.send(
      handler.callBackToCustomer(req));
  },
  
  callBackMsg : function(req, res) { 
    res.send(
      handler.callBackMsg(req));
  }
}

//});

module.exports = router;

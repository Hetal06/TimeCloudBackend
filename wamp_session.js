'use strict';
var ws=null;

var WAMP = {
  setSession: function (session) {
    console.log("wamp setSession ------>");
    ws = session;
    return true;
  },
  getSession: function () {
  	console.log("wamp getSession <------");
  	// console.log(ws);
    return ws;
  },
};  

module.exports = WAMP;

'use strict';


var wamp = require('./wamp_session');
var autobahn = require('autobahn');

var connection = new autobahn.Connection({
   // url: 'ws://localhost:8080/ws',
   url: 'ws://219.88.253.55:8080/ws',
   realm: 'realm1'
});
// openssl req -nodes -new -x509 -keyout wamp_server.key  -out wamp_server.crt
// -subj '/C=IN/ST=Surat/L=Erlangen/O=Jacksolutions/CN=localhost/' \

// {
//    "type": "websocket",
//    "endpoint": {
//       "type": "tcp",
//       "port": 443,
//       "tls": {
//          "key": "server_key.pem",
//          "certificate": "server_cert.pem"
//       }
//    },
//    "url": "wss://example.com"
// }

 
connection.onopen = function (session) {
   session.log("Session open.");

   
   wamp.setSession(session);

   wamp.getSession().publish('app.timecloud.heartbeat',['Socket has been started']);

   function onhello (args) {
      console.log("event received: " + args[0]);
   }
   
   wamp.getSession().subscribe('app.timecloud.route', onhello).then(
      function (sub) {
         console.log("subscribed to topic Route");
      },
      function (err) {
         console.log("failed to subscribed: " + err);
         console.log(err);
      }
   );
};

connection.onclose = function (reason, details) {
   console.log("WAMP connection closed", reason, details);
   var session = null;
   wamp.setSession(session);
}

connection.open();

// connection.onopen = function (session) {
  
//    session.log("Session open.");
//    // console.log(session);
//    wamp.setSession(session);

//    session.publish('com.example.oncounter', ['hello']);

//    // console.log(wamp.getSession());
//    // session.publish('com.app.session', [session]);
//    // app.session = session;
//      // app.visits += 1;
//    // // console.log(app.wamp);
//    // // REGISTER a procedure for remote calling
//    // //
//    // function get_visits () {
//    //    return 'demo';
//    // }

//    // session.register('com.example.get_visits', get_visits).then(
//    //    function (reg) {
//    //       console.log("procedure get_visits() registered");
//    //        var regs = session.registrations;
//    //        for (var i = 0; i < regs.length; ++i) {
//    //           console.log("Active registration with ID " + regs[i].id);
//    //        }

//    //    },
//    //    function (err) {
//    //       console.log("failed to register procedure: " + err);
//    //    }
//    // );


//    // function get_visits1(data) {
//    //    console.log("data",data);
//    //    return data;
//    // }

//    // session.register('com.test.welcome', get_visits1('test')).then(
//    //    function (reg) {
//    //       console.log("procedure welcome registered");
//    //    },
//    //    function (err) {
//    //       console.log("failed to register procedure: " + err);
//    //    }
//    // );


 
//     // var subs = session.subscriptions;
//     // for (var i = 0; i < subs.length; ++i) {
//     //    console.log("Active subscription with ID " + subs[i].id);
//     // }

//    // session.register('com.example.on_visit');

//    // session.publish('com.myapp.test', [app.visits]);

//       // SUBSCRIBE to a topic and receive events
//    //
//    function onhello (args) {
//       var msg = args[0];
//       console.log("event for 'onhello' received: " + msg);
//    }
//    session.subscribe('com.example.onhello', onhello).then(
//       function (sub) {
//          console.log("subscribed to topic 'onhello'");
//       },
//       function (err) {
//          console.log("failed to subscribed: " + err);
//       }
//    );


//    // REGISTER a procedure for remote calling
//    //
//    function add2 (args) {
//       var x = args[0];
//       var y = args[1];
//       console.log("add2() called with " + x + " and " + y);
//       return x + y;
//    }
//    session.register('com.example.add2', add2).then(
//       function (reg) {
//          console.log("procedure add2() registered");
//       },
//       function (err) {
//          console.log("failed to register procedure: " + err);
//       }
//    );


//    // PUBLISH and CALL every second .. forever
//    //
//    // var counter = 0;
//    // // setInterval(function () {

//    //    // PUBLISH an event
//    //    //
//    //    session.publish('com.example.oncounter', [counter]);
//    //    console.log("published to 'oncounter' with counter " + counter);

//    //    // CALL a remote procedure
//    //    //
//    //    session.call('com.example.mul2', [counter, 3]).then(
//    //       function (res) {
//    //          console.log("mul2() called with result: " + res);
//    //       },
//    //       function (err) {
//    //          if (err.error !== 'wamp.error.no_such_procedure') {
//    //             console.log('call of mul2() failed: ' + err);
//    //          }
//    //       }
//    //    );

// //       counter += 1;
// //    }, 1000);
// };

// connection.onclose = function (reason, details) {
//    console.log("WAMP connection closed", reason, details);
//    app.session = null;
// }

// connection.open();

// var autobahn = require('autobahn');

// var demoRealm = "realm1";
// var demoPrefix = "io.crossbar.demo";
// var wsuri = "ws://127.0.0.1:9000";
// var sess;
// var connection = null;


// function connect() {

//    connection = new autobahn.Connection({
//       url: wsuri,
//       realm: demoRealm,
//       max_retries: 30,
//       initial_retry_delay: 2
//       }
//    );

//    connection.onopen = function (session) {

//       sess = session;
//       controllerChannelId = null;
//       console.log("Connected"+session.id);
//       setupDemo();

//       // if (checkChannelId(controllerChannel.value)) {
//       //    switchChannel(controllerChannel.value);
//       // } else {
//       //    switchChannel(randomChannelId());
//       // }

//       if(typeof(afterAuth) !== "undefined" ) {
//          afterAuth(); // only exists in colorpicker demo
//       }
//    };

//    connection.onclose = function() {
//       sess = null;
//       console.log("connection closed ", arguments);
//    }

//    connection.open();
// }


// function setupDemo() {

//    sess.prefix("api", demoPrefix + ".notification");
// }

// connect();

// create a connection to WAMP router (Crossbar.io)
// var connection = new autobahn.Connection({
//    url: 'ws://127.0.0.1:9000',
//    realm: 'realm1'}
// );

// connection.onopen = function (session) {
//    console.log("connected to WAMP router");
//    session = session;
   

      // SUBSCRIBE to a topic and receive events
   //
   // function onhello (args) {
   //    var msg = args[0];
   //    console.log("event for 'onhello' received: " + msg);
   // }
   // session.subscribe('com.example.onhello', onhello).then(
   //    function (sub) {
   //       console.log("subscribed to topic 'onhello'");
   //    },
   //    function (err) {
   //       console.log("failed to subscribed: " + err);
   //    }
   // );


   // REGISTER a procedure for remote calling
   //
   // function add2 (args) {
   //    var x = args[0];
   //    console.log("add2() called with " + x);
   //    return x ;
   // }
   // session.register('com.myapp.hello', 'hello').then(
   //    function (reg) {
   //       console.log("procedure add2() registered");
   //    },
   //    function (err) {
   //       console.log("failed to register procedure: " + err);
   //    }
   // );


   // session.publish('com.myapp.hello', ['Hello, world!']);

   // PUBLISH and CALL every second .. forever
   //
   // var counter = 0;
   // setInterval(function () {

   //    // PUBLISH an event
   //    //
      // session.publish('com.example.oncounter', [counter]);
   //    console.log("published to 'oncounter' with counter " + counter);

   //    // CALL a remote procedure
   //    //
   //    session.call('com.example.mul2', [counter, 3]).then(
   //       function (res) {
   //          console.log("mul2() called with result: " + res);
   //       },
   //       function (err) {
   //          if (err.error !== 'wamp.error.no_such_procedure') {
   //             console.log('call of mul2() failed: ' + err);
   //          }
   //       }
   //    );

   //    counter += 1;
   // }, 1000);

// };

// connection.onclose = function (reason, details) {
//    console.log("WAMP connection closed", reason, details);
//    session = null;
// }

// connection.open();

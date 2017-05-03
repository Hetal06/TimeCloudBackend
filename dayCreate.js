var express  = require('express');
var app      = express()
, engine = require('ejs-locals')
, fs = require('fs');
var port     = process.env.PORT || 3003;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash')
    ,helpers = require('view-helpers')
    ,Moment = require('moment-timezone')
var configDB = require('./config/config');
//var env = require('node-env-file');
var http = require('http');
var SessionStore = require("session-mongoose")(express);
require('./config/passport')(passport); // pass passport for configuration

var Moment = require('moment-timezone');
var request = require('request');

var path = require('path');
global.appRoot = path.resolve(__dirname);

//if(mongoose.connect(configDB.url)) // connect to our database
mongoose.connect(configDB.url, {server: {auto_reconnect: true,  poolSize: 10 }}, function(err) {
    if (err) {
      console.log(err);
    }    
});
var logPath = appRoot+'/mongodblogs/logs.txt'
mongoose.connection.on('error', function (err) {
    console.log(err)
    fs.writeFile(logPath, err, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    }); 
}) 

var store = new SessionStore({
    sweeper: false,
    connection: mongoose.connection // <== custom connection
});

app.configure(function() {
    // set up our express application
    app.use(express.logger('dev')); // log every request to the console
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.bodyParser()); // get information from html forms
    app.engine('ejs', engine);
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'ejs'); // set up ejs for templating
    // required for passport
    //app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
    app.use(express.session({
      secret: 'ilovescotchscotchyscotchscotch',
      store: store      
    }));
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    app.use(express.static(__dirname + '/public'));

});
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file)
})
app.use(helpers('application-name'))

var CronJob = require('cron').CronJob;
var attendanceCronCtrl = require('./app/controllers/attendanceCron');
var cronCtrl = require('./app/controllers/cron');
var shiftCtrl = require('./app/controllers/shift');
var areaCtrl = require('./app/controllers/newCron');
// 0 */45 * * * *
// new CronJob('05 02 10 * * *', function() {
//     request('/newat', attendanceCronCtrl.newAttendance); // create a new attendance for employess everyday
// }, null, true, "");

// var job1 = new CronJob('05 * * * * *', function() {
//     request('/calculateProject', cronCtrl.calculateProject);
// }, null, true, "");


var job1 = new CronJob('* * * * * *', function() {
     console.log("each sec");
  },
  null,
  true,
  ""
);
    

var job2 = new CronJob('05 * * * * *', function() {
    console.log("5 sec");
  },
  null,
  true,
  ""
);


var job3 = new CronJob('10 * * * * *', function() {
     console.log("10 sec");
  },
  null,
  true,
  ""
);


var job4 = new CronJob('15 * * * * *', function() {
     console.log("1 min");
  },
  null,
  true,
  ""
);

// var job5 = new CronJob('05 */1 * * * *', function() {
//      console.log("1 min 05 sec");
//   },
//   null,
//   true,
//   ""
// );


// var job6 = new CronJob('10 */1 * * * *', function() {
//      console.log("1 min 10 sec");
//   },
//   null,
//   true,
//   ""
// );


// var job7 = new CronJob('*/2 * * * *', function() {
//      console.log("2 min");
//   },
//   null,
//   true,
//   ""
// );

// var job8 = new CronJob('05 */2 * * * *', function() {
//      console.log("2 min 05 sec");
//   },
//   null,
//   true,
//   ""
// );


// var job9 = new CronJob('10 */2 * * * *', function() {
//      console.log("2 min 10 sec");
//   },
//   null,
//   true,
//   ""
// );

// var job10 = new CronJob('00 50 * * * *', function() {
//      console.log("2 min 10 sec");
//   },
//   null,
//   true,
//   ""
// );

var checkcalFlag = function(backDays){
    job1.stop();
    job2.stop();
    job3.stop();
    job4.stop();
    areaCtrl.readClockData({})
    // request('/calculateProject', cronCtrl.calculateProject);
}

var checkDays = function(backDays){
    job1.stop();
    job2.stop();
    job3.stop();
    job4.stop();

    attendanceCronCtrl.newAttendance(function(status){
      console.log("Attendances new days entries done %s",status);
      backDays(true);
    });
    // request('/calculateProject', cronCtrl.calculateProject);
}

var job = new CronJob({
    cronTime: '25 * * * * *',
    onTick:checkcalFlag,
    onComplete: function() {
        console.log("onComplete");
        job1.start();
        job2.start();
        job3.start();
        job4.start();
    },
    start: true,
    timeZone: ''
});



// var checkShift = function(backDays){
//     job1.stop();
//     job2.stop();
//     job3.stop();
//     job4.stop();
  
//     shiftCtrl.setAdvanceShiftFlag(function(status){
//       console.log("shift flag setting done %s",status);
//       backDays(true);
//     });
//     // request('/calculateProject', cronCtrl.calculateProject);
// }

// var jobNew = new CronJob({
//     //0 */45 
//     cronTime: '15 22 15 * * *',
//     onTick:checkShift,
//     onComplete: function() {
//         console.log("onComplete");
//         job1.start();
//         job2.start();
//         job3.start();
//         job4.start();
//     },
//     start: true,
//     timeZone: ''
// });

app.listen(3003);
// app.timeout = 30000;
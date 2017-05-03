var express = require('express');
var app = express(),
    engine = require('ejs-locals'),
    fs = require('fs');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash'),
    helpers = require('view-helpers'),
    Moment = require('moment-timezone')
var configDB = require('./config/config');
//var env = require('node-env-file');
var http = require('http');
var SessionStore = require("session-mongoose")(express);
require('./config/passport')(passport); // pass passport for configuration

var Moment = require('moment-timezone');
var request = require('request');

var path = require('path');
global.appRoot = path.resolve(__dirname);

var wamp = require('./wamp');

//if(mongoose.connect(configDB.url)) // connect to our database
mongoose.connect(configDB.url, {
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
}, function(err) {
    if (err) {
        console.log(err);
    }
});
var logPath = appRoot + '/mongodblogs/logs.txt'
mongoose.connection.on('error', function(err) {
        console.log(err)
        fs.writeFile(logPath, err, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });
    })
    //mongoose.connect(configDB.url)
var store = new SessionStore({
    sweeper: false,
    connection: mongoose.connection // <== custom connection
});

/*var connection = mongoose.createConnection(configDB.url);
autoIncrement.initialize(connection);*/

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
fs.readdirSync(models_path).forEach(function(file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file)
})
app.use(helpers('application-name'))

var CronJob = require('cron').CronJob;

var companyCtrl = require('./app/controllers/company');
var shiftCtrl = require('./app/controllers/shift');
var employeeCtrl = require('./app/controllers/employee');
var cronCtrl = require('./app/controllers/cron');
var reportCtrl = require('./app/controllers/report');
var attendanceCronCtrl = require('./app/controllers/attendanceCron');
var areaCtrl = require('./app/controllers/newCron');
var scriptsCtrl = require('./app/controllers/scripts');

// var mysqlCtrl = require('./app/controllers/mysql');
// var mysql2Ctrl = require('./app/controllers/mysql2');
var http = require('http');
var async = require('async');
//app.get('/iclock', cronCtrl.readClockData);

var readFromMySQL = new CronJob('05 * * * * *', function() {
    /*it read the data from mysql's database and 
    insert into attendanceMysqlData.js collection 
    in mongodb.
    --> it runs on every minute at 02 and 32 sec*/
    request('/cron', cronCtrl.readData);
}, null, true, "");

var calProject = new CronJob('08 * * * * *', function() {
    cronCtrl.calculateProject(function(clb){
        console.log("project done "+clb);
    });
}, null, true, "");


var calArea = new CronJob('18 * * * * *', function() {
    
    // it calculate the areastart and areafinish 
    // when we change the shift in project and it save
    // in attedance collection.
    // --> it runs on every minute at 34 sec
    request('/area', areaCtrl.areaCal);
}, null, true, ""); //calculate area start and area finish

var addAttendance = new CronJob('25 * * * * *', function() {
    // it read the data of the checkin from 
    // attendanceMysqlData.js collection and insert
    // into the attedance collection of mongodb.
    // --> it runs on every minute at 30 sec
    request('/attendanceDataRead', cronCtrl.insertAttendanceData);
}, null, true, "");

var calDashboard = new CronJob('30 * * * * *', function() {
    request('/dashboardCalculation', cronCtrl.dashboardCalculation);
}, null, true, "");

var calAreaShift = new CronJob('40 * * * * *', function() {
    request('/areashift', areaCtrl.areaShift); // calculate checkins according to areastart and area finish
}, null, true, "");

var calAtn = new CronJob('45 * * * * *', function() {
    request('/ca', attendanceCronCtrl.calculateAttendance); // calculate attandance checkins
}, null, true, "");

var readClock = new CronJob('50 */2 * * * *', function() {
    request('/iclock', areaCtrl.readClockData); // read clock data from mysl and write to mongodb
}, null, true, "");

var exportAttendance = new CronJob('55 * * * * *', function() {
    request('/attendanceExcel', employeeCtrl.attendanceExcel); //export excel
}, null, true, "");

var dltFromCron = new CronJob('00 30 10 * * *', function() {
    cronCtrl.deleteRecordsInCron(function(status){
      console.log("All Records from the cron is deleted %s",status);
    });
}, null, true, "");

var dltCustomShift = new CronJob('00 30 11 * * *', function() {
    cronCtrl.deleteCustomShift(function(status){
      console.log("customShifts has been deleted %s",status);
    });
}, null, true, "");

var createDashboard = new CronJob('00 00 04 * * *', function() {
    request('/autoCreateDashBoard', cronCtrl.autoCreateDashBoard);
}, null, true, "");

var checkOut = function(backOut){
    // readFromMySQL.stop();
    // calProject.stop();
    // addAttendance.stop();
    // calArea.stop();
    // calDashboard.stop();
    // calAreaShift.stop();
    // calAtn.stop();
    // setOutForIInn.stop();
    // readClock.stop();
    // exportAttendance.stop();
    scriptsCtrl.changeChekingTypeForProject(function(status){
       console.log("9) workcode set out time for all %s",status);
       backOut(true);
    });
}

var setOutForIInn = new CronJob({
    cronTime: '18 * * * * *',
    onTick:checkOut,
    onComplete: function() {
        console.log("onComplete setOutForIInn");
        // readFromMySQL.start();
        // calProject.start();
        // addAttendance.start();
        // calArea.start();
        // calDashboard.start();
        // calAreaShift.start();
        // calAtn.start();
        // setOutForIInn.start();
        // readClock.start();
        // exportAttendance.start();
    },
    start: true,
    timeZone: ''
});

/* onTick methods start */

var checkDays = function(backDays){
    readFromMySQL.stop();
    calProject.stop();
    addAttendance.stop();
    calArea.stop();
    calDashboard.stop();
    calAreaShift.stop();
    calAtn.stop();
    setOutForIInn.stop();
    readClock.stop();
    exportAttendance.stop();
    attendanceCronCtrl.newAttendance(function(status){
      console.log("Attendances new days entries done %s",status);
      backDays(true);
    });
}
/* onTick methods finished*/

var addDays = new CronJob({
    cronTime: '30 30 15 * * *',
    onTick:checkDays,
    onComplete: function() {
        console.log("onComplete addDays");
        readFromMySQL.start();
        calProject.start();
        addAttendance.start();
        calArea.start();
        calDashboard.start();
        calAreaShift.start();
        calAtn.start();
        setOutForIInn.start();
        readClock.start();
        exportAttendance.start();
    },
    start: true,
    timeZone: 'Asia/Kolkata'
});

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    console.log(err.stack);
});

app.listen(3001);

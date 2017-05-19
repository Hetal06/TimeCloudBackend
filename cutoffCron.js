var express  = require('express');
var app      = express()
, engine = require('ejs-locals')
, fs = require('fs');
var port     = process.env.PORT || 3000;
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

//mongoose.connect(configDB.url);
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
fs.readdirSync(models_path).forEach(function (file) {
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
var mysqlCtrl = require('./app/controllers/mysql');
var mysql2Ctrl = require('./app/controllers/mysql2');
var http = require('http');
var async    =    require('async')
, Moment = require('moment-timezone');

// var weeklyOtFlag = new CronJob('50 * * * * *', function(){
var weeklyOtFlag = new CronJob('*/2 * * * *', function(){
    request('/weeklyOtFlag',cronCtrl.calculateWeeklyOtRecal); //calculate weeklyot for flag changed
}, null, true, "");

var date = Moment().set('month', 6).set('date', 15).format('YYYY-MM-DD'); 

var fetchNextYearHolidays = new CronJob(new Date(date), function(){
    request('/fetchNextYearHolidays',cronCtrl.fetchNextYearHolidays); // create holidays for next year
}, null, true, "");

var fetchNextYearHolidayscron = new CronJob('00 30 11 * * 0-6', function(){
    request('/fetchNextYearHolidayscron',cronCtrl.fetchNextYearHolidaysCron); // create holidays for next year
}, null, true, "");

var weeklyOt = new CronJob('10 */2 * * * *', function(){
// new CronJob('05 * * * * *', function(){
    request('/weeklyOt',cronCtrl.calculateWeeklyOt); // calculate weekly ot
}, null, true, "");

var shiftCutoffCal = new CronJob('30 */2 * * * *', function(){
// new CronJob('05 00 * * * *', function(){
    request('/shiftCutoffCal',cronCtrl.shiftCutoffCal); // calculate shift cutoff
}, null, true, "");

var totalTrackingWithAsync = new CronJob('00 */10 * * * *', function(){
    request('/totalTrackingWithAsync',areaCtrl.totalTrackingWithAsync); // change total with attendance and change flag    
}, null, true, "");

var totalTrackingCron = new CronJob('09 */10 * * * *', function(){
    request('/totalTrackingCron',areaCtrl.totalTrackingCron); // change total with attendance and change flag    
}, null, true, "");

var totalRoundedTracking = new CronJob('12 */10 * * * *', function(){    
    /*It executes when there is checkin in attedance and totalRounded is 00:00 */
    request('/totalRoundedTracking',areaCtrl.totalRoundedTracking);
}, null, true, "");

var checkweeklyTotal = new CronJob('18 */10 * * * *', function(){
    request('/checkweeklyTotal',areaCtrl.checkweeklyTotal); // calculate total of week and change flag for weeklyot collections
}, null, true, "");





var checkShift = function(backDays){
    weeklyOtFlag.stop();
    weeklyOt.stop();
    shiftCutoffCal.stop();
  
    shiftCtrl.setAdvanceShiftFlag(function(status){
      console.log("shift flag setting done %s",status);
      backDays(true);
    });
    // request('/calculateProject', cronCtrl.calculateProject);
}

var jobNew = new CronJob({
    //0 */45 
    cronTime: '00 */25 * * * *',
    onTick:checkShift,
    onComplete: function() {
        console.log("onComplete");
        weeklyOtFlag.start();
        weeklyOt.start();
        shiftCutoffCal.start();
    },
    start: true,
    timeZone: 'Asia/Kolkata'
});

// var checkDays = function(backDays){
//     // job1.stop();
//     // job2.stop();
//     // job3.stop();
//     // job4.stop();
    
//     shiftCtrl.setShiftFlag(function(status){
//       console.log("shift flag %s",status);
//       backDays(true);
//     });
//     // request('/calculateProject', cronCtrl.calculateProject);
  
// }

// var job = new CronJob({
//     //0 */45 
//     cronTime: '01 * * * * *',
//     onTick:checkDays,
//     onComplete: function() {
//         console.log("onComplete");
//         // job1.start();
//         // job2.start();
//         // job3.start();
//         // job4.start();
//     },
//     start: true,
//     timeZone: ''
// });
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    console.log(err.stack);
});

app.listen(4002);
//email - madbutcher.northcote@xtra.co.nz
//emp no- 73
// date -25,26
//period -21-10-2015 , 27-10-2015


var mysql      = require('mysql');
var nodeunit   = require('nodeunit');
var express  = require('express');
var app      = express(), 
	engine = require('ejs-locals'), 
	fs = require('fs'),
 	cmd = require('node-cmd');
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash'),
	helpers = require('view-helpers'),
	Moment = require('moment-timezone');
var configDB = require('./config/config');
var express      = require('express')
var cookieParser = require('cookie-parser')
 var session = require('express-session');
 var express = require('express')
var app = express()
// app.use(cookieParser("scretkey"))// var wamp = require('./wamp');
// var apiRoute = express();
var jwtauth = require('./jwtauth.js');
// var router = express.Router();

// router.use(jwtauth, require('./jwtauth'));
// app.use(session({secret: 'keyboard cat'}))
// var enforce = require('express-sslify');


// var hskey = fs.readFileSync('hacksparrow-key.pem');
// var hscert = fs.readFileSync('hacksparrow-cert.pem')


// var options = {
//     key: hskey,
//     cert: hscert
// };

//var env = require('node-env-file');
var https = require('https');
var http = require('http');
var SessionStore = require("session-mongoose")(express);
var path = require('path');

cmd.run('crossbar start');

cmd.get(
 'crossbar status',
 function(data){
   // console.log(data);
     console.log('Crossbar started:',data)
 }
);

global.appRoot = path.resolve(__dirname);
require('./config/passport')(passport); // pass passport for configuration

mongoose.connect(configDB.url, {server: {auto_reconnect: true,  poolSize: 10 }}, function(err) {
    console.log("db connection");
    if (err) {
      console.log('errr');
      console.log(err);
    } else {
        console.log("db connected");
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


//mongoose.connect(configDB.url)
var store = new SessionStore({
		sweeper: false,
		connection: mongoose.connection // <== custom connection
});


var enableCORS = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

				// intercept OPTIONS method
		if ('OPTIONS' == req.method) {
				res.send(200);
		} else {
				next();
		};
	};
	




app.configure(function() {
		// set up our express application
		app.use(express.logger('dev')); // log every request to the console
		app.use(express.cookieParser()); // read cookies (needed for auth)
		
		app.use(express.json({limit: '100mb'}));
		app.use(express.urlencoded({limit: '100mb'}));		
		// app.use(express.urlencoded());
		// app.use(express.json());
		// app.use(enforce.HTTPS());
		app.engine('ejs', engine);
		app.set('views', __dirname + '/app/views');
		app.set('view engine', 'ejs'); // set up ejs for templating

		app.use(express.session({
			secret: 'ilovescotchscotchyscotchscotch',
			store: store      
		}));
		app.use(passport.initialize());
		app.use(passport.session()); // persistent login sessions
		app.use(flash()); // use connect-flash for flash messages stored in session
		
		app.use(express.static(__dirname + '/public'));

		// app.use("/public", express.static(__dirname + "/public"));
		// app.use("/videos", express.static('/home/js9/Downloads'));
		
		// app.use(express.static('/var/www/html/Timecloud/phase1/timecloudOld/public'));

		app.use(enableCORS);
});
// console.log('Limit file size: '+limit);
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
		if (~file.indexOf('.js')) require(models_path + '/' + file)
})
app.use(helpers('application-name'))
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================

var startDate1 = Moment.utc().subtract('days', 30).format();                                         
var endDate1 = Moment.utc().add('days', 30).format(); 
var max = 5;
process.on('uncaughtException', function(err) {
		//console.log('Caught exception: ' + err);
		//console.log(err.stack);
});


// var SuperAdmin = mongoose.model('SuperAdmin')
//     superAdmin = new SuperAdmin();
// var i =superAdmin.generateHash('bhumi1');
// console.log(i);
/*



superAdmin.email = 'barnie@tme.co.nz';
superAdmin.password = i;
superAdmin.save();

console.log(i);
*/
/*var now  = "26/02/2014 10:31:30";
var then = "25/02/2014 10:31:10";*/
var then  = "2014-08-31 12:31:30";
var now = "2014-09-01 05:31:10";

var Inadjusted = new Date(Date.parse(then)).toUTCString(); 
var outadjusted = new Date(Date.parse(now)).toUTCString(); 
var i  = Moment(Inadjusted).format('DD/MM/YYYY HH:mm');
var o = Moment(outadjusted).format('DD/MM/YYYY HH:mm');

var ms = Moment(o,"DD/MM/YYYY HH:mm").diff(Moment(i,"DD/MM/YYYY HH:mm"));
var d = Moment.duration(ms);
console.log(d);
var totalhours = Math.floor(d.asHours()) + Moment.utc(ms).format(":mm:ss");
console.log(totalhours);
/*var ms = Moment(now,"DD/MM/YYYY HH:mm:ss").diff(Moment(then,"DD/MM/YYYY HH:mm:ss"));
var d = Moment.duration(ms);
var s = Math.floor(d.asHours()) + Moment.utc(ms).format(":mm:ss");
console.log(s +'sdas');*/
// var Attendance = mongoose.model('Attendance');
// var start = "2014-09-22";
// var end  = "2014-09-29";
// var employeeNo = '9';
/*Attendance.aggregate({$group :{'employeeNo':employeeNo, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }}, totalPrice: { $sum: '$employeeNo' }},function(err, attendanceData){
		 if(attendanceData){
				console.log(attendanceData);
		 }else{
				console.log(err);
		 }
});*/

/*Attendance.aggregate(  
		{ $project : {employeeNo : 1}},
		{ $match: {'employeeNo':employeeNo, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }} },
		{ $group: { _id:{employeeNo: '$employeeNo'}, totalPrice: { $sum: 'employeeNo' }}}, // 'group' goes first!
		
		function(err, data) {
				if(err){
						console.log(err);
				}
				console.log(data);
		}
);*/

// var http = express.createServer();

// set up a route to redirect http to https
// http.get('*',function(req,res){  
//     res.redirect('https://' + req.get('Host') + req.url)
// })

// // have it listen on 8080
// http.createServer({
// },app).listen(8080);


// https.createServer({
//   key: fs.readFileSync('ssl/server.key'),
//   cert: fs.readFileSync('ssl/server.crt')
// }, app).listen(port);


app.use('/',jwtauth.tokenCtrl);

console.log("port start ",port);
app.listen(port);
// app.timeout = 30000;
 /*var startTime = new Date();
console.log(startTime + "+0000");*/


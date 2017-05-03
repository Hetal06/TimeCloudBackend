// var mysql      = require('mysql');
// var configDB = require('../../config/config');
// var con2 = configDB.conn_conf2;
// var client;
// var statues = {};

// function handleDisconnect() {
// 	client = mysql.createConnection(con2);
// 	client.connect(function(err) {
//     if(err) {
//     	console.log("Could not connect to DB" +err);   
//     	client.end(); 		
//     }
//     else{
//       console.log("Connected to "+con2.database+' on '+con2.host );
//     }
// 	});

// 	client.on('error', function(err) {
// 	    console.log('db error', err);
// 	    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
// 	      handleDisconnect();                         // lost due to either server restart, or a
// 	    }
// 	    else if(err.fatal){
// 	      console.log('fatal error: ' + err.message);
// 	      handleDisconnect();      
// 	    }
// 	    else {                                      // connnection idle timeout (the wait_timeout
// 	      throw err;                                  // server variable configures this)
// 	    }
// 	 });
// }
// handleDisconnect();

// var mongoose = require('mongoose')
//   , Attendance = mongoose.model('Attendance')
//   , Company = mongoose.model('Company')
//   , Employee = mongoose.model('Employee')
//   , AttendanceMysql =  mongoose.model('AttendanceMysql')
//   , Moment = require('moment-timezone')
//   , Cron2 = mongoose.model('Cron2')
//   , WeeklyOT = mongoose.model('WeeklyOT')
//   , MongooseCron = mongoose.model('mongooseCron')  
//   , empFn = require('../../functions/employeefn.js')
// // "mysqlLastId" : 894997,
// // "mysqlLastId" : 859139,


// // 
// exports.readmysqlData = function(req, res){
// 	/* This will read checkin data from mysql table and write into our mongodb table(mongoMysql)*/
// 	Cron2.findOne({}, {}, { sort: { 'mysql2LastId' : -1 } }, function(err, doc) { 
// 		if(doc){
// 			var maxId = doc.mysql2LastId;
// 		}else{
// 			var maxId = 0;
// 		}
// 		console.log(maxId +'maxId2');
// 		var startDate1 = Moment.utc().subtract('days', 30).format();                                         
// 		var endDate1 = Moment.utc().add('days', 30).format();
// 		mysqlPool2.getConnection(function(err, connection) {
// 			if(err){
// 				console.log('mysql2'+err);
// 			}else{
// 				client.query("select * from checkinout where id >"+maxId+" AND checkTime between '"+startDate1+"' AND '"+endDate1+"'  ORDER BY id limit 50",function(err, attendance) {
// 					if(!err) {
//     				console.log(attendance.length);
// 					if(attendance.length>0){
// 						global.recordid1 = 0;
// 						attendance.forEach(function(data){
// 							recordid1 = data.id;
// 							var employeeNo = data.userid;
// 							var SN = data.SN;
// 							var time = data.checktime + "+0000";
// 							var checkTime = Moment.utc(time).set('second', 00).format();
// 							var checkType = data.checktype;
// 							var verifyCode = data.verifyCode;
// 							var sensorId = data.sensorId;
// 							var workCode = data.WorkCode;
// 							var Reserved = data.Reserved;
// 							var attendanceMysql = new AttendanceMysql();
// 							attendanceMysql.employeeNo = employeeNo - 1;
// 							attendanceMysql.SN = SN;
// 							attendanceMysql.checkTime = checkTime;
// 							attendanceMysql.checkType = checkType;
// 							attendanceMysql.verifyCode = verifyCode;
// 							attendanceMysql.sensorId = sensorId;
// 							attendanceMysql.workCode = workCode;
// 							attendanceMysql.Reserved = Reserved;
// 							//attendanceMysql.readFlag = false;
// 							attendanceMysql.save(function (err) {
// 								if (err) {
// 									console.log(err);
// 								}else{
// 									cron = new Cron2();
// 				        	cron.mysql2LastId = recordid1;
// 				        	cron.save();
// 				        	console.log('1) Read and Write from IP successfully done to AttendanceMysqlData');
// 					  }
// 					  // saved!
// 					});		 			
// 				});
								
// 	        }else{
// 	        	console.log("else ....................");
// 	        	console.log(err);
// 	        	console.log('mysql'+err);
// 	        	if(err){	
// 	        		handleDisconnect();   
// 	        	}
// 	        }
// 	      } else {
// 	      	console.log("else with error....................");
// 	        	console.log(err);
// 	      }
//         }); //connection query
// 	   /*}
// 	});//mysql pool*/
// 	});
// }
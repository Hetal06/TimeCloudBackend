// var mysql      = require('mysql');
// var configDB = require('../../config/config');
// var con3 = configDB.conn_conf3;
// //var mysqlPool3 = mysql.createPool(con3);
// var client;

// var statues = {};

// function handleDisconnect() {
// 	client = mysql.createConnection(con3);
// 	client.connect(function(err) {
// 	    if(err) {
// 	    	console.log("Could not connect to DB" +err);   
// 	    	client.end(); 		
// 	    }
// 	    else{
// 	        console.log("Connected to "+con3.database+' on '+con3.host );
// 	    }
// 	});

// 	client.on('error', function(err) {
// 	    console.log('db error', err);
// 	    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
// 	      handleDisconnect();                         // lost due to either server restart, or a
// 	    }else if(err.fatal){
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
//   , Cron3 = mongoose.model('Cron3')
//   , WeeklyOT = mongoose.model('WeeklyOT')
//   , MongooseCron = mongoose.model('mongooseCron')  
//   , empFn = require('../../functions/employeefn.js')

// exports.readmysqlData = function(req, res){
// /* This will read checkin data from mysql table and write into our mongodb table(mongoMysql)*/
		

//     	Cron3.findOne({}, {}, { sort: { 'mysql3LastId' : -1 } }, function(err, doc) { 
//      	if(doc){
//     		var maxId2 = doc.mysql3LastId;
//     	}else{
//     		var maxId2 = 0;
//     	}
//     	console.log(maxId2 +'maxId3');
//     	var startDate1 = Moment.utc().subtract('days', 30).format();                                         
// 		var endDate1 = Moment.utc().add('days', 30).format(); 
// 		/*mysqlPool3.getConnection(function(err, connection) {
// 			if(err){
// 				console.log('mysql3'+err);

// 			}else{*/
// 				client.query("select * from checkinout where id >"+maxId2+" AND checkTime between '"+startDate1+"' AND '"+endDate1+"'  ORDER BY id limit 50",function(err, attendance) {
// 	       		if(attendance){
// 	       		global.recordid2 = 0 ;
// 	       		attendance.forEach(function(data){
// 	       			recordid2 = data.id;		       			
// 		 			var employeeNo = data.userid;
// 		 			var SN = data.SN;
// 		 			var time = data.checktime + "+0000";
// 		 			var checkTime = Moment.utc(time).set('second', 00).format();
// 		 			var checkType = data.checktype;
// 		 			var verifyCode = data.verifyCode;
// 		 			var sensorId = data.sensorId;
// 		 			var workCode = data.WorkCode;
// 		 			var Reserved = data.Reserved;		 			
		 			
// 		 			var attendanceMysql = new AttendanceMysql();
// 		 			attendanceMysql.employeeNo = employeeNo - 1;
// 		 			attendanceMysql.SN = SN;
// 		 			attendanceMysql.checkTime = checkTime;
// 		 			attendanceMysql.checkType = checkType;
// 		 			attendanceMysql.verifyCode = verifyCode;
// 		 			attendanceMysql.sensorId = sensorId;
// 		 			attendanceMysql.workCode = workCode;
// 		 			attendanceMysql.Reserved = Reserved;
// 		 			//attendanceMysql.readFlag = false;		 			
// 		 			attendanceMysql.save(function (err) {
// 					  if (err) {
// 					  	console.log(err);
// 					  }else{
// 					  	cron = new Cron3();
// 		        		cron.mysql3LastId = recordid2;
// 		        		cron.save();
// 		        		console.log('1) Read and Write from IP successfully done to AttendanceMysqlData');
// 					  }
// 					  // saved!
// 					});		 			
// 				});		
// 	        }else{
// 	        	console.log('mysql'+err);
// 	        	if(err){		
// 	        		handleDisconnect();   
// 	        	}
// 	        }
	        
//         	}); //connection query
// 		/*}
    		
// 		});//mysql pool*/
// 	});
// }
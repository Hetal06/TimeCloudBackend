var request = require('request');
console.log("aaaa");

var email="barnie@tme.co.nz";
var password="timeplo1";
var session;
var path ="http://localhost:3000";
module.exports.employeeLogin = function (test) {
	//CASE-1 : if the email does'nt exist....
	var email1 = "Sharon.L@noshfoodmarket.com";
	var password1 = "xyzz";
	// //CASE-2 if the the admin user....	
	request.post(path+"/login",{json:true, body:{email:email1,pwd:password}},  function (err, resp, body) {
		test.equal(err, null);
		session=JSON.stringify(body);
		// console.log(body)
		test.equal(body.adminType, "mainAdmin");
		test.equal(resp.statusCode, 200);
		test.done();
	});	
};

module.exports.addinout = function (test) {
	// console.log(session);
	var checkin = { checkInTime: '08:00:00',checkOutime: '09:00:00',checkinDate: '2016-01-16T00:00:00.000Z',employeeNo: '7',attendanceId: '5694cbeaa1241dd94413c6e6',start: '2016-01-11',end: '2016-01-17' };
	request.post(path+"/addinouttime",{json:true, body:checkin,headers:{'Content-Type': 'application/json','Authorization' : session }}, function (err, resp, body) {
		// console.log(body);		
		test.equal(err, null);
		test.equal(body, true);
		test.done();
		// test.equal(resp.statusCode, 200);
	});
}

module.exports.changeShift = function (test) {
	var shiftData = { shiftType: '',shift: '4am - 3pm',id: '5694cbeaa1241dd94413c6e6',atnDate: '2016-01-16',employeeNo: '7' };
	request.post(path+"/changeshift",{json:true, body:shiftData,headers:{'Content-Type': 'application/json','Authorization' : session }}, function (err, resp, body) {
		test.equal(err, null);
		test.equal(body, true);
		test.done();
	});
}

module.exports.managerSigned = function (test) {
	var atnId ="5694cbeaa1241dd94413c6e6";
	request.get(path+"/managerSigned/"+atnId,{json:true,headers:{'Content-Type': 'application/json','Authorization' : session }}, function (err, resp, body) {
		// console.log(body);
		test.equal(err, null);
		test.equal(body, true);
		test.done();
	});
}

module.exports.managerSignedAll = function (test) {
	var atnIds = { checkAll: 'true',attendanceIds: [ '5694cbeaa1241dd94413c6e1','5694cbeaa1241dd94413c6e2','5694cbeaa1241dd94413c6e3','5694cbeaa1241dd94413c6e4','5694cbeaa1241dd94413c6e5','5694cbeaa1241dd94413c6e6','5694cbeaa1241dd94413c6e7' ] };
	request.post(path+"/managerSignedAll",{json:true,body:atnIds,headers:{'Content-Type': 'application/json','Authorization':session}},function (err, resp, body) {
		// console.log(body);
		test.equal(err, null);
		test.equal(body, true);
		test.done();
	});
}

// module.exports.changeCheckinType = function (test) {
// 	request.get(path+"/changeCheckinType/"+'5694cbeaa1241dd94413c6e6'+"/"+'569a013c2ccab9472786230e',{json:true,headers:{'Content-Type': 'application/json','Authorization':session}},function (err, resp, body) {
// 		// console.log(body);
// 		test.equal(err, null);
// 		test.equal(body, true);
// 		test.done();
// 	});
// }

// module.exports.deleteCheckins = function (test) {
// 	request.get(path+"/deleteCheckins/"+'5694cbeaa1241dd94413c6e6'+"/"+'569a013c2ccab9472786230e',{json:true,headers:{'Content-Type': 'application/json','Authorization':session}},function (err, resp, body) {
// 		// console.log(body);
// 		test.equal(err, null);
// 		test.equal(body, true);
// 		test.done();
// 	});
// }


// module.exports.attendancetimeedit = function (test) {
// 	// console.log(session);
// 	var checkin = { checkTime: '10:00:00',checkType: 'O',checkinDate: '2016-01-16T00:00:00.000Z',employeeNo: '7',attendanceId: '5694cbeaa1241dd94413c6e6',objectId: '569a2dd8317d1dea366fbd7e',start: '2016-01-11',end: '2016-01-17',shiftType: '' };
// 	request.post(path+"/attendancetimeedit",{json:true, body:checkin,headers:{'Content-Type': 'application/json','Authorization' : session }}, function (err, resp, body) {
// 		// console.log(body);		
// 		test.equal(err, null);
// 		test.equal(body, true);
// 		test.done();
// 		// test.equal(resp.statusCode, 200);
// 	});
// }
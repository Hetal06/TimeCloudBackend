var mongoose = require('mongoose'), 
    Attendance = mongoose.model('Attendance'), 
    Company = mongoose.model('Company'), 
    Rule = mongoose.model('Rule'), 
    Employee = mongoose.model('Employee'), 
    AttendanceMysql =  mongoose.model('AttendanceMysql'), 
    Dashboard = mongoose.model('Dashboard'), 
    Moment = require('moment-timezone'), 
    Cron = mongoose.model('Cron'), 
    Attendancecron = mongoose.model('Attendancecron'), 
    empFn = require('../../functions/employeefn.js'), 
    emailfn =  require('../../functions/send_mail.js'),
    async    =    require('async');

/* 
 * Calculate Atn
*/
exports.calculateAttendance = function(req, res){
	/* this will calculate the checkins as per the settings of the company */  
	console.log("calculateAttendance....");	
	Company.find({}, function(err, CompanyData){
		var newCnt = 0;
        async.eachSeries(CompanyData, function(dataCompany, callbackComp) {
			if(dataCompany){
				newCnt++;
				var companyId = dataCompany._id;				
				empFn.getHolidays(companyId, function(holidayresult){
					var currentDate = Moment.utc().format('YYYY-MM-DD');
					var previousDate = Moment.utc().subtract('days',30).format('YYYY-MM-DD');
					Attendance.find({'companyId':companyId,"date":{$gte:previousDate,$lte:currentDate},'readFlag':false,$or: [{'checkin.checkType': { $exists: true}  }, { 'holiday':  true}]}).sort({'_id':'asc'}).exec(function(err, data){
						// console.log("data length" +data.length);
                        if(data.length>0){ 
                            console.log("------\n\n line 33 data.length",data.length);
							var adminDetails = {email:dataCompany.email,userType:"mainAdmin"};
							var newAtn =0;
                            async.eachSeries(data, function(employeeAttendance, callbackAtn) {
                            // data.forEach(function(employeeAttendance){
                                newAtn++;
							    empFn.calculateAtn(adminDetails,holidayresult,dataCompany,employeeAttendance,function(result){
                                    console.log("result atn ..."+result);
                                });								
							    if(data.length === newAtn){
                                    if(newCnt === CompanyData.length){
                                        console.log('5) calculation done for attendance checkins');
                                    }else{
                                        callbackComp();
                                    }
                                }else{
                                    callbackAtn();
                                }    
                            });
						}else{
                            if(newCnt === CompanyData.length){
                                console.log('5) calculation done for attendance checkins');
                            }else{
                                callbackComp();
                            }
                        }
					}); // attendance find
				}); //holiday fn     
			}
		});  
	});
}

/* This will create a new attendance of all companies employees everyday*/  
exports.newAttendance = function(callbackAtn) {
    console.log("*********** new days *************");
    var compnayCount = 0;
    // console.log(text);

    Company.find({}, function(err, CompanyData) {
        async.eachSeries(CompanyData, function(dataCompany, callbackComp) {
            if (dataCompany) {
                compnayCount++;
                var companyName = dataCompany.companyname;
                var companyId = dataCompany._id;
                var daysLimit = parseInt(dataCompany.daysLimit);
                console.log("limit :====>"+daysLimit);
                if (!daysLimit) {
                    daysLimit = 60;
                }
                var employeeCount = 0;

                console.log("================ COMPANY %d / %d ===================", compnayCount, CompanyData.length);
                console.log("company : %s %s", companyName, companyId);

                if(compnayCount === CompanyData.length){
                    console.log("********Day creation success ************");
                    console.log("================ COMPANY %d / %d======================",compnayCount,CompanyData.length);
                    console.log('6) Attendances new days entries done line 90'); 
                    callbackAtn(true);   
                }

                Employee.find({
                    'companyId': companyId,
                    'active': true
                }, function(err, employeeData) {
                    console.log("-------\n line 98 employeeData",employeeData);
                    if (employeeData.length > 0) {
                        async.eachSeries(employeeData, function(dataEmp, callbackEmp) {
                            employeeCount++;
                            var employeeNo = dataEmp.employeeNo;
                            var shift = dataEmp.shift;
                            var firstName = dataEmp.firstName;
                            var lastName = dataEmp.lastName;
                            console.log("Employee -------------->line 105 ");
                            console.log("employee : %s %s %s", firstName, lastName, employeeNo);

                            async.waterfall([function(next) {
                                console.log("async");
                                console.log("1. shift %s",shift);
                                if (shift == "All") {
                                    if (employeeCount == employeeData.length) {
                                        console.log("... again company(1)");
                                        callbackComp();
                                    } else {
                                        console.log("... again employee(1)");
                                        callbackEmp();
                                    }
                                } else {
                                    empFn.getShiftPatternData(shift, companyId, function(result) {
                                        console.log("->getShiftPatternData");
                                        if (result === false) {
                                            console.log(result);
                                            if (employeeCount == employeeData.length) {
                                                console.log("... again company(1)");
                                                callbackComp();
                                            } else {
                                                console.log("... again employee(1)");
                                                callbackEmp();
                                            }
                                        } else {
                                            var daysArray = [];
                                            var OnlyDays = [];
                                            var noOfDays = result.noOfDays;
                                            var firstDateofRule = Moment.utc(result.ruleStartDate).format('YYYY-MM-DD');
                                            result.days.forEach(function(daysData) {
                                                var day = daysData.day;
                                                var shift = daysData.shift;
                                                daysArray.push({
                                                    shift: shift,
                                                    day: day
                                                });
                                                OnlyDays.push(day);
                                            });
                                            next(null, 1, daysArray, OnlyDays, noOfDays, firstDateofRule);
                                        }
                                    });
                                }
                            }, function(status, daysArray, OnlyDays, noOfDays, firstDateofRule, next) {
                                if (status == 1) {
                                    console.log("2. Last Attendance Search");
                                    Attendance.find({
                                        'employeeNo': employeeNo,
                                        'companyId': companyId
                                    }).sort({
                                        'date': -1
                                    }).limit(1).find(function(err, doc) {
                                        var shiftAssign = '',
                                            resultIndex = '',
                                            splitValue = '';
        
                                        if (doc.length > 0) {
                                            console.log("last day found...");
                                            doc.forEach(function(docData) {
                                                console.log("in docs");
                                                var lastDate = docData.date;
                                                console.log("in docs lastDate "+lastDate);
                                                var nextDate = Moment.utc(lastDate).add('days', 1).format('YYYY-MM-DD');
                                                console.log("in docs nextDate "+nextDate);
                                                var week = empFn.countWeekdayOccurrencesInMonth(nextDate);
                                                // console.log("in docs week "+week);
                                                var dayOfDate = Moment(nextDate).day();
                                                // console.log("in docs dayOfDate "+dayOfDate);
                                                var startValue = ((week - 1) * 7);
                                                // console.log("in docs dayOfDate "+startValue);
                                                var dayString = empFn.weekDayString(dayOfDate);
                                                // console.log("in docs dayString "+dayString);
                                                var endsHere = Moment.utc().add('days', daysLimit + 7);
                                                // console.log("in docs endsHere "+endsHere);
                                                var myLimit = daysLimit + 7;
                                                var myCurrent = Moment.utc().format('YYYY-MM-DD');
                                                var dtStart = Moment(lastDate).format('YYYY-MM-DD');
                                                // console.log("in docs dtStart "+dtStart);
                                                var dtEnd = Moment(endsHere).format('YYYY-MM-DD');

                                                // console.log("in docs dtEnd "+dtEnd);
                                                console.log('Start: %s End: %s', dtStart, dtEnd);
                                                //console.log(Moment.utc(dtStart).format('YYYY-MM-DD'),Moment.utc(dtEnd).format('YYYY-MM-DD'));
                                                if (Moment.utc(dtStart).format('YYYY-MM-DD') >= Moment.utc(dtEnd).format('YYYY-MM-DD')) {

                                                    Attendance.find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: new Date(myCurrent), $lt: new Date(dtEnd) }},function(err, attendanceData){
                                                        console.log("myLength",attendanceData.length);
                                                        if(attendanceData.length === myLimit){

                                                            if (employeeCount == employeeData.length) {
                                                                console.log("Days already created for company : %s %s", companyName, companyId);
                                                                console.log("================ COMPANY %d / %d======================", compnayCount, CompanyData.length);
                                                                callbackComp();

                                                            } else {
                                                                console.log("Days already created for employee : %s %s %s Of %s", firstName, lastName, employeeNo,companyName);
                                                                console.log("<-------------- Employee ");
                                                                callbackEmp();
                                                            }

                                                        }else{
                                                            console.log("Need to add in between days...");
                                                            next(null, myCurrent, endsHere,firstDateofRule,daysArray, OnlyDays);
                                                        }    
                                                    });  
                                                }else{
                                                    console.log("Need to add days...");
                                                    next(null, nextDate, endsHere,firstDateofRule,daysArray, OnlyDays);
                                                }      
                                            });
                                        } else {
                                            console.log("last day empty!!!");
                                            console.log("init with 60 day...");
                                            var startEmp = Moment.utc().subtract('days', 30);
                                            var endEmp = Moment.utc().add('days', 30);
                                            next(null, startEmp, endEmp,firstDateofRule,daysArray, OnlyDays);
                                        }
                                    });
                                }
                            }], function(err, dateNext, endsHere,firstDateofRule,daysArray, OnlyDays) {
                                empFn.getHolidays(companyId, function(holidayresult) {
                                   console.log("3. createDays");
                                   var i = 0;
                                   empFn.createDays(dateNext, endsHere , dataCompany, dataEmp, i,holidayresult,firstDateofRule,daysArray, OnlyDays, function(data) {
                                        if(data==1) {
                                            if (employeeCount == employeeData.length) {
                                                 console.log("Done company %d : %s",compnayCount,companyName);
                                                 callbackComp();
                                             } else {
                                                 console.log("... again employee(3)");
                                                 callbackEmp();
                                             }

                                          
                                        }
                                    });
                                }); //empFn holidays
                            });
                        });//each Employee
                    } else {
                        console.log("no employee found");
                        if (employeeCount == employeeData.length) {
                            console.log("... again company(2)");
                            callbackComp();
                        }
                    }
                });//Employee
            } else {
                console.log("company "+err);
            }
        });//Company
    });
};

/* 
 * API : /newatforcompany/:companyId/:date
 * Create days by running scripts 
 *
 */
exports.newatforcompany = function(req, res){
    var companyId = req.params.companyId;
    var dateGiven = req.params.date;
    // console.log(dateGiven);

    // Check company type
    empFn.checkCompanyRange(companyId, 'track', function(state) {
        // console.log(state);
        if (!state)
            res.send("Invalid company");
        else if(!Moment(dateGiven,"YYYY-MM-DD",true).isValid())
            res.send("Invalid date format... please specify date in YYYY-MM-DD");
        else {
            console.log("else");
            var compnayCount = 0;
            Company.find({'_id':companyId}, function(err, CompanyData) {
                async.eachSeries(CompanyData, function(dataCompany, callbackComp) {
                    if (dataCompany) {
                        console.log(dataCompany);

                        compnayCount++;
                        var companyName = dataCompany.companyname;
                        var companyId = dataCompany._id;
                        var employeeCount = 0;
                        
                        console.log(companyName);
                        console.log(companyId);

                        console.log("================ COMPANY %d / %d ===================", compnayCount, CompanyData.length);
                        console.log("company : %s %s", companyName, companyId);

                        Employee.find({
                            'companyId': companyId,
                            'active': true
                        }, function(err, employeeData) {
                            if (employeeData.length > 0) {
                                async.eachSeries(employeeData, function(dataEmp, callbackEmp) {
                                    employeeCount++;
                                    var employeeNo = dataEmp.employeeNo;
                                    var shift = dataEmp.shift;
                                    var firstName = dataEmp.firstName;
                                    var lastName = dataEmp.lastName;
                                    console.log("Employee --------------> ");
                                    console.log("employee : %s %s %s", firstName, lastName, employeeNo);

                                    async.waterfall([function(next) {
                                        console.log("async");
                                        console.log("1. shift %s",shift);
                                        if (shift == "All") {
                                            if (employeeCount == employeeData.length) {
                                                console.log("... again company(1)");
                                                // callbackComp();
                                                res.send(true);
                                            } else {
                                                console.log("... again employee(1)");
                                                callbackEmp();
                                            }
                                        } else {
                                            empFn.getShiftPatternData(shift, companyId, function(result) {
                                                console.log("->getShiftPatternData");
                                                if (result === false) {
                                                    console.log(result);
                                                    if (employeeCount == employeeData.length) {
                                                        console.log("... again company(1)");
                                                        // callbackComp();
                                                        res.send(true);
                                                    } else {
                                                        console.log("... again employee(1)");
                                                        callbackEmp();
                                                    }
                                                } else {
                                                    var daysArray = [];
                                                    var OnlyDays = [];
                                                    var noOfDays = result.noOfDays;
                                                    var firstDateofRule = Moment.utc(result.ruleStartDate).format('YYYY-MM-DD');
                                                    result.days.forEach(function(daysData) {
                                                        var day = daysData.day;
                                                        var shift = daysData.shift;
                                                        daysArray.push({
                                                            shift: shift,
                                                            day: day
                                                        });
                                                        OnlyDays.push(day);
                                                    });
                                                    next(null, 1, daysArray, OnlyDays, noOfDays, firstDateofRule);
                                                }
                                            });
                                        }
                                    }, function(status, daysArray, OnlyDays, noOfDays, firstDateofRule, next) {
                                        if (status == 1) {
                                            console.log("2. Last Attendance Search");
                                            Attendance.find({
                                                'employeeNo': employeeNo,
                                                'companyId': companyId
                                            }).sort({
                                                'date': -1
                                            }).limit(1).find(function(err, doc) {
                                                var shiftAssign = '',
                                                    resultIndex = '',
                                                    splitValue = '';
                
                                                if (doc.length > 0) {
                                                    console.log("last day found...");
                                                    doc.forEach(function(docData) {
                                                        console.log("in docs");
                                                        var lastDate = docData.date;
                                                        console.log("in docs lastDate "+lastDate);
                                                        var nextDate = Moment.utc(lastDate).add('days', 1).format('YYYY-MM-DD');
                                                        console.log("in docs nextDate "+nextDate);
                                                        var week = empFn.countWeekdayOccurrencesInMonth(nextDate);
                                                        // console.log("in docs week "+week);
                                                        var dayOfDate = Moment(nextDate).day();
                                                        // console.log("in docs dayOfDate "+dayOfDate);
                                                        var startValue = ((week - 1) * 7);
                                                        // console.log("in docs dayOfDate "+startValue);
                                                        var dayString = empFn.weekDayString(dayOfDate);
                                                        // console.log("in docs dayString "+dayString);
                                                        var endsHere = Moment(dateGiven).format('YYYY-MM-DD');
                                                        // console.log("in docs endsHere "+endsHere);
                                                       
                                                        var myCurrent = Moment.utc().format('YYYY-MM-DD');
                                                        var dtStart = Moment(lastDate).format('YYYY-MM-DD');
                                                        // console.log("in docs dtStart "+dtStart);
                                                        var dtEnd = Moment(endsHere).format('YYYY-MM-DD');
                                                        // console.log("in docs dtEnd "+dtEnd);
                                                        
                                                        // Limit 
                                                        var myLimit = Moment(dtEnd).diff(Moment(myCurrent), 'days');

                                                        console.log('Start: %s End: %s', dtStart, dtEnd);
                                                        //console.log(Moment.utc(dtStart).format('YYYY-MM-DD'),Moment.utc(dtEnd).format('YYYY-MM-DD'));
                                                        if (Moment.utc(dtStart).format('YYYY-MM-DD') >= Moment.utc(dtEnd).format('YYYY-MM-DD')) {

                                                            Attendance.find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: new Date(myCurrent), $lt: new Date(dtEnd) }},function(err, attendanceData){
                                                                console.log("myLength",attendanceData.length);
                                                                console.log("myLimit",myLimit);
                                                                if(attendanceData.length === myLimit){
                                                                    if (employeeCount == employeeData.length) {
                                                                        console.log("Days already created for company : %s %s", companyName, companyId);
                                                                        console.log("================ COMPANY %d / %d======================", compnayCount, CompanyData.length);
                                                                        // callbackComp();
                                                                        res.send(true);

                                                                    } else {
                                                                        console.log("Days already created for employee : %s %s %s Of %s", firstName, lastName, employeeNo,companyName);
                                                                        console.log("<-------------- Employee ");
                                                                        callbackEmp();
                                                                    }

                                                                }else{
                                                                    console.log("Need to add in between days...");
                                                                    next(null, myCurrent, endsHere,firstDateofRule,daysArray, OnlyDays);
                                                                }    
                                                            });  

                                                        }else{
                                                            console.log("Need to add days...");
                                                            next(null, nextDate, endsHere,firstDateofRule,daysArray, OnlyDays);
                                                        }      
                                                    });
                                                } else {
                                                    console.log("last day empty!!!");
                                                    console.log("init with 60 day...");
                                                    var startEmp = Moment.utc().subtract('days', 30);
                                                    var endEmp = Moment.utc().add('days', 30);
                                                    next(null, startEmp, endEmp,firstDateofRule,daysArray, OnlyDays);
                                                }
                                            });
                                        }
                                    }], function(err, dateNext, endsHere,firstDateofRule,daysArray, OnlyDays) {
                                        empFn.getHolidays(companyId, function(holidayresult) {
                                           console.log("3. createDays");
                                           var i = 0;
                                           empFn.createDays(dateNext, endsHere , dataCompany, dataEmp, i,holidayresult,firstDateofRule,daysArray, OnlyDays, function(data) {
                                                if(data==1) {
                                                    if (employeeCount == employeeData.length) {
                                                         console.log("Done company %d : %s",compnayCount,companyName);
                                                         // callbackComp();
                                                        res.send(true); 
                                                     } else {
                                                         console.log("... again employee(3)");
                                                         callbackEmp();
                                                     }

                                                  
                                                }
                                            });
                                        }); //empFn holidays
                                    });
                                });//each Employee
                            } else {
                                console.log("no employee found");
                                if (employeeCount == employeeData.length) {
                                    console.log("... again company(2)");
                                    callbackComp();
                                    res.send(true); 
                                }
                            }
                        });//Employee
                    } else {
                        console.log("company "+err);
                    }
                });
            });
        }
    });        
    
    /* Old code : will be removed after successfully deployed */    

    // Company.findOne({'_id':companyId}, function(err, dataCompany){    
    //     if(dataCompany){ 
    //         var isHolidays = dataCompany.isHolidays;
    //         var companyName = dataCompany.companyname;
    //         Employee.find({'companyId':companyId, 'active':true},function(err, employeeData){
    //             var flagValue = 0;
    //             if(employeeData.length>0){               
    //                 employeeData.forEach(function(dataEmp){ 
    //                     flagValue++;
    //                     var employeeNo = dataEmp.employeeNo;
    //                     var shift = dataEmp.shift;
    //                     var department = dataEmp.department;
    //                     var firstName = dataEmp.firstName;
    //                     var lastName = dataEmp.lastName;
    //                     var email = dataEmp.email;
    //                     var payrollCode = dataEmp.payrollCode;
    //                     var datesArray = [];                 
    //                     Attendance.find({'employeeNo':employeeNo, 'companyId':companyId}).sort({ 'date' : -1 }).limit(1).find(function(err, doc) {
    //                         doc.forEach(function(docData){ 
    //                             var lastDate = docData.date;        
    //                             var nextDate1 = Moment.utc(lastDate).add('days', 1).format('YYYY-MM-DD');
    //                             var currentDate = Moment.utc(dateGiven).format('YYYY-MM-DD');
    //                             while(nextDate1 <= currentDate){
    //                                 datesArray.push(nextDate1);
    //                                 nextDate1 = Moment.utc(nextDate1).add('days', 1).format('YYYY-MM-DD');
    //                             }
    //                         });
    //                         datesArray.forEach(function(nextDate){
    //                             async.waterfall([
    //                                 function(next){
    //                                 //console.log(shift +' shiftPattern');
    //                                 empFn.getShiftPatternData(shift, companyId, function(result){
    //                                     if(result==false){
    //                                         console.log('-------------');
    //                                     }else{
    //                                         var daysArray = [];
    //                                         var OnlyDays = [];
    //                                         var noOfDays = result.noOfDays;
    //                                         var firstDateofRule = Moment.utc(result.ruleStartDate).format('YYYY-MM-DD');
    //                                         result.days.forEach(function(daysData){ 
    //                                             var day = daysData.day;
    //                                             var shift = daysData.shift;
    //                                              // daysArray.push(shift+':'+day);
    //                                              daysArray.push({shift:shift,day:day});
    //                                              OnlyDays.push(day);
    //                                             });                    
    //                                         next(null,daysArray,OnlyDays, noOfDays, firstDateofRule)
    //                                     }
    //                                 })
    //                             },
    //                             function(daysArray, OnlyDays, noOfDays,firstDateofRule,next){
    //                                 Attendance.find({'employeeNo':employeeNo, 'companyId':companyId}).sort({ 'date' : -1 }).limit(1).find(function(err, doc) {
    //                                     doc.forEach(function(docData){ 
    //                                         var lastDate = docData.date;               
    //                                         var week = empFn.countWeekdayOccurrencesInMonth(nextDate);
    //                                         var dayOfDate = Moment(nextDate).day();
    //                                         var dayString = empFn.weekDayString(dayOfDate);
    //                                         var shiftAssign = '';                        
    //                                         var startValue = ((week-1)*7);
    //                                         if(OnlyDays.indexOf('Day1')>-1){
    //                                             var startDate = firstDateofRule;
    //                                             var endDate = nextDate
    //                                             var n = 0;
    //                                             console.log(daysArray+'daysArray');
    //                                             while (startDate <= endDate) { 
    //                                                 if(startDate == endDate){
    //                                                     shiftAssign = daysArray[n].shift;
    //                                                 }                            
    //                                                 if(n == daysArray.length-1){
    //                                                     n = 0;
    //                                                 }else{
    //                                                     n++;
    //                                                 }                            
    //                                                 startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
    //                                             }
    //                                         }else{
    //                                             if(noOfDays > 7){

    //                                                 if(startValue>=noOfDays){
    //                                                     startValue = 0;
    //                                                 }                                
    //                                                 var resultIndex = OnlyDays.indexOf(dayString,startValue);                                
    //                                                 var splitValue = daysArray[resultIndex]; 

    //                                                 if(splitValue){
    //                                                     shiftAssign = splitValue.shift;
    //                                                 }                                                                                      
    //                                             }else{
    //                                                 var resultIndex = OnlyDays.indexOf(dayString); 
    //                                                 var splitValue = daysArray[resultIndex];                 
    //                                                 if(splitValue){
    //                                                     shiftAssign = splitValue.shift;
    //                                                 }
    //                                             }
    //                                         }                        
    //                                         empFn.getShiftData("",shiftAssign, companyId, function(result){                                              
    //                                             next(null,nextDate,result)
    //                                         })
    //                                     });
    //                                 });
    //                             }
    //                             ],function(err, dateNext, result){
    //                                 empFn.getHolidays(companyId, function(holidayresult){
    //                                     var shiftStartTime = result.startTime;
    //                                     var shiftFinishTime = result.finishTime;
    //                                     var date = dateNext;
    //                                     var holiday = '';
    //                                     if(isHolidays == 'true'){
    //                                         if(holidayresult.indexOf(date) > -1){ 
    //                                             holiday = true;
    //                                         }
    //                                     }
    //                                     var nextDate = Moment.utc(date).add('days',1).format();
    //                                     var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
    //                                     var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');                        
    //                                     var start = '';
    //                                     var finish = '';
    //                                     if(shiftStartDate == shiftFinishDate){ 
    //                                         var sHour = Moment.utc(shiftStartTime).format('HH');
    //                                         var sMinute = Moment.utc(shiftStartTime).format('mm');   
    //                                         var sdate = Moment.utc(date).format('YYYY-MM-DD');                              
    //                                         var Hourset = Moment.utc(sdate).set('hours', sHour); 
    //                                         start = Moment.utc(Hourset).set('minute', sMinute).format();

    //                                         var fHour = Moment.utc(shiftFinishTime).format('HH');
    //                                         var fMinute = Moment.utc(shiftFinishTime).format('mm');  
    //                                         var fdate = Moment.utc(date).format('YYYY-MM-DD');                             
    //                                         var fHourset = Moment.utc(fdate).set('hours', fHour); 
    //                                         finish = Moment.utc(fHourset).set('minute', fMinute).format();                        
    //                                     }else{
    //                                         var sHour = Moment.utc(shiftStartTime).format('HH');                                 
    //                                         var sMinute = Moment.utc(shiftStartTime).format('mm');                                       
    //                                         var sdate = Moment.utc(date).format('YYYY-MM-DD');                                  
    //                                         var Hourset = Moment.utc(sdate).set('hours', sHour); 
    //                                         start = Moment.utc(Hourset).set('minute', sMinute).format();

    //                                         var fHour = Moment.utc(shiftFinishTime).format('HH');
    //                                         var fMinute = Moment.utc(shiftFinishTime).format('mm');      
    //                                         var fdate = Moment.utc(nextDate).format('YYYY-MM-DD');                         
    //                                         var fHourset = Moment.utc(fdate).set('hours', fHour); 
    //                                         finish = Moment.utc(fHourset).set('minute', fMinute).format();                      
    //                                     }
    //                                     var startLimit = result.startLimit;
    //                                     var finishLimit = result.finishLimit;
    //                                     var dateOfnext = Moment.utc(date).format('YYYY-MM-DD')
    //                                                                     // Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, $where: 'this.date.toJSON().slice(0, 10) == "'+dateOfnext+'"' }, function(err, atncData) {
    //                                                                         Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, "date":new Date(dateOfnext)}, function(err, atncData) {
    //                                                                     // console.log(atncData +'atncData');
    //                                                                     if(!atncData){
    //                                                                         var attendance = new Attendance()
    //                                                                         attendance.companyId = companyId;
    //                                                                         attendance.companyName = companyName;
    //                                                                         attendance.date = Moment.utc(date).format('YYYY-MM-DD'); 
    //                                                                         attendance.shift = result.name;  
    //                                                                         attendance.lastShift = result.name;  
    //                                                                         attendance.shiftStart = start;
    //                                                                         attendance.limitIn = startLimit;
    //                                                                         attendance.shiftFinish = finish;
    //                                                                         attendance.limitOut = finishLimit;
    //                                                                         attendance.breakk = result.breakTime;
    //                                                                         attendance.breakAfter = result.breakAfter;   
    //                                                                         attendance.breakIn = result.breakIn;                          
    //                                                                         attendance.employeeNo = employeeNo; 
    //                                                                         attendance.department = department;
    //                                                                         attendance.holiday = holiday;
    //                                                                         attendance.lastName = lastName;
    //                                                                         attendance.firstName = firstName;
    //                                                                         attendance.email = email;
    //                                                                         attendance.payrollCode = payrollCode;   
    //                                                                         attendance.save(function(err) {
    //                                                                             if(err){
    //                                                                                 console.log(err);                          
    //                                                                             } 
    //                                                                         });
    //                                                                     }
    //                                                                 });
    //                                                             }); //empFn
    //                             });
    //                         })
    //                     }); 
    //                 });
    //                 if(employeeData.length == flagValue){
    //                     res.send('true');
    //                 }
    //             }
    //         });
    //     }//if data
    // }); //company find one
};

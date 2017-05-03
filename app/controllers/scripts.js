var mongoose = require('mongoose')
	, Company = mongoose.model('Company')
	, Employee = mongoose.model('Employee')
	, LeaveApplication = mongoose.model('LeaveApplication')
	, https = require('https')
	, Attendance = mongoose.model('Attendance')
	, WeeklyOT = mongoose.model('WeeklyOT')
	, Holidays = mongoose.model('Holidays')
	, Project = mongoose.model('Project')
	, scheduling = mongoose.model('scheduling')
	, Customreports = mongoose.model('Customreports')
	, Period = mongoose.model('Period')
	, Exception = mongoose.model('Exceptions')
	, Standardreports = mongoose.model('Standardreports')
	, Messages = mongoose.model('Messages')  
	, empFn = require('../../functions/employeefn.js')
	, Moment = require('moment-timezone')
	, SuperAdmin = mongoose.model('SuperAdmin')
	, Shift = mongoose.model('Shifts')
	, Rule = mongoose.model('Rule')
	, emailalerts = mongoose.model('emailalerts')
	, Registrationkeys = mongoose.model('Registrationkeys')
	, IclockMysql = mongoose.model('IclockMysql')
	, subDeparment = mongoose.model('subDeparment')
	, dashboard = mongoose.model('Dashboard')
	, subDashboard = mongoose.model('subDashboard')
	, employeeNumbers = mongoose.model('employeeNumbers')
	, customShifts = mongoose.model('customShifts')
	, emailfn =  require('../../functions/send_mail.js')
	, Rule = mongoose.model('Rule')
    , Tasks = mongoose.model('Tasks')
    , meterDashboard = mongoose.model('meterDashboard')
    , subMeterDashboard = mongoose.model('subMeterDashboard');

var async   =    require('async');

/* functions */
function changeFlagForEmpNo(callback){
	Employee.aggregate([{"$group":{"_id":{"employeeNo": "$employeeNo"}}}],function(err,result){
		var i =0;
		async.eachSeries(result, function(emp, callbackComp){ 
			// if(emp._id.employeeNo<=999999) {
				employeeNumbers.update({employeeNo:emp._id.employeeNo},
					{$set:{
						usedEmployeeNo:true
					}},{upsert:false,new:false},function(err,save){
						i++;
						if(i==result.length) {
							callback(true);
						}
						callbackComp();
				})
			// } else {
			//  callbackComp();
			// }
		});
	});
}

function orderByNameAscending(a, b) { // order by ascending as per checktime
	if (a.checkTime == b.checkTime) {
			return 0;
	} else if (a.checkTime > b.checkTime) {
			return 1;
	}
	return -1;
};

/* Export field update for individual company from particular date 
 * Script Path : /setExport/:companyId/:date
*/ 
exports.setFieldForAtn = function(req, res) {
    // Params
    var applyDate = req.params.date,
     	companyId = req.params.companyId,
     	fieldName = 'allowExport';
    
    console.log(new Date(applyDate));

    // Check company type
    empFn.checkCompanyRange(companyId, 'track', function(state) {
        if (!state)
            res.send("Invalid company");
        else if(!Moment(applyDate, 'YYYY-MM-DD').isValid())
        	res.send("Invalid date format... please specify date in YYYY-MM-DD");
        else {	
        	// Company Find
            Company.find(state, function(err, companies) {
                if (companies) {
                    var cmpCnt = 0;
                    // Async Companies
                    async.eachSeries(companies, function(dataCompany, callbackComp) {
                        cmpCnt++;
                        console.log(dataCompany._id + '----' + cmpCnt + 'name' + dataCompany.companyname);
                        // Employee Find
                        Employee.find({
                            'companyId': dataCompany._id,
                            'active': true
                        }).exec(function(err, EmployeeData) {
                            if (EmployeeData.length > 0) {
                                var empCnt = 0;
                                // Async Employees
                                async.eachSeries(EmployeeData, function(emp, callback) {
                                    empCnt++;
                                    var customeField = undefined;
                                    if (emp[fieldName] || emp[fieldName] == false)
                                        customeField = emp[fieldName];
                                    
                                    // Attendance Update
   	                                console.log("setting %s for %s  %s employee",customeField,emp.firstName,emp.lastName);
                                    
                                    Attendance.update({
                                    	'employeeNo':emp.employeeNo,
                                    	'companyId':companyId,
                                    	'date': {
                                            $gte: new Date(applyDate)
                                        }
                                    },{
                                    	$set: {
											'allowExport':customeField
										}
									},{
										upsert: false, new: false,multi:true
									}, function(err,data){
									    if (empCnt == EmployeeData.length) {
                                            if (cmpCnt == companies.length) 
                                                res.send("setExport for "+dataCompany.companyname+" company has been done");
                                            else
                                                callbackComp()
                                        } else
                                            callback()
                                    });                                        
                                });
                            } else {
                                if (cmpCnt == companies.length)
                                    res.send("No employee found");
                                else
                                    callbackComp()
                            }
                        }); 
                    });
                }
            });
        }
    });
};

/*set shift NT,OT1 and OT2 to 20 hours*/
exports.setDefaultTimeInShifts = function(req, res) {
    console.log("*********** setting time in shifts *************");
    var compnayCount = 0,
        companyId = req.params.companyId;
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
        res.send("Invalid company");
    } else {
        Company.find({
            '_id': companyId
        }, function(err, companyData) {
            // if need to set for all company then async in all company
            async.eachSeries(companyData, function(dataCompany, callbackComp) {
                if (dataCompany) {
                    compnayCount++;
                    var companyName = dataCompany.companyname;
                    var companyId = dataCompany._id;
                    var shiftCount = 0;
                    console.log("================ COMPANY %d / %d ===================", compnayCount, companyData.length);
                    Shift.find({
                        'companyId': companyId,
                    }, function(err, shData) {
                        console.log("Total %d shifts for %s : %s", shData.length, companyName, companyId);
                        if (shData.length > 0) {
                            async.eachSeries(shData, function(datash, callbackSh) {
                                shiftCount++;
                                if (datash.name === 'OPEN') {
                                    if (shData.length === shiftCount) {
                                        if (compnayCount === companyData.length)
                                            res.send("Shift default time has been assign");
                                        else
                                            callbackComp();
                                    } else
                                        callbackSh();
                                } else {
                                    empFn.setShiftDefaults(companyId, datash, shiftCount, function(cbRes) {
                                        if (cbRes) {
                                            if (shData.length === shiftCount) {
                                                if (compnayCount === companyData.length)
                                                    res.send("Shift default time has been assign");
                                                else
                                                    callbackComp();
                                            } else
                                                callbackSh();
                                        }
                                    });
                                }
                            }); //each Employee
                        } else {
                            console.log("no shift found");
                            if (compnayCount === companyData.length)
                                res.send("no shift found");
                            else
                                callbackComp();
                        }
                    }); //Employee
                } else {
                    console.log("company " + err);
                    res.send("company" + err);
                }
            }); //Company
        });
    }
};

/* Set in type for No > 4 */
exports.setInType = function(req,res) {
	console.log("In setInType --------");
	Attendance.find({'checkin.checkType':{$exists: true},'checkin.checkType':{$in:["4","5","6","7","8"]}}).sort({'_id':'asc'}).exec(function(err, data){
		if(data.length > 0){ 
			data.forEach(function(atn, index){
				atn.checkin.forEach(function(chk){
					if(chk.checkType=='4' || chk.checkType=='5' || chk.checkType=='6' || chk.checkType=='7' || chk.checkType=='8') {
							// console.log(atn);
							// console.log(chk);
							var currentChecking = chk;      
							Attendance.update({'_id':atn._id,'employeeNo':atn.employeeNo,'companyId':atn.companyId},
								{$pull: {
									checkin: {
										'_id':chk._id
									}
								}},{upsert: false, new: false}, function(errP,dataP){
								if(errP){
									console.log(errP)
								}else{
									console.log("pulled "+dataP);
									currentChecking.checkType = 'I';
									console.log(currentChecking);
									Attendance.update({'_id':atn._id,'employeeNo':atn.employeeNo,'companyId':atn.companyId},
										{$set: {
											'readFlag':false
										},
										$push: { 
											'checkin' :currentChecking
										}},{upsert: false, new: false},function(errC, checkinData){
											
										if(errC) {
											console.log(errC);
										}else{
											// console.log(checkinData);
											console.log("Chnage to In type");
										}
									});
								} 
							});  
					}// In If  
				});//Checkin
				if(data.length === index+1){
					res.send("In type has been set in "+data.length+" records");
				}
			});//DATA
		}else{
			res.send("No data found");
		}  
	});//Attendance foreeach
};

exports.createEmpNumbersinDb = function(req,res) {
	console.log("createEmpNumbersinDb");
	var backupArray = [];
	employeeNumbers.findOne({},function(err,details){
		if(details!=null){
			res.send("Already created series from 1 to 999999 and employeeNo is also available........");
		}else{
			for (var i = 1; i <= 999999; i++) {
				backupArray.push({employeeNo:i,usedEmployeeNo:false});
				if(backupArray.length == 999999){
					var j = 0;
					var incrementValue=3003;
					var backupArray1 = [];
					async.eachSeries(backupArray, function(emp, callbackComp){ 
						backupArray1.push(emp);
						j++;
						if(j==incrementValue) {
							employeeNumbers.collection.insert(backupArray1,function(err,result){
								backupArray1=[]; 
								incrementValue=incrementValue+3003;
								if (err) throw err;
								callbackComp();
							});
						} else {
							callbackComp();
						}
						if(incrementValue==backupArray.length) {
							changeFlagForEmpNo(function(result){
								if(result) {
									res.send("created series from 1 to 999999........");
								}
							})
							
						}
					});
				}   
			};
		} 
	})
};

exports.checkEmpNumbersExistinDb = function(req,res) {
	console.log("checkEmpNumbersinDb...");
	changeFlagForEmpNo(function(result){
		if(result) {
			res.send("changed flag if emp no is exist........");
		}
	})
};

exports.changeChekingTypeForProject = function(callback) {
		console.log("9) workcode set out time ----->");
		Company.find({}).exec(function(err, CompanyData) {
				var n = 0;
				var previousDate = Moment.utc().subtract('days', 2);
				var currentDate = Moment.utc().add('days', 1);
				console.log(previousDate.format('YYYY-MM-DD'));
				console.log(currentDate.format('YYYY-MM-DD'));

				async.eachSeries(CompanyData, function(dataCompany, callbackComp) {
						if (dataCompany) {
								n++;
								
								if (dataCompany.jobCosting) {
										
										Attendance.find({
												"companyId": dataCompany._id,
												"date": {
														$gte: new Date(previousDate),
														$lte: new Date(currentDate)
												},
												'checkin.checkType': {
														$exists: true
												},
												'checkin.workCode': {
														$nin: ["", "0"]
												}
										}).sort({
												'_id': 'asc'
										}).exec(function(err, data) {
												
												if (data.length > 0) {
														console.log("atn length %s",data.length);
														console.log("company %s %s",dataCompany.companyname,dataCompany._id);
														var atnCnt = 0;
														async.eachSeries(data, function(atnData, callbackAtn) {
																atnCnt++;
																if (atnData.checkin.length > 1) {
																		atnData.checkin.sort(orderByNameAscending);
																		var checkinCnt = 0;
																		var checkinEachCnt = 0;
																		async.eachSeries(atnData.checkin, function(checkins, callbackCheckin) {
																		// atnData.checkin.forEach(function(checkins, index) {
																				// console.log(checkins);
																				var checkType = checkins.checkType;
																				checkinEachCnt++;
																				// console.log(checkinEachCnt);
																				if (checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I') {
																						checkinCnt++;
																						// console.log("in"+checkinCnt);
																						if (checkinCnt == 2) {
																								checkinCnt = 0;
																								// console.log(checkins.checkTime);
																								// console.log("Project checking calculate ----------->");
																								var currentDate = Moment(checkins.checkTime).subtract('minute', 1);
																								// console.log(currentDate);
																								var OutnewDate = new Date(Date.parse(currentDate)).toUTCString();
																								var OutprvDate = Moment.utc(atnData.checkin[checkinEachCnt-2].checkTime);
																								var OutnextDate = Moment.utc(checkins.checkTime);
																								// console.log(OutprvDate,OutnextDate);			
																								console.log("Record found in workcode checkings");
																							 
																								if (Moment.utc(currentDate) > OutprvDate && Moment.utc(currentDate) < OutnextDate) {
																										console.log("valid outtime...");
																										Attendance.update({
																												'_id': atnData._id,
																												'companyId': atnData.companyId,
																												'employeeNo': atnData.employeeNo
																										}, {
																												$set: {
																														'projectFlag': true,
																												},
																												$push: {
																														checkin: {
																																'workCode': atnData.checkin[checkinEachCnt - 2].workCode,
																																'checkTime': OutnewDate,
																																'checkType': 'O',
																																'alter': "",
																																'alterWho': ""
																														}
																												}
																										}, {
																												upsert: false,
																												new: false
																										}, function(err, datas) {
																												// console.log(err);
																												// console.log(data);
																												var adminDetails = {
																																email: '',
																																userType: ''
																														},
																														attendanceId = atnData._id,
																														companyId = atnData.companyId,
																														employeeNo = atnData.employeeNo;

																												console.log("Out time adjusted -----------------");
																												// Company.find({
																												// 		'_id': companyId
																												// }, {}, {
																												// 		limit: 1
																												// }, function(err, dataCompanys) {
																												
																												empFn.getHolidays(companyId, function(holidayresult) {
																														Attendance.find({
																																'_id': attendanceId,
																																'companyId': companyId
																														}, {}, {
																																limit: 1
																														}, function(err, employeeAttendances) {
																																var employeeAttendance = employeeAttendances[0];
																																//Calculate Attendance
																																empFn.calculateAtn(adminDetails, holidayresult, dataCompany, employeeAttendance, function(result) {});
																																var dashboard_date = Moment(employeeAttendance.date),
																																		possible_end_date = Moment(dashboard_date).add('days', 7),
																																		dashboard_week_start = dashboard_date.format('YYYY-MM-DD'),
																																		dashboard_week_end = possible_end_date.format('YYYY-MM-DD');

																																// console.log("Dashboard dates ======>");
																																// console.log(dashboard_week_start);
																																// console.log(dashboard_week_end);
																																//Dashboard Update

																															    empFn.setDashboardFlagSingle(dashboard_week_start,dashboard_week_end,companyId,function(status){
																															        if(status){
																															            console.log("Dashboard "+status);
																															            empFn.setMeterDashboardFlag(dashboard_week_start,dashboard_week_end,companyId,function(meterStatus){
																															                if(meterStatus){
																															                    console.log("Meter Dashboard "+status);
																																	            console.log("dashboard updated");
																																				if(atnData.checkin.length==checkinEachCnt){	
																																					if(atnCnt === data.length){
																																						if(CompanyData.length === n){
																																								callback(true);
																																						}else{
																																								callbackComp();
																																						}
																																					}else{
																																						callbackAtn();
																																					}
																																				}else{
																																					callbackCheckin();
																																				}	  
																																		    }                                                                        
																															            });    
																															        }
																															    });
																																// dashboard.update({
																																// 		'weekStart': {
																																// 				$gte: dashboard_week_start
																																// 		},
																																// 		'weekEnd': {
																																// 				'$lte': dashboard_week_end
																																// 		},
																																// 		'companyId': companyId
																																// }, {
																																// 		$set: {
																																// 				calfalg: false
																																// 		}
																																// }, {
																																// 		upsert: true,
																																// 		new: false,
																																// 		multi: true
																																// }, function(err, data) {
																																	
																																// });
																															// console.log("calculateAtn done +++");
																														}); // attendance find
																												}); //holiday fn
																												// }
																												// }); //Company Fetch 
																										}); //Update attendance 
																								} else {
																									console.log("Invalid successive In's.. can't set out for them");
																									if(atnData.checkin.length==checkinEachCnt){	
																										if(atnCnt === data.length){
																											if(CompanyData.length === n){
																													callback(true);
																											}else{
																													callbackComp();
																											}
																										}else{
																											callbackAtn();
																										}
																									}else{
																										callbackCheckin();
																									}	  
																								}
																						} //set Out
																						else{
																							if(atnData.checkin.length==checkinEachCnt){
																								// console.log("my cnt",checkinCnt);
																								if(checkinCnt < 2){
																									console.log("No calculation needed --> In <-- ... out time already adjusted..",checkinCnt)
																									if(atnCnt === data.length){
																										if(CompanyData.length === n){
																												callback(true);
																										}else{
																												callbackComp();
																										}
																									}else{
																										callbackAtn();
																									}
																								}	  
																							}else{
																								callbackCheckin();
																							}
																						}
																				} else {
																						// console.log("out");
																						checkinCnt = 0;

																						if(atnData.checkin.length==checkinEachCnt){
																							console.log("No calculation needed -->Out<-- .. out time already adjusted..")
																							if(atnCnt === data.length){
																								if(CompanyData.length === n){
																									callback(true);
																								}else{
																									callbackComp();
																								}
																							}else{
																								callbackAtn();
																							}  
																						}else{
																							callbackCheckin();
																						}
																				}
																		}); //Checkin foreach 
																//If checkin
																} else {
																	if(atnCnt === data.length){
																		if(CompanyData.length === n){
																				callback(true);
																		}else{
																				callbackComp();
																		}
																	}else{
																		callbackAtn();
																	}  
																}
														}) //Data
												} else {
														console.log("no attendance with successive IN's -------------> already Done");
														if(CompanyData.length === n){
																callback(true);
														}else{
																callbackComp();
														}
												}
										});
								} else {
										if(CompanyData.length === n){
												callback(true);
										}else{
												callbackComp();
										}
								}
						}
				});
		});
};

exports.replaceCustomShiftIdWithName = function(req,res) {
	Attendance.find({shiftType:"customShift"},function(err,atnDetail){
		var atnCnt = 0;
		async.eachSeries(atnDetail, function(atn, cbDash){
			atnCnt++;
			// console.log(atn.shift);
			// console.log("atn._id...."+atn._id);
			customShifts.find({'_id':atn.shift},function(err,shiftDetail){
				if(shiftDetail) {
					// console.log(shiftDetail);
					var result = shiftDetail[0];
					var companyId =atn.companyId;
					var date = atn.date;
					var employeeNo = atn.employeeNo; 
					var breakTime = result.breakTime;
					var breakAfter = result.breakAfter;
					var breakIn = result.breakIn;
					var breakAfter2 = result.breakAfter2;
					var breakTime2 = result.breakTime2;
					var breakIn2 = result.breakIn2;      
					var shiftStartTime = result.startTime;
					var shiftFinishTime = result.finishTime;
					var nextDate = Moment.utc(date).add('days',1).format();
					var prvDate = Moment.utc(date).subtract('days',1).format('YYYY-MM-DD'); 
					var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
					var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
					var shiftColor = result.color;
					var start = '';
					var finish = '';
					// console.log("result");
					if(shiftStartDate == shiftFinishDate){                                                 //console.log('pppppppppp')
						var sHour = Moment.utc(shiftStartTime).format('HH');
						var sMinute = Moment.utc(shiftStartTime).format('mm');   
						var sdate = Moment.utc(date).format('YYYY-MM-DD');                              
						var Hourset = Moment.utc(sdate).set('hours', sHour); 
						start = Moment.utc(Hourset).set('minute', sMinute).format();

						var fHour = Moment.utc(shiftFinishTime).format('HH');
						var fMinute = Moment.utc(shiftFinishTime).format('mm');  
						var fdate = Moment.utc(date).format('YYYY-MM-DD');                             
						var fHourset = Moment.utc(fdate).set('hours', fHour); 
						finish = Moment.utc(fHourset).set('minute', fMinute).format();      
					}else{
						var sHour = Moment.utc(shiftStartTime).format('HH');                                 
						var sMinute = Moment.utc(shiftStartTime).format('mm');                                       
						var sdate = Moment.utc(date).format('YYYY-MM-DD');                                  
						var Hourset = Moment.utc(sdate).set('hours', sHour); 
						start = Moment.utc(Hourset).set('minute', sMinute).format();

						var fHour = Moment.utc(shiftFinishTime).format('HH');
						var fMinute = Moment.utc(shiftFinishTime).format('mm');      
						var fdate = Moment.utc(nextDate).format('YYYY-MM-DD');                         
						var fHourset = Moment.utc(fdate).set('hours', fHour); 
						finish = Moment.utc(fHourset).set('minute', fMinute).format();      
					}
					// console.log("result");
					var startLimit = result.startLimit;
					var finishLimit = result.finishLimit;
					var blankArray = [];
					var datec = Moment.utc(atn.date).format('YYYY-MM-DD');
			 
					// console.log("2");
					// console.log(req.body.date);
					// console.log(date);
					Attendance.update({'_id':atn._id},
						{$set: {
							shift:result.name,
							lastShift:result.name,
							shiftStart:start,
							shiftFinish:finish,
							limitIn:startLimit,
							limitOut:finishLimit,
							breakk:breakTime,
							breakAfter:breakAfter,
							breakAfter2:breakAfter2,
							breakIn:breakIn,
							breakIn2:breakIn2,
							shiftColor:shiftColor,
						}},{upsert: false, new: false}, function(err,data){
							// console.log(err);
							// console.log(data);
							if(atnCnt==atnDetail.length) {
								res.send("Replaced all custom id By its name...");
							} else 
								cbDash();
					});
				} else {
					if(atnCnt==atnDetail.length) {
						res.send("Replaced all custom id By its name...");
					} else 
						cbDash();
				}
			})
		});
	});
};

exports.getTheParentDeptName = function(req,res) {
	Company.find({}, function(err, CompanyData){
		var cmpCount = 0
		console.log(CompanyData.length);
		async.eachSeries(CompanyData, function(dataCompany, cbCmp){
			cmpCount++;
			console.log("cmpCount........"+cmpCount);
			var deptCnt = 0;
			if(dataCompany.departments.length>0) {
				async.eachSeries(dataCompany.departments, function(deptDetail, deptCb){
					deptCnt++;          
					subDashboard.update({'subDepartments.departmentId':deptDetail._id,'companyId':dataCompany._id},
						{$set: {
							'subDepartments.$.parentDeptName': deptDetail.name
						}},{upsert: false, new: false,multi:true}, function(err,data) {
						subDeparment.update({'parentDeptId':deptDetail._id,'companyId':dataCompany._id},
							{$set: {
								'parentDeptName':deptDetail.name
							}},{upsert: false, new: false,multi:true}, function(err,data) {
							if(deptCnt==dataCompany.departments.length) {
								if(cmpCount==CompanyData.length) {
									res.send("done");
								} else {
									cbCmp();  
								}          
							} else {
								deptCb();
							}
						});
					})
					console.log(deptDetail._id);
				});
			} else {
				if(cmpCount==CompanyData.length) {
					res.send("done");
				} else {
					cbCmp();  
				}  
			}
		});
	});
};

exports.changeTheCustomReportLink = function(req,res) {
	console.log("changeTheCustomReportLink");
	Customreports.find({},function(err,details){
		// console.log(details);
		var cnt1=0;
		async.eachSeries(details, function(reportDt, callback){
			var cnt=0;
			cnt1++;
			async.eachSeries(reportDt.reportData, function(reports, callback1){
				cnt++;
				var reportlink = reports.link;
				reportlink = reportlink.split("http://128.199.213.212:9180/").join("http://192.241.231.249:9180/");
				Customreports.update({'reportData._id':reports._id},
				{$set:{
					'reportData.$.link':reportlink
				}},{upsert:false,new:false},function(err,updated){
					if(cnt==reportDt.reportData.length) {
						if(cnt1==details.length) {
							res.send("link has been changed........");
						} else {
							callback();
						}
					} else {
						callback1();
					}
				}); 
			});
		});
	});
};

exports.backUpTheDb = function(req,res) {
	console.log("53c7e239e25093e304c70169");
	console.log(req.params);
	var systemDb= [];
	var messagesDb= [];
	var attendanceDb= [];
	var employeeDb= [];
	var attendanceMysqlDb= [];
	var cron2Db= [];
	var cron3Db= [];
	var cronDb= [];
	var iclockMysqlDb= [];
	var weeklyOTDb= [];
	var periodDb= [];              
	var subDeparmentDb= [];
	var dashboardDb= [];
	var schedulingDb = [];
	var emailalertsDb = [];
	var shiftsDb = [];
	var exceptionsDb = [];
	var holidaysDb = [];
	var leaveApplicationDb = [];
	var subDashboardDb = [];
	var sessionsdDb = [];
	var customreportsDb = [];
	var superAdminDb = [];
	var cmnyDb = [];
	var cnt = 0;
	function getData(callbackFinal) {
		console.log("11111");
		mongoose.connection.on('open', function (ref) {
			console.log("11111");
			mongoose.connection.db.collectionNames(function (err, names) {
				console.log("11111");
				async.eachSeries(names, function(namesDetail, callback){
					cnt++;
					console.log("2222");
					var collectionName = namesDetail.name.split(".");
					collectionName = collectionName[1];
					console.log(collectionName);
					mongoose.connection.db.collection(collectionName, function(error, settings) {
						if(collectionName=="company") {
							settings.find({_id:req.params.companyId}, function(err, empDetails) {
								console.log(err);
								console.log("ifff");
								empDetails.toArray(function(err,empDetail){
									cmnyDb = empDetail;
									callback();
								});                    
							});
						} else {
							// 53c7e239e25093e304c70169
							settings.find({companyId:req.params.companyId}, function(err, empDetails) {          
								empDetails.toArray(function(err,empDetail){
									if(empDetail!=null) {
										if(collectionName=="system") {
											systemDb = empDetail;
											callback();                  
										}
										if(collectionName=="messages") {
											messagesDb = empDetail;
											callback();                  
										}
										if(collectionName=="cron3") {
											cron3Db = empDetail;
											callback();                  
										}
										if(collectionName=="cron2") {
											cron2Db = empDetail;
											callback();                  
										}
										if(collectionName=="attendanceMysql") {
											attendanceMysqlDb = empDetail;
											callback();                  
										}
										if(collectionName=="employee") {
											employeeDb = empDetail;
											callback();                  
										}
										if(collectionName=="attendance") {
											attendanceDb = empDetail;
											callback();                  
										} 
										if(collectionName=="messages") {
											messagesDb = empDetail;
											callback();                  
										}
										if(collectionName=="period") {
											periodDb = empDetail;
											callback();                  
										}
										if(collectionName=="weeklyOT") {
											weeklyOTDb = empDetail;
											callback();                  
										}
										if(collectionName=="iclockMysql") {
											iclockMysqlDb = empDetail;
											callback();                  
										}
										if(collectionName=="cron") {
											cronDb = empDetail;
											callback();                  
										}
										if(collectionName=="subDeparment") {
											subDeparmentDb = empDetail;
											callback(); 
										}
										if(collectionName=="dashboard") {
											dashboardDb = empDetail;
											callback(); 
										}
										if(collectionName=="scheduling") {
											schedulingDb = empDetail;
											callback();
										}
										if(collectionName=="emailalerts") {
											emailalertsDb = empDetail;
											callback();
										}
										if(collectionName=="shifts") {
											shiftsDb = empDetail;
											callback();
										}
										if(collectionName=="exceptions") {
											exceptionsDb = empDetail;
											callback();
										}
										if(collectionName=="holidays") {
											holidaysDb = empDetail;
											callback();
										}
										if(collectionName=="leaveApplication") {
											leaveApplicationDb = empDetail;
											callback();
										}
										if(collectionName=="subDashboard") {
											console.log("subDashboardDb......"+empDetail)
											subDashboardDb = empDetail;
											callback();
										}
										if(collectionName=="sessions") {
											sessionsdDb = empDetail;
											callback();
										}
										if(collectionName=="customreports") {
											customreportsDb = empDetail;
											callback();
										}
										
										if(collectionName=="superAdmin") {
											superAdminDb = empDetail;
											callback();
										}                
										if(collectionName==" { inline : 1 }") {
											callback();
										}
										if(collectionName=="registrationkeys") {
											callback();
										}
										if(collectionName=="rule") {
											callback();
										}
									} else {
										callback();
									}                         
								})
							});
						}
						if(cnt==names.length) {
							mongoose.connection.close();
							callbackFinal(2);
						}      
					});        
				});
			});
		});  
	}
	getData(function(result){
		console.log(result);
		if(result=="2") {
			console.log("result if");
			mongoose.connect('mongodb://localhost/timecloudTest', function(err) {
				if (err) {
					console.log(err);
				} else {
					if(systemDb.length>0) {
						async.eachSeries(systemDb, function(detail, callback2){
							var key = "_id";
							delete detail[key];
							system.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback2();
							});
						});
					}      
					if(messagesDb.length>0) {
						async.eachSeries(messagesDb, function(detail, callback3){
							var key = "_id";
							delete detail[key];
							Messages.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback3();
							});
						});
					}  
					if(attendanceDb.length>0) {
						async.eachSeries(attendanceDb, function(detail, callback4){
							var key = "_id";
							delete detail[key];
							Attendance.update({'_id':detail._id},
								{$set:detail,
								},{upsert:true,new:false},function(err,dt){               
									callback4();
							});
						});
					}
					
					if(employeeDb.length>0) {
						async.eachSeries(employeeDb, function(detail, callback5){
						 var key = "_id";
						 delete detail[key];
						 Employee.update({'_id':detail._id},
								{$set: detail
								},{upsert: true, new: false}, function(err,data) {
									callback5();
							});          
						});
					}    
					console.log("2");
					// if(attendanceMysqlDb.length>0) {
					//   async.eachSeries(attendanceMysqlDb, function(detail, callback6){
					//     var key = "_id";
					//     delete detail[key];
					//     "aaa"
					//     attendanceMysql.update({_id:detail._id},
					//       {$set:detail
					//       },{upsert:true,new:false},function(err,dt){
					//         callback6();
					//     });
					//   });
					// }
					// if(cron2Db.length>0) {
					//   async.eachSeries(cron2Db, function(detail, callback7){
					//     var key = "_id";
					//     delete detail[key];
					//     zzz
					//     cron2.update({_id:detail._id},
					//       {$set:detail
					//       },{upsert:true,new:false},function(err,dt){
					//         callback7();
					//     });
					//   });
					// }
					// if(cron3Db.length>0) {
					//   async.eachSeries(cron3Db, function(detail, callback8){
					//     var key = "_id";
					//     delete detail[key];
					//     cron3.update({_id:detail._id},
					//       {$set:detail
					//       },{upsert:true,new:false},function(err,dt){
					//         callback9();
					//     });
					//   });
					// }       
					// if(cronDb.length>0) {
					//   async.eachSeries(cronDb, function(detail, callback10){
					//     var key = "_id";
					//     delete detail[key];
					//     cron.update({_id:detail._id},
					//       {$set:detail
					//       },{upsert:true,new:false},function(err,dt){
					//         callback10();
					//     });
					//   });
					// }
					if(iclockMysqlDb.length>0) {
						async.eachSeries(iclockMysqlDb, function(detail, callback11){
							var key = "_id";
							delete detail[key];
							IclockMysql.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback11();
							});
						});
					}
					if(weeklyOTDb.length>0) {
						async.eachSeries(weeklyOTDb, function(detail, callback12){
							var key = "_id";
							delete detail[key];
							WeeklyOT.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback12();
							});
						});
					}
					if(periodDb.length>0) {
						async.eachSeries(periodDb, function(detail, callback13){
							var key = "_id";
							delete detail[key];
							Period.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback13();
							});
						});
					}
					if(subDeparmentDb.length>0) {
						async.eachSeries(subDeparmentDb, function(detail, callback14){
							var key = "_id";
							delete detail[key];
							subDeparment.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback14();
							});
						});
					}         
					if(dashboardDb.length>0) {
						async.eachSeries(dashboardDb, function(detail, callback15){
							var key = "_id";
							delete detail[key];
							dashboard.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback15();
							});
						});
					}
					if(schedulingDb.length>0) {
						async.eachSeries(schedulingDb, function(detail, callback16){
							var key = "_id";
							delete detail[key];
							scheduling.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback16();
							});
						});
					}
					if(emailalertsDb.length>0) {
						async.eachSeries(emailalertsDb, function(detail, callback17){
							var key = "_id";
							delete detail[key];
							emailalerts.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback17();
							});
						});
					}
					if(shiftsDb.length>0) {
						async.eachSeries(shiftsDb, function(detail, callback18){
							var key = "_id";
							delete detail[key];
							Shift.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback18();
							});
						});
					}
					if(exceptionsDb.length>0) {
						async.eachSeries(exceptionsDb, function(detail, callback19){
							var key = "_id";
							delete detail[key];
							Exception.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback19();
							});
						});
					}    
					if(holidaysDb.length>0) {
						async.eachSeries(holidaysDb, function(detail, callback20){
							var key = "_id";
							delete detail[key];
							Holidays.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback20();
							});
						});
					}
					if(leaveApplicationDb.length>0) {
						async.eachSeries(leaveApplicationDb, function(detail, callback21){
							var key = "_id";
							delete detail[key];
							LeaveApplication.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback21();
							});
						});
					}      
					if(subDashboardDb.length>0) {
						async.eachSeries(subDashboardDb, function(detail, callback22){
							var key = "_id";
							delete detail[key];
							subDashboard.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback22();
							});
						});
					}
					if(customreportsDb.length>0) {
						async.eachSeries(customreportsDb, function(detail, callback23){
							var key = "_id";
							delete detail[key];
							Customreports.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback23();
							});
						});
					}
					if(superAdminDb.length>0) {
						async.eachSeries(superAdminDb, function(detail, callback24){
							var key = "_id";
							delete detail[key];
							superAdmin.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback24();
							});
						});
					}
					if(cmnyDb.length>0) {
						async.eachSeries(cmnyDb, function(detail, callback25){
							var key = "_id";
							delete detail[key];
							Company.update({_id:detail._id},
								{$set:detail
								},{upsert:true,new:false},function(err,dt){
									callback25();
							});
						});
					}
					res.send("Done..................");
				}   
			}); 
		}
	})
};

exports.createemployeeRecord = function(req, res){
	Company.findById(req.params.companyId, function(err, user) {
		if(user){
			Employee.find({companyId:req.params.companyId,employeeNo:req.params.employeeNo},function(err,empDetails){
				console.log("detail......"+empDetail);
				var empDetail = empDetails[0];
				global.daysArray = [];
				global.OnlyDays = [];
				var employeeNo = empDetail.employeeNo;
				var oldEmployeeNo = empDetail.oldEmployeeNo;
				var companyName = user.companyname;
				var shiftCutoff = user.shiftCutoff;
				var prvOnShift = '';
				var isHolidays = user.isHolidays;

				var start = Moment.utc().subtract('days', 30);
				var end = Moment.utc().add('days', 30);
				var shiftPattern = empDetail.shift;
				async.waterfall([function(next){
					// console.log(shiftPattern);
					empFn.getShiftPatternData(shiftPattern, req.params.companyId, function(result){
						// console.log(result);
						var noOfDays = result.noOfDays;
						var ruleStartDate = result.ruleStartDate;
						// console.log(ruleStartDate + 'ruleStartDateruleStartDateruleStartDate');
						result.days.forEach(function(daysData){
							var day = daysData.day;
							var shift = daysData.shift;
							daysArray.push({shift:shift,day:day});
							// daysArray.push(shift+':'+day); 11
							OnlyDays.push(day);
						});
						if(noOfDays){
							var todaysDay = Moment(start).day();
						}
						next(null,daysArray,todaysDay,OnlyDays, ruleStartDate)
					})
				}],function (err, result, todaysDay, OnlyDays, ruleStartDate) {
					console.log("get Holidaysss");
					var i = 0;
					empFn.getHolidays(req.params.companyId, function(holidayresult) {
						// console.log(holidayresult);
						tryToSave(start, end, result, todaysDay,OnlyDays,i, holidayresult,ruleStartDate, function(data) {
							// console.log(data);
							if(data==1) {
								res.send("Record for employeeNo "+req.params.employeeNo+" is created.")
							}
						});
					});
				})
				var tryToSave = function(currentDate, endDate, result, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, callback) {
					var arrayResult = result;
					if(i>result.length-1){
						i = 0;
					}
					if (currentDate > endDate) {
						return callback(1);
					} else {
						if(result){
							var dateModify =  Moment.utc(currentDate).format();
							var dateGive =  Moment(dateModify).format('YYYY-MM-DD');
							var holiday = '';
							if(isHolidays == true) {
								if(holidayresult.indexOf(dateGive) > -1) {
									holiday = true;
								}
							}
							var shift ='';
							//console.log(ruleStartDate +'-----------------------------');
							if(ruleStartDate != '') {
								if(dateGive >= Moment.utc(ruleStartDate).format('YYYY-MM-DD')){
									//console.log('yes-----------------------------------------');
									var dayOfcurrentDate = Moment(dateModify).day();
									if(OnlyDays.indexOf('Day1')>-1){
										var ValueArray = result[i].shift;
										shift = ValueArray;
										i++;
									} else {
										var ValueArray = result[i].shift;
										if(dayOfcurrentDate == empFn.weekDayNumber(result[i].day)){
											shift = ValueArray;
											i++;
										} else {
											//console.log(i);
											var dayString = empFn.weekDayString(dayOfcurrentDate);
											var resultIndex = OnlyDays.indexOf(dayString);
											var ValueArray = result[resultIndex].shift;
											shift = ValueArray;
											i =  resultIndex + 1;
										}
									}
								} else {
									shift = "OPEN";
								}
							}
							empFn.getShiftData("",shift, req.params.companyId, function(result) {
								//// console.log('getShiftData'+result);
								// console.log(result);
								//var dateModify =  currentDate;
								var breakTime = result.breakTime;
								var breakAfter = result.breakAfter;
								var breakIn = result.breakIn;
								var breakAfter2 = result.breakAfter2;
								var breakTime2 = result.breakTime2;
								var breakIn2 = result.breakIn2;
								var shiftStartTime = result.startTime;
								var shiftFinishTime = result.finishTime;
								var date = currentDate;
								var nextDate = Moment.utc(date).add('days',1).format();
								var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
								var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
								var start = '';
								var finish = '';
								if(shiftStartDate == shiftFinishDate) {
									var sHour = Moment.utc(shiftStartTime).format('HH');
									var sMinute = Moment.utc(shiftStartTime).format('mm');
									var sdate = Moment.utc(date).format('YYYY-MM-DD');
									var Hourset = Moment.utc(sdate).set('hours', sHour);
									start = Moment.utc(Hourset).set('minute', sMinute).format();
									var fHour = Moment.utc(shiftFinishTime).format('HH');
									var fMinute = Moment.utc(shiftFinishTime).format('mm');
									var fdate = Moment.utc(date).format('YYYY-MM-DD');
									var fHourset = Moment.utc(fdate).set('hours', fHour);
									finish = Moment.utc(fHourset).set('minute', fMinute).format();
								} else {
									if(shiftCutoff == true) {
										prvOnShift = true;
									}
									// console.log('-----------------------------------------------------------');
									var sHour = Moment.utc(shiftStartTime).format('HH');
									var sMinute = Moment.utc(shiftStartTime).format('mm');
									var sdate = Moment.utc(date).format('YYYY-MM-DD');
									var Hourset = Moment.utc(sdate).set('hours', sHour);
									start = Moment.utc(Hourset).set('minute', sMinute).format();
									var fHour = Moment.utc(shiftFinishTime).format('HH');
									var fMinute = Moment.utc(shiftFinishTime).format('mm');
									var fdate = Moment.utc(nextDate).format('YYYY-MM-DD');
									var fHourset = Moment.utc(fdate).set('hours', fHour);
									finish = Moment.utc(fHourset).set('minute', fMinute).format();
								}
								var startLimit = result.startLimit;
								var finishLimit = result.finishLimit;
								// console.log('shiftAssign'+'shift++++++++++++++++++++++++++++++++'+shift);
								var attendance = new Attendance();
								attendance.companyId = req.params.companyId;
								attendance.companyName = companyName;
								attendance.date = Moment.utc(dateModify).format('YYYY-MM-DD');
								attendance.firstName = empDetail.firstName;
								attendance.lastName =empDetail.lastName;
								attendance.email =empDetail.email;
								attendance.admin = empDetail.administrator;
								attendance.shift = shift;
								attendance.lastShift = shift;
								attendance.shiftStart = start;
								attendance.shiftFinish = finish;
								attendance.limitIn = startLimit;
								attendance.limitOut = finishLimit;
								attendance.breakk = breakTime;
								attendance.breakAfter = breakAfter;
								attendance.breakIn = breakIn;
								attendance.department = empDetail.department;
								attendance.subDepartment = empDetail.subDepartment;
								attendance.employeeNo = empDetail.employeeNo;
								attendance.hourlyRate =empDetail.hourlyRate;
								attendance.chargeoutRate = empDetail.chargeoutRate;
								attendance.holiday = holiday;
								attendance.payrollCode = empDetail.payrollCode;
								attendance.allowExport = empDetail.allowExport;
								attendance.prvOnShift = prvOnShift;
								attendance.save(function(err,data) {
									// console.log(err);
									// console.log(data);
									if (err){
										//console.log(err);
										return callback(err);
									} else {
										currentDate = Moment.utc(currentDate).add('days', 1);
										console.log('next : '+currentDate);
										tryToSave(currentDate,endDate,arrayResult,todaysDay,OnlyDays,i,holidayresult, ruleStartDate, callback)
									}
								});
							});
						}
					}
				}
			})
		}
	});
			// empFn.generate_employeeNo(req.session.user,function(result){ // this will return the generated employee no for company
				
			//   var employee = new Employee();
			//   if(req.session.user)
			//     employee.companyId = req.session.user;
			//   if(req.body.firstName)
			//     employee.firstName = req.body.firstName;
			//   if(req.body.lastName)
			//     employee.lastName = req.body.lastName;
			//   if(req.body.administrator)
			//     employee.administrator = req.body.administrator;
			//   if(req.body.administrator)
			//     employee.adminType = "subAdmin";
			//   if(req.body.active)
			//     employee.active = req.body.active;
			//   if(req.body.password){
			//     employee.password = employee.generateHash(req.body.password);
			//   }
			//   if(req.body.pin)
			//     employee.pin = req.body.pin;
			//   if(req.body.email)
			//     employee.email = req.body.email;        
			//   employee.employeeNo = employeeNo;
			//   employee.companyname = companyName;
			//   if(req.body.payrollCode)
			//     employee.payrollCode = req.body.payrollCode;
			//   if(req.body.hourlyRate)
			//     employee.hourlyRate = req.body.hourlyRate;
			//   if(req.body.chargeoutRate)
			//     employee.chargeoutRate = req.body.chargeoutRate;
			//   if(req.body.allowExport)
			//     employee.allowExport = req.body.allowExport;
			//   if(req.body.department)
			//     employee.department = req.body.department;
			//   if(req.body.subDepartment)
			//     employee.subDepartment = req.body.subDepartment;
			//   employee.shift = shiftPattern;
			//   if(req.body.job)
			//     employee.job = req.body.job;
			//   if(req.body.taskId)
			//     employee.taskId = req.body.taskId;
			//   if(req.body.staffId)
			//     employee.staffId = req.body.staffId;
			//   if(req.body.permission)
			//     employee.permission = req.body.permission;
			//   employee.oldEmployeeNo = oldEmployeeNo;
			//   employee.save(function(err,data) {
			//     console.log(data);
			//     if(data){
						
			//     }
			//   });
			// });
};

exports.addLattitudeAndLongitude = function(req,res) {
	var empCnt = 0;
	// Attendance.find({companyId:req.params.companyId,"date":{$gte:new Date(req.params.startDate),$lte:new Date(req.params.endDate)}},function(err,details){
	Attendance.find({companyId:req.params.companyId,"date":new Date(req.params.startDate)},function(err,details){
		async.eachSeries(details, function(detail, callbackEmp){ 
			empCnt++;
			var employeeNum=detail.employeeNo;
			// if(empCnt<=10) {
				if(detail.checkin.length>0) {
					var checkinCnt= 0;
					async.eachSeries(detail.checkin, function(checkin, cbCheckin) {
						checkinCnt++;
						Attendance.update({"_id":detail._id,"checkin._id":checkin._id},
							{$set: {               
								"checkin.$.latitude"  : "-45.515717",
								"checkin.$.longitude" : "168.488429"
							}},{upsert: false, new: false,multi:true}, function(err,data){
								if(checkinCnt == detail.checkin.length) {
									if(empCnt == details.length) {
										res.send("latitude and longitude is added...");
									} else 
									callbackEmp();
								} else {
									cbCheckin();
								}
						});
					});
				} else {
					if(empCnt == details.length) {
						res.send("latitude and longitude is added...");
					} else 
					callbackEmp();
				}
			// } else {
			//   if(empCnt == details.length) {
			//     res.send("latitude and longitude is added...");
			//   } else 
			//   callbackEmp();
			// }
		});
	});
};

exports.updateTheHourlyRateOfEmployeeInAttendance = function(req,res) {
	Employee.find({'companyId':req.params.companyId, 'active':true},function(err, employeeData){ 
		if(employeeData) {
			var empCnt = 0;
			async.eachSeries(employeeData, function(dataEmp, callbackEmp){ 
				empCnt++;
				Attendance.update({hourlyRate:"",'employeeNo':dataEmp.employeeNo,'companyId':dataEmp.companyId},
					{$set: {
						hourlyRate :dataEmp.hourlyRate,
						active:dataEmp.active
					}},{upsert: false, new: false,multi:true}, function(err,data){
						if(empCnt == employeeData.length) {
							res.send("Hourly Rate Is updated in Employee Attedance from the Employee Details...");
						}
						callbackEmp();
				});
			});
		}
	});
};

exports.assignFirstAdminUserToMainAdmin = function(req,res) {
	Employee.update({'employeeNo':1,administrator:true},
		{$set: {
			adminType :"mainAdmin",
		}},{upsert: false, new: false,multi:true}, function(err,data){
			if(err) {
				console.log(err);
			}else{
				Employee.update({'employeeNo':{$ne:1},administrator:true},
					{$set: {
						adminType :"subAdmin",
					}},{upsert: false, new: false,multi:true}, function(err,data){
						if(err) {
							console.log(err);
						} else {
							Employee.update({'oldEmployeeNo':1,administrator:true},
								{$set: {
									adminType : "mainAdmin",
								}},{upsert: false, new: false, multi:true}, function(err,data){
									if(err) {
										console.log(err);
									} else {
										Company.find({}, function(err, CompanyData){
											var cmpCount = 0
											async.eachSeries(CompanyData, function(dataCompany, cbCmp){
												cmpCount++;                        
												Employee.update({"email" : dataCompany.email,"companyId" : dataCompany._id,administrator:true},
													{$set: {
														adminType : "mainAdmin",
													}},{upsert: false, new: false}, function(err,data){
														if(cmpCount == CompanyData.length) {
															res.send("Assigned First Admin User as Main Admin.......");
														} else {
															cbCmp();  
														}                            
												});
											});                      
										});
									}
							});
						}
				});
			}
	});
};

exports.changeTheEmployeeNo = function(req,res) {
	Employee.findOne({oldEmployeeNo:{$ne:""}}).sort('employeeNo').exec( function(err, doc) {
		console.log(doc);
		if(doc==undefined) {
			console.log("ifff..........");
			var employeeNum = 999999;
			var cnt = 0;
			Employee.find({companyId:req.params.companyId}).sort({employeeNo:1}).exec(function(err, empDetail) {
				async.eachSeries(empDetail, function(details, callback){
					// console.log(details);
					// callback();
					cnt++;
					console.log(details.oldEmployeeNo);
					if(details.oldEmployeeNo) {    
						if(cnt==empDetail.length-1) {
							res.send("Employee number Changed For company "+details.companyname);
						}
						callback();
					} else {
						Attendance.update({'employeeNo':details.employeeNo,'companyId':details.companyId},
							{$set: {
								employeeNo :employeeNum
							}},{upsert: false, new: false,multi:true}, function(err,data){
								if(err) {
									console.log(err);
								}else{
									Employee.update({'_id':details._id},
										{$set: {
											employeeNo :employeeNum,
											oldEmployeeNo:details.employeeNo,              
										}},{upsert: false, new: false,multi:true}, function(err,data){
											if(err) {
												console.log(err);
											}else{
												if(cnt==empDetail.length-1) {
													res.send("Employee number Changed For company "+details.companyname);
												}
												employeeNum = employeeNum - 1;
												callback();
											}
									});
								}
						});
					}      
				});    
			});
		} else {
			console.log("else..........");
			var employeeNum = doc.employeeNo;
			employeeNum = employeeNum -1;
			console.log(employeeNum);
			var cnt = 0;
			Employee.find({companyId:req.params.companyId}).sort({employeeNo:1}).exec(function(err, empDetail) {
				async.eachSeries(empDetail, function(details, callback){
					cnt++;
					if(details.oldEmployeeNo) {
						if(cnt==empDetail.length-1) {
							res.send("Employee number Changed For company "+details.companyname);
						}
						callback();

					} else {
						
						Attendance.update({'employeeNo':details.employeeNo,'companyId':details.companyId},
							{$set: {
								employeeNo :employeeNum
							}},{upsert: false, new: false,multi:true}, function(err,data){
								if(err) {
									console.log(err);
								}else{
									Employee.update({'_id':details._id},
										{$set: {
											employeeNo :employeeNum,
											oldEmployeeNo:details.employeeNo
											,              
										}},{upsert: false, new: false,multi:true}, function(err,data){
											if(err) {
												console.log(err);
											}else{
												if(cnt==empDetail.length-1) {
													res.send("Employee number Changed For company "+details.companyname);
												}
												employeeNum = employeeNum - 1;
												callback();
											}
									});
								}
						});
					}
				});    
			});
		 }
		 
		 // var min = doc;
		 // console.log(min);
	});
};

exports.readWriteForEmployee= function(req,res) {
	var dates = new Date();
	dates = Moment.utc(dates).format('YYYY-MM-DD');
	var weekAgoDate = Moment.utc(dates).subtract('days', 7).format('YYYY-MM-DD'); 
	Attendance.update({'employeeNo': req.params.employeeNo,'companyId':req.params.companyId,date:{$gte:new Date(weekAgoDate)}},
		{$set: {
			readWriteForEmployee:true,
		}},{upsert: false, new: false,multi:true}, function(err,data){
			if(err) {
				console.log(err);
			}else{
				Employee.update({'employeeNo': req.params.employeeNo,'companyId':req.params.companyId},
					{$set: {
						readWriteForEmployee:true,
					}},{upsert: false, new: false,multi:true}, function(err,data){
						if(err) {
							console.log(err);
						}else{              
							res.send("Read/write Permision for the employee No."+req.params.employeeNo+ " is added... ");
						}
				});
			}
	});
};

exports.SechedulingBycompanyId= function(req,res) {
	Shift.find({companyId:req.params.companyId},function(err,shiftDetail){
		if(shiftDetail.length>0) {
			var cnt = 0;
			var shiftArray = [];
			var sortOrder = [];
			var section = 0;
			async.eachSeries(shiftDetail, function(shifts, callBackShift){
				cnt++;
				scheduling.findOne({companyId:shifts.companyId,'sectionNames.shiftName':shifts.name},function (err,detail) {
					if(detail!=null){
						if(cnt==shiftDetail.length) {
							if(shiftArray.length>0) {
								section = detail.sortOrder.length + 1;
								var tmpSection = "section"+section;
								sortOrder = detail.sortOrder;
								sortOrder.push(tmpSection);
								scheduling.update({'companyId':shifts.companyId},
									{$set: {
										'sortOrder':sortOrder
									},
									$push: { 
										'sectionNames' : {
											'shiftName':shiftArray,
											'sectionName':tmpSection
										}
									}},{upsert: false, new: false},function(err, attendanceData){
										shiftArray=[];
										res.send("Scheduling for company \""+shifts.company+"\" is created........");
								});
							}
						} else {
							if(cnt==shiftDetail.length-1) {
								res.send("Scheduling for company \""+shifts.company+"\" is created........");
							}
							callBackShift();
						}              
					} else {
						shiftArray.push(shifts.name);
						if(shiftArray.length>=3) {
							section++;
							var tmpSection = "section"+section;
							sortOrder.push(tmpSection);
							if(cnt==shiftDetail.length) {
								scheduling.update({'companyId':shifts.companyId},
									{$set: {
										'sortOrder' :sortOrder,
									},
									$push: { 
										'sectionNames' : {
											'shiftName':shiftArray,
											'sectionName':tmpSection
										}
									}},{upsert: true, new: false},function(err, attendanceData){
										shiftArray=[];
										res.send("Scheduling for company \""+shifts.company+"\" is created........");
								});
							} else {
								scheduling.update({'companyId':shifts.companyId},
									{$push: { 
										'sectionNames' : {
											'shiftName':shiftArray,
											'sectionName':tmpSection
										}
									}},{upsert: true, new: false},function(err, attendanceData){
										shiftArray=[];
										callBackShift();
								});
							}
						} else {
							if(cnt==shiftDetail.length) {
								section = section + 1;
								var tmpSection = "section"+section;
								sortOrder.push(tmpSection);
								scheduling.update({'companyId':shifts.companyId},
									{$set: {
										'sortOrder':sortOrder
									},
									$push: { 
										'sectionNames' : {
											'shiftName':shiftArray,
											'sectionName':tmpSection
										}
									}},{upsert: true, new: false},function(err, attendanceData){
										shiftArray=[];
										res.send("Scheduling for company \""+shifts.company+"\" is created........");
								});
							} else {
								callBackShift();  
							}        
						}
					}
				})
				
			});
		} else {
			res.send("Invalid Company Id....");
		}
	})
};

exports.weeklyOtPreviousPeriod= function(req,res) {
	WeeklyOT.find({'companyId':req.params.companyId}, {},{limit:1,sort:{weekStart:-1}},function(err, weekData){
		console.log(weekData);
		weekData.forEach(function(weekDetail){
			var d1 = Moment(weekDetail.weekStart);
			var d2 = Moment(weekDetail.weekEnd);
			var days = Moment.duration(d2.diff(d1)).asDays();
			var weeks = req.params.days.split("w");
			weeks = weeks[0];
			var numOfWeek = parseInt(weeks);
			var weekNewWeekEnd = '';
			var weekNewWeekStart = weekDetail.weekStart;
			var numOfWeeks = [];
			for (var j = 1; j <= numOfWeek; j++) {
				numOfWeeks.push({numOfWeek:j});
			};
			var cnt = 0;
			async.eachSeries(numOfWeeks, function(numWeek, callback){
				cnt++;
				weekNewWeekEnd = Moment(weekNewWeekStart).subtract('days',1).format("YYYY-MM-DD");
				weekNewWeekStart = Moment(weekNewWeekEnd).subtract('days',days).format("YYYY-MM-DD");
				console.log("weekNewWeekStart....."+weekNewWeekStart);
				console.log("weekNewWeekEnd....."+weekNewWeekEnd);
				Employee.find({companyId:req.params.companyId},function(err, empDetail){
					var inCnt=0;
					console.log(empDetail.length);
					async.eachSeries(empDetail, function(empDt, callback1){
						console.log("empDt");
						inCnt++;
						console.log("empDt.active......"+empDt.active);
						if(empDt.active===true) {              
							var weekOverTime = new WeeklyOT();
							weekOverTime.companyId = empDt.companyId;
							weekOverTime.employeeNo = empDt.employeeNo;
							weekOverTime.totalOT ='0:0:00';
							weekOverTime.weekEnd = weekNewWeekEnd;
							weekOverTime.weekStart = weekNewWeekStart;
							weekOverTime.weeklyNT = '0:0:00';
							weekOverTime.weeklyOT1 = '0:0:00';
							weekOverTime.weeklyOT2 = '0:0:00';
							weekOverTime.readflag = true;
							weekOverTime.save(function(err,detail){
								if(inCnt==empDetail.length) {
									if(cnt==numOfWeeks.length) {
										res.send("weeklyOt of period of "+ numOfWeek +" week is created...");
									} else 
										callback();                  
								} else {
									callback1();
								}              
							});
						} else {
							if(inCnt==empDetail.length) {
								if(cnt==numOfWeeks.length) {
									res.send("weeklyOt of period of "+ numOfWeek +" week is created...");
								} else 
									callback();                  
							} else {
								callback1();
							}   
						}
					});          
				});        
			});      
		})
	});
};

exports.createEmailAlert=function(req,res) {
	Company.findOne({_id:req.params.companyId},function(err, data){
		console.log(data);
		if(data!=null) {
			emailalerts.update({'companyId':req.params.companyId,emailType:'Offline clock-Timecloud'},
				{$set: {
					companyId:req.params.companyId,
					emailType:'Offline clock-Timecloud'
				},$push: {email: data.email}},{upsert: true, new: false}, function(err,data1){
					console.log(err);
					console.log(data1);
					if(data1) {
						emailalerts.update({'companyId':req.params.companyId,emailType:'TZAdj Changes-Timecloud'},
							{$set: {
								companyId:req.params.companyId,
								emailType:'TZAdj Changes-Timecloud'
							},$push: {email: data.email}},{upsert: true, new: false}, function(err,data2){
								if(data2) {
									emailalerts.update({'companyId':req.params.companyId,emailType:'working alerts'},
										{$set: {
												companyId:req.params.companyId,
												emailType:'working alerts'
										},$push: {email: data.email}},{upsert: true, new: false}, function(err,data3){
											if(data3) {
												res.send("Email Alert For Company "+ data.companyname+" is created..");
											}
									});
								}
						});
					}
			});
		} else {
			res.send("Invalid companyId");
		}
	});
};

exports.assignTextToExceptionAssign=function(req,res) {
	Attendance.update(
		{'Exceptiontype':"Holiday"},                           
		{$set: {   
				ExceptionAssign:'Holiday'
		}},             
		{upsert: false, new: false, multi:true }, function(err,data){
				if(err) {
					 console.log(err);
				}else{
					 res.send("Assign the Holiday text to ExceptionAssign field")
				}
	}); 
};

exports.checkingAllDays=function(req,res){
	Employee.find({companyId:'53c7e239e25093e304c70169'},{},{sort:{employeeNo:1}},function(err,empDetail){
		console.log(empDetail.length);
		async.eachSeries(empDetail, function(empData,callback){
			var cnt=0;
			Attendance.find({employeeNo:empData.employeeNo,companyId:'53c7e239e25093e304c70169',date:{$gte:new Date('2015-04-01')}},{},{sort:{date:1}},function(err, atnData){
				if(atnData.length>0) {         
					async.eachSeries(atnData, function(atnDetail,callback1){
						cnt++;
						// console.log(cnt)
						// console.log(atnData.length);
						Finalresult.push({companyName:empData.companyname,Employees:atnDetail.employeeNo,Date:atnDetail.date});
						// console.log(Finalresult);
						if(cnt==atnData.length) {
							console.log("aaaaaa");
							callback();
							// res.send(Finalresult);
						}
						callback1();            
					});
				} else 
					callback1();
			});
		});
	});
	// var Finalresult= [];
	//  var cnt=0;
	// Attendance.find({,date:{$gte:new Date('2015-04-01')}},{},{sort:{date:1}},function(err, atnData){
	//   // console.log(atnData);
	//   if(atnData.length>0) {
		 
	//     async.eachSeries(atnData, function(atnDetail,callback){
	//       cnt++;
	//       console.log(cnt)
	//       console.log(atnData.length);
	//       Finalresult.push({companyName:atnDetail.companyId,Employees:atnDetail.employeeNo,Date:atnDetail.date});
	//       if(cnt==atnData.length) {
	//         console.log("aaaaaa");
	//         res.send(Finalresult);
	//       }
	//       callback();
					
	//     });
	//   } else {
	//     res.send("Record does not exists....");
	//   }
	// });
	// var outerCnt =0;
	// // Company.find({}, function(err, companies){
	// //   if(companies){
	// //     async.eachSeries(companies, function(dataCompany1,callback1){
	// //       outerCnt++;
	//       Attendance.find({companyId:'53c7c59daa575e646190d127',date:{$gte:new Date('2015-05-01')}},{},{sort:{date:1}},function(err, atnData){
	//         var cnt=0;
	//         var empList = [];
	//         // console.log(atnData.length);          
	//         if(atnData.length>0) {
	//           // console.log(atnData.length);     
	//           // console.log(dataCompany1._id+"------------->");

	//           // atnData.forEach(function(detail){

	//           //   console.log(detail.employeeNo+" " +detail.date);
	//           //   // callback1();
	//           //   cnt++;
	//           //   if(cnt==atnData.length) {
	//           //     console.log("cnt");
	//           //     callback1(); 
	//           //   // } else {
	//           //   //   console.log("esle");
	//           //   //   // callback();              
	//           //   }
	//           // });
	//           async.eachSeries(atnData, function(atnDetail,callback){            
	//             // console.log(atnDetail.employeeNo+" " +atnDetail.date);
	//             cnt++;
	//             empList.push({Date:atnDetail.date,EmployeeNo:atnDetail.employeeNo})
	//             // console.log(cnt);
	//             if(cnt==atnData.length) {
	//               Finalresult.push({companyName:dataCompany1.companyId,Employees:empList});
	//               // console.log("cnt");
	//               // if(outerCnt==companies.length) {
	//                 console.log(Finalresult.length);
	//                 res.send("hiii");
	//               // } else 
	//               callback1(); 
	//             } else {
	//               if(outerCnt==companies.length) {
	//                 console.log(Finalresult.length);
	//                 res.send("hiii");
	//               } else 
	//               callback();              
	//             }
								
	//           });
	//         } else {
	//           if(outerCnt==companies.length) {
	//             console.log(Finalresult.length);
	//             res.send("hiii");
	//           } else
	//           callback1();
	//         }          
	//       });

	//     });
	//   }
	// });
	// //   if(companies){
	//     async.eachSeries(companies, function(dataCompany1,callback1){
	//       cnt++;
	//       console.log(dataCompany1._id);
	//       // console.log(dataCompany.companyname);
	//       // companies.forEach(function(dataCompany){        
	//       // db.attendance.find({"companyId":"53ea73fc20bb272a28ccbfeb","employeeNo" : "1","date":{$gte:ISODate('2015-05-26')}}).sort({date : 1})
	//       Attendance.find({companyId:dataCompany1._id,date:{$gte:new Date('2015-05-01')}},{},{sort:{date:-1}},function(err, atnData){
	//         console.log(atnData.length);
	//         async.eachSeries(atnData, function(dataCompany,callback){
	//           console.log(dataCompany.date);
	//           callback1();
	//           callback();

	//           Finalresult.push({companyName:dataCompany1.companyname,Dates:dataCompany.date,employeeNo:dataCompany.employeeNo});
	//           if(cnt==dataCompany1.length) {
	//             // Finalresult.sort();
	//             res.send(Finalresult);
	//           }
	//         });
					// console.log(atnData.length);
					// var counter=0;
					// var employeeNoArr=[];
					// // atnData.forEach(function(antDetail){
					// //   counter++;
					//   employeeNoArr.push({EmployeeNo:antDetail.employeeNo});
					// //   // console.log(antDetail.employeeNo);
					// // });
					// if(counter==atnData.length) {
					//   Finalresult.push({companyName:"53c7c59daa575e646190d127",Employees:employeeNoArr});
						
					//   res.send(Finalresult);
					// }
	//     });
	//       // if(Finalresult.length==companies.length) {
	//       //   res.send(Finalresult);
	//       // }
	//       // res.send(dataCompany.companyname);
	//       // console.log("dataCompany.companyname......"+dataCompany.companyname);
	//     });
	// //   }
	// });
};

/* single company */
exports.deleteDupCompanyData = function(req,res) {
	var counter=0;
	// console.log(new Date(req.params.date));
	Attendance.aggregate([{$match:{companyId:req.params.companyId,date:{$gte:new Date(req.params.date)}}},{$group: {_id: {companyId: "$companyId",employeeNo: "$employeeNo",date:"$date",},count: { "$sum": 1 }}},{$match:{count:{$gt:1}}}],function(err,result){
		// console.log(result.length);
		if(result.length>0) {
			async.eachSeries(result, function(atnData,callback){
				counter++;      
				var dataCompany=atnData._id;
				Attendance.find({companyId:dataCompany.companyId,employeeNo:dataCompany.employeeNo,date:new Date(dataCompany.date)},function(err,data){
					if(data.length>0) {
						var uniqueDetail=[];
						var uniqueDetail1=[];
						var cnt=0;
						var checkin=false;
						async.eachSeries(data, function(detail,callback1){
							cnt++;
							if(detail.checkin.length<=0) {
								uniqueDetail.push(detail._id);
								// uniqueDetail1.push(detail);
							} else {
								if(checkin==false) {
									checkin==true;  
								} else {
									uniqueDetail.push(detail._id);
								}
							}

							if(cnt==data.length) {
								if(uniqueDetail.length==data.length) {
									uniqueDetail.splice(0,1);
									Attendance.remove({_id:{$in:uniqueDetail}},function(err,deleted){
										// console.log(deleted);
										callback1();
									});
								} else {
									Attendance.remove({_id:{$in:uniqueDetail}},function(err,deleted){
										// console.log(err);
										// console.log(deleted);
										callback1();
									});
								}
							} else {
								callback1();
							}              
						});          
					}         
				});
				if(counter==result.length) {
					res.send("Record has beed deleted");
				}
				callback();      
			});
		} else {
			res.send("Record does not exists");
		}
	});  
};

/* all company */
exports.deleteAllDuplicateCompanyData=function(req,res) {
	var counter=0;
	Attendance.aggregate([ { "$group": { "_id": { "companyId": "$companyId", "employeeNo": "$employeeNo", "date":"$date", }, "count": { "$sum": 1 } }}, {"$match":{"count":{"$gt":1}}}, { "$sort": { "count": -1 } } ],function(err,result){
		if(result.length>0) {
			async.eachSeries(result, function(empData,callback){
			 counter++;
				Attendance.find({companyId:empData._id.companyId,employeeNo:empData._id.employeeNo,date:new Date(empData._id.date)},function(err,data){
					if(data.length>0) {
						var uniqueDetail=[];
						var uniqueDetail1=[];
						var cnt=0;
						async.eachSeries(data, function(detail,callback1){
							cnt++;
							if(detail.checkin.length>0) {
								uniqueDetail1.push(detail._id);
							} else {
								uniqueDetail.push(detail._id);
							}
							if(cnt==data.length) {
								if(uniqueDetail1.length>1) {
									var tempArray=[];
									var tempCnt=0;
									Attendance.find({_id:{$in:uniqueDetail1}},function(err,details){
										async.eachSeries(details, function(detail,callback2){
											tempCnt;
											tempArray.push({_id:detail._id,count:detail.checkin.length})
											if(tempCnt==details.length) {
												tempArray.sort(function(a,b) {
														if ( a.count > b.count )
																return -1;
														if ( a.count < b.count )
																return 1;
														return 0;
												});                    
												tempArray.splice(0,1);
												if(tempArray.length==1) {
													var id = tempArray[0]._id;
													Attendance.remove({_id:id},function(err,deleted){});
												} else {
													tempArray.forEach(function(ids){
														Attendance.remove({_id:ids._id},function(err,deleted){});
													});
												}                    
											}
											callback2();
										});
									});
								}
								if(uniqueDetail.length==data.length) {
									uniqueDetail.splice(0,1);
									Attendance.remove({_id:{$in:uniqueDetail}},function(err,deleted){
										callback();
									});
								} else {
									Attendance.remove({_id:{$in:uniqueDetail}},function(err,deleted){
										callback();
									});
								}
							} else {
								callback1();
							}
						});          
					}         
					if(counter==result.length) {
						res.send("Record has beed deleted");
					}
				});
			});
		} else {
			res.send("Record does not exists...");
		}
	});
};

exports.totalTracking = function(req, res){ 
		var checkinDate = '';    

		if(req.params.period.indexOf("d")>-1){
			var days = req.params.period.split('d');
			var checkinDate = Moment.utc().subtract('days',days[0]).format('YYYY-MM-DD');
		}else if(req.params.period.indexOf("w")>-1){
			var days = req.params.period.split('w');
			var checkinDate = Moment.utc().subtract('days',days[0] * 7).format('YYYY-MM-DD');
		}else{
		 var checkinDate = Moment.utc(req.params.period).format('YYYY-MM-DD');
		}
		var currentDate = Moment.utc().format('YYYY-MM-DD');  
		console.log(checkinDate +'--'+currentDate);
		var dataArray = [];
		var i = 0;
		
									Attendance                   
										// .find({'totalValues.total':  { $exists: true}, 'checkin.checkType': { $exists: true} ,"date": { $gte: 'this.date.toJSON().slice(0, 10) == '+checkinDate, $lte: 'this.date.toJSON().slice(0, 10) == '+currentDate}})        
										.find({'totalValues.total':  { $exists: true}, 'checkin.checkType': { $exists: true} ,"date": { $gte: new Date(checkinDate), $lte: new Date(currentDate)}})
										.sort({date:'asc'})
										.exec(function(err, attendanceData) {
										//Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end  }}, function(err, count) {
												if(attendanceData.length >0) {  
													console.log(attendanceData.length);
												var n = 0; 
													attendanceData.forEach(function(dataAtn){    
													 
														var attendanceId = dataAtn._id; 
														var companyId = dataAtn.companyId;
														var empNo = dataAtn.employeeNo;
														var checkins  = dataAtn.checkin;
														var date = Moment.utc(dataAtn.date).format('YYYY-MM-DD'); 
														var shift = dataAtn.shift; 
														var total = dataAtn.total;
														var totalRounded = dataAtn.totalRounded;                             
														var chekinsArray = [];  
														 
														if(checkins.length>0 && dataAtn.totalValues.length>0){
																empFn.totalhoursForTest(attendanceId, companyId, function(result){
																	var gettotalhours = empFn.changeFormat(result[0]);;
																	var gettotalAdjustedHours = result[1];  
																	var companyName = result[2];  
																	console.log(attendanceId);
																	if(total != gettotalhours){
																		dataArray.push({
																				'companyId':companyId,
																				'companyName':companyName,
																				'employeeNo':empNo,
																				'attendanceId':attendanceId,
																				'checkins':checkins,
																				'shift':shift,
																				'total':total,
																				'totalRounded':totalRounded,
																				'gettotalhours':gettotalhours,
																				'gettotalAdjustedHours':gettotalAdjustedHours,
																				'date':date,
																				'status':false
																		})
																	 
																		n++; 
																		if(n == attendanceData.length){
																		 res.json({'dataArray':dataArray});
																		} 
																	}else{
																		n++; 
																	}                               
																															
																	if(n == attendanceData.length){
																		res.json({'dataArray':dataArray});
																	}
																});                                 
														}
													});  
											}else{
												res.json({'data':dataArray});
											}
										});

};

exports.addcompanyname = function(req, res){ 
	Company.find({}, function(err, companies){
				if(companies){
					var i = 0;
					companies.forEach(function(dataCompany){
						i++;
						var companyId = dataCompany._id; 
						var companyName = dataCompany.companyname;
							Attendance.update(
									{'companyId':companyId},                           
									{$set: {   
											companyName:companyName
									}},             
									{upsert: false, new: false, multi:true }, function(err,data){
											if(err) {
												 console.log(err);
											}else{
													console.log('updated');
													if(companies.length == i){
														res.send('company name added');
													}
											}
							}); 
					})
				}
	});
};

exports.changeweeklyfinish = function(req, res){
	WeeklyOT.remove({companyId:'547fa581be29175105427614', weekEnd:'2015-02-21'},function(err){
			if(!err){
					res.send('done');
			}
	})
};


exports.deletecompany = function(req, res) {
    var companyId = req.params.companyId;
    Company.remove({
        _id: companyId
    }, function(err) {
        if (!err) {
            Employee.remove({
                companyId: companyId
            }, function(err) {
                if (!err) {
                    Attendance.remove({
                        companyId: companyId
                    }, function(err) {
                        if (!err) {
                            Customreports.remove({
                                companyId: companyId
                            }, function(err) {
                                if (!err) {
                                    Standardreports.remove({
                                        companyId: companyId
                                    }, function(err) {
                                        if (!err) {
                                            Exception.remove({
                                                companyId: companyId
                                            }, function(err) {
                                                if (!err) {
                                                    Holidays.remove({
                                                        companyId: companyId
                                                    }, function(err) {
                                                        if (!err) {
                                                            Messages.remove({
                                                                companyId: companyId
                                                            }, function(err) {
                                                                if (!err) {
                                                                    LeaveApplication.remove({
                                                                        companyId: companyId
                                                                    }, function(err) {
                                                                        if (!err) {
                                                                            Period.remove({
                                                                                companyId: companyId
                                                                            }, function(err) {
                                                                                if (!err) {
                                                                                    Project.remove({
                                                                                        companyId: companyId
                                                                                    }, function(err) {
                                                                                        if (!err) {
                                                                                            Rule.remove({
                                                                                                companyId: companyId
                                                                                            }, function(err) {
                                                                                                if (!err) {
                                                                                                    Shift.remove({
                                                                                                        companyId: companyId
                                                                                                    }, function(err) {
                                                                                                        if (!err) {
                                                                                                            WeeklyOT.remove({
                                                                                                                companyId: companyId
                                                                                                            }, function(err) {
                                                                                                                if (!err) {
                                                                                                                    dashboard.remove({
                                                                                                                        companyId: companyId
                                                                                                                    }, function(err) {
                                                                                                                        if (!err) {
                                                                                                                            subDashboard.remove({
                                                                                                                                companyId: companyId
                                                                                                                            }, function(err) {
                                                                                                                                if (!err) {
                                                                                                                                    subDeparment.remove({
                                                                                                                                        companyId: companyId
                                                                                                                                    }, function(err) {
                                                                                                                                        if (!err) {
                                                                                                                                            meterDashboard.remove({
                                                                                                                                                companyId: companyId
                                                                                                                                            }, function(err) {
                                                                                                                                                if (!err) {
                                                                                                                                                    subMeterDashboard.remove({
                                                                                                                                                        companyId: companyId
                                                                                                                                                    }, function(err) {
                                                                                                                                                        if (!err) {
                                                                                                                                                            Tasks.remove({
                                                                                                                                                                companyId: companyId
                                                                                                                                                            }, function(err) {
                                                                                                                                                                if (!err) {
                                                                                                                                                                    res.send('delete all data for company ' + companyId);
                                                                                                                                                                }
                                                                                                                                                            });
                                                                                                                                                        }
                                                                                                                                                    });
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                }
                                                                                                                            });
                                                                                                                        }
                                                                                                                    });
                                                                                                                }
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.addPrvon = function(req, res){
	Company.find({}, function(err, companies){
		if(companies){
			var i = 0;
			companies.forEach(function(dataCompany){
				i++;
				var companyId = dataCompany._id;
				var shiftCutoff = dataCompany.shiftCutoff;

				if(shiftCutoff == true){
					Attendance.find({'companyId':companyId}).exec(function(err, data) {
						if(data.length>0){
							data.forEach(function(employeeAttendance){
									var id = employeeAttendance._id;
									var shiftStart = new Date(Date.parse(employeeAttendance.shiftStart)).toUTCString();  
									var shiftFinish =new Date(Date.parse(employeeAttendance.shiftFinish)).toUTCString();
									var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
									var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
									var prvOnShift = employeeAttendance.prvOnShift;

									if(shiftStartDate != shiftFinishDate){
										Attendance.update(
											{'_id': id, 'companyId':companyId },                 
											{$set: { 
													prvOnShift:true                                  
											}},           
											{upsert: false, new: false}, function(err,data){
												if(err) {
													 console.log(err);
												}else{
													console.log('changed prvOnShift');
												}
										});
									}
							})
						}
					});
				}
			});
			}
	});
};

exports.assignColor =  function(req, res){
	var colorArray = ["#F5DEB3","#D2B48C","#FFC0CB","#FAEBD7","#008B8B","#4682B4","#9400D3","#6495ED","#7CFC00","#00FFFF","#E9967A","#7F5A58","#20B2AA","#FFDAB9","#DDA0DD","#BC8F8F", "#E6E6FA", "#BA55D3", "#A9A9A9", "#708090", "#D8BFD8", "#BC8F8F", "#F4A460", "#FFA07A", "#FAFAD2", "#F0E68C"];
	Company.find({}, function(err, companies){
		if(companies){
			var i = 0;
			companies.forEach(function(dataCompany){
				i++;
				var companyId = dataCompany._id;
				Shift.find({'companyId':companyId}).exec(function(err, dataShift) {
					var n = 0;
					dataShift.forEach(function(shift){
						n++;
						var shiftId = shift._id;
						var shiftName = shift.name;
						var index = '';
						if(n>=colorArray.length){
							n = 0;
						}
					var color = colorArray[n];
					Shift.update(
						{'_id': shiftId,'companyId':companyId, name:{$nin:['OPEN','not Working']}},                
						{$set: { 
							color:color
						}},           
						{upsert: false, new: false}, function(err,data){
								if(err){
									console.log(err);
								}else{                  
									Attendance.update(
											{'companyId':companyId, $and: [ { shift: { $nin: ['OPEN','not Working'] } }, { shift: shiftName } ]},                   
											{$set: {   
													shiftColor:color
											}},             
											{upsert: false, new: false, multi:true }, function(err,data){
													if(err) {
														 console.log(err);
													}else{
														console.log('ui');
														Attendance.update(
																{'companyId':companyId, Exception:{$ne:''}, ExceptionAssign:{$ne:''}}, 
																{$set: {   
																		shiftColor:'#F08080',
																}},             
																{upsert: false, new: false, multi:true }, function(err,data){
																		if(err) {
																			 console.log(err);
																		}else{
																			console.log('updated');
																				if(i==companies.length){
																					res.send('updated')
																				}
																		}
														});
													}
									}); 
								}
							})
					});
				});
			});
		}
	});
};


/* track future days for all companies employee*/
exports.newDaysTracking = function(req, res) {
    var todayDate = Moment.utc().format('YYYY-MM-DD');
    var daysGiven = 20;
    var futureDate = Moment.utc().add('days', daysGiven).format('YYYY-MM-DD');
    var dataArray = [];

    //Company Find
    Company.find({}, function(err, companies) {
        if (companies) {
            var cmpCnt = 0;
            async.eachSeries(companies, function(dataCompany, callbackComp) {
                cmpCnt++;
                console.log(dataCompany._id + '----' + cmpCnt + 'name' + dataCompany.companyname);
                //Employee Find
                Employee.find({
                    'companyId': dataCompany._id,
                    active: true
                }).exec(function(err, EmployeeData) {
                    if (EmployeeData.length > 0) {
                        var empCnt = 0;
                        async.eachSeries(EmployeeData, function(emp, callback) {
                            empCnt++;
                            //Attendance Find
                            Attendance.find({
                                'employeeNo': emp.employeeNo,
                                'companyId': dataCompany._id,
                                "date": {
                                    $gte: new Date(todayDate),
                                    $lt: new Date(futureDate)
                                }
                            }, function(err, attendanceData) {
                                if (attendanceData) {
                                    if (attendanceData.length < daysGiven) {
                                        dataArray.push({
                                            'companyId': dataCompany._id,
                                            'companyName': dataCompany.companyname,
                                            'employeeNo': emp.employeeNo,
                                            'firstName': emp.firstName,
                                        });
                                        if (empCnt == EmployeeData.length) {
                                            if (cmpCnt == companies.length)
                                                res.json({
                                                    'dataArray': dataArray
                                                });
                                            else
                                                callbackComp()
                                        } else
                                            callback()
                                    } else {
                                        if (empCnt == EmployeeData.length) {
                                            if (cmpCnt == companies.length)
                                                res.json({
                                                    'dataArray': dataArray
                                                });
                                            else
                                                callbackComp()
                                        } else
                                            callback()
                                    }
                                }
                            });
                        });
                    } else {
                        if (cmpCnt == companies.length)
                            res.json({
                                'dataArray': dataArray
                            });
                        else
                            callbackComp()
                    }
                });
            })
        }
    });
};

/* custome field track */
exports.customNewDaysTracking = function(req, res) {
    var todayDate = Moment.utc().format('YYYY-MM-DD');
    var actualDatePast = Moment.utc().subtract('days', parseInt(req.body.daysPast)).format('YYYY-MM-DD');
    var actualDateFuture = Moment.utc().add('days', parseInt(req.body.daysFuture)).format('YYYY-MM-DD');
    var dataArray = [];
    var fieldName = req.body.field;

    console.log(actualDatePast,actualDateFuture);
    //Check company type
    empFn.checkCompanyRange(req.body.companyId, 'track', function(state) {
        if (!state) {
            res.json({
                'error': 'id'
            });
        } else {
        	// Company Find
            Company.find(state, function(err, companies) {
                if (companies) {
                    var cmpCnt = 0;
                    async.eachSeries(companies, function(dataCompany, callbackComp) {
                        cmpCnt++;
                        console.log(dataCompany._id + '----' + cmpCnt + 'name' + dataCompany.companyname);
                        // Employee Find
                        Employee.find({
                            'companyId': dataCompany._id,
                            'active': true
                        }).exec(function(err, EmployeeData) {
                            if (EmployeeData.length > 0) {
                                var empCnt = 0;
                                async.eachSeries(EmployeeData, function(emp, callback) {
                                    empCnt++;
                                    var customeField = undefined;
                                    if (emp[fieldName] || emp[fieldName] == false) {
                                        customeField = emp[fieldName];
                                    }
                                    console.log("employee " + emp.employeeNo);
                                    Attendance.find({
                                        'employeeNo': emp.employeeNo,
                                        'companyId': dataCompany._id,
                                        "date": {
                                            $lte: new Date(actualDateFuture),
                                            $gte: new Date(actualDatePast)
                                        }
                                    }, function(err, attendanceData) {
                                        if (attendanceData.length > 0 && customeField !== undefined) {
                                            var atnCnt = 0;
                                            var matchFlag = true;
                                            var matchVal = '';
                                            console.log("atn fields ----->");

                                            async.eachSeries(attendanceData, function(atn, callbackAtn) {
                                                atnCnt++;

                                                console.log("employee: %s  attendance: %s", customeField, atn[fieldName]);
                                                if (customeField !== atn[fieldName])
                                                    matchFlag = false;
                                                    
                                                if (atnCnt === attendanceData.length) {
                                                    if (!matchFlag) {
                                                        dataArray.push({
                                                            'companyId': dataCompany._id,
                                                            'companyName': dataCompany.companyname,
                                                            'employeeNo': emp.employeeNo,
                                                            'firstName': emp.firstName,
                                                        });
                                                    }
                                                    if (empCnt == EmployeeData.length) {
                                                        if (cmpCnt == companies.length) {
                                                            res.json({
                                                                'dataArray': dataArray
                                                            });
                                                        } else
                                                            callbackComp()
                                                    } else
                                                        callback()
                                                } else
                                                    callbackAtn();
                                            }); // Attendance each  
                                        } else {
                                            if (empCnt == EmployeeData.length) {
                                                if (cmpCnt == companies.length) {
                                                    res.json({
                                                        'dataArray': dataArray
                                                    });
                                                } else 
                                                    callbackComp()
                                            } else
                                                callback()
                                            
                                        }
                                    });
                                    // }
                                }); //Employee each
                            } else {
                                if (cmpCnt == companies.length) {
                                    res.json({
                                        'dataArray': dataArray
                                    });
                                }else
                                    callbackComp()
                           
                            }
                        }); 
                    }); //Companies each
                }
            });
        }
    });
};

//53ea73fc20bb272a28ccbfeb
exports.applyExccode =  function(req, res){
	Company.find({}, function(err, companies){
		if(companies){
			var i = 0;
			companies.forEach(function(dataCompany){
				i++;
				var companyId = dataCompany._id;
				var cmppayrollCode = dataCompany.payrollCode;
				console.log(cmppayrollCode +'--------------');
				Attendance.update(
						{'companyId':companyId, 'holiday':  true}, 
						{$set: {   
								exceptioncode:cmppayrollCode,
						}},             
						{upsert: false, new: false, multi:true }, function(err,data){
								if(err) {
									 console.log(err);
								}else{
									console.log('updated');
										if(i==companies.length){
											res.send('updated')
										}
								}
				});
			});
		}
	});
};

exports.changePrv =  function(req, res){
	Attendance.find({'companyId':'53deda12ce5b74e7294f6b8a', "date": { $gte: new Date('2015-03-16')}},function(err, attendanceData){
		if(attendanceData.length>0){
				attendanceData.forEach(function(atnData){
					var shiftStart = atnData.shiftStart;
					var shiftFinish = atnData.shiftFinish;
					var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
					var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
					var atnId = atnData._id;
					if(shiftStartDate != shiftFinishDate){
						Attendance.update(
							{'_id': atnId, 'companyId':'53deda12ce5b74e7294f6b8a' }, 
							{$set: {   
									prvOnShift:true,
							}},             
							{upsert: false, new: false}, function(err,data){
									if(err) {
										 console.log(err);
									}else{
											 console.log('updated');         
									}
						});
					}
				});
		}
	});        
};

exports.appHolidayFlag =  function(req, res){
	Attendance.update(
		{'companyId':companyId, 'holiday':  true}, 
		{$set: {   
				totalValues:[],
				allowances:[],
				readFlag:false,                
		}},             
		{upsert: false, new: false, multi:true }, function(err,data){
				if(err) {
					 console.log(err);
				}else{
					console.log('updated');
						
				}
	});
};




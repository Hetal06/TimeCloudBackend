var mysql = require('mysql');
var configDB = require('../../config/config');
var client = mysql.createConnection(configDB.conn_conf);

function handleDisconnect() {
	client.connect(function(err) {
		if (err) {
			console.log("Could not connect to DB" + err);
			client.end();
		} else {
			console.log("Connected to4 " + configDB.conn_conf.database + ' on ' + configDB.conn_conf.host);
		}
	});
	client.on('error', function(err) {
		console.log('db error', err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			client.end();
			handleDisconnect(); // lost due to either server restart, or a
		} else if (err.fatal) {
			console.log('fatal error: ' + err.message);
			client.end();
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

// Mail send according to clock status
function sendClockStatusMail(SN, Alias, email, subject, status, callback) {
	// var subject = 'Offline clock-Timecloud';
	if (status == 'is online') {
		status = ' is <b style="color:green">online</b>';
	} else if (status == 'is offline') {
		status = ' is <b style="color:red">offline</b>';
	}

	// var body = 'Dear Admin,\n' + SN + '(Passcode) clock and Alias ' + Alias + ' '+ status +',\nTimeCloud';
	var body = '<html><body><div>Dear Admin,</div> <br /><div><b>' + SN + '</b> (Passcode) clock and Alias <b>' + Alias + '</b>' + status + ', </div> <br /> <div>TimeCloud </div></body></html>';

	// console.log(body);
	emailfn.send_mail(email, subject, body, function(output) {
		if (!output) {
			console.log('err');
			callback(false);
		} else {
			console.log('Mail sent to ' + email);
			callback(true);
		}
	});
}

// Insert clock if not exist
function clockAdd(clocks, callback) {
	console.log("clockAdd-------------->");
	var SN = clocks.SN;
	var State = clocks.State;
	var Alias = clocks.Alias;
	var LastActivity = Moment(clocks.LastActivity).format();
	var TransTimes = clocks.TransTimes;
	var TZAdj = clocks.TZAdj;
	var OutValue = new Date().toUTCString();
	var In = new Date(LastActivity).toUTCString();
	var ms = Moment(OutValue, "DD/MM/YYYY HH:mm").diff(Moment(In, "DD/MM/YYYY HH:mm"));
	var d = Moment.duration(ms);
	var totalhours = Math.floor(d.asHours()) + Moment.utc(ms).format(":mm:ss");
	var diff = empFn.getSeconds(totalhours);

	IclockMysql.findOne({
		'SN': SN
	}, function(err, iclockData) {
		if (!err) {
			if (iclockData) {
				console.log("clock already created");
				callback(true, diff);
			} else {
				var iclockMysql = new IclockMysql();
				iclockMysql.SN = SN;
				iclockMysql.State = State;
				iclockMysql.LastActivity = LastActivity;
				iclockMysql.TZAdj = TZAdj;
				iclockMysql.TransTimes = TransTimes;
				iclockMysql.Alias = Alias;
				iclockMysql.save();
				console.log("%s saved", SN);
				callback(true, diff);
			}
		} else
			callback(false, diff);
	});
}

// TZ status mail send
function TZChange(clocks, receivers, callback) {
	console.log("TZChange------------>");
	var SN = clocks.SN;
	var Alias = clocks.Alias;
	var LastActivity = Moment(clocks.LastActivity).format();
	var TZAdj = clocks.TZAdj;

	IclockMysql.findOne({
		'SN': SN
	}, {}, {
		sort: {
			'_id': -1
		}
	}, function(err, previousclockData) {
		if (previousclockData) {
			if (previousclockData.TZAdj != TZAdj) {
				if (previousclockData.tzAdjmail == false) {
					var subject = 'Ph1 : TZAdj Changes-Timecloud';
					var mailCnt = 0;
					async.eachSeries(receivers, function(email, callbackMail) {
						mailCnt++;
						sendClockStatusMail(SN, Alias, email, subject, 'TZAdj change', function(status) {
							if (status) {
								if (receivers.length === mailCnt) {
									console.log('Clock mail flag updated');
									IclockMysql.update({
										'SN': SN
									}, {
										$set: {
											'tzAdjmail': true,
											'TZAdj': TZAdj,
											'LastActivity': LastActivity,
										}
									}, {
										upsert: true,
										new: false
									}, function(err, data) {
										if (err) {
											console.log(err);
										} else {
											callback(true);
										}
									});

								} else {
									callbackMail();
								}
							}
						});
					});

				} else {
					IclockMysql.update({
						'SN': SN
					}, {
						$set: {
							tzAdjmail: false
						}
					}, {
						upsert: true,
						new: false
					}, function(err, data) {
						if (err)
							console.log(err);
						else
							callback(true);
					});
				}
			} else
				callback(true);
		} else
			callback(true);
	});
}

handleDisconnect();

var mongoose = require('mongoose'),
	Attendance = mongoose.model('Attendance'),
	Company = mongoose.model('Company'),
	Rule = mongoose.model('Rule'),
	employee = mongoose.model('Employee'),
	Employee = mongoose.model('Employee'),
	Attendance = mongoose.model('Attendance'),
	Shift = mongoose.model('Shifts'),
	dateFormat = require('dateformat'),
	Exception = mongoose.model('Exceptions'),
	Holidays = mongoose.model('Holidays'),
	emailalerts = mongoose.model('emailalerts'),
	AttendanceMysql = mongoose.model('AttendanceMysql'),
	Moment = require('moment-timezone'),
	Cron = mongoose.model('Cron'),
	WeeklyOT = mongoose.model('WeeklyOT'),
	IclockMysql = mongoose.model('IclockMysql'),
	empFn = require('../../functions/employeefn.js'),
	emailfn = require('../../functions/send_mail.js')
var http = require('http');
var async = require('async');


exports.areaCal = function(req, res) {
	Company.find({}).exec(function(err, CompanyData) {
		var n = 0;
		CompanyData.forEach(function(dataCompany) {
			if (dataCompany) {
				n++;
				var inRounding = dataCompany.inRounding;
				var inroundupafter = dataCompany.inroundupafter;
				var outRounding = dataCompany.outRounding;
				var outroundupafter = dataCompany.outroundupafter;
				var companyId = dataCompany._id;
				var shiftCutoff = dataCompany.shiftCutoff;
				var currentDate = Moment.utc().subtract('days', 15).format('YYYY-MM-DD');
				var nextDate = Moment.utc().add('days', 15).format('YYYY-MM-DD');
				Attendance.find({
					'companyId': companyId,
					"date": {
						$gte: currentDate,
						$lte: nextDate
					},
					'areaFlag': false,
					'active': true,
					'areaFinish': {
						$ne: null
					}
				}).limit(100).exec(function(err, data) {
					// console.log("data............"+data.length);
					if (data.length > 0) {
						var arrayFinish = [];
						var calls = [];
						data.forEach(function(employeeAttendance) {
							var date = employeeAttendance.date;
							var employeeNumber = employeeAttendance.employeeNo;
							var atnShiftStart = employeeAttendance.shiftStart;
							var atnShiftFinish = employeeAttendance.shiftFinish;
							// console.log(date +  '---------------' +employeeNumber + '**********'+companyId);
							var limitIn = employeeAttendance.limitIn;
							var limitOut = employeeAttendance.limitOut;
							var id = employeeAttendance._id;
							var shiftStart = new Date(Date.parse(employeeAttendance.shiftStart)).toUTCString();
							var startHour = Moment.utc(shiftStart).format('HH');
							var startMinute = Moment.utc(shiftStart).format('mm');

							var shiftFinish = new Date(Date.parse(employeeAttendance.shiftFinish)).toUTCString();
							var finishHour = Moment.utc(shiftFinish).format('H');
							var finishMinute = Moment.utc(shiftFinish).format('mm');
							var attendanceDate = Moment.utc(employeeAttendance.date).format('YYYY-MM-DD');
							var nextDate = Moment.utc(attendanceDate).add('days', 1).format('YYYY-MM-DD');
							var previousDate = Moment.utc(attendanceDate).subtract('days', 1).format('YYYY-MM-DD');
							//console.log(previousDate + 'previousDate');
							var unix = Moment.utc(attendanceDate).unix();
							var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
							var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
							var prvOnShift = employeeAttendance.prvOnShift;
							var FinishSec = '';
							var totalShiftSec = '';
							if (shiftCutoff == 'true' && atnShiftStart != '' && atnShiftFinish != '' && prvOnShift == 'true') {
								Attendance.update({
									'_id': id
								}, {
									$set: {
										areaFlag: true
									}
								}, {
									upsert: false,
									new: false
								}, function(err, data) {
									if (err) {
										console.log(err);
									} else {
										console.log('not changed');
									}
								});
							} else {
								Attendance.find({
									'companyId': companyId,
									'employeeNo': employeeNumber,
									date: new Date(nextDate)
								}).limit(1).exec(function(err, atnDataRec) {
									if (atnDataRec.length > 0) {
										atnDataRec.forEach(function(atnData) {
											var newaddate = Moment.utc(atnData.date).format('YYYY-MM-DD');
											var newunix = Moment.utc(newaddate).unix();
											var nextStartTime = atnData.shiftStart;
											var nextFinishTime = atnData.shiftFinish;
											var Hour = Moment.utc(nextStartTime).format('H');
											var Minute = Moment.utc(nextStartTime).format('mm');
											var c2 = '';
											var c1 = (newunix + (parseInt(Hour) * 3600));
											var balance = '';
											var prv = '';
											if (shiftStartDate == shiftFinishDate) {
												totalShiftSec = (unix + (parseInt(finishHour) * 3600));
												c2 = totalShiftSec;
												balance = (c1 - c2);
												prv = false;
												//console.log(balance + totalShiftSec + date+ '--------------------------------------->>>>>>>>>>>>>>>>>>>>');
											} else {
												totalShiftSec = (unix + (parseInt(finishHour) + 24) * 3600);
												c2 = totalShiftSec;
												balance = c1 - c2;
												if (shiftCutoff == 'true') {
													prv = true;
												}
											}
											var val = (balance / 2);
											var areaFinish = c2 + val;
											Attendance.update({
												'_id': id
											}, {
												$set: {
													areaFinish: areaFinish,
													areaFlag: true,
												}
											}, {
												upsert: false,
												new: false
											}, function(err, data) {
												if (err) {
													console.log(err);
												} else {
													if (data == 1) {
														areaStart = parseInt(areaFinish) + 1;
														//console.log(areaStart +'areaStart' +employeeAttendance.date);
														Attendance.update({
															'companyId': companyId,
															'employeeNo': employeeNumber,
															date: new Date(newaddate)
														}, {
															$set: {
																areaStart: areaStart,
															}
														}, {
															upsert: false,
															new: false
														}, function(err, data) {
															if (err) {
																console.log(err);
															}
														})
													}
												}
											})
										})
									}
								});
							}
						});
					}
				});
			}
		});
	});
	console.log('3) area calculation done');
}

exports.areaShift = function(req, res) {
	/* This will rearrange the checkins of employees
	according to area start and area finish */
	var adminDetil = [];
	// console.log("areaShift called");
	empFn.calculateCheckin(adminDetil, function(result) {
		if (result == 2) {
			console.log('4) attendance checkins calculation done according to areastart and area finish');
		}
	})
}

exports.createSampleCompanies = function(req, res) {
	/*sample complany 1 -------------------------------------*/
	var company = new Company();
	company.companyname = 'sampleCompany';
	company.firstname = 'sample1';
	company.lastname = 'sample1';
	company.email = 't1@gmail.com'
	company.password = company.generateHash('t1');
	company.country = 'Pacific/Auckland';
	company.isHolidays = true;
	company.holidayStandardHours = '8';
	company.isrounding = true;
	company.inRounding = "15";
	company.inroundupafter = "7";
	company.outRounding = "15";
	company.outroundupafte = "7";
	company.payPeriod = "weekly";
	company.rounding = "in/out";
	company.mobile = "465456465";
	company.phone = "54564561";
	company.save(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var Employee = new employee();
			Employee.email = data.email;
			Employee.companyId = data._id;
			Employee.administrator = true;
			Employee.password = data.password;
			Employee.shift = 'OPEN';
			Employee.employeeNo = 1;
			Employee.firstName = data.firstname;
			Employee.lastName = data.lastname;
			Employee.save(function(err, data) {
				if (err) {
					console.log(err);
				} else {
					if (data.companyId) {
						var year = '2014';
						var countryCode = 'nzl';
						http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + year + '&country=' + countryCode + '&region=', function(result) {
							result.setEncoding('utf8');
							result.on('data', function(newData) {
								//console.log(newData);
								var HolidaysData = JSON.parse(newData);
								req.session.sample1 = data.companyId;
								empFn.saveHolidaysCompany(data.companyId, HolidaysData, function(result) {
									if (result) {
										//var startDate1 = Moment.utc().subtract('days', 30);
										//var endDate1 = Moment.utc().add('days', 30);
										var startDate1 = Moment.utc().format();
										var endDate1 = Moment.utc().add('days', 5);
										empFn.tryToSave(startDate1, endDate1, result, data.companyId, data, false, function(data) {
											if (data == 1) {
												var startTime = new Date();
												startTime.setHours(09, 00, 00);
												var finishTime = new Date();
												finishTime.setHours(17, 00, 00);
												var shift = new Shift();
												shift.companyId = req.session.sample1;
												shift.name = 'OPEN';
												shift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
												shift.startLimit = false;
												shift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
												shift.finishLimit = false;
												shift.breakTime = 00 + ':' + 30 + ':' + 00;
												shift.breakAfter = 04 + ':' + 00 + ':' + 00;
												shift.save(function(err, data) {
													if (data) {
														var startTime = new Date();
														startTime.setHours(09, 00, 00);
														var finishTime = new Date();
														finishTime.setHours(17, 00, 00);
														var dayShift = new Shift();
														dayShift.companyId = req.session.sample1;
														dayShift.name = 'day shift';
														dayShift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
														dayShift.startLimit = false;
														dayShift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
														dayShift.finishLimit = false;
														dayShift.breakTime = 00 + ':' + 30 + ':' + 00;
														dayShift.breakAfter = 04 + ':' + 00 + ':' + 00;
														dayShift.overTime1 = '5';
														dayShift.overTime2 = '5';
														dayShift.save(function(err, data) {
															if (data) {
																var startTime = new Date();
																startTime.setHours(22, 00, 00);
																var finishTime = new Date();
																finishTime.setHours(05, 00, 00);
																var night = new Shift();
																night.companyId = req.session.sample1;
																night.name = 'OverNight shift';
																night.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																night.startLimit = false;
																night.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																night.finishLimit = false;
																night.breakTime = 00 + ':' + 30 + ':' + 00;
																night.breakAfter = 04 + ':' + 00 + ':' + 00;
																night.overTime1 = '5';
																night.overTime2 = '5';
																night.save(function(err, data) {
																	if (data) {
																		var rule = new Rule();
																		rule.companyId = req.session.sample1,
																			rule.name = 'OPEN',
																			rule.noOfDays = 7,
																			rule.days = [{
																				day: 'Sunday',
																				shift: 'OPEN'
																			}, {
																				day: 'Monday',
																				shift: 'OPEN'
																			}, {
																				day: 'Tuesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Wednesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Thursday',
																				shift: 'OPEN'
																			}, {
																				day: 'Friday',
																				shift: 'OPEN'
																			}, {
																				day: 'Saturday',
																				shift: 'OPEN'
																			}]
																		rule.save(function(err, data) {
																			if (data) {
																				var startTime = new Date();
																				startTime.setHours(09, 00, 00);
																				var finishTime = new Date();
																				finishTime.setHours(17, 00, 00);
																				var shiftnew = new Shift();

																				shiftnew.companyId = req.session.sample1;
																				shiftnew.name = 'not Working';
																				shiftnew.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																				shiftnew.startLimit = false;
																				shiftnew.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																				shiftnew.finishLimit = false;
																				shiftnew.breakTime = '';
																				shiftnew.breakAfter = '';
																				shiftnew.save(function(err, newData) {
																					if (newData) {
																						var exception = new Exception()
																						exception.companyId = req.session.sample1;
																						exception.title = 'Sick leave';
																						exception.standardHours = 8;
																						exception.addToStandardHours = true;
																						exception.weeklyOtinclude = true;
																						exception.save(function(err, data) {
																							if (data) {
																								var exception1 = new Exception()
																								exception1.companyId = req.session.sample1;
																								exception1.title = 'Annual leave';
																								exception1.standardHours = 8;
																								exception1.addToStandardHours = true;
																								exception1.weeklyOtinclude = true;
																								exception1.save(function(err, data) {
																									if (data) {
																										console.log('t1 company created ----> email:"t1@gmail.com" and password:t1');
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
							});
						});
					}
				}
			})
		}
	});

	/*sample complany 2-----------------------------------------------*/
	var company2 = new Company();
	company2.companyname = 'sampleCompany2';
	company2.firstname = 'sample2';
	company2.lastname = 'sample2';
	company2.email = 't2@gmail.com'
	company2.password = company2.generateHash('t2');
	company2.country = 'Pacific/Auckland';
	company2.isHolidays = true;
	company2.holidayStandardHours = '8';
	company2.isrounding = true;
	company2.inRounding = "15";
	company2.inroundupafter = "7";
	company2.outRounding = "15";
	company2.outroundupafte = "7";
	company2.payPeriod = "weekly";
	company2.rounding = "in/out";
	company2.isovertime = true;
	company2.overtimePeriod = 'daily';
	company2.overtimeLevel = '1';
	company2.mobile = "465456465";
	company2.phone = "54564561";
	company2.save(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var Employee = new employee();
			Employee.email = data.email;
			Employee.companyId = data._id;
			Employee.administrator = true;
			Employee.password = data.password;
			Employee.shift = 'OPEN';
			Employee.employeeNo = 1;
			Employee.firstName = data.firstname;
			Employee.lastName = data.lastname;
			Employee.save(function(err, data) {
				if (err) {
					console.log(err);
				} else {
					if (data.companyId) {
						var year = '2014';
						var countryCode = 'nzl';
						http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + year + '&country=' + countryCode + '&region=', function(result) {
							result.setEncoding('utf8');
							result.on('data', function(newData) {
								//console.log(newData);
								var HolidaysData = JSON.parse(newData);
								req.session.sample2 = data.companyId;
								empFn.saveHolidaysCompany(data.companyId, HolidaysData, function(result) {
									if (result) {
										//var startDate1 = Moment.utc().subtract('days', 30);
										//var endDate1 = Moment.utc().add('days', 30);
										var startDate1 = Moment.utc().format();
										var endDate1 = Moment.utc().add('days', 5);
										empFn.tryToSave(startDate1, endDate1, result, data.companyId, data, false, function(data) {
											if (data == 1) {
												var startTime = new Date();
												startTime.setHours(09, 00, 00);
												var finishTime = new Date();
												finishTime.setHours(17, 00, 00);
												var shift = new Shift();
												shift.companyId = req.session.sample2;
												shift.name = 'OPEN';
												shift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
												shift.startLimit = false;
												shift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
												shift.finishLimit = false;
												shift.breakTime = 00 + ':' + 30 + ':' + 00;
												shift.breakAfter = 04 + ':' + 00 + ':' + 00;
												shift.save(function(err, data) {
													if (data) {
														var startTime = new Date();
														startTime.setHours(09, 00, 00);
														var finishTime = new Date();
														finishTime.setHours(17, 00, 00);
														var dayShift = new Shift();
														dayShift.companyId = req.session.sample2;
														dayShift.name = 'day shift';
														dayShift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
														dayShift.startLimit = false;
														dayShift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
														dayShift.finishLimit = false;
														dayShift.breakTime = 00 + ':' + 30 + ':' + 00;
														dayShift.breakAfter = 04 + ':' + 00 + ':' + 00;
														dayShift.overTime1 = '5';
														dayShift.overTime2 = '5';
														dayShift.save(function(err, data) {
															if (data) {
																var startTime = new Date();
																startTime.setHours(22, 00, 00);
																var finishTime = new Date();
																finishTime.setHours(05, 00, 00);
																var night = new Shift();
																night.companyId = req.session.sample2;
																night.name = 'OverNight shift';
																night.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																night.startLimit = false;
																night.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																night.finishLimit = false;
																night.breakTime = 00 + ':' + 30 + ':' + 00;
																night.breakAfter = 04 + ':' + 00 + ':' + 00;
																night.overTime1 = '5';
																night.overTime2 = '5';
																night.save(function(err, data) {
																	if (data) {
																		var rule = new Rule();
																		rule.companyId = req.session.sample2,
																			rule.name = 'OPEN',
																			rule.noOfDays = 7,
																			rule.days = [{
																				day: 'Sunday',
																				shift: 'OPEN'
																			}, {
																				day: 'Monday',
																				shift: 'OPEN'
																			}, {
																				day: 'Tuesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Wednesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Thursday',
																				shift: 'OPEN'
																			}, {
																				day: 'Friday',
																				shift: 'OPEN'
																			}, {
																				day: 'Saturday',
																				shift: 'OPEN'
																			}]
																		rule.save(function(err, data) {
																			if (data) {
																				var startTime = new Date();
																				startTime.setHours(09, 00, 00);
																				var finishTime = new Date();
																				finishTime.setHours(17, 00, 00);
																				var shiftnew = new Shift();

																				shiftnew.companyId = req.session.sample2;
																				shiftnew.name = 'not Working';
																				shiftnew.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																				shiftnew.startLimit = false;
																				shiftnew.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																				shiftnew.finishLimit = false;
																				shiftnew.breakTime = '';
																				shiftnew.breakAfter = '';
																				shiftnew.save(function(err, newData) {
																					if (newData) {
																						var exception = new Exception()
																						exception.companyId = req.session.sample2;
																						exception.title = 'Sick leave';
																						exception.standardHours = 8;
																						exception.addToStandardHours = true;
																						exception.weeklyOtinclude = true;
																						exception.save(function(err, data) {
																							if (data) {
																								var exception1 = new Exception()
																								exception1.companyId = req.session.sample2;
																								exception1.title = 'Annual leave';
																								exception1.standardHours = 8;
																								exception1.addToStandardHours = true;
																								exception1.weeklyOtinclude = true;
																								exception1.save(function(err, data) {
																									if (data) {
																										console.log('t2 company created ----> email:"t2@gmail.com" and password:t2');
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
							});
						});
					}
				}
			})
		}
	});

	/*sample complany 3-----------------------------------------------*/
	var company3 = new Company();
	company3.companyname = 'sampleCompany3';
	company3.firstname = 'sample3';
	company3.lastname = 'sample3';
	company3.email = 't3@gmail.com'
	company3.password = company3.generateHash('t3');
	company3.country = 'Pacific/Auckland';
	company3.isHolidays = true;
	company3.holidayStandardHours = '8';
	company3.isrounding = true;
	company3.inRounding = "15";
	company3.inroundupafter = "7";
	company3.outRounding = "15";
	company3.outroundupafte = "7";
	company3.payPeriod = "weekly";
	company3.rounding = "in/out";
	company3.isovertime = true;
	company3.overtimePeriod = 'daily';
	company3.overtimeLevel = '2';
	company3.mobile = "465456465";
	company3.phone = "54564561";
	company3.save(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var Employee = new employee();
			Employee.email = data.email;
			Employee.companyId = data._id;
			Employee.administrator = true;
			Employee.password = data.password;
			Employee.shift = 'OPEN';
			Employee.employeeNo = 1;
			Employee.firstName = data.firstname;
			Employee.lastName = data.lastname;
			Employee.save(function(err, data) {
				if (err) {
					console.log(err);
				} else {
					if (data.companyId) {
						var year = '2014';
						var countryCode = 'nzl';
						http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + year + '&country=' + countryCode + '&region=', function(result) {
							result.setEncoding('utf8');
							result.on('data', function(newData) {
								//console.log(newData);
								var HolidaysData = JSON.parse(newData);
								req.session.sample3 = data.companyId;
								empFn.saveHolidaysCompany(data.companyId, HolidaysData, function(result) {
									if (result) {
										//var startDate1 = Moment.utc().subtract('days', 30);
										//var endDate1 = Moment.utc().add('days', 30);
										var startDate1 = Moment.utc().format();
										var endDate1 = Moment.utc().add('days', 5);
										empFn.tryToSave(startDate1, endDate1, result, data.companyId, data, false, function(data) {
											if (data == 1) {
												var startTime = new Date();
												startTime.setHours(09, 00, 00);
												var finishTime = new Date();
												finishTime.setHours(17, 00, 00);
												var shift = new Shift();
												shift.companyId = req.session.sample3;
												shift.name = 'OPEN';
												shift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
												shift.startLimit = false;
												shift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
												shift.finishLimit = false;
												shift.breakTime = 00 + ':' + 30 + ':' + 00;
												shift.breakAfter = 04 + ':' + 00 + ':' + 00;
												shift.save(function(err, data) {
													if (data) {
														var startTime = new Date();
														startTime.setHours(09, 00, 00);
														var finishTime = new Date();
														finishTime.setHours(17, 00, 00);
														var dayShift = new Shift();
														dayShift.companyId = req.session.sample3;
														dayShift.name = 'day shift';
														dayShift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
														dayShift.startLimit = false;
														dayShift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
														dayShift.finishLimit = false;
														dayShift.breakTime = 00 + ':' + 30 + ':' + 00;
														dayShift.breakAfter = 04 + ':' + 00 + ':' + 00;
														dayShift.overTime1 = '5';
														dayShift.overTime2 = '5';
														dayShift.save(function(err, data) {
															if (data) {
																var startTime = new Date();
																startTime.setHours(22, 00, 00);
																var finishTime = new Date();
																finishTime.setHours(05, 00, 00);
																var night = new Shift();
																night.companyId = req.session.sample3;
																night.name = 'OverNight shift';
																night.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																night.startLimit = false;
																night.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																night.finishLimit = false;
																night.breakTime = 00 + ':' + 30 + ':' + 00;
																night.breakAfter = 04 + ':' + 00 + ':' + 00;
																night.overTime1 = '5';
																night.overTime2 = '5';
																night.save(function(err, data) {
																	if (data) {
																		var rule = new Rule();
																		rule.companyId = req.session.sample3,
																			rule.name = 'OPEN',
																			rule.noOfDays = 7,
																			rule.days = [{
																				day: 'Sunday',
																				shift: 'OPEN'
																			}, {
																				day: 'Monday',
																				shift: 'OPEN'
																			}, {
																				day: 'Tuesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Wednesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Thursday',
																				shift: 'OPEN'
																			}, {
																				day: 'Friday',
																				shift: 'OPEN'
																			}, {
																				day: 'Saturday',
																				shift: 'OPEN'
																			}]
																		rule.save(function(err, data) {
																			if (data) {
																				var startTime = new Date();
																				startTime.setHours(09, 00, 00);
																				var finishTime = new Date();
																				finishTime.setHours(17, 00, 00);
																				var shiftnew = new Shift();
																				shiftnew.companyId = req.session.sample3;
																				shiftnew.name = 'not Working';
																				shiftnew.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																				shiftnew.startLimit = false;
																				shiftnew.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																				shiftnew.finishLimit = false;
																				shiftnew.breakTime = '';
																				shiftnew.breakAfter = '';
																				shiftnew.save(function(err, newData) {
																					if (newData) {
																						var exception = new Exception()
																						exception.companyId = req.session.sample3;
																						exception.title = 'Sick leave';
																						exception.standardHours = 8;
																						exception.addToStandardHours = true;
																						exception.weeklyOtinclude = true;
																						exception.save(function(err, data) {
																							if (data) {
																								var exception1 = new Exception()
																								exception1.companyId = req.session.sample3;
																								exception1.title = 'Annual leave';
																								exception1.standardHours = 8;
																								exception1.addToStandardHours = true;
																								exception1.weeklyOtinclude = true;
																								exception1.save(function(err, data) {
																									if (data) {
																										console.log('t3 company created ----> email:"t3@gmail.com" and password:t3');
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
							});
						});
					}
				}
			})
		}
	});

	/*sample complany 4-----------------------------------------------*/
	var company4 = new Company();
	company4.companyname = 'sampleCompany4';
	company4.firstname = 'sample4';
	company4.lastname = 'sample4';
	company4.email = 't4@gmail.com'
	company4.password = company4.generateHash('t4');
	company4.country = 'Pacific/Auckland';
	company4.isHolidays = true;
	company4.holidayStandardHours = '8';
	company4.isrounding = true;
	company4.inRounding = "15";
	company4.inroundupafter = "7";
	company4.outRounding = "15";
	company4.outroundupafte = "7";
	company4.payPeriod = "weekly";
	company4.rounding = "in/out";
	company4.isovertime = true;
	company4.overtimePeriod = 'weekly';
	company4.overtimeLevel = '1';
	company4.mobile = "465456465";
	company4.phone = "54564561";
	company4.save(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var Employee = new employee();
			Employee.email = data.email;
			Employee.companyId = data._id;
			Employee.administrator = true;
			Employee.password = data.password;
			Employee.shift = 'OPEN';
			Employee.employeeNo = 1;
			Employee.firstName = data.firstname;
			Employee.lastName = data.lastname;
			Employee.save(function(err, data) {
				if (err) {
					console.log(err);
				} else {
					if (data.companyId) {
						var year = '2014';
						var countryCode = 'nzl';
						http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + year + '&country=' + countryCode + '&region=', function(result) {
							result.setEncoding('utf8');
							result.on('data', function(newData) {
								//console.log(newData);
								var HolidaysData = JSON.parse(newData);
								req.session.sample4 = data.companyId;
								empFn.saveHolidaysCompany(data.companyId, HolidaysData, function(result) {
									if (result) {
										//var startDate1 = Moment.utc().subtract('days', 30);
										//var endDate1 = Moment.utc().add('days', 30);
										var startDate1 = Moment.utc().format();
										var endDate1 = Moment.utc().add('days', 5);
										empFn.tryToSave(startDate1, endDate1, result, data.companyId, data, false, function(data) {
											if (data == 1) {
												var startTime = new Date();
												startTime.setHours(09, 00, 00);
												var finishTime = new Date();
												finishTime.setHours(17, 00, 00);
												var shift = new Shift();
												shift.companyId = req.session.sample4;
												shift.name = 'OPEN';
												shift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
												shift.startLimit = false;
												shift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
												shift.finishLimit = false;
												shift.breakTime = 00 + ':' + 30 + ':' + 00;
												shift.breakAfter = 04 + ':' + 00 + ':' + 00;
												shift.save(function(err, data) {
													if (data) {
														var startTime = new Date();
														startTime.setHours(09, 00, 00);
														var finishTime = new Date();
														finishTime.setHours(17, 00, 00);
														var dayShift = new Shift();
														dayShift.companyId = req.session.sample4;
														dayShift.name = 'day shift';
														dayShift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
														dayShift.startLimit = false;
														dayShift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
														dayShift.finishLimit = false;
														dayShift.breakTime = 00 + ':' + 30 + ':' + 00;
														dayShift.breakAfter = 04 + ':' + 00 + ':' + 00;
														dayShift.overTime1 = '5';
														dayShift.overTime2 = '5';
														dayShift.save(function(err, data) {
															if (data) {
																var startTime = new Date();
																startTime.setHours(22, 00, 00);
																var finishTime = new Date();
																finishTime.setHours(05, 00, 00);
																var night = new Shift();
																night.companyId = req.session.sample4;
																night.name = 'OverNight shift';
																night.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																night.startLimit = false;
																night.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																night.finishLimit = false;
																night.breakTime = 00 + ':' + 30 + ':' + 00;
																night.breakAfter = 04 + ':' + 00 + ':' + 00;
																night.overTime1 = '5';
																night.overTime2 = '5';
																night.save(function(err, data) {
																	if (data) {
																		var rule = new Rule();
																		rule.companyId = req.session.sample4,
																			rule.name = 'OPEN',
																			rule.noOfDays = 7,
																			rule.days = [{
																				day: 'Sunday',
																				shift: 'OPEN'
																			}, {
																				day: 'Monday',
																				shift: 'OPEN'
																			}, {
																				day: 'Tuesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Wednesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Thursday',
																				shift: 'OPEN'
																			}, {
																				day: 'Friday',
																				shift: 'OPEN'
																			}, {
																				day: 'Saturday',
																				shift: 'OPEN'
																			}]
																		rule.save(function(err, data) {
																			if (data) {
																				var startTime = new Date();
																				startTime.setHours(09, 00, 00);
																				var finishTime = new Date();
																				finishTime.setHours(17, 00, 00);
																				var shiftnew = new Shift();

																				shiftnew.companyId = req.session.sample4;
																				shiftnew.name = 'not Working';
																				shiftnew.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																				shiftnew.startLimit = false;
																				shiftnew.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																				shiftnew.finishLimit = false;
																				shiftnew.breakTime = '';
																				shiftnew.breakAfter = '';
																				shiftnew.save(function(err, newData) {
																					if (newData) {
																						var exception = new Exception()
																						exception.companyId = req.session.sample4;
																						exception.title = 'Sick leave';
																						exception.standardHours = 8;
																						exception.addToStandardHours = true;
																						exception.weeklyOtinclude = true;
																						exception.save(function(err, data) {
																							if (data) {
																								var exception1 = new Exception()
																								exception1.companyId = req.session.sample4;
																								exception1.title = 'Annual leave';
																								exception1.standardHours = 8;
																								exception1.addToStandardHours = true;
																								exception1.weeklyOtinclude = true;
																								exception1.save(function(err, data) {
																									if (data) {
																										console.log('t4 company created ----> email:"t4@gmail.com" and password:t4');
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
							});
						});
					}
				}
			})
		}
	});

	/*sample complany 5-----------------------------------------------*/
	var company5 = new Company();
	company5.companyname = 'sampleCompany5';
	company5.firstname = 'sample5';
	company5.lastname = 'sample5';
	company5.email = 't5@gmail.com'
	company5.password = company5.generateHash('t5');
	company5.country = 'Pacific/Auckland';
	company5.isHolidays = true;
	company5.holidayStandardHours = '8';
	company5.isrounding = true;
	company5.inRounding = "15";
	company5.inroundupafter = "7";
	company5.outRounding = "15";
	company5.outroundupafte = "7";
	company5.payPeriod = "weekly";
	company5.rounding = "in/out";
	company5.isovertime = true;
	company5.overtimePeriod = 'weekly';
	company5.overtimeLevel = '2';
	company5.mobile = "465456465";
	company5.phone = "54564561";
	company5.save(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var Employee = new employee();
			Employee.email = data.email;
			Employee.companyId = data._id;
			Employee.administrator = true;
			Employee.password = data.password;
			Employee.shift = 'OPEN';
			Employee.employeeNo = 1;
			Employee.firstName = data.firstname;
			Employee.lastName = data.lastname;
			Employee.save(function(err, data) {
				if (err) {
					console.log(err);
				} else {
					if (data.companyId) {
						var year = '2014';
						var countryCode = 'nzl';
						http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + year + '&country=' + countryCode + '&region=', function(result) {
							result.setEncoding('utf8');
							result.on('data', function(newData) {
								//console.log(newData);
								var HolidaysData = JSON.parse(newData);
								req.session.sample5 = data.companyId;
								empFn.saveHolidaysCompany(data.companyId, HolidaysData, function(result) {
									if (result) {
										//var startDate1 = Moment.utc().subtract('days', 30);
										//var endDate1 = Moment.utc().add('days', 30);
										var startDate1 = Moment.utc().format();
										var endDate1 = Moment.utc().add('days', 5);
										empFn.tryToSave(startDate1, endDate1, result, data.companyId, data, false, function(data) {
											if (data == 1) {
												var startTime = new Date();
												startTime.setHours(09, 00, 00);
												var finishTime = new Date();
												finishTime.setHours(17, 00, 00);
												var shift = new Shift();
												shift.companyId = req.session.sample5;
												shift.name = 'OPEN';
												shift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
												shift.startLimit = false;
												shift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
												shift.finishLimit = false;
												shift.breakTime = 00 + ':' + 30 + ':' + 00;
												shift.breakAfter = 04 + ':' + 00 + ':' + 00;
												shift.save(function(err, data) {
													if (data) {
														var startTime = new Date();
														startTime.setHours(09, 00, 00);
														var finishTime = new Date();
														finishTime.setHours(17, 00, 00);
														var dayShift = new Shift();
														dayShift.companyId = req.session.sample5;
														dayShift.name = 'day shift';
														dayShift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
														dayShift.startLimit = false;
														dayShift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
														dayShift.finishLimit = false;
														dayShift.breakTime = 00 + ':' + 30 + ':' + 00;
														dayShift.breakAfter = 04 + ':' + 00 + ':' + 00;
														dayShift.overTime1 = '5';
														dayShift.overTime2 = '5';
														dayShift.save(function(err, data) {
															if (data) {
																var startTime = new Date();
																startTime.setHours(22, 00, 00);
																var finishTime = new Date();
																finishTime.setHours(05, 00, 00);
																var night = new Shift();
																night.companyId = req.session.sample5;
																night.name = 'OverNight shift';
																night.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																night.startLimit = false;
																night.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																night.finishLimit = false;
																night.breakTime = 00 + ':' + 30 + ':' + 00;
																night.breakAfter = 04 + ':' + 00 + ':' + 00;
																night.overTime1 = '5';
																night.overTime2 = '5';
																night.save(function(err, data) {
																	if (data) {
																		var rule = new Rule();
																		rule.companyId = req.session.sample5,
																			rule.name = 'OPEN',
																			rule.noOfDays = 7,
																			rule.days = [{
																				day: 'Sunday',
																				shift: 'OPEN'
																			}, {
																				day: 'Monday',
																				shift: 'OPEN'
																			}, {
																				day: 'Tuesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Wednesday',
																				shift: 'OPEN'
																			}, {
																				day: 'Thursday',
																				shift: 'OPEN'
																			}, {
																				day: 'Friday',
																				shift: 'OPEN'
																			}, {
																				day: 'Saturday',
																				shift: 'OPEN'
																			}]
																		rule.save(function(err, data) {
																			if (data) {
																				var startTime = new Date();
																				startTime.setHours(09, 00, 00);
																				var finishTime = new Date();
																				finishTime.setHours(17, 00, 00);
																				var shiftnew = new Shift();

																				shiftnew.companyId = req.session.sample5;
																				shiftnew.name = 'not Working';
																				shiftnew.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
																				shiftnew.startLimit = false;
																				shiftnew.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
																				shiftnew.finishLimit = false;
																				shiftnew.breakTime = '';
																				shiftnew.breakAfter = '';
																				shiftnew.save(function(err, newData) {
																					if (newData) {
																						var exception = new Exception()
																						exception.companyId = req.session.sample5;
																						exception.title = 'Sick leave';
																						exception.standardHours = 8;
																						exception.addToStandardHours = true;
																						exception.weeklyOtinclude = true;
																						exception.save(function(err, data) {
																							if (data) {
																								var exception1 = new Exception()
																								exception1.companyId = req.session.sample5;
																								exception1.title = 'Annual leave';
																								exception1.standardHours = 8;
																								exception1.addToStandardHours = true;
																								exception1.weeklyOtinclude = true;
																								exception1.save(function(err, data) {
																									if (data) {
																										console.log('t5 company created ----> email:"t5@gmail.com" and password:t5');
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
							});
						});
					}
				}
			})
		}
	});
	//created all companies and send response
	res.send('sample Companies cteated: --> 1) email:"t1@gmail.com" and password:t1 2) email:"t2@gmail.com" and password:t2   3) email:"t3@gmail.com" and password:t3  4) email:"t4@gmail.com" and password:t4  5) email:"t5@gmail.com" and password:t5');
}

/*
 * This will read clock data from mysql table and write into iclock mysql collection
 * Check comming checkins lastActivity > 120 , it will send and email to superAdmin and company admin and set passcode is notactive
 * It will also check tzadjusted of sn if previous tzAdjs and comming tzAdj not equal it will send mail to super Aamin
 */
exports.readClockData = function(req, res) {
	// MYsql : iclock
	// var receivers = ['mrugankdhimmar@jacksolutions.biz', 'harishmahajan@jacksolutions.biz'];
	var receivers = ['barnie@timecloud.co.nz', 'barnie@tme.co.nz'];

	client.query("SELECT t1.* FROM iclock t1  JOIN (SELECT SN, MAX(LastActivity) LastActivity FROM iclock GROUP BY SN) t2 ON t1.SN = t2.SN AND t1.LastActivity = t2.LastActivity", function(err, iclockDatas) {
		console.log(iclockDatas.length);
		if (iclockDatas.length > 0 && !err) {
			var clockCnt = 0;
			async.eachSeries(iclockDatas, function(clocks, callback) {
				var SN = clocks.SN;
				var Alias = clocks.Alias;
				var LastActivity = Moment(clocks.LastActivity).format();
				var TZAdj = clocks.TZAdj;
				clockAdd(clocks, function(resp, diff) {
					clockCnt++;
					if (resp) {
						// Find SN
						Company.findOne({
							'passcode.no': SN
						}, function(err, data) {
							if (data) {
								if (diff > 7200) { // 120 min
									console.log('Clock %s down for more than 120 min', SN);
									// console.log('Mail will be send to SuperAdmin as well CompanyAdmin');

									Company.update({
										'passcode.no': SN
									}, {
										$set: {
											'passcode.$.clockNotctive': true,
										}
									}, {
										upsert: true,
										new: false
									}, function(err, data) {
										if (err) {
											console.log(err);
										}
									});

									IclockMysql.findOne({
										'SN': SN
									}, function(err, iclockData) {
										if (iclockData) {
											if (iclockData.emailflag == false) {
												console.log('send mail for SN');
												// console.log('---------------'+iclockData +'data------------------');
												Employee.find({
													'companyId': data._id,
													'administrator': true
												}, function(err, employeeData) {
													if (employeeData) {
														// employeeData.forEach(function(dateEmp) {
														//     var email = dateEmp.email;
														//     console.log('email---------' + email);
														//     var subject = 'Offline clock-Timecloud';
														//     var body = 'Dear Admin,\n' + SN + '(Passcode)clock and Alias ' + Alias + 'is offline,\nTimeCloud';
														//     emailfn.send_mail('barnie@tme.co.nz', subject, body, function(output) {
														//         if (output == false) {
														//             console.log('err');
														//         } else {
														//             console.log('mail sent');
														//         }
														//     });
														// });
														var mailCnt = 0;
														async.eachSeries(receivers, function(email, callbackMail) {
															mailCnt++;
															sendClockStatusMail(SN, Alias, email, 'Ph1 : Offline clock-Timecloud', 'is offline', function(status) {
																if (status) {
																	if (receivers.length === mailCnt) {
																		IclockMysql.update({
																			'SN': SN
																		}, {
																			$set: {
																				'emailflag': true,
																				'LastActivity': LastActivity,
																			}
																		}, {
																			upsert: true,
																			new: false
																		}, function(err, data) {
																			if (err) {
																				console.log(err);
																			} else {
																				console.log('Clock mail flag updated');
																				if (iclockDatas.length === clockCnt)
																					console.log('8) Read and Write successfully done to iclockMysqlData');
																				else {
																					console.log("%d mail send offline", clockCnt);
																					TZChange(clocks, receivers, function(status) {
																						if (status)
																							callback();
																					});
																				}
																			}
																		});
																	} else {
																		callbackMail();
																	}
																} else {
																	console.log("Mail sending failed");
																	if (receivers.length === mailCnt) {
																		if (iclockDatas.length === clockCnt) {
																			console.log('8) Read and Write successfully done to iclockMysqlData');
																		} else {
																			TZChange(clocks, receivers, function(status) {
																				if (status)
																					callback();
																			});
																		}
																	} else {
																		callbackMail();
																	}
																}
															});
														});
													} else {
														if (iclockDatas.length === clockCnt)
															console.log('8) Read and Write successfully done to iclockMysqlData');
														else {
															console.log("%d no emp data", clockCnt);
															TZChange(clocks, receivers, function(status) {
																if (status)
																	callback();
															});
														}
													}
												});
											} else {
												if (iclockDatas.length === clockCnt)
													console.log('8) Read and Write successfully done to iclockMysqlData');
												else {
													console.log("%d Mail already sended", clockCnt);
													TZChange(clocks, receivers, function(status) {
														if (status)
															callback();
													});
												}
											}
										}
									});
								} else {
									if (data.passcode.length > 0) {
										var passcodeCnt = 0;
										async.eachSeries(data.passcode, function(passcode, callbackPasscode) {
											passcodeCnt++;
											if (passcode.clockNotctive) {
												Company.update({
													'passcode.no': SN
												}, {
													$set: {
														'passcode.$.clockNotctive': false,
													}
												}, {
													upsert: true,
													new: false
												}, function(err, data) {
													if (err) {
														console.log(err);
													}
												});

												IclockMysql.findOne({
													'SN': SN
												}, function(err, iclockData) {
													if (iclockData) {
														// console.log("mail Flag " + iclockData.emailflag);
														if (iclockData.emailflag) {
															// Send when clock UP
															var mailCnt = 0;
															async.eachSeries(receivers, function(email, callbackMail) {
																mailCnt++;
																sendClockStatusMail(SN, Alias, email, 'Ph1 : Online clock-Timecloud', 'is online', function(status) {
																	if (status) {
																		if (receivers.length === mailCnt) {
																			IclockMysql.update({
																				'SN': SN
																			}, {
																				$set: {
																					'emailflag': false,
																					'LastActivity': LastActivity,
																				}
																			}, {
																				upsert: true,
																				new: false
																			}, function(err, data) {
																				if (err) {
																					console.log(err);
																				} else {
																					console.log('Clock mail flag updated');
																					if (passcodeCnt === data.passcode.length) {
																						console.log("Passcode activated");
																						if (iclockDatas.length === clockCnt)
																							console.log('8) Read and Write successfully done to iclockMysqlData');
																						else {
																							console.log("%d mail send online", clockCnt);
																							TZChange(clocks, receivers, function(status) {
																								if (status)
																									callback();
																							});
																						}
																					} else
																						callbackPasscode();
																				}
																			});
																		} else {
																			callbackMail();
																		}
																	} else {
																		console.log("Mail sending failed");
																		if (receivers.length === mailCnt) {
																			if (passcodeCnt === data.passcode.length) {
																				console.log("Passcode not activated");
																				if (iclockDatas.length === clockCnt)
																					console.log('8) Read and Write successfully done to iclockMysqlData');
																				else {
																					console.log("%d mail send failed", clockCnt);
																					TZChange(clocks, receivers, function(status) {
																						if (status)
																							callback();
																					});
																				}
																			} else
																				callbackPasscode();
																		} else {
																			callbackMail();
																		}
																	}
																});
															});
														} else {
															if (passcodeCnt === data.passcode.length) {
																console.log("Passcode checked done");
																if (iclockDatas.length === clockCnt)
																	console.log('8) Read and Write successfully done to iclockMysqlData');
																else {
																	console.log("%d mail already sended", clockCnt);
																	TZChange(clocks, receivers, function(status) {
																		if (status)
																			callback();
																	});
																}
															} else
																callbackPasscode();
														}
													}
												});
											} else {
												if (passcodeCnt === data.passcode.length) {
													// console.log("Passcode checked done");
													if (iclockDatas.length === clockCnt)
														console.log('8) Read and Write successfully done to iclockMysqlData');
													else {
														// console.log("%d ",clockCnt);
														TZChange(clocks, receivers, function(status) {
															if (status)
																callback();
														});
													}
												} else
													callbackPasscode();
											}
										});
									} else {
										if (iclockDatas.length === clockCnt)
											console.log('8) Read and Write successfully done to iclockMysqlData');
										else {
											console.log("%d no passcode", clockCnt);
											TZChange(clocks, receivers, function(status) {
												if (status)
													callback();
											});
										}
									}
								}
								// TZAdj check

							} else {
								if (iclockDatas.length === clockCnt)
									console.log('8) Read and Write successfully done to iclockMysqlData');
								else {
									TZChange(clocks, receivers, function(status) {
										if (status)
											callback();
									});
								}
							}
						});
					}
				});
			});
		} else {
			console.log(err);
			client.end();
			// console.log('fatal error: ' + err.message);
			handleDisconnect();
		}
	});
};






exports.totalTrackingWithAsync = function(req, res) {
	console.log("totalTrackingWithAsync..........");
	var checkinDate = Moment.utc().subtract('days', 2).format('YYYY-MM-DD');
	var currentDate = Moment.utc().format('YYYY-MM-DD');
	Attendance.aggregate({
		$match: {
			"date": {
				$gte: new Date(checkinDate),
				$lte: new Date(currentDate)
			},
			readFlag: true,
			'checkin.checkType': {
				$exists: true
			}
		}
	}, {
		"$group": {
			"_id": {
				"date": "$date",
				"companyId": "$companyId",
				"employeeNo": "$employeeNo",
				"totalValues": "$totalValues.total",
				"total": "$total",
			},
		}
	}, function(err, result) {
		async.eachSeries(result, function(doc, callback) {
			var totals = 0;
			doc._id.totalValues.forEach(function(totalVal) {
				totals += empFn.toSeconds(totalVal);
			})
			if (totals != empFn.toSeconds(doc._id.total)) {
				var date = Moment.utc(doc._id.date).format('YYYY-MM-DD');
				console.log(doc);
				Attendance.update({
					'companyId': doc._id.companyId,
					'date': doc._id.date,
					'employeeNo': doc._id.employeeNo
				}, {
					$set: {
						totalValues: [],
						allowances: [],
						readFlag: false,
					}
				}, {
					upsert: false,
					new: false,
					multi: true
				}, function(err, data) {
					if (err) {
						console.log(err);
					} else {
						WeeklyOT.update({
							'companyId': doc._id.companyId,
							'employeeNo': doc._id.employeeNo,
							weekEnd: {
								$gte: date
							},
							weekStart: {
								$lte: date
							}
						}, {
							$set: {
								readflag: true
							}
						}, {
							upsert: false,
							new: false,
							multi: true
						}, function(err, data) {
							if (!err) {
								callback();
							}
						});
					}
				});
			} else {
				callback();
			}
		});
	})
	console.log('11) check total with attendance and change flag(it will Check total on async so it will not missed any record to scan)');
}

exports.totalTrackingCron = function(req, res) {
	var checkinDate = Moment.utc().subtract('days', 2).format('YYYY-MM-DD');
	var currentDate = Moment.utc().format('YYYY-MM-DD');
	Attendance.find({
			"date": {
				$gte: new Date(checkinDate),
				$lte: new Date(currentDate)
			},
			readFlag: true,
			'totalValues.total': {
				$exists: true
			},
			'checkin.checkType': {
				$exists: true
			}
		})
		.exec(function(err, attendanceData) {
			if (attendanceData.length > 0) {
				attendanceData.forEach(function(dataAtn) {
					var attendanceId = dataAtn._id;
					var companyId = dataAtn.companyId;
					var empNo = dataAtn.employeeNo;
					var checkins = dataAtn.checkin;
					var date = Moment.utc(dataAtn.date).format('YYYY-MM-DD');
					var shift = dataAtn.shift;
					var total = dataAtn.total;
					var totalRounded = dataAtn.totalRounded;
					var chekinsArray = [];
					if (checkins.length > 0 && dataAtn.totalValues.length > 0) {
						empFn.totalhoursForTest(attendanceId, companyId, function(result) {
							var gettotalhours = empFn.changeFormat(result[0]);;
							var gettotalAdjustedHours = result[1];
							var companyName = result[2];
							console.log(attendanceId);
							if (total != gettotalhours) {
								Attendance.update({
									'companyId': companyId,
									'_id': attendanceId
								}, {
									$set: {
										// total : "00:00:00",
										// totalRounded : "00:00:00",
										totalValues: [],
										allowances: [],
										readFlag: false,
									}
								}, {
									upsert: false,
									new: false,
									multi: true
								}, function(err, data) {
									if (err) {
										console.log(err);
									} else {
										WeeklyOT.update({
											'companyId': companyId,
											'employeeNo': empNo,
											weekEnd: {
												$gte: date
											},
											weekStart: {
												$lte: date
											}
										}, {
											$set: {
												readflag: true
											}
										}, {
											upsert: false,
											new: false,
											multi: true
										}, function(err, data) {
											if (err) {
												console.log(err);
											}
										});
										// WeeklyOT.find({'companyId':companyId, 'employeeNo':empNo,  weekEnd: { $gte: date },weekStart:{ $lte: date }}, function(err, weekData){
										//     if(err){
										//         console.log(err);
										//     }else{
										//         weekData.forEach(function(data){
										//             var id = data._id;
										//             WeeklyOT.update(
										//                 {'_id': id},
										//                 {$set: {
										//                     readflag:true
										//                 }},
										//                 {upsert: false, new: false}, function(err,data){
										//                     if(err) {
										//                        console.log(err);
										//                     }
										//             });
										//         });
										//     }
										// })
									}
								});
							}
						});
					}
				});
			}
		});
	console.log('9) check total with attendance and change flag');
}

exports.totalRoundedTracking = function(req, res) {
	var checkinDate = Moment.utc().subtract('days', 2).format('YYYY-MM-DD');
	var currentDate = Moment.utc().format('YYYY-MM-DD');
	Attendance.update({
		"date": {
			$gte: new Date(checkinDate),
			$lte: new Date(currentDate)
		},
		readFlag: true,
		'totalValues.total': {
			$exists: false
		},
		'checkin.checkType': {
			$exists: true
		}
	}, {
		$set: {
			readFlag: false,
			calFlag: false,
		}
	}, {
		upsert: false,
		new: false,
		multi: true
	}, function(err, atnUpdate) {

	});
	Attendance.update({
		"date": {
			$gte: new Date(checkinDate),
			$lte: new Date(currentDate)
		},
		readFlag: true,
		"totalRounded": "00:00:00",
		'checkin.checkType': {
			$exists: true
		}
	}, {
		$set: {
			readFlag: false,
			calFlag: false,
		}
	}, {
		upsert: false,
		new: false,
		multi: true
	}, function(err, atnUpdate) {

	});
	console.log('10) check totalRounded if 00:00:00');
}

exports.checkweeklyTotal = function(req, res) {
	var payperiodFn = function(currentDate1, startD, endD, callback) {
		/* console.log(currentDate1 + 'currentDate');
		console.log(startD+'startD');
		console.log(endD + 'endD');*/
		var newstartD = startD;
		var newendD = endD;
		while (startD <= endD) {
			if (startD == endD) {
				var startD = endD;
				var endD = Moment.utc(endD).add('days', 13).format('YYYY-MM-DD');
				newstartD = startD;
				newendD = endD;
			} else if (currentDate1 == startD) {
				var data = {
					'start': newstartD,
					'end': newendD,
					'status': 1
				}
				callback(data);
				break;
			} else {
				startD = Moment.utc(startD).add('days', 1).format('YYYY-MM-DD');
			}
		}
	}
	var datec = Moment.utc().subtract('days', 14).format('YYYY-MM-DD');
	/* this will calculate weeklyOT of the current week of each employee with shiftCutoff */
	WeeklyOT.find({
		weekStart: {
			$gte: datec
		}
	}, function(err, overtimeData) {
		overtimeData.forEach(function(ot) {
			var weekStart = ot.weekStart;
			var weekEnd = ot.weekEnd;
			var companyId = ot.companyId;
			var employeeNo = ot.employeeNo;
			Attendance.count({
				'companyId': companyId,
				'employeeNo': employeeNo,
				"date": {
					$gte: new Date(weekStart),
					$lt: new Date(weekEnd)
				},
				total: {
					$ne: '00:00:00'
				}
			}).exec(function(err, resultCnt) {
				Attendance.count({
					'companyId': companyId,
					'employeeNo': employeeNo,
					"date": {
						$gte: new Date(weekStart),
						$lt: new Date(weekEnd)
					},
					'readFlag': true,
					total: {
						$ne: '00:00:00'
					}
				}).exec(function(err, resultCnt1) {
					if (resultCnt1 == resultCnt) {
						console.log(companyId + 'companyId');
						Company.findOne({
							'_id': companyId
						}, function(err, dataCompany) {
							// var companyId = dataCompany._id;
							var overtimePeriod = dataCompany.overtimePeriod;
							var overtimeLevel = dataCompany.overtimeLevel;
							var weeklyNT = dataCompany.weeklyNT;
							var weeklyOT1 = dataCompany.weeklyOT1;
							var shiftCutoff = dataCompany.shiftCutoff;
							var shiftCutoffPeriod = dataCompany.shiftCutoffPeriod;
							//console.log(companyId + employeeNo);
							var readData = "";
							Attendance.find({
								'companyId': companyId,
								'employeeNo': employeeNo,
								"date": {
									$gte: new Date(weekStart),
									$lt: new Date(weekEnd)
								}
							}).sort({
								'date': 'asc'
							}).exec(function(err, attendanceData) {
								var ot1Total = 0;
								var ot2Total = 0;
								var otTotal = 0;
								var NTTotal = 0;
								var normalTimeTotal = 0;
								var cutExceptionTotal = 0;
								var addweeklyexcTotal = 0;
								if (attendanceData) {
									var dataRead = 0;
									attendanceData.forEach(function(attendance) {
										dataRead++;
										var attendanceId = attendance._id;
										if (overtimePeriod == "weekly") {
											var NT = '';
											if (attendance.normalTime) {
												if (attendance.addweeklyexc) {
													addweeklyexc = attendance.addweeklyexc;
													addweeklyexcTotal += empFn.getSeconds(addweeklyexc);
													NT = '00:00:00';
												} else {
													NT = attendance.normalTime;
												}
											} else {
												NT = '00:00:00';
											}
											normalTimeTotal += empFn.getSeconds(NT);
										} else {
											var ot1 = '';
											if (attendance.ot1Rule) {
												ot1 = attendance.ot1Rule;
											} else {
												ot1 = '00:00:00';
											}
											var ot2 = '';
											if (attendance.ot2Rule) {
												ot2 = attendance.ot2Rule;
											} else {
												ot2 = '00:00:00';
											}
											var NT = '';
											if (attendance.normalTime) {
												NT = attendance.normalTime;
											} else {
												NT = '00:00:00';
											}
											ot1Total += empFn.getSeconds(ot1);
											ot2Total += empFn.getSeconds(ot2);
											NTTotal += empFn.getSeconds(NT);
											var total = empFn.getSeconds(ot1) + empFn.getSeconds(ot2) + empFn.getSeconds(NT);
											otTotal += total;
										}
										var cutException = '';
										if (attendance.cutException) {
											cutException = attendance.cutException;
										} else {
											cutException = '00:00:00';
										}
										cutExceptionTotal += empFn.getSeconds(cutException);
										if (dataRead == attendanceData.length) {
											if (overtimePeriod == "weekly") {
												var time = normalTimeTotal;
												var timeWeekly = empFn.getSeconds(weeklyNT);
												var totalSeconds = '';
												var OT1 = '';
												var OT2 = '';
												var normalTime = '';
												if (time > timeWeekly && weeklyNT != '00:00:00') {
													normalTime = weeklyNT;
													totalSeconds = time - timeWeekly;
													if (totalSeconds > empFn.getSeconds(weeklyOT1)) {
														OT1 = weeklyOT1;
														var remaigntime = totalSeconds - empFn.getSeconds(weeklyOT1);
														OT2 = empFn.secToFormatted(remaigntime);
													} else {
														OT1 = empFn.secToFormatted(totalSeconds);
														OT2 = '';
													}
												} else {
													normalTime = empFn.secToFormatted(normalTimeTotal);
												}
												if (normalTime == '') {
													normalTime = '00:00:00';
												}
												if (OT1 == '') {
													OT1 = '00:00:00';
												}
												if (OT2 == '') {
													OT2 = '00:00:00';
												}
												ot1Total += empFn.getSeconds(OT1);
												ot2Total += empFn.getSeconds(OT2);
												NTTotal += empFn.getSeconds(normalTime);
												NTTotal = NTTotal - cutExceptionTotal;
												var nT = empFn.getSeconds(normalTime) - cutExceptionTotal;
												var total = empFn.getSeconds(OT1) + empFn.getSeconds(OT2) + nT;
												otTotal += total;
											}
											var n = empFn.secToFormatted(otTotal);
											//console.log(n +'otTotal' + employeeNo);
											NTTotal = NTTotal + addweeklyexcTotal;
											otTotal = otTotal + addweeklyexcTotal;
											// console.log('----------------'+employeeNo+ '**********' +companyId);
											WeeklyOT.findOne({
												'companyId': companyId,
												'employeeNo': employeeNo,
												'weekStart': weekStart,
												'weekEnd': weekEnd
											}, function(err, weekData) {
												if (err) {
													console.log(err);
												} else {
													if (weekData) {
														var weekId = weekData._id;
														var ntT = weekData.weeklyNT;
														var otT = weekData.totalOT;
														var ot1T = weekData.weeklyOT1;
														var ot2T = weekData.weeklyOT2;
														var ntTFormat = empFn.secToFormatted(NTTotal);
														var otTFormat = empFn.secToFormatted(otTotal);
														var ot1TFormat = empFn.secToFormatted(ot1Total);
														var ot2TFormat = empFn.secToFormatted(ot2Total);
														if (ntTFormat != ntT || otTFormat != otT || ot1TFormat != ot1T || ot2TFormat != ot2T) {
															WeeklyOT.update({
																'_id': weekId
															}, {
																$set: {
																	readflag: true
																}
															}, {
																upsert: false,
																new: false
															}, function(err, data) {
																if (err) {
																	console.log(err);
																}
															});
														}
													}
												}
											});
										}
									});
								}
							});
						});
					}
				});
			});
		});
	});
	console.log('10) calculate total of week and change flag for weeklyot collections');
}

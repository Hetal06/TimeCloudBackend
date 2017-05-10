var mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    Employee = mongoose.model('Employee'),
    Exception = mongoose.model('Exceptions'),
    Attendance = mongoose.model('Attendance'),
    WeeklyOT = mongoose.model('WeeklyOT'),
    Period = mongoose.model('Period'),
    Project = mongoose.model('Project'),
    Moment = require('moment-timezone'),
    Dashboard = mongoose.model('Dashboard'),
    request = require('request'),
    SuperAdmin = mongoose.model('SuperAdmin'),
    Shift = mongoose.model('Shifts'),
    customShifts = mongoose.model('customShifts'),
    scheduling = mongoose.model('scheduling'),
    AttendanceMysql = mongoose.model('AttendanceMysql'),
    empFn = require('../../functions/employeefn.js'),
    jwtauth = require('../../jwtauth.js'),
    jwt = require('jsonwebtoken'),
    configDB = require('../../config/config');

var nodeExcel = require('excel-export');
var xml = "././public/xml/styles.xml";
var async = require('async');
require('mongoose-pagination');

exports.deleteHoliDaysForAll = function(req, res) {
    var weekStart = Moment.utc(req.body.fromDate).format('YYYY-MM-DD');
    var weekEnd = Moment.utc(req.body.toDate).format('YYYY-MM-DD');

    empFn.setDashboardFlagSingle(req.body.fromDate, req.body.toDate, req.session.user, function(status) {
        if (status) {
            console.log("Dashboard " + status);
            empFn.setMeterDashboardFlag(req.body.fromDate, req.body.toDate, req.session.user, function(meterStatus) {
                if (meterStatus) {
                    console.log("Meter Dashboard " + status);
                    res.json(true);
                }
            });
        }
    });

    // Dashboard.update({
    //     'companyId': req.session.user,
    //     'weekStart': weekStart,
    //     'weekEnd': weekEnd
    // }, {
    //     $set: {
    //         calfalg: false
    //     }
    // }, {
    //     upsert: false,
    //     new: false
    // }, function(err, data) {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    WeeklyOT.update({
        'companyId': req.session.user,
        'weekStart': weekStart,
        'weekEnd': weekEnd
    }, {
        $set: {
            readflag: false,
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
    var dates = Moment(req.body.date).format("YYYY-MM-DD");
    Attendance.update({
        companyId: req.session.user,
        date: new Date(dates)
    }, {
        $set: {
            holiday: false,
            dayinLieu: '00:00:00',
            Exception: '',
            ot1Rule: '00:00:00',
            normalTime: '00:00:00',
            totalRounded: '00:00:00',
            calFlag: false,
            areaFlag: false,
            readFlag: false
        }
    }, {
        upsert: false,
        new: false,
        multi: true
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(true);
        }
    });
}

exports.deleteHolidayOfEmployee = function(req, res) {
    var weekStart = Moment.utc(req.body.from).format('YYYY-MM-DD');
    var weekEnd = Moment.utc(req.body.to).format('YYYY-MM-DD');
    // Dashboard.update({
    //     'companyId': req.session.user,
    //     'weekStart': weekStart,
    //     'weekEnd': weekEnd
    // }, {
    //     $set: {
    //         calfalg: false
    //     }
    // }, {
    //     upsert: false,
    //     new: false
    // }, function(err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {}
    // });
    empFn.setDashboardFlagSingle(req.body.from, req.body.to, req.session.user, function(status) {
        if (status) {
            console.log("Dashboard " + status);
            empFn.setMeterDashboardFlag(req.body.fromDate, req.body.toDate, req.session.user, function(meterStatus) {
                if (meterStatus) {
                    console.log("Meter Dashboard " + meterStatus);
                    res.json(true);
                }
            });
        }
    });
    WeeklyOT.update({
        'companyId': req.session.user,
        'employeeNo': req.body.employeeNo,
        'weekStart': weekStart,
        'weekEnd': weekEnd
    }, {
        $set: {
            readflag: false,
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        }
    });
    Attendance.update({
        '_id': req.body.atndId
    }, {
        $set: {
            holiday: false,
            dayinLieu: '00:00:00',
            Exception: '',
            ot1Rule: '00:00:00',
            normalTime: '00:00:00',
            totalRounded: '00:00:00',
            calFlag: false,
            areaFlag: false,
            readFlag: false
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            var adminDetil = {
                email: req.session.email,
                userType: req.session.userType
            };
            calculateUpdateAttendance(adminDetil, req.body.atndId, req.session.user, function(result) {
                if (result == 1) {
                    res.json(true);
                }
            });
        }
    });
}
exports.copySchedulingToNextPeriod = function(req, res) {
    var start = Moment.utc(req.body.startDate).format('YYYY-MM-DD');
    var end = Moment.utc(req.body.endDate).format('YYYY-MM-DD');



    Attendance.find({
        companyId: req.session.user,
        date: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
    }, function(err, details) {
        var cnt = 0;
        async.eachSeries(details, function(atnDetail, callback) {
            cnt++;
            var newDate = Moment.utc(atnDetail.date).add(7, 'days').format('YYYY-MM-DD');
            newDate = new Date(newDate);
            var newshiftStart = Moment.utc(atnDetail.shiftStart).add(7, 'days');
            var newshiftFinish = Moment.utc(atnDetail.shiftFinish).add(7, 'days');
            newshiftStart = new Date(newshiftStart);
            newshiftFinish = new Date(newshiftFinish);
            var newAtnDetail = {
                companyId: atnDetail.companyId,
                readWriteForEmployee: atnDetail.readWriteForEmployee,
                notaddexc: atnDetail.notaddexc,
                shiftColor: atnDetail.shiftColor,
                prvOnShift: atnDetail.prvOnShift,
                comment: atnDetail.comment,
                breakIn2: atnDetail.breakIn2,
                breakIn: atnDetail.breakIn,
                allowExport: atnDetail.allowExport,
                exceptioncode: atnDetail.exceptioncode,
                weeklyOtinclude: atnDetail.weeklyOtinclude,
                addToStandardHours: atnDetail.addToStandardHours,
                standardHours: atnDetail.standardHours,
                workflowId: atnDetail.workflowId,
                addWorkflow: atnDetail.addWorkflow,
                allowances: atnDetail.allowances,
                dayinLieu: atnDetail.dayinLieu,
                addweeklyexc: atnDetail.addweeklyexc,
                cutException: atnDetail.cutException,
                addException: atnDetail.addException,

                Exceptiontype: atnDetail.Exceptiontype,
                Exception: atnDetail.Exception,
                ExceptionAssign: atnDetail.ExceptionAssign,

                calFlag: false,
                areaFlag: false,
                readFlag: false,
                lateOut: atnDetail.lateOut,
                lateIn: atnDetail.lateIn,

                // holiday: atnDetail.holiday,
                // managerSignedOff: atnDetail.managerSignedOff,
                flag: atnDetail.flag,
                weeklyOt: atnDetail.weeklyOt,
                ot2Rule: atnDetail.ot2Rule,
                ot1Rule: atnDetail.ot1Rule,
                totalRounded: '00:00:00',
                total: '00:00:00',
                normalTime: '00:00:00',
                breaktaken2: atnDetail.breaktaken2,
                breaktaken: atnDetail.breaktaken,
                breakAfter2: atnDetail.breakAfter2,
                breakAfter: atnDetail.breakAfter,
                breakk: atnDetail.breakk,
                roundDownAfter: atnDetail.roundDownAfter,
                roundupDownOut: atnDetail.roundupDownOut,
                roundInUpAfter: atnDetail.roundInUpAfter,
                roundupDownIn: atnDetail.roundupDownIn,
                round: atnDetail.round,
                limitOut: atnDetail.limitOut,
                limitIn: atnDetail.limitIn,
                shiftFinish: newshiftFinish,
                shiftStart: newshiftStart,
                areaFinish: atnDetail.areaFinish,
                areaStart: atnDetail.areaStart,
                lastShift: atnDetail.lastShift,
                shift: atnDetail.shift,
                date: newDate,
                chargeoutRate: atnDetail.chargeoutRate,
                hourlyRate: atnDetail.hourlyRate,
                active: atnDetail.active,
                subDepartment: atnDetail.subDepartment,
                department: atnDetail.department,
                payrollCode: atnDetail.payrollCode,
                employeeNo: atnDetail.employeeNo,
                PWD: atnDetail.PWD,
                admin: atnDetail.admin,
                email: atnDetail.email,
                lastName: atnDetail.lastName,
                firstName: atnDetail.firstName,
                companyName: atnDetail.companyName,
                shiftType: atnDetail.shiftType,
            };
            Attendance.update({
                date: new Date(newDate),
                employeeNo: atnDetail.employeeNo,
                companyId: req.session.user
            }, {
                $set: newAtnDetail
            }, {
                upsert: false,
                new: false
            }, function(err, atnUpdate) {
                if (cnt == details.length) {
                    // empFn.getShiftData(atnDetail.shift, atnDetail.companyId, function(shDetail) {
                    //  if(shDetail){
                    //      empFn.setallowDelete(atnDetail.companyId, shDetail._id, false, function(cbRes) {
                    //          console.log("scheduling/roster shift flag updated");
                    res.json(true);
                    //  });
                    // }
                    // });
                } else {
                    // empFn.getShiftData(atnDetail.shift, atnDetail.companyId, function(shDetail) {
                    //  if(shDetail){
                    //      empFn.setallowDelete(atnDetail.companyId, shDetail._id, false, function(cbRes) {
                    //          console.log("scheduling/roster shift flag updated");
                    callback();
                    // });
                    //  }
                    // });


                    // var companyId = atnDetail.companyId;
                    // var attendanceId = atnDetail._id;
                    // var shift = atnDetail.shift;
                    // var date = atnDetail.date;
                    // var employeeNo = atnDetail.employeeNo;
                    // empFn.getShiftData(atnDetail.shiftType,shift, companyId, function(result){
                    //  var breakTime = result.breakTime;
                    //  var breakAfter = result.breakAfter;
                    //  var breakIn = result.breakIn;
                    //  var breakAfter2 = result.breakAfter2;
                    //  var breakTime2 = result.breakTime2;
                    //  var breakIn2 = result.breakIn2;

                    //  var shiftStartTime = result.startTime;
                    //  var shiftFinishTime = result.finishTime;

                    //  var nextDate = Moment.utc(date).add('days',1).format();
                    //  var prvDate = Moment.utc(date).subtract('days',1).format('YYYY-MM-DD');
                    //  var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
                    //  var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                    //  var shiftColor = result.color;
                    //  var start = '';
                    //  var finish = '';

                    //  if(shiftStartDate == shiftFinishDate){                                                 //console.log('pppppppppp')
                    //      var sHour = Moment.utc(shiftStartTime).format('HH');
                    //      var sMinute = Moment.utc(shiftStartTime).format('mm');
                    //      var sdate = Moment.utc(date).format('YYYY-MM-DD');
                    //      var Hourset = Moment.utc(sdate).set('hours', sHour);
                    //      start = Moment.utc(Hourset).set('minute', sMinute).format();

                    //      var fHour = Moment.utc(shiftFinishTime).format('HH');
                    //      var fMinute = Moment.utc(shiftFinishTime).format('mm');
                    //      var fdate = Moment.utc(date).format('YYYY-MM-DD');
                    //      var fHourset = Moment.utc(fdate).set('hours', fHour);
                    //      finish = Moment.utc(fHourset).set('minute', fMinute).format();
                    //      }else{
                    //      var sHour = Moment.utc(shiftStartTime).format('HH');
                    //      var sMinute = Moment.utc(shiftStartTime).format('mm');
                    //      var sdate = Moment.utc(date).format('YYYY-MM-DD');
                    //      var Hourset = Moment.utc(sdate).set('hours', sHour);
                    //      start = Moment.utc(Hourset).set('minute', sMinute).format();

                    //      var fHour = Moment.utc(shiftFinishTime).format('HH');
                    //      var fMinute = Moment.utc(shiftFinishTime).format('mm');
                    //      var fdate = Moment.utc(nextDate).format('YYYY-MM-DD');
                    //      var fHourset = Moment.utc(fdate).set('hours', fHour);
                    //      finish = Moment.utc(fHourset).set('minute', fMinute).format();
                    //  }
                    //  var startLimit = result.startLimit;
                    //  var finishLimit = result.finishLimit;
                    //  var blankArray = [];
                    //  var datec = Moment.utc(atnDetail.date).format('YYYY-MM-DD');
                    //  Dashboard.update({ weekEnd: { $gte: datec },weekStart:{ $lte: datec },'companyId':companyId},
                    //      {$set: {
                    //          calfalg:true
                    //      }},{upsert: false, new: false,multi:true}, function(err,data){
                    //          if(err) {
                    //          }
                    //  });
                    //  WeeklyOT.update({ weekEnd: { $gte: datec },weekStart:{ $lte: datec },'employeeNo':employeeNo, 'companyId':companyId},
                    //      {$set: {
                    //          readflag:true
                    //      }},{upsert: false, new: false,multi:true}, function(err,data){
                    //          if(err) {
                    //          }
                    //  });
                    //  Attendance.update({'_id': attendanceId,'companyId':companyId},
                    //      {$set: {
                    //          shift:atnDetail.shift,
                    //          lastShift:atnDetail.shift,
                    //          shiftStart:start,
                    //          shiftFinish:finish,
                    //          limitIn:startLimit,
                    //          limitOut:finishLimit,
                    //          breakk:breakTime,
                    //          breakAfter:breakAfter,
                    //          breakAfter2:breakAfter2,
                    //          breakIn:breakIn,
                    //          breakIn2:breakIn2,
                    //          totalValues:blankArray,
                    //          allowances:blankArray,
                    //          areaFlag:false,
                    //          calFlag:false,
                    //          Exception : '',
                    //          ExceptionAssign :'',
                    //          addException:false,
                    //          standardHours:'',
                    //          addToStandardHours:'',
                    //          cutException:'',
                    //          addweeklyexc:'',
                    //          shiftColor:shiftColor,
                    //          notaddexc:'',
                    //          shiftType:atnDetail.shiftType,
                    //      }},{upsert: false, new: false}, function(err,data){
                    //          if(err) {
                    //              callback();
                    //          }else{
                    //              Attendance.update({date:new Date(prvDate),'companyId':companyId, 'employeeNo':employeeNo},
                    //                  {$set: {
                    //                      totalValues:blankArray,
                    //                      allowances:blankArray,
                    //                      areaFlag:false,
                    //                      calFlag:false
                    //                  }},{upsert: false, new: false}, function(err,data){
                    //                      if(err) {
                    //                           callback();
                    //                      }else{
                    //                          calculateArea(companyId,employeeNo, function(result){
                    //                              if(result == 1){
                    //                                  Attendance.update({'_id': attendanceId,'companyId':companyId},
                    //                                      {$set: {
                    //                                          totalValues:blankArray,
                    //                                          allowances:blankArray,
                    //                                      }},{upsert: false, new: false}, function(err,data){
                    //                                          if(err) {
                    //                                              // console.log(err);
                    //                                          } else {
                    //                                              var adminDetil = {email:req.session.email,userType:req.session.userType};
                    //                                              calculateUpdateAttendance(adminDetil,attendanceId, companyId, function(result){
                    //                                                  if(result == 1){
                    //                                                      callback();
                    //                                                  }
                    //                                              });
                    //                                          }
                    //                                  });
                    //                              }
                    //                          })
                    //                      }
                    //              }) // change for prv
                    //          }
                    //  })
                    // });

                }
            });
        });
    });
}
exports.confirmTimeAddingByAdmin = function(req, res) {
    var attendanceId = req.body.attendanceId;
    var employeeNo = req.body.employeeNo;
    var companyId = req.session.user;
    var checkinDate = Moment.utc(req.body.date).format('YYYY-MM-DD');
    // checkinDate = Moment.utc(checkinDate).format('YYYY-MM-DD');
    WeeklyOT.find({
        weekEnd: {
            $gte: checkinDate
        },
        weekStart: {
            $lte: checkinDate
        },
        'employeeNo': employeeNo,
        'companyId': companyId
    }, function(err, weekData) {
        if (err) {} else {
            weekData.forEach(function(data) {
                var id = data._id;
                WeeklyOT.update({
                    '_id': id
                }, {
                    $set: {
                        readflag: true
                    }
                }, {
                    upsert: false,
                    new: false
                }, function(err, data) {
                    if (err) {
                        // console.log(err);
                    }
                });
            });
        }
    })
    var blankArray = [];
    Employee.find({
        'email': req.session.email,
        'companyId': req.session.user
    }, {}, {
        limit: 1
    }, function(err, companyDatas) {
        if (companyDatas.length > 0) {
            var companyData = companyDatas[0];
            var cnt = 0;
            async.eachSeries(req.body.checkinData, function(checkinDetail, callback) {
                cnt++;
                if (checkinDetail.label == req.body.confirmType) {
                    Attendance.update({
                        'checkin._id': checkinDetail.id,
                        '_id': attendanceId
                    }, {
                        $set: {
                            'checkin.$.alter': true,
                            'checkin.$.alterWho': companyData.employeeNo,
                            totalValues: blankArray,
                            allowances: blankArray,
                        }
                    }, function(err, attendanceData) {
                        // if(req.body.confirmType=="In") {
                        //  if(cnt==req.body.checkinData.length) {
                        //      res.json(true);
                        //  } else {
                        //      callback();
                        //  }
                        // } else {
                        var adminDetil = {
                            email: req.session.email,
                            userType: req.session.userType
                        };
                        calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                            if (result == 1) {
                                if (cnt == req.body.checkinData.length) {
                                    res.json(true);
                                } else {
                                    callback();
                                }
                            }
                        });
                        //}
                    });
                } else {
                    if (cnt == req.body.checkinData.length) {
                        res.json(true);
                    } else {
                        callback();
                    }
                }
            });
        }
    });
}
exports.employeesShiftData = function(req, res) {
    console.log(req.session.user);
    Shift.find({
        companyId: req.session.user
    }, function(err, shiftDetail) {
        console.log(shiftDetail);
        res.json({
            shiftDetail: shiftDetail
        });
    });
}
exports.attendanceExcel = function(req, res) {
    Company.find({}).sort({
        '_id': -1
    }).exec(function(err, dataOfcmp) {
        var n = 0;
        dataOfcmp.forEach(function(data) {
            n++;
            var companyDataArray = [];
            var companyId = data._id;
            var companyName = data.companyname
            var start = Moment.utc().subtract('days', 14).format('YYYY-MM-DD');
            var end = Moment.utc().format('YYYY-MM-DD');
            // Attendance.find({'checkin.exportflag':false,'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lte: 'this.date.toJSON().slice(0, 10) == '+end }}).sort({'date':'-1','employeeNo':'asc'}).exec(function (err, atnData) {
            Attendance.find({
                'checkin.exportflag': false,
                'companyId': companyId,
                "date": {
                    $gte: new Date(start),
                    $lte: new Date(end)
                }
            }).sort({
                'date': '-1',
                'employeeNo': 'asc'
            }).exec(function(err, atnData) {
                if (atnData) {
                    var i = 0;
                    atnData.forEach(function(dataOfempAtn) {
                        i++;
                        var dateOfAtn = Moment.utc(dataOfempAtn.date).format("YYYY-MM-DD");
                        var attendanceId = dataOfempAtn._id;
                        async.waterfall([
                            function(next) {
                                if (dataOfempAtn.checkin.length > 0) {
                                    dataOfempAtn.checkin.sort(empFn.orderByNameAscending);
                                    dataOfempAtn.checkin.forEach(function(itemCheckin) {
                                        var flagForchk = itemCheckin.exportflag;
                                        if (flagForchk == false) {
                                            var cmp = [];
                                            var objectId = itemCheckin._id;
                                            var checkTime = new Date(Date.parse(itemCheckin.checkTime)).toUTCString();
                                            var checkTimeSet = Moment.utc(checkTime).format('YYYY-MM-DD HH:mm');
                                            var checkType = itemCheckin.checkType;
                                            var status = '';
                                            if (checkType == 1 || checkType == 'i' || checkType == 'I') {
                                                status = 'I';
                                            } else {
                                                if (checkType == 2) {
                                                    status = '2';
                                                } else if (checkType == 3) {
                                                    status = '3';
                                                } else {
                                                    status = 'O';
                                                }
                                            }
                                            cmp.push(dataOfempAtn.employeeNo);
                                            cmp.push(checkTimeSet);
                                            cmp.push(status);
                                            companyDataArray.push(cmp);
                                            Attendance.update({
                                                    'checkin._id': objectId,
                                                    '_id': attendanceId,
                                                    'employeeNo': dataOfempAtn.employeeNo,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        'checkin.$.exportflag': true
                                                    }
                                                },
                                                function(err, attendanceData) {
                                                    if (err) {
                                                        //console.log(err);
                                                    } else {
                                                        next(null, companyDataArray)
                                                    }
                                                });
                                        }
                                    })
                                }
                            }
                        ], function(err, companyDataArray) {
                            if (atnData.length == i) {
                                //console.log(companyDataArray);
                                var cmp = companyName.replace(" ", "_");
                                var reportName = cmp + "_" + start + "_to_" + end + ".xlsx"

                                var conf = {};
                                conf.stylesXmlFile = xml;
                                conf.cols = [{
                                    caption: 'employeeNo',
                                    type: 'string',
                                    width: 28.7109375
                                }, {
                                    caption: 'checkin',
                                    type: 'string',
                                    width: 28.7109375
                                }, {
                                    caption: 'checkinType',
                                    type: 'string',
                                    width: 28.7109375
                                }];
                                conf.rows = companyDataArray;
                                var result = nodeExcel.execute(conf);
                                var fs = require('fs');
                                var Excels_path = appRoot + '/excels';
                                fs.writeFile(Excels_path + "/" + reportName, result, 'binary', function(err) {
                                    // if (err) throw err
                                    //console.log('File saved.')
                                })
                            }
                        })
                    });
                }
            });
        });
    })
}

exports.getCompanyEmployee = function(req, res) {
    Employee.find({
        'companyId': req.params.companyId,
        'active': true
    }).sort({
        'employeeNo': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}

exports.employeeList = function(req, res) {
    console.log(req.session.subadmin);
    if (req.session.subadmin) {
        Employee.find({
            'companyId': req.session.user,
            'department': {
                $in: req.session.subadmin
            },
            'active': true
        }).sort({
            'employeeNo': 'asc'
        }).exec(function(err, empData) {
            if (empData) {
                res.json(empData);
            }
        })
    } else {
        Employee.find({
            'companyId': req.session.user,
            'active': true
        }).sort({
            'employeeNo': 'asc'
        }).exec(function(err, empData) {
            if (empData) {
                res.json(empData);
            }
        })
    }
}

exports.employeeDetail = function(req, res) {
    Employee.findOne({
        'companyId': req.session.user,
        employeeNo: req.params.employeeNo,
        'active': true
    }).sort({
        'employeeNo': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}

exports.employeeSearch = function(req, res) {
    var searchText = req.body.searchtext;
    if (isNaN(searchText) == true) {
        var intTxt = "";
    } else {
        var intTxt = Number(searchText);
    }
    if (req.session.subadmin) {
        if (intTxt != '') {
            Employee
                .find({
                    'department': {
                        $in: req.session.subadmin
                    },
                    'companyId': req.session.user,
                    'active': true,
                    $or: [{
                        'firstName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'lastName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'department': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'hourlyRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'chargeoutRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'companyname': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'email': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'employeeNo': intTxt
                    }, {
                        'pin': intTxt
                    }, {
                        'shift': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'payrollCode': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }]
                })
                .sort({
                    'employeeNo': 'asc'
                })
                .exec(function(err, EmployeeData) {
                    if (EmployeeData) {
                        res.json({
                            "EmployeeData": EmployeeData
                        });
                    } else {}
                })
        } else {
            Employee
                .find({
                    'department': {
                        $in: req.session.subadmin
                    },
                    'companyId': req.session.user,
                    'active': true,
                    $or: [{
                        'firstName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'lastName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'department': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'hourlyRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'chargeoutRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'companyname': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'email': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'shift': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'payrollCode': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }]
                })
                .sort({
                    'employeeNo': 'asc'
                })
                .exec(function(err, EmployeeData) {
                    if (EmployeeData) {
                        res.json({
                            "EmployeeData": EmployeeData
                        });
                    } else {}
                })
        }
    } else {
        if (intTxt != '') {
            Employee
                .find({
                    'companyId': req.session.user,
                    'active': true,
                    $or: [{
                        'firstName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'lastName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'department': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'hourlyRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'chargeoutRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'companyname': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'email': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'employeeNo': intTxt
                    }, {
                        'pin': intTxt
                    }, {
                        'shift': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'payrollCode': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }]
                })
                .sort({
                    'employeeNo': 'asc'
                })
                .exec(function(err, EmployeeData) {
                    if (EmployeeData) {
                        res.json({
                            "EmployeeData": EmployeeData
                        });
                    } else {}
                })
        } else {
            Employee
                .find({
                    'companyId': req.session.user,
                    'active': true,
                    $or: [{
                        'firstName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'lastName': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'department': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'hourlyRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'chargeoutRate': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'companyname': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'email': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'shift': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }, {
                        'payrollCode': {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }]
                })
                .sort({
                    'employeeNo': 'asc'
                })
                .exec(function(err, EmployeeData) {
                    if (EmployeeData) {
                        res.json({
                            "EmployeeData": EmployeeData
                        });
                    } else {
                        //console.log(err);
                    }
                })
        }
    }
}

exports.editemployeeData = function(req, res) {
    var employeeId = req.params.employeeId;
    var companyId = req.session.user;
    Employee.find({
        '_id': employeeId,
        'companyId': companyId
    }).limit(1).exec(function(err, employeedata) {
        if (employeedata.length > 0) {
            employeedata.forEach(function(data) {
                res.json(data);
            });
        }
    });
}

exports.createemployee = function(req, res) {
    var shiftPattern = req.body.shift;
    Company.findById(req.session.user, function(err, user) {
        if (user) {
            empFn.generate_employeeNo(req.session.user, function(result) { // this will return the generated employee no for company
                var employeeNo = result.employeeNo;
                var oldEmployeeNo = result.oldEmployeeNo;
                var companyName = user.companyname;
                var shiftCutoff = user.shiftCutoff;
                var dahsboardActive = user.isdashboard;
                var prvOnShift = '';
                var todaysDay = '';
                var isHolidays = user.isHolidays;
                var employee = new Employee();
                var payPeriodDays = '7';
                var defaultJC = req.body.defaultJC;
                if (req.session.user)
                    employee.companyId = req.session.user;
                if (req.body.firstName)
                    employee.firstName = req.body.firstName;
                if (req.body.lastName)
                    employee.lastName = req.body.lastName;
                if (req.body.administrator)
                    employee.administrator = req.body.administrator;
                if (req.body.administrator)
                    employee.adminType = "subAdmin";
                if (req.body.active)
                    employee.active = req.body.active;
                if (req.body.password) {
                    employee.password = employee.generateHash(req.body.password);
                }
                if (req.body.pin)
                    employee.pin = req.body.pin;
                if (req.body.email)
                    employee.email = req.body.email;
                employee.employeeNo = employeeNo;
                employee.companyname = companyName;
                if (req.body.payrollCode)
                    employee.payrollCode = req.body.payrollCode;
                if (req.body.hourlyRate)
                    employee.hourlyRate = req.body.hourlyRate;
                if (req.body.chargeoutRate)
                    employee.chargeoutRate = req.body.chargeoutRate;
                if (req.body.allowExport)
                    employee.allowExport = req.body.allowExport;
                if (req.body.department)
                    employee.department = req.body.department;
                if (req.body.subDepartment)
                    employee.subDepartment = req.body.subDepartment;
                employee.shift = shiftPattern;
                if (req.body.job)
                    employee.job = req.body.job;
                if (req.body.taskId)
                    employee.taskId = req.body.taskId;
                if (req.body.staffId)
                    employee.staffId = req.body.staffId;
                if (req.body.permission)
                    employee.permission = req.body.permission;
                employee.oldEmployeeNo = oldEmployeeNo;
                employee.defaultJC = defaultJC;

                employee.save(function(err, data) {
                    // console.log(data);
                    if (data) {
                        global.daysArray = [];
                        global.OnlyDays = [];

                        var start = '';
                        if (dahsboardActive) {
                            start = Moment.utc();
                        } else {
                            start = Moment.utc().subtract('days', 30);
                        }

                        var end = Moment.utc().add('days', 30);
                        async.waterfall([function(next) {
                            empFn.getShiftPatternData(shiftPattern, req.session.user, function(result) {
                                var noOfDays = result.noOfDays;
                                payPeriodDays = noOfDays;
                                var ruleStartDate = result.ruleStartDate;
                                // console.log(ruleStartDate + 'ruleStartDateruleStartDateruleStartDate');
                                result.days.forEach(function(daysData) {
                                    var day = daysData.day;
                                    var shift = daysData.shift;
                                    // daysArray.push(shift+':'+day); 1
                                    daysArray.push({
                                        shift: shift,
                                        day: day
                                    });
                                    OnlyDays.push(day);
                                });

                                empFn.checkShiftAction(result.days, req.session.user, function(cbShift) {
                                    if (cbShift) {
                                        if (noOfDays) {
                                            todaysDay = Moment(start).day();
                                        }
                                        next(null, daysArray, todaysDay, OnlyDays, ruleStartDate);
                                    }
                                });

                            });
                        }], function(err, result, todaysDay, OnlyDays, ruleStartDate) {
                            // console.log("get Holidaysss");
                            var i = 0;
                            empFn.getHolidays(req.session.user, function(holidayresult) {
                                // console.log(holidayresult);
                                tryToSave(start, end, result, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, function(data) {
                                    // console.log("ghhh"+data);
                                    if (data) {
                                        var adjustDate = Moment.utc(start).subtract('days', payPeriodDays).format('YYYY-MM-DD');
                                        console.log(adjustDate);
                                        empFn.setDashboardFlag(new Date(Moment.utc(adjustDate)), req.session.user, function(resultsFlag) {
                                            console.log(resultsFlag)
                                            if (result) {
                                                console.log("saved datedepartment done");
                                                res.json(true);
                                            } else {
                                                res.json(false);
                                            }
                                        });
                                    } else {
                                        res.json(false);
                                    }
                                });
                            });
                        });
                        var tryToSave = function(currentDate, endDate, result, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, callback) {
                            var arrayResult = result;
                            if (i > result.length - 1) {
                                i = 0;
                            }
                            console.log(Moment.utc(currentDate).format('YYYY-MM-DD'), Moment.utc(endDate).format('YYYY-MM-DD'));

                            if (Moment.utc(currentDate) > Moment.utc(endDate)) {
                                return callback(1);
                            } else {
                                if (result) {
                                    var dateModify = Moment.utc(currentDate).format();
                                    var dateGive = Moment(dateModify).format('YYYY-MM-DD');
                                    var holiday = '';
                                    if (isHolidays === true) {
                                        if (holidayresult.indexOf(dateGive) > -1) {
                                            holiday = true;
                                        }
                                    }
                                    var shift = '';
                                    //console.log(ruleStartDate +'-----------------------------');
                                    if (ruleStartDate !== '') {
                                        if (dateGive >= Moment.utc(ruleStartDate).format('YYYY-MM-DD')) {
                                            //console.log('yes-----------------------------------------');
                                            var dayOfcurrentDate = Moment(dateModify).day();
                                            var ValueArray = '';
                                            if (OnlyDays.indexOf('Day1') > -1) {
                                                ValueArray = result[i].shift;
                                                shift = ValueArray;
                                                i++;
                                            } else {
                                                ValueArray = result[i].shift;
                                                if (dayOfcurrentDate == empFn.weekDayNumber(result[i].day)) {
                                                    shift = ValueArray;
                                                    i++;
                                                } else {
                                                    //console.log(i);
                                                    var dayString = empFn.weekDayString(dayOfcurrentDate);
                                                    var resultIndex = OnlyDays.indexOf(dayString);
                                                    ValueArray = result[resultIndex].shift;
                                                    shift = ValueArray;
                                                    i = resultIndex + 1;
                                                }
                                            }
                                        } else {
                                            shift = "OPEN";
                                            console.log("shiftType.....");
                                        }
                                    }
                                    empFn.getShiftData("", shift, req.session.user, function(result) {
                                        //console.log('getShiftData'+result);
                                        var dateModify = currentDate;
                                        console.log("result...................");
                                        // console.log(result);
                                        var breakTime = result.breakTime;
                                        var breakAfter = result.breakAfter;
                                        var breakIn = result.breakIn;
                                        //var breakAfter2 = result.breakAfter2;
                                        //var breakTime2 = result.breakTime2;
                                        //var breakIn2 = result.breakIn2;
                                        var shiftStartTime = result.startTime;
                                        var shiftFinishTime = result.finishTime;
                                        var date = currentDate;
                                        var nextDate = Moment.utc(date).add('days', 1).format();
                                        var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
                                        var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                                        var start = '';
                                        var finish = '';
                                        var sHour = '';
                                        var sMinute = '';
                                        var sdate = '';
                                        var Hourset = '';
                                        var fHour = '';
                                        var fMinute = '';
                                        var fdate = '';
                                        var fHourset = '';

                                        if (shiftStartDate == shiftFinishDate) {
                                            sHour = Moment.utc(shiftStartTime).format('HH');
                                            sMinute = Moment.utc(shiftStartTime).format('mm');
                                            sdate = Moment.utc(date).format('YYYY-MM-DD');
                                            Hourset = Moment.utc(sdate).set('hours', sHour);
                                            start = Moment.utc(Hourset).set('minute', sMinute).format();
                                            fHour = Moment.utc(shiftFinishTime).format('HH');
                                            fMinute = Moment.utc(shiftFinishTime).format('mm');
                                            fdate = Moment.utc(date).format('YYYY-MM-DD');
                                            fHourset = Moment.utc(fdate).set('hours', fHour);
                                            finish = Moment.utc(fHourset).set('minute', fMinute).format();
                                        } else {
                                            if (shiftCutoff === true) {
                                                prvOnShift = true;
                                            }
                                            // console.log('-----------------------------------------------------------');
                                            sHour = Moment.utc(shiftStartTime).format('HH');
                                            sMinute = Moment.utc(shiftStartTime).format('mm');
                                            sdate = Moment.utc(date).format('YYYY-MM-DD');
                                            Hourset = Moment.utc(sdate).set('hours', sHour);
                                            start = Moment.utc(Hourset).set('minute', sMinute).format();
                                            fHour = Moment.utc(shiftFinishTime).format('HH');
                                            fMinute = Moment.utc(shiftFinishTime).format('mm');
                                            fdate = Moment.utc(nextDate).format('YYYY-MM-DD');
                                            fHourset = Moment.utc(fdate).set('hours', fHour);
                                            finish = Moment.utc(fHourset).set('minute', fMinute).format();
                                        }
                                        var startLimit = result.startLimit;
                                        var finishLimit = result.finishLimit;
                                        console.log('shiftAssign' + 'shift++++++++++++++++++++++++++++++++' + shift);
                                        var attendance = new Attendance();
                                        attendance.companyId = req.session.user;
                                        attendance.companyName = companyName;
                                        attendance.date = Moment.utc(dateModify).format('YYYY-MM-DD');
                                        if (req.body.firstName)
                                            attendance.firstName = req.body.firstName;
                                        if (req.body.lastName)
                                            attendance.lastName = req.body.lastName;
                                        attendance.email = data.email;
                                        if (req.body.administrator)
                                            attendance.admin = req.body.administrator;
                                        attendance.shift = shift;
                                        attendance.shiftType = "";
                                        attendance.lastShift = shift;
                                        attendance.shiftStart = start;
                                        attendance.shiftFinish = finish;
                                        attendance.limitIn = startLimit;
                                        attendance.limitOut = finishLimit;
                                        attendance.breakk = breakTime;
                                        attendance.breakAfter = breakAfter;
                                        attendance.breakIn = breakIn;
                                        if (req.body.department)
                                            attendance.department = req.body.department;
                                        if (req.body.subDepartment)
                                            attendance.subDepartment = req.body.subDepartment;
                                        attendance.employeeNo = data.employeeNo;
                                        if (req.body.hourlyRate)
                                            attendance.hourlyRate = req.body.hourlyRate;
                                        if (req.body.chargeoutRate)
                                            attendance.chargeoutRate = req.body.chargeoutRate;
                                        attendance.holiday = holiday;
                                        if (req.body.payrollCode)
                                            attendance.payrollCode = req.body.payrollCode;
                                        if (req.body.allowExport)
                                            attendance.allowExport = req.body.allowExport;
                                        attendance.prvOnShift = prvOnShift;
                                        attendance.save(function(err, data) {
                                            console.log("***************************");
                                            // console.log(err);
                                            // console.log(data);
                                            if (err) {
                                                //console.log(err);
                                                return callback(err);
                                            } else {
                                                currentDate = Moment.utc(currentDate).add('days', 1);
                                                console.log(Moment.utc(currentDate).format('YYYY-MM-DD'));
                                                tryToSave(currentDate, endDate, arrayResult, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, callback);
                                            }
                                        });
                                    });
                                }
                            }
                        };
                    }
                });
            });
        }
    });
};


exports.editemployee = function(req, res) {
    console.log("Edit employee ");
    console.log(req.body);
    // console.log(req.body.dateStarting);
    var ruledateStart = req.body.dateStarting;
    var administrator = req.body.administrator;
    var active = req.body.active;
    var employeeId = req.body._id;
    var password = req.body.password;
    var pin = req.body.pin;
    var shift = req.body.shift;
    var department = req.body.department;
    var subDepartments = req.body.subDepartment;
    var payrollCode = req.body.payrollCode;
    var hourlyRate = req.body.hourlyRate;
    var chargeoutRate = req.body.chargeoutRate;
    var allowExport = req.body.allowExport;
    var job = req.body.job;
    var taskId = req.body.taskId;
    var staffId = req.body.staffId;
    var adminType = req.body.adminType;
    var nameChange = req.body.nameChange;
    var defaultJC = req.body.defaultJC;
    var shiftPattern = shift;
    var employee = new Employee();
    var payPeriodDays = '7';
    global.daysArray = [];
    global.OnlyDays = [];
    async.waterfall([function(next) {
        console.log("async start");
        if (password) {
            console.log("async : password");
            Employee.update({
                '_id': employeeId,
                'companyId': req.session.user
            }, {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    administrator: administrator,
                    active: active,
                    password: employee.generateHash(password),
                    pin: pin,
                    email: req.body.email,
                    payrollCode: payrollCode,
                    hourlyRate: hourlyRate,
                    chargeoutRate: chargeoutRate,
                    allowExport: allowExport,
                    department: department,
                    shift: shift,
                    job: job,
                    taskId: taskId,
                    staffId: staffId,
                    permission: req.body.permission,
                    subDepartment: subDepartments,
                    adminType: adminType,
                    defaultJC: defaultJC
                }
            }, {
                upsert: false,
                new: false
            }, function(err, data) {
                if (err) {
                    res.json(false);
                } else {
                    next(null, 1);
                }
            });
        } else {
            console.log("async : !password");
            Employee.update({
                '_id': employeeId,
                'companyId': req.session.user
            }, {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    administrator: administrator,
                    active: active,
                    pin: pin,
                    email: req.body.email,
                    payrollCode: payrollCode,
                    hourlyRate: hourlyRate,
                    chargeoutRate: chargeoutRate,
                    allowExport: allowExport,
                    department: department,
                    shift: shift,
                    job: job,
                    taskId: taskId,
                    staffId: staffId,
                    permission: req.body.permission,
                    subDepartment: subDepartments,
                    adminType: adminType,
                    defaultJC: defaultJC
                }
            }, {
                upsert: false,
                new: false
            }, function(err, data) {
                if (err) {
                    res.json(false);
                } else {
                    next(null, 1);
                }
            });
        }
    }, function(result, next) {
        console.log("async finish");
        console.log("Shift data");
        empFn.getShiftPatternData(shift, req.session.user, function(results) {
            // console.log(results);
            if (results === false) {
                next(null, [], []);
            } else {
                //var noOfDays = results.noOfDays;
                results.days.sort(orderByShiftIndexAscending);
                var daysCnt = 0;
                results.days.forEach(function(daysData) {
                    daysCnt++;
                    var day = daysData.day;
                    var shift = daysData.shift;
                    daysArray.push({
                        shift: shift,
                        day: day
                    });
                    OnlyDays.push(day);
                    if (results.days.length === daysCnt) {
                        empFn.checkShiftAction(results.days, req.session.user, function(cbShift) {
                            console.log(cbShift);
                            if (cbShift) {
                                next(null, daysArray, OnlyDays);
                            }
                        });
                    }
                });
            }
        });
    }, function(result, OnlyDays, next) {
        console.log("update starts in attendance");
        if (nameChange == 1 && req.body.datename) {
            Attendance.update({
                date: {
                    $gte: new Date(req.body.datename)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log('saved nameChange failed' + err);
                else {
                    empFn.setDashboardFlag(new Date(req.body.datename), req.session.user, function(result) {
                        if (result) {
                            console.log('saved nameChange');
                        }
                    });
                }
            });
        }
        if (req.body.datePayroll) {
            Attendance.update({
                date: {
                    $gte: new Date(req.body.datePayroll)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    payrollCode: payrollCode,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log('saved datePayroll failed' + err);
                else
                    console.log('saved datePayroll');

            });
        }
        if (req.body.datedepartment) {
            Attendance.update({
                date: {
                    $gte: new Date(req.body.datedepartment)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    department: department,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log('saved datedepartment failed' + err);
                else {
                    console.log('saved datedepartment ' + data);
                    empFn.setDashboardFlag(new Date(req.body.datedepartment), req.session.user, function(result) {
                        if (result) {
                            console.log("saved datedepartment done");
                            // empFn.setMeterDashboardFlagSingle(req.body.myDate, req.session.user, function(respM) {
                        }
                    });
                }
            });
        }
        if (req.body.dateSubdepartment) {
            Attendance.update({
                department: req.body.department,
                date: {
                    $gte: new Date(req.body.dateSubdepartment)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.body.companyId
            }, {
                $set: {
                    department: req.body.department,
                    subDepartment: req.body.subDepartment,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log('saved dateSubdepartment failed ' + err);
                else {
                    console.log('saved dateSubdepartment');
                    empFn.setDashboardFlag(new Date(req.body.dateSubdepartment), req.session.user, function(result) {
                        if (result)
                            console.log("saved dateSubdepartment done");
                    });
                }

            });
        }
        if (req.body.dateexport) {
            Attendance.update({
                date: {
                    $gte: new Date(req.body.dateexport)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    allowExport: allowExport,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log('saved dateexport failed' + err);
                else
                    console.log('saved dateexport');
            });
        }
        if (req.body.dateactive) {
            console.log("active status set to " + req.body.active);
            Attendance.update({
                date: {
                    $gte: new Date(req.body.dateactive)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    active: active,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log("saved dateactive failed" + err);
                else {
                    console.log("saved dateactive " + req.body.active);
                    empFn.setDashboardFlag(new Date(req.body.dateactive), req.session.user, function(result) {
                        if (result)
                            console.log("saved dateactive done " + req.body.active);
                    });
                }
            });
        }

        if (req.body.dateChargeOut) {
            Attendance.update({
                date: {
                    $gte: new Date(req.body.dateChargeOut)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    chargeoutRate: chargeoutRate,
                    admin: req.body.administrator
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err)
                    console.log('saved dateChargeOut failed' + err);
                else
                    console.log('saved dateChargeOut');

            });
        }
        if (req.body.dateHourly) {
            Attendance.update({
                date: {
                    $gte: new Date(req.body.dateHourly)
                },
                'employeeNo': req.body.employeeNo,
                'companyId': req.session.user
            }, {
                $set: {
                    hourlyRate: hourlyRate,
                    admin: req.body.administrator,

                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                // console.log(err);
                // console.log(data);
                if (err) {
                    console.log("dateHourly failed" + err);
                } else {
                    console.log('updated dateHourly');
                    empFn.setDashboardFlag(new Date(req.body.dateHourly), req.session.user, function(result) {
                        if (result)
                            console.log("updated dateHourly done");
                    });
                    Employee.findOne({
                        '_id': employeeId,
                        'companyId': req.session.user
                    }, function(err, EmployeeData) {
                        if (EmployeeData) {
                            // var employeeNo = EmployeeData.employeeNo;
                            Attendance.find({
                                "date": {
                                    $gte: req.body.dateHourly
                                },
                                'employeeNo': req.body.employeeNo,
                                'companyId': req.session.user
                            }, function(err, attendanceData) {
                                if (attendanceData) {
                                    //var i = 0;
                                    attendanceData.forEach(function(atData) {
                                        //If checking found
                                        if (atData.checkin.length > 0) {
                                            //change cat flag to recalculate
                                            atData.checkin.forEach(function(atndata) {
                                                if (atndata.workCode) {
                                                    console.log("workcode detect");

                                                    Attendance.update({
                                                        '_id': atData._id,
                                                    }, {
                                                        $set: {
                                                            'projectFlag': true
                                                        }
                                                    }, {
                                                        upsert: false,
                                                        new: false,
                                                    }, function(err, data) {
                                                        if (err) {
                                                            console.log("Atn projectFlag failed" + err);
                                                        } else {
                                                            console.log("Atn projectFlag updated");
                                                        }
                                                    });

                                                    empFn.setProjectFlagIndividual(req.session.user, atndata.workCode, function(prjRes, data) {
                                                        console.log("project flag changed to set hourly rate" + atndata.workCode);
                                                    });
                                                } else {
                                                    console.log("no workcode");
                                                }
                                            });
                                            //chekins if
                                        } else {
                                            // console.log("no checkings");
                                        }
                                    }); //attendance    foreach
                                } //attendance if
                            });
                        } //employee if
                    }); // Employee foreach

                } //else
            });
        }
        if (ruledateStart) {
            console.log("rule date start" + ruledateStart);
            var arrayResult = result;

            Employee.findOne({
                '_id': employeeId,
                'companyId': req.session.user
            }, function(err, EmployeeData) {
                if (EmployeeData) {
                    // var employeeNo = EmployeeData.employeeNo;
                    Attendance.find({
                        "date": {
                            $gte: ruledateStart
                        },
                        'employeeNo': req.body.employeeNo,
                        'companyId': req.session.user
                    }, function(err, attendanceData) {
                        if (attendanceData) {
                            var i = 0;
                            attendanceData.forEach(function(atData) {
                                if (i > arrayResult.length - 1) {
                                    i = 0;
                                }
                                var id = atData._id;
                                var employeeNo = atData.employeeNo;
                                var currentDate = atData.date;
                                var dateCurrent = Moment.utc(currentDate).format('YYYY-MM-DD');

                                WeeklyOT.update({
                                    weekEnd: {
                                        $gte: dateCurrent
                                    },
                                    weekStart: {
                                        $lte: dateCurrent
                                    },
                                    'employeeNo': req.body.employeeNo,
                                    'companyId': req.session.user
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
                                        // console.log(err);
                                    }
                                });

                                Dashboard.update({
                                    weekEnd: {
                                        $gte: dateCurrent
                                    },
                                    weekStart: {
                                        $lte: dateCurrent
                                    },
                                    'companyId': req.session.user
                                }, {
                                    $set: {
                                        calfalg: false
                                    }
                                }, {
                                    upsert: false,
                                    new: false,
                                    multi: true
                                }, function(err, data) {
                                    if (!err) {
                                        console.log('Dashboard updated ' + data);
                                        empFn.setMeterDashboardFlagSingle(currentDate, req.session.user, function(status) {
                                            if (status) {
                                                console.log("Meter Dashboard " + status);
                                            }
                                        });
                                    }
                                });
                                var prvDate = Moment.utc(currentDate).subtract('days', 1).format('YYYY-MM-DD');
                                //var shiftEarlier = atData.shift;
                                var shift = '';
                                var ValueArray = '';
                                if (OnlyDays.indexOf('Day1') > -1) {
                                    ValueArray = result[i].shift;
                                    shift = ValueArray;
                                    i++;
                                } else {
                                    ValueArray = result[i].shift;
                                    var dayOfcurrentDate = Moment(currentDate).day();
                                    //console.log(ValueArray);
                                    //console.log('dayOfcurrentDate'+dayOfcurrentDate);
                                    if (dayOfcurrentDate == empFn.weekDayNumber(result[i].day)) {
                                        shift = ValueArray;
                                        i++;
                                    } else {
                                        var dayString = empFn.weekDayString(dayOfcurrentDate);
                                        var resultIndex = OnlyDays.indexOf(dayString);
                                        ValueArray = result[resultIndex].shift;
                                        shift = ValueArray;
                                        i = resultIndex + 1;
                                    }
                                }
                                empFn.getShiftData("", shift, req.session.user, function(result) {
                                    //var dateModify = currentDate;
                                    empFn.getCompanyData(req.session.user, function(resultCmp) {
                                        var shiftCutoff = resultCmp.shiftCutoff;
                                        var prvOnShift = '';
                                        // console.log(shiftCutoff +'-------------');
                                        var breakTime = result.breakTime;
                                        var breakAfter = result.breakAfter;
                                        var breakIn = result.breakIn;
                                        //var breakAfter2 = result.breakAfter2;
                                        //var breakTime2 = result.breakTime2;
                                        //var breakIn2 = result.breakIn2;
                                        var shiftStartTime = result.startTime;
                                        var shiftFinishTime = result.finishTime;
                                        var shiftColor = result.color;
                                        var date = currentDate;
                                        var nextDate = Moment.utc(date).add('days', 1).format();
                                        //console.log(nextDate);
                                        var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
                                        var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                                        var start = '';
                                        var finish = '';
                                        var sHour = '';
                                        var sMinute = '';
                                        var sdate = '';
                                        var Hourset = '';
                                        var fHour = '';
                                        var fMinute = '';
                                        var fdate = '';
                                        var fHourset = '';


                                        if (shiftStartDate == shiftFinishDate) {
                                            //console.log('pppppppppp')
                                            sHour = Moment.utc(shiftStartTime).format('HH');
                                            sMinute = Moment.utc(shiftStartTime).format('mm');
                                            sdate = Moment.utc(date).format('YYYY-MM-DD');
                                            Hourset = Moment.utc(sdate).set('hours', sHour);
                                            start = Moment.utc(Hourset).set('minute', sMinute).format();
                                            fHour = Moment.utc(shiftFinishTime).format('HH');
                                            fMinute = Moment.utc(shiftFinishTime).format('mm');
                                            fdate = Moment.utc(date).format('YYYY-MM-DD');
                                            fHourset = Moment.utc(fdate).set('hours', fHour);
                                            finish = Moment.utc(fHourset).set('minute', fMinute).format();
                                        } else {
                                            if (shiftCutoff === true) {
                                                prvOnShift = true;
                                            }
                                            //console.log('-----------------------------------------------------------');
                                            sHour = Moment.utc(shiftStartTime).format('HH');
                                            sMinute = Moment.utc(shiftStartTime).format('mm');
                                            sdate = Moment.utc(date).format('YYYY-MM-DD');
                                            Hourset = Moment.utc(sdate).set('hours', sHour);
                                            start = Moment.utc(Hourset).set('minute', sMinute).format();
                                            fHour = Moment.utc(shiftFinishTime).format('HH');
                                            fMinute = Moment.utc(shiftFinishTime).format('mm');
                                            fdate = Moment.utc(nextDate).format('YYYY-MM-DD');
                                            fHourset = Moment.utc(fdate).set('hours', fHour);
                                            finish = Moment.utc(fHourset).set('minute', fMinute).format();
                                        }
                                        var startLimit = result.startLimit;
                                        var finishLimit = result.finishLimit;
                                        // console.log(prvOnShift+'--------prvOnShift');
                                        // Attendance.update({'employeeNo': employeeNo,'companyId':req.session.user, $where: 'this.date.toJSON().slice(0, 10) == "'+prvDate+'"'},
                                        Attendance.update({
                                            'employeeNo': employeeNo,
                                            'companyId': req.session.user,
                                            "date": new Date(prvDate)
                                        }, {
                                            $set: {
                                                areaFlag: false,
                                                calFlag: false,
                                                readFlag: false,
                                                totalValues: [],
                                                prvOnShift: prvOnShift
                                            }
                                        }, {
                                            upsert: false,
                                            new: false
                                        }, function(err, data) {
                                            if (err) {
                                                // console.log(err);
                                            } else {
                                                // console.log('set'+employeeNo);
                                            }
                                        });
                                        Attendance.update({
                                            '_id': id
                                        }, {
                                            $set: {
                                                shift: shift,
                                                shiftType: "",
                                                lastShift: shift,
                                                shiftStart: start,
                                                shiftFinish: finish,
                                                limitIn: startLimit,
                                                limitOut: finishLimit,
                                                breakk: breakTime,
                                                breakAfter: breakAfter,
                                                breakIn: breakIn,
                                                areaFlag: false,
                                                calFlag: false,
                                                readFlag: false,
                                                totalValues: [],
                                                shiftColor: shiftColor,
                                                prvOnShift: prvOnShift,
                                                admin: req.body.administrator
                                            }
                                        }, {
                                            upsert: false,
                                            new: false
                                        }, function(err, data) {
                                            if (err) {
                                                console.log("error" + err);
                                            } else {
                                                // console.log("done");
                                            }
                                            // console.log("ruledateStart");
                                            // next(null, 1);

                                        });
                                    });
                                });
                            }); //attendanceData foreach
                        } //if  attendanceData
                        else {
                            console.log(err);
                        }
                    }); //attendance find
                } else {
                    // console.log("sdkjdasgdjasdgjasdgasjdajhdsadghsadhjsadgajda");
                } // if EmployeeData
            }); //employee find
        }
        next(null, 1);
    }], function(err, result) {
        console.log("============after async================");
        if (result == 1) {
            if (req.body.active === true && req.body.dateactive) {
                console.log("Activate employee");
                Attendance.find({
                    date: {
                        $gte: new Date(req.body.dateactive)
                    },
                    'employeeNo': req.body.employeeNo,
                    'companyId': req.session.user
                }, function(err, detail) {
                    // console.log(detail);
                    if (detail.length > 0) {
                        res.json(true);
                    } else {
                        // console.log("elseee");
                        Company.findById(req.session.user, function(err, user) {
                            if (user) {
                                //var companyName = user.companyname;
                                var shiftCutoff = user.shiftCutoff;
                                var prvOnShift = '';
                                var isHolidays = user.isHolidays;
                                var todaysDay = '';
                                global.daysArray = [];
                                global.OnlyDays = [];
                                var start = Moment.utc().subtract('days', 30);
                                var end = Moment.utc().add('days', 50);
                                async.waterfall([function(next) {
                                    empFn.getShiftPatternData(shiftPattern, req.session.user, function(result) {
                                        console.log("shift pattern data");
                                        if (result === false) {
                                            next(null, [], [], [], []);
                                        } else {
                                            var noOfDays = result.noOfDays;
                                            var ruleStartDate = result.ruleStartDate;
                                            //console.log(ruleStartDate + 'ruleStartDateruleStartDateruleStartDate');
                                            // result.days.sort(orderByShiftIndexAscending);
                                            result.days.forEach(function(daysData) {
                                                var day = daysData.day;
                                                var shift = daysData.shift;
                                                // daysArray.push(shift+':'+day); 2
                                                daysArray.push({
                                                    shift: shift,
                                                    day: day
                                                });
                                                OnlyDays.push(day);
                                            });

                                            if (noOfDays) {
                                                todaysDay = Moment(start).day();
                                            }
                                            next(null, daysArray, todaysDay, OnlyDays, ruleStartDate);
                                        }
                                    });
                                }], function(err, result, todaysDay, OnlyDays, ruleStartDate) {
                                    var i = 0;
                                    empFn.getHolidays(req.session.user, function(holidayresult) {
                                        console.log("Get holidays");
                                        tryToSave(start, end, result, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, function(data) {
                                            console.log("try to save");
                                            if (data == 1) {
                                                empFn.setDashboardFlag(new Date(req.body.dateactive), req.session.user, function(result) {
                                                    if (result) {
                                                        console.log("atn back dashboard flag" + req.body.active);
                                                        res.json(true);
                                                    }
                                                });
                                            } else {
                                                res.json(false);
                                            }
                                        });
                                    });
                                });
                                var tryToSave = function(currentDate, endDate, result, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, callback) {
                                    console.log("Try to save start");
                                    // console.log(currentDate);
                                    // console.log(endDate);
                                    var arrayResult = result;
                                    if (i > result.length - 1) {
                                        i = 0;
                                    }
                                    if (currentDate > endDate) {
                                        return callback(1);
                                    } else {
                                        if (result) {
                                            var dateModify = Moment.utc(currentDate).format();
                                            var dateGive = Moment.utc(dateModify).format('YYYY-MM-DD');
                                            var holiday = '';
                                            if (isHolidays === true) {
                                                if (holidayresult.indexOf(dateGive) > -1) {
                                                    holiday = true;
                                                }
                                            }
                                            var shift = '';
                                            var ValueArray = '';
                                            //console.log(ruleStartDate +'-----------------------------');
                                            if (ruleStartDate !== '') {
                                                if (dateGive >= Moment.utc(ruleStartDate).format('YYYY-MM-DD')) {
                                                    //console.log('yes-----------------------------------------');
                                                    var dayOfcurrentDate = Moment(dateModify).day();
                                                    if (OnlyDays.indexOf('Day1') > -1) {
                                                        ValueArray = result[i].shift;
                                                        shift = ValueArray;
                                                        i++;
                                                    } else {
                                                        ValueArray = result[i].shift;
                                                        if (dayOfcurrentDate == empFn.weekDayNumber(result[i].day)) {
                                                            shift = ValueArray;
                                                            i++;
                                                        } else {
                                                            //console.log(i);
                                                            var dayString = empFn.weekDayString(dayOfcurrentDate);
                                                            var resultIndex = OnlyDays.indexOf(dayString);
                                                            ValueArray = result[resultIndex].shift;
                                                            shift = ValueArray;
                                                            i = resultIndex + 1;
                                                        }
                                                    }
                                                } else {
                                                    shift = "OPEN";
                                                }
                                            }
                                            empFn.getShiftData("", shift, req.session.user, function(result) {
                                                var dateModify = currentDate;
                                                var breakTime = result.breakTime;
                                                var breakAfter = result.breakAfter;
                                                var breakIn = result.breakIn;
                                                //var breakAfter2 = result.breakAfter2;
                                                //var breakTime2 = result.breakTime2;
                                                //var breakIn2 = result.breakIn2;
                                                var shiftStartTime = result.startTime;
                                                var shiftFinishTime = result.finishTime;
                                                var date = currentDate;
                                                var nextDate = Moment.utc(date).add('days', 1).format();
                                                var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
                                                var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                                                var start = '';
                                                var finish = '';
                                                var sHour = '';
                                                var sMinute = '';
                                                var sdate = '';
                                                var Hourset = '';
                                                var fHour = '';
                                                var fMinute = '';
                                                var fdate = '';
                                                var fHourset = '';

                                                if (shiftStartDate == shiftFinishDate) {
                                                    sHour = Moment.utc(shiftStartTime).format('HH');
                                                    sMinute = Moment.utc(shiftStartTime).format('mm');
                                                    sdate = Moment.utc(date).format('YYYY-MM-DD');
                                                    Hourset = Moment.utc(sdate).set('hours', sHour);
                                                    start = Moment.utc(Hourset).set('minute', sMinute).format();
                                                    fHour = Moment.utc(shiftFinishTime).format('HH');
                                                    fMinute = Moment.utc(shiftFinishTime).format('mm');
                                                    fdate = Moment.utc(date).format('YYYY-MM-DD');
                                                    fHourset = Moment.utc(fdate).set('hours', fHour);
                                                    finish = Moment.utc(fHourset).set('minute', fMinute).format();
                                                } else {
                                                    if (shiftCutoff === true) {
                                                        prvOnShift = true;
                                                    }
                                                    //console.log('-----------------------------------------------------------');
                                                    sHour = Moment.utc(shiftStartTime).format('HH');
                                                    sMinute = Moment.utc(shiftStartTime).format('mm');
                                                    sdate = Moment.utc(date).format('YYYY-MM-DD');
                                                    Hourset = Moment.utc(sdate).set('hours', sHour);
                                                    start = Moment.utc(Hourset).set('minute', sMinute).format();
                                                    fHour = Moment.utc(shiftFinishTime).format('HH');
                                                    fMinute = Moment.utc(shiftFinishTime).format('mm');
                                                    fdate = Moment.utc(nextDate).format('YYYY-MM-DD');
                                                    fHourset = Moment.utc(fdate).set('hours', fHour);
                                                    finish = Moment.utc(fHourset).set('minute', fMinute).format();
                                                }
                                                var startLimit = result.startLimit;
                                                var finishLimit = result.finishLimit;
                                                var attendance = new Attendance();
                                                attendance.companyId = req.session.user;
                                                attendance.companyName = req.body.companyname;
                                                attendance.date = Moment.utc(dateModify).format('YYYY-MM-DD');
                                                attendance.firstName = req.body.firstName;
                                                attendance.lastName = req.body.lastName;
                                                attendance.email = req.body.email;
                                                attendance.admin = req.body.administrator;
                                                attendance.shift = shift;
                                                attendance.lastShift = shift;
                                                attendance.shiftStart = start;
                                                attendance.shiftFinish = finish;
                                                attendance.limitIn = startLimit;
                                                attendance.limitOut = finishLimit;
                                                attendance.breakk = breakTime;
                                                attendance.breakAfter = breakAfter;
                                                attendance.breakIn = breakIn;
                                                attendance.department = department;
                                                attendance.employeeNo = req.body.employeeNo;
                                                attendance.hourlyRate = hourlyRate;
                                                attendance.chargeoutRate = chargeoutRate;
                                                attendance.holiday = holiday;
                                                attendance.payrollCode = payrollCode;
                                                attendance.allowExport = allowExport;
                                                attendance.prvOnShift = prvOnShift;
                                                // attendance.admin = adminTrue;
                                                attendance.save(function(err) {
                                                    if (err) {
                                                        return callback(err);
                                                    } else {
                                                        currentDate = Moment.utc(currentDate).add('days', 1);
                                                        tryToSave(currentDate, endDate, arrayResult, todaysDay, OnlyDays, i, holidayresult, ruleStartDate, callback);
                                                    }
                                                });
                                            });
                                        }
                                    }
                                };
                            }
                        });
                    }
                });
            } else {
                res.json(true);
            }
        }
    });
};

exports.exceptionList = function(req, res) {
    Exception.find({
        'companyId': req.session.user
    }, function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}

exports.attendanceList = function(req, res) {
    Attendance.find({
        'companyId': req.session.user
    }, function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}

exports.attendanceDataFetch = function(req, res) {
    Attendance.findOne({
        '_id': req.params.attendanceId
    }, function(err, data) {
        if (data) {
            res.json(data);
        }
    })
}

exports.createexception = function(req, res) {
    var companyId = req.session.user;
    var title = req.body.title;
    var standardHours = req.body.standardHours + ':00';
    var payrollCode = req.body.payrollCode;
    var addToStandardHours = req.body.addToStandardHours;
    var weeklyOtinclude = req.body.weeklyOtinclude;
    var exceptiontype = req.body.exceptiontype;

    var exception = new Exception()
    exception.companyId = companyId;
    exception.title = title;
    exception.standardHours = standardHours;
    exception.payrollCode = payrollCode;
    exception.addToStandardHours = addToStandardHours;
    exception.weeklyOtinclude = weeklyOtinclude;
    exception.exceptiontype = exceptiontype
    exception.ExceptionAssign = exceptiontype;

    exception.save(function(err, data) {
        if (data) {
            res.json(true)
        } else {
            res.json(false)
        }
    });

}

exports.editexception = function(req, res) {
    var exceptionId = req.params.exceptionId;
    var companyId = req.session.user;
    Exception.find({
        '_id': exceptionId,
        'companyId': companyId
    }).limit(1).exec(function(err, exceptionData) {
        if (exceptionData.length > 0) {
            exceptionData.forEach(function(data) {
                res.json(data);
            });
        }
    });
}

exports.updateexception = function(req, res) {
    Exception.update({
        '_id': req.body._id,
        'companyId': req.session.user
    }, {
        $set: {
            title: req.body.title,
            standardHours: req.body.standardHours + ':00',
            payrollCode: req.body.payrollCode,
            addToStandardHours: req.body.addToStandardHours,
            weeklyOtinclude: req.body.weeklyOtinclude,
            exceptiontype: req.body.exceptiontype,
            ExceptionAssign: req.body.ExceptionAssign,
            exceptionTotal: req.body.exceptionTotal,
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            res.json(false);
        } else {
            res.json(true);
        }
    })
}

exports.deleteException = function(req, res) {
    var exceptionId = req.params.exceptionId;
    var companyId = req.session.user;
    Exception.remove({
        '_id': exceptionId,
        'companyId': companyId
    }, function(err) {
        if (!err) {
            res.json(true);
        }
    })
}

exports.employeedelete = function(req, res) {
    var employeeId = req.params.employeeId;
    var companyId = req.session.user;

    Employee.update({
        '_id': employeeId,
        'companyId': companyId
    }, {
        $set: {
            active: false,
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            res.json(false);
        } else {
            res.json(true);
        }
    })
}

exports.getAllEmployeeData = function(req, res) {
    var mapDetails = [];
    var companyId = req.session.user;

    function makeString() {
        var text = "";
        var useCharacters = "abcd012345678";
        for (var i = 0; i < 6; i++)
            text += useCharacters.charAt(Math.floor(Math.random() * useCharacters.length));
        return text;
    }
    var keysArray = [];
    for (var i = 0; i < 200; i++) {
        var randomString = makeString();
        keysArray.push(randomString);
    }
    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart;
                var payPeriodStartDate = companyData.payPeriodStartDate;
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 7;
                } else if (payPeriod == '2weeks') {
                    days = 14;
                } else if (payPeriod == '4weeks') {
                    days = 28;
                } else if (payPeriod == 'monthly') {
                    days = 30;
                }
                var settingDay = 0;
                if (WeekdayStart == 'sun') {
                    var settingDay = 0;
                } else if (WeekdayStart == 'mon') {
                    var settingDay = 1;
                } else if (WeekdayStart == 'tues') {
                    var settingDay = 2;
                } else if (WeekdayStart == 'wed') {
                    var settingDay = 3;
                } else if (WeekdayStart == 'thurs') {
                    var settingDay = 4;
                } else if (WeekdayStart == 'fri') {
                    var settingDay = 5;
                } else if (WeekdayStart == 'sat') {
                    var settingDay = 6;
                }

                var payperiodFn = function(currentDate1, startD, endD, callback) {
                    var newstartD = startD;
                    var newendD = endD;
                    while (startD <= endD) {
                        if (startD == endD) {
                            var startD = endD;
                            var endD = Moment.utc(endD).add('days', 14).format('YYYY-MM-DD');
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
                if (payPeriod == '2weeks') {
                    var startDate = Moment.utc(payPeriodStartDate).startOf('week').format('YYYY-MM-DD');
                    var endDate = Moment.utc(payPeriodStartDate).endOf('week').format('YYYY-MM-DD');
                    var currentDay = Moment.utc().format('YYYY-MM-DD');
                } else {
                    var startDate = Moment.utc().startOf('week').format('YYYY-MM-DD');
                    var endDate = Moment.utc().endOf('week').format('YYYY-MM-DD');
                }
                var between = [];
                var datesArray = [];
                while (startDate <= endDate) {
                    var datePush = new Date(startDate);
                    datesArray.push(datePush);
                    var dayMatch = Moment(startDate).day();
                    if (dayMatch == settingDay) {
                        between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
                    }
                    startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
                }
                var mapDetails = [];
                var cnt = 0;
                var n = 0;
                var colorWithEmpArray = [];
                if (payPeriod == '2weeks') {
                    var start = between[0];
                    var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                    var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                    payperiodFn(currentDay, start, end, function(result) {
                        if (result.status == 1) {
                            empFn.getLastDateSession(companyId, function(resultRe) {
                                if (resultRe == false) {
                                    start = result.start;
                                    end = result.end;
                                    prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                                } else {
                                    var stringDate = resultRe.split('/');
                                    start = stringDate[0];
                                    end = stringDate[1];
                                    prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                                }
                                Attendance.aggregate({
                                    "$match": {
                                        "companyId": companyId,
                                        "date": {
                                            $gte: new Date(start),
                                            $lte: new Date(end)
                                        }
                                    }
                                }, {
                                    $unwind: "$checkin"
                                }, {
                                    "$group": {
                                        "_id": {
                                            "latitude": "$checkin.latitude",
                                            "longitude": "$checkin.longitude"
                                        }
                                    }
                                }).exec(function(err, attendanceData) {
                                    if (attendanceData.length > 0) {
                                        async.eachSeries(attendanceData, function(details, callback) {
                                            var detail = details._id;
                                            var checkinLatLang = [];
                                            cnt++;
                                            if (detail.latitude != null && detail.latitude != "" && detail.longitude != null && detail.longitude != "") {
                                                checkinLatLang.push(detail.latitude, detail.longitude);
                                                Attendance.find({
                                                    "checkin.latitude": detail.latitude,
                                                    "checkin.longitude": detail.longitude,
                                                    'companyId': companyId,
                                                    "date": {
                                                        $gte: new Date(start),
                                                        $lte: new Date(end)
                                                    }
                                                }).sort({
                                                    date: 'asc'
                                                }).select({
                                                    'firstName': 1,
                                                    'lastName': 1,
                                                    'employeeNo': 1,
                                                    'checkin.checkType': 1,
                                                    'checkin.checkTime': 1,
                                                    'date': 1
                                                }).exec(function(err, atnData) {
                                                    if (atnData.length > 0) {
                                                        var employeeDetail = [];
                                                        atnData.forEach(function(atnDetail) {
                                                            var checkin1 = [];
                                                            atnDetail.checkin.sort(function(a, b) {
                                                                return new Date(a.checkTime) - new Date(b.checkTime);
                                                            });
                                                            var InCnt = 0;
                                                            var outCnt = 0;
                                                            atnDetail.checkin.forEach(function(details) {
                                                                if (details.checkType == 'I' || details.checkType == 'i' || details.checkType == '2') {
                                                                    InCnt++;
                                                                    if (outCnt == "0" && InCnt == "2") {
                                                                        InCnt = 0;
                                                                        checkin1.push({
                                                                            "checkType": "Out",
                                                                            "checkTime": ''
                                                                        });
                                                                    }
                                                                    checkin1.push(details);
                                                                }
                                                                if (details.checkType == 'O' || details.checkType == 'o' || details.checkType == '0' || details.checkType == '3') {
                                                                    outCnt++;
                                                                    if (checkin1.length <= 0) {
                                                                        checkin1.push({
                                                                            "checkType": "In",
                                                                            "checkTime": ''
                                                                        });
                                                                    }
                                                                    if (InCnt == "0" && outCnt == "2") {
                                                                        outCnt = 0;
                                                                        checkin1.push({
                                                                            "checkType": "In",
                                                                            "checkTime": ''
                                                                        });
                                                                    }
                                                                    checkin1.push(details);
                                                                }
                                                            });
                                                            employeeDetail.push({
                                                                date: atnDetail.date,
                                                                employeeNo: atnDetail.employeeNo,
                                                                firstName: atnDetail.firstName,
                                                                lastName: atnDetail.lastName,
                                                                checkin: checkin1
                                                            });
                                                            if (employeeDetail.length == atnData.length) {
                                                                if (colorWithEmpArray.length <= 0) {
                                                                    if (keysArray.length > 0) {
                                                                        for (var i = 0; i < keysArray.length; i++) {
                                                                            if (n == i) {
                                                                                colorWithEmpArray.push({
                                                                                    iconColor: keysArray[i],
                                                                                    employeeNo: atnDetail.employeeNo
                                                                                });
                                                                            }
                                                                        };
                                                                    }
                                                                }
                                                                var values = function(x) {
                                                                    return Object.keys(x).map(function(k) {
                                                                        return x[k]
                                                                    })
                                                                }
                                                                var result = colorWithEmpArray.filter(function(x) {
                                                                    return values(x).indexOf(atnDetail.employeeNo) > -1;
                                                                });
                                                                var colors;
                                                                if (result.length <= 0) {
                                                                    if (keysArray.length > 0) {
                                                                        for (var i = 0; i < keysArray.length; i++) {
                                                                            if (n == i) {
                                                                                colors = keysArray[i];
                                                                                colorWithEmpArray.push({
                                                                                    iconColor: keysArray[i],
                                                                                    employeeNo: atnDetail.employeeNo
                                                                                });
                                                                            }
                                                                        };
                                                                    }
                                                                } else {
                                                                    colors = result[0].iconColor;
                                                                }
                                                                n++;
                                                                mapDetails.push({
                                                                    employeeNo: atnDetail.employeeNo,
                                                                    checkinId: atnDetail._id,
                                                                    location: checkinLatLang,
                                                                    employeeDetail: employeeDetail
                                                                });
                                                                if (cnt == attendanceData.length) {
                                                                    res.json({
                                                                        datesArray: datesArray,
                                                                        'startDate': start,
                                                                        'endDate': end,
                                                                        'attendanceData': mapDetails
                                                                    });
                                                                }
                                                                callback();
                                                            }
                                                        });
                                                    } else {
                                                        if (cnt == attendanceData.length) {
                                                            res.json({
                                                                datesArray: datesArray,
                                                                'startDate': start,
                                                                'endDate': end,
                                                                'attendanceData': mapDetails
                                                            });
                                                        } else
                                                            callback();
                                                    }
                                                });
                                            } else {
                                                if (cnt == attendanceData.length) {
                                                    res.json({
                                                        datesArray: datesArray,
                                                        'startDate': start,
                                                        'endDate': end,
                                                        'attendanceData': mapDetails
                                                    });
                                                }
                                                callback();
                                            }
                                        })
                                    } else {
                                        res.json({
                                            datesArray: datesArray,
                                            'startDate': start,
                                            'endDate': end,
                                            'attendanceData': mapDetails
                                        });
                                    }
                                });
                            });
                        }
                    });
                } else {
                    console.log("esleeeeeeee........");
                    empFn.getLastDateSession(companyId, function(resultRe) {
                        if (resultRe == false) {
                            var start = between[0];
                            var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                            var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                        } else {
                            var stringDate = resultRe.split('/');
                            var start = stringDate[0];
                            var end = stringDate[1];
                            var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                        }
                        Attendance.aggregate({
                            "$match": {
                                "companyId": companyId,
                                "date": {
                                    $gte: new Date(start),
                                    $lte: new Date(end)
                                }
                            }
                        }, {
                            $unwind: "$checkin"
                        }, {
                            "$group": {
                                "_id": {
                                    "latitude": "$checkin.latitude",
                                    "longitude": "$checkin.longitude"
                                }
                            }
                        }).exec(function(err, attendanceData) {
                            if (attendanceData.length > 0) {
                                async.eachSeries(attendanceData, function(details, callback) {
                                    var detail = details._id;
                                    var checkinLatLang = [];
                                    cnt++;
                                    if (detail.latitude != null && detail.latitude != "" && detail.longitude != null && detail.longitude != "") {
                                        checkinLatLang.push(detail.latitude, detail.longitude);
                                        Attendance.find({
                                            "checkin.latitude": detail.latitude,
                                            "checkin.longitude": detail.longitude,
                                            'companyId': companyId,
                                            "date": {
                                                $gte: new Date(start),
                                                $lte: new Date(end)
                                            }
                                        }).sort({
                                            date: 'asc'
                                        }).select({
                                            'firstName': 1,
                                            'lastName': 1,
                                            'employeeNo': 1,
                                            'checkin.checkType': 1,
                                            'checkin.checkTime': 1,
                                            'date': 1
                                        }).exec(function(err, atnData) {
                                            if (atnData.length > 0) {
                                                var employeeDetail = [];
                                                atnData.forEach(function(atnDetail) {
                                                    var checkin1 = [];
                                                    atnDetail.checkin.sort(function(a, b) {
                                                        return new Date(a.checkTime) - new Date(b.checkTime);
                                                    });
                                                    var InCnt = 0;
                                                    var outCnt = 0;
                                                    atnDetail.checkin.forEach(function(details) {
                                                        if (details.checkType == 'I' || details.checkType == 'i' || details.checkType == '2') {
                                                            InCnt++;
                                                            if (outCnt == "0" && InCnt == "2") {
                                                                InCnt = 0;
                                                                checkin1.push({
                                                                    "checkType": "Out",
                                                                    "checkTime": ''
                                                                });
                                                            }
                                                            checkin1.push(details);
                                                        }
                                                        if (details.checkType == 'O' || details.checkType == 'o' || details.checkType == '0' || details.checkType == '3') {
                                                            outCnt++;
                                                            if (checkin1.length <= 0) {
                                                                checkin1.push({
                                                                    "checkType": "In",
                                                                    "checkTime": ''
                                                                });
                                                            }
                                                            if (InCnt == "0" && outCnt == "2") {
                                                                outCnt = 0;
                                                                checkin1.push({
                                                                    "checkType": "In",
                                                                    "checkTime": ''
                                                                });
                                                            }
                                                            checkin1.push(details);
                                                        }
                                                    });
                                                    employeeDetail.push({
                                                        date: atnDetail.date,
                                                        employeeNo: atnDetail.employeeNo,
                                                        firstName: atnDetail.firstName,
                                                        lastName: atnDetail.lastName,
                                                        checkin: checkin1
                                                    });
                                                    if (employeeDetail.length == atnData.length) {
                                                        if (colorWithEmpArray.length <= 0) {
                                                            if (keysArray.length > 0) {
                                                                for (var i = 0; i < keysArray.length; i++) {
                                                                    if (n == i) {
                                                                        colorWithEmpArray.push({
                                                                            iconColor: keysArray[i],
                                                                            employeeNo: atnDetail.employeeNo
                                                                        });
                                                                    }
                                                                };
                                                            }
                                                        }
                                                        var values = function(x) {
                                                            return Object.keys(x).map(function(k) {
                                                                return x[k]
                                                            })
                                                        }
                                                        var result = colorWithEmpArray.filter(function(x) {
                                                            return values(x).indexOf(atnDetail.employeeNo) > -1
                                                        });
                                                        var colors;
                                                        if (result.length <= 0) {
                                                            if (keysArray.length > 0) {
                                                                for (var i = 0; i < keysArray.length; i++) {
                                                                    if (n == i) {
                                                                        colors = keysArray[i];
                                                                        colorWithEmpArray.push({
                                                                            iconColor: keysArray[i],
                                                                            employeeNo: atnDetail.employeeNo
                                                                        });
                                                                    }
                                                                };
                                                            }
                                                        } else {
                                                            colors = result[0].iconColor;
                                                        }
                                                        n++;
                                                        mapDetails.push({
                                                            iconColor: '#' + colors,
                                                            employeeNo: atnDetail.employeeNo,
                                                            checkinId: atnDetail.employeeNo,
                                                            location: checkinLatLang,
                                                            employeeDetail: employeeDetail
                                                        });
                                                        if (cnt == attendanceData.length) {
                                                            res.json({
                                                                datesArray: datesArray,
                                                                'startDate': start,
                                                                'endDate': end,
                                                                'attendanceData': mapDetails
                                                            });
                                                        } else
                                                            callback();
                                                    }
                                                });
                                            } else {
                                                if (cnt == attendanceData.length) {
                                                    res.json({
                                                        datesArray: datesArray,
                                                        'startDate': start,
                                                        'endDate': end,
                                                        'attendanceData': mapDetails
                                                    });
                                                } else
                                                    callback();
                                            }
                                        });
                                    } else {
                                        if (cnt == attendanceData.length) {
                                            res.json({
                                                datesArray: datesArray,
                                                'startDate': start,
                                                'endDate': end,
                                                'attendanceData': mapDetails
                                            });
                                        } else
                                            callback();
                                    }
                                });
                            } else {
                                res.json({
                                    datesArray: datesArray,
                                    'startDate': start,
                                    'endDate': end,
                                    'attendanceData': mapDetails
                                });
                            }
                        });
                    });
                }
            }
        }
    });
}

exports.getAllByDateEmployeeData = function(req, res) {
    var companyId = req.session.user;
    var start = Moment.utc(req.params.fromDate).format('YYYY-MM-DD');
    var end = Moment.utc(req.params.toDate).format('YYYY-MM-DD');
    var mapDetails = [];
    var cnt = 0;
    var startDate = start;
    var endDate = end;
    var datesArray = [];
    while (startDate <= endDate) {
        var datePush = new Date(startDate);
        datesArray.push(datePush);
        startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
    }

    function makeString() {
        var text = "";
        var useCharacters = "abcd012345678";
        for (var i = 0; i < 6; i++)
            text += useCharacters.charAt(Math.floor(Math.random() * useCharacters.length));
        return text;
    }
    var keysArray = [];
    for (var i = 0; i < 200; i++) {
        var randomString = makeString();
        keysArray.push(randomString);
    }
    var mapDetails = [];
    var cnt = 0;
    var n = 0;
    var colorWithEmpArray = [];
    Attendance.aggregate({
        "$match": {
            "companyId": companyId,
            "date": {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        }
    }, {
        $unwind: "$checkin"
    }, {
        "$group": {
            "_id": {
                "latitude": "$checkin.latitude",
                "longitude": "$checkin.longitude"
            }
        }
    }).exec(function(err, attendanceData) {
        console.log(attendanceData.length);
        if (attendanceData.length > 0) {
            async.eachSeries(attendanceData, function(details, callback) {
                var detail = details._id;
                var checkinLatLang = [];
                cnt++;
                if (detail.latitude != null && detail.latitude != "" && detail.longitude != null && detail.longitude != "") {
                    checkinLatLang.push(detail.latitude, detail.longitude);
                    Attendance.find({
                        "checkin.latitude": detail.latitude,
                        "checkin.longitude": detail.longitude,
                        'companyId': companyId,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).sort({
                        date: 'asc'
                    }).select({
                        'firstName': 1,
                        'lastName': 1,
                        'employeeNo': 1,
                        'checkin.checkType': 1,
                        'checkin.checkTime': 1,
                        'date': 1
                    }).exec(function(err, atnData) {
                        if (atnData.length > 0) {
                            var employeeDetail = [];
                            atnData.forEach(function(atnDetail) {
                                var checkin1 = [];
                                atnDetail.checkin.sort(function(a, b) {
                                    return new Date(a.checkTime) - new Date(b.checkTime);
                                });
                                var InCnt = 0;
                                var outCnt = 0;
                                atnDetail.checkin.forEach(function(details) {
                                    if (details.checkType == 'I' || details.checkType == 'i' || details.checkType == '2') {
                                        InCnt++;
                                        if (outCnt == "0" && InCnt == "2") {
                                            InCnt = 0;
                                            checkin1.push({
                                                "checkType": "Out",
                                                "checkTime": ''
                                            });
                                        }
                                        checkin1.push(details);
                                    }
                                    if (details.checkType == 'O' || details.checkType == 'o' || details.checkType == '0' || details.checkType == '3') {
                                        outCnt++;
                                        if (checkin1.length <= 0) {
                                            checkin1.push({
                                                "checkType": "In",
                                                "checkTime": ''
                                            });
                                        }
                                        if (InCnt == "0" && outCnt == "2") {
                                            outCnt = 0;
                                            checkin1.push({
                                                "checkType": "In",
                                                "checkTime": ''
                                            });
                                        }
                                        checkin1.push(details);
                                    }
                                });
                                employeeDetail.push({
                                    date: atnDetail.date,
                                    employeeNo: atnDetail.employeeNo,
                                    firstName: atnDetail.firstName,
                                    lastName: atnDetail.lastName,
                                    checkin: checkin1
                                });
                                if (employeeDetail.length == atnData.length) {
                                    if (colorWithEmpArray.length <= 0) {
                                        if (keysArray.length > 0) {
                                            for (var i = 0; i < keysArray.length; i++) {
                                                if (n == i) {
                                                    colorWithEmpArray.push({
                                                        iconColor: keysArray[i],
                                                        employeeNo: atnDetail.employeeNo
                                                    });
                                                }
                                            };
                                        }
                                    }
                                    var values = function(x) {
                                        return Object.keys(x).map(function(k) {
                                            return x[k]
                                        })
                                    }
                                    var result = colorWithEmpArray.filter(function(x) {
                                        return values(x).indexOf(atnDetail.employeeNo) > -1
                                    });
                                    var colors;
                                    if (result.length <= 0) {
                                        if (keysArray.length > 0) {
                                            for (var i = 0; i < keysArray.length; i++) {
                                                if (n == i) {
                                                    colors = keysArray[i];
                                                    colorWithEmpArray.push({
                                                        iconColor: keysArray[i],
                                                        employeeNo: atnDetail.employeeNo
                                                    });
                                                }
                                            };
                                        }
                                    } else {
                                        colors = result[0].iconColor;
                                    }
                                    n++;
                                    mapDetails.push({
                                        iconColor: '#' + colors,
                                        employeeNo: atnDetail.employeeNo,
                                        checkinId: atnDetail.employeeNo,
                                        location: checkinLatLang,
                                        employeeDetail: employeeDetail
                                    });
                                    if (cnt == attendanceData.length) {
                                        res.json({
                                            datesArray: datesArray,
                                            'startDate': start,
                                            'endDate': end,
                                            'attendanceData': mapDetails
                                        });
                                    } else
                                        callback();
                                }
                            });
                        } else {
                            if (cnt == attendanceData.length) {
                                res.json({
                                    datesArray: datesArray,
                                    'startDate': start,
                                    'endDate': end,
                                    'attendanceData': mapDetails
                                });
                            } else
                                callback();
                        }
                    });
                } else {
                    if (cnt == attendanceData.length) {
                        res.json({
                            datesArray: datesArray,
                            'startDate': start,
                            'endDate': end,
                            'attendanceData': mapDetails
                        });
                    } else
                        callback();
                }
            });;
        } else {
            res.json({
                datesArray: datesArray,
                'startDate': start,
                'endDate': end,
                'attendanceData': mapDetails
            });
        }
    });
}

exports.getAllByEmpNoEmployeeData = function(req, res) {
    var companyId = req.session.user;
    var start = Moment.utc(req.params.fromDate).format('YYYY-MM-DD');
    var end = Moment.utc(req.params.toDate).format('YYYY-MM-DD');
    var mapDetails = [];
    var cnt = 0;
    var endDate = end;
    var startDate = start;
    var endDate = end;
    var datesArray = [];
    while (startDate <= endDate) {
        var datePush = new Date(startDate);
        datesArray.push(datePush);
        startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
    }

    function makeString() {
        var text = "";
        var useCharacters = "abcd012345678";
        for (var i = 0; i < 6; i++)
            text += useCharacters.charAt(Math.floor(Math.random() * useCharacters.length));
        return text;
    }
    var keysArray = [];
    for (var i = 0; i < 200; i++) {
        var randomString = makeString();
        keysArray.push(randomString);
    }
    var mapDetails = [];
    var cnt = 0;
    var n = 0;
    var colorWithEmpArray = [];
    Attendance.aggregate({
        "$match": {
            "employeeNo": req.params.employeeNo,
            "companyId": companyId,
            "date": {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        }
    }, {
        $unwind: "$checkin"
    }, {
        "$group": {
            "_id": {
                "latitude": "$checkin.latitude",
                "longitude": "$checkin.longitude"
            }
        }
    }).exec(function(err, attendanceData) {
        if (attendanceData.length > 0) {
            async.eachSeries(attendanceData, function(details, callback) {
                var detail = details._id;
                var checkinLatLang = [];
                cnt++;
                if (detail.latitude != null && detail.latitude != "" && detail.longitude != null && detail.longitude != "") {
                    checkinLatLang.push(detail.latitude, detail.longitude);
                    Attendance.find({
                        "employeeNo": req.params.employeeNo,
                        "checkin.latitude": detail.latitude,
                        "checkin.longitude": detail.longitude,
                        'companyId': companyId,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).sort({
                        date: 'asc'
                    }).select({
                        'firstName': 1,
                        'lastName': 1,
                        'employeeNo': 1,
                        'checkin.checkType': 1,
                        'checkin.checkTime': 1,
                        "date": 1
                    }).exec(function(err, atnData) {
                        if (atnData.length > 0) {
                            var employeeDetail = [];
                            atnData.forEach(function(atnDetail) {
                                var checkin1 = [];
                                atnDetail.checkin.sort(function(a, b) {
                                    return new Date(a.checkTime) - new Date(b.checkTime);
                                });
                                var InCnt = 0;
                                var outCnt = 0;
                                atnDetail.checkin.forEach(function(details) {
                                    if (details.checkType == 'I' || details.checkType == 'i' || details.checkType == '2') {
                                        InCnt++;
                                        if (outCnt == "0" && InCnt == "2") {
                                            InCnt = 0;
                                            checkin1.push({
                                                "checkType": "Out",
                                                "checkTime": ''
                                            });
                                        }
                                        checkin1.push(details);
                                    }
                                    if (details.checkType == 'O' || details.checkType == 'o' || details.checkType == '0' || details.checkType == '3') {
                                        outCnt++;
                                        if (checkin1.length <= 0) {
                                            checkin1.push({
                                                "checkType": "In",
                                                "checkTime": ''
                                            });
                                        }
                                        if (InCnt == "0" && outCnt == "2") {
                                            outCnt = 0;
                                            checkin1.push({
                                                "checkType": "In",
                                                "checkTime": ''
                                            });
                                        }
                                        checkin1.push(details);
                                    }
                                });
                                employeeDetail.push({
                                    date: atnDetail.date,
                                    employeeNo: atnDetail.employeeNo,
                                    firstName: atnDetail.firstName,
                                    lastName: atnDetail.lastName,
                                    checkin: checkin1
                                });
                                if (employeeDetail.length == atnData.length) {
                                    if (colorWithEmpArray.length <= 0) {
                                        if (keysArray.length > 0) {
                                            for (var i = 0; i < keysArray.length; i++) {
                                                if (n == i) {
                                                    colorWithEmpArray.push({
                                                        iconColor: keysArray[i],
                                                        employeeNo: atnDetail.employeeNo
                                                    });
                                                }
                                            };
                                        }
                                    }
                                    var values = function(x) {
                                        return Object.keys(x).map(function(k) {
                                            return x[k]
                                        })
                                    }
                                    var result = colorWithEmpArray.filter(function(x) {
                                        return values(x).indexOf(atnDetail.employeeNo) > -1
                                    });
                                    var colors;
                                    if (result.length <= 0) {
                                        if (keysArray.length > 0) {
                                            for (var i = 0; i < keysArray.length; i++) {
                                                if (n == i) {
                                                    colors = keysArray[i];
                                                    colorWithEmpArray.push({
                                                        iconColor: keysArray[i],
                                                        employeeNo: atnDetail.employeeNo
                                                    });
                                                }
                                            };
                                        }
                                    } else {
                                        colors = result[0].iconColor;
                                    }
                                    n++;
                                    mapDetails.push({
                                        iconColor: '#' + colors,
                                        employeeNo: atnDetail.employeeNo,
                                        checkinId: atnDetail.employeeNo,
                                        location: checkinLatLang,
                                        employeeDetail: employeeDetail
                                    });
                                    if (cnt == attendanceData.length) {
                                        res.json({
                                            datesArray: datesArray,
                                            'startDate': start,
                                            'endDate': end,
                                            'attendanceData': mapDetails
                                        });
                                    } else
                                        callback();
                                }
                            });
                        } else {
                            if (cnt == attendanceData.length) {
                                res.json({
                                    datesArray: datesArray,
                                    'startDate': start,
                                    'endDate': end,
                                    'attendanceData': mapDetails
                                });
                            } else
                                callback();
                        }
                    });
                } else {
                    if (cnt == attendanceData.length) {
                        res.json({
                            datesArray: datesArray,
                            'startDate': start,
                            'endDate': end,
                            'attendanceData': mapDetails
                        });
                    } else
                        callback();
                }
            });
        } else {
            res.json({
                datesArray: datesArray,
                'startDate': start,
                'endDate': end,
                'attendanceData': mapDetails
            });
        }
    });
}

exports.getSelectedEmployeeData = function(req, res) {
    var start = req.body.startDate;
    var end = req.body.endDate;
    var employeeNoList = req.body.employeeNo;
    var mapDetails = [];
    var endDate = end;
    var startDate = start;
    var endDate = end;
    var datesArray = [];
    while (startDate <= endDate) {
        var datePush = new Date(startDate);
        datesArray.push(datePush);
        startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
    }

    function makeString() {
        var text = "";
        var useCharacters = "abcd012345678";
        for (var i = 0; i < 6; i++)
            text += useCharacters.charAt(Math.floor(Math.random() * useCharacters.length));
        return text;
    }
    var keysArray = [];
    for (var i = 0; i < 200; i++) {
        var randomString = makeString();
        keysArray.push(randomString);
    }
    var mapDetails = [];
    var cnt = 0;
    var n = 0;
    var colorWithEmpArray = [];
    Attendance.aggregate({
        "$match": {
            "companyId": req.session.user,
            "date": {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        }
    }, {
        $unwind: "$checkin"
    }, {
        "$group": {
            "_id": {
                "latitude": "$checkin.latitude",
                "longitude": "$checkin.longitude"
            }
        }
    }).exec(function(err, attendanceData) {
        console.log(attendanceData.length);
        if (attendanceData.length > 0) {
            var cnt = 0;
            async.eachSeries(attendanceData, function(details, callback) {
                var detail = details._id;
                var checkinLatLang = [];
                cnt++;
                if (detail.latitude != null && detail.latitude != "" && detail.longitude != null && detail.longitude != "") {
                    console.log("ifff");
                    checkinLatLang.push(detail.latitude, detail.longitude);
                    Attendance.find({
                        "employeeNo": {
                            $in: employeeNoList
                        },
                        "checkin.latitude": detail.latitude,
                        "checkin.longitude": detail.longitude,
                        'companyId': req.session.user,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).sort({
                        date: 'asc'
                    }).select({
                        'firstName': 1,
                        'lastName': 1,
                        'employeeNo': 1,
                        'checkin.checkType': 1,
                        'checkin.checkTime': 1,
                        'date': 1
                    }).exec(function(err, atnData) {
                        if (atnData.length > 0) {
                            console.log("ifff");
                            var employeeDetail = [];
                            atnData.forEach(function(atnDetail) {
                                var checkin1 = [];
                                atnDetail.checkin.sort(function(a, b) {
                                    return new Date(a.checkTime) - new Date(b.checkTime);
                                });
                                var InCnt = 0;
                                var outCnt = 0;
                                atnDetail.checkin.forEach(function(details) {
                                    if (details.checkType == 'I' || details.checkType == 'i' || details.checkType == '2') {
                                        InCnt++;
                                        if (outCnt == "0" && InCnt == "2") {
                                            InCnt = 0;
                                            checkin1.push({
                                                "checkType": "Out",
                                                "checkTime": ''
                                            });
                                        }
                                        checkin1.push(details);
                                    }
                                    if (details.checkType == 'O' || details.checkType == 'o' || details.checkType == '0' || details.checkType == '3') {
                                        outCnt++;
                                        if (checkin1.length <= 0) {
                                            checkin1.push({
                                                "checkType": "In",
                                                "checkTime": ''
                                            });
                                        }
                                        if (InCnt == "0" && outCnt == "2") {
                                            outCnt = 0;
                                            checkin1.push({
                                                "checkType": "In",
                                                "checkTime": ''
                                            });
                                        }
                                        checkin1.push(details);
                                    }
                                });
                                employeeDetail.push({
                                    date: atnDetail.date,
                                    employeeNo: atnDetail.employeeNo,
                                    firstName: atnDetail.firstName,
                                    lastName: atnDetail.lastName,
                                    checkin: checkin1
                                });
                                if (employeeDetail.length == atnData.length) {
                                    if (colorWithEmpArray.length <= 0) {
                                        if (keysArray.length > 0) {
                                            for (var i = 0; i < keysArray.length; i++) {
                                                if (n == i) {
                                                    colorWithEmpArray.push({
                                                        iconColor: keysArray[i],
                                                        employeeNo: atnDetail.employeeNo
                                                    });
                                                }
                                            };
                                        }
                                    }
                                    var values = function(x) {
                                        return Object.keys(x).map(function(k) {
                                            return x[k]
                                        })
                                    }
                                    var result = colorWithEmpArray.filter(function(x) {
                                        return values(x).indexOf(atnDetail.employeeNo) > -1
                                    });
                                    var colors;
                                    if (result.length <= 0) {
                                        if (keysArray.length > 0) {
                                            for (var i = 0; i < keysArray.length; i++) {
                                                if (n == i) {
                                                    colors = keysArray[i];
                                                    colorWithEmpArray.push({
                                                        iconColor: keysArray[i],
                                                        employeeNo: atnDetail.employeeNo
                                                    });
                                                }
                                            };
                                        }
                                    } else {
                                        colors = result[0].iconColor;
                                    }
                                    n++;
                                    mapDetails.push({
                                        iconColor: '#' + colors,
                                        employeeNo: atnDetail.employeeNo,
                                        checkinId: atnDetail._id,
                                        location: checkinLatLang,
                                        employeeDetail: employeeDetail
                                    });
                                    if (cnt == attendanceData.length) {
                                        console.log("end of llooop...1");
                                        res.json({
                                            datesArray: datesArray,
                                            'startDate': start,
                                            'endDate': end,
                                            'attendanceData': mapDetails
                                        });
                                    }
                                    callback();
                                }
                            });
                        } else {
                            if (cnt == attendanceData.length) {
                                console.log("end of llooop...1");
                                res.json({
                                    datesArray: datesArray,
                                    'startDate': start,
                                    'endDate': end,
                                    'attendanceData': mapDetails
                                });
                            }
                            callback();
                        }
                    });
                } else {
                    if (cnt == attendanceData.length) {
                        console.log("end of llooop...2");
                        res.json({
                            datesArray: datesArray,
                            'startDate': start,
                            'endDate': end,
                            'attendanceData': mapDetails
                        });
                    }
                    callback();
                }
            });
        } else {
            res.json({
                datesArray: datesArray,
                'startDate': start,
                'endDate': end,
                'attendanceData': mapDetails
            });
        }
    });
}

exports.attendanceedit = function(req, res) {
    var employeeNo = req.params.employeeNo;
    var companyId = req.session.user;
    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart;
                var payPeriodStartDate = companyData.payPeriodStartDate;
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 7;
                } else if (payPeriod == '2weeks') {
                    days = 14;
                } else if (payPeriod == '4weeks') {
                    days = 28;
                } else if (payPeriod == 'monthly') {
                    days = 30;
                }
                var settingDay = '';
                if (WeekdayStart == 'sun') {
                    var settingDay = 0;
                } else if (WeekdayStart == 'mon') {
                    var settingDay = 1;
                } else if (WeekdayStart == 'tues') {
                    var settingDay = 2;
                } else if (WeekdayStart == 'wed') {
                    var settingDay = 3;
                } else if (WeekdayStart == 'thurs') {
                    var settingDay = 4;
                } else if (WeekdayStart == 'fri') {
                    var settingDay = 5;
                } else if (WeekdayStart == 'sat') {
                    var settingDay = 6;
                } else {
                    var settingDay = '';
                }

                var payperiodFn = function(currentDate1, startD, endD, callback) {
                    var newstartD = startD;
                    var newendD = endD;
                    while (startD <= endD) {
                        if (startD == endD) {
                            var startD = endD;
                            var endD = Moment.utc(endD).add('days', 14).format('YYYY-MM-DD');
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

                if (payPeriod == '2weeks') {
                    var startDate = Moment.utc(payPeriodStartDate).startOf('week').format('YYYY-MM-DD');
                    var endDate = Moment.utc(payPeriodStartDate).endOf('week').format('YYYY-MM-DD');
                    var currentDay = Moment.utc().format('YYYY-MM-DD');
                } else {
                    var startDate = Moment.utc().startOf('week').format('YYYY-MM-DD');
                    var endDate = Moment.utc().endOf('week').format('YYYY-MM-DD');
                }

                var between = [];
                while (startDate <= endDate) {
                    var dayMatch = Moment(startDate).day();
                    if (dayMatch == settingDay) {
                        between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
                    }
                    startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
                }

                if (payPeriod == '2weeks') {
                    var start = between[0];
                    var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                    var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                    payperiodFn(currentDay, start, end, function(result) {
                        if (result.status == 1) {
                            empFn.getLastDateSession(companyId, function(resultRe) {
                                if (resultRe == false) {
                                    start = result.start;
                                    end = result.end;
                                    prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                                } else {
                                    var stringDate = resultRe.split('/')
                                    start = stringDate[0];
                                    end = stringDate[1];
                                    prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                                }
                                Attendance
                                // .find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }})
                                    .find({
                                        'employeeNo': employeeNo,
                                        'companyId': companyId,
                                        "date": {
                                            $gte: new Date(start),
                                            $lt: new Date(end)
                                        }
                                    })
                                    .sort({
                                        date: 'asc'
                                    })
                                    .exec(function(err, attendanceData) {
                                        //Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end  }}, function(err, count) {
                                        if (attendanceData) {
                                            if (req.session.userType != 'user') {
                                                var periodModel = new Period();
                                                periodModel.companyId = companyId;
                                                periodModel.period = start + '/' + end;
                                                periodModel.save(function(err) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        res.json({
                                                            'attendanceData': attendanceData,
                                                            'prv': prv
                                                        });
                                                    }
                                                });
                                            } else {
                                                res.json({
                                                    'attendanceData': attendanceData,
                                                    'prv': prv
                                                });
                                            }

                                        } else {
                                            console.log(err);
                                        }
                                    });
                            });
                        }
                    });
                } else {
                    empFn.getLastDateSession(companyId, function(resultRe) {
                        if (resultRe == false) {
                            var start = between[0];
                            var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                            var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                        } else {
                            var stringDate = resultRe.split('/');
                            var start = stringDate[0];
                            var end = stringDate[1];
                            var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                        }
                        Attendance
                        // .find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }})
                            .find({
                                'employeeNo': employeeNo,
                                'companyId': companyId,
                                "date": {
                                    $gte: new Date(start),
                                    $lt: new Date(end)
                                }
                            })
                            .sort({
                                date: 'asc'
                            })
                            .exec(function(err, attendanceData) {
                                //Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end  }}, function(err, count) {
                                if (attendanceData) {
                                    if (req.session.userType != 'user') {
                                        var periodModel = new Period();
                                        periodModel.companyId = companyId;
                                        periodModel.period = start + '/' + end;
                                        console.log(periodModel);
                                        periodModel.save(function(err, data) {
                                            console.log(data);
                                            console.log(err);
                                            if (err) {
                                                console.log("else" + err);
                                                // res.json({'attendanceData':attendanceData, 'prv':prv});
                                            } else {
                                                res.json({
                                                    'attendanceData': attendanceData,
                                                    'prv': prv
                                                });
                                            }
                                        });
                                    } else {
                                        res.json({
                                            'attendanceData': attendanceData,
                                            'prv': prv
                                        });
                                    }

                                } else {
                                    console.log(err);
                                }
                            });
                    });
                }
            }
        }
    });
}
exports.attendanceeditNext = function(req, res) {
    var employeeNo = req.params.employeeNo;
    var date = req.params.date;
    var companyId = req.session.user;

    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 7;
                } else if (payPeriod == '2weeks') {
                    days = 14;
                } else if (payPeriod == '4weeks') {
                    days = 28;
                } else if (payPeriod == 'monthly') {
                    days = 30;
                }
                var settingDay = '';
                if (WeekdayStart == 'sun') {
                    var settingDay = 0;
                } else if (WeekdayStart == 'mon') {
                    var settingDay = 1;
                } else if (WeekdayStart == 'tues') {
                    var settingDay = 2;
                } else if (WeekdayStart == 'wed') {
                    var settingDay = 3;
                } else if (WeekdayStart == 'thurs') {
                    var settingDay = 4;
                } else if (WeekdayStart == 'fri') {
                    var settingDay = 5;
                } else if (WeekdayStart == 'sat') {
                    var settingDay = 6;
                } else {
                    var settingDay = '';
                }
                var startDate = Moment(date).startOf('week').format('YYYY-MM-DD');
                var endDate = Moment(date).endOf('week').format('YYYY-MM-DD');
                var between = [];
                while (startDate <= endDate) {
                    var dayMatch = Moment(startDate).day();
                    if (dayMatch == settingDay) {
                        between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
                    }
                    startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
                }

                var start = Moment.utc(date).format('YYYY-MM-DD');
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                /*console.log(start+'startDate-----------------------');
                console.log(end+'end-----------------------');*/
                Attendance
                // .find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }})
                    .find({
                        'employeeNo': employeeNo,
                        'companyId': companyId,
                        "date": {
                            $gte: new Date(start),
                            $lt: new Date(end)
                        }
                    })
                    .sort({
                        date: 'asc'
                    })
                    .exec(function(err, attendanceData) {
                        //Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }}, function(err, count) {
                        if (attendanceData) {
                            if (req.session.userType != 'user') {
                                var periodModel = new Period();
                                periodModel.companyId = companyId
                                periodModel.period = start + '/' + end;
                                periodModel.save(function(err) {
                                    if (err) {
                                        // console.log(err);
                                    } else {
                                        res.json({
                                            'attendanceData': attendanceData,
                                            'prv': prv
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    'attendanceData': attendanceData,
                                    'prv': prv
                                });
                            }
                        } else {
                            // console.log(err);
                        }
                        //});
                    });
            }
        }

    });
}

exports.attendanceeditFilter = function(req, res) {
    var employeeNo = req.params.employeeNo;
    var companyId = req.session.user;
    var fromdate = Moment(req.params.fromdate).format('YYYY-MM-DD');
    var todate = Moment(req.params.todate).add('days', 1).format('YYYY-MM-DD');
    // console.log(fromdate +'from');
    //var todate = Moment.utc(date).add('days', 1).format('YYYY-MM-DD');
    // console.log(todate);
    Attendance
    // .find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+fromdate, $lt: 'this.date.toJSON().slice(0, 10) == '+todate }})
        .find({
            'employeeNo': employeeNo,
            'companyId': companyId,
            "date": {
                $gte: new Date(fromdate),
                $lt: new Date(todate)
            }
        })
        .sort({
            date: 'asc'
        })
        .exec(function(err, attendanceData) {
            // Attendance.count({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+fromdate, $lte: 'this.date.toJSON().slice(0, 10) == '+todate }}, function(err, count) {
            if (attendanceData) {
                /*empFn.getHolidays(companyId, function(result){
                        var n = 1;
                        console.log(result);
                        var holidays = result;
                        attendanceData.forEach(function(empData){
                                var dateAtn = Moment(empData.date).format('YYYY-MM-DD');
                                console.log(dateAtn);
                                var id = empData._id;
                                if(holidays.indexOf(dateAtn) > -1){
                                        Attendance.update(
                                        {'_id': id,'companyId':companyId},
                                        {$set: {
                                                shift:'Holiday',
                                                //shiftStart:'',
                                             // shiftFinish:'',
                                                limitIn:false,
                                                limitOut:false
                                        }},
                                        {upsert: true, new: false}, function(err,data){
                                                if(err) {
                                                     res.json(false);
                                                }
                                        })
                                }
                                n++;
                                if(attendanceData.length == n){
                                        Attendance.find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gt: 'this.date.toJSON().slice(0, 10) == '+fromdate, $lt: 'this.date.toJSON().slice(0, 10) == '+todate }}).sort({'_id':'asc'}).exec(function(err, newAtnData){
                                                if(!err){
                                                        res.json(newAtnData);
                                                }
                                        })
                                }
                        });
                })*/

                if (req.session.userType != 'user') {
                    var periodModel = new Period();
                    periodModel.companyId = companyId
                    periodModel.period = fromdate + '/' + todate;
                    periodModel.save(function(err) {
                        if (err) {
                            // console.log(err);
                        } else {
                            res.json(attendanceData);
                        }
                    });
                } else {
                    res.json(attendanceData);
                }
                //res.json(attendanceData);
            } else {
                // console.log(err);
            }
            // });
        });
}

exports.archievedEmployeeList = function(req, res) {
    if (req.session.subadmin) {
        Employee.find({
            'companyId': req.session.user,
            'active': false,
            'department': {
                $in: req.session.subadmin
            }
        }, function(err, data) {
            if (data) {
                res.json(data);
            }
        });
    } else {
        Employee.find({
            'companyId': req.session.user,
            'active': false
        }, function(err, data) {
            if (data) {
                res.json(data);
            }
        });
    }
}

exports.archievedEmployeeEditData = function(req, res) {
    var employeeId = req.params.employeeId;
    var companyId = req.session.user;
    if (req.session.subadmin) {
        Employee.find({
            'department': {
                $in: req.session.subadmin
            },
            '_id': employeeId,
            'companyId': companyId
        }).limit(1).exec(function(err, employeedata) {
            if (employeedata.length > 0) {
                employeedata.forEach(function(data) {
                    res.json(data);
                });
            } else {
                res.json(false);
            }
        });
    } else {
        Employee.find({
            '_id': employeeId,
            'companyId': companyId
        }).limit(1).exec(function(err, employeedata) {
            if (employeedata) {
                employeedata.forEach(function(data) {
                    res.json(data);
                });
            }
        });
    }
}

exports.checkemail = function(req, res) {
    var email = new RegExp(["^", req.body.email, "$"].join(""), "i");
    Employee.count({
        'email': email
    }, function(err, employeedata) {
        if ((employeedata) > 0) {
            res.json(false);
        } else {
            res.json(true);
        }
    });
}


exports.changeAttendanceShift = function(req, res) {
    console.log("change attendance shift **********************");
    // console.log(req.body);
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
        // console.log("Elseeee............");
    }

    // var companyId = req.session.user;
    var attendanceId = req.body.id;
    var shift = req.body.shift;
    var date = req.body.atnDate;
    var employeeNo = req.body.employeeNo;
    empFn.getShiftData(req.body.shiftType, shift, companyId, function(result) {
        empFn.setallowDelete(companyId, result._id, false, function(cbRes) {});
        var breakTime = result.breakTime;
        var breakAfter = result.breakAfter;
        var breakIn = result.breakIn;
        var breakAfter2 = result.breakAfter2;
        var breakTime2 = result.breakTime2;
        var breakIn2 = result.breakIn2;

        var shiftStartTime = result.startTime;
        var shiftFinishTime = result.finishTime;

        var nextDate = Moment.utc(date).add('days', 1).format();
        var prvsDate = Moment.utc(date).subtract('days', 1).format();
        var prvDate = Moment.utc(date).subtract('days', 1).format('YYYY-MM-DD');
        var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
        var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
        var shiftColor = result.color;
        var start = '';
        var finish = '';

        if (shiftStartDate == shiftFinishDate) { //console.log('pppppppppp')
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
        var blankArray = [];
        var datec = Moment.utc(req.body.atnDate).format('YYYY-MM-DD');
        Dashboard.update({
            weekEnd: {
                $gte: datec
            },
            weekStart: {
                $lte: datec
            },
            'companyId': companyId
        }, {
            $set: {
                calfalg: false
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (!err) {
                console.log("Dashboard updated " + data);
                empFn.setMeterDashboardFlag(prvsDate, nextDate, companyId, function(flag) {
                    if (flag)
                        console.log("Meter Dashboard " + flag);
                });
            }
        });
        WeeklyOT.update({
            weekEnd: {
                $gte: datec
            },
            weekStart: {
                $lte: datec
            },
            'employeeNo': employeeNo,
            'companyId': companyId
        }, {
            $set: {
                readflag: true
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (err) {}
        });
        // console.log(attendanceId);
        // console.log(companyId);

        Attendance.update({
            '_id': attendanceId,
            'companyId': companyId
        }, {
            $set: {
                shift: req.body.shift,
                lastShift: req.body.shift,
                shiftStart: start,
                shiftFinish: finish,
                limitIn: startLimit,
                limitOut: finishLimit,
                breakk: breakTime,
                breakAfter: breakAfter,
                breakAfter2: breakAfter2,
                breakIn: breakIn,
                breakIn2: breakIn2,
                totalValues: blankArray,
                allowances: blankArray,
                // areaFlag: false,
                // calFlag: false,
                Exception: '',
                ExceptionAssign: '',
                addException: false,
                standardHours: '',
                addToStandardHours: '',
                cutException: '',
                addweeklyexc: '',
                shiftColor: shiftColor,
                notaddexc: '',
                shiftType: req.body.shiftType,
                projectFlag: true,
            }
        }, {
            upsert: false,
            new: false
        }, function(err, data) {
            console.log("Attendance updated " + data);
            if (err) {
                res.json(false);
            } else {
                Attendance.update({
                    'date': {
                        $gte: new Date(prvsDate),
                        $lte: new Date(nextDate)
                    },
                    'companyId': companyId,
                    'employeeNo': employeeNo
                }, {
                    $set: {
                        totalValues: blankArray,
                        allowances: blankArray,
                        areaFlag: false,
                        calFlag: false,
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true,
                }, function(err, data) {
                    if (err) {
                        res.json(false);
                    } else {
                        console.log("Days between %s to %s flags are updated %d", prvsDate, nextDate, data);
                        calculateArea(companyId, employeeNo, function(result) {
                            console.log("calculateArea " + result);
                            if (result == 1) {
                                var adminDetil = {
                                    email: email,
                                    userType: userTypes
                                };
                                empFn.calculateCheckinIndividual(adminDetil, companyId, employeeNo, datec, function(results) {
                                    if (results == 2) {
                                        console.log('4) attendance checkins calculation done according to areastart and area finish');
                                        calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(resultss) {
                                            console.log("calculateUpdateAttendance done");
                                            if (resultss == 1) {
                                                res.json(true);
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    }
                });
            }
        });
    });
}

exports.changeAttendanceexception = function(req, res) {
    console.log("change exception ******************************");
    var companyId = req.session.user;
    var attendanceId = req.body.id;
    var exception = req.body.exception;
    if (!exception) {
        exception = "Holiday";
    }
    console.log(req.body)
    var date = req.body.atnDate;
    var employeeNo = req.body.employeeNo;
    Attendance.find({
        '_id': attendanceId,
        'companyId': companyId
    }).limit(1).exec(function(err, atndataRec) {
        console.log(err);
        if (!err) {
            atndataRec.forEach(function(atndata) {
                var checkinDate = atndata.date;
                var employeeNo = atndata.employeeNo;
                var datec = Moment.utc(checkinDate).format('YYYY-MM-DD');
                Dashboard.update({
                    weekEnd: {
                        $gte: datec
                    },
                    weekStart: {
                        $lte: datec
                    },
                    'companyId': companyId
                }, {
                    $set: {
                        calfalg: false
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true
                }, function(err, data) {
                    if (!err) {
                        console.log("Dashboard " + data);
                        empFn.setMeterDashboardFlagSingle(checkinDate, companyId, function(flag) {
                            if (flag) {
                                console.log("Meter Dashboard " + flag);
                                // console.log("meterdashboard flag updated");
                            }
                        });
                    }
                });
                WeeklyOT.update({
                    weekEnd: {
                        $gte: datec
                    },
                    weekStart: {
                        $lte: datec
                    },
                    'employeeNo': employeeNo,
                    'companyId': companyId
                }, {
                    $set: {
                        readflag: true
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true
                }, function(err, data) {
                    if (err) {}
                });


                Attendance.update({
                    'companyId': companyId,
                    '_id': attendanceId
                }, {
                    $set: {
                        projectFlag: true,
                    }
                }, {
                    upsert: false,
                    multi: false
                }, function(err, data) {
                    if (err) {
                        console.log('project flag updated failed' + err);
                    } else {
                        console.log('project flag updated');
                    }
                });

            })
        }
    })
    Company.find({
        '_id': companyId
    }, {}, {
        limit: 1
    }, function(err, CompanyDatas) {
        var CompanyData = CompanyDatas[0];
        console.log("calculateExceptionHours....");
        empFn.calculateExceptionHours(req.body.exception, CompanyData, attendanceId, function(result) {
            if (result) {
                res.json(true);
            }
        })
    });
}

function calculateUpdateAttendance(adminDetails, attendanceId, companyId, callback) {
    console.log("calculateUpdateAttendance");
    Company.find({
        '_id': companyId
    }, {}, {
        limit: 1
    }, function(err, dataCompanys) {
        if (dataCompanys.length > 0) {
            var dataCompany = dataCompanys[0];
            empFn.getHolidays(companyId, function(holidayresult) {
                Attendance.find({
                    '_id': attendanceId,
                    'companyId': companyId
                }, {}, {
                    limit: 1
                }, function(err, employeeAttendances) {
                    var employeeAttendance = employeeAttendances[0];
                    empFn.calculateAtn(adminDetails, holidayresult, dataCompany, employeeAttendance, function(result) {});

                    setTimeout(function() {
                        callback(1);
                    }, 1000);

                });
            });
        }
    });
}

exports.attendancetimeedit = function(req, res) {
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
    }
    if (req.body.addIOTime === true) {
        email = req.body.adminEmail;
        companyId = req.body.companyId;
    }
    var objectId = req.body.objectId;
    var attendanceId = req.body.attendanceId;
    var checkTime = req.body.checkTime.split(':');
    var checkType = req.body.checkType;
    var employeeNo = req.body.employeeNo;
    var workCode = req.body.workCode;
    var checkinDate = Moment.utc(req.body.checkinDate).format('YYYY-MM-DD');
    var Hourset = Moment.utc(checkinDate).set('hours', checkTime[0]);
    var date = Moment.utc(Hourset).set('minute', checkTime[1]);
    var newDate = new Date(Date.parse(date)).toUTCString();
    var blankArray = [];
    WeeklyOT.find({
        weekEnd: {
            $gte: checkinDate
        },
        weekStart: {
            $lte: checkinDate
        },
        'employeeNo': employeeNo,
        'companyId': companyId
    }, function(err, weekData) {
        if (err) { // console.log(err);
        } else {
            weekData.forEach(function(data) {
                var id = data._id;
                WeeklyOT.update({
                    '_id': id
                }, {
                    $set: {
                        readflag: true
                    }
                }, {
                    upsert: false,
                    new: false
                }, function(err, data) {
                    if (err) {}
                });
            });
        }
    })
    console.log("attendancetimeedit")
    console.log(req.body);

    Employee.findOne({
        'email': email,
        'companyId': companyId
    }, function(err, companyData) {
        if (companyData) {

            empFn.getCompanyData(companyId, function(comp) {
                console.log(comp.isDefaultJC, comp.jobCosting);

                Employee.findOne({
                    'companyId': companyId,
                    'employeeNo': employeeNo,
                    'active': true
                }).sort({
                    'employeeNo': 'asc'
                }).exec(function(err, empData) {
                    if (empData) {
                        if (comp.isDefaultJC && comp.jobCosting) {
                            if (empData.defaultJC && !workCode) {
                                workCode = empData.defaultJC;
                            }
                            console.log(workCode);
                        }

                        if (objectId) {
                            console.log("object id....");
                            if (req.body.nextDate) {
                                var Hourset = Moment.utc(req.body.nextDate).set('hours', checkTime[0]);
                                var date = Moment.utc(Hourset).set('minute', checkTime[1]);
                                newDate = new Date(Date.parse(date)).toUTCString();
                            }
                            Attendance.findOne({
                                _id: attendanceId
                            }, function(err, detail) {
                                var cnt = 0;
                                async.eachSeries(detail.checkin, function(checkinDetail, callback) {
                                    cnt++;
                                    if (companyData.adminType == "mainAdmin") {
                                        checkinDetail.alterWho = companyData.employeeNo;
                                    } else if (companyData.adminType == "subAdmin") {
                                        checkinDetail.alterWho = companyData.employeeNo;
                                    }
                                    if (checkinDetail.alterWho == companyData.employeeNo && checkinDetail._id == objectId) {
                                        Attendance.update({
                                            'checkin._id': checkinDetail._id,
                                            'date': new Date(checkinDate),
                                            'employeeNo': employeeNo,
                                            'companyId': companyId
                                        }, {
                                            $set: {
                                                'checkin.$.checkTime': newDate,
                                                'checkin.$.checkType': checkType,
                                                'checkin.$.alter': true,
                                                'checkin.$.alterWho': companyData.employeeNo,
                                                'checkin.$.workCode': workCode,
                                                totalValues: blankArray,
                                                allowances: blankArray,
                                                projectFlag: true,
                                            }
                                        }, function(err, attendanceData) {
                                            if (err) {} else {
                                                console.log("done....");
                                                var adminDetil = {
                                                    email: email,
                                                    userType: userTypes
                                                };
                                                calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                    console.log("done1....");
                                                    if (result == 1) {

                                                        empFn.setDashboardFlagSingle(req.body.start, req.body.end, companyId, function(status) {
                                                            if (status) {
                                                                console.log("Dashboard " + status);
                                                                empFn.setMeterDashboardFlagSingle(req.body.checkinDate, companyId, function(meterStatus) {
                                                                    if (meterStatus) {
                                                                        console.log("Meter Dashboard " + meterStatus);
                                                                        console.log(cnt, detail.checkin.length);
                                                                        if (cnt == detail.checkin.length)
                                                                            res.json(true);
                                                                        else
                                                                            callback();
                                                                    }
                                                                });
                                                            }
                                                        });

                                                        // Dashboard.update({
                                                        //     weekEnd: req.body.end,
                                                        //     weekStart: req.body.start,
                                                        //     'companyId': companyId
                                                        // }, {
                                                        //     $set: {
                                                        //         calfalg: false
                                                        //     }
                                                        // }, {
                                                        //     upsert: true,
                                                        //     new: false,
                                                        //     multi: true
                                                        // }, function(err, data) {
                                                        //     if (!err) {

                                                        //         if (cnt == detail.checkin.length) {
                                                        //             res.json(true);
                                                        //         } else
                                                        //             callback();
                                                        //     }
                                                        // });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        if (cnt == detail.checkin.length) {
                                            res.json(true);
                                        } else {
                                            callback();
                                        }
                                    }
                                });
                            });

                        } else {
                            console.log("not object id....");
                            if (req.body.nextDate) {
                                var Hourset = Moment.utc(req.body.nextDate).set('hours', checkTime[0]);
                                var date = Moment.utc(Hourset).set('minute', checkTime[1]);
                                newDate = new Date(Date.parse(date)).toUTCString();
                            }
                            Attendance.findOne({
                                _id: attendanceId
                            }, function(err, detail) {
                                var cnt = 0;
                                async.eachSeries(detail.checkin, function(checkinDetail, callback) {
                                    cnt++;
                                    // console.log(checkinDetail);
                                    if (checkinDetail.alterWho != req.body.employeeNo) {
                                        Attendance.update({
                                            'checkin.checkTime': {
                                                $ne: newDate
                                            },
                                            "date": new Date(checkinDate),
                                            'employeeNo': employeeNo,
                                            'companyId': companyId
                                        }, {
                                            $set: {
                                                totalValues: blankArray,
                                                allowances: blankArray,
                                                projectFlag: true
                                            },
                                            $push: {
                                                checkin: {
                                                    checkTime: newDate,
                                                    checkType: checkType,
                                                    alter: true,
                                                    alterWho: companyData.employeeNo,
                                                    workCode: workCode,
                                                }
                                            }
                                        }, function(err, attendanceData) {
                                            if (err) {} else {
                                                var adminDetil = {
                                                    email: email,
                                                    userType: userTypes
                                                };
                                                calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                    if (result == 1) {
                                                        // Dashboard.update({
                                                        //     weekEnd: req.body.end,
                                                        //     weekStart: req.body.start,
                                                        //     'companyId': companyId
                                                        // }, {
                                                        //     $set: {
                                                        //         calfalg: false
                                                        //     }
                                                        // }, {
                                                        //     upsert: false,
                                                        //     new: false,
                                                        //     multi: true
                                                        // }, function(err, data) {
                                                        //     if (!err) {
                                                        //         if (cnt == detail.checkin.length) {
                                                        //             res.json(true);
                                                        //         } else {
                                                        //             callback();
                                                        //         }
                                                        //     }
                                                        // });
                                                        empFn.setDashboardFlagSingle(req.body.start, req.body.end, companyId, function(status) {
                                                            if (status) {
                                                                console.log("Dashboard " + status);
                                                                empFn.setMeterDashboardFlagSingle(req.body.checkinDate, companyId, function(meterStatus) {
                                                                    console.log("meterStatus " + meterStatus);
                                                                    if (meterStatus) {
                                                                        console.log("Meter Dashboard " + meterStatus);
                                                                        if (cnt == detail.checkin.length)
                                                                            res.json(true);
                                                                        else
                                                                            callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        console.log("not updating *********************************************");
                                        if (cnt == detail.checkin.length) {
                                            res.json(true);
                                        } else {
                                            callback();
                                        }
                                    }
                                });
                            });

                        }
                    }
                });
            });
        } else {}
    });
}

/* JC update */
exports.attendanceJCEdit = function(req, res) {
    // const and post datas
    var email,
        userTypes,
        newDate,
        companyId,
        attendanceId = req.body.attendanceId,
        employeeNo = req.body.employeeNo,
        workCode = req.body.workCode,
        checkinDate = Moment.utc(req.body.checkinDate).format('YYYY-MM-DD'),
        checkingUpdate = req.body.checkinIds,
        blankArray = [],
        companyId = req.session.user,
        email = req.session.email,
        userTypes = req.session.userType;

    // Employee Find
    Employee.findOne({
        'email': email,
        'companyId': companyId
    }, function(err, empData) {
        if (empData) {
            // Attendance Find
            Attendance.findOne({
                _id: attendanceId
            }, function(err, detail) {
                var cntUpdate = 0;
                // Async attendance object
                async.eachSeries(checkingUpdate, function(cu, callbackUpdate) {
                    cntUpdate++;
                    var cnt = 0;
                    // Async checkin
                    async.eachSeries(detail.checkin, function(checkinDetail, callback) {
                        cnt++;
                        if (empData.adminType == "mainAdmin") {
                            checkinDetail.alterWho = empData.employeeNo;
                        } else if (empData.adminType == "subAdmin") {
                            checkinDetail.alterWho = empData.employeeNo;
                        }
                        // console.log("cnt",cnt,cntUpdate);
                        // Only update if match checkin id's
                        if (checkinDetail.alterWho == empData.employeeNo && cu.id == checkinDetail._id) {
                            // Calling function which update data of old JC
                            empFn.setProjectDefaults(detail, checkinDetail.workCode, checkinDate, function(resp) {
                                console.log("old jc done " + resp);
                                if (resp) {
                                    // change project flag
                                    empFn.setProjectFlagIndividual(companyId, workCode, function(status, respNew) {
                                        // console.log(status);
                                        if (status) {
                                            // Updating Attendance
                                            Attendance.update({
                                                'checkin._id': checkinDetail._id,
                                                'date': new Date(checkinDate),
                                                'employeeNo': employeeNo,
                                                'companyId': companyId
                                            }, {
                                                $set: {
                                                    'checkin.$.alter': true,
                                                    'checkin.$.alterWho': empData.employeeNo,
                                                    'checkin.$.alterWorkCode': true,
                                                    'checkin.$.workCode': workCode,
                                                    'totalValues': blankArray,
                                                    'allowances': blankArray,
                                                    'projectFlag': true,
                                                }
                                            }, function(err, attendanceData) {
                                                // console.log("atn update status "+attendanceData);
                                                if (attendanceData) {
                                                    var adminDetil = {
                                                        email: email,
                                                        userType: userTypes
                                                    };
                                                    // calculate new data
                                                    calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                        if (cnt == detail.checkin.length) {
                                                            if (cntUpdate == checkingUpdate.length) {
                                                                console.log("done");
                                                                res.json(true);
                                                            } else
                                                                callbackUpdate();
                                                        } else
                                                            callback();
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            console.log("no change");
                            if (cnt == detail.checkin.length) {
                                if (cntUpdate == checkingUpdate.length) {
                                    res.json(true);
                                } else {
                                    callbackUpdate();
                                }
                            } else {
                                callback();
                            }
                        }
                    });
                });
            });
        }
    });
};

exports.addcomment = function(req, res) {
    var attendanceId = req.body.attendanceId;
    var employeeNo = req.body.employeeNo;
    var checkinDate = Moment.utc(req.body.checkinDate).format('YYYY-MM-DD');
    var comment = req.body.comment;
    Attendance.update({
        '_id': attendanceId,
        'companyId': req.session.user
    }, {
        $set: {
            comment: comment,
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            // console.log(err);
        } else {
            res.json(true);
        }
    });
}

exports.addinouttime = function(req, res) {
    console.log("addinouttime.....");
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
        // console.log("Elseeee............");
    }
    var attendanceId = req.body.attendanceId;
    var checkInTime = req.body.checkInTime.split(':');
    var checkOutime = req.body.checkOutime.split(':');
    var workCodeSet = req.body.workCode;
    var employeeNo = req.body.employeeNo;
    var checkinDate = Moment.utc(req.body.checkinDate).format('YYYY-MM-DD');
    checkinDate = Moment.utc(checkinDate).format('YYYY-MM-DD');
    WeeklyOT.find({
        weekEnd: {
            $gte: checkinDate
        },
        weekStart: {
            $lte: checkinDate
        },
        'employeeNo': employeeNo,
        'companyId': companyId
    }, function(err, weekData) {
        if (err) {} else {
            weekData.forEach(function(data) {
                var id = data._id;
                WeeklyOT.update({
                    '_id': id
                }, {
                    $set: {
                        readflag: true
                    }
                }, {
                    upsert: false,
                    new: false
                }, function(err, data) {
                    if (err) {}
                });
            });
        }
    });
    var InHourset = Moment.utc(checkinDate).set('hours', checkInTime[0]);
    var Indate = Moment.utc(InHourset).set('minute', checkInTime[1]);
    var INnewDate = new Date(Date.parse(Indate)).toUTCString();
    var OutHourset = Moment.utc(checkinDate).set('hours', checkOutime[0]);
    var Outdate = Moment.utc(OutHourset).set('minute', checkOutime[1]);
    var OutnewDate = new Date(Date.parse(Outdate)).toUTCString();
    var inSecond = empFn.toSeconds(req.body.checkInTime);
    var outSecond = empFn.toSeconds(req.body.checkOutime);
    if (inSecond > outSecond) {
        OutnewDate = Moment.utc(OutnewDate).add('days', 1).format();
    }
    var blankArray = [];
    Employee.find({
        'email': email,
        'companyId': companyId
    }, {}, {
        limit: 1
    }, function(err, companyDatas) {
        if (companyDatas.length > 0) {
            var companyData = companyDatas[0];
            Attendance.update({
                "date": new Date(checkinDate),
                'employeeNo': employeeNo,
                'companyId': companyId
            }, {
                $set: {
                    totalValues: blankArray,
                    allowances: blankArray,
                    projectFlag: true,
                },
                $push: {
                    checkin: {
                        $each: [{
                            checkTime: INnewDate,
                            checkType: 'I',
                            alter: true,
                            alterWho: companyData.employeeNo,
                            workCode: workCodeSet
                        }, {
                            checkTime: OutnewDate,
                            checkType: 'O',
                            alter: true,
                            alterWho: companyData.employeeNo,
                            workCode: workCodeSet
                        }]
                    }
                }
            }, function(err, attendanceData) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("push");
                    Attendance.find({
                        "date": new Date(checkinDate),
                        'companyId': companyId,
                        'employeeNo': employeeNo
                    }, {}, {
                        limit: 1
                    }, function(err, employeeAttendances) {
                        if (employeeAttendances.length > 0) {
                            var employeeAttendance = employeeAttendances[0];
                            var employeeNo = employeeAttendance.employeeNo;
                            var shiftStart = new Date(Date.parse(employeeAttendance.shiftStart)).toUTCString();
                            var startHour = Moment.utc(shiftStart).format('HH');
                            var startMinute = Moment.utc(shiftStart).format('mm');
                            var shiftFinish = new Date(Date.parse(employeeAttendance.shiftFinish)).toUTCString();
                            var finishHour = Moment.utc(shiftFinish).format('HH');
                            var finishMinute = Moment.utc(shiftFinish).format('mm');
                            var attendanceDate = Moment.utc(employeeAttendance.date).format();
                            var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                            var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
                            var areaStart = employeeAttendance.areaStart;
                            var areaFinish = employeeAttendance.areaFinish;
                            var chkCnt = 0;
                            if (employeeAttendance.checkin) {
                                employeeAttendance.checkin.forEach(function(checkin) {
                                    chkCnt++;
                                    var checkTime = new Date(Date.parse(checkin.checkTime)).toUTCString();
                                    var checkType = checkin.checkType;
                                    var workCode = checkin.workCode;
                                    var objectId = checkin._id;
                                    var checkTimeUnix = Moment.utc(checkTime).unix();
                                    if (areaStart && areaFinish) {
                                        async.waterfall([function(next) {
                                            if (checkTimeUnix >= areaStart && checkTimeUnix <= areaFinish) {
                                                next(null, 1);
                                            } else {
                                                console.log("checkPrvs");
                                                var nextDate = Moment.utc(attendanceDate).add('days', 1).format('YYYY-MM-DD');
                                                var date = Moment.utc(attendanceDate).format('YYYY-MM-DD');
                                                var previousDate = Moment.utc(attendanceDate).subtract('days', 1).format('YYYY-MM-DD');
                                                Attendance.find({
                                                    "date": new Date(previousDate),
                                                    'companyId': companyId,
                                                    'employeeNo': employeeNo
                                                }, {}, {
                                                    limit: 1
                                                }, function(err, atndDataPrvs) {
                                                    if (atndDataPrvs.length > 0) {
                                                        var atndDataPrv = atndDataPrvs[0];
                                                        Attendance.update({
                                                            date: new Date(date),
                                                            'companyId': companyId,
                                                            'employeeNo': employeeNo
                                                        }, {
                                                            $pull: {
                                                                checkin: {
                                                                    '_id': objectId
                                                                }
                                                            }
                                                        }, {
                                                            upsert: false,
                                                            new: false
                                                        }, function(err, data) {});
                                                        var prvAreaStart = atndDataPrv.areaStart;
                                                        var prvAreaFinish = atndDataPrv.areaFinish;
                                                        if (checkTimeUnix >= prvAreaStart && checkTimeUnix <= prvAreaFinish) {
                                                            Attendance.update({
                                                                "date": new Date(previousDate),
                                                                'companyId': companyId,
                                                                'employeeNo': employeeNo
                                                            }, {
                                                                $push: {
                                                                    checkin: {
                                                                        workCode: workCode,
                                                                        checkTime: checkTime,
                                                                        checkType: checkType
                                                                    }
                                                                }
                                                            }, {
                                                                upsert: false,
                                                                new: false
                                                            }, function(err, data) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    next(null, 1)
                                                                }
                                                            });
                                                        } else {
                                                            Attendance.update({
                                                                "date": new Date(nextDate),
                                                                'companyId': companyId,
                                                                'employeeNo': employeeNo
                                                            }, {
                                                                $push: {
                                                                    checkin: {
                                                                        workCode: workCode,
                                                                        checkTime: checkTime,
                                                                        checkType: checkType
                                                                    }
                                                                }
                                                            }, {
                                                                upsert: false,
                                                                new: false
                                                            }, function(err, data) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    next(null, 1)
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        next(null, 1);
                                                    }
                                                }); //findone
                                            }
                                        }], function(err, result) {
                                            console.log("result");
                                            if (result == 1) {
                                                if (chkCnt == employeeAttendance.checkin.length) {
                                                    var adminDetil = {
                                                        email: email,
                                                        userType: userTypes
                                                    };
                                                    calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                        if (result == 1) {
                                                            empFn.setDashboardFlagSingle(req.body.start, req.body.end, companyId, function(status) {
                                                                if (status) {
                                                                    console.log("Dashboard " + status);
                                                                    empFn.setMeterDashboardFlagSingle(req.body.checkinDate, companyId, function(meterStatus) {
                                                                        if (meterStatus) {
                                                                            console.log("Meter Dashboard " + meterStatus);
                                                                            res.json(true);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                            // Dashboard.update({
                                                            //     weekEnd: req.body.end,
                                                            //     weekStart: req.body.start,
                                                            //     'companyId': companyId
                                                            // }, {
                                                            //     $set: {
                                                            //         calfalg: false
                                                            //     }
                                                            // }, {
                                                            //     upsert: false,
                                                            //     new: false,
                                                            //     multi: true
                                                            // }, function(err, data) {
                                                            //     if (!err) {
                                                            //         res.json(true);
                                                            //     }
                                                            // });
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            console.log('no data');
                        }
                    });
                }
            });
        }
    });
}

exports.addinouttimeByEmp = function(req, res) {
    var email = req.session.email;
    var companyId = req.session.user;
    if (req.body.addIOTime === true) {
        email = req.body.adminEmail;
        companyId = req.body.companyId;
    }
    var attendanceId = req.body.attendanceId;
    var checkInTime = req.body.checkInTime.split(':');
    var checkOutime = req.body.checkOutime.split(':');
    var workCode = req.body.workCode;

    var employeeNo = req.body.employeeNo;
    var checkinDate = Moment.utc(req.body.checkinDate).format('YYYY-MM-DD');

    var companyId = req.session.user;
    checkinDate = Moment.utc(checkinDate).format('YYYY-MM-DD');
    WeeklyOT.find({
        weekEnd: {
            $gte: checkinDate
        },
        weekStart: {
            $lte: checkinDate
        },
        'employeeNo': employeeNo,
        'companyId': companyId
    }, function(err, weekData) {
        if (err) {
            // console.log(err);
        } else {
            weekData.forEach(function(data) {
                var id = data._id;
                WeeklyOT.update({
                    '_id': id
                }, {
                    $set: {
                        readflag: true
                    }
                }, {
                    upsert: false,
                    new: false
                }, function(err, data) {
                    if (err) {
                        // console.log(err);
                    }
                });
            });
        }
    })

    var InHourset = Moment.utc(checkinDate).set('hours', checkInTime[0]);
    var Indate = Moment.utc(InHourset).set('minute', checkInTime[1]);
    var INnewDate = new Date(Date.parse(Indate)).toUTCString();

    var OutHourset = Moment.utc(checkinDate).set('hours', checkOutime[0]);
    var Outdate = Moment.utc(OutHourset).set('minute', checkOutime[1]);
    var OutnewDate = new Date(Date.parse(Outdate)).toUTCString();
    var inSecond = empFn.toSeconds(req.body.checkInTime);
    var outSecond = empFn.toSeconds(req.body.checkOutime);
    if (inSecond > outSecond) {
        OutnewDate = Moment.utc(OutnewDate).add('days', 1).format();
    }
    var blankArray = [];
    Employee.findOne({
        'email': email,
        'companyId': req.session.user
    }, function(err, companyData) {
        if (companyData) {
            // Attendance.update({$where: 'this.date.toJSON().slice(0, 10) == "'+checkinDate+'"', 'employeeNo':employeeNo, 'companyId':companyId},
            Attendance.update({
                "date": new Date(checkinDate),
                'employeeNo': employeeNo,
                'companyId': companyId
            }, {
                $set: {
                    totalValues: blankArray,
                    allowances: blankArray,
                },
                $push: {
                    checkin: {
                        $each: [{
                            checkTime: INnewDate,
                            checkType: 'I',
                            alter: true,
                            alterWho: companyData.employeeNo,
                            workCode: workCode
                        }, {
                            checkTime: OutnewDate,
                            checkType: 'O',
                            alter: true,
                            alterWho: companyData.employeeNo,
                            workCode: workCode
                        }]
                    }
                }
            }, function(err, attendanceData) {
                if (err) {} else {
                    // Attendance.findOne({$where: 'this.date.toJSON().slice(0, 10) == "'+checkinDate+'"','companyId':companyId, 'employeeNo':employeeNo},function(err, employeeAttendance){
                    Attendance.findOne({
                        "date": new Date(checkinDate),
                        'companyId': companyId,
                        'employeeNo': employeeNo
                    }, function(err, employeeAttendance) {
                        if (employeeAttendance) {
                            var employeeNo = employeeAttendance.employeeNo;
                            var shiftStart = new Date(Date.parse(employeeAttendance.shiftStart)).toUTCString();
                            var startHour = Moment.utc(shiftStart).format('HH');
                            var startMinute = Moment.utc(shiftStart).format('mm');
                            var shiftFinish = new Date(Date.parse(employeeAttendance.shiftFinish)).toUTCString();
                            var finishHour = Moment.utc(shiftFinish).format('HH');
                            var finishMinute = Moment.utc(shiftFinish).format('mm');
                            var attendanceDate = Moment.utc(employeeAttendance.date).format();

                            var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                            var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
                            var areaStart = employeeAttendance.areaStart;
                            var areaFinish = employeeAttendance.areaFinish;
                            if (employeeAttendance.checkin) {
                                employeeAttendance.checkin.forEach(function(checkin) {
                                    var checkTime = new Date(Date.parse(checkin.checkTime)).toUTCString();
                                    var checkType = checkin.checkType;
                                    var workCode = checkin.workCode;
                                    var objectId = checkin._id;
                                    var checkTimeUnix = Moment.utc(checkTime).unix();
                                    if (areaStart && areaFinish) {
                                        async.waterfall([function(next) {
                                            if (checkTimeUnix >= areaStart && checkTimeUnix <= areaFinish) {
                                                next(null, 1)
                                            } else {
                                                var nextDate = Moment.utc(attendanceDate).add('days', 1).format('YYYY-MM-DD');
                                                var date = Moment.utc(attendanceDate).format('YYYY-MM-DD');
                                                var previousDate = Moment.utc(attendanceDate).subtract('days', 1).format('YYYY-MM-DD');
                                                Attendance.findOne({
                                                    'date': new Date(previousDate),
                                                    'companyId': companyId,
                                                    'employeeNo': employeeNo
                                                }, function(err, atndDataPrv) {
                                                    if (atndDataPrv) {
                                                        Attendance.update({
                                                            'date': new Date(date),
                                                            'companyId': companyId,
                                                            'employeeNo': employeeNo
                                                        }, {
                                                            $pull: {
                                                                checkin: {
                                                                    '_id': objectId
                                                                }
                                                            }
                                                        }, {
                                                            upsert: false,
                                                            new: false
                                                        }, function(err, data) {
                                                            if (err) {} else {}
                                                        });
                                                        var prvAreaStart = atndDataPrv.areaStart;
                                                        var prvAreaFinish = atndDataPrv.areaFinish;
                                                        if (checkTimeUnix >= prvAreaStart && checkTimeUnix <= prvAreaFinish) {
                                                            Attendance.update({
                                                                'date': new Date(previousDate),
                                                                'companyId': companyId,
                                                                'employeeNo': employeeNo
                                                            }, {
                                                                $push: {
                                                                    checkin: {
                                                                        workCode: workCode,
                                                                        checkTime: checkTime,
                                                                        checkType: checkType,
                                                                        alter: true,
                                                                        alterWho: employeeNo,
                                                                        workCode: workCode
                                                                    }
                                                                }
                                                            }, {
                                                                upsert: false,
                                                                new: false
                                                            }, function(err, data) {;
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    next(null, 1)
                                                                }
                                                            });
                                                        } else {
                                                            Attendance.update({
                                                                'date': new Date(nextDate),
                                                                'companyId': companyId,
                                                                'employeeNo': employeeNo
                                                            }, {
                                                                $push: {
                                                                    checkin: {
                                                                        workCode: workCode,
                                                                        checkTime: checkTime,
                                                                        checkType: checkType,
                                                                        alter: true,
                                                                        alterWho: employeeNo,
                                                                        workCode: workCode
                                                                    }
                                                                }
                                                            }, {
                                                                upsert: false,
                                                                new: false
                                                            }, function(err, data) {
                                                                if (err) {} else {
                                                                    // console.log("esle data...."+data);
                                                                    next(null, 1)
                                                                }
                                                            });
                                                        }
                                                    }
                                                }); //findone
                                            }
                                        }], function(err, result) {
                                            if (result == 1) {
                                                empFn.getHolidays(companyId, function(holidayresult) {
                                                    var checkHoliday = Moment.utc(OutnewDate).format('YYYY-MM-DD');
                                                    if (holidayresult.indexOf(checkHoliday) == -1) {
                                                        if (holidayresult.indexOf(checkinDate) == -1) {
                                                            if (req.body.addIOTime === true) {
                                                                var adminDetil = {
                                                                    email: req.session.email,
                                                                    userType: req.session.userType
                                                                };
                                                                calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                                    if (result == 1) {
                                                                        // Dashboard.update({
                                                                        //     weekEnd: req.body.end,
                                                                        //     weekStart: req.body.start,
                                                                        //     'companyId': req.session.user
                                                                        // }, {
                                                                        //     $set: {
                                                                        //         calfalg: false
                                                                        //     }
                                                                        // }, {
                                                                        //     upsert: true,
                                                                        //     new: false,
                                                                        //     multi: true
                                                                        // }, function(err, data) {
                                                                        //     res.json(true);
                                                                        // });
                                                                        empFn.setDashboardFlagSingle(req.body.start, req.body.end, req.session.user, function(status) {
                                                                            if (status) {
                                                                                console.log("Dashboard " + status);
                                                                                empFn.setMeterDashboardFlag(req.body.start, req.body.end, req.session.user, function(meterStatus) {
                                                                                    if (meterStatus) {
                                                                                        console.log("Meter Dashboard " + meterStatus);
                                                                                        res.json(true);
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                res.json(true);
                                                            }
                                                        } else {
                                                            empFn.addShiftCutoffs(req.body.checkinDate, checkHoliday, req.body.attendanceId, companyData.companyId, req.body.employeeNo, checkHoliday, function(result) {
                                                                if (result) {
                                                                    if (req.body.addIOTime === true) {
                                                                        var adminDetil = {
                                                                            email: req.session.email,
                                                                            userType: req.session.userType
                                                                        };
                                                                        calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                                            if (result == 1) {
                                                                                empFn.setDashboardFlagSingle(req.body.start, req.body.end, req.session.user, function(status) {
                                                                                    if (status) {
                                                                                        console.log("Dashboard Flag updated");
                                                                                        empFn.setMeterDashboardFlag(req.body.start, req.body.end, req.session.user, function(meterStatus) {
                                                                                            if (meterStatus) {
                                                                                                console.log("Meter Dashboard Flag updated");
                                                                                                res.json(true);
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    } else {
                                                                        res.json(true);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        if (checkHoliday == checkinDate) {
                                                            if (req.body.addIOTime === true) {
                                                                var adminDetil = {
                                                                    email: req.session.email,
                                                                    userType: req.session.userType
                                                                };
                                                                calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                                    if (result == 1) {
                                                                        empFn.setDashboardFlagSingle(req.body.start, req.body.end, req.session.user, function(status) {
                                                                            if (status) {
                                                                                console.log("Dashboard Flag updated");
                                                                                empFn.setMeterDashboardFlag(req.body.start, req.body.end, req.session.user, function(meterStatus) {
                                                                                    if (meterStatus) {
                                                                                        console.log("Meter Dashboard Flag updated");
                                                                                        res.json(true);
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                res.json(true);
                                                            }
                                                        } else {
                                                            empFn.addShiftCutoffs(req.body.checkinDate, checkHoliday, req.body.attendanceId, companyData.companyId, req.body.employeeNo, checkHoliday, function(result) {
                                                                if (result) {
                                                                    if (req.body.addIOTime === true) {
                                                                        var adminDetil = {
                                                                            email: req.session.email,
                                                                            userType: req.session.userType
                                                                        };
                                                                        calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                                                            if (result == 1) {
                                                                                empFn.setDashboardFlagSingle(req.body.start, req.body.end, req.session.user, function(status) {
                                                                                    if (status) {
                                                                                        console.log("Dashboard Flag updated");
                                                                                        empFn.setMeterDashboardFlag(req.body.start, req.body.end, req.session.user, function(meterStatus) {
                                                                                            if (meterStatus) {
                                                                                                console.log("Meter Dashboard Flag updated");
                                                                                                res.json(true);
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    } else {
                                                                        res.json(true);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            //console.log(err);
                        }
                    });
                }
            });
        }
    });
}

exports.deleteattendance = function(req, res) {
    var ids = req.params.attendanceids;
    var companyId = req.session.user;
    var idsArray = ids.split(',');
    if (idsArray.length > 0) {
        for (i = 0; i < idsArray.length; i++) {
            var attendanceid = idsArray[i];
            Attendance.remove({
                '_id': attendanceid,
                'companyId': companyId
            }, function(err) {
                if (!err) {
                    res.json(true);
                }
            })
        }
    }
}

exports.deleteCheckins = function(req, res) {
    // console.log(req.params);

    var checkinIds = req.params.checkinIds;
    var attendanceId = req.params.attendanceId;
    var idsArray = checkinIds.split(',');
    var email;
    var companyId;
    var userTypes;

    console.log(req.params);

    // console.log(idsArray);

    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
    }

    Attendance.findOne({
        '_id': attendanceId
    }).exec(function(err, atndataRec) {
        if (atndataRec != null) {
            var checkinDate = atndataRec.date;
            var employeeNo = atndataRec.employeeNo;

            checkinDate = Moment.utc(checkinDate).format('YYYY-MM-DD');
            atndataRec.checkin.forEach(function(atndata) {
                if (atndata.workCode) {
                    Project.find({
                        'companyId': companyId
                    }, function(err, projectDetail) {
                        var tcFound = false;
                        var jcFound = false;
                        projectDetail.forEach(function(prj, index1) {
                            if (prj.JC === atndata.workCode) {
                                jcFound = true;
                                console.log("JCFOUND -----");
                            } else if (prj.tasks.length > 0) {
                                // console.log(prj.tasks);
                                prj.tasks.forEach(function(tc, index2) {
                                    if (tc.taskCode === atndata.workCode) {
                                        tcFound = true;
                                        console.log("TCFOUND -----");
                                    }
                                });
                            }

                            if (tcFound) {
                                console.log("TC flag set");
                                Project.update({
                                    'companyId': companyId,
                                    '_id': prj._id
                                }, {
                                    $set: {
                                        active: true,
                                        calFlag: false,
                                    },
                                    $pull: {
                                        users: {
                                            date: checkinDate,
                                            employeeNo: employeeNo
                                        }
                                    }
                                }, {
                                    upsert: true,
                                    new: false
                                }, function(err, data) {
                                    if (!err) {
                                        console.log("deleted TC*******************************");
                                    }
                                });
                            } else if (jcFound) {
                                Project.update({
                                    'companyId': companyId,
                                    '_id': prj._id
                                }, {
                                    $set: {
                                        calFlag: false,
                                    },
                                    $pull: {
                                        users: {
                                            date: checkinDate,
                                            employeeNo: employeeNo
                                        }
                                    }
                                }, {
                                    upsert: false,
                                    new: false
                                }, function(err, data) {
                                    if (!err) {
                                        console.log("deleted JC*******************************");
                                    }
                                });
                            }

                        });
                    });
                }
            })
            Dashboard.update({
                weekEnd: {
                    $gte: checkinDate
                },
                weekStart: {
                    $lte: checkinDate
                },
                'companyId': companyId
            }, {
                $set: {
                    calfalg: false
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (!err) {
                    console.log("Dashboard updated " + data);
                    empFn.setMeterDashboardFlagSingle(checkinDate, companyId, function(meterStatus) {
                        if (meterStatus) {
                            console.log("Meter Dashboard " + meterStatus);
                            res.json(true);
                        }
                    });
                }
            });

            WeeklyOT.update({
                weekEnd: {
                    $gte: checkinDate
                },
                weekStart: {
                    $lte: checkinDate
                },
                'employeeNo': employeeNo,
                'companyId': companyId
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
                    console.log("WeeklyOT flag true");
                }
            });
            Attendance.update({
                '_id': attendanceId,
                'companyId': companyId
            }, {
                $set: {
                    projectFlag: true
                }
            }, {
                upsert: false,
                new: false
            }, function(err, data) {
                if (!err) {
                    console.log("Project flag true for checkings delete");
                }
            });


            if (idsArray.length > 0) {
                for (i = 0; i < idsArray.length; i++) {
                    var checkinId = idsArray[i];
                    var inout = checkinId.split(':');
                    var In = inout[0];
                    var out = inout[1];
                    var checkinFlag = 0;
                    var checkoutFlag = 0;
                    if (In) {
                        console.log('in');
                        //checkinFlag = 1;
                        Attendance.update({
                                '_id': attendanceId,
                                'companyId': companyId
                            }, {
                                $set: {
                                    totalValues: [],
                                    total: "00:00:00",
                                    totalRounded: "00:00:00",
                                },
                                $pull: {
                                    checkin: {
                                        '_id': In
                                    }
                                }
                            },
                            function(err, attendanceData) {
                                if (err) {
                                    //console.log(err);
                                } else {
                                    checkinFlag = 1;
                                    checkoutfn(res, In, out, checkinFlag, checkoutFlag, attendanceId, companyId);
                                }

                            });
                    }
                    if (out) {
                        console.log('out');
                        //checkoutFlag = 1;
                        Attendance.update({
                                '_id': attendanceId,
                                'companyId': companyId
                            }, {
                                $set: {
                                    totalValues: [],
                                    total: "00:00:00",
                                    totalRounded: "00:00:00"
                                },
                                $pull: {
                                    checkin: {
                                        '_id': out
                                    }
                                }
                            },
                            function(err, attendanceData) {
                                if (err) {
                                    //console.log(err);
                                } else {
                                    //console.log(attendanceData);
                                    var adminDetil = {
                                        email: email,
                                        userType: userTypes
                                    };
                                    calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                        if (result == 1) {
                                            checkoutFlag = 1;
                                            checkoutfn(res, In, out, checkinFlag, checkoutFlag, attendanceId, companyId);
                                        }
                                    });
                                }
                            });
                    }

                    function checkoutfn(res, In, Out, checkinFlag, checkoutFlag, attendanceId, companyId) {

                        console.log("checkoutfn");
                        console.log(In, Out, checkinFlag, checkoutFlag, attendanceId, companyId);

                        if (In && Out && checkinFlag == 1 && checkoutFlag == 1) {
                            res.json(true);
                        } else if (Out && !In && checkoutFlag == 1) {
                            console.log('not an In');
                            var adminDetil = {
                                email: email,
                                userType: userTypes
                            };
                            calculateUpdateAttendance(adminDetil.attendanceId, companyId, function(result) {
                                if (result == 1) {
                                    res.json(true);
                                }
                            });
                        } else if (In && !Out && checkinFlag == 1) {
                            console.log('not an out');
                            var adminDetil = {
                                email: email,
                                userType: userTypes
                            };
                            calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                if (result == 1) {
                                    res.json(true);
                                }
                            });
                        }
                    }
                }
            }
        }
    })
}

exports.getSchedulingDetails = function(req, res) {
    var companyId = req.session.user;
    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart;
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 6;
                } else if (payPeriod == '2weeks') {
                    days = 13;
                } else if (payPeriod == '4weeks') {
                    days = 27;
                } else if (payPeriod == 'monthly') {
                    days = 29;
                }
                var settingDay = '';
                if (WeekdayStart == 'sun') {
                    settingDay = 0;
                } else if (WeekdayStart == 'mon') {
                    settingDay = 1;
                } else if (WeekdayStart == 'tues') {
                    settingDay = 2;
                } else if (WeekdayStart == 'wed') {
                    settingDay = 3;
                } else if (WeekdayStart == 'thurs') {
                    settingDay = 4;
                } else if (WeekdayStart == 'fri') {
                    settingDay = 5;
                } else if (WeekdayStart == 'sat') {
                    settingDay = 6;
                }
                var startDate = Moment().startOf('week').format('YYYY-MM-DD');
                var endDate = Moment().endOf('week').format('YYYY-MM-DD');
                var between = [];
                while (startDate <= endDate) {
                    var dayMatch = Moment(startDate).day();
                    if (dayMatch == settingDay) {
                        between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
                    }
                    startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
                }
                var start = between[0];
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                global.datesArray = [];
                var startDate1 = Moment.utc(start).format('YYYY-MM-DD');
                var endDate1 = Moment.utc(end).format('YYYY-MM-DD');;
                while (startDate1 <= endDate1) {
                    var dates = new Date(startDate1);
                    datesArray.push(dates);
                    startDate1 = Moment.utc(startDate1).add('days', 1).format('YYYY-MM-DD');
                }
                if (req.session.subadmin && companyData.IsUniqueScheduling) {
                    Employee.find({
                        'companyId': companyId,
                        'department': {
                            $in: req.session.subadmin
                        },
                        'active': true
                    }, function(err, employeeData) {
                        if (employeeData) {
                            Attendance.find({
                                shift: {
                                    $ne: ""
                                },
                                'department': {
                                    $in: req.session.subadmin
                                },
                                active: true,
                                'companyId': req.session.user,
                                "date": {
                                    $gte: new Date(start),
                                    $lte: new Date(end)
                                }
                            }).exec(function(err, attendanceData) {
                                scheduling.find({
                                    'companyId': req.session.user
                                }, {}, {
                                    limit: 1
                                }, function(err, datas) {
                                    if (companyData.isSubDepartmentEnable) {
                                        var data = datas[0];
                                        var result = [];
                                        var cnt = 0;
                                        req.session.subadmin.forEach(function(key) {
                                            cnt++;
                                            data.departments.filter(function(item) {
                                                if (item.departmentName == key) {
                                                    result = result.concat(item.sectionList);
                                                }
                                            });
                                            if (cnt == req.session.subadmin.length) {
                                                var result1 = [];
                                                var cnt1 = 0;
                                                result.forEach(function(key) {
                                                    cnt1++;
                                                    data.sectionNames.filter(function(item) {
                                                        if (item.sectionName == key) {
                                                            result1.push(item);
                                                        }
                                                    });
                                                    if (cnt1 == result.length) {
                                                        res.json({
                                                            datesArray: datesArray,
                                                            attendanceData: attendanceData,
                                                            scehdulingData: result1,
                                                            employeeDetail: employeeData
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    } else {
                                        var data = datas[0];
                                        var result = [];
                                        var cnt = 0;
                                        data.sortOrder.forEach(function(key) {
                                            cnt++;
                                            data.sectionNames.filter(function(item) {
                                                if (item.sectionName == key) {
                                                    result.push(item);
                                                }
                                            });
                                            if (cnt == data.sortOrder.length) {
                                                res.json({
                                                    datesArray: datesArray,
                                                    attendanceData: attendanceData,
                                                    scehdulingData: result,
                                                    employeeDetail: employeeData
                                                });
                                            }
                                        })
                                    }
                                })
                            });
                        }
                    });
                } else {
                    Employee.find({
                        'companyId': companyId,
                        'active': true
                    }, function(err, employeeData) {
                        if (employeeData) {
                            Attendance.find({
                                shift: {
                                    $ne: ""
                                },
                                active: true,
                                'companyId': req.session.user,
                                "date": {
                                    $gte: new Date(start),
                                    $lte: new Date(end)
                                }
                            }).exec(function(err, attendanceData) {
                                scheduling.find({
                                    'companyId': req.session.user
                                }, {}, {
                                    limit: 1
                                }, function(err, datas) {
                                    var data = datas[0];
                                    var result = [];
                                    var cnt = 0;
                                    data.sortOrder.forEach(function(key) {
                                        cnt++;
                                        data.sectionNames.filter(function(item) {
                                            if (item.sectionName == key) {
                                                result.push(item);
                                            }
                                        });
                                        if (cnt == data.sortOrder.length) {
                                            res.json({
                                                datesArray: datesArray,
                                                attendanceData: attendanceData,
                                                scehdulingData: result,
                                                employeeDetail: employeeData
                                            });
                                        }
                                    })
                                })
                            });
                        }
                    });
                }
            }
        }
    });
}

exports.schedulingDetailsNext = function(req, res) {
    console.log(req.params);
    var companyId = req.session.user;
    var date = req.params.date;
    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 6;
                } else if (payPeriod == '2weeks') {
                    days = 13;
                } else if (payPeriod == '4weeks') {
                    days = 27;
                } else if (payPeriod == 'monthly') {
                    days = 29;
                }
                var start = Moment.utc(date).format('YYYY-MM-DD');
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                global.datesArray = [];
                var startDate1 = Moment.utc(start).format('YYYY-MM-DD');
                var endDate1 = Moment.utc(end).format('YYYY-MM-DD');;
                while (startDate1 <= endDate1) {
                    var dates = new Date(startDate1);
                    datesArray.push(dates);
                    startDate1 = Moment.utc(startDate1).add('days', 1).format('YYYY-MM-DD');
                }
                if (req.session.subadmin && companyData.IsUniqueScheduling) {
                    Employee.find({
                        'companyId': companyId,
                        'department': {
                            $in: req.session.subadmin
                        },
                        'active': true
                    }, function(err, employeeData) {
                        if (employeeData) {
                            Attendance.find({
                                'department': {
                                    $in: req.session.subadmin
                                },
                                shift: {
                                    $ne: ""
                                },
                                active: true,
                                'companyId': req.session.user,
                                "date": {
                                    $gte: new Date(start),
                                    $lte: new Date(end)
                                }
                            }).exec(function(err, attendanceData) {
                                scheduling.find({
                                    'companyId': req.session.user
                                }, {}, {
                                    limit: 1
                                }, function(err, datas) {
                                    if (companyData.isSubDepartmentEnable) {
                                        var data = datas[0];
                                        var result = [];
                                        var cnt = 0;
                                        req.session.subadmin.forEach(function(key) {
                                            cnt++;
                                            data.departments.filter(function(item) {
                                                if (item.departmentName == key) {
                                                    result = result.concat(item.sectionList);
                                                }
                                            });
                                            if (cnt == req.session.subadmin.length) {
                                                var result1 = [];
                                                var cnt1 = 0;
                                                result.forEach(function(key) {
                                                    cnt1++;
                                                    data.sectionNames.filter(function(item) {
                                                        if (item.sectionName == key) {
                                                            result1.push(item);
                                                        }
                                                    });
                                                    if (cnt1 == result.length) {
                                                        res.json({
                                                            datesArray: datesArray,
                                                            attendanceData: attendanceData,
                                                            scehdulingData: result1,
                                                            employeeDetail: employeeData
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    } else {
                                        var data = datas[0];
                                        var result = [];
                                        var cnt = 0;
                                        data.sortOrder.forEach(function(key) {
                                            cnt++;
                                            data.sectionNames.filter(function(item) {
                                                if (item.sectionName == key) {
                                                    result.push(item);
                                                }
                                            });
                                            if (cnt == data.sortOrder.length) {
                                                res.json({
                                                    datesArray: datesArray,
                                                    attendanceData: attendanceData,
                                                    scehdulingData: result,
                                                    employeeDetail: employeeData
                                                });
                                            }
                                        })
                                    }
                                })
                            });
                        }
                    });
                } else {
                    Employee.find({
                        'companyId': companyId,
                        'active': true
                    }, function(err, employeeData) {
                        if (employeeData) {
                            Attendance.find({
                                shift: {
                                    $ne: ""
                                },
                                active: true,
                                'companyId': req.session.user,
                                "date": {
                                    $gte: new Date(start),
                                    $lte: new Date(end)
                                }
                            }).exec(function(err, attendanceData) {
                                scheduling.findOne({
                                    'companyId': req.session.user
                                }, function(err, data) {
                                    var result = [];
                                    var cnt = 0;
                                    data.sortOrder.forEach(function(key) {
                                        cnt++;
                                        var found = false;
                                        data.sectionNames.filter(function(item) {
                                            if (!found && item.sectionName == key) {
                                                result.push(item);
                                                found = true;
                                            }
                                        });

                                        if (cnt == data.sortOrder.length) {
                                            res.json({
                                                datesArray: datesArray,
                                                attendanceData: attendanceData,
                                                scehdulingData: result,
                                                employeeDetail: employeeData
                                            });
                                        }
                                    })
                                })
                            });
                        }
                    });
                }
            }
        }
    });
}

exports.rosterData = function(req, res) {
    // res.json({customShiftDetail:[],datesArray:[],attendanceData:[]});
    var companyId = req.session.user;
    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 6;
                } else if (payPeriod == '2weeks') {
                    days = 13;
                } else if (payPeriod == '4weeks') {
                    days = 27;
                } else if (payPeriod == 'monthly') {
                    days = 29;
                }
                var settingDay = '';
                if (WeekdayStart == 'sun') {
                    var settingDay = 0;
                } else if (WeekdayStart == 'mon') {
                    var settingDay = 1;
                } else if (WeekdayStart == 'tues') {
                    var settingDay = 2;
                } else if (WeekdayStart == 'wed') {
                    var settingDay = 3;
                } else if (WeekdayStart == 'thurs') {
                    var settingDay = 4;
                } else if (WeekdayStart == 'fri') {
                    var settingDay = 5;
                } else if (WeekdayStart == 'sat') {
                    var settingDay = 6;
                } else {
                    var settingDay = '';
                }
                var startDate = Moment().startOf('week').format('YYYY-MM-DD');
                var endDate = Moment().endOf('week').format('YYYY-MM-DD');
                var between = [];
                while (startDate <= endDate) {
                    var dayMatch = Moment(startDate).day();
                    if (dayMatch == settingDay) {
                        between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
                    }
                    startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
                }

                var start = between[0];
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                global.datesArray = [];
                var startDate1 = start;
                var endDate1 = end;
                while (startDate1 <= endDate1) {
                    var dates = new Date(startDate1);
                    datesArray.push(dates);
                    startDate1 = Moment.utc(startDate1).add('days', 1).format('YYYY-MM-DD');
                }
                // console.log("datesArray..........");
                // console.log(datesArray);
                if (req.session.subadmin) {
                    Attendance.find({
                        'department': {
                            $in: req.session.subadmin
                        },
                        active: true,
                        'companyId': req.session.user,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).exec(function(err, attendanceData) {
                        customShifts.find({
                            'companyId': req.session.user
                        }).exec(function(err, customShiftDetail) {
                            if (customShiftDetail) {
                                res.json({
                                    customShiftDetail: customShiftDetail,
                                    datesArray: datesArray,
                                    attendanceData: attendanceData
                                });
                            }
                        })
                    });
                } else {
                    Attendance.find({
                        active: true,
                        'companyId': req.session.user,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).exec(function(err, attendanceData) {
                        customShifts.find({
                            'companyId': req.session.user
                        }).exec(function(err, customShiftDetail) {
                            res.json({
                                customShiftDetail: customShiftDetail,
                                datesArray: datesArray,
                                attendanceData: attendanceData
                            });
                        });
                    });
                }
            }
        }
    });
}

exports.rosterDataNext = function(req, res) {
    var companyId = req.session.user;
    var date = req.params.date;
    Company.findById(req.session.user, function(err, companyData) {
        if (companyData) {
            if (companyData.payPeriod) {
                var payPeriod = companyData.payPeriod;
                var WeekdayStart = companyData.WeekdayStart
                var days = 0;
                if (payPeriod == 'weekly') {
                    days = 6;
                } else if (payPeriod == '2weeks') {
                    days = 13;
                } else if (payPeriod == '4weeks') {
                    days = 27;
                } else if (payPeriod == 'monthly') {
                    days = 29;
                }
                var start = Moment.utc(date).format('YYYY-MM-DD');
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                global.datesArray = [];
                var startDate1 = start;
                var endDate1 = end;
                while (startDate1 <= endDate1) {
                    var dates = new Date(startDate1);
                    datesArray.push(dates);
                    startDate1 = Moment.utc(startDate1).add('days', 1).format('YYYY-MM-DD');
                }
                if (req.session.subadmin) {
                    Attendance.find({
                        'department': {
                            $in: req.session.subadmin
                        },
                        active: true,
                        'companyId': req.session.user,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).exec(function(err, attendanceData) {
                        customShifts.find({
                            'companyId': req.session.user
                        }).exec(function(err, customShiftDetail) {
                            res.json({
                                customShiftDetail: customShiftDetail,
                                attendanceData: attendanceData,
                                datesArray: datesArray
                            });
                        });
                    });
                } else {
                    Attendance.find({
                        shift: {
                            $ne: ""
                        },
                        active: true,
                        'companyId': req.session.user,
                        "date": {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    }).exec(function(err, attendanceData) {
                        customShifts.find({
                            'companyId': req.session.user
                        }).exec(function(err, customShiftDetail) {
                            res.json({
                                customShiftDetail: customShiftDetail,
                                attendanceData: attendanceData,
                                datesArray: datesArray
                            });
                        });
                    });
                }
            }
        }
    });
}

exports.clearallshift = function(req, res) {
    var companyId = req.session.user;
    var from = req.params.from;
    var to = req.params.to;
    var blankArray = [];
    //console.log(from + to);
    from = Moment.utc(from).format('YYYY-MM-DD');
    to = Moment.utc(to).format('YYYY-MM-DD');


    // Dashboard.update({
    //     weekStart: from,
    //     weekEnd: to,
    //     'companyId': companyId
    // }, {
    //     $set: {
    //         calfalg: false
    //     }
    // }, {
    //     upsert: false,
    //     new: false,
    //     multi: true
    // }, function(err, data) {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    empFn.setDashboardFlagSingle(req.params.from, req.params.to, companyId, function(status) {
        if (status) {
            console.log("Dashboard " + status);
            empFn.setMeterDashboardFlag(req.params.from, req.params.to, companyId, function(meterStatus) {
                if (meterStatus) {
                    console.log("Meter Dashboard " + status);
                    res.json(true);
                }
            });
        }
    });

    if (req.session.subadmin) {
        empFn.updateFn(from, to, companyId, req.session.subadmin, function(resultoffn) {
            if (resultoffn == 1) {
                res.json(true);
            }
        })
    } else {
        empFn.updateFn(from, to, companyId, blankArray, function(resultoffn) {
            if (resultoffn == 1) {
                res.json(true);
            }
        })
    }

}

exports.clearRow = function(req, res) {
    var companyId = req.session.user;
    var from = req.params.from;
    var to = req.params.to;
    var employeeNo = req.params.employeeNo;
    //console.log(from + to);
    from = Moment.utc(from).format('YYYY-MM-DD');
    to = Moment.utc(to).format('YYYY-MM-DD');
    //console.log(from + 'from' +to);
    // Dashboard.update({
    //     weekStart: from,
    //     weekEnd: to,
    //     'companyId': companyId
    // }, {
    //     $set: {
    //         calfalg: false
    //     }
    // }, {
    //     upsert: false,
    //     new: false,
    //     multi: true
    // }, function(err, data) {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    empFn.setDashboardFlagSingle(req.params.from, req.params.to, companyId, function(status) {
        if (status) {
            console.log("Dashboard " + status);
            empFn.setMeterDashboardFlag(req.params.from, req.params.to, companyId, function(meterStatus) {
                if (meterStatus) {
                    console.log("Meter Dashboard " + status);
                    res.json(true);
                }
            });
        }
    });

    empFn.updateRow(from, to, companyId, employeeNo, function(resultoffn) {
        if (resultoffn == 1) {
            res.json(true);
        }
    })
}

exports.shiftChangeScheduling = function(req, res) {
    console.log(req.body);
    var shiftType = "";
    if (req.body.shiftType) {
        shiftType = req.body.shiftType;
    }
    //console.log(req.body);
    var companyId = req.session.user;
    var shift = req.body.shift;
    var date = req.body.date;
    var employeeNo = req.body.employeeNo;
    empFn.getShiftData(shiftType, shift, companyId, function(result) {

        empFn.setallowDelete(companyId, result._id, false, function(cbRes) {
            console.log("scheduling/roster shift flag updated");
        });
        var breakTime = result.breakTime;
        var breakAfter = result.breakAfter;
        var breakIn = result.breakIn;
        var breakAfter2 = result.breakAfter2;
        var breakTime2 = result.breakTime2;
        var breakIn2 = result.breakIn2;

        var shiftStartTime = result.startTime;
        var shiftFinishTime = result.finishTime;

        var nextDate = Moment.utc(date).add('days', 1).format();
        var prvsDate = Moment.utc(date).subtract('days', 1).format();
        var prvDate = Moment.utc(date).subtract('days', 1).format('YYYY-MM-DD');
        var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
        var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
        var shiftColor = result.color;
        var start = '';
        var finish = '';
        // console.log("result");
        if (shiftStartDate == shiftFinishDate) { //console.log('pppppppppp')
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
        var datec = Moment.utc(req.body.date).format('YYYY-MM-DD');

        Dashboard.update({
            'weekEnd': {
                $gte: datec
            },
            'weekStart': {
                $lte: datec
            },
            'companyId': companyId
        }, {
            $set: {
                calfalg: false
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (!err) {
                console.log("Dashboard updated " + data);
                empFn.setMeterDashboardFlag(prvsDate, nextDate, companyId, function(flag) {
                    if (flag)
                        console.log("Meter Dashboard " + flag);
                });
            }
        });

        WeeklyOT.update({
            'weekEnd': {
                $gte: datec
            },
            'weekStart': {
                $lte: datec
            },
            'employeeNo': employeeNo,
            'companyId': companyId
        }, {
            $set: {
                readflag: true
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (err) {}
        });

        Attendance.update({
            'date': new Date(date),
            'employeeNo': employeeNo,
            'companyId': companyId
        }, {
            $set: {
                shift: result.name,
                lastShift: result.name,
                shiftStart: start,
                shiftFinish: finish,
                limitIn: startLimit,
                limitOut: finishLimit,
                breakk: breakTime,
                breakAfter: breakAfter,
                breakAfter2: breakAfter2,
                breakIn: breakIn,
                breakIn2: breakIn2,
                totalValues: blankArray,
                allowances: blankArray,
                // areaFlag: false,
                // calFlag: false,
                Exception: '',
                ExceptionAssign: '',
                addException: false,
                standardHours: '',
                addToStandardHours: '',
                cutException: '',
                addweeklyexc: '',
                shiftColor: shiftColor,
                notaddexc: '',
                shiftType: shiftType,
                projectFlag: true,
            }
        }, {
            upsert: false,
            new: false
        }, function(err, data) {
            if (err) {
                res.json(false);
            } else {
                var attendanceId;
                Attendance.find({
                    'date': new Date(date),
                    'employeeNo': employeeNo,
                    'companyId': companyId
                }).limit(1).exec(function(err, attendanceDataRec) {
                    // console.log(attendanceDataRec);
                    attendanceId = attendanceDataRec[0]._id;
                    console.log(attendanceId);
                });

                Attendance.update({
                    'date': {
                        $gte: new Date(prvsDate),
                        $lte: new Date(nextDate)
                    },
                    'companyId': companyId,
                    'employeeNo': employeeNo
                }, {
                    $set: {
                        totalValues: blankArray,
                        allowances: blankArray,
                        areaFlag: false,
                        calFlag: false,
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true,
                }, function(err, data) {
                    if (err) {
                        res.json(false);
                    } else {
                        console.log("Days between %s to %s flags are updated %d", prvsDate, nextDate, data);
                        calculateArea(companyId, employeeNo, function(result) {
                            console.log("calculateArea " + result);
                            if (result == 1) {
                                var adminDetil = {
                                    email: req.session.email,
                                    userType: req.session.userType
                                };
                                empFn.calculateCheckinIndividual(adminDetil, companyId, employeeNo, datec, function(result) {
                                    if (result == 2) {
                                        // console.log('4) attendance checkins calculation done according to areastart and area finish');
                                        calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                            console.log("calculateUpdateAttendance done");
                                            if (result == 1) {
                                                res.json(true);
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    });
}

exports.rosterDataFilter = function(req, res) {
    var companyId = req.session.user;
    var start = Moment.utc(req.params.fromdate).format('YYYY-MM-DD');
    var end = Moment.utc(req.params.todate).format('YYYY-MM-DD');
    global.datesArray = [];
    var startDate1 = start;
    var endDate1 = end;
    while (startDate1 <= endDate1) {
        var dates = new Date(startDate1);
        datesArray.push(dates);
        startDate1 = Moment.utc(startDate1).add('days', 1).format('YYYY-MM-DD');
    }
    Employee.find({
        'companyId': companyId,
        'active': true
    }, function(err, employeeData) {
        if (employeeData) {
            Attendance.find({
                shift: {
                    $ne: ""
                },
                active: true,
                'companyId': req.session.user,
                "date": {
                    $gte: new Date(start),
                    $lte: new Date(end)
                }
            }).exec(function(err, attendanceData) {
                Shift.find({
                    'companyId': req.session.user
                }).exec(function(err, shiftDetail) {
                    if (shiftDetail) {
                        res.json({
                            attendanceData: attendanceData,
                            shiftDetail: shiftDetail,
                            datesArray: datesArray,
                            employeeDetail: employeeData
                        });
                    }
                })
            });
        }
    });
}

exports.employeeDepartment = function(req, res) {
    var department = req.params.department;
    var subDepartment = req.params.subDeparment;
    var perPage = 30,
        page = req.param('page') > 0 ? req.param('page') : 1
    Employee
        .find({
            'companyId': req.session.user,
            'active': true,
            'department': department,
            'subDepartment': subDepartment
        }).exec(function(err, EmployeeData) {
            res.json({
                "EmployeeData": EmployeeData
            });
        });
}

exports.checkadminDept = function(req, res) {
    if (req.session.subadmin) {
        Employee.findOne({
            'email': req.session.email
        }, function(err, dataCompany) {
            res.json(dataCompany.permission);
        });
    } else {
        res.json(false)
    }
}

exports.managerSigned = function(req, res) {
    console.log(req.params);
    var attendanceId = req.params.atnId;
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
        // console.log("Elseeee............");
    }

    Employee.find({
        'email': email,
        'companyId': companyId
    }).limit(1).exec(function(err, companyDataRec) {
        if (companyDataRec.length > 0) {
            companyDataRec.forEach(function(companyData) {
                Attendance.find({
                    '_id': attendanceId
                }).exec(function(err, atnDataRec) {
                    if (atnDataRec.length > 0) {
                        atnDataRec.forEach(function(atnData) {
                            var manager = "";
                            if (atnData.managerSignedOff == true) {
                                manager = false;
                            } else {
                                manager = true;
                            }
                            Attendance.update({
                                '_id': attendanceId
                            }, {
                                $set: {
                                    managerSignedOff: manager,
                                    alter: true,
                                    alterWho: companyData.employeeNo,
                                }
                            }, {
                                upsert: true,
                                new: false
                            }, function(err, data) {
                                if (err) {
                                    res.json(false);
                                } else {
                                    res.json(true);
                                }
                            })
                        })
                    }
                });
            });
        }
    });
}

exports.managerSigned1 = function(req, res) {
    console.log(req.params);
    var attendanceId = req.params.atnId;
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
        // console.log("Elseeee............");
    }

    Employee.find({
        'email': email,
        'companyId': companyId
    }).limit(1).exec(function(err, companyDataRec) {
        if (companyDataRec.length > 0) {
            companyDataRec.forEach(function(companyData) {
                Attendance.find({
                    '_id': attendanceId
                }).exec(function(err, atnDataRec) {
                    if (atnDataRec.length > 0) {
                        atnDataRec.forEach(function(atnData) {
                            var manager = "";
                            if (atnData.managerSignedOff1 == true) {
                                manager = false;
                            } else {
                                manager = true;
                            }
                            Attendance.update({
                                '_id': attendanceId
                            }, {
                                $set: {
                                    managerSignedOff1: manager,
                                    alter: true,
                                    alterWho: companyData.employeeNo,
                                }
                            }, {
                                upsert: true,
                                new: false
                            }, function(err, data) {
                                if (err) {
                                    res.json(false);
                                } else {
                                    res.json(true);
                                }
                            })
                        })
                    }
                });
            });
        }
    });
}

exports.managerSignedAll = function(req, res) {
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
    }
    Employee.find({
        'email': email,
        'companyId': companyId
    }).limit(1).exec(function(err, companyDataRec) {
        if (companyDataRec.length > 0) {
            companyDataRec.forEach(function(companyData) {
                Attendance.find({
                    '_id': {
                        $in: req.body.attendanceIds
                    },
                    'companyId': companyId
                }).exec(function(err, atnDataRec) {
                    if (atnDataRec.length > 0) {
                        var cnt = 0;
                        atnDataRec.forEach(function(atnData) {
                            cnt++;
                            var manager = "";
                            if (req.body.checkAll == "true") {
                                manager = true;
                            } else {
                                manager = false;
                            }
                            Attendance.update({
                                '_id': atnData._id,
                                'companyId': atnData.companyId
                            }, {
                                $set: {
                                    managerSignedOff: manager,
                                    alter: true,
                                    alterWho: companyData.employeeNo,
                                }
                            }, {
                                upsert: true,
                                new: false
                            }, function(err, data) {
                                if (err) {
                                    if (cnt == req.body.attendanceIds.length)
                                        res.json(false);
                                } else {
                                    if (cnt == req.body.attendanceIds.length)
                                        res.json(true);
                                }
                            })
                        })
                    }
                });
            });
        }
    });
}

exports.managerSignedAll1 = function(req, res) {
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
    }
    Employee.find({
        'email': email,
        'companyId': companyId
    }).limit(1).exec(function(err, companyDataRec) {
        if (companyDataRec.length > 0) {
            companyDataRec.forEach(function(companyData) {
                Attendance.find({
                    '_id': {
                        $in: req.body.attendanceIds
                    },
                    'companyId': companyId
                }).exec(function(err, atnDataRec) {
                    if (atnDataRec.length > 0) {
                        var cnt = 0;
                        atnDataRec.forEach(function(atnData) {
                            cnt++;
                            var manager = "";
                            if (req.body.checkAll == "true") {
                                manager = true;
                            } else {
                                manager = false;
                            }
                            Attendance.update({
                                '_id': atnData._id,
                                'companyId': atnData.companyId
                            }, {
                                $set: {
                                    managerSignedOff1: manager,
                                    alter: true,
                                    alterWho: companyData.employeeNo,
                                }
                            }, {
                                upsert: true,
                                new: false
                            }, function(err, data) {
                                if (err) {
                                    if (cnt == req.body.attendanceIds.length)
                                        res.json(false);
                                } else {
                                    if (cnt == req.body.attendanceIds.length)
                                        res.json(true);
                                }
                            })
                        })
                    }
                });
            });
        }
    });
}

exports.userData = function(req, res) {
    Employee.findOne({
        'email': req.session.email,
        'companyId': req.session.user
    }, function(err, companyData) {
        if (companyData) {
            res.json(companyData);
        }
    });
}

exports.getemployeeshiftdata = function(req, res) {
    var companyId = req.session.user;
    empFn.getShiftData(req.params.shiftType, req.params.shift, companyId, function(result) {
        res.json(result);
    });
}

exports.changeTotalHours = function(req, res) {
    var attendanceId = req.body.atnId;
    var totaltime = req.body.totaltime;
    Attendance.update({
        '_id': attendanceId
    }, {
        $set: {
            totalRounded: totaltime
        }
    }, {
        upsert: true,
        new: false
    }, function(err, data) {
        if (err) {
            res.json(false);
        } else {
            res.json(true);
        }
    })
}

exports.changeCheckinType = function(req, res) {
    console.log(req.params);
    var email;
    var companyId;
    var userTypes;
    if (req.header('Authorization')) {
        var data = JSON.parse(req.header('Authorization'));
        companyId = data.user;
        email = data.email;
        userTypes = data.adminType;
    } else {
        companyId = req.session.user;
        email = req.session.email;
        userTypes = req.session.userType;
    }
    var objectId = req.params.checkinId;
    var attendanceId = req.params.atnid;
    var newChecktype = '';
    if (objectId) {
        Attendance.find({
            '_id': attendanceId
        }).limit(1).exec(function(err, atnDataRec) {
            if (atnDataRec.length > 0) {
                atnDataRec.forEach(function(atnData) {
                    var checkinDate = atnData.date;
                    var employeeNo = atnData.employeeNo;
                    checkinDate = Moment.utc(checkinDate).format('YYYY-MM-DD');

                    Dashboard.update({
                        weekEnd: {
                            $gte: checkinDate
                        },
                        weekStart: {
                            $lte: checkinDate
                        },
                        'companyId': companyId
                    }, {
                        $set: {
                            calfalg: false
                        }
                    }, {
                        upsert: false,
                        new: false,
                        multi: true
                    }, function(err, data) {
                        if (!err) {
                            console.log("Dashboard updated " + data);
                            empFn.setMeterDashboardFlagSingle(checkinDate, companyId, function(status) {
                                if (status) {
                                    console.log("Meter Dashboard " + status);
                                }
                            });
                        }
                    });
                    WeeklyOT.update({
                        weekEnd: {
                            $gte: checkinDate
                        },
                        weekStart: {
                            $lte: checkinDate
                        },
                        'employeeNo': employeeNo,
                        'companyId': companyId
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
                            //console.log(err);
                        } else {
                            //console.log('saved');
                        }
                    });
                    atnData.checkin.forEach(function(dataEmp) {
                        if (dataEmp._id == objectId) {
                            if (dataEmp.checkType == "O" || dataEmp.checkType == "o" || dataEmp.checkType == 0 || dataEmp.checkType == 3) {
                                newChecktype = 1;
                            } else {
                                newChecktype = 3;
                            }
                            Attendance.update({
                                'checkin._id': objectId,
                                '_id': attendanceId
                            }, {
                                $set: {
                                    'checkin.$.checkType': newChecktype,
                                    totalValues: [],
                                    total: "00:00:00",
                                    totalRounded: "00:00:00",
                                }
                            }, {
                                upsert: false,
                                new: false
                            }, function(err, data) {
                                if (err) {
                                    res.json(false);
                                } else {
                                    //console.log('update');
                                    var adminDetil = {
                                        email: email,
                                        userType: userTypes
                                    };
                                    calculateUpdateAttendance(adminDetil, attendanceId, companyId, function(result) {
                                        if (result == 1) {
                                            res.json(true);
                                        }
                                    });
                                }
                            })
                        }
                    });
                })
            }
        });
    }
}

function calculateArea(companyId, employeeNo, callback) {
    console.log("calculateArea...");
    Company.find({
        _id: companyId
    }, function(err, dataCompanys) {
        // console.log("dataCompanys");
        var n = 0;
        if (dataCompanys.length > 0) {
            var dataCompany = dataCompanys[0];
            n++;
            var inRounding = dataCompany.inRounding;
            var inroundupafter = dataCompany.inroundupafter;
            var outRounding = dataCompany.outRounding;
            var outroundupafter = dataCompany.outroundupafter;
            var companyId = dataCompany._id;
            var shiftCutoff = dataCompany.shiftCutoff;
            Attendance.find({
                'employeeNo': employeeNo,
                'companyId': companyId,
                'areaFlag': false,
                'areaFinish': {
                    $ne: null
                }
            }).sort({
                'date': 'asc'
            }).exec(function(err, datas) {
                if (datas) {
                    console.log("atn found with areFlag false " + datas.length);
                    var atnCnt = 0;

                    async.eachSeries(datas, function(employeeAttendance, callbackAtn) {
                        // datas.forEach(function(employeeAttendance) {
                        atnCnt++;
                        var date = employeeAttendance.date;
                        var employeeNumber = employeeAttendance.employeeNo;
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
                        var unix = Moment.utc(attendanceDate).unix();
                        var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                        var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
                        var prvOnShift = employeeAttendance.prvOnShift;
                        var FinishSec = '';
                        var totalShiftSec = '';
                        var prvValue = '';
                        // console.log("1");
                        if (shiftCutoff == true && prvOnShift == true) {
                            // console.log("2");
                            Attendance.update({
                                '_id': id,
                                'employeeNo': employeeNumber,
                                'companyId': companyId
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
                                    console.log("true true updated " + data);
                                    if (atnCnt == datas.length) {
                                        callback(1);
                                    } else {
                                        console.log("another atn...");
                                        callbackAtn();
                                    }
                                }
                            });
                        } else {
                            if (shiftStartDate != shiftFinishDate) {
                                console.log("Different dates");
                                if (shiftCutoff == true) {
                                    prvValue = true;
                                    calFlag = true;
                                }
                                Attendance.find({
                                    date: new Date(nextDate),
                                    'companyId': companyId,
                                    'employeeNo': employeeNumber
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
                                            if (shiftStartDate == shiftFinishDate) {
                                                totalShiftSec = (unix + (parseInt(finishHour) * 3600));
                                                c2 = totalShiftSec;
                                                balance = (c1 - c2);
                                                //console.log(balance + totalShiftSec + date+ '--------------------------------------->>>>>>>>>>>>>>>>>>>>');
                                            } else {
                                                totalShiftSec = (unix + (parseInt(finishHour) + 24) * 3600);
                                                c2 = totalShiftSec;
                                                // balanceVal = unix + ((parseInt(finishHour)+24)*3600)
                                                balance = c1 - c2;
                                            }
                                            var val = (balance / 2);
                                            var areaFinish = c2 + val;
                                            //console.log(areaFinish + 'areaFinishareaFinish');
                                            Attendance.update({
                                                '_id': id,
                                                'employeeNo': employeeNumber,
                                                'companyId': companyId
                                            }, {
                                                $set: {
                                                    areaFinish: areaFinish,
                                                    areaFlag: true,
                                                    prvOnShift: prvValue
                                                }
                                            }, {
                                                upsert: false,
                                                new: false
                                            }, function(err, data) {
                                                if (err) {
                                                    console.log(err);
                                                } else if (data == 1) {
                                                    areaStart = parseInt(areaFinish) + 1;
                                                    //console.log(areaStart +'areaStart' +employeeAttendance.date);
                                                    Attendance.update({
                                                        date: new Date(newaddate),
                                                        'employeeNo': employeeNo,
                                                        'companyId': companyId
                                                    }, {
                                                        $set: {
                                                            areaStart: areaStart,
                                                            areaFlag: true,
                                                            prvOnShift: prvValue
                                                        }
                                                    }, {
                                                        upsert: false,
                                                        new: false
                                                    }, function(err, data) {
                                                        if (err) {} else {
                                                            console.log("different date areas " + data);
                                                            if (atnCnt == datas.length) {
                                                                callback(1);
                                                            } else {
                                                                console.log("another atn...");
                                                                callbackAtn();
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    } else {
                                        console.log("no atn");
                                        if (atnCnt == datas.length) {
                                            callback(1);
                                        } else {
                                            console.log("another atn...");
                                            callbackAtn();
                                        }
                                    }
                                });
                            } else {
                                console.log("Same dates");
                                Attendance.find({
                                    date: new Date(nextDate),
                                    'companyId': companyId,
                                    'employeeNo': employeeNumber
                                }).limit(1).exec(function(err, atnDataRec) {
                                    console.log(atnDataRec.length);
                                    if (atnDataRec.length > 0) {
                                        atnDataRec.forEach(function(atnData) {
                                            var newaddate = Moment.utc(atnData.date).format('YYYY-MM-DD');
                                            var newunix = Moment.utc(newaddate).unix();
                                            var nextStartTime = atnData.shiftStart;
                                            var nextFinishTime = atnData.shiftFinish;
                                            var Hour = Moment.utc(nextStartTime).format('H');
                                            var Minute = Moment.utc(nextStartTime).format('mm');
                                            //var nextStartSec = toSeconds(Hour+':'+Minute+':00');
                                            var c2 = '';
                                            var c1 = (newunix + (parseInt(Hour) * 3600));
                                            var balance = '';
                                            if (shiftStartDate == shiftFinishDate) {
                                                totalShiftSec = (unix + (parseInt(finishHour) * 3600));
                                                c2 = totalShiftSec;
                                                balance = (c1 - c2);
                                                //console.log(balance + totalShiftSec + date+ '--------------------------------------->>>>>>>>>>>>>>>>>>>>');
                                            } else {
                                                totalShiftSec = (unix + (parseInt(finishHour) + 24) * 3600);
                                                c2 = totalShiftSec;
                                                // balanceVal = unix + ((parseInt(finishHour)+24)*3600);
                                                balance = c1 - c2;
                                            }
                                            var val = (balance / 2);
                                            var areaFinish = c2 + val;
                                            //console.log(areaFinish + 'areaFinishareaFinish');
                                            Attendance.update({
                                                '_id': id,
                                                'employeeNo': employeeNumber,
                                                'companyId': companyId
                                            }, {
                                                $set: {
                                                    areaFinish: areaFinish,
                                                    areaFlag: true
                                                }
                                            }, {
                                                upsert: false,
                                                new: false
                                            }, function(err, data) {
                                                if (err) {
                                                    //console.log(err);
                                                } else {
                                                    if (data == 1) {
                                                        areaStart = parseInt(areaFinish) + 1;
                                                        //console.log('yes----------------------');
                                                        //console.log(areaStart +'areaStart' +employeeAttendance.date);
                                                        Attendance.update({
                                                            date: new Date(newaddate),
                                                            'employeeNo': employeeNo,
                                                            'companyId': companyId
                                                        }, {
                                                            $set: {
                                                                areaStart: areaStart,
                                                                areaFlag: true,
                                                                //areaFinish: areaFinish
                                                            }
                                                        }, {
                                                            upsert: false,
                                                            new: false
                                                        }, function(err, data) {
                                                            if (err) {
                                                                //console.log(err);
                                                            } else {
                                                                console.log("same date areas " + data);
                                                                if (atnCnt == datas.length) {
                                                                    callback(1);
                                                                } else {
                                                                    console.log("another atn...");
                                                                    callbackAtn();
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        });
                                    } else {
                                        console.log("no atn");
                                        if (atnCnt == datas.length) {
                                            callback(1);
                                        } else {
                                            console.log("another atn...");
                                            callbackAtn();
                                        }
                                    }
                                });
                            }
                        } //else

                    });
                } else {
                    console.log("no atn found with areFlag false");
                    callback(1)
                }
            });
        } else {
            console.log("no company");
            callback(1)
        }
    });
}

exports.postData = function(req, res) {
    function getMinute(time) {
        var h = time.split(':');
        var m = (h[0] * 60 + parseInt(h[1]));
        //console.log(m + 'minute');
        return m;
    }

    Employee.find({
        'companyId': req.session.user,
        'active': true
    }).sort({
        'employeeNo': 'asc'
    }).exec(function(err, data) {
        if (data) {
            data.forEach(function(employees) {
                var job = employees.job;
                var taskId = employees.taskId;
                var staffId = employees.staffId;
                Attendance.find({
                    'employeeNo': employees.employeeNo,
                    'companyId': employees.companyId,
                    totalRounded: {
                        $ne: '00:00:00'
                    }
                }).exec(function(err, atnData) {
                    if (atnData) {
                        atnData.forEach(function(attendanceData) {
                            var id = attendanceData._id;
                            var date = Moment.utc(attendanceData.date).format('YYYYMMDD');
                            var Minutes = getMinute(attendanceData.totalRounded);

                            var body = '<?xml version="1.0" encoding="utf-8"?>' +
                                '<Timesheet>' +
                                '<ID>33981420</ID> ' +
                                '<Job>' + job + '</Job>' +
                                '<Task>' + taskId + '</Task>' +
                                '<Staff>' + staffId + '</Staff>' +
                                '<Date>' + date + '</Date>' +
                                '<Minutes>' + Minutes + '</Minutes>' +
                                '<Note>fsfsd</Note>' +
                                '</Timesheet>';

                            request.put({
                                    url: 'https://api.workflowmax.com/time.api/update?apiKey=14C10292983D48CE86E1AA1FE0F8DDFE&accountKey=FE4F014AFB6C433DA2F7220496BF448D',
                                    body: body,
                                    headers: {
                                        'Content-Type': 'text/xml'
                                    }
                                },
                                function(error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        Attendance.update({
                                            '_id': id
                                        }, {
                                            $set: {
                                                addWorkflow: true,
                                                // workflowId:
                                            }
                                        }, {
                                            upsert: false,
                                            new: false
                                        }, function(err, data) {
                                            if (err) {
                                                //console.log(err);
                                            }
                                        });
                                        //console.log(body);
                                    } else {
                                        //console.log(error);
                                    }
                                }
                            );
                        });
                    }
                });
            });
        }
    })
}

exports.timeData = function(req, res) {
    var body = '<?xml version="1.0" encoding="utf-8"?>' +
        '<Timesheet>' +
        '<Job>J000001</Job>' +
        '<Task>19092760</Task>' +
        '<Staff>170002</Staff>' +
        '<Date>20140908</Date>' +
        '<Minutes>60</Minutes>' +
        '<Note>gdfgd dfsdf</Note>' +
        '</Timesheet>';
    request.post({
            url: 'https://api.workflowmax.com/time.api/add?apiKey=14C10292983D48CE86E1AA1FE0F8DDFE&accountKey=FE4F014AFB6C433DA2F7220496BF448D',
            body: body,
            headers: {
                'Content-Type': 'text/xml'
            }
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body)
            } else {
                //console.log(error);
                //console.log(response.statusCode);
                response.forEach(function(resNew) {
                    //console.log(resNew);
                });
            }
        }
    );

}

exports.employeeOwnData = function(req, res) {
    var id = req.body.companyId;
    var email = req.body.email;
    //console.log(email);
    Employee
        .findOne({
            'companyId': id,
            'active': true,
            'email': email
        })
        .sort({
            'employeeNo': 'asc'
        })
        .exec(function(err, EmployeeData) {

            res.json({
                "EmployeeData": EmployeeData
            });
        })
}


// Mobile API
exports.getUserdata = function(req, res) {
    //console.log('getUserdata');
    var id = req.body.userid;
    var employeeNo = req.body.employeeNo;
    Employee.find({
        'employeeNo': employeeNo,
        'companyId': id
    }).limit(1).exec(function(err, userRec) {
        if (userRec.length > 0) {
            userRec.forEach(function(user) {
                res.json(user);
            });
        }
    });
}

// Mobile API
exports.employeeHome = function(req, res) {

    console.log("---------------\n\n req.body",req.body);
    var UserAllData={};
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, configDB.conn_conf.secret, function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.',
                    data: err
                });
            } else {
                console.log("------\n line 7418",decoded);
                UserAllData = decoded_doc;
                console.log("line 7420",UserAllData);
                } 
        });
        
    }
    // console.log("-------\n\n line 7493",UserAllData);    

    var id = req.header('Authorization');

    console.log("-----\n\n line 7430 id ....",id);

    var companyId = '';

    if (id) {
        companyId = id;

    } else {
        companyId = req.session.user;
    }
    console.log("-----\n\n line 7440 id ....",companyId);

    if (req.session.subadmin) {
        Employee.find({
            'companyId': companyId,
            department: {
                $in: req.session.subadmin
            },
            'active': true
        }).sort({
            'employeeNo': 'asc'
        }).exec(function(err, EmployeeData) {
            res.json({
                "EmployeeData": EmployeeData
            });
        })
    } else {
        Employee.find({
            'companyId': companyId,
            // 'email': 'hetal@gmail.com',
            'active': true
        }).sort({
            'employeeNo': 'asc'
        }).exec(function(err, EmployeeData) {
            console.log("employeeData",EmployeeData);
            res.json({
                "EmployeeData": EmployeeData
            });
        })
    }
}

// Mobile API
exports.userCurrentCheckin = function(req, res) {
    //console.log('userCurrentCheckin');
    var companyId = req.body.userid;
    var employeeNo = req.body.employeeNo;
    var today = Moment.utc().format('YYYY-MM-DD');
    //console.log(today);
    var status = 'Out';
    // Attendance.find({'companyId':companyId, 'employeeNo':employeeNo, $where: 'this.date.toJSON().slice(0, 10) == "'+today+'"'}).limit(1).exec(function(err, atnDataRec){
    Attendance.find({
        'companyId': companyId,
        'employeeNo': employeeNo,
        "date": new Date(today)
    }).limit(1).exec(function(err, atnDataRec) {
        if (atnDataRec.length > 0) {
            atnDataRec.forEach(function(atnData) {
                if (atnData.checkin.length > 0) {
                    //console.log(atnData);
                    var n = 1;
                    atnData.checkin.sort(empFn.orderByNameAscending);
                    atnData.checkin.forEach(function(checkin) {
                        if (n == (atnData.checkin.length)) {
                            var checkType = checkin.checkType;

                            if (checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I') {
                                status = 'In';
                            } else {
                                if (checkType == 3) {
                                    status = 'Break';
                                } else {
                                    status = 'Out';
                                }
                            }
                            //console.log(status);
                            res.json({
                                'status': status
                            });
                        }
                        n++;

                    });
                    //res.json(atnData);
                } else {
                    //console.log(status);
                    res.json({
                        'status': status
                    });
                }
            })
        }
    });
}

// Mobile API
exports.insertCheckins = function(req, res) {

    console.log("---------------\n\n req.body",req.body);
    var UserAllData={};
    var tokenCheckIn = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, configDB.conn_conf.secret, function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.',
                    data: err
                });
            } else {
                console.log("------\n line 7418",decoded);
                UserAllData = decoded_doc;
                console.log("line 7420",UserAllData);
                } 
        });
        
    }

    var id = req.body.userid;
    var employeeNo = req.body.employeeNo;
    var checktype = req.body.checktype;
    var SN = "";
    var Jobcode = req.body.Jobcode;
    var time = req.body.timeIn;
    var checktime = time + "+0000";
    var lat = req.body.lat;
    var lon = req.body.lon;
    var address = req.body.address;
    //console.log(Jobcode + 'Jobcode');
    //console.log(time +'time');
    //console.log(checktime+'checktime');
    Company.find({
        '_id': id
    }).limit(1).exec(function(err, dataRec) {
        if (dataRec.length > 0) {
            dataRec.forEach(function(data) {
                var passcodes = data.passcode;
                if (passcodes.length > 0) {
                    SN = passcodes[0].no;
                }
                var attendanceMysql = new AttendanceMysql();
                attendanceMysql.employeeNo = employeeNo;
                attendanceMysql.SN = SN;
                attendanceMysql.workCode = Jobcode;
                attendanceMysql.checkTime = checktime;
                attendanceMysql.checkType = checktype;
                attendanceMysql.latitude = lat;
                attendanceMysql.longitude = lon;
                attendanceMysql.address = address;
                attendanceMysql.save(function(err) {

                    if (err) {
                        //console.log(err);
                    } else {
                        res.json(true);
                    }
                });
            })
        }
    });

    /* */

}

//mobile app
exports.checkuserpin = function(req, res) {
    //console.log('user');
    var id = req.body.userId; //
    var pin = req.body.pincode;
    Employee.find({
        'pin': pin,
        'companyId': id
    }).limit(1).exec(function(err, userRec) {
        console.log("userRec",userRec);
        if (userRec.length > 0) {
            userRec.forEach(function(user) {
                res.json({
                    'employeeNo': user.employeeNo
                });
            })
        } else {
            res.json(false);
        }
    });
}

// Mobile API
exports.currentCheckin = function(req, res) {
    console.log("res,",res);
    
    var id = req.header('Authorization')
    var companyId = '';
    if (id) {
        companyId = id;
    } else {
        companyId = req.session.user
    }
    Company.findById(req.session.user, function(err, companyData) {
        console.log("companyData",companyData);
        if (companyData) {
            var today = Moment.utc().tz(companyData.country).format('YYYY-MM-DD');
            //console.log(today +'today');
            // Attendance.find({'companyId':companyId, $where: 'this.date.toJSON().slice(0, 10) == "'+today+'"'},function(err, atnData){
            Attendance.find({
                'companyId': companyId,
                "date": new Date(today)
            }, function(err, atnData) {
                if (atnData) {
                    var checkins = [];
                    var n = 1;
                    res.json(atnData);
                } else {
                    //console.log(err);
                }
            });
        }
    });
}

// Mobile API
exports.checkPwd = function(req, res) {
    // console.log("line 7596 res,",res);
    var id = req.body.userId;
    var email = req.body.email;
    Employee.findOne({
        'email': req.body.email,
        'companyId': id
    }, function(err, user) {
        console.log("line 7596 err,",err);
        console.log("line 7596 user,",user);
        if (err) throw err;
        if (!user) {
            res.json(false);
        } else {
            if (!user.validPassword(req.body.pwd)) {
                SuperAdmin.findOne({}, function(err, adminData) {
                    if (adminData) {
                        if (!adminData.validPassword(req.body.pwd)) {
                            res.json(false);
                        } else {
                            res.json(true);
                        }
                    }
                });
            } else {
                res.json(true);
            }
        }
    });
}

// Mobile API
exports.changeJobcode = function(req, res) {
    var id = req.body.userId;
    var isJobcode = req.body.isJobcode;
    //console.log(id);
    //console.log(isJobcode);
    Company.update({
        '_id': id
    }, {
        $set: {
            jobCosting: isJobcode
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            res.json(false);
        } else {
            res.json(true);
        }
    });
}

// Mobile API
exports.employeeHomeDataDepartment = function(req, res) {
    var department = req.params.department;
    var perPage = 30,
        page = req.param('page') > 0 ? req.param('page') : 1
    Employee
        .find({
            'companyId': req.session.user,
            'active': true,
            'department': department
        }).exec(function(err, EmployeeData) {
            console.log("EmployeeData",EmployeeData);
            res.json({
                "EmployeeData": EmployeeData
            });
        });
    }



module.exports.calculateUpdateAttendance = calculateUpdateAttendance;

function orderByShiftIndexAscending(a, b) {
    if (a.index == b.index) {
        return 0;
    } else if (a.index > b.index) {
        return 1;
    }
    return -1;
}

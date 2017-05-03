var mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    Employee = mongoose.model('Employee'),
    Shift = mongoose.model('Shifts'),
    customShifts = mongoose.model('customShifts'),
    Dashboard = mongoose.model('Dashboard'),
    Rule = mongoose.model('Rule'),
    Attendance = mongoose.model('Attendance'),
    WeeklyOT = mongoose.model('WeeklyOT'),
    empFn = require('../../functions/employeefn.js'),
    Moment = require('moment-timezone'),
    async = require('async');

/*Save Shift Order*/
exports.saveShiftOrder = function(req, res) {
    console.log(req.body.shiftList);
    var cnt = 0;
    async.eachSeries(req.body.shiftList, function(shifts, callback) {
        cnt++;
        Shift.update({
            '_id': shifts._id,
            'name': shifts.name
        }, {
            $set: {
                shiftorder: cnt,
            }
        }, {
            upsert: false,
            new: false
        }, function(err, data) {
            if (cnt == req.body.shiftList.length) {
                res.json(true);
            }
            callback();
        });
    });
}

exports.customShiftcreate = function(req, res) {
    console.log(req.body);
    var userId = req.session.user;
    var name = req.body.shiftName;
    var startTime = req.body.startTime;
    var startLimit = req.body.startLimit;
    var finishTime = req.body.finishTime;
    var finishLimit = req.body.finishLimit;
    var ordinarytime = req.body.ordinarytime;
    var overTime1 = req.body.overTime1;
    var breakTime = req.body.breakTime;
    var breakAfter = req.body.breakAfter;
    var breakIn = req.body.breakIn;
    var overTime2 = ""; /*req.body.overTime2; */
    var breakTime2 = ""; /*req.body.breakTime2; */
    var breakAfter2 = ""; /*req.body.breakAfter2;*/
    var allowance = ""; /*req.body.allowance;*/
    var breakIn2 = ""; /*req.body.breakIn2;*/
    var color = ""; /*req.body.color;*/
    Company.findById(req.session.user, function(err, user) {
        if (user) {
            var shift = new customShifts();
            shift.companyId = userId,
            shift.company = user.companyname,
            shift.name = name;
            shift.startTime = startTime;
            shift.startLimit = startLimit;
            shift.finishTime = finishTime;
            shift.finishLimit = finishLimit;
            shift.ordinarytime = ordinarytime;
            shift.overTime1 = overTime1;
            shift.overTime2 = overTime2;
            shift.breakTime = breakTime;
            shift.breakAfter = breakAfter;
            shift.breakTime2 = breakTime2;
            shift.breakAfter2 = breakAfter2;
            shift.breakIn = breakIn;
            shift.breakIn2 = breakIn2;
            shift.color = color;
            shift.timeZones = [];
            shift.shiftorder = 0;
            shift.tags = [];
            shift.allowance = [];
            shift.save(function(err, data) {
                if (err)
                    throw err;
                var shiftId = data._id;
                console.log("shiftId........" + shiftId);
                res.json(true);
            })
        }
    });
}

exports.create = function(req, res) {
    var userId = req.session.user;
    var name = req.body.name;
    var startTime = req.body.startTime;
    var startLimit = req.body.startLimit;
    var finishTime = req.body.finishTime;
    var finishLimit = req.body.finishLimit;
    /*set 20h default */
    var ordinarytime = "20:00:00";
    var overTime1 = "20:00:00";
    var overTime2 = "20:00:00";
    if(req.body.ordinarytime)
        ordinarytime = req.body.ordinarytime;
    if(req.body.overTime1)
        overTime1 = req.body.overTime1;
    if(req.body.overTime2)
        overTime2 = req.body.overTime2;

    var breakTime = req.body.breakTime;
    var breakAfter = req.body.breakAfter;
    var breakTime2 = req.body.breakTime2;
    var breakAfter2 = req.body.breakAfter2;
    var allowance = req.body.allowance;
    var breakIn = req.body.breakIn;
    var breakIn2 = req.body.breakIn2;
    var color = req.body.color;
    Company.findById(req.session.user, function(err, user) {
        if (user) {
            Shift.find({
                companyId: req.session.user
            }).limit(1).sort('-shiftorder').exec(function(err, docs) {
                var shiftorder = 1;
                if (docs.length > 0) {
                    var doc = docs[0];
                    var max = parseInt(doc.shiftorder);
                    shiftorder = max + 1;
                }
                var shift = new Shift();
                shift.companyId = userId,
                shift.company = user.companyname,
                shift.name = name;
                shift.startTime = startTime;
                shift.startLimit = startLimit;
                shift.finishTime = finishTime;
                shift.finishLimit = finishLimit;
                shift.ordinarytime = ordinarytime;
                shift.overTime1 = overTime1;
                shift.overTime2 = overTime2;
                shift.breakTime = breakTime;
                shift.breakAfter = breakAfter;
                shift.breakTime2 = breakTime2;
                shift.breakAfter2 = breakAfter2;
                shift.breakIn = breakIn;
                shift.breakIn2 = breakIn2;
                shift.color = color;
                shift.timeZones = req.body.timezoneList;
                shift.shiftorder = shiftorder;
                shift.tags = req.body.tags;
                shift.allowDelete = true;
                shift.save(function(err, data) {
                    if (err)
                        throw err;
                    var shiftId = data._id;
                    console.log("shiftId........" + shiftId);
                    if (allowance.length > 0) {
                        for (i = 0; i < allowance.length; i++) {
                            var splitArray = allowance[i].split(",");
                            var allowanceString = splitArray[0];
                            var allowanceSplit = allowanceString.split("/");
                            var allowanceName = allowanceSplit[0];
                            var payAfter = allowanceSplit[1];
                            Shift.update({
                                '_id': shiftId
                            }, {
                                $push: {
                                    allowance: {
                                        name: allowanceName,
                                        active: true,
                                        payAfter: payAfter
                                    }
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
                            });
                        }
                    } else {
                        res.json(true);
                    }
                })
            });
        }
    });
}

exports.edit = function(req, res) {
    var shiftId = req.params.shiftId;
    var companyId = req.session.user;
    Shift.find({
        '_id': shiftId,
        'companyId': companyId
    }, function(err, shiftsdata) {
        if (shiftsdata) {
            shiftsdata.forEach(function(data) {
                res.json(data);
            });
        }
    });
}

exports.update = function(req, res) {
    var shiftChangesStart = req.body.dateStart;
    var companyId = req.session.user;
    var shiftId = req.body._id;
    var shift = req.body.name;
    var startTime = req.body.startTime;
    var startLimit = req.body.startLimit;
    var finishTime = req.body.finishTime;
    var finishLimit = req.body.finishLimit;
    var ordinarytime = req.body.ordinarytime;
    var overTime1 = req.body.overTime1;
    var overTime2 = req.body.overTime2;
    var breakTime = req.body.breakTime;
    var breakAfter = req.body.breakAfter;
    var breakIn = req.body.breakIn;
    var breakTime2 = req.body.breakTime2;
    var breakAfter2 = req.body.breakAfter2;
    var breakIn2 = req.body.breakIn2;
    var color = req.body.color;
    var allowance = req.body.allowance;
    async.waterfall([function(next) {
        Shift.update({
            '_id': shiftId,
            'companyId': companyId
        }, {
            $set: {
                name: shift,
                startTime: startTime,
                startLimit: startLimit,
                finishTime: finishTime,
                finishLimit: finishLimit,
                ordinarytime: ordinarytime,
                overTime1: overTime1,
                overTime2: overTime2,
                breakTime: breakTime,
                breakAfter: breakAfter,
                breakTime2: breakTime2,
                breakAfter2: breakAfter2,
                allowance: [],
                breakIn: breakIn,
                breakIn2: breakIn2,
                color: color,
                tags: req.body.tags,
                timeZones: req.body.timeZoneList,
            }
        }, {
            upsert: true,
            new: false
        }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                if (allowance.length > 0) {
                    for (i = 0; i < allowance.length; i++) {
                        var splitArray = allowance[i].split(",");
                        var allowanceString = splitArray[0];
                        var allowanceSplit = allowanceString.split("/");
                        var allowanceName = allowanceSplit[0];
                        var payAfter = allowanceSplit[1];
                        Shift.update({
                            '_id': shiftId,
                            'companyId': companyId
                        }, {
                            $push: {
                                allowance: {
                                    name: allowanceName,
                                    active: true,
                                    payAfter: payAfter
                                }
                            }
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, data) {
                            if (err) {
                                res.json(false);
                            } else {
                                next(null)
                            }
                        });
                    }
                } else {
                    next(null)
                }
            }
        });
    }], function(err) {
        if (shiftChangesStart) {
            console.log("shift changed ********" + shiftChangesStart);
            var date = Moment(shiftChangesStart).format('YYYY-MM-DD');
            empFn.setDashboardFlag(shiftChangesStart,companyId, function(status){
                if(status)
                    console.log("Dashboard "+status);
            });
            // Dashboard.update({
            //     weekStart: {
            //         $gte: date
            //     },
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
            Attendance.find({
                date: {
                    $gt: date
                },
                'companyId': companyId,
                'shift': shift
            }, function(err, data) {
                if (data.length > 0) {
                    var cnt = 0;
                    async.eachSeries(data, function(employeeAttendance, callback) {
                        // data.forEach(function(employeeAttendance) {
                        cnt++;
                        var date = employeeAttendance.date;
                        var prvDate = Moment.utc(date).subtract('days', 1).format('YYYY-MM-DD');
                        var id = employeeAttendance._id;
                        var employeeNo = employeeAttendance.employeeNo;
                        var nextDate = Moment.utc(employeeAttendance.date).add('days', 1).format();
                        //console.log(nextDate);
                        var shiftStartDate = Moment.utc(startTime).format('YYYY-MM-DD');
                        var shiftFinishDate = Moment.utc(finishTime).format('YYYY-MM-DD');
                        var start = '';
                        var finish = '';
                        if (shiftStartDate == shiftFinishDate) {
                            var sHour = Moment.utc(startTime).format('HH');
                            var sMinute = Moment.utc(startTime).format('mm');
                            var sdate = Moment.utc(date).format('YYYY-MM-DD');
                            var Hourset = Moment.utc(sdate).set('hours', sHour);
                            start = Moment.utc(Hourset).set('minute', sMinute).format();
                            var fHour = Moment.utc(finishTime).format('HH');
                            var fMinute = Moment.utc(finishTime).format('mm');
                            var fdate = Moment.utc(date).format('YYYY-MM-DD');
                            var fHourset = Moment.utc(fdate).set('hours', fHour);
                            finish = Moment.utc(fHourset).set('minute', fMinute).format();
                        } else {
                            //console.log('-----------------------------------------------------------');
                            var sHour = Moment.utc(startTime).format('HH');
                            var sMinute = Moment.utc(startTime).format('mm');
                            var sdate = Moment.utc(date).format('YYYY-MM-DD');
                            var Hourset = Moment.utc(sdate).set('hours', sHour);
                            start = Moment.utc(Hourset).set('minute', sMinute).format();

                            var fHour = Moment.utc(finishTime).format('HH');
                            var fMinute = Moment.utc(finishTime).format('mm');
                            var fdate = Moment.utc(nextDate).format('YYYY-MM-DD');
                            var fHourset = Moment.utc(fdate).set('hours', fHour);
                            finish = Moment.utc(fHourset).set('minute', fMinute).format();
                        }
                        // console.log(prvDate);
                        // console.log(employeeNo);
                        // console.log(companyId);
                        Attendance.update({
                            'employeeNo': employeeNo,
                            'companyId': companyId,
                            date: new Date(prvDate)
                        }, {
                            $set: {
                                areaFlag: false,
                                calFlag: false,
                                readFlag: false
                            }
                        }, {
                            upsert: false,
                            new: false
                        }, function(err, data) {
                            // console.log(err);
                            // console.log(data);
                            if (err) {
                                // console.log(err);
                            } else {
                                // 
                                Attendance.update({
                                    '_id': id
                                }, {
                                    $set: {
                                        shift: shift,
                                        lastShift: shift,
                                        shiftStart: start,
                                        shiftFinish: finish,
                                        limitIn: startLimit,
                                        limitOut: finishLimit,
                                        breakk: breakTime,
                                        breakAfter: breakAfter,
                                        areaFlag: false,
                                        calFlag: false,
                                        readFlag: false,
                                        breakIn: breakIn,
                                        shiftColor: color,
                                        breakTime2: breakTime2,
                                        breakAfter2: breakAfter2,
                                        breakIn2: breakIn2,
                                    }
                                }, {
                                    upsert: true,
                                    new: false
                                }, function(err, data) {
                                    // 		console.log(err);
                                    // console.log(data);
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('set');
                                        callback();
                                    }
                                });
                            }
                        });
                        // console.log("cnt..........."+cnt);
                        if (cnt == data.length) {
                            res.json(true);
                        }
                    });

                } else {
                    res.json(true);
                }
            })
        } else {
            res.json(true);
        }
    })
}

exports.deleteShift = function(req, res) {
    var shiftId = req.body._id;
    var companyId = req.session.user;
    console.log(shiftId + companyId);
    Shift.remove({
        '_id': shiftId,
        'companyId': companyId
    }, function(err) {
        if (!err) {
            res.json(true);
        }
    })
}

exports.createShiftpattern = function(req, res) {
    var userId = req.session.user;
    var name = req.body.name;
    var noOfDays = req.body.noOfDays;
    var ruleStartDate = req.body.ruleStartDate;
    var days = req.body.days;

    Company.findById(userId, function(err, user) {
        if (user) {
            var companyName = user.companyname;
            var rule = new Rule();
            rule.companyId = userId,
                rule.company = companyName,
                rule.name = name;
            rule.noOfDays = noOfDays;
            rule.ruleStartDate = ruleStartDate;
            rule.save(function(err, data) {
                if (err)
                    throw err;
                var shiftPatternId = data._id;
                console.log(days);
                if (days.length > 0) {
                    for (i = 0; i < days.length; i++) {
                        // var splitArray = days[i].split(",");
                        // var daysString = splitArray[0];
                        // var daysSplit = daysString.split(":");
                        var dayValue = days[i].day;
                        var shiftName = days[i].shiftValue;
                        Rule.update({
                            '_id': shiftPatternId
                        }, {
                            $push: {
                                days: {
                                    day: dayValue,
                                    shift: shiftName,
                                    index: i,
                                }
                            }
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, data) {
                            if (err) {
                                //res.json(false);
                            } else {
                                res.json(true);
                            }
                        });
                    }
                } else {
                    res.json(true);
                }

            })
        }
    });
}

exports.editShiftpattern = function(req, res) {
    var shiftPatternId = req.params.shiftPatternId;
    var companyId = req.session.user;
    Rule.find({
        '_id': shiftPatternId,
        'companyId': companyId
    }, function(err, ruleData) {
        if (ruleData) {
            ruleData.forEach(function(data) {
                res.json(data);
            });
        }
    });
}

exports.UpdateShiftpattern = function(req, res) {
    var ruledateStart = req.body.dateStarting;
    var shiftPatternId = req.body._id;
    var companyId = req.session.user;
    var name = req.body.name;
    var noOfDays = req.body.noOfDays;
    var ruleStartDate = req.body.ruleStartDate;
    var days = req.body.days;
    global.daysArray = [];
    global.OnlyDays = [];
    async.waterfall([function(next) {
        Rule.update({
            '_id': shiftPatternId,
            'companyId': companyId
        }, {
            $set: {
                name: name,
                noOfDays: noOfDays,
                ruleStartDate: ruleStartDate,
                days: [],
            }
        }, {
            upsert: true,
            new: false
        }, function(err, data) {
            if (err) {
                res.json(false);
            } else {
                async.eachSeries(days, function(deptDetail, callback) {

                });
                for (i = 0; i < days.length; i++) {
                    // var splitArray = days[i].split(",");
                    // var daysString = splitArray[0];
                    // var daysSplit = daysString.split(":");
                    var dayValue = days[i].day;
                    var shiftName = days[i].shiftValue;
                    Rule.update({
                        '_id': shiftPatternId
                    }, {
                        $push: {
                            days: {
                                day: dayValue,
                                shift: shiftName,
                                index: i,
                            }
                        }
                    }, {
                        upsert: true,
                        new: false
                    }, function(err, data) {
                        if (err) {
                            //res.json(false);
                        } else {
                            res.json(true);
                        }
                    });
                }
                next(null, 1);
            }
        });
    }, function(result, next) {
        empFn.getShiftPatternData(name, companyId, function(result) {
            var noOfDays = result.noOfDays;
            result.days.forEach(function(daysData) {
                var day = daysData.day;
                var shift = daysData.shift;
                daysArray.push({
                    shift: shift,
                    day: day
                });
                // daysArray.push(shift+':'+day); 1
                OnlyDays.push(day);
            });
            // next(null,daysArray,OnlyDays);
            empFn.checkShiftAction(result.days, companyId, function(cbShift) {
                // console.log(cbShift);
                if (cbShift) {
                    next(null, daysArray, OnlyDays);
                }
            });
        })
    }], function(err, result, OnlyDays) {
        if (ruledateStart) {
            // Dashboard.update({
            //     weekEnd: {
            //         $gte: ruledateStart
            //     },
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
            empFn.setDashboardFlag(ruledateStart,companyId, function(status){
                if(status)
                    console.log("Dashboard "+status);
            });
            
            var arrayResult = result;
            Employee.find({
                'shift': name,
                'companyId': companyId,
                active: true
            }, function(err, EmployeeData) {
                if (EmployeeData) {
                    EmployeeData.forEach(function(empData) {
                        var employeeNo = empData.employeeNo;
                        // Attendance.find({$where: 'this.date.toJSON().slice(0, 10) >= "'+ruledateStart+'"', 'employeeNo':employeeNo, 'companyId':companyId},function(err, attendanceData) {
                        Attendance.find({
                            "date": {
                                $gte: new Date(ruledateStart)
                            },
                            'employeeNo': employeeNo,
                            'companyId': companyId
                        }, function(err, attendanceData) {
                            if (attendanceData) {
                                //console.log(attendanceData);
                                var i = 0;
                                attendanceData.forEach(function(atData) {
                                    if (i > arrayResult.length - 1) {
                                        i = 0;
                                    }
                                    var id = atData._id;
                                    var employeeNo = atData.employeeNo;
                                    var currentDate = atData.date;
                                    var dateCu = Moment.utc(currentDate).format('YYYY-MM-DD');
                                    WeeklyOT.find({
                                        weekEnd: {
                                            $gte: dateCu
                                        },
                                        weekStart: {
                                            $lte: dateCu
                                        },
                                        'employeeNo': employeeNo,
                                        'companyId': companyId
                                    }, function(err, weekData) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            weekData.forEach(function(data) {
                                                var id = data._id;
                                                console.log(id);
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
                                                        console.log(err);
                                                    }
                                                });
                                            });
                                        }
                                    })
                                    var prvDate = Moment.utc(currentDate).subtract('days', 1).format('YYYY-MM-DD');
                                    var shiftEarlier = atData.shift;
                                    var shift = '';
                                    if (OnlyDays.indexOf('Day1') > -1) {
                                        var ValueArray = result[i].shift;
                                        shift = ValueArray;
                                        i++;
                                    } else {
                                        //console.log(result + '-------------------------------------');
                                        if (result[i]) {
                                            var ValueArray = result[i].shift;
                                            var dayOfcurrentDate = Moment(currentDate).day();
                                            if (dayOfcurrentDate == empFn.weekDayNumber(result[i].day)) {
                                                shift = ValueArray;
                                                i++;
                                            } else {
                                                var dayString = empFn.weekDayString(dayOfcurrentDate);
                                                var resultIndex = OnlyDays.indexOf(dayString);
                                                var ValueArray = result[resultIndex].shift;
                                                shift = ValueArray;
                                            }
                                        }
                                    }
                                    empFn.getShiftData("", shift, companyId, function(result) {
                                        //var dateModify =  currentDate;
                                        var breakTime = result.breakTime;
                                        var breakAfter = result.breakAfter;
                                        var breakIn = result.breakIn;
                                        var shiftStartTime = result.startTime;
                                        var shiftFinishTime = result.finishTime;
                                        var color = result.color;
                                        var date = currentDate;
                                        //console.log(date);
                                        var nextDate = Moment.utc(date).add('days', 1).format();
                                        //console.log(nextDate);
                                        var shiftStartDate = Moment.utc(shiftStartTime).format('YYYY-MM-DD');
                                        var shiftFinishDate = Moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                                        var start = '';
                                        var finish = '';
                                        if (shiftStartDate == shiftFinishDate) {
                                            //console.log('pppppppppp');
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
                                            //console.log('-----------------------------------------------------------');
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
                                        // Attendance.update({'employeeNo': employeeNo,'companyId':companyId, $where: 'this.date.toJSON().slice(0, 10) == "'+prvDate+'"'},
                                        Attendance.update({
                                            'employeeNo': employeeNo,
                                            'companyId': companyId,
                                            "date": new Date(prvDate)
                                        }, {
                                            $set: {
                                                areaFlag: false,
                                                calFlag: false,
                                                readFlag: false,
                                                totalValues: [],
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
                                            '_id': id
                                        }, {
                                            $set: {
                                                shift: shift,
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
                                                shiftColor: color
                                            }
                                        }, {
                                            upsert: true,
                                            new: false
                                        }, function(err, data) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                    });
                                }); //attendanceData foreach
                                res.json(true);
                            } //if  attendanceData 		
                            else {
                                console.log(err);
                            }
                        }); //attendance find
                    }); //employee foreach
                } // if EmployeeData
            }); //employee find  
        }
    })
}

exports.checkassigneduser = function(req, res) {
    console.log(req.body);
    var shiftPattern = req.body.shiftPattern;
    var companyId = req.session.user;
    Employee.findOne({
        'shift': shiftPattern,
        'companyId': companyId
    }, function(err, ruleData) {
        if (ruleData) {
            res.json(true)
        } else {
            res.json(false)
        }
    });
}

exports.deleteshiftPattern = function(req, res) {
    var shiftPatternId = req.params.shiftPatternId;
    var companyId = req.session.user;
    Rule.remove({
        '_id': shiftPatternId,
        'companyId': companyId
    }, function(err) {
        if (!err) {
            res.json(true);
        }
    });
}

exports.setShiftFlag = function(callbackFlags) {
    console.log("*********** setting flag in shifts *************");
    var compnayCount = 0;
    Company.find({}, function(err, CompanyData) {
        async.eachSeries(CompanyData, function(dataCompany, callbackComp) {
            if (dataCompany) {
                compnayCount++;
                var companyName = dataCompany.companyname;
                var companyId = dataCompany._id;
                var employeeCount = 0;

                console.log("================ COMPANY %d / %d ===================", compnayCount, CompanyData.length);
                console.log("company : %s %s", companyName, companyId);

                Employee.find({
                    'companyId': companyId,
                    'active': true
                }, function(err, employeeData) {
                    if (employeeData.length > 0) {
                        var shiftsArray = [];
                        console.log("Employee --------------> ");
                        async.eachSeries(employeeData, function(dataEmp, callbackEmp) {
                            employeeCount++;
                            var employeeNo = dataEmp.employeeNo;
                            var shift = dataEmp.shift;
                            var firstName = dataEmp.firstName;
                            var lastName = dataEmp.lastName;

                            empFn.getShiftPatternData(shift, companyId, function(result) {
                                if (result === false) {
                                    if (employeeCount == employeeData.length) {
                                        console.log("... again company(1)");
                                        callbackComp();
                                    } else {
                                        console.log("... again employee(1)");
                                        callbackEmp();
                                    }
                                } else {
                                    var resCnt = 0;
                                    async.eachSeries(result.days, function(daysData, callbackDays) {
                                        resCnt++;

                                        var b = shiftsArray.map(function(e) {
                                            return e;
                                        }).indexOf(daysData.shift);

                                        if (b == -1)
                                            shiftsArray.push(daysData.shift);

                                        if (resCnt == result.days.length) {
                                            if (employeeCount == employeeData.length) {
                                                console.log("Done company %d : %s", compnayCount, companyName);
                                                console.log(shiftsArray);
                                                // callbackComp();
                                                Shift.find({
                                                    'companyId': companyId
                                                }).sort({
                                                    shiftorder: 1
                                                }).exec(function(err, sData) {
                                                    var shftCnt = 0;
                                                    async.eachSeries(sData, function(dbShift, callbackShift) {
                                                        var shiftFlag;
                                                        shftCnt++;
                                                        var a = shiftsArray.map(function(e) {
                                                            return e;
                                                        }).indexOf(dbShift.name);

                                                        if (a == -1) {
                                                            shiftFlag = true;
                                                            if (dbShift.name === 'not Working' || dbShift.name === 'OPEN') shiftFlag = false;
                                                        } else shiftFlag = false;

                                                        console.log("... %s shift allowDelete %s ...", dbShift.name, shiftFlag);

                                                        if (sData.length === shftCnt) {
                                                            if (dbShift.allowDelete != shiftFlag) {
                                                                empFn.setallowDelete(companyId, dbShift._id, shiftFlag, function(cbRes) {
                                                                    if (cbRes) {
                                                                        if (compnayCount === CompanyData.length) {
                                                                            callbackFlags(true);
                                                                            // res.send('shift flag updated');
                                                                        } else {
                                                                            callbackComp();
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                console.log("no update needed");
                                                                if (compnayCount === CompanyData.length) {
                                                                    // res.send('shift flag updated');
                                                                    callbackFlags(true);
                                                                } else {
                                                                    callbackComp();
                                                                }
                                                            }
                                                        } else {
                                                            if (dbShift.allowDelete != shiftFlag) {
                                                                empFn.setallowDelete(companyId, dbShift._id, shiftFlag, function(cbRes) {
                                                                    if (cbRes)
                                                                        callbackShift();
                                                                });
                                                            } else {
                                                                console.log("no update needed");
                                                                callbackShift();
                                                            }
                                                        }
                                                    });
                                                });
                                            } else {
                                                callbackEmp();
                                            }
                                        } else callbackDays();
                                    });
                                }
                            });
                        }); //each Employee
                    } else {
                        console.log("no employee found");
                        if (employeeCount == employeeData.length) {
                            console.log("... again company(2)");
                            callbackComp();
                        }
                    }
                }); //Employee
            } else {
                console.log("company " + err);
            }
        }); //Company
    });
};

exports.setAdvanceShiftFlag = function(callbackFlags) {
    console.log("*********** setting flag in shifts *************");
    var compnayCount = 0;
    Company.find({}, function(err, CompanyData) {
        async.eachSeries(CompanyData, function(dataCompany, callbackComp) {
            if (dataCompany) {
                compnayCount++;
                var companyName = dataCompany.companyname;
                var companyId = dataCompany._id;
                var shiftCount = 0;

                console.log("================ COMPANY %d / %d ===================", compnayCount, CompanyData.length);
                // console.log("company : %s %s", companyName, companyId);

                Shift.find({
                    'companyId': companyId,
                }, function(err, shData) {
                    console.log("Total %d shifts for %s : %s", shData.length, companyName, companyId);
                    if (shData.length > 0) {
                        // var shiftsArray = [];
                        async.eachSeries(shData, function(datash, callbackSh) {
                            shiftCount++;
                            // console.log("%s : %s ",shiftCount,datash.name);
                            if (datash.name === 'OPEN' || datash.name === 'not Working') {
                                if (shData.length === shiftCount) {
                                    if (compnayCount === CompanyData.length) {
                                        callbackFlags(true);
                                    } else {
                                        callbackComp();
                                    }
                                } else {
                                    callbackSh();
                                }
                            } else {
                                empFn.setAdvanceAllowDelete(companyId, datash, shiftCount, function(cbRes) {
                                    if (cbRes) {
                                        if (shData.length === shiftCount) {
                                            if (compnayCount === CompanyData.length) {
                                                callbackFlags(true);
                                            } else {
                                                callbackComp();
                                            }
                                        } else {
                                            callbackSh();
                                        }
                                    }
                                });
                            }
                        }); //each Employee
                    } else {
                        console.log("no shift found");
                        callbackComp();
                    }
                }); //Employee
            } else {
                console.log("company " + err);
            }
        }); //Company
    });
};
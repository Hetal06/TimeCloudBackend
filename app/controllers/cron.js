// Const and Libs 
var mysql = require('mysql'),
    configDB = require('../../config/config'),
    con = configDB.conn_conf,
    http = require('http'),
    mongoose = require('mongoose'),
    Holidays = mongoose.model('Holidays'),
    async = require('async'),
    Attendance = mongoose.model('Attendance'),
    Company = mongoose.model('Company'),
    Employee = mongoose.model('Employee'),
    subDeparment = mongoose.model('subDeparment'),
    AttendanceMysql = mongoose.model('AttendanceMysql'),
    Moment = require('moment-timezone'),
    Cron = mongoose.model('Cron'),
    customShifts = mongoose.model('customShifts'),
    Dashboard = mongoose.model('Dashboard'),
    meterDashboard = mongoose.model('meterDashboard'),
    subMeterDashboard = mongoose.model('subMeterDashboard'),
    subDashboard = mongoose.model('subDashboard'),
    WeeklyOT = mongoose.model('WeeklyOT'),
    MongooseCron = mongoose.model('mongooseCron'),
    Project = mongoose.model('Project'),
    empFn = require('../../functions/employeefn.js');
   

// setTimeout(function(){ console.log("i am here");console.log(wamp.getSession()); }, 3000);


var statues = {},
    client;

/* Functions Start */
function handleDisconnect() {
    client = mysql.createConnection(con);
    client.connect(function(err) {
        if (err) {
            console.log("Could not connect to DB" + err);
            client.end();
        } else {
            console.log("Connected to " + con.database + ' on ' + con.host);
        }
    });

    client.on('error', function(err) {
        console.log('db error1', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            client.end();
            handleDisconnect(); // lost due to either server restart, or a
        } else if (err.fatal) {
            client.end();
            console.log('fatal error: ' + err.message);
            handleDisconnect();
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
}

function insertClockinInAttendanceMysql(attendance, callback) {
    global.recordid = 0;
    var cnt = 0;
    attendance.forEach(function(data) {
        cnt++;
        recordid = data.id;
        var employeeNo = data.userid;
        client.query("SELECT TRIM(LEADING '0' FROM badgenumber) as badgenumber FROM userinfo where userid =" + employeeNo, function(err, userBadgeData) {
            console.log(userBadgeData);
            if (userBadgeData) {
                var badgenumber = userBadgeData[0].badgenumber;
                // console.log(badgenumber + 'badgenumber');
                var SN = data.SN;
                var checkTime = data.checktime + "+0000";
                //var checkTime = Moment.utc(time).set('second', 00).format();                  
                var checkType = data.checktype;
                var verifyCode = data.verifyCode;
                var sensorId = data.sensorId;
                var workCode = data.WorkCode;
                var Reserved = data.Reserved;

                var attendanceMysql = new AttendanceMysql();
                attendanceMysql.employeeNo = badgenumber;
                attendanceMysql.SN = SN;
                attendanceMysql.checkTime = checkTime
                attendanceMysql.checkType = checkType;
                attendanceMysql.verifyCode = verifyCode;
                attendanceMysql.sensorId = sensorId;
                attendanceMysql.workCode = workCode;
                attendanceMysql.Reserved = Reserved;
                //attendanceMysql.readFlag = false;                 
                attendanceMysql.save(function(err, save) {
                    console.log(err)
                    console.log(save)
                    if (cnt == attendance.length) {
                        callback(true);
                    }
                });
            } else {
                callback(false);
            }
        });
    });
}

function calculateWeeklyTotal(dataCompany) {
    if (dataCompany) {
        var companyId = dataCompany._id;
        var overtimePeriod = dataCompany.overtimePeriod;
        var isovertime = dataCompany.isovertime;
        var overtimeLevel = dataCompany.overtimeLevel;
        var weeklyNT = dataCompany.weeklyNT;
        var weeklyOT1 = dataCompany.weeklyOT1;
        var payPeriod = dataCompany.payPeriod;
        var WeekdayStart = dataCompany.WeekdayStart;
        var payPeriodStartDate = dataCompany.payPeriodStartDate;
        var shiftCutoff = dataCompany.shiftCutoff;
        var shiftCutoffPeriod = dataCompany.shiftCutoffPeriod;
        var days = 0;
        if (isovertime == true && overtimePeriod == 'weekly') {
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
            if (payPeriod != '2weeks') {
                var start = between[0];
                days = days - 1;
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                Attendance.find({
                    'companyId': companyId,
                    "date": {
                        $gte: new Date(start),
                        $lte: new Date(end)
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
                    var dataRead = 0;
                    if (attendanceData) {
                        attendanceData.forEach(function(attendance) {
                            var employeeNo = attendance.employeeNo;
                            dataRead++;
                            var attendanceId = attendance._id;
                            //console.log(attendance.date +'date');
                            if (overtimePeriod == "weekly") {
                                var NT = '';
                                var addweeklyexc = '';
                                if (attendance.normalTime) {
                                    if (attendance.addweeklyexc) {
                                        addweeklyexc = attendance.addweeklyexc
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

                            var shiftStart = new Date(Date.parse(attendance.shiftStart)).toUTCString();
                            var shiftFinish = new Date(Date.parse(attendance.shiftFinish)).toUTCString();
                            var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                            var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');

                            var current = Moment.utc(attendance.date).format('YYYY-MM-DD')
                            var endDate = Moment.utc(end).subtract('days', 1).format('YYYY-MM-DD')

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
                                    if (cutExceptionTotal != 0) {
                                        NTTotal = NTTotal - cutExceptionTotal
                                    }
                                    var nT = empFn.getSeconds(normalTime) - cutExceptionTotal
                                    var total = empFn.getSeconds(OT1) + empFn.getSeconds(OT2) + nT;
                                    otTotal += total;
                                }
                                // console.log(NTTotal);
                                // console.log(addweeklyexcTotal +'addweeklyexcTotal----------');

                                var n = empFn.secToFormatted(otTotal);
                                //console.log(n +'otTotal' + employeeNo);
                                NTTotal = NTTotal + addweeklyexcTotal;
                                otTotal = otTotal + addweeklyexcTotal;
                                WeeklyOT.update({
                                    'companyId': companyId,
                                    'employeeNo': employeeNo,
                                    'weekStart': start,
                                    'weekEnd': end
                                }, {
                                    $set: {
                                        employeeNo: employeeNo,
                                        companyId: companyId,
                                        weeklyOT1: empFn.secToFormatted(ot1Total),
                                        weeklyOT2: empFn.secToFormatted(ot2Total),
                                        totalOT: empFn.secToFormatted(otTotal),
                                        weeklyNT: empFn.secToFormatted(NTTotal),
                                        readflag: false,
                                    }
                                }, {
                                    upsert: true,
                                    new: false
                                }, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log("done calculation..");
                                });
                            }

                        });
                    }
                });
            }
            if (payPeriod == '2weeks') {
                var start = between[0];
                days = days - 1;
                var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                var weekNewWeekEnd = '';
                var weekNewWeekStart = Moment(start).subtract('days', 7).format("YYYY-MM-DD");;
                var numOfWeeks = [];
                for (var j = 1; j <= 2; j++) {
                    numOfWeeks.push({
                        numOfWeek: j
                    });
                };
                var cnt = 0;
                async.eachSeries(numOfWeeks, function(numWeek, callback) {
                    cnt++;
                    weekNewWeekStart = Moment(weekNewWeekStart).add('days', 7).format("YYYY-MM-DD");
                    weekNewWeekEnd = Moment(weekNewWeekStart).add('days', 6).format("YYYY-MM-DD");
                    Attendance.find({
                        'companyId': companyId,
                        "date": {
                            $gte: new Date(weekNewWeekStart),
                            $lte: new Date(weekNewWeekEnd)
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
                        var dataRead = 0;
                        if (attendanceData) {
                            async.eachSeries(attendanceData, function(attendance, atnCallback) {
                                var employeeNo = attendance.employeeNo;
                                dataRead++;
                                var attendanceId = attendance._id;
                                if (overtimePeriod == "weekly") {
                                    var NT = '';
                                    if (attendance.normalTime) {
                                        if (attendance.addweeklyexc) {
                                            addweeklyexc = attendance.addweeklyexc
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

                                var shiftStart = new Date(Date.parse(attendance.shiftStart)).toUTCString();
                                var shiftFinish = new Date(Date.parse(attendance.shiftFinish)).toUTCString();
                                var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                                var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');

                                var current = Moment.utc(attendance.date).format('YYYY-MM-DD')
                                var endDate = Moment.utc(end).subtract('days', 1).format('YYYY-MM-DD')
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
                                        NTTotal = NTTotal - cutExceptionTotal
                                        var nT = empFn.getSeconds(normalTime) - cutExceptionTotal
                                        var total = empFn.getSeconds(OT1) + empFn.getSeconds(OT2) + nT;
                                        otTotal += total;
                                    }
                                    var n = empFn.secToFormatted(otTotal)
                                        //console.log(n +'otTotal' + employeeNo);
                                    NTTotal = NTTotal + addweeklyexcTotal;
                                    otTotal = otTotal + addweeklyexcTotal;
                                    // console.log("cnt.........."+cnt);
                                    if (cnt == numOfWeeks.length) {
                                        WeeklyOT.find({
                                            'weekStart': start,
                                            'weekEnd': end,
                                            'employeeNo': employeeNo,
                                            'companyId': companyId,
                                        }, function(err, detail) {
                                            ot1Total += empFn.getSeconds(detail[0].weeklyOT1);
                                            ot2Total += empFn.getSeconds(detail[0].weeklyOT2);
                                            NTTotal += empFn.getSeconds(detail[0].weeklyNT);
                                            otTotal += empFn.getSeconds(detail[0].totalOT);
                                            WeeklyOT.update({
                                                'weekStart': start,
                                                'weekEnd': end,
                                                'employeeNo': employeeNo,
                                                'companyId': companyId,
                                            }, {
                                                $set: {
                                                    employeeNo: employeeNo,
                                                    companyId: companyId,
                                                    weeklyOT1: empFn.secToFormatted(ot1Total),
                                                    weeklyOT2: empFn.secToFormatted(ot2Total),
                                                    weeklyNT: empFn.secToFormatted(NTTotal),
                                                    totalOT: empFn.secToFormatted(otTotal),
                                                    readflag: false,
                                                }
                                            }, {
                                                upsert: true,
                                                new: false
                                            }, function(err, data) {
                                                if (err) {
                                                    // callback();
                                                    console.log(err);
                                                }
                                                console.log("done calculation..");
                                                callback();
                                            });
                                        });
                                    } else {
                                        console.log("else...");
                                        WeeklyOT.update({
                                            'weekStart': start,
                                            'weekEnd': end,
                                            'employeeNo': employeeNo,
                                            'companyId': companyId,
                                        }, {
                                            $set: {
                                                employeeNo: employeeNo,
                                                companyId: companyId,
                                                weeklyOT1: empFn.secToFormatted(ot1Total),
                                                weeklyOT2: empFn.secToFormatted(ot2Total),
                                                weeklyNT: empFn.secToFormatted(NTTotal),
                                                totalOT: empFn.secToFormatted(otTotal),
                                                readflag: false,
                                            }
                                        }, {
                                            upsert: true,
                                            new: false
                                        }, function(err, data) {
                                            if (!err) {
                                                console.log("done calculation..");
                                                callback();
                                            }
                                        });
                                    }
                                } else {
                                    atnCallback();
                                }
                            });
                        }
                    });
                });
            }
        } //if
    }
}

function getPayperiod(companyId, callback) {
    Company.findById(companyId, function(err, companyData) {
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
                            /*console.log(newstartD + 'newstartD');    */
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
                    console.log('asdas');
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
                            console.log(result.end);
                            start = result.start;
                            end = result.end;
                            callback({
                                'start': start,
                                'end': end,
                                'days': days
                            })
                        }
                    });
                } else {
                    var start = between[0];
                    var end = Moment.utc(start).add('days', days - 1).format('YYYY-MM-DD');
                    var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                    callback({
                        'start': start,
                        'end': end,
                        'days': days
                    })
                }
            }
        }
    });
}

/*
 * Check default jc status and update workcode
 */
function checkDefaultJCStatus(status, workCode, companyId, employeeNo, callback) {
    if (status && !workCode) {
        console.log("Empty workcode : apply default JC");
        Employee.findOne({
            'companyId': companyId,
            'employeeNo': employeeNo,
            'active': true
        }).exec(function(err, data) {
            if (!err && data) {
                workCode = data.defaultJC;
                console.log("Default Workcode " + workCode);
                callback(workCode);
            } else {
                callback(workCode);
            }
        });
    } else {
        callback(workCode);
    }
}
/* Functions End */

handleDisconnect();

/* Exports start */
exports.deleteRecordsInCron = function(callback) {
    Cron.find({}, {}, {
        sort: {
            'mysqlLastId': -1
        },
        limit: 21
    }, function(err, doc) {
        // console.log(doc);
        if (doc.length > 19) {
            // console.log(doc[19].mysqlLastId);
            Cron.remove({
                mysqlLastId: {
                    $lt: doc[19].mysqlLastId
                }
            }, function(err, deleteCronData) {
                // console.log(err);
                // console.log(deleteCronData);
                console.log("All Records from the cron is deleted..(Except top 20 records..");
                callback(true);
            })
        } else {
            console.log("Not have enough records in cron");
            callback(true);
        }
    });
};

exports.deleteCustomShift = function(callback) {
    console.log("deleteCustomShift.........");
    customShifts.remove({}, function(err, detail) {
        console.log("customShifts has been deleted....");
        callback(true);
    });
};

exports.resetThemongoDbConnection = function(req, res) {
    // mongoose.connection.close();
    mongoose.connect(configDB.url, {
        server: {
            auto_reconnect: true,
            poolSize: 10
        }
    }, function(err) {
        console.log("db connection");
        if (err) {
            console.log('errr');
            console.log(err);
        } else {
            console.log("db connected");
        }
    });

    var logPath = appRoot + '/mongodblogs/logs.txt'
    mongoose.connection.on('error', function(err) {
        console.log(err)
        fs.writeFile(logPath, err, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });
    })
    res.json(true);
};

/* Clockings reload for one day for single or all companies */
exports.reloadClockingsForDay = function(req, res) {
    console.log("reloadClockingsForDay...");
    console.log(req.params.date);
    var startDate1 = Moment.utc(req.params.date).format();
    var dbQuery = '';
    var endDate1 = Moment.utc(startDate1).add('days', 1).format(),
        endDate1 = Moment.utc(endDate1).subtract(1, 'seconds').format();

    empFn.checkCompanyRange(req.params.company, 'clockings', function(state) {
        if (!state)
            res.send('Invalid company');
        else if (!Moment(req.params.date, 'YYYY-MM-DD').isValid())
            res.send('Invalid date , please specify date in YYYY-MM-DD format');
        else {
            console.log(state);
            if (state._id) {
                if (state.sn.length > 0) {
                    var sn = state.sn.join("' OR SN ='");
                    dbQuery = "select * from checkinout where checkTime between '" + startDate1 + "' AND '" + endDate1 + "' AND (SN = '" + sn + "') ORDER BY id";
                } else
                    res.send('No clock has been found for this company');
            } else
                dbQuery = "select * from checkinout where checkTime between '" + startDate1 + "' AND '" + endDate1 + "'  ORDER BY id";
            console.log(dbQuery);
            if (dbQuery) {
                client.query(dbQuery, function(err, attendance) {
                    if (attendance) {
                        if (attendance.length === 0)
                            res.send("No data found");
                        else {
                            // insert data in MongoDB
                            insertClockinInAttendanceMysql(attendance, function(result) {
                                if (result)
                                    res.send("Read and Write successfully done to AttendanceMysqlData..");
                                else
                                    res.send("Read and write failed");
                            });
                        }
                    } else {
                        console.log('mysql' + err);
                        if (err) {
                            res.send("My Sql connection error...");
                            client.end();
                            handleDisconnect();
                        } else
                            res.send("No Data found");
                    }
                }); //connection query
            } else
                res.send('Invalid company');
        }
    });
};

/* Clockings reload for one employee  */
exports.reloadClockingsForEmployee = function(req, res) {
    console.log("reloadClockingsForEmployee...");
    console.log(req.params.date);
    var startDate1 = Moment.utc(req.params.date).format();
    var dbQuery = '';
    var endDate1 = Moment.utc(startDate1).add('days', 1).format(),
        endDate1 = Moment.utc(endDate1).subtract(1, 'seconds').format();

    var employeeNo = req.params.employeeNo;

    empFn.checkCompanyRange(req.params.company, 'clockings', function(state) {
        if (!state)
            res.send('Invalid company');
        else if (isNaN(employeeNo))
            res.send("Invalid employeeNo!!!");
        else if (!Moment(req.params.date, 'YYYY-MM-DD').isValid())
            res.send('Invalid date , please specify date in YYYY-MM-DD format');
        else {
            console.log(state);
            employeeNo = parseInt(employeeNo) + 1;
            if (state._id) {
                if (state.sn.length > 0) {
                    var sn = state.sn.join("' OR SN ='");
                    dbQuery = "select * from checkinout where userid = " + employeeNo + " and checkTime between '" + startDate1 + "' AND '" + endDate1 + "' AND (SN = '" + sn + "') ORDER BY id";
                } else
                    res.send('No clock has been found for this company');
            } else {
                res.send('Please specify valid and individual company');
            }

            // else
            //     dbQuery = "select * from checkinout where checkTime between '" + startDate1 + "' AND '" + endDate1 + "'  ORDER BY id";    
            console.log(dbQuery);
            if (dbQuery) {
                client.query(dbQuery, function(err, attendance) {
                    if (attendance) {
                        if (attendance.length === 0)
                            res.send("No data found");
                        else {
                            //insert data in MongoDB
                            insertClockinInAttendanceMysql(attendance, function(result) {
                                if (result)
                                    res.send("Read and Write successfully done to AttendanceMysqlData.." + attendance.length);
                                else
                                    res.send("Read and write failed");
                            });
                        }
                    } else {
                        console.log('mysql' + err);
                        if (err) {
                            res.send("My Sql connection error...");
                            client.end();
                            handleDisconnect();
                        } else
                            res.send("No data found");
                    }
                }); //connection query
            }
        }
    });
};

/* 
 * This will read checkin data from mysql table and write into our mongodb table(mongoMysql)
 * Runs on 5th sec of a min
 */
exports.readData = function(req, res) {
    console.log("readData...........................................");
    var startDate1 = Moment.utc().subtract('days', 30).format();
    var endDate1 = Moment.utc().add('days', 30).format();

    // Cron check mysqlLastId
    Cron.findOne({}, {}, {
        sort: {
            'mysqlLastId': -1
        }
    }, function(err, doc) {
        if (!err) {
            var max = 0;

            if (doc)
                max = doc.mysqlLastId;

            var readQuery = "select * from checkinout where id >" + max + " AND checkTime between '" + startDate1 + "' AND '" + endDate1 + "'  ORDER BY id limit 100";

            console.log("Read Query " + readQuery);
            client.query(readQuery, function(err, attendance) {
                if (!err) {
                    if (attendance && attendance.length > 0) {
                        console.log("attendance.............line 901" + attendance.length);
                        global.recordid = 0;
                        var atnCnt = 0;
                        // sync
                        async.eachSeries(attendance, function(data, callbackAtn) {
                            atnCnt++;
                            recordid = data.id;
                            var employeeNo = data.userid;
                            var badgeQuery = "SELECT TRIM(LEADING '0' FROM badgenumber) as badgenumber FROM userinfo where userid =" + employeeNo;
                            // console.log("Badge Query " + badgeQuery);
                            client.query(badgeQuery, function(err, userBadgeData) {
                                console.log("======\n\n line 912 userBadgeData", userBadgeData);
                                if (!err) {
                                    if (userBadgeData) {
                                        var attendanceMysql = new AttendanceMysql();
                                        attendanceMysql.employeeNo = userBadgeData[0].badgenumber;
                                        attendanceMysql.SN = data.SN;
                                        attendanceMysql.checkTime = data.checktime + "+0000"
                                        attendanceMysql.checkType = data.checktype;
                                        attendanceMysql.verifyCode = data.verifyCode;
                                        attendanceMysql.sensorId = data.sensorId;
                                        attendanceMysql.workCode = data.WorkCode;
                                        attendanceMysql.Reserved = data.Reserved;
                                        attendanceMysql.save(function(err) {
                                            if (err) {
                                                console.log("Error in Attendance save " + err);
                                                if (atnCnt === attendance.length)
                                                    console.log('1) Read and Write successfully done to AttendanceMysqlData');
                                                else
                                                    callbackAtn();
                                            } else {
                                                cron = new Cron();
                                                cron.mysqlLastId = recordid;
                                                cron.save(function(err) {
                                                    if (!err) {
                                                        if (atnCnt === attendance.length)
                                                            console.log('1) Read and Write successfully done to AttendanceMysqlData');
                                                        else
                                                            callbackAtn();
                                                    } else {
                                                        console.log("mysqlLastId saved ....");
                                                        if (atnCnt === attendance.length)
                                                            console.log('1) Read and Write successfully done to AttendanceMysqlData');
                                                        else
                                                            callbackAtn();
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        console.log("No userbadge found");
                                        if (atnCnt === attendance.length)
                                            console.log('1) Read and Write successfully done to AttendanceMysqlData');
                                        else
                                            callbackAtn();
                                    }
                                } else {
                                    console.log("Mysql Badge Query Error" + err);
                                    client.end();
                                    handleDisconnect();
                                    if (atnCnt === attendance.length)
                                        console.log('1) Read and Write successfully done to AttendanceMysqlData');
                                    else
                                        callbackAtn();
                                }
                            });
                        });
                    } else {
                        console.log("No attendance found");
                    }
                } else {
                    console.log("Mysql Read Query Error " + err);
                    client.end();
                    handleDisconnect();
                }
            });
        }
    });
};

exports.insertAttendanceData = function(req, res) {
    /* This will read checkins data from AttendanceMysql collections and write 
    into attendace collection accroding to date, userid and SN(passcode of the company)*/
    console.log("read data from attendance my sqlsssssssss.......line 983.....................");
    AttendanceMysql.find({}).sort({
        '_id': -1
    }).exec(function(err, dataAttendance) {
        console.log("-----------------------------------------------------\n\n line 987 dataAttendance",dataAttendance);
        if (dataAttendance) {
            dataAttendance.forEach(function(dataA) {
                // async.eachSeries(dataAttendance, function(dataA, callback){
                var id = dataA._id;
                var employeeNo = dataA.employeeNo;
                var latitude = dataA.latitude;
                var longitude = dataA.longitude;
                var address = dataA.address;
                var SN = dataA.SN;
                var workCode = dataA.workCode;
                var chTime = new Date(Date.parse(dataA.checkTime)).toUTCString();

                console.log("chTime -------line 999-----------> " + chTime);

                var checkType = dataA.checkType;
                if (dataA.checkType == '4' || dataA.checkType == '5' || dataA.checkType == '6' || dataA.checkType == '7' || dataA.checkType == '8') {
                    checkType = "I";
                }
               
                var date = Moment.utc(chTime).format('YYYY-MM-DD');
                var start = Moment.utc(date).subtract('days', 1).format('YYYY-MM-DD');
                var end = Moment.utc(date).add('days', 1).format('YYYY-MM-DD');
                var projectWorkFlag = false;
               
                if (workCode && workCode != '0')
                    projectWorkFlag = true;



                Company.find({
                    'passcode.no': SN
                }, function(err, datas) {

                     // console.log("-------- -=========\n\n line 1018 ",datas)
                    if (datas.length > 0) {
                        var companyCnt = 0;
                        async.eachSeries(datas, function(data, callbackCompany) {
                            companyCnt++;
                            var blankArray = [];
                            var companyId = data._id;

                            Attendance.find({
                                employeeNo: employeeNo,
                                companyId: companyId,
                                'checkin.checkTime': chTime,
                                "date": {
                                    $gte: new Date(start),
                                    $lte: new Date(end)
                                }
                            }, function(err, newAtnData) {
                                if (newAtnData.length <= 0) {
                                    // Check Workcode
                                    checkDefaultJCStatus(data.isDefaultJC, workCode, companyId, employeeNo, function(workCode) {
                                        if (workCode)
                                            projectWorkFlag = true;

                                        Attendance.update({
                                            'checkin.checkTime': {
                                                $ne: chTime
                                            },
                                            "date": new Date(date),
                                            employeeNo: employeeNo,
                                            companyId: companyId
                                        }, {
                                            $set: {
                                                readFlag: false,
                                                calFlag: false,
                                                totalValues: blankArray,
                                                projectFlag: projectWorkFlag,
                                            },
                                            $push: {
                                                checkin: {
                                                    workCode: workCode,
                                                    checkTime: chTime,
                                                    checkType: checkType,
                                                    latitude: latitude,
                                                    longitude: longitude,
                                                    address: address
                                                }
                                            }
                                        }, {
                                            upsert: false,
                                            new: false
                                        }, function(err, data) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                if (companyCnt == datas.length) {
                                                    AttendanceMysql.remove({
                                                        '_id': id
                                                    }, function(err, data) {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        // console.log("saved iclock to attendance........................");
                                                        var checkHoliday = Moment.utc(chTime).format('YYYY-MM-DD');
                                                        var prvDate = '';
                                                        var nextDate = '';
                                                        if (checkType === "O" || checkType === "o" || checkType === 0 || checkType === 3) {
                                                            // console.log("ifffffff........");
                                                            nextDate = checkHoliday;
                                                            prvDate = Moment.utc(checkHoliday).subtract('days', 1).format('YYYY-MM-DD');
                                                            Attendance.findOne({
                                                                "date": new Date(prvDate),
                                                                'companyId': companyId,
                                                                'employeeNo': employeeNo
                                                            }, function(err, employeeAttendance) {
                                                                if (employeeAttendance) {
                                                                    empFn.getHolidays(companyId, function(holidayresult) {
                                                                        console.log("ifffffffff previous employeeAttendance");
                                                                        if (holidayresult.indexOf(checkHoliday) == -1) {
                                                                            console.log("holidayresult if");
                                                                            var i = 0;
                                                                            employeeAttendance.checkin.forEach(function(detail) {
                                                                                i++;
                                                                                if (i == employeeAttendance.checkin.length) {
                                                                                    // console.log(detail);
                                                                                    if (detail.checkType == "i" || detail.checkType == "I") {
                                                                                        var checkHolidays = Moment.utc(detail.checkTime).format('YYYY-MM-DD');
                                                                                        // console.log("checkHolidays................"+checkHolidays);
                                                                                        if (holidayresult.indexOf(checkHolidays) == -1) {
                                                                                            console.log("result" + holidayresult);
                                                                                        } else {
                                                                                            empFn.addShiftCutoffs(prvDate, nextDate, employeeAttendance._id, employeeAttendance.companyId, employeeAttendance.employeeNo, nextDate, function(result) {
                                                                                                console.log("addShiftCutoffs done");
                                                                                                // if(result){
                                                                                                //  callback();
                                                                                                // }
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }
                                                                            });
                                                                        } else {
                                                                            console.log("holidayresult else");
                                                                            empFn.addShiftCutoffs(prvDate, nextDate, employeeAttendance._id, employeeAttendance.companyId, employeeAttendance.employeeNo, nextDate, function(result) {
                                                                                // if(result){
                                                                                //  callback();
                                                                                // }
                                                                            });
                                                                        }
                                                                    });
                                                                } else {
                                                                    console.log("else" + employeeAttendance);
                                                                }
                                                            });
                                                            /*} else {
                                                                console.log("esleeeeeeeeee........");
                                                                callback();*/
                                                        }
                                                    });
                                                } else {
                                                    callbackCompany();
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    AttendanceMysql.remove({
                                        '_id': id
                                    }, function(err, data) {
                                        if (err) {
                                            // callback();
                                            console.log(err);
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        //console.log("esleeeeeeeeee..........");
                        AttendanceMysql.remove({
                            '_id': id
                        }, function(err, data) {
                            if (err) {
                                // callback();
                                console.log(err);
                            }
                        });
                    }
                });
            });
            console.log('1) Read and Write successfully done to attendance from attendanceMysql');
        } else {
            console.log(err);
        }
    });
};

exports.calculateWeeklyOtOfCompany = function(req, res) {
    console.log("calculateWeeklyOtOfCompany......................");
    console.log("req.session.user........" + req.session.user);
    var payperiodFn = function(currentDate1, startD, endD, callback) {
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
        // var days  = 14;
        // var start = between[0];
        // var end   = Moment.utc(start).add('days',days).format('YYYY-MM-DD');
        // var prv   = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');

    /* this will calculate weeklyOT of the current week of each employee with shiftCutoff */
    var cnt = 0;
    WeeklyOT.find({
        companyId: req.session.user
    }, function(err, overtimeData) {
        if (overtimeData.length > 0) {
            async.eachSeries(overtimeData, function(ot, callback) {
                cnt++;
                // console.log("====================================");
                // console.log(ot);
                // console.log("====================================");
                // overtimeData.forEach(function(ot){ 
                var weekStart = ot.weekStart;
                var weekEnd = ot.weekEnd;
                var companyId = ot.companyId;
                var employeeNo = ot.employeeNo;
                Company.findOne({
                    '_id': companyId
                }, function(err, dataCompany) {
                    // console.log(dataCompany);
                    var companyId = dataCompany._id;
                    var overtimePeriod = dataCompany.overtimePeriod;
                    var overtimeLevel = dataCompany.overtimeLevel;
                    var weeklyNT = dataCompany.weeklyNT;
                    var weeklyOT1 = dataCompany.weeklyOT1;
                    var shiftCutoff = dataCompany.shiftCutoff;
                    var shiftCutoffPeriod = dataCompany.shiftCutoffPeriod;
                    // console.log(companyId + employeeNo);
                    console.log(employeeNo);
                    console.log(companyId);
                    console.log(weekStart);
                    console.log(weekEnd);
                    var readData = "";
                    // Attendance.count({'companyId':companyId, 'employeeNo':employeeNo, total: { $ne: '00:00:00' }, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+weekStart, $lt: 'this.date.toJSON().slice(0, 10) == '+weekEnd }}).exec(function(err, resultCnt){
                    Attendance.count({
                        'companyId': companyId,
                        'employeeNo': employeeNo,
                        "date": {
                            $gte: new Date(weekStart),
                            $lt: new Date(weekEnd)
                        },
                        total: {
                            $ne: '00:00:00'
                        },
                    }).exec(function(err, resultCnt) {
                        // console.log("=========*********************************************========================");
                        // console.log(resultCnt);
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
                            // console.log(resultCnt1);
                            // console.log("=========*********************************************========================");
                            if (resultCnt1 == resultCnt) {
                                // console.log("sameee.......");
                                // console.log(employeeNo);
                                // console.log(companyId);                        
                                // console.log(weekStart);
                                // console.log(weekEnd);
                                Attendance.find({
                                    'companyId': companyId,
                                    'employeeNo': employeeNo,
                                    "date": {
                                        $gte: new Date(weekStart),
                                        $lte: new Date(weekEnd)
                                    }
                                }).sort({
                                    'date': 'asc'
                                }).exec(function(err, attendanceData) {
                                    // console.log(attendanceData);
                                    // console.log("cnt0........."+cnt);
                                    var ot1Total = 0;
                                    var ot2Total = 0;
                                    var otTotal = 0;
                                    var NTTotal = 0;
                                    var normalTimeTotal = 0;
                                    var cutExceptionTotal = 0;
                                    var addweeklyexcTotal = 0;
                                    if (attendanceData.length > 0) {
                                        // console.log("ifff");
                                        var dataRead = 0;
                                        async.eachSeries(attendanceData, function(attendance, callback1) {
                                            // attendanceData.forEach(function(attendance){
                                            dataRead++;
                                            var attendanceId = attendance._id;
                                            if (overtimePeriod == "weekly") {
                                                var NT = '';
                                                if (attendance.normalTime) {
                                                    if (attendance.addweeklyexc) {
                                                        addweeklyexc = attendance.addweeklyexc
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
                                                // console.log("dataRead...."+dataRead);
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
                                                    NTTotal = NTTotal - cutExceptionTotal
                                                    var nT = empFn.getSeconds(normalTime) - cutExceptionTotal
                                                    var total = empFn.getSeconds(OT1) + empFn.getSeconds(OT2) + nT;
                                                    otTotal += total;
                                                }
                                                var n = empFn.secToFormatted(otTotal);
                                                //console.log(n +'otTotal' + employeeNo);
                                                NTTotal = NTTotal + addweeklyexcTotal;
                                                otTotal = otTotal + addweeklyexcTotal;
                                                WeeklyOT.update({
                                                    'weekStart': weekStart,
                                                    'weekEnd': weekEnd,
                                                    'employeeNo': employeeNo,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        employeeNo: employeeNo,
                                                        companyId: companyId,
                                                        weeklyOT1: empFn.secToFormatted(ot1Total),
                                                        weeklyOT2: empFn.secToFormatted(ot2Total),
                                                        totalOT: empFn.secToFormatted(otTotal),
                                                        weeklyNT: empFn.secToFormatted(NTTotal),
                                                        readflag: false,
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    //  console.log("data");
                                                    // console.log("callback");
                                                    // //   if(cnt<=3)
                                                    if (cnt == overtimeData.length) {
                                                        res.json(true);
                                                    }
                                                    callback();
                                                });
                                            }
                                            callback1();
                                        });
                                    } else {
                                        // console.log("cnt........."+cnt);
                                        // console.log(cnt);
                                        //if(cnt<5) {
                                        callback();
                                        //}                                     
                                    }
                                });
                            } else {
                                callback();
                            }
                        });
                    });
                });
            });
        }
    });
};

exports.calculateWeeklyOt = function(req, res) {
    /* this will calculate weeklyOT of the current week of each employee with shiftCutoff */
    Company.find({}, function(err, CompanyData) {
        CompanyData.forEach(function(dataCompany) {
            calculateWeeklyTotal(dataCompany);
        });
        console.log('6) weekly total overtime calculated');
    });
};

exports.calculateWeeklyOtRecal1 = function(val) {
    console.log("calculateWeeklyOtRecal1 for ............... " + val);
    Company.find({
        _id: val
    }, function(err, CompanyData) {
        CompanyData.forEach(function(dataCompany) {
            calculateWeeklyTotal(dataCompany);
            // if(dataCompany){
            //  var companyId = dataCompany._id;  
            //  // console.log('weekly+++++++++++'+companyId);
            //  var overtimePeriod = dataCompany.overtimePeriod;
            //  var isovertime = dataCompany.isovertime;

            //  var overtimeLevel = dataCompany.overtimeLevel;
            //  var weeklyNT = dataCompany.weeklyNT;
            //  var weeklyOT1 = dataCompany.weeklyOT1;       
            //  var payPeriod = dataCompany.payPeriod;
            //  var WeekdayStart = dataCompany.WeekdayStart;
            //  var payPeriodStartDate = dataCompany.payPeriodStartDate;
            //  var shiftCutoff = dataCompany.shiftCutoff;
            //  var shiftCutoffPeriod = dataCompany.shiftCutoffPeriod;
            //  var days = 0;
            //  //if(isovertime == true && overtimePeriod == 'weekly'){
            //      if(payPeriod == 'weekly'){
            //          days = 7;
            //      }else if(payPeriod == '2weeks'){
            //          days = 14;
            //      }else if(payPeriod == '4weeks'){
            //          days = 28;
            //      }else if(payPeriod == 'monthly'){
            //          days = 30;
            //      } 
            //      var settingDay = '';               
            //      if(WeekdayStart == 'sun'){
            //          settingDay = 0; 
            //      }else if(WeekdayStart == 'mon'){
            //          settingDay = 1; 
            //      }else if(WeekdayStart == 'tues'){
            //          settingDay = 2;           
            //      }else if(WeekdayStart == 'wed'){
            //          settingDay = 3;            
            //      }else if(WeekdayStart == 'thurs'){
            //          settingDay = 4;         
            //      }else if(WeekdayStart == 'fri'){
            //          settingDay = 5;           
            //      }else if(WeekdayStart == 'sat'){
            //          settingDay = 6;          
            //      }
            //      if(payPeriod == '2weeks'){                  
            //          var startDate =  Moment.utc(payPeriodStartDate).startOf('week').format('YYYY-MM-DD');
            //          var endDate = Moment.utc(payPeriodStartDate).endOf('week').format('YYYY-MM-DD');
            //          var currentDay = Moment.utc().format('YYYY-MM-DD');
            //      }else{
            //          var startDate =  Moment.utc().startOf('week').format('YYYY-MM-DD');
            //          var endDate = Moment.utc().endOf('week').format('YYYY-MM-DD');
            //      }                
            //      var between = [];
            //      while (startDate <= endDate) {
            //          var dayMatch = Moment(startDate).day(); 
            //          if(dayMatch == settingDay){
            //              between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
            //          } 
            //          startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
            //      }
            //      if(payPeriod != '2weeks'){
            //          var start = between[0]; 
            //          days = days-1;             
            //          var end = Moment.utc(start).add('days',days).format('YYYY-MM-DD');                    
            //          var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
            //          console.log("start---"+start);
            //          console.log("end---"+end);
            //          WeeklyOT.update({weekEnd:end,weekStart:start,'companyId':val},
            //            {$set: {        
            //                readflag:true
            //            }},{upsert: false, new: false,multi:true}, function(err,data){
            //              if(err) {
            //                 console.log(err);
            //              }
            //          });                     
            //      }                   
            //      if(payPeriod ==  '2weeks'){
            //          var start = between[0]; 
            //          days = days-1;             
            //          var end = Moment.utc(start).add('days',days).format('YYYY-MM-DD');                    
            //          var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
            //          console.log("my start date...."+start);
            //          console.log("my last date....."+end);                       
            //          WeeklyOT.update({weekEnd:end,weekStart:start,'companyId':val},
            //            {$set: {
            //              readflag:true
            //            }},             
            //            {upsert: false, new: false,multi:true}, function(err,data){
            //                if(err) {
            //                   console.log(err);
            //                }
            //          }); 
            //      }
            //  //} //if
            // }
        });
    });
};

exports.calculateWeeklyOtRecal = function(req, res) {
    console.log("calculateWeeklyOtRecal...............");
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
        /* this will calculate weeklyOT of the current week of each employee with shiftCutoff */
    WeeklyOT.find({
        readflag: true
    }, function(err, overtimeData) {
        if (overtimeData.length > 0) {
            async.eachSeries(overtimeData, function(ot, callback) {
                var weekStart = ot.weekStart;
                var weekEnd = ot.weekEnd;
                var companyId = ot.companyId;
                var employeeNo = ot.employeeNo;
                // Attendance.count({'companyId':companyId, 'employeeNo':employeeNo, total: { $ne: '00:00:00' }, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+weekStart, $lt: 'this.date.toJSON().slice(0, 10) == '+weekEnd }}).exec(function(err, resultCnt){
                //  Attendance.count({'employeeNo':employeeNo, 'readFlag':true, total: { $ne: '00:00:00' },'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+weekStart, $lt: 'this.date.toJSON().slice(0, 10) == '+weekEnd }}).exec(function(err, resultCnt1) {
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
                            Company.find({
                                '_id': companyId
                            }, {}, {
                                limit: 1
                            }, function(err, dataCompanys) {
                                var dataCompany = dataCompanys[0];
                                // var companyId = dataCompany._id;  
                                var overtimePeriod = dataCompany.overtimePeriod;
                                var overtimeLevel = dataCompany.overtimeLevel;
                                var weeklyNT = dataCompany.weeklyNT;
                                var weeklyOT1 = dataCompany.weeklyOT1;
                                var shiftCutoff = dataCompany.shiftCutoff;
                                var shiftCutoffPeriod = dataCompany.shiftCutoffPeriod;
                                var readData = "";
                                Attendance.find({
                                    'companyId': companyId,
                                    'employeeNo': employeeNo,
                                    "date": {
                                        $gte: new Date(weekStart),
                                        $lte: new Date(weekEnd)
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
                                    if (attendanceData.length > 0) {
                                        var dataRead = 0;
                                        async.eachSeries(attendanceData, function(attendance, callback1) {
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
                                                NTTotal = NTTotal + addweeklyexcTotal;
                                                otTotal = otTotal + addweeklyexcTotal;
                                                WeeklyOT.update({
                                                    'weekStart': weekStart,
                                                    'weekEnd': weekEnd,
                                                    'employeeNo': employeeNo,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        employeeNo: employeeNo,
                                                        companyId: companyId,
                                                        weeklyOT1: empFn.secToFormatted(ot1Total),
                                                        weeklyOT2: empFn.secToFormatted(ot2Total),
                                                        totalOT: empFn.secToFormatted(otTotal),
                                                        weeklyNT: empFn.secToFormatted(NTTotal),
                                                        readflag: false,
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    callback();
                                                });
                                            }
                                            callback1();
                                        });
                                    } else {
                                        callback();
                                    }
                                });
                            });
                        }
                    });
                });
            });
        }
    });
    console.log('10) weekly Ot Recalculation Done...');
};

exports.shiftCutoffCal = function(req, res) {
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
            //console.log(startD + 'startD');
        }
    }

    Company.find({
        'shiftCutoff': true
    }, function(err, CompanyData) {
        CompanyData.forEach(function(dataCompany) {
                if (dataCompany) {
                    var companyId = dataCompany._id;
                    // console.log(companyId + 'companyId');
                    var overtimePeriod = dataCompany.overtimePeriod;
                    var overtimeLevel = dataCompany.overtimeLevel;
                    var weeklyNT = dataCompany.weeklyNT;
                    var weeklyOT1 = dataCompany.weeklyOT1;
                    var payPeriod = dataCompany.payPeriod;
                    var WeekdayStart = dataCompany.WeekdayStart;
                    var payPeriodStartDate = dataCompany.payPeriodStartDate;
                    var shiftCutoff = dataCompany.shiftCutoff;
                    var shiftCutoffPeriod = dataCompany.shiftCutoffPeriod;
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
                    if (payPeriod != '2weeks') {
                        var start = between[0];
                        var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                        var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');

                        // Employee.find({'companyId':companyId,'active':true}).exec(function(err, employeeData){
                        //  if(employeeData.length>0){
                        //      employeeData.forEach(function(data){
                        //          var employeeNo = data.employeeNo;
                        //Attendance.find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }}).sort({'date':'asc'}).exec(function(err, attendanceData){
                        Attendance.find({
                                'companyId': companyId,
                                "date": {
                                    $gte: new Date(start),
                                    $lt: new Date(end)
                                }
                            }).sort({
                                'date': 'asc'
                            }).exec(function(err, attendanceData) {
                                if (attendanceData) {
                                    var dataRead = 0;
                                    attendanceData.forEach(function(attendance) {
                                        dataRead++;
                                        var employeeNo = attendance.employeeNo;
                                        var attendanceId = attendance._id;
                                        var current = Moment.utc(attendance.date).format('YYYY-MM-DD');
                                        var prvDate = Moment.utc(current).subtract('days', 1).format('YYYY-MM-DD');
                                        var endDate = Moment.utc(end).subtract('days', 1).format('YYYY-MM-DD');
                                        Attendance.find({
                                            'companyId': companyId,
                                            'employeeNo': employeeNo,
                                            date: new Date(prvDate)
                                        }).limit(1).exec(function(err, attendanDataRec) {
                                            if (attendanDataRec.length > 0) {
                                                attendanDataRec.forEach(function(attendanData) {
                                                    var atnId = attendanData._id;
                                                    var shiftStart = new Date(Date.parse(attendanData.shiftStart)).toUTCString();
                                                    var shiftFinish = new Date(Date.parse(attendanData.shiftFinish)).toUTCString();
                                                    var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                                                    var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
                                                    if (shiftStartDate != shiftFinishDate && shiftCutoff == true && shiftCutoffPeriod == "daily") {
                                                        //var currentDate = Moment.utc(attendanData.date).format('YYYY-MM-DD');
                                                        var nextdate = current;
                                                        // console.log(prvDate +'prvDate');
                                                        empFn.addShiftCutoff(prvDate, endDate, atnId, companyId, employeeNo, nextdate, function(result) {
                                                            if (result) {
                                                                console.log('yes calculated');
                                                            }
                                                        });
                                                    } else if (current == start && shiftStartDate != shiftFinishDate && shiftCutoff == true && shiftCutoffPeriod == "weekly") {
                                                        // console.log(current +'current'+start+'emp'+employeeNo);
                                                        var nextdate = current;
                                                        empFn.addShiftCutoff(prvDate, endDate, atnId, companyId, employeeNo, nextdate, function(result) {
                                                            if (result) {
                                                                console.log('yes calculated weekly');
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                            })
                            //      });
                            //  }
                            // }); //employee
                    } //if for weekly

                    if (payPeriod == '2weeks') {
                        var start = between[0];
                        var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');
                        var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                        //console.log(start +'start---'+end+'end--------');
                        payperiodFn(currentDay, start, end, function(result) {
                            if (result.status == 1) {
                                start = result.start;
                                end = result.end;
                                prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');
                                // Employee.find({'companyId':companyId,'active':true}).exec(function(err, employeeData){
                                //  if(employeeData){  
                                //      employeeData.forEach(function(data){                
                                //          var employeeNo = data.employeeNo;
                                //Attendance.find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }}).sort({'date':'asc'}).exec(function(err, attendanceData){
                                Attendance.find({
                                        'companyId': companyId,
                                        "date": {
                                            $gte: new Date(start),
                                            $lt: new Date(end)
                                        }
                                    }).sort({
                                        'date': 'asc'
                                    }).exec(function(err, attendanceData) {
                                        if (attendanceData) {
                                            var dataRead = 0;
                                            attendanceData.forEach(function(attendance) {
                                                dataRead++;
                                                var employeeNo = attendance.employeeNo;
                                                var attendanceId = attendance._id;
                                                var current = Moment.utc(attendance.date).format('YYYY-MM-DD');
                                                var prvDate = Moment.utc(current).subtract('days', 1).format('YYYY-MM-DD');
                                                var endDate = Moment.utc(end).subtract('days', 1).format('YYYY-MM-DD');
                                                Attendance.find({
                                                    'companyId': companyId,
                                                    'employeeNo': employeeNo,
                                                    date: new Date(prvDate)
                                                }).limit(1).exec(function(err, attendanDataRec) {
                                                    if (attendanDataRec.length > 0) {
                                                        attendanDataRec.forEach(function(attendanData) {
                                                            var atnId = attendanData._id;
                                                            var shiftStart = new Date(Date.parse(attendanData.shiftStart)).toUTCString();
                                                            var shiftFinish = new Date(Date.parse(attendanData.shiftFinish)).toUTCString();
                                                            var shiftStartDate = Moment.utc(shiftStart).format('YYYY-MM-DD');
                                                            var shiftFinishDate = Moment.utc(shiftFinish).format('YYYY-MM-DD');
                                                            if (shiftStartDate != shiftFinishDate && shiftCutoff == true && shiftCutoffPeriod == "daily") {
                                                                //var currentDate = Moment.utc(attendanData.date).format('YYYY-MM-DD');
                                                                var nextdate = current;
                                                                empFn.addShiftCutoff(prvDate, endDate, atnId, companyId, employeeNo, nextdate, function(result) {
                                                                    if (result) {
                                                                        console.log('yes calculated');
                                                                    }
                                                                });
                                                            } else if (current == start && shiftStartDate != shiftFinishDate && shiftCutoff == true && shiftCutoffPeriod == "weekly") {
                                                                var nextdate = current;
                                                                empFn.addShiftCutoff(prvDate, endDate, atnId, companyId, employeeNo, nextdate, function(result) {
                                                                    if (result) {
                                                                        console.log('yes calculated weekly');
                                                                    }
                                                                });
                                                            }
                                                        })
                                                    }
                                                });
                                            });
                                        }
                                    })
                                    //      })
                                    //  }
                                    // });
                            }
                        });
                    } // if for 2weeks
                } //if data company
            }) //company data foreach

    })
    console.log('9) shift cutoff calculated');
};

exports.fetchNextYearHolidaysCron = function(req, res) {
    var year = new Date().getFullYear();
    //var nextYear = year+1;    
    var nextYear = 2015;
    console.log(nextYear + '--------------');
    var start = Moment().set('month', 0).set('date', 1).set('year', nextYear).format('YYYY-MM-DD');
    var end = Moment().set('month', 11).set('date', 31).set('year', nextYear).format('YYYY-MM-DD');
    console.log(start);
    console.log(end);

    Company.find({}, function(err, CompanyData) {
        var n = 0;
        CompanyData.forEach(function(dataCompany) {
            if (dataCompany) {
                var companyId = dataCompany._id;
                var isHolidays = dataCompany.isHolidays;
                var countryCode = dataCompany.countryCode;
                if (countryCode) {
                    console.log("countryCode......." + countryCode);
                    /*  Holidays.find({'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lt: 'this.date.toJSON().slice(0, 10) == '+end }},function(err, holidayData){
                            if(holidayData){ 
                                if(holidayData.length <= 0){*/
                    http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + nextYear + '&country=' + countryCode + '&region=', function(result) {
                        result.setEncoding('utf8');
                        result.on('data', function(newData) {
                            var HolidaysData = JSON.parse(newData);
                            var n = 0;
                            var holidaysArray = [];
                            HolidaysData.forEach(function(dataA) {
                                var date = dataA.date['year'] + '-' + dataA.date['month'] + '-' + dataA.date['day'];
                                var momentDate = Moment(date).format('YYYY-MM-DD');
                                console.log(momentDate + '---momentDate');
                                holidaysArray.push(momentDate);
                                /*var holidays = new Holidays();
                                holidays.companyId = companyId;
                                holidays.date = momentDate;
                                holidays.holidayName = dataA.englishName;
                                holidays.save();*/
                                n++;
                                Holidays.update({
                                    date: new Date(momentDate),
                                    companyId: companyId
                                }, {
                                    $set: {
                                        companyId: companyId,
                                        date: momentDate,
                                        holidayName: dataA.englishName
                                    }
                                }, {
                                    upsert: true,
                                    new: false
                                }, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        // console.log(data);
                                        if (HolidaysData.length == n) {
                                            Attendance.update({
                                                date: {
                                                    $in: holidaysArray
                                                },
                                                companyId: companyId
                                            }, {
                                                $set: {
                                                    holiday: true
                                                }
                                            }, {
                                                upsert: false,
                                                new: false,
                                                multi: true
                                            }, function(err, data) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    console.log('holidayCreated for' + nextYear + '---------' + companyId);
                                                }
                                            });
                                        }
                                    }
                                });
                            });
                        });
                    });
                    /*}                         
                    }
                });    */
                }
            }
        });
    })
};

exports.fetchNextYearHolidays = function(req, res) {
    var year = new Date().getFullYear();
    var nextYear = year + 1;
    console.log(nextYear + '--------------');
    Company.find({}, function(err, CompanyData) {
        var n = 0;
        CompanyData.forEach(function(dataCompany) {
            if (dataCompany) {
                var companyId = dataCompany._id;
                var isHolidays = dataCompany.isHolidays;
                var countryCode = dataCompany.countryCode;
                if (countryCode) {
                    console.log('countryCode' + countryCode);
                    http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + nextYear + '&country=' + countryCode + '&region=', function(result) {
                        result.setEncoding('utf8');
                        result.on('data', function(newData) {
                            var HolidaysData = JSON.parse(newData);
                            var n = 0;
                            var holidaysArray = [];
                            HolidaysData.forEach(function(dataA) {
                                var date = dataA.date['year'] + '-' + dataA.date['month'] + '-' + dataA.date['day'];
                                var momentDate = Moment(date).format('YYYY-MM-DD');
                                holidaysArray.push(momentDate);
                                var holidays = new Holidays();
                                holidays.companyId = companyId;
                                holidays.date = momentDate;
                                holidays.holidayName = dataA.englishName;
                                holidays.save();
                                n++;
                                if (HolidaysData.length == n) {
                                    if (isHolidays == true) {
                                        Attendance.update({
                                            date: {
                                                $in: holidaysArray
                                            },
                                            companyId: companyId
                                        }, {
                                            $set: {
                                                holiday: true
                                            }
                                        }, {
                                            upsert: false,
                                            new: false,
                                            multi: true
                                        }, function(err, data) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log('holidayCreated for' + nextYear);
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    });
                }
            }
        })
    });
};

exports.reloadclockings = function(req, res) {
    console.log("================================");
    var SN = req.params.sn;
    var period = req.params.period;
    var days = '';
    if (period) {
        days = period;
    }
    var startDate1 = Moment.utc().subtract('days', days).format();
    var endDate1 = Moment.utc().add('days', 1).format();
    console.log(startDate1);
    console.log(endDate1);
    var i = 0;
    console.log("select * from checkinout where SN =" + SN + " AND checkTime between '" + startDate1 + "' AND '" + endDate1 + "'  ORDER BY id");
    client.query("select * from checkinout where SN =" + SN + " AND checkTime between '" + startDate1 + "' AND '" + endDate1 + "'  ORDER BY id", function(err, attendance) {
        console.log(attendance);
        if (attendance) {
            console.log(attendance.length + 'totalRecords');
            async.eachSeries(attendance, function(data, callback) {
                i++;
                var employeeNo = data.userid;
                client.query("SELECT TRIM(LEADING '0' FROM badgenumber) as badgenumber FROM userinfo where userid =" + employeeNo, function(err, userBadgeData) {
                    console.log(userBadgeData);
                    if (userBadgeData) {
                        var badgenumber = userBadgeData[0].badgenumber;
                        var SN = data.SN;
                        var checkTime = data.checktime + "+0000";
                        var checkType = data.checktype;
                        var verifyCode = data.verifyCode;
                        var sensorId = data.sensorId;
                        var workCode = data.WorkCode;
                        var Reserved = data.Reserved;

                        var attendanceMysql = new AttendanceMysql();
                        attendanceMysql.employeeNo = badgenumber;
                        attendanceMysql.SN = SN;
                        attendanceMysql.checkTime = checkTime;
                        attendanceMysql.checkType = checkType;
                        attendanceMysql.verifyCode = verifyCode;
                        attendanceMysql.sensorId = sensorId;
                        attendanceMysql.workCode = workCode;
                        attendanceMysql.Reserved = Reserved;
                        //attendanceMysql.readFlag = false;
                        attendanceMysql.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (i == attendance.length) {
                                    res.send('Read and Write successfully done to AttendanceMysqlData');
                                }
                                callback();
                            }
                        });
                    }
                });
            });
        } else {
            console.log('mysql' + err);
            if (err) {
                client.end();
                handleDisconnect();
                res.send(err);
            } else {
                res.send("There is no record in MySQL to Read...");
            }
        }
    });
};

exports.matchCheckins = function(req, res) {
    var SN = req.params.sn;
    var period = req.params.period;
    var startDate1 = '';
    if (req.params.period.indexOf("d") > -1) {
        var days = req.params.period.split('d');
        startDate1 = Moment.utc().subtract('days', days[0]).format('YYYY-MM-DD');
    } else if (req.params.period.indexOf("w") > -1) {
        var days = req.params.period.split('w');
        startDate1 = Moment.utc().subtract('days', days[0] * 7).format('YYYY-MM-DD');
    }

    var endDate1 = Moment.utc().format('YYYY-MM-DD');
    console.log(startDate1);
    console.log(endDate1);
    var i = 0;

    client.query("select * from checkinout where SN =" + SN + " AND checkTime between '" + startDate1 + "' AND '" + endDate1 + "'  ORDER BY id", function(err, attendance) {
        if (attendance) {
            var checkinsArray = [];
            // console.log(attendance.length+'totalRecords');
            //attendance.forEach(function(data){  
            async.eachSeries(attendance, function(data, callback) {
                i++;
                var employeeNo = data.userid - 1;
                var SN = data.SN;
                var checkTime = data.checktime + "+0000";
                var chTime = new Date(Date.parse(checkTime)).toUTCString();
                var checkType = data.checktype;
                var verifyCode = data.verifyCode;
                var sensorId = data.sensorId;
                var workCode = data.WorkCode;
                var Reserved = data.Reserved;
                Company.findOne({
                    'passcode.no': SN
                }, function(err, dataCompany) {
                    if (dataCompany) {
                        var companyId = dataCompany._id;
                        var companyName = dataCompany.companyname;
                        var date = Moment.utc(chTime).format('YYYY-MM-DD');
                        var start = Moment.utc(date).subtract('days', 1).format('YYYY-MM-DD');
                        var end = Moment.utc(date).add('days', 1).format('YYYY-MM-DD');
                        var dataIn = {
                                'companyname': companyName,
                                'companyId': companyId,
                                'employeeNo': employeeNo,
                                'checkinTime': chTime,
                                'date': date,
                                'SN': SN
                            }
                            // Attendance.find({employeeNo:employeeNo ,companyId:companyId, 'checkin.checkTime' :chTime, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+start, $lte: 'this.date.toJSON().slice(0, 10) == '+end }},function(err, newAtnData){ 
                        Attendance.find({
                            employeeNo: employeeNo,
                            companyId: companyId,
                            'checkin.checkTime': chTime,
                            "date": {
                                $gte: new Date(start),
                                $lte: new Date(end)
                            }
                        }, function(err, newAtnData) {
                            if (newAtnData.length <= 0) {
                                checkinsArray.push(dataIn);
                                if (i == attendance.length) {
                                    res.send(checkinsArray)
                                }
                                callback();
                            } else {
                                if (i == attendance.length) {
                                    res.send(checkinsArray)
                                }
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }
                })
            });
        } else {
            console.log('mysql...' + err);
            if (err) {
                client.end();
                handleDisconnect();
            } else {
                res.send("There is no record in MySQL to Read...");
            }
        }
    });
};

exports.createDashboardFromweekly = function(req, res) {
    Company.find({}, function(err, CompanyData) {
        var cmpCount = 0
        async.eachSeries(CompanyData, function(dataCompany, cbCmp) {
            if (dataCompany) {
                cmpCount++;
                var companyId = dataCompany._id;
                var companyname = dataCompany.companyname;
                console.log(companyId + '--->>>>');
                var departments = dataCompany.departments;
                var isdashboard = dataCompany.isdashboard;
                if (isdashboard == true) {
                    WeeklyOT.findOne({
                        'companyId': companyId
                    }, function(err, overtimeData) {
                        if (overtimeData) {
                            var employeeNo = overtimeData.employeeNo;
                            // console.log(employeeNo);
                            var week = 0;
                            WeeklyOT.find({
                                'companyId': companyId,
                                'employeeNo': employeeNo
                            }, function(err, weeklyData) {
                                async.eachSeries(weeklyData, function(data, cbweek) {
                                    week++;
                                    var start = data.weekStart;
                                    var end = data.weekEnd;
                                    var deptCount = 0;
                                    Dashboard.findOne({
                                        'companyId': companyId,
                                        'weekStart': start,
                                        'weekEnd': end
                                    }, function(err, dashboardData) {
                                        if (!dashboardData) {
                                            console.log('create');
                                            async.eachSeries(departments, function(dept, cbdept) {
                                                deptCount++;
                                                var deptId = dept._id;
                                                var departName = dept.name;
                                                var totalWorked = 0;
                                                Dashboard.update({
                                                    'companyId': companyId,
                                                    'weekStart': start,
                                                    'weekEnd': end
                                                }, {
                                                    $set: {
                                                        companyId: companyId,
                                                        companyName: companyname,
                                                        weekStart: start,
                                                        weekEnd: end,
                                                        calfalg: true
                                                    },
                                                    $push: {
                                                        departments: {
                                                            departmentId: deptId,
                                                            departmentName: departName,
                                                            workedHours: "00:00:00"
                                                        }
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log('--done');
                                                        if (deptCount == departments.length) {
                                                            if (weeklyData.length == week) {
                                                                cbCmp();
                                                            } else {
                                                                cbweek();
                                                            }
                                                        } else {
                                                            cbdept();
                                                        }
                                                    }
                                                });
                                            });
                                        } else {
                                            if (weeklyData.length == week) {
                                                cbCmp();
                                            } else {
                                                cbweek();
                                            }
                                        }
                                    });
                                });
                            });
                        } else {
                            cbCmp();
                        }
                    });
                } else {
                    cbCmp();
                }
            }
        });
    });
};

exports.dashboardCalculation = function(req, res) {
    console.log('3) Read and Write to Dashboard starting...');
    Dashboard.find({
        calfalg: false
    }, function(err, dashboardData) {
        console.log("dashboardData.length....." + dashboardData.length);
        async.eachSeries(dashboardData, function(dash, cbdash) {
            // console.log("earch eachSeries...");
            var companyId = dash.companyId;
            var start = dash.weekStart;
            var end = dash.weekEnd;
            console.log('companyId----->>> ' + companyId + " WeekdayStart-->" + start + "Weeday end---> " + end);
            var departmentList = dash.departments;
            // console.log(dash);
            // // console.log("departmentList.length........"+departmentList.length);
            if (departmentList.length > 0) {
                console.log("departmentList " + departmentList.length);
                var deptCount = 0;
                var uniqueDeptList = [];
                // var CompanyAllocatedHours=0;
                async.eachSeries(departmentList, function(dept, cbdept) {
                    deptCount++;
                    if (uniqueDeptList.indexOf(dept.departmentName) == -1) {
                        uniqueDeptList.push(dept.departmentName);
                        // console.log("ifff");
                        var departName = dept.departmentName;
                        var dept_Id = dept._id;
                        // console.log("33332");                            
                        subDashboard.find({
                                'companyId': companyId,
                                'weekStart': start,
                                'weekEnd': end,
                                'subDepartments.parentDeptName': dept.departmentName
                            }, {}, {
                                limit: 1
                            }, function(err, subDashboardDetail) {
                                // console.log(err)
                                // console.log("subDashboardDetail...."+subDashboardDetail);
                                // console.log("subDashboardDetail...."+subDashboardDetail.length);
                                if (subDashboardDetail.length > 0) {
                                    // console.log("3");
                                    var subDashboardData = subDashboardDetail[0].subDepartments;
                                    var subDeptCnt = 0;
                                    async.eachSeries(subDashboardData, function(subDept, cbSubDept) {
                                        // subDeptCnt++;
                                        subDeptCnt++;
                                        // console.log("3");
                                        var subDeptAllocatedHours = 0;
                                        var subDeptWorkedHours = 0;
                                        var subDeptMoneySpent = 0;
                                        var subDeptBudgetedWages = 0;
                                        var lastDate = end;
                                        if (dash.currentDayCal) {
                                            lastDate = Moment.utc(new Date()).format("YYYY-MM-DD");
                                        }
                                        // console.log("lastDate..........."+lastDate);

                                        Attendance.find({
                                            'companyId': companyId,
                                            "date": {
                                                $gte: new Date(start),
                                                $lte: new Date(lastDate)
                                            },
                                            'active': true,
                                            'department': departName,
                                            'subDepartment': subDept.subDeptName
                                        }).exec(function(err, attendanceData) {
                                            // console.log();
                                            if (attendanceData.length > 0) {
                                                var countAtn = 0;
                                                // console.log("if subDashboardDetail1");
                                                // console.log("attendanceData.length..."+attendanceData.length);
                                                // console.log(departName);
                                                // console.log(subDept.subDeptName);
                                                async.eachSeries(attendanceData, function(attendance, cbA) {
                                                    countAtn++;
                                                    // console.log("atn status here #@#@#@#@#" +attendance.active);
                                                    var dt1 = Moment.utc(attendance.shiftStart).format("DD-MM-YYYY HH:mm:sss");
                                                    var dt2 = Moment.utc(attendance.shiftFinish).format("DD-MM-YYYY HH:mm:sss");
                                                    var ms;
                                                    if (attendance.shift != "not Working") {
                                                        ms = Moment.utc(Moment(dt2, "DD/MM/YYYY HH:mm:ss").diff(Moment(dt1, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                                                        if (attendance.breakk && !attendance.breakIn) {
                                                            var calculatedHours = empFn.getSeconds(ms) - empFn.getSeconds(attendance.breakk);
                                                            ms = empFn.secToFormatted(calculatedHours);
                                                        }
                                                    } else {
                                                        ms = '00:00:00';
                                                    }

                                                    var hoverlyRate = 0;
                                                    if (attendance.hourlyRate != '' && attendance.active === true) {
                                                        hoverlyRate = parseFloat(attendance.hourlyRate);
                                                    }
                                                    var hoursMinutes1 = ms.split(/[.:]/);
                                                    var hours1 = parseFloat(hoursMinutes1[0], 10);
                                                    var minutes1 = hoursMinutes1[1] ? parseFloat(hoursMinutes1[1], 10) : 0;
                                                    var totalHover1 = hours1 + (minutes1 / 60);
                                                    if (hoverlyRate && totalHover1) {
                                                        subDeptBudgetedWages += totalHover1 * hoverlyRate;
                                                    }
                                                    var totalAtn = attendance.totalRounded;
                                                    var hoursMinutes = totalAtn.split(/[.:]/);
                                                    var hours = parseFloat(hoursMinutes[0], 10);
                                                    var minutes = hoursMinutes[1] ? parseFloat(hoursMinutes[1], 10) : 0;
                                                    var totalHover = hours + (minutes / 60);

                                                    if (totalHover && hoverlyRate)
                                                        subDeptMoneySpent += totalHover * hoverlyRate;
                                                    subDeptWorkedHours += empFn.getSeconds(totalAtn);
                                                    subDeptAllocatedHours = subDeptAllocatedHours + empFn.getSeconds(ms);



                                                    if (countAtn == attendanceData.length) {
                                                        console.log("---------------********log sub Department************----------------")
                                                        console.log("sub_dept_Id....................." + subDept._id);
                                                        console.log("ms ........................." + ms);
                                                        console.log("department name............." + subDept.parentDeptName);
                                                        console.log("sub department name............." + subDept.subDeptName);
                                                        console.log("sub DepartmentAllocatedHours...." + empFn.secToFormatted(subDeptAllocatedHours));
                                                        console.log("sub DepartmentWorkedHours......." + empFn.secToFormatted(subDeptWorkedHours));

                                                        empFn.calculateDateWiseData(function(calD) {
                                                            empFn.salesCalculationSub(start, end, companyId, dept_Id, departName, subDept.subDeptId, subDept.subDeptName, function(actualS, budgetedS) {
                                                                console.log("update sales data...");
                                                                subDashboard.update({
                                                                    'subDepartments._id': subDept._id
                                                                }, {
                                                                    $set: {
                                                                        'subDepartments.$.workedHours': empFn.secToFormatted(subDeptWorkedHours),
                                                                        'subDepartments.$.moneySpent': subDeptMoneySpent,
                                                                        'subDepartments.$.allocatedHours': empFn.secToFormatted(subDeptAllocatedHours),
                                                                        "subDepartments.$.budgetedWages": subDeptBudgetedWages,
                                                                        "subDepartments.$.actualSales": actualS,
                                                                        "subDepartments.$.budgetedSales": budgetedS,

                                                                    }
                                                                }, {
                                                                    upsert: false,
                                                                    new: false
                                                                }, function(err, dataUp) {
                                                                    if (subDeptCnt == subDashboardData.length) {
                                                                        if (deptCount == departmentList.length) {
                                                                            // console.log("last21.......");
                                                                            empFn.calculateTotalWorked(companyId, start, end);
                                                                            cbdash();
                                                                        } else {
                                                                            cbdept();
                                                                        }
                                                                    }
                                                                    cbSubDept();

                                                                });
                                                            });
                                                        });
                                                    }
                                                    cbA();
                                                });

                                            } else {
                                                // console.log("asssssssssssssssssssssssssssssssss");
                                                //if sub department has no attedance record

                                                if (subDeptCnt == subDashboardData.length) {
                                                    if (deptCount == departmentList.length) {
                                                        // console.log("last22.......");
                                                        empFn.calculateTotalWorked(companyId, start, end);
                                                        cbdash();
                                                    } else {
                                                        cbdept();
                                                    }
                                                }
                                                cbSubDept();
                                            }
                                        });
                                    });
                                } else {
                                    // console.log("4");
                                    console.log("subDashboardDetail not found");
                                    if (deptCount == departmentList.length) {
                                        // console.log("last32.......");
                                        empFn.calculateTotalWorked(companyId, start, end);
                                        cbdash();
                                    } else {
                                        cbdept();
                                    }
                                }
                            })
                            // cbdept()
                    } else {
                        // console.log("dept repeated.....");
                        Dashboard.update({
                            '_id': dash._id
                        }, {
                            $pull: {
                                departments: {
                                    '_id': dept._id
                                }
                            }
                        }, {
                            upsert: false,
                            new: false
                        }, function(err, data) {
                            if (deptCount == departmentList.length) {
                                // console.log("last5.......");
                                empFn.calculateTotalWorked(companyId, start, end);
                                cbdash();
                            } else {
                                cbdept();
                            }
                        });
                    }
                    // console.log(uniqueDeptList.length);
                });
            } else {
                console.log("departmentList elseeeeeeeee..........");
                var budgetedDeptWages = 0;
                var TotalWorked = 0;
                var TotalmoneySpent = 0;
                var TotalAllocatedHours = 0;
                var totalWorked = 0;
                var moneySpent = 0;
                var budgetedWages = 0;
                var lastDate = end;
                if (dash.currentDayCal) {
                    lastDate = Moment.utc(new Date()).format("YYYY-MM-DD");
                }
                Attendance.find({
                    'companyId': companyId,
                    "date": {
                        $gte: new Date(start),
                        $lte: new Date(lastDate)
                    },
                    'active': true
                }).sort({
                    'date': 'asc'
                }).exec(function(err, attendanceData) {
                    var ot2Total = 0;
                    var otTotal = 0;
                    var NTTotal = 0;
                    var normalTimeTotal = 0;
                    var cutExceptionTotal = 0;
                    var addweeklyexcTotal = 0;
                    var dataRead = 0;
                    var countAtn = 0;
                    // console.log("atn length"+attendanceData.length);
                    if (attendanceData.length > 0) {
                        console.log("found atn in dashboard");
                        async.eachSeries(attendanceData, function(attendance, cbAtn) {
                            // attendanceData.forEach(function(attendance) {
                            // async.eachSeries(attendanceData, function(attendance, cbA){
                            countAtn++;
                            var dt1 = Moment.utc(attendance.shiftStart).format("DD-MM-YYYY HH:mm:sss");
                            var dt2 = Moment.utc(attendance.shiftFinish).format("DD-MM-YYYY HH:mm:sss");
                            var ms;
                            if (attendance.shift != "not Working") {
                                ms = Moment.utc(Moment(dt2, "DD/MM/YYYY HH:mm:ss").diff(Moment(dt1, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                                if (attendance.breakk && !attendance.breakIn) {
                                    var calculatedHours = empFn.getSeconds(ms) - empFn.getSeconds(attendance.breakk);
                                    ms = empFn.secToFormatted(calculatedHours);
                                }
                            } else {
                                ms = '00:00:00';
                            }
                            TotalAllocatedHours = TotalAllocatedHours + empFn.getSeconds(ms);
                            var totalAtn = attendance.totalRounded;
                            totalWorked += empFn.getSeconds(totalAtn);
                            var hoursMinutes = totalAtn.split(/[.:]/);
                            var hours = parseFloat(hoursMinutes[0], 10);
                            var minutes = hoursMinutes[1] ? parseFloat(hoursMinutes[1], 10) : 0;

                            var totalAtn1 = ms;
                            var hoursMinutes1 = totalAtn1.split(/[.:]/);
                            var hours1 = parseFloat(hoursMinutes1[0], 10);
                            var minutes1 = hoursMinutes1[1] ? parseFloat(hoursMinutes1[1], 10) : 0;

                            var totalHover = hours + (minutes / 60);
                            var totalHover1 = hours1 + (minutes1 / 60);
                            var hoverlyRate = 0;
                            if (attendance.hourlyRate != '' && attendance.active === true) {
                                hoverlyRate = parseFloat(attendance.hourlyRate);
                            }
                            if (hoverlyRate != "0") {
                                moneySpent += totalHover * hoverlyRate;
                            }
                            budgetedWages += totalHover1 * hoverlyRate;
                            budgetedDeptWages += totalHover1 * hoverlyRate;

                            if (attendanceData.length == countAtn) {
                                companyId = companyId.toString();

                                if (TotalAllocatedHours != 0) {
                                    var totalmain = totalWorked / TotalAllocatedHours;
                                    var permain = totalmain * 100;
                                    permain1 = Math.round(permain * 100) / 100;
                                }
                                Dashboard.update({
                                    "companyId": companyId,
                                    "weekEnd": end,
                                    "weekStart": start
                                }, {
                                    $set: {
                                        'workedHours': empFn.secToFormatted(totalWorked),
                                        'moneySpent': moneySpent,
                                        'allocatedHours': empFn.secToFormatted(TotalAllocatedHours),
                                        'budgetedWages': budgetedDeptWages,
                                        "budgetedWages": budgetedWages,
                                        'percentageUsed': permain1,
                                        'calfalg': true
                                    }
                                }, function(err, dataUp) {
                                    // console.log(dataUp);
                                    // console.log(err);
                                    if (dataUp) {
                                        cbdash();
                                    }
                                });
                            } else {
                                cbAtn();
                            }
                        });
                    } else {
                        console.log("no atn reset dashboard flag ");
                        Dashboard.update({
                            "_id": dash._id,
                        }, {
                            $set: {
                                'calfalg': true
                            }
                        }, function(err, dataUp) {
                            // console.log(dataUp);
                            // console.log(err);
                            if (dataUp) {
                                console.log(wamp.getSession());
                                wamp.getSession().publish('timecloud.dashboard.update', [{
                                    'company': companyId
                                }]);
                                console.log("published dashboard--------------");
                                cbdash();
                            }
                        });
                    }
                });
            }
        });
        console.log('3) Read and Write done to Dashboard...');
    });
};

exports.calculateProject = function(callback) {
    Project.find({
        active: true,
        calFlag: false
    }).sort({
        '_id': '-1'
    }).exec(function(err, projectDatas) {
        // console.log(err);
        // console.log(projectDatas);
        if (projectDatas.length > 0) {
            var prjCnt = 0;
            async.eachSeries(projectDatas, function(myProj, callbackProj) {
                empFn.checkProjectDBTask(myProj, function(projectData) {
                    // console.log(projectData);
                    prjCnt++;
                    console.log('project number ', prjCnt, projectDatas.length);

                    var companyId = projectData.companyId;
                    var JC = projectData.JC;
                    var projectId = projectData._id;
                    var tasks = projectData.tasks;
                    // var users = projectData.users;
                    var jcArray = [];
                    if (tasks.length > 0) {
                        jcArray.push(JC);
                        tasks.forEach(function(task) {
                            var taskCode = task.taskCode;
                            jcArray.push(taskCode);
                        });
                    } else {
                        jcArray.push(JC);
                    }
                    console.log("jcArray");
                    if (jcArray.length > 0) {
                        // console.log(jcArray);
                        Attendance.find({
                            'projectFlag': true,
                            'companyId': companyId,
                            'checkin.workCode': {
                                $in: jcArray
                            }
                        }).sort({
                            'date': '-1',
                            'employeeNo': 'asc'
                        }).exec(function(err, atnData) {
                            console.log(jcArray);
                            if (atnData.length > 0) {
                                var j = 0;
                                console.log('atnData found ' + atnData.length);
                                async.eachSeries(atnData, function(attendance, callbackAttendance) {
                                    j++;
                                    var atnId = attendance._id;
                                    var totalValues = attendance.totalValues;
                                    var employeeNo = attendance.employeeNo;
                                    var hourlyRate = attendance.hourlyRate;
                                    var chargeoutRate = attendance.chargeoutRate;
                                    var firstName = attendance.firstName;
                                    var lastName = attendance.lastName;
                                    var date = Moment(attendance.date).format('YYYY-MM-DD');
                                    //var workcodewithtotal = [];
                                    console.log("atnId *********" + atnId);
                                    if (totalValues.length > 0) {
                                        empFn.getCodes(totalValues, prjCnt, projectDatas.length, jcArray, function(result, myAtnFlag) {
                                            console.log(result);
                                            if (result.length > 0) {
                                                var workcodes = result;
                                                var i = 0;
                                                console.log("before each workcode");
                                                async.eachSeries(workcodes, function(wc, callbackWC) {
                                                    i++;
                                                    var n = 0;
                                                    var wcTotal = 0;
                                                    console.log("before each totalValues");
                                                    async.eachSeries(totalValues, function(tv, callbackTV) {
                                                        n++;
                                                        //var total = tv.total;
                                                        var totalAdjusted = tv.totalAdjusted;
                                                        var workCode = tv.workCode;
                                                        if (workCode == wc) {
                                                            wcTotal = wcTotal + empFn.toSeconds(totalAdjusted);
                                                        }
                                                        if (n == totalValues.length) {
                                                            var totalFinal = empFn.secToFormatted(wcTotal);
                                                            console.log("=============>");
                                                            console.log("wc " + wc);
                                                            console.log("jc " + JC);
                                                            console.log("<=============");
                                                            if (wc == JC) {
                                                                console.log("users changed ========================>");
                                                                Project.aggregate({
                                                                    $match: {
                                                                        "users.workCode": wc,
                                                                        '_id': projectId,
                                                                        'users.date': date,
                                                                        'users.employeeNo': employeeNo
                                                                    }
                                                                }, {
                                                                    $unwind: "$users"
                                                                }, {
                                                                    $match: {
                                                                        "users.workCode": wc,
                                                                        'users.date': date,
                                                                        'users.employeeNo': employeeNo
                                                                    }
                                                                }).exec(function(err, prjData) {
                                                                    if (prjData.length > 0) {
                                                                        var usersArry = prjData[0].users;
                                                                        // console.log("only time total changed");
                                                                        Project.update({
                                                                            'users._id': usersArry._id
                                                                        }, {
                                                                            $set: {
                                                                                // calFlag: true,
                                                                                'users.$.timeTotal': totalFinal,
                                                                                'users.$.hourlyRate': hourlyRate,
                                                                                'users.$.chargeoutRate': chargeoutRate
                                                                            }
                                                                        }, function(err, attendanceData) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else {
                                                                                if (i == workcodes.length) {
                                                                                    if (j == atnData.length) {
                                                                                        if (prjCnt === projectDatas.length) {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, JC, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE All %s", prjCnt);
                                                                                                    callback(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, JC, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE %s ... now next", prjCnt);
                                                                                                    callbackProj();
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    } else {
                                                                                        empFn.calculateTaskTotal(tasks, projectId, companyId, JC, atnId, false, myAtnFlag, function(status) {
                                                                                            if (status) {
                                                                                                console.log("Project multi atn %s ...now next", j);
                                                                                                callbackAttendance();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                } else {
                                                                                    console.log("another workcode ...");
                                                                                    callbackWC();
                                                                                }
                                                                            }
                                                                        });
                                                                    } else {
                                                                        Project.update({
                                                                            '_id': projectId
                                                                        }, {
                                                                            $push: {
                                                                                users: {
                                                                                    date: date,
                                                                                    employeeNo: employeeNo,
                                                                                    firstName: firstName,
                                                                                    lastName: lastName,
                                                                                    workCode: wc,
                                                                                    timeTotal: totalFinal,
                                                                                    hourlyRate: hourlyRate,
                                                                                    chargeoutRate: chargeoutRate,
                                                                                }
                                                                            }
                                                                        }, {
                                                                            upsert: false,
                                                                            new: false
                                                                        }, function(err, data) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else {
                                                                                if (i == workcodes.length) {
                                                                                    if (j == atnData.length) {
                                                                                        if (prjCnt === projectDatas.length) {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, JC, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE All %s", prjCnt);
                                                                                                    callback(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, JC, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE %s ... now next", prjCnt);
                                                                                                    callbackProj();
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    } else {
                                                                                        empFn.calculateTaskTotal(tasks, projectId, companyId, JC, atnId, false, myAtnFlag, function(status) {
                                                                                            if (status) {
                                                                                                console.log("Project multi atn %s ...now next", j);
                                                                                                callbackAttendance();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                } else {
                                                                                    console.log("another workcode ...");
                                                                                    callbackWC();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                console.log("task changed ================>");
                                                                Project.aggregate({
                                                                    $match: {
                                                                        "users.workCode": wc,
                                                                        '_id': projectId,
                                                                        'users.date': date,
                                                                        'users.employeeNo': employeeNo
                                                                    }
                                                                }, {
                                                                    $unwind: "$users"
                                                                }, {
                                                                    $match: {
                                                                        "users.workCode": wc,
                                                                        'users.date': date,
                                                                        'users.employeeNo': employeeNo
                                                                    }
                                                                }).exec(function(err, prjData) {
                                                                    if (prjData.length > 0) {
                                                                        console.log("only time total update");
                                                                        var usersArry = prjData[0].users;
                                                                        Project.update({
                                                                            'users._id': usersArry._id
                                                                        }, {
                                                                            $set: {
                                                                                // calFlag: false,
                                                                                'users.$.timeTotal': totalFinal,
                                                                                'users.$.hourlyRate': hourlyRate,
                                                                                'users.$.chargeoutRate': chargeoutRate
                                                                            }
                                                                        }, function(err, attendanceData) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else {
                                                                                if (i == workcodes.length) {
                                                                                    if (j == atnData.length) {
                                                                                        if (prjCnt === projectDatas.length) {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE All %s", prjCnt);
                                                                                                    callback(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE %s ... now next", prjCnt);
                                                                                                    callbackProj();
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    } else {
                                                                                        empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, false, myAtnFlag, function(status) {
                                                                                            if (status) {
                                                                                                console.log("Project multi atn %s ... now next", j);
                                                                                                callbackAttendance();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                } else {
                                                                                    console.log("another workcode ...");
                                                                                    callbackWC();
                                                                                }
                                                                            }
                                                                        });
                                                                    } else {
                                                                        console.log("update first time...");
                                                                        Project.update({
                                                                            '_id': projectId
                                                                        }, {
                                                                            $push: {
                                                                                users: {
                                                                                    date: date,
                                                                                    employeeNo: employeeNo,
                                                                                    firstName: firstName,
                                                                                    lastName: lastName,
                                                                                    workCode: wc,
                                                                                    timeTotal: totalFinal,
                                                                                    hourlyRate: hourlyRate,
                                                                                    chargeoutRate: chargeoutRate,
                                                                                }
                                                                            }
                                                                        }, {
                                                                            upsert: false,
                                                                            new: false
                                                                        }, function(err, data) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else {
                                                                                if (i == workcodes.length) {
                                                                                    if (j == atnData.length) {
                                                                                        if (prjCnt === projectDatas.length) {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE All %s", prjCnt);
                                                                                                    callback(true);
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, myAtnFlag, function(status) {
                                                                                                if (status) {
                                                                                                    console.log("Project DONE %s ...now next", prjCnt);
                                                                                                    callbackProj();
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    } else {
                                                                                        empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, false, myAtnFlag, function(status) {
                                                                                            if (status) {
                                                                                                console.log("Project multi atn %s ...now next", j);
                                                                                                callbackAttendance();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                } else {
                                                                                    console.log("another workcode ...");
                                                                                    callbackWC();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        } else {
                                                            console.log("....another total values in atn....");
                                                            callbackTV();
                                                        } // end length if
                                                    }); // totalValues
                                                }); //workcodes
                                            } else {
                                                if (j == atnData.length) {
                                                    if (prjCnt === projectDatas.length) {
                                                        empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, false, function(status) {
                                                            if (status) {
                                                                console.log("Project DONE All %s", prjCnt);
                                                                callback(true);
                                                            }
                                                        });
                                                    } else {
                                                        empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, false, function(status) {
                                                            if (status) {
                                                                console.log("Project DONE %s ...now next", prjCnt);
                                                                callbackProj();
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, false, false, function(status) {
                                                        if (status) {
                                                            console.log("Project multi atn %s ...now next", j);
                                                            callbackAttendance();
                                                        }
                                                    });
                                                }
                                            }
                                        }); //getCode
                                    } else {
                                        console.log("no total values found");

                                        if (j == atnData.length) {
                                            if (prjCnt === projectDatas.length) {
                                                empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, false, function(status) {
                                                    if (status) {
                                                        console.log("Project DONE All %s", prjCnt);
                                                        callback(true);
                                                    }
                                                });
                                            } else {
                                                empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, true, false, function(status) {
                                                    if (status) {
                                                        console.log("Project DONE %s ...now next", prjCnt);
                                                        callbackProj();
                                                    }
                                                });
                                            }
                                        } else {
                                            empFn.calculateTaskTotal(tasks, projectId, companyId, null, atnId, false, false, function(status) {
                                                if (status) {
                                                    console.log("Project multi atn %s ...now next", j);
                                                    callbackAttendance();
                                                }
                                            });
                                        }

                                    }
                                });
                            } else {
                                console.log("No atn data found fot this project");
                                if (prjCnt === projectDatas.length) {
                                    empFn.calculateTaskTotal(tasks, projectId, companyId, null, null, true, false, function(status) {
                                        if (status) {
                                            console.log("Project DONE All %s", prjCnt);
                                            callback(true);
                                        }
                                    });
                                } else {
                                    empFn.calculateTaskTotal(tasks, projectId, companyId, null, null, true, false, function(status) {
                                        if (status) {
                                            console.log("Project DONE %s ...now next", prjCnt);
                                            callbackProj();
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });
        } else {
            callback(true);
            console.log("No project found");
        }
    });
};

exports.autoCreateDashBoard = function(req, res) {
    console.log("***********autoCreateDashBoard************");
    Company.find({
        isdashboard: true
    }, function(err, CompanyData) {
        if (CompanyData.length > 0) {
            var cmpCount = 0;
            async.eachSeries(CompanyData, function(dataCompany, cbCmp) {
                if (dataCompany) {
                    // console.log(dataCompany);
                    cmpCount++;
                    var companyId = dataCompany._id;
                    var companyname = dataCompany.companyname;
                    var departments = dataCompany.departments;
                    var isdashboard = dataCompany.isdashboard;
                    if (isdashboard) {
                        // console.log("iffffffffff");
                        getPayperiod(companyId, function(result) {
                            var start = result.start;
                            var end = result.end;
                            var deptCount = 0;
                            console.log(start);
                            console.log(end);
                            Dashboard.findOne({
                                'companyId': companyId,
                                'weekStart': start,
                                'weekEnd': end
                            }, function(err, dashboardData) {
                                // console.log("dashboardData");
                                if (!dashboardData) {
                                    console.log("if dashboardData");
                                    if (departments.length > 0) {
                                        console.log("if departments");
                                        async.eachSeries(departments, function(dept, cbdept) {
                                            deptCount++;
                                            var deptId = dept._id;
                                            var departName = dept.name;
                                            var totalWorked = 0;
                                            Dashboard.update({
                                                'companyId': companyId,
                                                'weekStart': start,
                                                'weekEnd': end
                                            }, {
                                                $set: {
                                                    companyId: companyId,
                                                    companyName: companyname,
                                                    weekStart: start,
                                                    weekEnd: end,
                                                    workedHours: "00:00:00",
                                                    allocatedHours: "00:00:00",
                                                    percentageUsed: "00",
                                                    moneySpent: "00",
                                                    calfalg: true,
                                                },
                                                $push: {
                                                    departments: {
                                                        departmentId: deptId,
                                                        departmentName: departName,
                                                        workedHours: "00:00:00"
                                                    }
                                                }
                                            }, {
                                                upsert: true,
                                                new: false
                                            }, function(err, data) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    var subDept = 0;
                                                    var subDeptArray = [];
                                                    subDeparment.find({
                                                        companyId: companyId
                                                    }, function(err, subDeaptDetail) {
                                                        if (subDeaptDetail.length > 0) {
                                                            async.eachSeries(subDeaptDetail, function(dept, cbsubDept) {
                                                                subDept++;
                                                                subDeptArray.push({
                                                                    departmentId: dept.parentDeptId,
                                                                    parentDeptName: dept.parentDeptName,
                                                                    //departmentId: dept.parentDeptId,
                                                                    subDeptId: dept._id,
                                                                    subDeptName: dept.name
                                                                });
                                                                if (subDept == subDeaptDetail.length) {
                                                                    subDashboard.update({
                                                                        'companyId': companyId,
                                                                        'weekStart': start,
                                                                        'weekEnd': end
                                                                    }, {
                                                                        $set: {
                                                                            subDepartments: subDeptArray,
                                                                            companyId: companyId, // company user Id (id of tenant)    
                                                                            weekStart: start,
                                                                            weekEnd: end
                                                                        }
                                                                    }, {
                                                                        upsert: true,
                                                                        new: false
                                                                    }, function(err, data) {
                                                                        console.log("done sub");
                                                                        console.log('--done');
                                                                        cbdept();
                                                                    });
                                                                } else {
                                                                    cbsubDept();
                                                                }
                                                            });
                                                        } else {
                                                            cbdept();
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    } else {
                                        console.log("else not departments");
                                        Dashboard.update({
                                            'companyId': companyId,
                                            'weekStart': start,
                                            'weekEnd': end
                                        }, {
                                            $set: {
                                                companyId: companyId,
                                                companyName: companyname,
                                                weekStart: start,
                                                weekEnd: end,
                                                calfalg: true,
                                                workedHours: "00:00:00",
                                                allocatedHours: "00:00:00",
                                                percentageUsed: "00",
                                                moneySpent: "00"
                                            }
                                        }, {
                                            upsert: true,
                                            new: false
                                        }, function(err, data) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                var subDept = 0;
                                                var subDeptArray = [];
                                                subDeparment.find({
                                                    companyId: companyId
                                                }, function(err, subDeaptDetail) {
                                                    if (subDeaptDetail.length > 0) {
                                                        async.eachSeries(subDeaptDetail, function(dept, cbsubDept) {
                                                            subDept++;
                                                            subDeptArray.push({
                                                                departmentId: dept.parentDeptId,
                                                                parentDeptName: dept.parentDeptName,
                                                                //    departmentId: dept.parentDeptId,
                                                                subDeptId: dept._id,
                                                                subDeptName: dept.name
                                                            });
                                                            if (subDept == subDeaptDetail.length) {
                                                                subDashboard.update({
                                                                    'companyId': companyId,
                                                                    'weekStart': start,
                                                                    'weekEnd': end
                                                                }, {
                                                                    $set: {
                                                                        subDepartments: subDeptArray,
                                                                        companyId: companyId, // company user Id (id of tenant)    
                                                                        weekStart: start,
                                                                        weekEnd: end
                                                                    }
                                                                }, {
                                                                    upsert: true,
                                                                    new: false
                                                                }, function(err, data) {
                                                                    console.log("done sub");
                                                                    console.log('--done');
                                                                    cbdept();
                                                                });
                                                            } else {
                                                                cbsubDept();
                                                            }
                                                        });
                                                    } else {
                                                        cbdept();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    cbCmp();
                                }
                            });
                        });
                    } else {
                        cbCmp();
                    }
                }
                if (cmpCount == CompanyData.length) {
                    console.log("Record For Dashboard is Created.....");
                }
            });
        } else {
            // console.log("Invalid Company Id");
        }
    });
};
// Exports End
/* Const and Libs */
var mongoose = require('mongoose'),
    https = require('https'),
    Company = mongoose.model('Company'),
    subDeparment = mongoose.model('subDeparment'),
    Employee = mongoose.model('Employee'),
    LeaveApplication = mongoose.model('LeaveApplication'),
    Attendance = mongoose.model('Attendance'),
    Dashboard = mongoose.model('Dashboard'),
    subDashboard = mongoose.model('subDashboard'),
    subMeterDashboard = mongoose.model('subMeterDashboard'),
    WeeklyOT = mongoose.model('WeeklyOT'),
    Messages = mongoose.model('Messages'),
    emailalerts = mongoose.model('emailalerts'),
    Shift = mongoose.model('Shifts'),
    Exceptions = mongoose.model('Exceptions'),
    Holidays = mongoose.model('Holidays'),
    SuperAdmin = mongoose.model('SuperAdmin'),
    Registrationkeys = mongoose.model('Registrationkeys'),
    IclockMysql = mongoose.model('IclockMysql'),
    period = mongoose.model('Period'),
    meterDashboard = mongoose.model('meterDashboard'),
    emailfn = require('../../functions/send_mail.js'),
    async = require('async'),
    employeeCtrl = require('../../app/controllers/employee'),
    cronCtrl = require('../../app/controllers/cron'),
    MongoClient = require('mongodb').MongoClient,
    empFn = require('../../functions/employeefn.js'),
    Moment = require('moment-timezone');

/* Functions Start */
function createDashboardRecord(CompanyData, callback) {
    var cmpCount = 0
    async.eachSeries(CompanyData, function(dataCompany, cbCmp) {
        if (dataCompany) {
            cmpCount++;
            var companyId = dataCompany._id;
            var companyname = dataCompany.companyname;
            var departments = dataCompany.departments;
            var isdashboard = dataCompany.isdashboard;
            console.log("isdashboard...........");
            if (isdashboard == true) {
                empFn.getPayperiod(companyId, function(result) {
                    var start = result.start;
                    var end = result.end;
                    var deptCount = 0;
                    Dashboard.findOne({
                        'companyId': companyId,
                        'weekStart': start,
                        'weekEnd': end
                    }, function(err, dashboardData) {
                        console.log("dashboardData");
                        if (!dashboardData) {
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
                                        calfalg: false
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
                                        cbdept();
                                    }
                                });
                            });
                        } else {
                            console.log('--done');
                        }
                    });
                });
            }
        }
        if (cmpCount == CompanyData.length) {
            callback();
        }
    });
}

function setFlagAtn(companyId, callback) {
    Attendance.update({
        'companyId': companyId
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
            callback(1);
        }
    });
}
/* Functions End */

/* Exports start */


exports.displayDashboardAcrodingNeed = function(req, res) {
    console.log("*** currentDate dashboard ***");
    //Vars
    var currentDate = Moment.utc(new Date()).format("YYYY-MM-DD"),
        companyId = req.body.companyId,
        start = req.body.start,
        end = req.body.end,
        dateArray = [];
    //Data
    console.log("start " + start);
    console.log("current " + currentDate);
    console.log("end " + end);
    var mStart = Moment(start),
        mEnd = Moment(end).add('days', 1),
        mCurrent = Moment(currentDate),
        dataCount = mCurrent.diff(mStart, 'days') + 1;
    dayDiff = mEnd.diff(mStart, 'days');
    // console.log(dataCount);
    // console.log(dayDiff);
    for (var m = Moment(mStart); m.isBefore(mEnd); m.add('days', 1)) {
        dateArray.push(m.format('YYYY-MM-DD'));
        // console.log(m.format('YYYY-MM-DD'));
    }
    //Find
    meterDashboard.find({
        companyId: companyId,
        date: {
            $gte: start,
            $lte: currentDate
        }
    }, function(err, mdash) {
        console.log("checking existence ..... %d : %d ", dataCount, mdash.length);
        if (dataCount === mdash.length) {
            console.log('already created');
            empFn.currentDateSubDashboardCalculation(companyId, start, currentDate, function(sub) {
                empFn.currentDateDashboardCalculation(companyId, start, currentDate, function(datas) {
                    console.log("before sending ...");
                    empFn.checkPreviousDashboard(companyId, start, end, function(prvsFlag) {
                        res.json({
                            data: datas,
                            subDepartmentList: sub,
                            prvsDatas: prvsFlag
                        });
                    });
                });
            });
        } else {
            console.log("creating....");
            cnt = 0;
            async.eachSeries(dateArray, function(dt, dtArr) {
                cnt++;
                console.log('day: %d date: %s ', cnt, dt);
                empFn.createMeterDashBoard(companyId, dt, start, end, function(result, subDepartmentsFlag) {
                    if (result) {
                        if (cnt === dateArray.length) {
                            empFn.calculateDateWiseData(function(done) {
                                console.log("calculation doen .... " + done);
                                if (done) {
                                    empFn.currentDateSubDashboardCalculation(companyId, start, currentDate, function(sub) {
                                        empFn.currentDateDashboardCalculation(companyId, start, currentDate, function(datas) {
                                            console.log("before sending ...");
                                            empFn.checkPreviousDashboard(companyId, start, end, function(prvsFlag) {
                                                res.json({
                                                    data: datas,
                                                    subDepartmentList: sub,
                                                    prvsDatas: prvsFlag
                                                });
                                            });
                                        });
                                    });
                                }
                            });
                        } else {
                            dtArr();
                        }
                    }
                }); //Create meter dashboard
            }); //Each date
        }
    });
};

exports.backUpTheDb = function(req, res) {
    console.log("backUpTheDb");
    var systemDb = [];
    var messagesDb = [];
    var attendanceDb = [];
    var employeeDb = [];
    var attendanceMysqlDb = [];
    var cron2Db = [];
    var cron3Db = [];
    var cronDb = [];
    var iclockMysqlDb = [];
    var weeklyOTDb = [];
    var periodDb = [];
    var subDeparmentDb = [];
    var dashboardDb = [];
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
    var employeeNumbersDb = [];
    var projectDb = [];
    var customShiftsDb = [];
    var meterDashboardDb = [];
    var subMeterDashboardDb = [];
    var tasksDb = [];
    var ruleDb = [];

    var cnt = 0;

    function getData(callbackFinal) {
        mongoose.connection.db.collectionNames(function(err, names) {
            async.eachSeries(names, function(namesDetail, callback) {
                var collectionName = namesDetail.name.split(".");
                collectionName = collectionName[1];
                console.log(cnt + "------" + collectionName + "---" + names.length);
                mongoose.connection.db.collection(collectionName, function(error, settings) {
                    if (collectionName == "company") {
                        cnt++;
                        settings.find({
                            '_id': mongoose.Types.ObjectId(req.body.companyId)
                        }, function(err, empDetails) {
                            empDetails.toArray(function(err, empDetail) {
                                cmnyDb = empDetail;
                                if (cnt == names.length - 1) {
                                    callbackFinal(2);
                                } else {
                                    callback()
                                }
                            });
                        });
                    } else {
                        cnt++;
                        settings.find({
                            companyId: req.body.companyId
                        }, function(err, empDetails) {
                            empDetails.toArray(function(err, empDetail) {
                                if (empDetail != null) {
                                    if (collectionName == "system") {
                                        systemDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "messages") {
                                        messagesDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "cron3") {
                                        cron3Db = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "cron2") {
                                        cron2Db = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "attendanceMysql") {
                                        attendanceMysqlDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback();
                                        }
                                    }
                                    if (collectionName == "employee") {
                                        employeeDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "attendance") {
                                        attendanceDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "period") {
                                        periodDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "weeklyOT") {
                                        weeklyOTDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "iclockMysql") {
                                        iclockMysqlDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "cron") {
                                        cronDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "subDeparment") {
                                        subDeparmentDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "dashboard") {
                                        dashboardDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "scheduling") {
                                        schedulingDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "emailalerts") {
                                        emailalertsDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "shifts") {
                                        shiftsDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "exceptions") {
                                        exceptionsDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "holidays") {
                                        holidaysDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "leaveApplication") {
                                        leaveApplicationDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "subDashboard") {
                                        subDashboardDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "sessions") {
                                        sessionsdDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "customreports") {
                                        customreportsDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "superAdmin") {
                                        superAdminDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == " { inline : 1 }") {
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "registrationkeys") {
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }
                                    if (collectionName == "rule") {
                                        ruleDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "employeeNumbers") {
                                        employeeNumbersDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "project") {
                                        projectDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "customShifts") {
                                        customShiftsDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "meterDashboard") {
                                        meterDashboardDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "subMeterDashboard") {
                                        subMeterDashboardDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                    if (collectionName == "tasks") {
                                        tasksDb = empDetail;
                                        if (cnt == names.length - 1) {
                                            callbackFinal(2);
                                        } else {
                                            callback()
                                        }
                                    }

                                } else {
                                    if (cnt == names.length - 1) {
                                        callbackFinal(2);
                                    } else {
                                        callback()
                                    }
                                }
                            })
                        });
                    }
                });
            });
        });
    }

    getData(function(result) {
        if (result == "2") {
            console.log("result if");
            console.log(req.body);
            if (req.body.Username && req.body.Password) {
                var dbUrl = 'mongodb://' + req.body.Username + ':' + req.body.Password + '@' + req.body.databaseIp + ':27017/' + req.body.databaseName;
            } else {
                var dbUrl = 'mongodb://' + req.body.databaseIp + '/' + req.body.databaseName;
            }


            MongoClient.connect(dbUrl, function(err, db) {
                // console.log(err);
                // console.log(db.collection);
                // test.equal(null, err);
                // test.ok(db != null);
                console.log("system");
                if (systemDb.length > 0) {
                    systemDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("system").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("messages");
                if (messagesDb.length > 0) {
                    messagesDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("messages").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("attendance");
                if (attendanceDb.length > 0) {
                    attendanceDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("attendance").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("employee");
                if (employeeDb.length > 0) {
                    employeeDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("employee").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("iclockMysql");
                if (iclockMysqlDb.length > 0) {
                    iclockMysqlDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("iclockMysql").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("weeklyOT");
                if (weeklyOTDb.length > 0) {
                    weeklyOTDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("weeklyOT").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("period");
                if (periodDb.length > 0) {
                    periodDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("period").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("subDeparment");
                if (subDeparmentDb.length > 0) {
                    subDeparmentDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("subDeparment").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("dashboard");
                if (dashboardDb.length > 0) {
                    dashboardDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("dashboard").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("scheduling");
                if (schedulingDb.length > 0) {
                    schedulingDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("scheduling").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("emailalerts");
                if (emailalertsDb.length > 0) {
                    emailalertsDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("emailalerts").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("shifts");
                if (shiftsDb.length > 0) {
                    shiftsDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("shifts").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("exceptions");
                if (exceptionsDb.length > 0) {
                    exceptionsDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("exceptions").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("holidays");
                if (holidaysDb.length > 0) {
                    holidaysDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("holidays").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("leaveApplication");
                if (leaveApplicationDb.length > 0) {
                    leaveApplicationDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("leaveApplication").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("subDashboard");
                if (subDashboardDb.length > 0) {
                    subDashboardDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("subDashboard").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("customreports");
                if (customreportsDb.length > 0) {
                    customreportsDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("customreports").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("superAdmin");
                if (superAdminDb.length > 0) {
                    superAdminDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("superAdmin").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("company");
                if (cmnyDb.length > 0) {
                    cmnyDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("company").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("employeeNumbers");
                if (employeeNumbersDb.length > 0) {
                    employeeNumbersDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("employeeNumbers").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                console.log("project");
                if (projectDb.length > 0) {
                    projectDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("project").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }

                console.log("customShifts");
                if (customShiftsDb.length > 0) {
                    customShiftsDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("customShifts").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }

                console.log("meterDashboard");
                if (meterDashboardDb.length > 0) {
                    meterDashboardDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("meterDashboard").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }

                console.log("subMeterDashboard");
                if (subMeterDashboardDb.length > 0) {
                    subMeterDashboardDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("subMeterDashboard").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }

                console.log("rule");
                if (ruleDb.length > 0) {
                    ruleDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("rule").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }

                console.log("tasks");
                if (tasksDb.length > 0) {
                    tasksDb.forEach(function(detail) {
                        var getOldId = detail._id;
                        delete detail._id;
                        db.collection("tasks").update({
                            "_id": getOldId
                        }, {
                            $set: detail
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, result) {});
                    });
                }
                res.json(true);
            });
        }
    });
};

exports.updateCompanyDetail = function(req, res) {
    // console.log(req.body);
    if (req.body.isExceptionTotal1) {
        console.log("innnnnnn........");
        if (req.body.isExceptionTotal) {
            console.log("true");
            Exceptions.find({
                companyId: req.body._id
            }, function(err, details) {
                // console.log(detail);
                async.eachSeries(details, function(detail, callback) {
                    // console.log(detail);
                    Exceptions.update({
                        '_id': detail._id
                    }, {
                        $set: {
                            exceptionTotal: detail.addToStandardHours,
                            addToStandardHours: true
                        }
                    }, {
                        upsert: false,
                        new: false
                    }, function(err, update) {
                        callback();
                    })
                });
            })
        } else {
            Exceptions.find({
                companyId: req.body._id
            }, function(err, details) {
                async.eachSeries(details, function(detail, callback) {
                    // console.log(detail);
                    Exceptions.update({
                        '_id': detail._id
                    }, {
                        $set: {
                            addToStandardHours: detail.exceptionTotal
                        }
                    }, {
                        upsert: false,
                        new: false
                    }, function(err, update) {
                        // console.log(err)
                        // console.log(update)
                        callback();
                    })
                });
            })
        }
    }

    empFn.getCompanyData(req.body._id, function(comp) {
        if (req.body.isAutoTask != comp.isAutoTask) {
            empFn.setProjectFlag(req.body._id, function(dt) {
                console.log("auto task updated project flag...");
            });
        }
        var defaultJCVal;

        if (req.body.jobCosting) {
            defaultJCVal = req.body.isDefaultJC;
        } else {
            defaultJCVal = false;
        }

        Company.update({
            '_id': req.body._id
        }, {
            $set: {
                isMap: req.body.isMap,
                isScheduling: req.body.isScheduling,
                isReadWrite: req.body.isReadWrite,
                isdashboard: req.body.isdashboard,
                ishourlywage: req.body.ishourlywage,
                isProject: req.body.isProject,
                isRoster: req.body.isRoster,
                isHolidays: req.body.isHolidays,
                isdepartments: req.body.isdepartments,
                isEmpNoNewMode: req.body.isEmpNoNewMode,
                is3GIdMode: req.body.is3GIdMode,
                isAutoTask: req.body.isAutoTask,
                ischargeOutRate: req.body.ischargeOutRate,
                isSubDepartmentEnable: req.body.isSubDepartmentEnable,
                isDepartmentTagsInShift: req.body.isDepartmentTagsInShift,
                isTimeZoneForShift: req.body.isTimeZoneForShift,
                isSecondBreakInShift: req.body.isSecondBreakInShift,
                jobCosting: req.body.jobCosting,
                IsUniqueScheduling: req.body.IsUniqueScheduling,
                IsEnableReportSystem1: req.body.IsEnableReportSystem1,
                isallowances: req.body.isallowances,
                isExceptionTotal: req.body.isExceptionTotal,
                manageLeaves: req.body.manageLeaves,
                manageExceptions: req.body.manageExceptions,
                daysLimit: req.body.daysLimit,
                isDefaultJC: defaultJCVal,
                isSecondTick: req.body.isSecondTick,
                isLocked: req.body.isLocked,
                maxActiveUsers: req.body.maxActiveUsers,
            }
        }, {
            upsert: false,
            new: false
        }, function(err, data) {
            console.log(err);
            console.log(data);
            if (req.body.ishourlywage) {
                if (req.body.daysLimit != comp.daysLimit) {
                    res.json({
                        'limit': true
                    });
                } else if (req.body.maxActiveUsers != comp.maxActiveUsers) {
                    res.json({
                        'users': true
                    });
                } else {
                    res.json(true);
                }
            } else {
                Employee.update({
                    'companyId': req.body._id
                }, {
                    $set: {
                        hourlyRate: ''
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true
                }, function(err, data) {
                    var dt = new Date();
                    var newDate = Moment(dt).format("YYYY-MM-DD");
                    Attendance.update({
                        "date": {
                            $gte: newDate
                        },
                        'companyId': req.body._id
                    }, {
                        $set: {
                            hourlyRate: ''
                        }
                    }, {
                        upsert: false,
                        new: false,
                        multi: true
                    }, function(err, data) {
                        if (req.body.daysLimit != comp.daysLimit) {
                            res.json({
                                'limit': true
                            });
                        } else if (req.body.maxActiveUsers != comp.maxActiveUsers) {
                            res.json({
                                'users': true
                            });
                        } else {
                            res.json(true);
                        }
                    });
                });
            }
        });
    });
};

exports.getCompanyDetail = function(req, res) {
    empFn.setActiveEmployee(req.params.companyId, function(data) {
        res.json(data);
    });
};
/*
 * budgetedSubDeptSaleSave : budgeted sales data can be only saved by sub department admin
 */
exports.budgetedSubDeptSaleSave = function(req, res) {
    console.log("sub department budget sale saving...");
    console.log(req.body);
    subMeterDashboard.update({
        "subDepartments._id": req.body.subDepartmentId,
        'companyId': req.session.user,
        'date': req.body.myDate,
    }, {
        $set: {
            "subDepartments.$.budgetedSales": parseFloat(req.body.budgetedSale),
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        console.log(err, data);
        if (err) {
            console.log("failed to update budgetedSubDeptSale");
            res.json(false);
        } else {
            empFn.setMeterDashboardFlagSingle(req.body.myDate, req.session.user, function(respM) {
                if (respM) {
                    empFn.setDashboardFlagSingle(req.body.weekStart, req.body.weekEnd, req.session.user, function(respD) {
                        if (respD) {
                            res.json(true);
                        } else {
                            res.json(false);
                        }
                    });
                } else {
                    res.json(false);
                }
            });
        }
    });
};

/*
 * actualSubDeptSaleSave : actual sales data can be only saved by sub department admin
 */
exports.actualSubDeptSaleSave = function(req, res) {
    console.log(req.body);
    subMeterDashboard.update({
        "subDepartments._id": req.body.subDepartmentId,
        'companyId': req.session.user,
        'date': req.body.myDate,
    }, {
        $set: {
            "subDepartments.$.actualSales": parseFloat(req.body.actualSales),
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log("failed to update budgetedSubDeptSale");
            res.json(false);
        } else {
            empFn.setMeterDashboardFlagSingle(req.body.myDate, req.session.user, function(respM) {
                if (respM) {
                    empFn.setDashboardFlagSingle(req.body.weekStart, req.body.weekEnd, req.session.user, function(respD) {
                        if (respD) {
                            res.json(true);
                        } else {
                            res.json(false);
                        }
                    });
                } else {
                    res.json(false);
                }
            });
        }
    });
};

exports.changeadminpassword = function(req, res) {
    var password = req.params.newPassword;
    var superAdmin = new SuperAdmin();
    SuperAdmin.findOne({}, function(err, data) {
        if (data) {
            SuperAdmin.update({
                '_id': data._id,
            }, {
                $set: {
                    password: superAdmin.generateHash(req.params.newPassword)
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
    });
};

exports.logout = function(req, res) {
    /* logout from app and redirect to login page*/
    req.logout()
    res.redirect('/')
};

exports.addDepartment = function(req, res) {
    console.log(req.body);
    var userId = req.session.user;
    var department = req.body.departmentname;
    Company.update({
        '_id': userId,
        'departments.name': {
            $ne: department
        }
    }, {
        $set: {
            isdepartments: true
        },
        $push: {
            departments: {
                name: department
            }
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            res.json(false);
        } else {
            Employee.update({
                permission: {
                    $ne: department
                },
                'companyId': req.session.user,
                administrator: true
            }, {
                $push: {
                    permission: department,
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {
                if (err) {
                    res.json(false);
                } else {
                    res.json(true);
                }
            });
        }
    });
};

exports.saveSubDepartment = function(req, res) {
    // console.log(req.body);
    var companyId = req.session.user;
    var start = req.body.start;
    var end = req.body.end;
    req.body.departmentList.forEach(function(detail) {
        if (detail.name == req.body.parentDept) {
            subDeparment.find({
                name: req.body.subDept,
                parentDeptId: detail._id,
                parentDeptName: detail.name
            }, {}, {
                limit: 1
            }, function(err, subDeptDetail) {
                if (subDeptDetail.length > 0) {
                    res.json(true);
                } else {
                    var subDeparments = new subDeparment();
                    subDeparments.parentDeptId = detail._id;
                    subDeparments.parentDeptName = detail.name;
                    subDeparments.name = req.body.subDept;
                    subDeparments.companyId = companyId;
                    subDeparments.save(function(err, subDepartment) {

                        subDashboard.update({
                            'companyId': companyId,
                            'weekStart': {
                                $gte: start
                            }
                        }, {
                            $push: {
                                'subDepartments': {
                                    parentDeptName: detail.name,
                                    departmentId: detail._id,
                                    subDeptId: subDepartment._id,
                                    subDeptName: req.body.subDept
                                }
                            }
                        }, {
                            upsert: true,
                            new: false,
                            multi: true
                        }, function(err, data) {
                            console.log("subDepartments pushed " + data);
                            if (err) {} else {
                                res.json(true);
                            }
                        })
                    });
                }
            });
        }
    });
};

exports.getSubDepartmentList = function(req, res) {
    subDeparment.find({
        companyId: req.session.user
    }, function(err, detail) {
        res.json(detail);
    });
};

exports.adddashboarddepartment = function(req, res) {
    var userId = req.session.user;
    var department = req.body.department;
    var start = req.body.start;
    var end = req.body.end;
    Company.findById(userId, function(err, user) {
        if (user) {
            var departments = user.departments;
            departments.forEach(function(dept) {
                var deptName = dept.name;
                var deptId = dept._id;
                if (deptName == department) {
                    Dashboard.update({
                        'departments.departmentName': {
                            $ne: deptName
                        },
                        'companyId': userId,
                        'weekStart': {
                            $gte: start
                        }
                    }, {
                        $push: {
                            departments: {
                                departmentId: deptId,
                                departmentName: deptName,
                                workedHours: "00:00:00"
                            }
                        }
                    }, {
                        upsert: false,
                        new: false,
                        multi: true
                    }, function(err, data) {
                        if (err) {} else {
                            res.json(true);
                        }
                    })
                }
            });
        }
    });
};

/*
 * Function
 * Will check department or sub department in use status and return bool
 */
function getUsingStatus(companyId, value, type, callback) {
    if (type == 'dept') {
        console.log("department");
        Attendance.findOne({
            'companyId': companyId,
            'department': value
        }, function(err, data) {
            if (data)
                callback(true);
            else
                callback(false);
        });
    } else {
        console.log("sub department");
        Attendance.findOne({
            'companyId': companyId,
            'subDepartment': value
        }, function(err, data) {
            if (data)
                callback(true);
            else
                callback(false);
        });
    }
}

/*
 * API : /deleteDepartment
 * Will delete department related data in following collections :
 * 1. Company
 * 2. Employee
 * 3. Attendance
 * 4. Dashboard
 * 5. subDashboard
 * 6. subDeparment
 */
exports.deleteDepartment = function(req, res) {
    var userId = req.session.user;
    var departmentName = req.body.departmentName;
    var dateStart = Moment.utc(req.body.dateStart).format('YYYY-MM-DD');

    // check department
    getUsingStatus(userId, departmentName, 'dept', function(status) {
        // console.log(status);
        if (status)
            res.json(false);
        else {
            Company.update({
                '_id': userId
            }, {
                $pull: {
                    departments: {
                        'name': departmentName
                    }
                }
            }, {
                upsert: false,
                new: false
            }, function(err, data) {
                if (err) {
                    res.json(false);
                } else {
                    Employee.update({
                        'companyId': userId,
                        'department': departmentName
                    }, {
                        $set: {
                            department: '',
                            subDepartment: '',
                        }
                    }, {
                        upsert: false,
                        new: false,
                        multi: true
                    }, function(err, data) {
                        if (err) {
                            res.json(false);
                        } else {
                            Employee.update({
                                'companyId': userId,
                                permission: departmentName
                            }, {
                                $pull: {
                                    permission: departmentName
                                }
                            }, {
                                upsert: false,
                                new: false,
                                multi: true
                            }, function(err, data) {

                            });

                            Dashboard.update({
                                'companyId': userId,
                                'weekStart': {
                                    $gte: dateStart
                                }
                            }, {
                                $set: {
                                    calfalg: false
                                },
                                $pull: {
                                    departments: {
                                        'departmentName': departmentName
                                    }
                                }
                            }, {
                                upsert: false,
                                new: false,
                                multi: true
                            }, function(err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('deleted and dashboard updated ' + data);
                                    empFn.setDashboardFlag(req.body.dateStart, userId, function(status) {
                                        if (status) {
                                            console.log("Meter Dashboard " + status);
                                        }
                                    });
                                }
                            });

                            Attendance.update({
                                "date": {
                                    $gte: dateStart
                                },
                                'companyId': userId,
                                'department': departmentName
                            }, {
                                $set: {
                                    department: '',
                                    subDepartment: ''
                                }
                            }, {
                                upsert: false,
                                new: false,
                                multi: true
                            }, function(err, data) {
                                if (err) {} else {
                                    subDeparment.remove({
                                        'companyId': userId,
                                        'parentDeptName': departmentName
                                    }, function(err, detail) {
                                        subDashboard.update({
                                            'subDepartments.departmentId': req.body.departmentId,
                                            'weekStart': {
                                                $gte: dateStart
                                            },
                                            'companyId': req.session.user
                                        }, {
                                            $pull: {
                                                subDepartments: {
                                                    departmentId: req.body.departmentId
                                                }
                                            }
                                        }, {
                                            upsert: false,
                                            new: false,
                                            multi: true
                                        }, function(err, data) {
                                            res.json(true);
                                        });
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

/*
 * API : /deleteSubDepartment
 * Will delete sub department related data in following collections :
 * 1. Company
 * 2. Employee
 * 3. Attendance
 * 4. subDeparment
 * 5. subDashboard
 */
exports.deleteSubDepartment = function(req, res) {
    var dateStart = Moment.utc(req.body.dateStart).format('YYYY-MM-DD');

    //check department
    getUsingStatus(req.session.user, req.body.departmentName, 'subDept', function(status) {
        console.log(status);
        if (status)
            res.json(false);
        else {
            subDeparment.remove({
                _id: req.body.departmentId
            }, function(err, detail) {
                Employee.update({
                    'companyId': req.session.user,
                    'subDepartment': req.body.departmentName
                }, {
                    $set: {
                        subDepartment: '',
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true
                }, function(err, data) {
                    if (err) {
                        res.json(false);
                    } else {
                        Attendance.update({
                            date: {
                                $gte: new Date(dateStart)
                            },
                            'companyId': req.session.user,
                            'subDepartment': req.body.departmentName
                        }, {
                            $set: {
                                subDepartment: ''
                            }
                        }, {
                            upsert: false,
                            new: false,
                            multi: true
                        }, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                subDashboard.update({
                                    'subDepartments.subDeptId': req.body.departmentId,
                                    weekStart: {
                                        $gte: req.body.start
                                    },
                                    'companyId': req.session.user
                                }, {
                                    $pull: {
                                        subDepartments: {
                                            subDeptName: req.body.departmentName
                                        }
                                    }
                                }, {
                                    upsert: false,
                                    new: false,
                                    multi: true
                                }, function(err, data) {
                                    res.json(true);
                                });
                            }
                        });
                    }
                });
            });
        }
    });
};


exports.addPasscode = function(req, res) {
    var userId = req.session.user;
    var passcode = req.body.passcodeno;
    Company.update({
        '_id': userId
    }, {
        $push: {
            passcode: {
                no: passcode
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
};

exports.addAllowance = function(req, res) {
    var userId = req.session.user;
    var allowance = req.body.allowancename;
    Company.update({
        '_id': userId
    }, {
        $set: {
            isallowances: true
        },
        $push: {
            allowances: {
                name: allowance
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
};

exports.update = function(req, res) {
    //if(req.body.country !='')
    var country = req.body.country;
    var companyname = req.body.companyname;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;
    var email = req.body.email;
    var mobile = req.body.mobile;
    var phone = req.body.phone;
    var isovertime = req.body.isovertime;
    var overtimePeriod = req.body.overtimePeriod;
    var ispayroll = req.body.ispayroll;
    var ischargeOutRate = req.body.ischargeOutRate;
    var isHolidays = req.body.isHolidays;
    var WeekdayStart = req.body.WeekdayStart;
    var overtimeLevel = req.body.overtimeLevel;
    var payrollSystem = req.body.payrollSystem;
    var payPeriod = req.body.payPeriod;
    var isallowances = req.body.isallowances;
    var isdepartments = req.body.isdepartments;
    var tooltipDelayTime = req.body.tooltipDelayTime;
    var jobCosting = req.body.jobCosting;
    var payPeriodStartDate = req.body.payPeriodStartDate;
    var isRoster = req.body.isRoster;
    var isProject = req.body.isProject;
    var ishourlywage = req.body.ishourlywage;
    var shiftCutoff = req.body.shiftCutoff;
    var shiftCutoffPeriod = req.body.shiftCutoffPeriod;
    var isdashboard = req.body.isdashboard;
    var userId = req.session.user;
    companyObject = new Company();
    Company.findById(userId, function(err, user) {
        if (user) {
            var pwd = '';
            var userHolidays = user.isHolidays;
            // var email = user.email;
            if (user.password != password) {
                pwd = companyObject.generateHash(password);
            } else {
                pwd = user.password;
            }
            if (user.isovertime === false && isovertime === true) {
                Shift.update({
                    'companyId': user._id
                }, {
                    $set: {
                        ordinarytime: '20:00:00',
                        overTime1: '20:00:00',
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true
                }, function(err, data) {});
            }
            Shift.update({
                'companyId': user._id,
                company: ""
            }, {
                $set: {
                    company: companyname,
                }
            }, {
                upsert: false,
                new: false,
                multi: true
            }, function(err, data) {});
            Company.update({
                '_id': userId
            }, {
                $set: {
                    country: country,
                    companyname: companyname,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: pwd,
                    mobile: mobile,
                    phone: phone,
                    isovertime: isovertime,
                    overtimeLevel: overtimeLevel,
                    overtimePeriod: overtimePeriod,
                    WeekdayStart: WeekdayStart,
                    ispayroll: ispayroll,
                    payrollSystem: payrollSystem,
                    payPeriod: payPeriod,
                    ischargeOutRate: ischargeOutRate,
                    isHolidays: isHolidays,
                    isallowances: isallowances,
                    isdepartments: isdepartments,
                    tooltipDelayTime: tooltipDelayTime,
                    jobCosting: jobCosting,
                    payPeriodStartDate: payPeriodStartDate,
                    isRoster: isRoster,
                    isProject: isProject,
                    ishourlywage: ishourlywage,
                    shiftCutoff: shiftCutoff,
                    shiftCutoffPeriod: shiftCutoffPeriod,
                    isdashboard: isdashboard
                }
            }, {
                upsert: true,
                new: false
            }, function(err, data) {
                if (err) {
                    res.json(false);
                } else {
                    Employee.update({
                        'email': user.email
                    }, {
                        $set: {
                            country: country,
                            administrator: true,
                            firstName: firstname,
                            lastName: lastname,
                            email: email,
                            password: pwd,
                            //active:true,
                            companyname: companyname
                        }
                    }, {
                        upsert: true,
                        new: false
                    }, function() {
                        if (err) {
                            res.json(false);
                        } else {
                            if (userHolidays != isHolidays) {
                                empFn.getHolidays(userId, function(holidayresult) {
                                    var holiday = '';
                                    if (isHolidays == true) {
                                        holiday = true;
                                    } else {
                                        holiday = false;
                                    }
                                    var holidaysArray = [];
                                    var currentDate = Moment.utc().format('YYYY-MM-DD');
                                    holidayresult.forEach(function(holidayDate) {
                                        if (holidayDate > currentDate) {
                                            holidaysArray.push(holidayDate);
                                        }
                                    });
                                    Attendance.update({
                                        date: {
                                            $in: holidaysArray
                                        },
                                        companyId: userId
                                    }, {
                                        $set: {
                                            holiday: holiday
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
                                })
                            } else {
                                res.json(true);
                            }
                        }
                    })
                }
            });
        }
    });
};

exports.addGlobalrule = function(req, res) {
    var userId = req.session.user;
    var isrounding = req.body.isrounding;
    var rounding = req.body.rounding;
    var inRounding = req.body.inRounding;
    var outRounding = req.body.outRounding;
    var inroundupafter = req.body.inroundupafter
    var outroundupafter = req.body.outroundupafter;
    var closestMin = req.body.closestMin;
    var roundUpAfter = req.body.roundUpAfter;
    var weeklyNTG = req.body.weeklyNT;
    var weeklyOT1G = req.body.weeklyOT1;
    // console.log(weeklyNTG);
    // console.log(weeklyOT1G);
    //console.log(userId);
    if (rounding == 'in/out') {
        Company.update({
            '_id': userId
        }, {
            $set: {
                isrounding: isrounding,
                rounding: rounding,
                inRounding: inRounding,
                outRounding: outRounding,
                inroundupafter: inroundupafter,
                outroundupafter: outroundupafter,
                weeklyNT: weeklyNTG,
                weeklyOT1: weeklyOT1G
            }
        }, {
            upsert: false,
            new: false
        }, function(err, data) {
            if (err) {
                console.log(err);
                res.json(false);
            } else {
                res.json(true);
            }
        });
    } else {
        Company.update({
            '_id': userId
        }, {
            $set: {
                isrounding: isrounding,
                rounding: rounding,
                closestMin: closestMin,
                outRounding: outRounding,
                roundUpAfter: roundUpAfter,
                weeklyNT: weeklyNTG,
                weeklyOT1: weeklyOT1G
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
};

exports.addHolidaysSettings = function(req, res) {
    var userId = req.session.user;
    var holidayStandardHours = req.body.holidayStandardHours;
    var holidaymultiplier = req.body.holidaymultiplier;
    var holidayweeklyOtinclude = req.body.holidayweeklyOtinclude;
    var holidayaddToStandardHours = req.body.holidayaddToStandardHours;
    var payrollCode = req.body.payrollCode;
    Company.update({
        '_id': userId
    }, {
        $set: {
            holidayStandardHours: holidayStandardHours,
            holidaymultiplier: holidaymultiplier,
            holidayweeklyOtinclude: holidayweeklyOtinclude,
            holidayaddToStandardHours: holidayaddToStandardHours,
            payrollCode: payrollCode
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
};

exports.sendFeedback = function(req, res) {
    var userId = req.session.user;
    var txttitle = req.body.title;
    var chkboxes = req.body.label;
    var txtcomment = req.body.description;
    var txtname = req.body.name;
    var txtphno = req.body.phone;
    var txtemail = req.body.email;
    var companyName = req.body.companyname;
    var browser = req.body.browser;
    var jsonarray = [];
    var chkarr = [];
    console.log(req.session.email + 'email & ' + userId);
    chkboxes.push('Support NEW');

    console.log(browser + 'browserbrowser');

    Employee.findOne({
            'email': req.session.email,
            'companyId': userId
        }, function(err, data) {
            if (data) {
                var employeeName = data.firstName;
                var employeeNo = data.employeeNo;
                jsonarray.push({
                    title: txttitle,
                    body: "Name: " + txtname + "\n Phone No: " + txtphno + "\n Email: " + txtemail + "\n Description: " + txtcomment + "\n\n\n\n\n----------------------------------------------\n Comapny Name: " + companyName + "\n Employee Name: " + employeeName + " (employeeNo: " + employeeNo + ")\n Browser :" + browser,
                    labels: chkboxes
                });
                console.log(txtcomment + 'txtcommenttxtcomment');
                // console.log(companyName);

                var tempjsonarray = JSON.stringify(jsonarray).substr(1, JSON.stringify(jsonarray).length - 2);
                var jsonString = tempjsonarray;
                var headers = {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Time-Cloud',
                    'Content-Length': jsonString.length
                };

                var options = {
                    host: 'api.github.com',
                    path: '/repos/barnieb/TC-SUPPORT/issues?access_token=8e4252932460f9eb55b25343a608d1df3ae705dd',
                    method: 'POST',
                    headers: headers
                };
                var req = https.request(options, function(res) {
                    res.setEncoding('utf-8');
                    var responseString = '';
                    res.on('data', function(data) {
                        responseString += data;
                    });
                    res.on('end', function() {
                        var resultObject = JSON.parse(responseString);
                    });
                });

                req.on('error', function(e) {
                    console.log(e);
                    //console.log('error..............');
                });

                req.write(jsonString);
                req.end();
                res.json(true);

            }
        })
        /*console.info('Options prepared:');
        console.info(options);
        console.info('Do the POST call');*/

    // Setup the request.  The options parameter is the object we defined above.
};

exports.allCompanyData = function(req, res) {
    if (req.session.admin) {
        Company.find({}, function(err, data) {
            if (data) {
                var compCnt = 0;
                async.eachSeries(data, function(comp, callbackComp) {
                    compCnt++;
                    if (!comp.activeUsers) {
                        console.log("activeUsers not found");
                        empFn.setActiveEmployee(comp._id, function(resp) {
                            if (compCnt == data.length)
                                res.json(data);
                            else
                                callbackComp();
                        });
                    } else {
                        // console.log("already set");
                        // if(compCnt == data.length)
                        res.json(data);
                        // else
                        // callbackComp();
                    }
                });
            }
        });
    }
};

exports.changeEmployeeno = function(req, res) {
    var companyId = req.params.companyId;
    Employee.find({
        'companyId': companyId
    }, function(err, employeeData) {
        if (employeeData) {
            employeeData.forEach(function(empData) {
                var email = empData.email;
                var employeeNo = empData.employeeNo
                Attendance.update({
                    'companyId': companyId,
                    'email': email
                }, {
                    $set: {
                        employeeNo: employeeNo
                    }
                }, {
                    upsert: false,
                    new: false,
                    multi: true
                }, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('updated');
                    }
                });
            });
        }
    });
    res.send('employeeNo updated');
};

exports.checkAuth = function(req, res) {
    if (req.session.subadmin) {
        var employeeNo = req.params.employeeNo;
        Employee.find({
            'companyId': req.session.user,
            employeeNo: req.params.employeeNo,
            'department': {
                $in: req.session.subadmin
            },
            'active': true
        }).sort({
            employeeNo: 1
        }).limit(1).exec(function(err, dataRec) {
            if (dataRec.length > 0) {
                res.json(true);
            } else {
                res.json(false);
            }
        });
    } else {
        res.json(true);
    }
};

exports.adminEmployeeNo = function(req, res) {
    if (req.session.subadmin) {
        Employee.find({
            'companyId': req.session.user,
            'department': {
                $in: req.session.subadmin
            },
            'active': true
        }).sort({
            employeeNo: 1
        }).limit(1).exec(function(err, dataRec) {
            if (dataRec.length > 0) {
                dataRec.forEach(function(data) {
                    var employeeName = data.firstName;
                    var employeeNo = data.employeeNo;
                    res.json(employeeNo);
                })
            }
        });
    } else {
        Employee.find({
            'companyId': req.session.user,
            'active': true
        }).sort({
            employeeNo: 1
        }).limit(1).exec(function(err, dataRec) {
            if (dataRec.length > 0) {
                dataRec.forEach(function(data) {
                    var employeeName = data.firstName;
                    var employeeNo = data.employeeNo;
                    // console.log(employeeNo);
                    res.json(employeeNo);
                })
            }
        });
    }
};

exports.LeaveApplication = function(req, res) {
    /* send employee leave application to company */
    var msgObject = new Messages();
    var leaveApplication = new LeaveApplication();
    leaveApplication.employeeNo = req.body.employeeNo;
    leaveApplication.companyId = req.session.user;
    leaveApplication.startDate = Moment.utc(req.body.startDate).format('YYYY-MM-DD');
    leaveApplication.finishDate = Moment.utc(req.body.finishDate).format('YYYY-MM-DD');
    leaveApplication.comment = req.body.comment;
    leaveApplication.exception = req.body.exception;
    leaveApplication.employeeName = req.body.employeeName;
    leaveApplication.save(function(err, data) {
        if (data) {
            //var url="<a href='#/attendanceedit/"+req.body.employeeNo+"/"+leaveApplication.startDate +"></a>";
            var url = "#/attendanceedit/" + req.body.employeeNo + "/" + Moment.utc(req.body.startDate).format('YYYY-MM-DD');
            //(if incase you are not able to click on this link please copy and paste into browsers address bar)</br> http:localhost:3000/
            msgObject.companyId = req.session.user;
            msgObject.subject = "Leave Application";
            msgObject.message = "You have leave requests to review. (if incase you are not able to click on this link please copy and paste into browsers address bar)\n http://162.243.246.20/index/" + url;
            msgObject.from = req.body.employeeName;
            msgObject.received = Moment.utc().format();
            msgObject.save(function(err, data) {
                if (!err) {
                    res.json(true);
                } else {
                    console.log(err);
                }
            });
        }
    });
};

exports.getleavesList = function(req, res) {
    /* get lists of leaves for logged in companyId */
    LeaveApplication.find({
        'companyId': req.session.user
    }).sort({
        '_id': 'asc'
    }).exec(function(err, data) {
        if (data) {
            res.json(data);
        }
    });
};

exports.accpetleave = function(req, res) {
    LeaveApplication.update({
        '_id': req.params.leaveId
    }, {
        $set: {
            accepted: true,
            rejected: false

        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            LeaveApplication.findOne({
                '_id': req.params.leaveId
            }, function(err, data) {
                if (data) {
                    // console.log(req.params.leaveId +'exception');
                    var startDate = Moment.utc(data.startDate).format('YYYY-MM-DD');
                    var finishDate = Moment.utc(data.finishDate).add('days', 1).format('YYYY-MM-DD');
                    var exception = data.exception;
                    var companyId = data.companyId;
                    var employeeNo = data.employeeNo;
                    var subject = "Leave Accepted";
                    var body = "Your Leave " + exception + " from " + startDate + " to " + finishDate + " is Accepted";
                    Employee.findOne({
                        'employeeNo': employeeNo,
                        'companyId': companyId
                    }, function(err, empData) {
                        var email = empData.email;
                        console.log(email);
                        var tcEmail = 'barnie@tme.co.nz';
                        // var tcEmail='asmitashiyal@gmail.com';
                        emailfn.send_mail(tcEmail, subject, body, function(output) {
                            if (output == false) {
                                console.log('err');
                            } else {
                                console.log('mail sent');
                            }
                        });

                    });
                    Company.findOne({
                        '_id': companyId
                    }, function(err, CompanyData) {
                        if (CompanyData) {
                            var weekly = 0;
                            var overTime = '';
                            if (CompanyData.isovertime) {
                                if (CompanyData.overtimePeriod == "weekly") {
                                    weekly = 1;
                                } else {
                                    weekly = 0;
                                }
                                if (CompanyData.overtimeLevel == "1") {
                                    overTime = 1;
                                } else {
                                    overTime = 2;
                                }
                            }
                        }
                        // Attendance.find({'employeeNo':employeeNo, 'companyId':companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+startDate, $lt: 'this.date.toJSON().slice(0, 10) == '+finishDate }}, function(err, AttendanceData){
                        Attendance.find({
                            'employeeNo': employeeNo,
                            'companyId': companyId,
                            "date": {
                                $gte: new Date(startDate),
                                $lt: new Date(finishDate)
                            }
                        }, function(err, AttendanceData) {
                            if (AttendanceData) {
                                var n = 0;
                                AttendanceData.forEach(function(atnData) {
                                    var attendanceId = atnData._id;
                                    n++;
                                    empFn.getExceptionData(exception, companyId, function(result) {
                                        var standardHours = result.standardHours;
                                        var addToStandardHours = result.addToStandardHours;
                                        var weeklyOtinclude = result.weeklyOtinclude;
                                        // console.log(standardHours);
                                        // console.log(addToStandardHours);
                                        // console.log(weeklyOtinclude);
                                        if (weekly == 0) {
                                            if (addToStandardHours == true && standardHours) {
                                                Attendance.update({
                                                    '_id': attendanceId,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        totalRounded: standardHours,
                                                        Exception: standardHours,
                                                        normalTime: standardHours,
                                                        ExceptionAssign: exception,
                                                        shift: '',
                                                        addException: false,
                                                        holiday: true
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                })
                                            }
                                            if (addToStandardHours == false && standardHours) {
                                                Attendance.update({
                                                    '_id': attendanceId,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        totalRounded: standardHours,
                                                        Exception: standardHours,
                                                        normalTime: '00:00:00',
                                                        ExceptionAssign: exception,
                                                        shift: '',
                                                        addException: false,
                                                        holiday: true
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                })
                                            }

                                        }

                                        if (weekly == 1) {
                                            if (addToStandardHours == true && weeklyOtinclude == true) {
                                                Attendance.update({
                                                    '_id': attendanceId,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        totalRounded: standardHours,
                                                        Exception: standardHours,
                                                        normalTime: standardHours,
                                                        ExceptionAssign: exception,
                                                        ot2Rule: '00:00:00',
                                                        shift: '',
                                                        addException: true,
                                                        holiday: true
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                })
                                            }
                                            if (addToStandardHours == true && weeklyOtinclude == false) {
                                                Attendance.update({
                                                    '_id': attendanceId,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        totalRounded: standardHours,
                                                        Exception: standardHours,
                                                        normalTime: standardHours,
                                                        ExceptionAssign: exception,
                                                        ot2Rule: '00:00:00',
                                                        shift: '',
                                                        addException: false,
                                                        holiday: true
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                })
                                            }
                                            if (addToStandardHours == false && weeklyOtinclude == false) {
                                                Attendance.update({
                                                    '_id': attendanceId,
                                                    'companyId': companyId
                                                }, {
                                                    $set: {
                                                        totalRounded: standardHours,
                                                        Exception: standardHours,
                                                        normalTime: '00:00:00',
                                                        ExceptionAssign: exception,
                                                        shift: '',
                                                        addException: false,
                                                        holiday: true
                                                    }
                                                }, {
                                                    upsert: true,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                })

                                            }
                                        }
                                        if (AttendanceData.length == n) {
                                            res.json(true);
                                        }
                                    });
                                });
                            }

                        });
                    });

                }
            });
        }
    });
};

exports.rejectleave = function(req, res) {
    LeaveApplication.update({
        '_id': req.params.leaveId
    }, {
        $set: {
            rejected: true,
            accepted: false
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            LeaveApplication.findOne({
                '_id': req.params.leaveId
            }, function(err, data) {
                if (data) {
                    var startDate = Moment.utc(data.startDate).format('YYYY-MM-DD');
                    var finishDate = Moment.utc(data.finishDate).add('days', 1).format('YYYY-MM-DD');
                    var exception = data.exception;
                    var employeeNo = data.employeeNo;
                    var companyId = data.companyId
                    var subject = "Leave Accepted";
                    var body = "Your Leave " + exception + " from " + startDate + " to " + finishDate + " is Rejected";
                    Employee.findOne({
                        'employeeNo': employeeNo,
                        'companyId': companyId
                    }, function(err, empData) {
                        var email = empData.email;
                        var tcEmail = 'barnie@tme.co.nz';
                        // var tcEmail='asmitashiyal@gmail.com';
                        emailfn.send_mail(tcEmail, subject, body, function(output) {
                            if (output == false) {
                                console.log('err');
                            } else {
                                console.log('mail sent');
                            }
                        });
                    });
                    Attendance.update(
                        // {'employeeNo':data.employeeNo, 'companyId':data.companyId, "date": { $gte: 'this.date.toJSON().slice(0, 10) == '+startDate, $lt: 'this.date.toJSON().slice(0, 10) == '+finishDate }},
                        {
                            'employeeNo': data.employeeNo,
                            'companyId': data.companyId,
                            "date": {
                                $gte: new Date(startDate),
                                $lt: new Date(finishDate)
                            }
                        }, {
                            $set: {
                                holiday: false,
                                totalRounded: '00:00:00',
                                Exception: '00:00:00',
                                normalTime: '00:00:00',
                                ExceptionAssign: '00:00:00',
                                shift: 'OPEN',
                                addException: false,
                                holiday: false

                            }
                        }, {
                            upsert: false,
                            new: false,
                            multi: true
                        },
                        function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.json(true);
                                /*Employee.findOne({'companyId':companyId, 'active':true, 'employeeNo':employeeNo},function(err, dataEmp){
                                        if(dataEmp){
                                            var shift = dataEmp.shift;
                                            console.log(shift+'shift');
                                            async.waterfall([
                                                function(next){
                                                    empFn.getShiftPatternData(shift, companyId, function(result){
                                                        var noOfDays = result.noOfDays;
                                                        result.days.forEach(function(daysData){
                                                           var day = daysData.day;
                                                           var shift = daysData.shift;
                                                           daysArray.push(shift+':'+day);
                                                           OnlyDays.push(day);
                                                        });
                                                        next(null,daysArray,OnlyDays)
                                                    })
                                                }
                                            ],function (err, result, OnlyDays) {
                                        }
                                    });*/
                            }
                        });
                }
            });
        }
    });
};

exports.applypayrollcode = function(req, res) {
    /* script for apply payrollcode of employee from employee collection to attendance for all companies using by their companyId */
    Company.find({}, function(err, data) {
        if (data) {
            data.forEach(function(Company) {
                var companyId = Company._id;
                Employee.find({
                    'companyId': companyId
                }, function(err, employeeData) {
                    if (employeeData) {
                        employeeData.forEach(function(emp) {
                            var employeeNo = emp.employeeNo;
                            var payrollCode = emp.payrollCode;
                            Attendance.update({
                                'employeeNo': employeeNo,
                                'companyId': companyId
                            }, {
                                $set: {
                                    payrollCode: payrollCode
                                }
                            }, {
                                upsert: false,
                                new: false,
                                multi: true
                            }, function(err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('updated');
                                }
                            });
                        });
                        res.send('payrollcode added');
                    }
                });
            });
        }
    });
};

exports.changecompanyemployeeno = function(req, res) {
    /* change employee No of the company by superadmin*/

    Employee.update({
        'companyId': req.body.companyId,
        'email': req.body.email
    }, {
        $set: {
            employeeNo: req.body.employeeNo
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            Attendance.update({
                'companyId': req.body.companyId,
                'email': req.body.email
            }, {
                $set: {
                    employeeNo: req.body.employeeNo
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
    });
};

exports.changecompanyemployeeemail = function(req, res) {
    /* change employee email of the company by superadmin*/

    Employee.findOne({
        'email': req.body.email
    }, function(err, empData) {
        if (empData) {
            res.json(false)
        } else {
            Employee.update({
                'companyId': req.body.companyId,
                'employeeNo': req.body.employeeNo
            }, {
                $set: {
                    email: req.body.email
                }
            }, {
                upsert: true,
                new: false
            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    res.json(true);
                }
            });
        }

    });
};
exports.changecompanyemployeepassword = function(req, res) {
    /* change employee password of the company by superadmin*/
    var emp = new Employee()
    Employee.update({
        'companyId': req.body.companyId,
        'employeeNo': req.body.employeeNo
    }, {
        $set: {
            password: emp.generateHash(req.body.password)
        }
    }, {
        upsert: true,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(true);
        }
    });
};
exports.changecompanyemployeepin = function(req, res) {
    /* change employee pin no of the company by superadmin*/
    Employee.update({
        'companyId': req.body.companyId,
        'employeeNo': req.body.employeeNo
    }, {
        $set: {
            pin: req.body.pin
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(true);
        }
    });
};
exports.sendmessage = function(req, res) {
    /* send message to the companies which companies are selected by superadmin */
    var confirmation = req.body.confirmation;
    var companies = req.body.companies;
    var comment = req.body.comment;
    var subject = req.body.subject;
    if (companies.length > 0) {
        companies.forEach(function(company) {
            var msg = new Messages();
            msg.companyId = company;
            msg.subject = subject;
            msg.message = comment;
            msg.confirmation = confirmation;
            msg.received = Moment.utc().format();
            msg.save();
        });
        res.json(true)
    }
};
exports.checkmessage = function(req, res) {
    /* display the unread messages count to the home screen of the app */
    Messages.count({
        'companyId': req.session.user,
        'read': false
    }, function(err, msgData) {
        if (msgData > 0) {
            Messages.findOne({
                'companyId': req.session.user,
                'confirmation': true,
                'instantRead': false
            }, function(err, msg) {
                if (msg) {
                    res.json({
                        'count': msgData,
                        'msgData': msg
                    });
                } else {
                    res.json({
                        'count': msgData,
                        'msgData': ''
                    });
                }
            });
        } else {
            res.json(0);
        }
    });
};
exports.getMessageList = function(req, res) {
    /* give the list of message for logged in company*/
    var perPage = 5,
        page = req.param('page') > 0 ? req.param('page') : 1
    Messages.find({
            'companyId': req.session.user
        })
        .sort({
            'received': '-1'
        })
        .paginate(page, perPage, function(err, msgData) {
            Messages.count({
                'companyId': req.session.user
            }).exec(function(err, messagecount) {
                var count = messagecount;
                var pages = Math.ceil(count / perPage);
                res.json({
                    'msgData': msgData,
                    "page": page,
                    "pages": pages
                });
            });
        });
};
exports.openmessage = function(req, res) {
    /* open the user selected message and make it read*/
    Messages.update({
        '_id': req.params.msgId
    }, {
        $set: {
            read: true
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            Messages.findOne({
                '_id': req.params.msgId
            }, function(err, msgData) {
                if (msgData) {
                    res.json(msgData);
                }
            });
        }
    });
};
exports.deletemessages = function(req, res) {
    /* remove messege */
    Messages.remove({
        '_id': {
            $in: req.body.messagesId
        }
    }, function(err) {
        if (!err) {
            res.json(true);
        }
    })
};
exports.markasRead = function(req, res) {
    /* confirm that message was read by user */
    Messages.update({
        '_id': {
            $in: req.body.messagesId
        }
    }, {
        $set: {
            read: true
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
};
exports.confirmRead = function(req, res) {
    /* confirm that instant message was read by user */
    Messages.update({
        '_id': req.params.msgId
    }, {
        $set: {
            instantRead: true,
            read: true
        }
    }, {
        upsert: false,
        new: false
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(true);
        }
    });
};
exports.changeChecktype = function(req, res) {
    /* this script will change the checktype 4 and 5 to 3 it will get companyId from url*/
    if (req.params.companyId != 'all') {
        var companyId = req.params.companyId;
        Attendance.update({
            'companyId': companyId,
            'checkin.checkType': {
                $in: [4, 5]
            }
        }, {
            $set: {
                'checkin.$.checkType': '3',
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.send('updated');
            }
        });
    } else {
        Company.find({}, function(err, companies) {
            if (companies) {
                var i = 0;
                companies.forEach(function(dataCompany) {
                    i++;
                    var companyId = dataCompany._id;
                    Attendance.update({
                        'companyId': companyId,
                        'checkin.checkType': {
                            $in: [4, 5]
                        }
                    }, {
                        $set: {
                            'checkin.$.checkType': '3',
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

                    if (companies.length == i) {
                        res.send('updated');
                    }
                })
            }
        });
    }
};
exports.changeweeklyot = function(req, res) {
    /* (This script is for recalculation of weekly ot and attendance data)
    this function can take comapnyid and date like 1d/2d or 1w/2w and set flag for weeklyot record of compnayid
    from that date to current date  , its also set attendance readflag false*/
    var calculateAccordingtoEmployee = function(companyId, checkinDate, callback) {
        var i = 0;
        // Attendance.update({$where: 'this.date.toJSON().slice(0, 10) == "'+checkinDate+'"', 'companyId':companyId},
        Attendance.update({
            "date": new Date(checkinDate),
            'companyId': companyId
        }, {
            $set: {
                // "total" : "00:00:00",
                //          "totalRounded" : "00:00:00",
                totalValues: [],
                allowances: [],
                readFlag: false,
                // areaFlag:false,
                // calFlag:false,
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('updated');
            }
        });

        Employee.find({
            'companyId': companyId,
            active: true
        }, function(err, employeeData) {
            if (employeeData) {
                employeeData.forEach(function(data) {
                    i++;
                    var employeeNo = data.employeeNo;
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
                            console.log(err);
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
                                        console.log(err);
                                    }
                                });
                            });
                        }
                    })
                    if (employeeData.length == i) {
                        var currentDate = Moment.utc().format('YYYY-MM-DD');
                        if (checkinDate != currentDate) {
                            var newDate = Moment.utc(checkinDate).add('days', 1).format('YYYY-MM-DD');
                            calculateAccordingtoEmployee(companyId, newDate, callback)
                        } else {
                            callback(1);
                        }
                    }
                });
            }
        });
    }
    if (req.params.companyId != 'all') {
        var companyId = req.params.companyId;
        Company.findOne({
            '_id': companyId
        }, function(err, dataCompany) {
            if (dataCompany) {
                var companyId = dataCompany._id;
                if (req.params.date.indexOf("d") > -1) {
                    var days = req.params.date.split('d');
                    var checkinDate = Moment.utc().subtract('days', days[0]).format('YYYY-MM-DD');
                } else if (req.params.date.indexOf("w") > -1) {
                    var days = req.params.date.split('w');
                    var checkinDate = Moment.utc().subtract('days', days[0] * 7).format('YYYY-MM-DD');
                } else {
                    var checkinDate = Moment.utc(req.params.date).format('YYYY-MM-DD');
                }
                calculateAccordingtoEmployee(companyId, checkinDate, function(result) {
                    if (result == 1) {
                        res.send('calculation done');
                    }
                })
            }
        });
    } else {
        var i = 0;
        var checkinDate = Moment.utc(req.params.date).format('YYYY-MM-DD');
        Company.find({}, function(err, companies) {
            if (companies) {
                companies.forEach(function(dataCompany) {
                    i++;
                    var companyId = dataCompany._id;
                    if (req.params.date.indexOf("d") > -1) {
                        var days = req.params.date.split('d');
                        var checkinDate = Moment.utc().subtract('days', days[0]).format('YYYY-MM-DD');
                    } else if (req.params.date.indexOf("w") > -1) {
                        var days = req.params.date.split('w');
                        var checkinDate = Moment.utc().subtract('days', days[0] * 7).format('YYYY-MM-DD');
                    } else {
                        var checkinDate = Moment.utc(req.params.date).format('YYYY-MM-DD');
                    }
                    calculateAccordingtoEmployee(companyId, checkinDate, function(result) {})
                    if (i == companies.length) {
                        res.send('calculation done');
                    }
                });
            }
        });
    }
};
exports.changeholiday = function(req, res) {
    /* (This script is for update the holidays to false (to remove the holidays) )*/
    var companyId = req.params.companyId;
    var date = req.params.date;
    // Attendance.update({$where: 'this.date.toJSON().slice(0, 10) == "'+date+'"', 'companyId':companyId},

    Attendance.update({
        "date": new Date(date),
        'companyId': companyId
    }, {
        $set: {
            holiday: false,
            dayinLieu: '00:00:00',
            Exception: '00:00:00',
            ot1Rule: '00:00:00',
        }
    }, {
        upsert: false,
        new: false,
        multi: true
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json('Holiday false applied');
        }
    });
};
exports.changeHolidayForDepartment = function(req, res) {
    /* (This script is for update the holidays to false (to remove the holidays) )*/
    var companyId = req.params.companyId;
    var date = req.params.date;
    var department = req.params.department;
    // Attendance.update({$where: 'this.date.toJSON().slice(0, 10) == "'+date+'"', 'companyId':companyId},
    if (!companyId) {
        res.send('companyId required');
    } else if (!date) {
        res.send('date required');
    } else if (!department) {
        res.send('department name required');
    }

    if (companyId && date && department) {
        Attendance.update({
            "date": new Date(date),
            'companyId': companyId,
            'department': department
        }, {
            $set: {
                holiday: false,
                dayinLieu: '00:00:00',
                Exception: '00:00:00',
                ot1Rule: '00:00:00',
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (err) {
                console.log(err);
                res.send('err' + err);
            } else {
                res.send('Holiday false applied for ' + department);
            }
        });
    }
};
exports.changeFlag = function(req, res) {
    var i = 0;
    Company.find({}, function(err, companies) {
        if (companies) {
            companies.forEach(function(dataCompany) {
                i++;
                var companyId = dataCompany._id;
                setFlagAtn(companyId, function(result) {});
                if (i == companies.length) {
                    res.send('calculation done');
                }
            });
        }
    });
};
exports.generateKeys = function(req, res) {
    function makeString() {
        var text = "";
        var useCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 6; i++)
            text += useCharacters.charAt(Math.floor(Math.random() * useCharacters.length));
        return text;
    }
    var keysArray = [];
    for (var i = 0; i < 200; i++) {
        var randomString = makeString();
        keysArray.push(randomString);
    }

    var n = 0;
    if (keysArray.length > 0) {
        keysArray.forEach(function(keys) {
            n++;
            Registrationkeys.findOne({
                'key': keys
            }, function(err, data) {
                if (!data) {
                    var registrationkeys = new Registrationkeys();
                    registrationkeys.key = keys;
                    registrationkeys.save(function(err, newData) {
                        if (newData) {
                            if (n == keysArray.length) {
                                res.send('200 keys were generated');
                            }
                        }
                    });
                }
            });
        });
    }
};
exports.solveArea = function(req, res) {
    Attendance.update({
        'areaFinish': {
            $ne: '0'
        },
        'areaStart': '0'
    }, {
        $set: {
            totalValues: [],
            allowances: [],
            areaFlag: false,
            calFlag: false
        }
    }, {
        upsert: false,
        new: false,
        multi: true
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.send('')
        }
    });
};
exports.getDateWiseRecord = function(req, res) {
    console.log('*****meter dashboard*****');
    var myDate = req.body.date,
        start = req.body.startDate,
        end = req.body.endDate,
        companyId = req.session.user;
    console.log("-----------------------------------");
    console.log(myDate, start, end, companyId);
    console.log("-----------------------------------");

    empFn.createMeterDashBoard(companyId, myDate, start, end, function(result, subDepartmentsFlag) {
        console.log(result);
        if (result) {
            empFn.calculateDateWiseData(function(result) {
                if (result) {
                    meterDashboard.find({
                        'companyId': companyId,
                        'date': myDate
                    }, {}, {
                        limit: 1
                    }, function(err, datas) {
                        var dashData = datas[0];

                        empFn.checkPreviousDashboard(companyId, start, end, function(prvsFlag) {

                            subMeterDashboard.find({
                                'companyId': req.session.user,
                                'date': myDate,
                            }, {}, {
                                limit: 1
                            }, function(err, subDepartmentLists) {
                                var subDepartmentData = {};
                                subDepartmentData = subDepartmentLists[0];
                                if (subDepartmentData && subDepartmentsFlag) {
                                    res.json({
                                        data: dashData,
                                        subDepartmentList: subDepartmentData,
                                        prvsDatas: prvsFlag
                                    });
                                } else {
                                    res.json({
                                        data: dashData,
                                        subDepartmentList: {},
                                        prvsDatas: prvsFlag
                                    });
                                }
                            });
                        });
                    });
                }
            });
        } else {
            console.log("error while retriving dashboard data");
            res.json({
                data: {},
                subDepartmentList: {},
                prvsDatas: false
            });
        }
    });
};
exports.getdashboardData = function(req, res) {
    /*PARAMS*/
    var start = req.params.start;
    var end = req.params.end;

    empFn.createDashBoard(req.session.user, start, end, function(result, subDepartmentsFlag) {
        if (result) {
            Dashboard.find({
                'companyId': req.session.user,
                'weekStart': start,
                'weekEnd': end
            }, {}, {
                limit: 1
            }, function(err, datas) {

                var dashData = datas[0];

                empFn.checkPreviousDashboard(req.session.user, start, end, function(prvsFlag) {
                    console.log('------------ flag      : ' + dashData.calfalg);
                    console.log('------------ % work    : ' + dashData.percentageUsed);
                    console.log('------------ Hours     : ' + dashData.allocatedHours);
                    console.log('-------------Budget    : ' + dashData.budgetedWages);
                    console.log('-------------weekStart : ' + dashData.weekStart);
                    console.log('-------------weekStart : ' + dashData.weekEnd);
                    console.log('-------------prvsDatas : ' + prvsFlag);

                    subDashboard.find({
                        companyId: req.session.user,
                        'weekStart': start,
                        'weekEnd': end
                    }, {}, {
                        limit: 1
                    }, function(err, subDepartmentLists) {
                        var subDepartmentData = {};
                        subDepartmentData = subDepartmentLists[0];
                        if (subDepartmentData && subDepartmentsFlag) {
                            res.json({
                                data: dashData,
                                subDepartmentList: subDepartmentData,
                                prvsDatas: prvsFlag
                            });
                        } else {
                            res.json({
                                data: dashData,
                                subDepartmentList: {},
                                prvsDatas: prvsFlag
                            });
                        }
                    });
                });
            });
        } else {
            console.log("error while retriving dashboard data");
            res.json({
                data: [],
                subDepartmentList: [],
                prvsDatas: false
            });
        }
    });
};
exports.allocateSubHours = function(req, res) {
    var start = req.body.start;
    var end = req.body.end;
    var hours = req.body.hours + ':00:00';
    var id = req.body.id.split('/');
    var string = id[0];
    var Id = id[1];
    subDashboard.update({
        'subDepartments._id': Id
    }, {
        $set: {
            'subDepartments.$.allocatedHours': hours
        }
    }, function(err, dataUp) {
        if (err) {
            // console.log(err);
        } else {
            subDashboard.findOne({
                'subDepartments._id': Id
            }, function(err, subDepartment) {
                subDepartment.subDepartments.forEach(function(detail) {
                    if (detail._id == Id) {
                        var allocatedHours = 0;
                        var workedHoursData = 0;
                        if (detail.workedHours) {
                            workedHoursData = empFn.getSeconds(detail.workedHours);
                        }
                        if (detail.allocatedHours) {
                            allocatedHours = empFn.getSeconds(detail.allocatedHours);
                        }
                        var percentage = 00;
                        if (allocatedHours != 0) {
                            var total = workedHoursData / allocatedHours;
                            var per = total * 100;
                            percentage = Math.round(per * 100) / 100;
                        }
                        subDashboard.update({
                            'subDepartments._id': Id
                        }, {
                            $set: {
                                'subDepartments.$.percentageUsed': percentage
                            }
                        }, function(err, dataUp) {
                            res.json(true);
                        });
                    }
                });
            });
        }
    });
};
exports.allocateHours = function(req, res) {
    var start = req.body.start;
    var end = req.body.end;
    var hours = req.body.hours + ':00:00';
    var id = req.body.id.split('/');
    var string = id[0];
    var Id = id[1];

    empFn.setMeterDashboardFlag(start, end, req.session.user, function(status) {
        if (status)
            console.log("Meter Dashboard " + status);
    });

    if (string == 'dept') {
        Dashboard.update({
            'departments._id': Id
        }, {
            $set: {
                calfalg: true,
                'departments.$.allocatedHours': hours
            }
        }, {
            upsert: false,
            new: false
        }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                empFn.calculateTotalWorked(req.session.user, start, end);

                res.json(true);
            }
        })
    } else {
        Dashboard.update({
            '_id': Id
        }, {
            $set: {
                calfalg: true,
                'allocatedHours': hours
            }
        }, function(err, dataUp) {
            if (err) {} else {
                empFn.calculateTotalWorked(req.session.user, start, end);
                res.json(true);
            }
        });
    }
};
exports.createPeriods = function(req, res) {
    Company.find({
        '_id': req.session.user
    }, function(err, CompanyData) {
        createDashboardRecord(CompanyData, function(result) {});
    });
};
exports.createPeriods1 = function(req, res) {
    console.log("createPeriods1 Hellooooooo........");
    Company.find({
        '_id': req.params.companyId
    }, function(err, CompanyData) {
        if (CompanyData.length > 0) {
            createDashboardRecord(CompanyData, function(result) {
                res.send("Record For Dashboard is Created.....");
            });
        } else {
            res.send("Invalid Company Id");
        }
    });
};
exports.createDashboardForMissing = function(req, res) {
    console.log("createPeriods1 Hellooooooo........");
    Company.find({}, function(err, CompanyData) {
        console.log("CompanyData...." + CompanyData.length);
        if (CompanyData.length > 0) {
            var cmpCount = 0
            async.eachSeries(CompanyData, function(dataCompany, cbCmp) {
                if (dataCompany) {
                    // console.log(dataCompany.length);
                    console.log(dataCompany);
                    cmpCount++;
                    var companyId = dataCompany._id;
                    var companyname = dataCompany.companyname;
                    var departments = dataCompany.departments;
                    var isdashboard = dataCompany.isdashboard;
                    if (isdashboard) {
                        console.log("iffffffffff");
                        console.log(req.params.companyId);
                        empFn.getPayperiod(companyId, function(result) {
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
                                if (!dashboardData) {
                                    if (departments.length > 0) {
                                        async.eachSeries(departments, function(dept, cbdept) {
                                            deptCount++;
                                            var deptId = dept._id;
                                            var departName = dept.name;
                                            var totalWorked = 0;
                                            Dashboard.update({
                                                'companyId': companyId,
                                                'weekStart': {
                                                    $gte: start
                                                }
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
                                                new: false,
                                                multi: true
                                            }, function(err, data) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    var subDept = 0;
                                                    var subDeptArray = [];
                                                    subDeparment.find({
                                                        companyId: req.params.companyId
                                                    }, function(err, subDeaptDetail) {
                                                        if (subDeaptDetail.length > 0) {
                                                            async.eachSeries(subDeaptDetail, function(dept, cbsubDept) {
                                                                subDept++;
                                                                subDeptArray.push({
                                                                    departmentId: dept.parentDeptId,
                                                                    parentDeptName: dept.parentDeptName,
                                                                    departmentId: dept.parentDeptId,
                                                                    subDeptId: dept._id,
                                                                    subDeptName: dept.name
                                                                });
                                                                if (subDept == subDeaptDetail.length) {
                                                                    subDashboard.update({
                                                                        'companyId': companyId,
                                                                        'weekStart': {
                                                                            $gte: start
                                                                        }
                                                                    }, {
                                                                        $set: {
                                                                            subDepartments: subDeptArray,
                                                                            companyId: companyId, // company user Id (id of tenant)
                                                                            weekStart: start,
                                                                            weekEnd: end
                                                                        }
                                                                    }, {
                                                                        upsert: true,
                                                                        new: false,
                                                                        multi: true
                                                                    }, function(err, data) {
                                                                        console.log("done sub");
                                                                        console.log('--done');
                                                                        if (deptCount == departments.length) {
                                                                            cbCmp();
                                                                        } else {
                                                                            cbdept();
                                                                        }
                                                                    });
                                                                } else {
                                                                    cbsubDept();
                                                                }
                                                            });
                                                        } else {
                                                            if (deptCount == departments.length) {
                                                                cbCmp();
                                                            } else {
                                                                cbdept();
                                                            }
                                                        }
                                                    })
                                                }
                                            });
                                        });
                                    } else {
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
                                                    companyId: req.params.companyId
                                                }, function(err, subDeaptDetail) {
                                                    if (subDeaptDetail.length > 0) {
                                                        async.eachSeries(subDeaptDetail, function(dept, cbsubDept) {
                                                            subDept++;
                                                            subDeptArray.push({
                                                                departmentId: dept.parentDeptId,
                                                                parentDeptName: dept.parentDeptName,
                                                                departmentId: dept.parentDeptId,
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
                                                                    if (deptCount == departments.length) {
                                                                        cbCmp();
                                                                    } else {
                                                                        cbdept();
                                                                    }
                                                                });
                                                            } else {
                                                                cbsubDept();
                                                            }
                                                        });
                                                    } else {
                                                        if (deptCount == departments.length) {
                                                            cbCmp();
                                                        } else {
                                                            cbdept();
                                                        }
                                                    }
                                                })
                                            }
                                        });
                                    }
                                } else {
                                    Dashboard.remove({
                                        'companyId': companyId,
                                        'weekStart': start,
                                        'weekEnd': end
                                    }, function(err, dashboardData) {
                                        if (departments.length > 0) {
                                            async.eachSeries(departments, function(dept, cbdept) {
                                                deptCount++;
                                                var deptId = dept._id;
                                                var departName = dept.name;
                                                var totalWorked = 0;
                                                Dashboard.update({
                                                    'companyId': companyId,
                                                    'weekStart': {
                                                        $gte: start
                                                    }
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
                                                    new: false,
                                                    multi: true
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        var subDept = 0;
                                                        var subDeptArray = [];
                                                        subDeparment.find({
                                                            companyId: req.params.companyId
                                                        }, function(err, subDeaptDetail) {
                                                            if (subDeaptDetail.length > 0) {
                                                                async.eachSeries(subDeaptDetail, function(dept, cbsubDept) {
                                                                    subDept++;
                                                                    subDeptArray.push({
                                                                        departmentId: dept.parentDeptId,
                                                                        parentDeptName: dept.parentDeptName,
                                                                        departmentId: dept.parentDeptId,
                                                                        subDeptId: dept._id,
                                                                        subDeptName: dept.name
                                                                    });
                                                                    if (subDept == subDeaptDetail.length) {
                                                                        subDashboard.update({
                                                                            'companyId': companyId,
                                                                            'weekStart': {
                                                                                $gte: start
                                                                            }
                                                                        }, {
                                                                            $set: {
                                                                                subDepartments: subDeptArray,
                                                                                companyId: companyId, // company user Id (id of tenant)
                                                                                weekStart: start,
                                                                                weekEnd: end
                                                                            }
                                                                        }, {
                                                                            upsert: true,
                                                                            new: false,
                                                                            multi: true
                                                                        }, function(err, data) {
                                                                            console.log("done sub");
                                                                            console.log('--done');
                                                                            if (deptCount == departments.length) {
                                                                                cbCmp();
                                                                            } else {
                                                                                cbdept();
                                                                            }
                                                                        });
                                                                    } else {
                                                                        cbsubDept();
                                                                    }
                                                                });
                                                            } else {
                                                                if (deptCount == departments.length) {
                                                                    cbCmp();
                                                                } else {
                                                                    cbdept();
                                                                }
                                                            }
                                                        })
                                                    }
                                                });
                                            });
                                        } else {
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
                                                        companyId: req.params.companyId
                                                    }, function(err, subDeaptDetail) {
                                                        if (subDeaptDetail.length > 0) {
                                                            async.eachSeries(subDeaptDetail, function(dept, cbsubDept) {
                                                                subDept++;
                                                                subDeptArray.push({
                                                                    departmentId: dept.parentDeptId,
                                                                    parentDeptName: dept.parentDeptName,
                                                                    departmentId: dept.parentDeptId,
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
                                                                        if (deptCount == departments.length) {
                                                                            cbCmp();
                                                                        } else {
                                                                            cbdept();
                                                                        }
                                                                    });
                                                                } else {
                                                                    cbsubDept();
                                                                }
                                                            });
                                                        } else {
                                                            if (deptCount == departments.length) {
                                                                cbCmp();
                                                            } else {
                                                                cbdept();
                                                            }
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        cbCmp();
                    }
                }
                if (cmpCount == CompanyData.length) {
                    res.send("Record For Dashboard is Created.....");
                }
            });
        } else {
            res.send("Invalid Company Id");
        }
    });
};
/* Exports End */

//------> Old codes start

/*old get date wise record */
// meterDashboard.find({
//     'companyId': req.session.user,
//     'date': req.body.date
// }, {}, {
//     limit: 1
// }, function(err, datas) {
//     console.log("query fired --->");
//     if (datas.length > 0) {
//      var getDatas = {};
//             getDatas = datas[0];

//      console.log("meter data found for "+req.body.date);
//      console.log(getDatas);
//         meterDashboard.find({
//             'companyId': req.session.user,
//             'date': req.body.date
//         }, {}, {
//             limit: 1
//         }, function(err, getData) {
//             var getDatas = {};
//             getDatas = getData[0];
//             res.json({
//                 data: getDatas,
//                 subDepartmentList: []
//             });
//         });
//     } else {
//         console.log("meter dashboard not found .... creating now");
//         console.log("week start "+req.body.startDate);
//         console.log("week end "+req.body.endDate);
//         Dashboard.find({
//             'companyId': req.session.user,
//             'weekStart': req.body.startDate,
//             'weekEnd': req.body.endDate
//         }, {}, {
//             limit: 1
//         }, function(err, getDatas) {
//             console.log(getDatas.length);
//             var getData = {};
//             getData = getDatas[0];
//             var cnt = 0;
//             var departmentsArray = [];
//             // console.log(getData.departments);
//             if (getData.departments) {
//                 async.eachSeries(getData.departments, function(deptDetail, callback) {
//                     cnt++;
//                     departmentsArray.push({
//                         workedHours: "00:00:00",
//                         departmentName: deptDetail.departmentName,
//                         departmentId: deptDetail.departmentId
//                     });
//                     if (cnt == getData.departments.length) {
//                         meterDashboard.update({
//                             'date': req.body.date,
//                             'companyId': getData.companyId
//                         }, {
//                             $set: {
//                                 companyId: getData.companyId,
//                                 companyName: getData.companyName,
//                                 workedHours: "00:00:00",
//                                 allocatedHours: "00:00:00",
//                                 percentageUsed: "00",
//                                 moneySpent: "00",
//                                 calfalg: true,
//                                 departments: departmentsArray
//                             }
//                         }, {
//                             upsert: true,
//                             new: false
//                         }, function(err, data) {
//                             empFn.calculateDateWiseData(function(result) {
//                                 if (result) {
//                                     meterDashboard.find({
//                                         'companyId': req.session.user,
//                                         'date': req.body.date
//                                     }, {}, {
//                                         limit: 1
//                                     }, function(err, getData) {
//                                         var getDatas = {};
//                                         getDatas = getData[0];
//                                         res.json({
//                                             data: getDatas,
//                                             subDepartmentList: []
//                                         });
//                                     });
//                                 }
//                             });
//                         });
//                     } else
//                         callback();
//                 });
//             } else {
//                 meterDashboard.update({
//                     'date': req.body.date,
//                     'companyId': getData.companyId,
//                 }, {
//                     $set: {
//                         companyId: getData.companyId,
//                         companyName: getData.companyName,
//                         workedHours: "00:00:00",
//                         allocatedHours: "00:00:00",
//                         percentageUsed: "00",
//                         moneySpent: "00",
//                         calfalg: true,
//                     }
//                 }, {
//                     upsert: true,
//                     new: false
//                 }, function(err, data) {
//                     empFn.calculateDateWiseData(function(result) {
//                         if (result) {
//                             meterDashboard.find({
//                                 'companyId': req.session.user,
//                                 'date': req.body.date
//                             }, {}, {
//                                 limit: 1
//                             }, function(err, getData) {
//                                 var getDatas = {};
//                                 getDatas = getData[0];
//                                 res.json({
//                                     data: getDatas,
//                                     subDepartmentList: []
//                                 });
//                             });
//                         }
//                     });
//                 });
//             }
//         });
//     }
// });
/* finish */

/* old getdashboardData*/
// Dashboard.find({
//     'companyId': req.session.user,
//     'weekStart': start,
//     'weekEnd': end
// }, {}, {
//     limit: 1
// }, function(err, datas) {
//  /* VARS */
//     var data = {};
//     data = datas[0];
//  var date = Moment(start);
//     var eDate = date.subtract(1, 'days');
//     var EndDate = Moment(eDate).format("YYYY-MM-DD");
//     var d1 = Moment(start);
//     var d2 = Moment(end);
//     var days = Moment.duration(d2.diff(d1)).asDays();
//     var sDate = date.subtract(days, 'days');
//     var startDate = Moment(sDate).format("YYYY-MM-DD");
//     // console.log(data)
//     if (data) {

//         console.log('query result ----->');
//      console.log('------------ flag      : '+data.calfalg);
//      console.log('------------ % work    : '+data.percentageUsed);
//      console.log('------------ Hours     : '+data.allocatedHours);
//      console.log('-------------Budget    : '+data.budgetedWages);
//      console.log('-------------weekStart : '+data.weekStart);
//      console.log('-------------weekStart : '+data.weekEnd);
//      console.log("<----- result end");

//         Dashboard.find({
//             'companyId': req.session.user,
//             'weekStart': startDate,
//             'weekEnd': EndDate
//         }, function(err, prvsDatas) {
//             // console.log("aaaaaaaaaaaaaaaa");
//             subDashboard.findOne({
//                 companyId: req.session.user,
//                 'weekStart': start,
//                 'weekEnd': end
//             }, function(err, subDepartmentList) {
//                 console.log('sub department');
//                 console.log(subDepartmentList);
//                 if (subDepartmentList !== null) {
//                     if (prvsDatas.length > 0) {
//                         res.json({
//                             subDepartmentList: subDepartmentList,
//                             data: data,
//                             prvsDatas: true
//                         });
//                     } else {
//                         res.json({
//                             subDepartmentList: subDepartmentList,
//                             data: data,
//                             prvsDatas: false
//                         });
//                     }
//                 } else {
//                     // console.log("1111111111 else null");
//                     var date = Moment(start);
//                     var eDate = date.subtract(1, 'days');
//                     var EndDate = Moment(eDate).format("YYYY-MM-DD");
//                     var d1 = Moment(start);
//                     var d2 = Moment(end);
//                     var days = Moment.duration(d2.diff(d1)).asDays();
//                     var sDate = date.subtract(days, 'days');
//                     var startDate = Moment(sDate).format("YYYY-MM-DD");
//                     subDashboard.find({
//                         'companyId': req.session.user,
//                         'weekStart': startDate,
//                         'weekEnd': EndDate
//                     }, {}, {
//                         limit: 1
//                     }, function(err, subDashDatas) {
//                         if (subDashDatas.length > 0) {
//                             // console.log("3333 else null");
//                             var subDashData = {};
//                             subDashData = subDashDatas[0];
//                             var subCnt = 0;
//                             var subDepartmentsArray = [];
//                             // console.log(subDashData.subDepartments);
//                             if (subDashData.subDepartments.length > 0) {
//                                 // console.log(subDashData.subDepartments);
//                                 async.eachSeries(subDashData.subDepartments, function(subDetail, callback1) {
//                                     subCnt++;
//                                     // console.log("1111111111 else null");
//                                     subDepartmentsArray.push({
//                                         parentDeptName: subDetail.parentDeptName,
//                                         emailStatus: '',
//                                         moneySpent: '00',
//                                         percentageUsed: '00',
//                                         allocatedHours: '00:00:00',
//                                         workedHours: '00:00:00',
//                                         subDeptId: subDetail.subDeptId,
//                                         subDeptName: subDetail.subDeptName,
//                                         departmentId: subDetail.departmentId
//                                     });
//                                     if (subCnt == subDashData.subDepartments.length) {
//                                         subDashboard.update({
//                                             'companyId': req.session.user,
//                                             'weekStart': start,
//                                             'weekEnd': end
//                                         }, {
//                                             $set: {
//                                                 companyId: req.session.user,
//                                                 weekStart: start,
//                                                 weekEnd: end,
//                                                 subDepartments: subDepartmentsArray,
//                                             }
//                                         }, {
//                                             upsert: true,
//                                             new: false
//                                         }, function(err, data) {
//                                             subDashboard.findOne({
//                                                 companyId: req.session.user,
//                                                 'weekStart': start,
//                                                 'weekEnd': end
//                                             }, function(err, subDepartmentList) {
//                                                 if (prvsDatas.length > 0) {
//                                                     res.json({
//                                                         subDepartmentList: subDepartmentList,
//                                                         data: data,
//                                                         prvsDatas: true
//                                                     });
//                                                 } else {
//                                                     res.json({
//                                                         subDepartmentList: subDepartmentList,
//                                                         data: data,
//                                                         prvsDatas: false
//                                                     });
//                                                 }
//                                             });
//                                         });
//                                     } else {
//                                         callback1();
//                                     }
//                                 });
//                             } else {
//                                 // console.log("222 else null");
//                                 if (prvsDatas.length > 0) {
//                                     res.json({
//                                         subDepartmentList: [],
//                                         data: data,
//                                         prvsDatas: true
//                                     });
//                                 } else {
//                                     res.json({
//                                         subDepartmentList: [],
//                                         data: data,
//                                         prvsDatas: false
//                                     });
//                                 }
//                             }
//                         } else {
//                             if (prvsDatas.length > 0) {
//                                 res.json({
//                                     subDepartmentList: [],
//                                     data: data,
//                                     prvsDatas: true
//                                 });
//                             } else {
//                                 res.json({
//                                     subDepartmentList: [],
//                                     data: data,
//                                     prvsDatas: false
//                                 });
//                             }
//                         }
//                     });
//                 }
//             });
//         });
//     } else {
//      console.log("first time");

//         Dashboard.find({
//             'companyId': req.session.user,
//             'weekStart': startDate,
//             'weekEnd': EndDate
//         }, {}, {
//             limit: 1
//         }, function(err, getDatas) {

//             var getData = {};
//             getData = getDatas[0];
//             var cnt = 0;
//             var departmentsArray = [];
//             console.log(getData);
//             if (getData) {
//                 async.eachSeries(getData.departments, function(deptDetail, callback) {
//                     cnt++;
//                     departmentsArray.push({
//                         workedHours: "00:00:00",
//                         departmentName: deptDetail.departmentName,
//                         departmentId: deptDetail.departmentId
//                     });
//                     if (cnt == getData.departments.length) {
//                         Dashboard.update({
//                             'companyId': getData.companyId,
//                             'weekStart': start,
//                             'weekEnd': end
//                         }, {
//                             $set: {
//                                 companyId: getData.companyId,
//                                 companyName: getData.companyName,
//                                 weekStart: start,
//                                 weekEnd: end,
//                                 workedHours: "00:00:00",
//                                 allocatedHours: "00:00:00",
//                                 percentageUsed: "00",
//                                 moneySpent: "00",
//                                 calfalg: true,
//                                 departments: departmentsArray
//                             }
//                         }, {
//                             upsert: true,
//                             new: false
//                         }, function(err, data) {
//                             if (!err) {
//                                 subDashboard.find({
//                                     'companyId': req.session.user,
//                                     'weekStart': startDate,
//                                     'weekEnd': EndDate
//                                 }, {}, {
//                                     limit: 1
//                                 }, function(err, subDashDatas) {
//                                     if (subDashDatas.length > 0) {
//                                         var subDashData = {};
//                                         subDashData = subDashDatas[0];
//                                         var subCnt = 0;
//                                         var subDepartmentsArray = [];
//                                         async.eachSeries(subDashData.subDepartments, function(subDetail, callback1) {
//                                             subCnt++;
//                                             subDepartmentsArray.push({
//                                                 parentDeptName: subDetail.parentDeptName,
//                                                 emailStatus: '',
//                                                 moneySpent: '00',
//                                                 percentageUsed: '00',
//                                                 allocatedHours: '00:00:00',
//                                                 workedHours: '00:00:00',
//                                                 subDeptId: subDetail.subDeptId,
//                                                 subDeptName: subDetail.subDeptName,
//                                                 departmentId: subDetail.departmentId
//                                             });
//                                             if (subCnt == subDashData.subDepartments.length) {
//                                                 subDashboard.update({
//                                                     'companyId': req.session.user,
//                                                     'weekStart': start,
//                                                     'weekEnd': end
//                                                 }, {
//                                                     $set: {
//                                                         companyId: req.session.user,
//                                                         weekStart: start,
//                                                         weekEnd: end,
//                                                         subDepartments: subDepartmentsArray,
//                                                     }
//                                                 }, {
//                                                     upsert: true,
//                                                     new: false
//                                                 }, function(err, data) {
//                                                     Dashboard.find({
//                                                         'companyId': req.session.user,
//                                                         'weekStart': start,
//                                                         'weekEnd': end
//                                                     }, {}, {
//                                                         limit: 1
//                                                     }, function(err, getData) {
//                                                         var getDatas = {};
//                                                         getDatas = getData[0];
//                                                         subDashboard.find({
//                                                             companyId: req.session.user,
//                                                             'weekStart': start,
//                                                             'weekEnd': end
//                                                         }, {}, {
//                                                             limit: 1
//                                                         }, function(err, subDepartmentLists) {
//                                                             var subDepartmentList = {};
//                                                             subDepartmentList = subDepartmentLists[0];
//                                                             res.json({
//                                                                 data: getDatas,
//                                                                 subDepartmentList: subDepartmentList
//                                                             });
//                                                         });
//                                                     });
//                                                 });
//                                             } else {
//                                                 callback1();
//                                             }
//                                         });
//                                     } else {
//                                         Dashboard.find({
//                                             'companyId': req.session.user,
//                                             'weekStart': start,
//                                             'weekEnd': end
//                                         }, {}, {
//                                             limit: 1
//                                         }, function(err, getData) {
//                                             var getDatas = {};
//                                             getDatas = getData[0];
//                                             res.json({
//                                                 data: getDatas,
//                                                 subDepartmentList: []
//                                             });
//                                         });
//                                     }
//                                 });
//                             }
//                         });
//                     } else
//                         callback();
//                 });
//             } else {
//              console.log(req.session.user);
//              Company.findById(req.session.user, function(err, company) {
//                  var dept = company.departments;
//                  dept.forEach(function(cbdept,ind) {

//                   departmentsArray.push({
//                          workedHours: "00:00:00",
//                          departmentName: cbdept.name,
//                          departmentId: cbdept._id,
//                      });

//                   if(ind+1 === dept.length){
//                       Dashboard.update({
//                        'companyId': req.session.user,
//                        'weekStart': start,
//                        'weekEnd': end
//                    }, {
//                        $set: {
//                            companyId: req.session.user,
//                            companyName: company.companyname,
//                            weekStart: start,
//                            weekEnd: end,
//                            workedHours: "00:00:00",
//                            allocatedHours: "00:00:00",
//                            percentageUsed: "00",
//                            moneySpent: "00",
//                            calfalg: true,
//                            departments: departmentsArray
//                        }
//                    }, {
//                        upsert: true,
//                        new: false
//                    }, function(err, data) {
//                        Dashboard.find({
//                            'companyId': req.session.user,
//                            'weekStart': start,
//                            'weekEnd': end
//                        }, {}, {
//                            limit: 1
//                        }, function(err, getData) {
//                            var getDatas = {};
//                            getDatas = getData[0];
//                            res.json({
//                                data: getDatas,
//                                subDepartmentList: []
//                            });
//                        });
//                    });
//          }
//                  });
//  });
//             }
//         });
//     }
// });
/* finish */
//<------- Old codes end

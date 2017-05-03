// app/routes.js
var mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    employee = mongoose.model('Employee'),
    Attendance = mongoose.model('Attendance'),
    Shift = mongoose.model('Shifts'),
    Rule = mongoose.model('Rule'),
    dateFormat = require('dateformat'),
    Exceptions = mongoose.model('Exceptions'),
    SuperAdmin = mongoose.model('SuperAdmin'),
    Holidays = mongoose.model('Holidays'),
    Registrationkeys = mongoose.model('Registrationkeys'),
    Customreports = mongoose.model('Customreports'),
    Standardreports = mongoose.model('Standardreports'),
    scheduling = mongoose.model('scheduling'),
    emailalerts = mongoose.model('emailalerts'),
    Moment = require('moment-timezone'),
    Dashboard = mongoose.model('Dashboard'),
    meterDashboard = mongoose.model('meterDashboard'),
    subDeparment = mongoose.model('subDeparment'),
    subDashboard = mongoose.model('subDashboard'),
    customShifts = mongoose.model('customShifts'),
    Videos = mongoose.model('supportVideos'),
    request = require('request'),
    emailfn = require('../functions/send_mail.js'),
    empFn = require('../functions/employeefn.js'),
    companyCtrl = require('../app/controllers/company'),
    shiftCtrl = require('../app/controllers/shift'),
    projectCtrl = require('../app/controllers/project'),
    //var mysqlCtrl = require('../app/controllers/mysql');
    employeeCtrl = require('../app/controllers/employee'),
    reportCtrl = require('../app/controllers/report'),
    cronCtrl = require('../app/controllers/cron'),
    attendanceCronCtrl = require('../app/controllers/attendanceCron'),
    areaCtrl = require('../app/controllers/newCron'),
    scriptsCtrl = require('../app/controllers/scripts'),
    http = require('http'),
    async = require('async');

module.exports = function(app, passport) {
    app.get('/testCheck', function(req, res) {
        Attendance.find({}).limit(1).sort({
            _id: -1
        }).exec(function(err, adminData) {
            console.log('adminData' + adminData);
        });
    });
    app.get('/spiders', function(req, res) {
        console.log("================");
        res.render('spider.ejs');
    });
    /* Base */
    app.get('/', function(req, res) {
        if (req.session.user || req.cookies.user) {
            if (req.cookies.user && req.cookies.email) {
                req.session.user = req.cookies.user;
                req.session.email = req.cookies.email;
                Company.update({
                    '_id': req.session.user
                }, {
                    $set: {
                        lastLoggedin: Moment.utc().format()
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
            res.redirect('/index/#/home');
        }
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });
    /* Login */
    app.post('/mobileLogin', function(req, res) {
        console.log("line 81-mobileLogin..........");
        var superAdmin = new SuperAdmin();
        console.log(req.body);
        var email = new RegExp(["^", req.body.email, "$"].join(""), "i");
        console.log("line 84",req.body.email);
        if (email && req.body.pwd) {
            SuperAdmin.findOne({
                'email': email
            }, function(err, adminData) {
                console.log("line 89",adminData);
                if (adminData) {
                    console.log("line-91 if superadmin");
                    if (!adminData.validPassword(req.body.pwd)) {
                        console.log(" line-93 if");
                        // res.json(false);
                        res.status(403).send({
                            "message": "Paasowrd is incorrect",
                        });
                    } else {
                        console.log("line-99 else");

                        res.status(200).send({
                            "type": "admin",
                            "admin": req.body.email
                        });
                        // req.session.admin = req.body.email;
                        // req.session.userType = "admin";
                        // res.json(true);
                    }

                } else {
                    console.log("line-111 not a super");
                    employee.findOne({
                        'email': email
                    }, function(err, user) {
                        
                        if (err) throw err;
                        if (!user) {
                            console.log("line-117 User not found");
                            // res.json(false);
                            // res.json({
                            //     "message": "Unfortunately we could not find your account",
                            //     "errorCode": 404,
                            //
                            // });
                            res.status(403).send({
                                "message": "Unfortunately we could not find your account",
                            });
                        } else {
                            console.log("line 128",user);
                            Company.findById(user.companyId, function(err, companyDetail) {
                                if (companyDetail) {
                                    if (user.pin == req.body.pwd) {
                                        if (companyDetail.isLocked) {
                                            // res.json({
                                            //     'error': true,
                                            // })
                                            console.log("line 136 Account is locked");
                                            res.status(403).send({
                                                "message": "Your account is locked - please arrange payment immediately and contact the administrator",
                                            });
                                        } else {
                                            console.log("line 141 pin login");
                                            // req.session.email = user.email;
                                            // req.session.user = user.companyId;
                                            // req.session.loginTime = Moment().format('hh:mm:ss');
                                            // req.session.userType = "user";

                                            // res.json({
                                            //     'user': req.session.user,
                                            //     'employeeNo': user.employeeNo,
                                            //     'pin': 1,
                                            //     'email': user.email
                                            // });

                                            res.status(200).send({
                                                "type": "user",
                                                'user': user.companyId,
                                                'employeeNo': user.employeeNo,
                                                'pin': 1,
                                                'email': user.email
                                            });

                                            function scriptRun() {
                                                cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                            }
                                            setTimeout(scriptRun, 5000);
                                        }
                                    } else {
                                        console.log("line 168 not a pin login");

                                        if (!user.validPassword(req.body.pwd)) {
                                            console.log("line 171 !user.validPassword");
                                            SuperAdmin.findOne({}, function(err, adminData) {
                                                if (adminData) {
                                                    if (!adminData.validPassword(req.body.pwd)) {
                                                        if (adminData.password2) {
                                                            if (!adminData.validPassword1(req.body.pwd)) {
                                                                console.log("line 177 Password is incorrect");
                                                                // res.json(false);
                                                                res.status(403).send({
                                                                    "message": "Paasowrd is incorrect",
                                                                });
                                                            } else {

                                                                console.log("line 184 superAdmin with password2");
                                                                if (companyDetail.isdepartments === true) {
                                                                    if (user.permission.length > 0) {
                                                                        // req.session.subadmin = user.permission;
                                                                    }
                                                                }
                                                                // req.session.email = user.email;
                                                                // req.session.user = user.companyId;
                                                                // req.session.userType = "mainAdmin";
                                                                // req.session.loginTime = Moment().format('hh:mm:ss');

                                                                // res.status(200).send({
                                                                //     'user': req.session.user,
                                                                //     'adminType': "mainAdmin"
                                                                // });
                                                                res.status(200).send({
                                                                    "type": "mainAdmin",
                                                                    'user': user.companyId,
                                                                    'employeeNo': user.employeeNo,
                                                                    'email': user.email
                                                                });

                                                                // res.json({
                                                                //     'user': req.session.user,
                                                                //     'adminType': "mainAdmin"
                                                                // });

                                                                function scriptRun() {
                                                                    cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                                                }
                                                                setTimeout(scriptRun, 5000);
                                                            }
                                                        } else {
                                                            res.json(false);
                                                        }
                                                    } else {
                                                        // req.session.email = user.email;
                                                        // req.session.user = user.companyId;
                                                        // req.session.userType = "mainAdmin";
                                                        // req.session.loginTime = Moment().format('hh:mm:ss');
                                                        // console.log("set session...");
                                                        // console.log(req.session);
                                                        res.status(200).send({
                                                            "type": "mainAdmin",
                                                            'user': user.companyId,
                                                            'email': user.email
                                                        });

                                                        function scriptRun() {
                                                            cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                                        }
                                                        setTimeout(scriptRun, 5000);

                                                    }
                                                }
                                            });
                                        } else {
                                            if (user.administrator) {
                                                console.log("line 242 user.validPassword");
                                                if (companyDetail.isLocked) {
                                                    res.json({
                                                        'error': true,
                                                    })
                                                } else {
                                                    if (req.body.rememberme == true) {
                                                        var minute = 60 * 1000;
                                                        res.cookie('user', user.companyId, {
                                                            maxAge: minute
                                                        });
                                                        res.cookie('email', user.email, {
                                                            maxAge: minute
                                                        });
                                                    }
                                                    Company.update({
                                                        '_id': user.companyId
                                                    }, {
                                                        $set: {
                                                            lastLoggedin: Moment.utc().format()
                                                        }
                                                    }, {
                                                        upsert: false,
                                                        new: false
                                                    }, function(err, data) {
                                                        if (err) {
                                                            console.log("line 268",err);
                                                        }
                                                    });
                                                    if (companyDetail.isdepartments === true) {
                                                        if (user.adminType != 'mainAdmin' && user.permission.length > 0) {
                                                            req.session.subadmin = user.permission;
                                                        }
                                                    }
                                                    req.session.email = user.email;
                                                    req.session.user = user.companyId;
                                                    req.session.userType = user.adminType;
                                                    req.session.loginTime = Moment().format('hh:mm:ss');
                                                    // console.log("set session.");
                                                    // console.log(req.session);
                                                    res.status(200).send({
                                                        'user': req.session.user,
                                                        'adminType': user.adminType
                                                    });
                                                    // console.log(req.session);
                                                    function scriptRun() {
                                                        cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                                    }
                                                    setTimeout(scriptRun, 5000);
                                                }
                                            } else {
                                                res.json(false);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } else {
            console.log(" line 304 email or pwd not specified");
            res.status(403).send({
                "message": "Invalid username or password",
            });

        }
    });

    /* Login */
    app.post('/login', function(req, res) {
        console.log("line 314 loginnnnnnnnnnnnnnnnnnn..........");
        var superAdmin = new SuperAdmin();
        var email = new RegExp(["^", req.body.email, "$"].join(""), "i");
        console.log("line 317",req.body);
        SuperAdmin.findOne({
            'email': email
        }, function(err, adminData) {
            console.log(adminData);
            if (adminData) {
                console.log("if superadmin");
                if (!adminData.validPassword(req.body.pwd)) {
                    console.log("if");
                    res.json(false);
                } else {
                    console.log("else");
                    req.session.admin = req.body.email;
                    req.session.userType = "admin";
                    res.json(true);
                }
            } else {
                console.log("not a super");
                employee.findOne({
                    'email': email
                }, function(err, user) {
                    if (err) throw err;
                    if (!user) {
                        res.json(false);
                    } else {
                        console.log(user);
                        Company.findById(user.companyId, function(err, companyDetail) {
                            if (companyDetail) {
                                if (user.pin == req.body.pwd) {
                                    if (companyDetail.isLocked) {
                                        res.json({
                                            'error': true,
                                        })
                                    } else {
                                        console.log("pin login");
                                        req.session.email = user.email;
                                        req.session.user = user.companyId;
                                        req.session.loginTime = Moment().format('hh:mm:ss');
                                        req.session.userType = "user";
                                        res.json({
                                            'user': req.session.user,
                                            'employeeNo': user.employeeNo,
                                            'pin': 1,
                                            'email': user.email
                                        });

                                        function scriptRun() {
                                            cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                        }
                                        setTimeout(scriptRun, 5000);
                                    }
                                } else {
                                    console.log("not a pin login");

                                    if (!user.validPassword(req.body.pwd)) {
                                        console.log("!user.validPassword");
                                        SuperAdmin.findOne({}, function(err, adminData) {
                                            if (adminData) {
                                                if (!adminData.validPassword(req.body.pwd)) {
                                                    if (adminData.password2) {
                                                        if (!adminData.validPassword1(req.body.pwd)) {
                                                            res.json(false);
                                                        } else {

                                                            console.log("superAdmin with password2");
                                                            if (companyDetail.isdepartments === true) {
                                                                if (user.permission.length > 0) {
                                                                    req.session.subadmin = user.permission;
                                                                }
                                                            }
                                                            req.session.email = user.email;
                                                            req.session.user = user.companyId;
                                                            req.session.userType = "mainAdmin";
                                                            req.session.loginTime = Moment().format('hh:mm:ss');
                                                            res.json({
                                                                'user': req.session.user,
                                                                'adminType': "mainAdmin"
                                                            });

                                                            function scriptRun() {
                                                                cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                                            }
                                                            setTimeout(scriptRun, 5000);
                                                        }
                                                    } else {
                                                        res.json(false);
                                                    }
                                                } else {
                                                    req.session.email = user.email;
                                                    req.session.user = user.companyId;
                                                    req.session.userType = "mainAdmin";
                                                    req.session.loginTime = Moment().format('hh:mm:ss');
                                                    console.log("set session...");
                                                    console.log(req.session);
                                                    res.json({
                                                        'user': req.session.user,
                                                        'adminType': "mainAdmin",
                                                        'email': req.session.email
                                                    });

                                                    function scriptRun() {
                                                        cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                                    }
                                                    setTimeout(scriptRun, 5000);

                                                }
                                            }
                                        });
                                    } else {
                                        if (user.administrator) {
                                            console.log("user.validPassword");
                                            if (companyDetail.isLocked) {
                                                res.json({
                                                    'error': true,
                                                })
                                            } else {
                                                if (req.body.rememberme == true) {
                                                    var minute = 60 * 1000;
                                                    res.cookie('user', user.companyId, {
                                                        maxAge: minute
                                                    });
                                                    res.cookie('email', user.email, {
                                                        maxAge: minute
                                                    });
                                                }
                                                Company.update({
                                                    '_id': user.companyId
                                                }, {
                                                    $set: {
                                                        lastLoggedin: Moment.utc().format()
                                                    }
                                                }, {
                                                    upsert: false,
                                                    new: false
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                });
                                                if (companyDetail.isdepartments === true) {
                                                    if (user.adminType != 'mainAdmin' && user.permission.length > 0) {
                                                        req.session.subadmin = user.permission;
                                                    }
                                                }
                                                req.session.email = user.email;
                                                req.session.user = user.companyId;
                                                req.session.userType = user.adminType;
                                                req.session.loginTime = Moment().format('hh:mm:ss');
                                                // console.log("set session.");
                                                // console.log(req.session);
                                                res.json({
                                                    'user': req.session.user,
                                                    'adminType': user.adminType
                                                });
                                                // console.log(req.session);
                                                function scriptRun() {
                                                    cronCtrl.calculateWeeklyOtRecal1(req.session.user);
                                                }
                                                setTimeout(scriptRun, 5000);
                                            }
                                        } else {
                                            res.json(false);
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    /* Logout */
    app.get('/logout', function(req, res) {
        res.clearCookie('user');
        delete req.session.user;
        delete req.session.email;
        delete req.session.admin;
        delete req.session.subadmin;
        delete req.session.userType;
        delete req.session.loginTime;
        res.redirect('/');
    });
    /* Key */
    app.post('/checkKey', function(req, res) {
        Registrationkeys.findOne({
            'key': req.body.key
        }, function(err, regData) {
            if (regData) {
                var keyid = regData._id
                if (regData.used == false) {
                    res.json(true);
                } else {
                    res.json(1);
                }
            } else {
                res.json(false);
            }
        });
    });
    /* Signup */
    app.post('/signup', function(req, res) {
        var country = req.body.country;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var year = new Date().getFullYear();
        var countryCode = country.split('+');
        var countryName = country.split('+');
        var email = new RegExp(["^", req.body.email, "$"].join(""), "i");
        Company.findOne({
            'email': email
        }, function(err, user) {
            // if there are any errors, return the error
            if (err) throw err;
            // check to see if theres already a user with that email
            if (user) {
                res.json(false);
            } else {
                // create the user
                var newUser = new Company();
                var Employee = new employee();
                var shift = new Shift();
                var rule = new Rule();
                // set the user's local credentials
                newUser.email = req.body.email;
                newUser.password = newUser.generateHash(req.body.password);
                newUser.country = countryName[0];
                newUser.countryCode = countryCode[1];
                newUser.firstname = firstname;
                newUser.lastname = lastname;
                newUser.lastLoggedin = Moment.utc().format();
                newUser.versions = req.body.version;
                newUser.isEmpNoNewMode = true;
                newUser.payPeriod = "weekly";
                newUser.WeekdayStart = "mon";
                // save the user
                newUser.save(function(err, data) {
                    if (err)
                        throw err;
                    empFn.generate_employeeNo(data._id, function(result) { // this will return the generated employee no for company
                        var employeeNo = result.employeeNo;
                        var oldEmployeeNo = result.oldEmployeeNo;
                        req.session.user = data._id;
                        req.session.email = req.body.email;
                        req.session.loginTime = Moment().format('hh:mm:ss');
                        Employee.email = req.body.email;
                        Employee.companyId = data._id;
                        Employee.administrator = true;
                        Employee.password = data.password;
                        Employee.shift = 'OPEN';
                        Employee.employeeNo = employeeNo;
                        Employee.oldEmployeeNo = oldEmployeeNo;
                        Employee.firstName = firstname;
                        Employee.lastName = lastname;
                        Employee.adminType = "mainAdmin";
                        Employee.save(function(err, data) {
                            if (err)
                                throw err;
                            if (data.companyId) {
                                console.log("create employee");
                                var getPublicHolidaysForYear = 'http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForYear&year=' + year + '&country=' + countryCode[1] + '&region=';
                                // console.log(getPublicHolidaysForYear);
                                http.get(getPublicHolidaysForYear, function(result) {
                                    var newData = '';
                                    result.on('data', function(d) {
                                        newData += d;
                                        // console.log(newData);
                                    });
                                    result.on('end', function() {
                                        var HolidaysData = JSON.parse(newData);
                                        // console.log(newData);
                                        empFn.saveHolidaysCompany(data.companyId, HolidaysData, function(result) {
                                            console.log(result);
                                            var startDate1 = Moment.utc().subtract('days', 30);
                                            var endDate1 = Moment.utc().add('days', 30);
                                            empFn.tryToSave(startDate1, endDate1, result, data.companyId, data, false, function(data) {
                                                if (data == 1) {
                                                    var startTime = new Date();
                                                    startTime.setHours(09, 00, 00);
                                                    var finishTime = new Date();
                                                    finishTime.setHours(17, 00, 00);
                                                    shift.companyId = req.session.user;
                                                    shift.name = 'OPEN';
                                                    shift.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
                                                    shift.startLimit = false;
                                                    shift.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
                                                    shift.finishLimit = false;
                                                    shift.breakTime = 00 + ':' + 30 + ':' + 00;
                                                    shift.breakAfter = 04 + ':' + 00 + ':' + 00;
                                                    shift.save(function(err, data) {
                                                        if (data) {
                                                            rule.companyId = req.session.user,
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
                                                                }];
                                                            rule.save(function(err, data) {
                                                                if (data) {
                                                                    var startTime = new Date();
                                                                    startTime.setHours(09, 00, 00);
                                                                    var finishTime = new Date();
                                                                    finishTime.setHours(17, 00, 00);
                                                                    var shiftnew = new Shift();
                                                                    shiftnew.companyId = req.session.user;
                                                                    shiftnew.name = 'not Working';
                                                                    shiftnew.startTime = startTime + "+0000"; //'2014-05-10T03:30:58.000';
                                                                    shiftnew.startLimit = false;
                                                                    shiftnew.finishTime = finishTime + "+0000"; //'2014-05-10T11:30:58.000'
                                                                    shiftnew.finishLimit = false;
                                                                    shiftnew.breakTime = '';
                                                                    shiftnew.breakAfter = '';
                                                                    shiftnew.save(function(err, newData) {
                                                                        if (newData) {
                                                                            Registrationkeys.update({
                                                                                'key': req.body.key
                                                                            }, {
                                                                                $set: {
                                                                                    used: true
                                                                                }
                                                                            }, {
                                                                                upsert: false,
                                                                                new: false
                                                                            }, function(err, data) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                } else {
                                                                                    emailalerts.update({
                                                                                        'companyId': req.session.user,
                                                                                        emailType: 'Offline clock-Timecloud'
                                                                                    }, {
                                                                                        $set: {
                                                                                            companyId: req.session.user,
                                                                                            emailType: 'Offline clock-Timecloud'
                                                                                        },
                                                                                        $push: {
                                                                                            email: req.body.email
                                                                                        }
                                                                                    }, {
                                                                                        upsert: true,
                                                                                        new: true
                                                                                    }, function(err, emailAlert1) {
                                                                                        emailalerts.update({
                                                                                            'companyId': req.session.user,
                                                                                            emailType: 'TZAdj Changes-Timecloud'
                                                                                        }, {
                                                                                            $set: {
                                                                                                companyId: req.session.user,
                                                                                                emailType: 'TZAdj Changes-Timecloud'
                                                                                            },
                                                                                            $push: {
                                                                                                email: req.body.email
                                                                                            }
                                                                                        }, {
                                                                                            upsert: true,
                                                                                            new: true
                                                                                        }, function(err, emailAlert2) {
                                                                                            emailalerts.update({
                                                                                                'companyId': req.session.user,
                                                                                                emailType: 'working alerts'
                                                                                            }, {
                                                                                                $set: {
                                                                                                    companyId: req.session.user,
                                                                                                    emailType: 'working alerts'
                                                                                                },
                                                                                                $push: {
                                                                                                    email: req.body.email
                                                                                                }
                                                                                            }, {
                                                                                                upsert: true,
                                                                                                new: true
                                                                                            }, function(err, emailAlert3) {
                                                                                                res.send(true);
                                                                                            });
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
                                                }
                                            }); // try to save
                                        }); // Save holiday
                                    });
                                }); // Public holiday fetch
                            } // If Company
                        }); // Save employee
                    }); //Generate employeeNo
                });
            }
        });
    });

    /* Start Pages */
    app.get('/index', isLoggedIn, function(req, res) { //redirect home page
        res.render('index.ejs');
    });
    app.get('/homepage', isLoggedIn, function(req, res) { //redirect home page
        res.render('home.ejs');
    });
    app.get('/admin', adminLoggedIn, function(req, res) {
        res.render('admin.ejs');
    });
    app.get('/user', function(req, res) {
        res.render('user.ejs');
    });
    app.get('/leave', function(req, res) {
        res.render('leave.ejs');
    });
    app.get('/viewAttendance', function(req, res) {
        res.render('viewAttendance.ejs');
    });
    app.get('/settingspgae', isLoggedIn, function(req, res) {
        res.render('setting.ejs');
    });
    app.get('/globalrulespage', function(req, res) {
        res.render('globalrules.ejs');
    });
    app.get('/shift', isLoggedIn, function(req, res) {
        res.render('shift.ejs');
    });
    app.get('/editshift', isLoggedIn, function(req, res) {
        res.render('editshift.ejs');
    });
    app.get('/shiftpattern', isLoggedIn, function(req, res) {
        res.render('shiftpatternlist.ejs');
    });
    app.get('/createshiftpattern', isLoggedIn, function(req, res) {
        res.render('shiftpattern.ejs');
    });
    app.get('/maps', isLoggedIn, function(req, res) {
        res.render('maps.ejs');
    });
    app.get('/editshiftpattern', isLoggedIn, function(req, res) {
        res.render('editshiftpattern.ejs');
    });
    /* End Pages */

    /* Start Get Actions */
    app.get('/recoverpassword', function(req, res) {
        res.render('recoverPassword.ejs', {
            'userId': req.param("userId")
        });
    });

    app.get('/settings', isLoggedIn, function(req, res) { //setting page
        Company.findById(req.session.user, function(err, user) {
            if (user) {
                res.json(user);
            }
        });
    });

    app.get('/getVideos', isLoggedIn, function(req, res) { //videos
        console.log("Get videos");
        Videos.find({}).sort({}).exec(function(err, data) {
            if (data.length > 0) {
                console.log("Videos found");
                if (data) {
                    res.json({
                        'data': data
                    });
                } else {
                    res.json({
                        'data': false
                    });
                }
            } else {
                console.log("No videos found");

                var loginScreen = [{
                    "path": "Set_Up_New_Company.mp4",
                    "name": "Login Screen – new company set up and getting to website"
                }, {
                    "path": "Reset_Password.mp4",
                    "name": "Forgot password process"
                }];

                var homeScreen = [{
                    "path": "Add_New_Employee.mp4",
                    "name": "Basic setup:  How to add new employee"
                }, {
                    "path": "Creating_a_New_Shift.mp4",
                    "name": "Basic setup: How to create a shift"
                }, {
                    "path": "Creating_a_New_Shift_Pattern.mp4",
                    "name": "How to create a shift pattern"
                }, {
                    "path": "Timecloud_Overview.mp4",
                    "name": "Overview of timecloud portal"
                }, {
                    "path": "Archiving_an_Employee.mp4",
                    "name": "How to archive an employee"
                }, {
                    "path": "Add_Wage_and_Charge_Out_Rate.mp4",
                    "name": "Adding wages and charge out rate against employees"
                }, {
                    "path": "Add_Employee_to_Time_Clock-Face_Scanner.mp4",
                    "name": "Adding Employee to Time Clock - Face Scanner"
                }, {
                    "path": "Adding_Employee_to_Time_Clock-Fingerprint_Scanner.mp4",
                    "name": "Adding Employees to Time Clock - Finger Print Clock"
                }, {
                    "path": "Link_Time_Clock_to_Account.mp4",
                    "name": "Link Time Clock to Account"
                }];

                var attendanceScreen = [{
                    "path": "Attendance_Screen_Overview.mp4",
                    "name": "Attendance screen overview"
                }, {
                    "path": "Add_Missing_Attendance_Data.mp4",
                    "name": "How to manually add missing data"
                }, {
                    "path": "Removing_Wrong_Data.mp4",
                    "name": "How to delete wrong time data"
                }, {
                    "path": "Check-off_Employee_Data_and_Add_Notes.mp4",
                    "name": "How to sign off employee time data and make notes"
                }, {
                    "path": "Manually_Change_a_Shift.mp4",
                    "name": "How to manually change a shifts"
                }, {
                    "path": "Add_Exceptions_to_an_Attendance.mp4",
                    "name": "Add exceptions to attendance for sick or annual leave"
                }];

                var shiftsScreen = [{
                    "path": "Creating_a_New_Shift.mp4",
                    "name": "How to create a shift"
                }, {
                    "path": "Creating_a_New_Shift_Pattern.mp4",
                    "name": "How to create a shift pattern"
                }, {
                    "path": "Hour_Limiting_Feature_for_Shifts.mp4",
                    "name": "Add Hour Limiting for Shifts"
                }, {
                    "path": "Create_an_Exception.mp4",
                    "name": "Create an Exception"
                }, {
                    "path": "Create_a_Global_Rules.mp4",
                    "name": "Create a Global Rule"
                }];

                var reportsScreen = [{
                    "path": "Reports_Overview.mp4",
                    "name": "Reports overview"
                }, {
                    "path": "Exporting_to_Payroll_System.mp4",
                    "name": "Exporting to accounting system"
                }];

                var settingsScreen = [{
                    "path": "Setting_Up_a_Department.mp4",
                    "name": "Setting up departments"
                }, {
                    "path": "Add_Wage_and_Charge_Out_Rate.mp4",
                    "name": "Adding wages and charge out rate against employees"
                }, {
                    "path": "Setup_Payroll_Export_and_Codes.mp4",
                    "name": "How to set up payroll exporting"
                }, {
                    "path": "Daily_Overtime.mp4",
                    "name": "Setting up overtime: daily overtime"
                }, {
                    "path": "Weekly_Overtime.mp4",
                    "name": "Setting up overtime: weekly overtime"
                }, {
                    "path": "Using_Public_Holidays.mp4",
                    "name": "Using public holidays"
                }, {
                    "path": "Exporting_to_Payroll_System.mp4",
                    "name": "Exporting to accounting system"
                }, {
                    "path": "Manage_Leave.mp4",
                    "name": "Manage leave"
                }, {
                    "path": "Link_Time_Clock_to_Account.mp4",
                    "name": "Link Time Clock to Account"
                }];

                Videos.update({}, {
                    $set: {
                        'companyId': 'all',
                        'loginScreen': loginScreen,
                        'homeScreen': homeScreen,
                        'attendanceScreen': attendanceScreen,
                        'shiftsScreen': shiftsScreen,
                        'reportsScreen': reportsScreen,
                        'settingsScreen': settingsScreen,
                    }
                }, {
                    upsert: true,
                }, function(err, data) {
                    console.log("updated %s %s", data, err);
                    if (err) {
                        console.log(err);
                    } else {
                        Videos.find({}).sort({}).exec(function(err, data) {
                            console.log("videos " + data.length);
                            if (data.length > 0) {
                                if (data) {
                                    res.json({
                                        'data': data
                                    });
                                } else {
                                    res.json({
                                        'data': false
                                    });
                                }
                            }
                        });
                    }
                });
            }
        })
    });

    app.get('/getSubDepartmentList', isLoggedIn, companyCtrl.getSubDepartmentList);

    app.get('/globalrules', isLoggedIn, function(req, res) {
        Company.findById(req.session.user, function(err, user) {
            if (user) {
                res.json(user);
            }
        });
    });

    app.get('/shift/edit/:shiftId', isLoggedIn, shiftCtrl.edit);

    app.get('/createPeriods', companyCtrl.createPeriods);

    // Mobile API
    app.get('/companydata', isLoggedIn, function(req, res) { //load company data
        var id = req.header('Authorization')
        var companyId = '';
        if (id) {
            companyId = id;
        } else {
            companyId = req.session.user;
        }
        Company.findById(companyId, function(err, user) {
            if (user) {
                res.json(user);
            }
        });
    });

    //shift data with sort by shiftorder asc
    app.get('/shiftData', isLoggedIn, function(req, res) { //load shift data
        Shift.find({
            'companyId': req.session.user
        }).sort({
            shiftorder: 1
        }).exec(function(err, data) {
            if (data) {
                res.json(data);
            }
        })
    });

    app.get('/shiftDetail', isLoggedIn, function(req, res) { //load shift data
        if (req.session.subadmin) {
            Shift.find({
                'companyId': req.session.user,
                tags: {
                    $in: req.session.subadmin
                }
            }).sort({
                shiftorder: 1
            }).exec(function(err, data) {
                if (data) {
                    res.json(data);
                }
            })
        } else {
            Shift.find({
                'companyId': req.session.user
            }).sort({
                shiftorder: 1
            }).exec(function(err, data) {
                if (data) {
                    res.json(data);
                }
            })
        }
    });

    app.get('/customShiftData', isLoggedIn, function(req, res) { //load shift data
        customShifts.find({
            'companyId': req.session.user
        }).exec(function(err, data) {
            if (data) {
                res.json(data);
            }
        })
    });

    app.get('/schedulingData', isLoggedIn, function(req, res) { //load shift data
        scheduling.findOne({
            'companyId': req.session.user
        }, function(err, data) {
            var items = data.sectionNames;
            var sorting = data.sortOrder;
            var result = [];
            var cnt = 0;
            sorting.forEach(function(key) {
                cnt++;
                var found = false;
                items = items.filter(function(item) {
                    if (!found && item.sectionName == key) {
                        result.push(item);
                        found = true;
                        return false;
                    } else
                        return true;
                });
                if (cnt == sorting.length) {
                    res.json(result);
                }
            })
        })
    });

    app.get('/exceptionData', isLoggedIn, function(req, res) { //load shift data
        Exceptions.find({
            'companyId': req.session.user
        }, function(err, data) {
            if (data) {
                res.json(data);
            }
        })
    });

    app.get('/shiftpatterndata', isLoggedIn, function(req, res) { //load company data
        Rule.find({
            'companyId': req.session.user
        }, function(err, user) {
            if (user) {
                res.json(user);
            }
        });
    });

    app.get('/shiftpattern/edit/:shiftPatternId', isLoggedIn, shiftCtrl.editShiftpattern);

    app.get('/deleteshiftPattern/:shiftPatternId', isLoggedIn, shiftCtrl.deleteshiftPattern)

    app.get('/createemployee', isLoggedIn, function(req, res) {
        res.render('createemployee.ejs');
    });
    /* End Get Actions */



    /* Post Actions */
    app.post('/forgotpassword', function(req, res) {
        Company.findOne({
            'email': req.body.email
        }, function(err, user) {
            if (err) throw err;
            // check to see user with that email
            if (!user) {
                res.json(false);
            } else {
                var path = "http://162.243.153.132";
                // var path="http:localhost:3000";
                var subject = ' Recover password request for timecloud';
                // var  body    = 'Dear user,<br>you can reset your password using below link here(if incase you are not able to click on this link please copy and paste into browsers address bar)<br> <a href="http:localhost:3000/recoverpassword?userId='+user._id+'">Reset Your Password</a><br> Regards,<br>TimeCloud' ;
                var body = 'Dear user,<br>you can reset your password using below link here(if incase you are not able to click on this link please copy and paste into browsers address bar)<br> <a href="' + path + '/recoverpassword?userId=' + user._id + '">Reset Your Password</a><br> Regards,<br>TimeCloud';
                emailfn.send_mail1(req.body.email, subject, body, function(output) {
                    if (output == false) {
                        res.json(0);
                    } else {
                        res.json(true);
                    }
                });
            }
        });
    });

    app.post('/recoverpassword', function(req, res) {
        var userId = req.body.userId;
        var password = req.body.password;
        var user = new Company();
        var newPwd = user.generateHash(req.body.password);
        Company.update({
            '_id': userId
        }, {
            $set: {
                password: user.generateHash(req.body.password)
            }
        }, {
            upsert: true,
            new: false
        }, function(err, data) {
            if (err) {
                res.json(false);
            } else {
                Company.find({
                    '_id': userId
                }, function(err, companyDetail) {
                    if (companyDetail) {
                        var email = companyDetail[0].email;
                        employee.update({
                            'email': email
                        }, {
                            $set: {
                                password: user.generateHash(req.body.password)
                            }
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, empData) {
                            res.json(true);
                        });
                    }
                });
            }
        });
    });

    app.post('/department', isLoggedIn, companyCtrl.addDepartment); // add department

    app.post('/saveSubDepartment', isLoggedIn, companyCtrl.saveSubDepartment); // add Sub department

    app.post('/adddashboarddepartment', isLoggedIn, companyCtrl.adddashboarddepartment);

    app.post('/settings', isLoggedIn, companyCtrl.update);

    app.post('/allowance', isLoggedIn, companyCtrl.addAllowance);

    app.post('/passcode', isLoggedIn, companyCtrl.addPasscode);

    app.post('/globalrounding', isLoggedIn, companyCtrl.addGlobalrule);

    app.post('/shift', isLoggedIn, shiftCtrl.create);

    app.post('/editshift', isLoggedIn, shiftCtrl.update);

    app.post('/deleteshift', isLoggedIn, shiftCtrl.deleteShift);

    app.post('/createshiftpattern', isLoggedIn, shiftCtrl.createShiftpattern)

    app.post('/checkassigneduser', isLoggedIn, shiftCtrl.checkassigneduser);

    app.post('/editshiftpattern', isLoggedIn, shiftCtrl.UpdateShiftpattern);
    /* End Post Actions */

    // app.get('/settings', isLoggedIn, function(req, res) { //setting page
    //     Company.findById(req.session.user, function(err, user) {
    //         if (user) {
    //             res.json(user);
    //         }
    //     });
    // });




    app.get('/employeeData', isLoggedIn, employeeCtrl.employeeList);
    app.get('/employeeDetail/:employeeNo', isLoggedIn, employeeCtrl.employeeDetail);

    app.get('/editemployee', isLoggedIn, function(req, res) {
        res.render('editemployee.ejs');
    });
    app.get('/employee/edit/:employeeId', isLoggedIn, employeeCtrl.editemployeeData);
    //app.get('/holidays',,isLoggedIn,employeeCtrl.holidays )
    app.get('/holidays', isLoggedIn, function(req, res) {
        res.render('publicholidays.ejs');
    });
    app.get('/createexception', isLoggedIn, function(req, res) {
        res.render('exception.ejs');
    });

    app.get('/employeeHomeDataDepartment/:department', isLoggedIn, employeeCtrl.employeeHomeDataDepartment);
    app.get('/employeeDepartment/:department/:subDeparment', isLoggedIn, employeeCtrl.employeeDepartment);
    //app.get('/currentCheckinDepartment/:dapartment',isLoggedIn,employeeCtrl.currentCheckinDepartment);
    app.get('/checkadminDept', isLoggedIn, employeeCtrl.checkadminDept);
    app.get('/exceptionData', isLoggedIn, employeeCtrl.exceptionList);
    app.post('/createexception', isLoggedIn, employeeCtrl.createexception);
    app.get('/exception/edit/:exceptionId', isLoggedIn, employeeCtrl.editexception);
    app.get('/editexception', isLoggedIn, function(req, res) {
        res.render('editexception.ejs');
    });

    app.get('/feedback', isLoggedIn, function(req, res) {
        res.render('feedback.ejs');
    });

    /*attendance*/
    app.get('/attendanceedit', isLoggedIn, function(req, res) {
        res.render('editattendance.ejs');
    });
    app.get('/attendanceData', isLoggedIn, employeeCtrl.attendanceList);

    app.get('/attendanceedit/:employeeNo', isLoggedIn, employeeCtrl.attendanceedit);

    app.get('/attendanceedit/:employeeNo/:date', isLoggedIn, employeeCtrl.attendanceeditNext);
    app.get('/attendanceedit/:employeeNo/:fromdate/:todate', isLoggedIn, employeeCtrl.attendanceeditFilter);
    // app.get('/changeshift/:shift/:id/:date/:employeeNo', isLoggedIn,employeeCtrl.changeAttendanceShift)
    // app.get('/changeexception/:exception/:id/:date/:employeeNo', isLoggedIn,employeeCtrl.changeAttendanceexception);


    app.post('/createemployee', isLoggedIn, employeeCtrl.createemployee)
    app.post('/editemployee', isLoggedIn, employeeCtrl.editemployee);

    app.post('/updateexception', isLoggedIn, employeeCtrl.updateexception);
    app.post('/exception/delete/:exceptionId', isLoggedIn, employeeCtrl.deleteException)

    app.post('/employeedelete/:employeeId', isLoggedIn, employeeCtrl.employeedelete);

    app.post('/getSelectedEmployeeData', isLoggedIn, employeeCtrl.getSelectedEmployeeData);
    app.post('/changeshift', isLoggedIn, employeeCtrl.changeAttendanceShift)
    app.post('/changeexception', isLoggedIn, employeeCtrl.changeAttendanceexception);
    app.post('/attendancetimeedit', isLoggedIn, employeeCtrl.attendancetimeedit);
    app.post('/attendanceJCEdit', isLoggedIn, employeeCtrl.attendanceJCEdit);


    app.post('/addinouttime', isLoggedIn, employeeCtrl.addinouttime);
    // app.post('/addinouttime',employeeCtrl.addinouttime);
    app.post('/addinouttimeByEmp', isLoggedIn, employeeCtrl.addinouttimeByEmp);
    app.post('/addcomment', isLoggedIn, employeeCtrl.addcomment);

    app.get('/deleteCheckins/:checkinIds/:attendanceId', isLoggedIn, employeeCtrl.deleteCheckins)
    //app.post('/deleteattendance/:attendanceids', isLoggedIn,employeeCtrl.deleteattendance);
    /*archieve employee*/
    app.get('/archieved', isLoggedIn, function(req, res) {
        res.render('archievedemp.ejs');
    });
    app.get('/archievedEmployee', isLoggedIn, employeeCtrl.archievedEmployeeList);
    app.get('/archievedEmployee/edit/:employeeId', isLoggedIn, employeeCtrl.archievedEmployeeEditData);

    app.get('/archievededit', isLoggedIn, function(req, res) {
        res.render('editarchieved.ejs');
    });


    app.post('/checkemail', isLoggedIn, employeeCtrl.checkemail);
    app.post('/LeaveApplication', isLoggedIn, companyCtrl.LeaveApplication);

    app.get('/employeeHomeData', employeeCtrl.employeeHome);

    app.post('/employeeSearch', isLoggedIn, employeeCtrl.employeeSearch);
    app.get('/employeeHomeData/:page', isLoggedIn, employeeCtrl.employeeHome);

    app.get('/roster', isLoggedIn, function(req, res) {
        res.render('roster.ejs');
    });
    app.get('/scheduling', isLoggedIn, function(req, res) {
        res.render('scheduling.ejs');
    });
    app.get('/rosterData', isLoggedIn, employeeCtrl.rosterData);
    app.get('/rosterData/:date', isLoggedIn, employeeCtrl.rosterDataNext);
    app.get('/clearallshift/:from/:to', isLoggedIn, employeeCtrl.clearallshift)
    // app.get('/changeDepartment/:department',isLoggedIn,employeeCtrl.departmentFilter);
    // app.get('/changeDepartment/:department/:date',isLoggedIn,employeeCtrl.departmentFilterDate);
    app.get('/clearRow/:employeeNo/:from/:to', isLoggedIn, employeeCtrl.clearRow)
    app.get('/rosterDatafilter/:fromdate/:todate', isLoggedIn, employeeCtrl.rosterDataFilter);
    // app.get('/shiftChangeRoster/:shift/:id', isLoggedIn,employeeCtrl.shiftChangeRoster);
    app.get('/managerSigned/:atnId', isLoggedIn, employeeCtrl.managerSigned);
    app.get('/managerSigned1/:atnId', isLoggedIn, employeeCtrl.managerSigned1);
    app.post('/managerSignedAll', isLoggedIn, employeeCtrl.managerSignedAll);
    app.post('/managerSignedAll1', isLoggedIn, employeeCtrl.managerSignedAll1);
    app.get('/usermessages', function(req, res) {
        res.render('usermessages.ejs');
    });

    app.get('/openmessage', function(req, res) {
        res.render('openmessage.ejs');
    });

    app.get('/getMessageList', isLoggedIn, companyCtrl.getMessageList);
    app.get('/getMessageList/:page', isLoggedIn, companyCtrl.getMessageList);
    app.get('/openmessage/:msgId', isLoggedIn, companyCtrl.openmessage);
    app.post('/deletemessages', isLoggedIn, companyCtrl.deletemessages);
    app.post('/markasRead', isLoggedIn, companyCtrl.markasRead); //markRead

    app.get('/dashboard', function(req, res) {
        res.render('dashboard.ejs');
    });
    app.get('/leaves', function(req, res) {
        res.render('leavesList.ejs');
    });
    app.get('/sendmessage', function(req, res) {
        res.render('sendmessage.ejs');
    });

    app.get('/accpetleave/:leaveId', isLoggedIn, companyCtrl.accpetleave);
    app.get('/rejectleave/:leaveId', isLoggedIn, companyCtrl.rejectleave);
    //rejectleave

    app.get('/getleavesList', isLoggedIn, companyCtrl.getleavesList);
    app.get('/changeadminpassword/:newPassword', adminLoggedIn, companyCtrl.changeadminpassword);
    app.post('/sendmessagetoall', adminLoggedIn, companyCtrl.sendmessage)
    app.get('/companyEmployee', function(req, res) {
        res.render('companyEmployee.ejs');
    });
    app.get('/changeadminpassword', function(req, res) {
        res.render('changeadminpassword.ejs');
    });

    app.get('/getCompanyEmployee/:companyId', adminLoggedIn, employeeCtrl.getCompanyEmployee);
    app.get('/getCompany/:companyId', adminLoggedIn, companyCtrl.getCompanyDetail);
    app.post('/changecompanyemployeeno', adminLoggedIn, companyCtrl.changecompanyemployeeno);
    app.post('/changecompanyemployeepassword', adminLoggedIn, companyCtrl.changecompanyemployeepassword);
    app.post('/changecompanyemployeepin', adminLoggedIn, companyCtrl.changecompanyemployeepin);
    app.post('/changecompanyemployeeemail', adminLoggedIn, companyCtrl.changecompanyemployeeemail);

    app.get('/report', isLoggedIn, function(req, res) {
        res.render('report.ejs');
    });
    app.get('/getPayperiod', isLoggedIn, reportCtrl.getPayperiod);
    app.get('/getPayperiodSession', isLoggedIn, reportCtrl.getPayperiodSession);

    app.get('/employeelistpage', isLoggedIn, function(req, res) {
        res.render('employeereport.ejs');
    });
    app.get('/getemployeereport/:from/:to', isLoggedIn, reportCtrl.getemployeereport);

    app.get('/daycardpaytime', isLoggedIn, function(req, res) {
        res.render('daycardpaytime.ejs');
    });

    app.get('/daycardstandard', isLoggedIn, function(req, res) {
        res.render('daycardstandard.ejs');
    });
    app.get('/daycardstandardA4', isLoggedIn, function(req, res) {
        res.render('daycardstandardA4.ejs');
    });

    app.get('/currentCheckin', employeeCtrl.currentCheckin);
    app.get('/getemployeeshiftdata/:shift/:shiftType', isLoggedIn, employeeCtrl.getemployeeshiftdata);
    app.get('/publicholidays', isLoggedIn, function(req, res) {
        res.render('publicholidays.ejs');
    });

    app.get('/holidaysdata', isLoggedIn, function(req, res) { //load company data
        Holidays.find({
            'companyId': req.session.user
        }, function(err, user) {
            if (user) {
                res.json(user);
            }
        });
    });

    app.get('/attendanceExcel', employeeCtrl.attendanceExcel); //export attendance data
    app.get('/generateKeys', companyCtrl.generateKeys); // post staff timesheet data to job
    //app.get('/readmysqlData' , mysqlCtrl.readmysqlData)
    app.post('/createHoliday', isLoggedIn, reportCtrl.createHoliday);
    //app.get('/weeklyOt',cronCtrl.calculateWeeklyOt);
    app.post('/holidaysetting', isLoggedIn, companyCtrl.addHolidaysSettings);
    app.post('/sendFeedback', isLoggedIn, companyCtrl.sendFeedback);
    app.get('/checkmessage', isLoggedIn, companyCtrl.checkmessage);
    app.get('/messageconfirmation/:msgId', isLoggedIn, companyCtrl.confirmRead)
    app.get('/ca', attendanceCronCtrl.calculateAttendance);
    app.get('/newat', attendanceCronCtrl.newAttendance);

    app.get('/newatforcompany/:companyId/:date', attendanceCronCtrl.newatforcompany);
    app.get('/areashift', areaCtrl.areaShift);
    app.get('/weeklyOt', cronCtrl.calculateWeeklyOt);
    app.get('/shiftCutoffCal', cronCtrl.shiftCutoffCal)
    app.get('/areaCal', areaCtrl.areaCal)
    app.get('/cron', cronCtrl.readData)
    app.get('/area', areaCtrl.areaCal);
    /* app.get('/checkDaterange', areaCtrl.checkDaterange);*/
    /*app.get('/cron',cronCtrl.readData);
    app.get('/attendanceDataRead',cronCtrl.insertAttendanceData);
    app.get('/newat',attendanceCronCtrl.newAttendance);
    app.get('/weeklyOt',cronCtrl.calculateWeeklyOt);*/

    app.get('/iclock', areaCtrl.readClockData);
    //app.get('/clockMonitoring', areaCtrl.clockMonitoring);
    app.get('/sampleCompanies', areaCtrl.createSampleCompanies);
    app.get('/allCompanyData', adminLoggedIn, companyCtrl.allCompanyData)
    app.get('/changeEmployeeno/:companyId', companyCtrl.changeEmployeeno);
    app.get('/adminEmployeeNo', isLoggedIn, companyCtrl.adminEmployeeNo);
    app.get('/userData', isLoggedIn, employeeCtrl.userData);
    app.get('/changeCheckinType/:atnid/:checkinId', isLoggedIn, employeeCtrl.changeCheckinType);
    app.get('/applypayrollcode', companyCtrl.applypayrollcode);
    app.get('/changeweeklyot/:companyId/:date', companyCtrl.changeweeklyot);
    app.get('/changeweeklyot/all/:date', companyCtrl.changeweeklyot);
    app.get('/changeholiday/:companyId/:date', companyCtrl.changeholiday);
    app.get('/changeholiday/:companyId/:department/:date', companyCtrl.changeHolidayForDepartment);
    app.get('/changechecktype/:companyId', companyCtrl.changeChecktype);
    app.get('/changechecktype/all', companyCtrl.changeChecktype);
    app.get('/changeFlag', companyCtrl.changeFlag);
    app.get('/weeklyOtFlag', cronCtrl.calculateWeeklyOtRecal);
    app.get('/fetchNextYearHolidaysCron', cronCtrl.fetchNextYearHolidaysCron);
    app.get('/reloadclockings/:sn/:period', cronCtrl.reloadclockings);
    app.post('/deleteDepartment', companyCtrl.deleteDepartment);
    app.post('/deleteSubDepartment', companyCtrl.deleteSubDepartment);
    app.post('/changeTotalHours', employeeCtrl.changeTotalHours);
    app.get('/attendanceDataFetch/:attendanceId', employeeCtrl.attendanceDataFetch);
    app.get('/solveArea', companyCtrl.solveArea);
    app.get('/totalTracking/:period', scriptsCtrl.totalTracking);
    app.get('/matchCheckins/:sn/:period', cronCtrl.matchCheckins);
    // app.get('/matchCheckinsSql2/:sn/:period', cronCtrl.matchCheckinsSql2);
    // app.get('/matchCheckinsSql3/:sn/:period', cronCtrl.matchCheckinsSql3);
    app.get('/addcompanyname', scriptsCtrl.addcompanyname);
    app.get('/changePrv', scriptsCtrl.changePrv);
    //app.get('/checkweeklyTotal', areaCtrl.checkweeklyTotal)
    app.get('/totalTrackingCron', areaCtrl.totalTrackingCron);
    app.get('/totalTrackingWithAsync', areaCtrl.totalTrackingWithAsync);
    app.get('/totalRoundedTracking', areaCtrl.totalRoundedTracking);

    /*app.get('/changeweeklyfinish', scriptsCtrl.changeweeklyfinish)*/
    app.get('/deletecompany/:companyId', scriptsCtrl.deletecompany);
    app.get('/addPrvon', scriptsCtrl.addPrvon);
    app.get('/assignColor', scriptsCtrl.assignColor);
    app.get('/newDaysTracking', scriptsCtrl.newDaysTracking);
    app.get('/shiftDefault/:companyId', scriptsCtrl.setDefaultTimeInShifts);

    app.get('/setExport/:companyId/:date', scriptsCtrl.setFieldForAtn);
    app.post('/customNewDaysTracking', scriptsCtrl.customNewDaysTracking);

    app.get('/applyExccode', scriptsCtrl.applyExccode);

    app.get('/addcompanyreports', function(req, res) {
        res.render('addreports.ejs');
    });

    app.get('/addEmails', function(req, res) {
        res.render('addEmails.ejs');
    });

    app.get('/emailLists/:companyId', function(req, res) { //load company data
        emailalerts.find({
            'companyId': req.params.companyId
        }, function(err, emailList) {
            if (!err) {
                if (emailList.length > 0) {
                    res.json(emailList);
                } else {
                    Company.findOne({
                        _id: req.params.companyId
                    }, function(err, user) {
                        emailalerts.update({
                            'companyId': user._id,
                            emailType: 'Offline clock-Timecloud'
                        }, {
                            $set: {
                                companyId: user._id,
                                emailType: 'Offline clock-Timecloud'
                            },
                            $push: {
                                email: user.email
                            }
                        }, {
                            upsert: true,
                            new: false
                        }, function(err, emailalerts1) {
                            emailalerts.update({
                                'companyId': user._id,
                                emailType: 'TZAdj Changes-Timecloud'
                            }, {
                                $set: {
                                    companyId: user._id,
                                    emailType: 'TZAdj Changes-Timecloud'
                                },
                                $push: {
                                    email: user.email
                                }
                            }, {
                                upsert: true,
                                new: false
                            }, function(err, emailalerts2) {
                                emailalerts.update({
                                    'companyId': req.session.user,
                                    emailType: 'working alerts'
                                }, {
                                    $set: {
                                        companyId: user._id,
                                        emailType: 'working alerts'
                                    },
                                    $push: {
                                        email: user.email
                                    }
                                }, {
                                    upsert: true,
                                    new: false
                                }, function(err, emailalerts3) {
                                    emailalerts.find({
                                        'companyId': req.params.companyId
                                    }, function(err, emailList) {
                                        if (!err) {
                                            res.json(emailList);
                                        }
                                    });
                                });
                            });
                        });
                    });
                }
            }
        });
    });

    app.post('/addEmailsToDb', function(req, res) { //load company data
        emailalerts.update({
            'companyId': req.body.companyId,
            emailType: req.body.emailType
        }, {
            $set: {
                companyId: req.body.companyId,
                emailType: req.body.emailType
            },
            $push: {
                email: req.body.addEmails
            }
        }, {
            upsert: false,
            new: false
        }, function(err, emailalerts1) {
            res.json(true);
        });
    });
    app.post('/deleteEmailsFromDb', function(req, res) { //load company data
        emailalerts.update({
            'companyId': req.body.companyId,
            emailType: req.body.emailType
        }, {
            $set: {
                companyId: req.body.companyId,
                emailType: req.body.emailType
            },
            $pull: {
                email: req.body.removedEmail
            }
        }, {
            upsert: false,
            new: false
        }, function(err, emailalerts1) {
            res.json(true);
        });
    });
    app.get('/timetracking', function(req, res) {
        res.render('timetracking.ejs');
    });
    app.get('/newDaysTrackingPage', function(req, res) {
        res.render('newDaysTracking.ejs');
    });
    app.get('/customNewDaysTrackingPage', function(req, res) {
        res.render('customNewDaysTrackingPage.ejs');
    });
    app.get('/matchCheckins', function(req, res) {
        res.render('matchCheckins.ejs');
    });
    app.get('/copyDataBaseRoute', function(req, res) {
        res.render('copyDataBase.ejs');
    });

    app.get('/addreports/:companyId', reportCtrl.fetchReports)
    app.get('/getstandardreports/:companyId', reportCtrl.getstandardreports)
    app.post('/addcustomReport', reportCtrl.addcustomReport)
    app.post('/deleteCustomreports', reportCtrl.deleteCustomreports)
    app.post('/deletestdreports', reportCtrl.deletestdreports)
    app.post('/editreport', reportCtrl.editreport)
    app.post('/editstdreport', reportCtrl.editstdreport)
    app.get('/checkAuth/:employeeNo', companyCtrl.checkAuth);
    app.get('/forbidden', function(req, res) {
        res.render('forbidden.ejs');
    });
    app.get('/meterdashboard', function(req, res) {
        res.render('meterdashboard.ejs');
    });
    app.get('/getdahboardData/:start/:end', isLoggedIn, companyCtrl.getdashboardData);
    app.post('/getDateWiseRecord', isLoggedIn, companyCtrl.getDateWiseRecord);
    // app.get('/dashboardCalculation', cronCtrl.dashboardCalculation);
    // app.get('/meterDashboardCalculation', cronCtrl.meterDashboardCalculation);

    app.get('/createDashboardFromweekly', cronCtrl.createDashboardFromweekly);

    app.post('/allocateHours', companyCtrl.allocateHours);
    app.post('/allocateSubHours', companyCtrl.allocateSubHours);
    app.get('/postdata', employeeCtrl.postData); // post staff timesheet data to job
    app.get('/updateFlag', function(req, res) {
        var blankArray = [];
        Attendance.update({}, {
            $set: {
                readFlag: false,
                totalValues: blankArray,
                checkin: blankArray,
            }
        }, {
            upsert: false,
            new: false,
            multi: true
        }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.json(true)
            }
        })
    })

    /* Scripts */
    app.get('/setInType', scriptsCtrl.setInType);
    app.get("/createEmpNumbersinDb", scriptsCtrl.createEmpNumbersinDb);
    app.get("/checkEmpNumbersExistinDb", scriptsCtrl.checkEmpNumbersExistinDb);




    /*Mobile App Routes*/
    app.post('/employeeOwnData', employeeCtrl.employeeOwnData)
    app.post('/checkuserpin', employeeCtrl.checkuserpin);
    app.post('/getUserEmpdata', employeeCtrl.getUserdata);
    app.post('/userCurrentCheckin', employeeCtrl.userCurrentCheckin);
    app.post('/insertCheckins', employeeCtrl.insertCheckins);
    app.post('/checkPwd', employeeCtrl.checkPwd);
    app.post('/changeJobcode', employeeCtrl.changeJobcode);

    /*Project section Routes*/
    app.get('/project', isLoggedIn, function(req, res) { // redirect project
        res.render('project.ejs');
    });
    app.get('/projectDetail', isLoggedIn, function(req, res) { // redirect project
        res.render('projectDetail.ejs');
    });
    app.get('/employeesProject', isLoggedIn, function(req, res) { // redirect project
        res.render('employeesProject.ejs');
    });
    // app.post('/addJCInProject',isLoggedIn, projectCtrl.fetchprojectdata);
    app.get('/projectHome', isLoggedIn, function(req, res) { //redirect project home page
        res.render('projecthome.ejs');
    });
    app.post('/projectSearch', projectCtrl.projectSearch);
    app.get('/newproject', isLoggedIn, function(req, res) { //redirect to create project page
        res.render('newproject.ejs');
    });
    app.get('/editproject', isLoggedIn, function(req, res) { //redirect to edit project page
        res.render('editproject.ejs');
    });
    app.get('/archievedEditProject', isLoggedIn, function(req, res) {
        res.render('editArchievedProject.ejs');
    });
    app.get('/archievedProject', isLoggedIn, function(req, res) { //redirect to edit project page
        res.render('archievedProject.ejs');
    });
    app.post('/updateproject', projectCtrl.updateproject)
    app.get('/editproject/:projectId', projectCtrl.editproject)
    app.get('/projects', projectCtrl.getprojects);
    app.get('/projectsForHome', projectCtrl.getProjectsList);

    app.get('/getArchiveProjectDetail', projectCtrl.getArchivePojects);

    app.post('/createproject', projectCtrl.createproject)
    // app.get('/fetchprojectdata', projectCtrl.fetchprojectdata)
    app.get('/countTasktotals', projectCtrl.countTasktotals)
    app.get('/getArchievedProjectDetail/edit/:projectId', projectCtrl.archievedProjectEditData);
    app.get('/getProjectDetail', projectCtrl.getProjectDetail);
    app.post('/deleteProjectById', projectCtrl.deleteProjectById);
    app.get("/getProjectDetailEmpWise/:employeeNo", projectCtrl.getProjectDetailEmpWise);

    /*end project section*/



    app.get('/calculateWeeklyOtOfCompany/2w', isLoggedIn, function(req, res) {
        res.render("renderTimerPage.ejs");
    });

    /* delete duplicate day scripts for individual and all companies */
    app.get('/deleteDuplicateDays/:companyId/:date', scriptsCtrl.deleteDupCompanyData);
    app.get('/deleteAllDuplicateDays', scriptsCtrl.deleteAllDuplicateCompanyData);

    app.get('/assignTextToExceptionAssign', scriptsCtrl.assignTextToExceptionAssign);
    app.get('/weeklyOtFlagOfCompany', isLoggedIn, cronCtrl.calculateWeeklyOtOfCompany);
    // app.get('/HourlyWageOfCalculation',employeeCtrl.HourlyWageOfCalculation);

    //use this to delete duplicate record
    app.get('/createEmailAlertForExistingCompany/:companyId', scriptsCtrl.createEmailAlert);
    app.get('/createPeriods/:companyId', companyCtrl.createPeriods1); // create the period for the dashboard
    app.get('/createDashboardForMissing', companyCtrl.createDashboardForMissing); // create the period for the dashboard

    // autoCreateDashBoard

    app.get('/employeesShiftData', isLoggedIn, employeeCtrl.employeesShiftData);

    //app.get('/clearScheduleRows/:shift/:currentDate/:nextDate', isLoggedIn,employeeCtrl.clearScheduleRows);
    //app.get('/clearAllScheduleRows/:from/:to', isLoggedIn,employeeCtrl.clearAllScheduleRows);
    // 431064
    app.get('/createWeeklyOtPreviousPeriod/:companyId/:days', scriptsCtrl.weeklyOtPreviousPeriod);
    app.get('/createSchedulingBycompanyId/:companyId', scriptsCtrl.SechedulingBycompanyId);
    app.post('/deleteHoliDaysForAll', isLoggedIn, employeeCtrl.deleteHoliDaysForAll);
    app.post('/deleteHolidayOfEmployee', isLoggedIn, employeeCtrl.deleteHolidayOfEmployee);
    app.post('/saveShiftOrder', isLoggedIn, shiftCtrl.saveShiftOrder); //shift order saved
    app.get('/readWriteForEmployee/:companyId/:employeeNo', scriptsCtrl.readWriteForEmployee);
    app.post('/confirmTimeAddingByAdmin', isLoggedIn, employeeCtrl.confirmTimeAddingByAdmin);
    app.get('/getAllEmployeeData', isLoggedIn, employeeCtrl.getAllEmployeeData);
    app.get('/getAllEmployeeData/:fromDate/:toDate', isLoggedIn, employeeCtrl.getAllByDateEmployeeData);
    app.get('/getAllEmployeeData/:employeeNo/:fromDate/:toDate', isLoggedIn, employeeCtrl.getAllByEmpNoEmployeeData);
    app.get('/getSchedulingDetails', isLoggedIn, employeeCtrl.getSchedulingDetails);
    app.post('/shiftChangeScheduling', isLoggedIn, employeeCtrl.shiftChangeScheduling);
    // app.get('/getSchedulingNextDetails/:fromDate/:toDate',isLoggedIn,employeeCtrl.schedulingBetweenDetails);
    app.get('/getSchedulingDetailsNext/:date', isLoggedIn, employeeCtrl.schedulingDetailsNext);
    app.get('/changeTheEmployeeNumber/:companyId', scriptsCtrl.changeTheEmployeeNo);
    app.get('/assignFirstAdminUserToMainAdmin', scriptsCtrl.assignFirstAdminUserToMainAdmin);
    app.get('/createemployeeRecord/:companyId/:employeeNo', scriptsCtrl.createemployeeRecord);
    // app.get('/createDays/:companyId', attendanceCronCtrl.newAttendance);
    app.post('/getAttendanceDetail', isLoggedIn, function(req, res) {
        global.datesArray = [];
        var startDate1 = Moment.utc(req.body.fromDate).format('YYYY-MM-DD');
        var endDate1 = Moment.utc(req.body.toDate).format('YYYY-MM-DD');;
        while (startDate1 <= endDate1) {
            var dates = new Date(startDate1);
            datesArray.push(dates);
            startDate1 = Moment.utc(startDate1).add('days', 1).format('YYYY-MM-DD');
        }

        if (req.session.subadmin) {
            // console.log("if:.."+req.session.subadmin);
            Attendance.find({
                'department': {
                    $in: req.session.subadmin
                },
                active: true,
                'companyId': req.session.user,
                "date": {
                    $gte: new Date(req.body.fromDate),
                    $lte: new Date(req.body.toDate)
                }
            }).exec(function(err, attendanceData) {
                res.json({
                    datesArray: datesArray,
                    attendanceData: attendanceData
                });
            });
        } else {
            // console.log("else:.."+req.session.subadmin);
            Attendance.find({
                active: true,
                'companyId': req.session.user,
                "date": {
                    $gte: new Date(req.body.fromDate),
                    $lte: new Date(req.body.toDate)
                }
            }).exec(function(err, attendanceData) {
                res.json({
                    datesArray: datesArray,
                    attendanceData: attendanceData
                });
            });
        }
    });

    app.get('/updateTheHourlyRateOfEmployeeInAttendance/:companyId', scriptsCtrl.updateTheHourlyRateOfEmployeeInAttendance);
    app.get('/addLattitudeAndLongitude/:companyId/:startDate/:endDate', scriptsCtrl.addLattitudeAndLongitude);

    // app.post("/budgetedSaleSave", companyCtrl.budgetedSaleSave);
    // app.post("/actualSaleSave", companyCtrl.actualSaleSave);
    // app.post("/budgetedDeptSaleSave", companyCtrl.budgetedDeptSaleSave);
    // app.post("/actualDeptSaleSave", companyCtrl.actualDeptSaleSave);

    app.post("/budgetedSubDeptSaleSave", companyCtrl.budgetedSubDeptSaleSave);
    app.post("/actualSubDeptSaleSave", companyCtrl.actualSubDeptSaleSave);
    app.post('/sendMailToEmployees', function(req, res) {
        // console.log("sendMailToEmployees...........");
        // console.log(req.body);
        // res.json(true);
        var startDate = req.body.fromDate;
        var endDate = req.body.toDate;
        startDate = Moment.utc(startDate).format('DD-MM-YYYY');
        endDate = Moment.utc(endDate).format('DD-MM-YYYY');
        var subject = 'Roster payperiod for ' + startDate + ' to ' + endDate;
        var body = req.body.htmlBody;
        // barnie@tme.co.nz
        emailfn.send_mail1('barnie@tme.co.nz', subject, body, function(output) {
            res.json(true);
        });
        /*Dont remove it.. it is actual code*/
        /*if(req.body.department) {
          employee.find({companyId:req.session.user,department:req.body.department,active:true},function(err,empDetail){
            var cnt = 0;
            var subject = 'Roster payperiod for '+startDate+' to '+endDate;
            var  body    = req.body.htmlBody;
            async.eachSeries(empDetail, function(empMail, callback){
              cnt++;
              if(empMail.email) {
                emailfn.send_mail1(empMail.email,subject,body,function(output) {
                });
                if(cnt == empDetail.length) {
                  res.json(true);
                }
                callback();
              } else {
                callback();
              }
            });
          });
        } else {
          employee.find({companyId:req.session.user,active:true},function(err,empDetail){
            var cnt = 0;
            var subject = 'Roster payperiod for '+startDate+' to '+endDate;
            var  body    = req.body.htmlBody;
            async.eachSeries(empDetail, function(empMail, callback){
              cnt++;
              emailfn.send_mail(empMail.email,subject,body,function(output) {
              });
              if(cnt == empDetail.length) {
                res.json(true);
              } else
                callback();
            });
          });
      }*/
    });
    app.post("/updateCompanyDetail", companyCtrl.updateCompanyDetail);
    app.get("/changeTheCustomReportLink", scriptsCtrl.changeTheCustomReportLink);
    app.post("/copySchedulingToNextPeriod", employeeCtrl.copySchedulingToNextPeriod);
    app.post("/backUpTheDb", companyCtrl.backUpTheDb);
    app.get("/getTheParentDeptName", scriptsCtrl.getTheParentDeptName);
    app.get('/resetThemongoDbConnection', cronCtrl.resetThemongoDbConnection);
    app.get("/getReportIp", function(req, res) {
        console.log("getReportIp......");
        SuperAdmin.find({}, function(err, reporIPDetail) {
            res.json({
                reportIp: reporIPDetail[0].reportIP
            });
        });
    });
    app.post("/saveReportIP", function(req, res) {
        SuperAdmin.update({}, {
            $set: {
                reportIP: req.body.reportIP
            }
        }, {
            update: false,
            new: false
        }, function(err, data) {
            res.json(true);
        })
    });
    app.post('/customShift', isLoggedIn, shiftCtrl.customShiftcreate);

    app.post('/displayDashboardAcrodingNeed', companyCtrl.displayDashboardAcrodingNeed);
    app.post("/copyRosterToNextPeriod", employeeCtrl.copySchedulingToNextPeriod);
    app.get("/replaceCustomShiftIdWithName", scriptsCtrl.replaceCustomShiftIdWithName);

    app.get("/reloadClockingsForDay/:company/:date", cronCtrl.reloadClockingsForDay);
    app.get("/reloadClockingsForEmployee/:company/:employeeNo/:date", cronCtrl.reloadClockingsForEmployee);

    app.get("/changeChekingTypeForProject", scriptsCtrl.changeChekingTypeForProject);
    app.get('/isloggedin', function(req, res) {
        if (req.session.user) {
            if (req.session.loginTime) {
                var currentTime = Moment().format('hh:mm:ss');
                var diff = empFn.getSeconds(currentTime) - empFn.getSeconds(req.session.loginTime);
                if (diff < 14400) {
                    req.session.loginTime = Moment().format('hh:mm:ss');
                    res.json(true)
                } else {
                    res.clearCookie('user');
                    req.session.destroy();
                    res.json(false)
                }
            } else {
                res.json(true)
            }
        } else {
            res.json(false)
        }
    });
}

// route middleware to make sure superadmin user is logged in
function adminLoggedIn(req, res, next) {
    if (req.session.admin) {
        return next();
        res.json(true)
    } else {
        res.redirect('/');
    }
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // console.log("check session.......");
    // console.log(req.session);
    if (req.session.user) {
        if (req.session.loginTime) {
            var currentTime = Moment().format('hh:mm:ss');
            var diff = empFn.getSeconds(currentTime) - empFn.getSeconds(req.session.loginTime);
            // console.log(diff + 'diff');

            if (diff < 14400) {
                req.session.loginTime = Moment().format('hh:mm:ss');
                return next();
                res.json(true)
            } else {
                res.clearCookie('user');
                req.session.destroy();
                res.redirect('/');
            }
        } else {
            return next();
            res.json(true)
        }
    } else {
        if (req.header('Authorization')) {
            console.log('autho');
            return next();
        } else {
            console.log('auth empty');
            res.redirect('/');
        }
    }
    // if they aren't redirect them to the home page
}
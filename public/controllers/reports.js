var report = angular.module('report', ['ngRoute', 'ngSanitize', 'ui.bootstrap']);

report.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/reports/', {
            controller: 'reportController',
            templateUrl: '/report',
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                ReportIp: ['$http', '$route', function($http, $route) {
                    return $http({
                        method: 'get',
                        url: '/getReportIp'
                    });
                }]
            }
        })
        .when('/employeelist/:from/:to', {
            controller: 'employeeListController',
            templateUrl: '/employeelistpage'
        })
        .when('/daycardpaytime/:from/:to', {
            controller: 'daycardpaytimeController',
            templateUrl: '/daycardpaytime'
        })
        .when('/daycardstandard/:from/:to', {
            controller: 'daycardstandardController',
            templateUrl: '/daycardstandard'
        })
        .when('/daycardstandardA4/:from/:to', {
            controller: 'daycardstandardA4Controller',
            templateUrl: '/daycardstandardA4'
        })
        .when('/holidays', {
            controller: 'holidaysController',
            templateUrl: '/publicholidays'
        })
});

report.run(function($rootScope, $location, $http) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        $http.get('/isloggedin').success(function(data) {
            if (data == 'false') {
                location.reload();
            }
        });
    });
});

report.controller('reportController', function(ReportIp, $scope, $http, $location) {
    $scope.reportsIp = ReportIp.data.reportIp;
    $scope.departments = [];
    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.employeeList = data;
        }
    });
    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1,
        'show-weeks': false,
        'showTimezone': true,
    };
    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];

    $http.get("/getPayperiodSession").success(function(data) {
        if (data) {
            $scope.days = data.days
            $scope.fromDate = data.start;
            $scope.toDate = moment(data.end).subtract('days', 1).format('YYYY-MM-DD');
            $scope.currentDate = data.start;
            $scope.nextPeriod = moment(data.end).subtract('days', 1).format('YYYY-MM-DD');
            $scope.currentDate = moment.utc($scope.currentDate).format('YYYY-MM-DD');
        }
    });
    $http.get('/companydata').success(function(data) {
        if (data) {
            if (data.IsEnableReportSystem1) {
                $scope.showReportSystem1 = data.IsEnableReportSystem1;
            }
            if (data.departments && data.isdepartments) {
                $http.get('/checkadminDept').success(function(deptList) {
                    if (deptList != 'false') {
                        var result = [];
                        var cnt = 0;
                        deptList.forEach(function(key) {
                            cnt++;
                            data.departments.filter(function(item) {
                                if (item.name == key) {
                                    result.push(item);
                                }
                            });
                            if (cnt == deptList.length) {
                                $scope.departmentsList = result;
                            }
                        })
                    } else {
                        $scope.departmentsList = data.departments;
                    }
                });
            }
            $scope.companyid = data._id;
            if (data.tooltipDelayTime) {
                $scope.delayTime = data.tooltipDelayTime;
            }
            if (data.ispayroll) {
                $scope.payrollExport = true;
                if (data.payrollSystem == 'Ace') {
                    $scope.Ace = true;
                }
                if (data.payrollSystem == 'MYOB') {
                    $scope.MYOB = true;
                }
                if (data.payrollSystem == 'IMS') {
                    $scope.IMS = true;
                }
                if (data.payrollSystem == 'Ipayroll') {
                    $scope.Ipayroll = true;
                }
                if (data.payrollSystem == 'Datacom') {
                    $scope.Datacom = true;
                }
                if (data.payrollSystem == 'FivestarPayroll') {
                    $scope.FivestarPayroll = true;
                }
                if (data.payrollSystem == 'MYOBEXO') {
                    $scope.MYOBEXO = true;
                }
                if (data.payrollSystem == 'Crystal') {
                    $scope.Crystal = true;
                }
            }

            $http.get('/addreports/' + $scope.companyid).success(function(data) {
                if (data != 'false') {
                    $scope.customReport = true;
                    $scope.CustomreportsData = data.reportData;
                }
            });

            /*$http.get('/getstandardreports/'+ $scope.companyId).success(function(data){       
              if(data != 'false'){
                $scope.standardreport = true;
                $scope.standardreportsData = data.reportData;
               }
            });*/
        }
    });

    $scope.resetLinks = function() {
        var checkboxes = [];
        var stringEmp = '';
        var inputElements = document.getElementsByName('employeenumbers');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkboxes.push(inputElements[i].value);
                var tempArry = '';
                if (stringEmp != '') {
                    stringEmp = stringEmp + ",";
                }
                tempArry = "[" + inputElements[i].value + "]";
                stringEmp = stringEmp + tempArry;
            }
            if (i == inputElements.length - 1) {
                $scope.empNo = stringEmp;
            }
        }
    }

    $scope.searchDate = function(fromDate, toDate) {
        if (fromDate && toDate) {
            $scope.currentDate = moment(fromDate).format('YYYY-MM-DD');
            $scope.nextPeriod = moment(toDate).format('YYYY-MM-DD');
            $http.get('/addreports/' + $scope.companyid).success(function(data) {
                if (data != 'false') {
                    $scope.customReport = true;
                    $scope.CustomreportsData = data.reportData;
                }
            });
        }
    }

    $scope.currentPeriod = function() {
        $http.get("/getPayperiod").success(function(data) {
            if (data) {
                $scope.fromDate = data.start;
                $scope.toDate = data.end;
                $scope.currentDate = data.start;
                $scope.nextPeriod = data.end;
            }
        });
    }

    $scope.nextPeriodFn = function() {
        $scope.currentDate = moment.utc($scope.nextPeriod).add(1, 'days').format('YYYY-MM-DD');
        $scope.nextPeriod = moment.utc($scope.currentDate).add(($scope.days - 1), 'days').format('YYYY-MM-DD');
        $scope.fromDate = $scope.currentDate;
        $scope.toDate = $scope.nextPeriod;

        $http.get('/addreports/' + $scope.companyid).success(function(data) {
            if (data != 'false') {
                $scope.customReport = true;
                $scope.CustomreportsData = data.reportData;
            }
        });
    }

    $scope.prvPeriodFn = function() {
        $scope.nextPeriod = moment.utc($scope.currentDate).subtract(1, 'days').format('YYYY-MM-DD');
        $scope.currentDate = moment.utc($scope.currentDate).subtract($scope.days, 'days').format('YYYY-MM-DD');
        $scope.fromDate = $scope.currentDate;
        $scope.toDate = $scope.nextPeriod;
        $http.get('/addreports/' + $scope.companyid).success(function(data) {
            if (data != 'false') {
                $scope.customReport = true;
                $scope.CustomreportsData = data.reportData;
            }
        });
    }
    $scope.selectRecordByDepartmentName = function(id, deptName) {
        var str = deptName.replace(/\s+/g, '');
        if (document.getElementById(id).checked == true) {
            $('.' + str).each(function() {
                this.checked = true;
            });
        } else {
            $('.' + str).each(function() {
                this.checked = false;
            });
        }
        var checkboxes = [];
        var stringEmp = '';
        var inputElements = document.getElementsByName('employeenumbers');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkboxes.push(inputElements[i].value);
                var tempArry = '';
                if (stringEmp != '') {
                    stringEmp = stringEmp + ",";
                }
                tempArry = "[" + inputElements[i].value + "]";
                stringEmp = stringEmp + tempArry;
            }
            if (i == inputElements.length - 1) {
                // console.log(stringEmp);
                $scope.empNo = stringEmp;
            }
        }
    };
});

report.filter('removeSpacesFromDept', function() {
    return function(text) {
        var str = text.replace(/\s+/g, '');
        return str;
    };
});

report.controller('employeeListController', function($scope, $http, $location, $routeParams) {
    $http.get('/companydata').success(function(data) {
        if (data) {
            if (data.tooltipDelayTime) {
                $scope.delayTime = data.tooltipDelayTime;
            }
            if (data.companyname) {
                $scope.companyname = data.companyname
            }
        }
    });
    $scope.start = $routeParams.from;
    $scope.end = $routeParams.to;
    $http.get("/getemployeereport/" + $routeParams.from + "/" + $routeParams.to).success(function(data) {
        if (data) {
            $scope.employeeDataArray = [];
            $scope.Totaltime = 0;
            $scope.normalTimeTotal = 0;
            if (data.employeeData) {
                data.employeeData.forEach(function(emp) {
                    var employeeNo = emp.employeeNo;
                    var department = emp.department;
                    var firstName = emp.firstName;
                    var lastName = emp.lastName;
                    var attendanceDatas = [];
                    var normalTime = 0;
                    var totalRounded = 0;
                    data.attendanceData.forEach(function(datas) {
                        datas.forEach(function(d) {
                            if (d.employeeNo == emp.employeeNo) {
                                var nt = '00:00:00';
                                if (d.normalTime) {
                                    nt = d.normalTime;
                                    //
                                }
                                if (d.totalRounded) {
                                    totalRounded += getSeconds(d.totalRounded)
                                }
                                normalTime += getSeconds(nt)
                            }
                        });
                    });
                    if (employeeNo) {
                        $scope.Totaltime += totalRounded;
                        $scope.normalTimeTotal += normalTime;
                        $scope.employeeDataArray.push({
                            'employeeNo': employeeNo,
                            'firstName': firstName,
                            'lastName': lastName,
                            'normalTime': secToFormatted(normalTime),
                            'TotalAdjs': secToFormatted(totalRounded)
                        })
                    }
                });
            }
            $scope.Totaltime = secToFormatted($scope.Totaltime);
            $scope.normalTimeTotal = secToFormatted($scope.normalTimeTotal);
            //console.log(normalTimeTotal);
        }
    });
});
report.controller('daycardpaytimeController', function($scope, $http, $location, $routeParams) {

    $http.get('/companydata').success(function(data) {
        if (data) {
            if (data.tooltipDelayTime) {
                $scope.delayTime = data.tooltipDelayTime;
            }
            if (data.companyname) {
                $scope.companyname = data.companyname
            }
        }
    });
    $scope.start = $routeParams.from;
    $scope.end = $routeParams.to;
    $http.get("/getemployeereport/" + $routeParams.from + "/" + $routeParams.to).success(function(data) {
        if (data) {
            $scope.employeeDataArray = [];
            $scope.Totaltime = 0;
            $scope.normalTimeTotal = 0;
            //$scope.attendanceData = '';
            $scope.attendanceData = '';
            $scope.reportData = [];
            $scope.employeeData = [];
            if (data.employeeData) {

                //= data.employeeData;      
                data.employeeData.forEach(function(emp) {
                    var employeeNo = emp.employeeNo;
                    var department = emp.department;
                    var firstName = emp.firstName;
                    var lastName = emp.lastName;
                    var attendanceDatas = [];
                    var normalTime = 0;
                    var totalRounded = 0;
                    var attendanceDates = [];
                    var totalRounded = 0;

                    data.attendanceData.forEach(function(datas) {
                        datas.forEach(function(d) {
                            if (d.employeeNo == emp.employeeNo) {
                                var definedColor = '';
                                if (d.holiday == true) {
                                    definedColor = {
                                        color: 'red'
                                    };
                                }
                                var dateOfAtn = moment.utc(d.date).format('YYYY-MM-DD');
                                var weekday = moment.utc(d.date).format('dddd');
                                var inAdjusted = '';
                                var outAdjusted = '';
                                var n = 1;
                                if (d.totalRounded) {
                                    totalRounded += getSeconds(d.totalRounded)
                                }
                                if (d.checkin) {
                                    d.checkin.sort(orderByTimeAscending);
                                    d.checkin.forEach(function(checkin) {
                                        var checkType = checkin.checkType;

                                        if (checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I') {
                                            if (n == 1) {
                                                inAdjusted = checkin.inAdjusted;
                                            } else {
                                                inAdjusted = '';
                                            }
                                        } else {
                                            if (n == (d.checkin.length)) {
                                                outAdjusted = checkin.outAdjusted;
                                            } else {
                                                outAdjusted = '';
                                            }
                                        }
                                        n++;

                                        if (n == d.checkin.length) {

                                        }
                                    });
                                }
                                if (inAdjusted) {
                                    inAdjusted = moment.utc(inAdjusted).format('HH:mm:ss');
                                } else {
                                    inAdjusted = '00:00:00';
                                }

                                if (outAdjusted) {
                                    outAdjusted = moment.utc(outAdjusted).format('HH:mm:ss');
                                } else {
                                    outAdjusted = '00:00:00';
                                }
                                attendanceDates.push({
                                    '_id': d._id,
                                    'shift': d.shift,
                                    'date': dateOfAtn,
                                    'weekday': weekday,
                                    'employeeNo': d.employeeNo,
                                    'Totaltime': d.totalRounded,
                                    'shiftStart': d.shiftStart,
                                    'shiftFinish': d.shiftFinish,
                                    'inAdjusted': inAdjusted,
                                    'outAdjusted': outAdjusted,
                                    'definedColor': definedColor
                                });
                            }
                        });
                        $scope.attendanceData = datas;
                    });

                    if (employeeNo) {
                        function orderByDateAscending(a, b) {
                            if (a.date == b.date) {
                                return 0;
                            } else if (a.date > b.date) {
                                return 1;
                            }
                            return -1;
                        }

                        attendanceDates.sort(orderByDateAscending);
                        $scope.reportData.push({
                            'employeeNo': employeeNo,
                            'attendanceDates': attendanceDates
                        })
                        $scope.employeeData.push({
                                'employeeNo': employeeNo,
                                'firstName': firstName,
                                'lastName': lastName,
                                'TotalAdjs': secToFormatted(totalRounded)
                            })
                            /* $scope.totalData.push({
                               'employeeNo':employeeNo,
                               
                             });*/
                    }
                });
            }
        }
    });
});

report.controller('daycardstandardController', function($scope, $http, $location, $routeParams) {
    $scope.myStyle = 'red';
    // console.log($scope.myStyle);
    $http.get('/companydata').success(function(data) {
        if (data) {
            if (data.tooltipDelayTime) {
                $scope.delayTime = data.tooltipDelayTime;
            }
            if (data.companyname) {
                $scope.companyname = data.companyname
            }
            if (data.isovertime) {
                $scope.ot = true;
            }
        }
    });
    $scope.start = $routeParams.from;
    $scope.end = $routeParams.to;
    $http.get("/getemployeereport/" + $routeParams.from + "/" + $routeParams.to).success(function(data) {
        if (data) {
            $scope.employeeDataArray = [];
            $scope.Totaltime = 0;
            $scope.normalTimeTotal = 0;
            //$scope.attendanceData = '';
            $scope.attendanceData = '';
            $scope.reportData = [];
            $scope.employeeData = [];
            // console.log($scope.attendanceData + 'as');
            if (data.employeeData) {

                //= data.employeeData;      
                data.employeeData.forEach(function(emp) {
                    var employeeNo = emp.employeeNo;
                    var department = emp.department;
                    var firstName = emp.firstName;
                    var lastName = emp.lastName;
                    var attendanceDatas = [];
                    var normalTime = 0;
                    var totalRounded = 0;
                    var attendanceDates = [];
                    var totalRounded = 0;
                    var normalTimeTotal = [];
                    var overTime1Total = [];
                    var overTime2Total = [];
                    $scope.normalTime = 0;
                    $scope.overTime1 = 0;
                    $scope.overTime2 = 0;

                    var n = 0;
                    var R = 1;
                    var checkBoxid = 1;
                    var week = 0;
                    var weekNT = 0;
                    $scope.weekNTArray = [];

                    data.attendanceData.forEach(function(datas) {
                        datas.forEach(function(d) {
                            if (d.employeeNo == emp.employeeNo) {
                                var definedColor = '';
                                if (d.holiday == true) {
                                    definedColor = {
                                        color: 'red'
                                    };
                                }
                                var dateOfAtn = moment.utc(d.date).format('YYYY-MM-DD');
                                var weekday = moment.utc(d.date).format('dddd');
                                var inAdjusted = '';
                                var outAdjusted = '';
                                var n = 1;
                                if (d.totalRounded) {
                                    totalRounded += getSeconds(d.totalRounded)
                                }
                                var nextOrder = [];
                                var checkin = [];
                                var h = 0;
                                var TotalArray = [];
                                //var h = 0;
                                if (d.checkin) {
                                    d.checkin.sort(orderByTimeAscending);
                                    $.each(d.checkin, function(j, checkinValue) {
                                        var checkTime = new Date(Date.parse(checkinValue.checkTime)).toUTCString();
                                        var checkType = checkinValue.checkType;
                                        var checkTimeSet = moment.utc(checkTime).format('HH:mm');
                                        var workCode = checkinValue.workCode;
                                        var id = checkinValue._id;
                                        //alert(checkTimeSet);
                                        if (checkType == "O" || checkType == "o") {
                                            checkType = 0;
                                        }
                                        if (checkType == "i" || checkType == "I") {
                                            checkType = 1;
                                        }
                                        if (checkType == '1') {
                                            if (isInArray(parseInt(0, 3), nextOrder)) {
                                                checkin.push({
                                                    'checktype': '',
                                                    'label': 'Out'
                                                });
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'In'
                                                });
                                                nextOrder.push(0);
                                                nextOrder.push(3);
                                            } else if ((d.checkin.length - 1) == j) {
                                                var firstIn = checkTimeSet;
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'In'
                                                });
                                                checkin.push({
                                                    'checktype': '',
                                                    'label': 'Out',
                                                });
                                                nextOrder.push(0);
                                                nextOrder.push(3);
                                            } else {
                                                var firstIn = checkTimeSet;
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'In'
                                                });
                                                n++;
                                                nextOrder.push(0);
                                                nextOrder.push(3);
                                            }
                                        }
                                        var flag = 0;
                                        if (isInArray(parseInt(checkType), nextOrder)) {
                                            var Total = '';
                                            var totalAdjusted = '';
                                            if (TotalArray.length > 0 && h < TotalArray.length) {
                                                Total = TotalArray[h].total,
                                                    totalAdjusted = TotalArray[h].totalAdjusted
                                            }
                                            if (checkType == '0' || checkType == '3') {
                                                //objectId += ':'+id;
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'Out',
                                                });
                                                nextOrder.length = 0;
                                                nextOrder.push(2);
                                                flag = 1;
                                                h++;

                                            }
                                            if (checkType == '2') {
                                                if ((d.checkin.length - 1) == j) {
                                                    checkin.push({
                                                        'checktype': checkTimeSet,
                                                        'label': 'In'
                                                    });
                                                    checkin.push({
                                                        'checktype': '',
                                                        'label': 'Out'
                                                    });
                                                    nextOrder.length = 0;
                                                    nextOrder.push(0);
                                                    nextOrder.push(3);
                                                    flag = 1;
                                                } else {
                                                    checkin.push({
                                                        'checktype': checkTimeSet,
                                                        'label': 'In'
                                                    });
                                                    nextOrder.length = 0;
                                                    nextOrder.push(0);
                                                    nextOrder.push(3);
                                                    flag = 1;
                                                }
                                            }
                                        }

                                        if (checkType == '2' && flag == 0) {
                                            checkin.push({
                                                'checktype': '',
                                                'label': 'Out'
                                            });
                                            objectId = '';
                                            checkin.push({
                                                'checktype': checkTimeSet,
                                                'label': 'In'
                                            });
                                            nextOrder.length = 0;
                                            nextOrder.push(0);
                                            nextOrder.push(3);
                                            flag = 1;
                                        }
                                        if (checkType == '3' && flag == 0) {
                                            var Total = '';
                                            var totalAdjusted = '';
                                            if (TotalArray.length > 0 && h < TotalArray.length) {
                                                Total = TotalArray[h].total,
                                                    totalAdjusted = TotalArray[h].totalAdjusted
                                            }
                                            checkin.push({
                                                'checktype': '',
                                                'label': 'In'
                                            });
                                            checkin.push({
                                                'checktype': checkTimeSet,
                                                'label': 'Out',
                                            });

                                            nextOrder.length = 0;
                                            nextOrder.push(2);
                                            flag = 1;
                                            h++;
                                        }
                                        if (checkType == '0' && flag == 0) {
                                            var Total = '';
                                            var totalAdjusted = '';

                                            if (TotalArray.length > 0 && h < TotalArray.length) {
                                                Total = TotalArray[h].total,
                                                    totalAdjusted = TotalArray[h].totalAdjusted
                                            }
                                            checkin.push({
                                                'checktype': '',
                                                'label': 'In'
                                            });
                                            checkin.push({
                                                'checktype': checkTimeSet,
                                                'label': 'Out'
                                            });
                                            nextOrder.length = 0;
                                            nextOrder.push(2);
                                            flag = 1;
                                            h++;
                                        }
                                    });
                                    /*$.each(d.checkin, function(j, itemCheckin) { 

                                    });*/
                                } else {
                                    checkin.push({
                                        'firstIn': '',
                                        'lastout': '',
                                        'In1': '',
                                        'Out1': '',
                                        'In2': '',
                                        'Out2': ''
                                    })
                                }
                                //console.log(checkin);
                                var normalTime = '00:00:00';
                                var OT1 = '00:00:00';
                                var OT2 = '00:00:00';
                                if (d.normalTime) {
                                    normalTime = d.normalTime
                                }
                                var normalTime = '00:00:00';
                                if (d.ot1Rule) {
                                    OT1 = d.ot1Rule;
                                }
                                var normalTime = '00:00:00';
                                if (d.ot2Rule) {
                                    OT2 = d.ot2Rule
                                }
                                attendanceDates.push({
                                    '_id': d._id,
                                    'shift': d.shift,
                                    'date': dateOfAtn,
                                    'weekday': weekday,
                                    'employeeNo': d.employeeNo,
                                    'Totaltime': d.totalRounded,
                                    'NT': normalTime,
                                    'OT1': OT1,
                                    'OT2': OT2,
                                    'checkinData': checkin,
                                    'definedColor': definedColor
                                });
                            }
                        });
                        $scope.attendanceData = datas;
                    });

                    if (employeeNo) {
                        function orderByDateAscending(a, b) {
                            if (a.date == b.date) {
                                return 0;
                            } else if (a.date > b.date) {
                                return 1;
                            }
                            return -1;
                        }

                        attendanceDates.sort(orderByDateAscending);
                        $scope.reportData.push({
                            'employeeNo': employeeNo,
                            'attendanceDates': attendanceDates
                        })
                        $scope.employeeData.push({
                                'employeeNo': employeeNo,
                                'firstName': firstName,
                                'lastName': lastName,
                                'TotalAdjs': secToFormatted(totalRounded)
                            })
                            /* $scope.totalData.push({
                               'employeeNo':employeeNo,
                               
                             });*/
                    }
                });
            }
            //console.log($scope.attendanceData+'sdf');
        }

    });
});
//daycardstandardA4Controller

report.controller('daycardstandardA4Controller', function($scope, $http, $location, $routeParams) {
    $scope.myStyle = 'red';
    // console.log($scope.myStyle);
    $http.get('/companydata').success(function(data) {
        if (data) {
            if (data.tooltipDelayTime) {
                $scope.delayTime = data.tooltipDelayTime;
            }
            if (data.companyname) {
                $scope.companyname = data.companyname
            }
            if (data.isovertime) {
                $scope.ot = true;
            }
        }
    });
    $scope.start = $routeParams.from;
    $scope.end = $routeParams.to;
    $http.get("/getemployeereport/" + $routeParams.from + "/" + $routeParams.to).success(function(data) {
        if (data) {
            $scope.employeeDataArray = [];
            $scope.Totaltime = 0;
            $scope.normalTimeTotal = 0;
            //$scope.attendanceData = '';
            $scope.attendanceData = '';
            $scope.reportData = [];
            $scope.employeeData = [];
            // console.log($scope.attendanceData + 'as');
            if (data.employeeData) {

                //= data.employeeData;      
                data.employeeData.forEach(function(emp) {
                    var employeeNo = emp.employeeNo;
                    var department = emp.department;
                    var firstName = emp.firstName;
                    var lastName = emp.lastName;
                    var attendanceDatas = [];
                    var normalTime = 0;
                    var totalRounded = 0;
                    var attendanceDates = [];
                    var totalRounded = 0;
                    var normalTimeTotal = [];
                    var overTime1Total = [];
                    var overTime2Total = [];
                    $scope.normalTime = 0;
                    $scope.overTime1 = 0;
                    $scope.overTime2 = 0;

                    var n = 0;
                    var R = 1;
                    var checkBoxid = 1;
                    var week = 0;
                    var weekNT = 0;
                    $scope.weekNTArray = [];

                    data.attendanceData.forEach(function(datas) {
                        datas.forEach(function(d) {
                            if (d.employeeNo == emp.employeeNo) {
                                var definedColor = '';
                                if (d.holiday == true) {
                                    definedColor = {
                                        color: 'red'
                                    };
                                }
                                var dateOfAtn = moment.utc(d.date).format('YYYY-MM-DD');
                                var weekday = moment.utc(d.date).format('dddd');
                                var inAdjusted = '';
                                var outAdjusted = '';
                                var n = 1;
                                if (d.totalRounded) {
                                    totalRounded += getSeconds(d.totalRounded)
                                }
                                var nextOrder = [];
                                var checkin = [];
                                var h = 0;
                                var TotalArray = [];
                                //var h = 0;
                                if (d.checkin) {
                                    d.checkin.sort(orderByTimeAscending);
                                    $.each(d.checkin, function(j, checkinValue) {
                                        var checkTime = new Date(Date.parse(checkinValue.checkTime)).toUTCString();
                                        var checkType = checkinValue.checkType;
                                        var checkTimeSet = moment.utc(checkTime).format('HH:mm');
                                        var workCode = checkinValue.workCode;
                                        var id = checkinValue._id;
                                        //alert(checkTimeSet);
                                        if (checkType == "O" || checkType == "o") {
                                            checkType = 0;
                                        }
                                        if (checkType == "i" || checkType == "I") {
                                            checkType = 1;
                                        }
                                        if (checkType == '1') {
                                            if (isInArray(parseInt(0, 3), nextOrder)) {
                                                checkin.push({
                                                    'checktype': '',
                                                    'label': 'Out'
                                                });
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'In'
                                                });
                                                nextOrder.push(0);
                                                nextOrder.push(3);
                                            } else if ((d.checkin.length - 1) == j) {
                                                var firstIn = checkTimeSet;
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'In'
                                                });
                                                checkin.push({
                                                    'checktype': '',
                                                    'label': 'Out',
                                                });
                                                nextOrder.push(0);
                                                nextOrder.push(3);
                                            } else {
                                                var firstIn = checkTimeSet;
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'In'
                                                });
                                                n++;
                                                nextOrder.push(0);
                                                nextOrder.push(3);
                                            }
                                        }
                                        var flag = 0;
                                        if (isInArray(parseInt(checkType), nextOrder)) {
                                            var Total = '';
                                            var totalAdjusted = '';
                                            if (TotalArray.length > 0 && h < TotalArray.length) {
                                                Total = TotalArray[h].total,
                                                    totalAdjusted = TotalArray[h].totalAdjusted
                                            }
                                            if (checkType == '0' || checkType == '3') {
                                                //objectId += ':'+id;
                                                checkin.push({
                                                    'checktype': checkTimeSet,
                                                    'label': 'Out',
                                                });
                                                nextOrder.length = 0;
                                                nextOrder.push(2);
                                                flag = 1;
                                                h++;

                                            }
                                            if (checkType == '2') {
                                                if ((d.checkin.length - 1) == j) {
                                                    checkin.push({
                                                        'checktype': checkTimeSet,
                                                        'label': 'In'
                                                    });
                                                    checkin.push({
                                                        'checktype': '',
                                                        'label': 'Out'
                                                    });
                                                    nextOrder.length = 0;
                                                    nextOrder.push(0);
                                                    nextOrder.push(3);
                                                    flag = 1;
                                                } else {
                                                    checkin.push({
                                                        'checktype': checkTimeSet,
                                                        'label': 'In'
                                                    });
                                                    nextOrder.length = 0;
                                                    nextOrder.push(0);
                                                    nextOrder.push(3);
                                                    flag = 1;
                                                }
                                            }
                                        }

                                        if (checkType == '2' && flag == 0) {
                                            checkin.push({
                                                'checktype': '',
                                                'label': 'Out'
                                            });
                                            objectId = '';
                                            checkin.push({
                                                'checktype': checkTimeSet,
                                                'label': 'In'
                                            });
                                            nextOrder.length = 0;
                                            nextOrder.push(0);
                                            nextOrder.push(3);
                                            flag = 1;
                                        }
                                        if (checkType == '3' && flag == 0) {
                                            var Total = '';
                                            var totalAdjusted = '';
                                            if (TotalArray.length > 0 && h < TotalArray.length) {
                                                Total = TotalArray[h].total,
                                                    totalAdjusted = TotalArray[h].totalAdjusted
                                            }
                                            checkin.push({
                                                'checktype': '',
                                                'label': 'In'
                                            });
                                            checkin.push({
                                                'checktype': checkTimeSet,
                                                'label': 'Out',
                                            });

                                            nextOrder.length = 0;
                                            nextOrder.push(2);
                                            flag = 1;
                                            h++;
                                        }
                                        if (checkType == '0' && flag == 0) {
                                            var Total = '';
                                            var totalAdjusted = '';

                                            if (TotalArray.length > 0 && h < TotalArray.length) {
                                                Total = TotalArray[h].total,
                                                    totalAdjusted = TotalArray[h].totalAdjusted
                                            }
                                            checkin.push({
                                                'checktype': '',
                                                'label': 'In'
                                            });
                                            checkin.push({
                                                'checktype': checkTimeSet,
                                                'label': 'Out'
                                            });
                                            nextOrder.length = 0;
                                            nextOrder.push(2);
                                            flag = 1;
                                            h++;
                                        }
                                    });
                                    /*$.each(d.checkin, function(j, itemCheckin) { 

                                    });*/
                                } else {
                                    checkin.push({
                                        'firstIn': '',
                                        'lastout': '',
                                        'In1': '',
                                        'Out1': '',
                                        'In2': '',
                                        'Out2': ''
                                    })
                                }
                                //console.log(checkin);
                                var normalTime = '00:00:00';
                                var OT1 = '00:00:00';
                                var OT2 = '00:00:00';
                                if (d.normalTime) {
                                    normalTime = d.normalTime
                                }
                                var normalTime = '00:00:00';
                                if (d.ot1Rule) {
                                    OT1 = d.ot1Rule;
                                }
                                var normalTime = '00:00:00';
                                if (d.ot2Rule) {
                                    OT2 = d.ot2Rule
                                }
                                attendanceDates.push({
                                    '_id': d._id,
                                    'shift': d.shift,
                                    'date': dateOfAtn,
                                    'weekday': weekday,
                                    'employeeNo': d.employeeNo,
                                    'Totaltime': d.totalRounded,
                                    'NT': normalTime,
                                    'OT1': OT1,
                                    'OT2': OT2,
                                    'checkinData': checkin,
                                    'definedColor': definedColor
                                });
                            }
                        });
                        $scope.attendanceData = datas;
                    });

                    if (employeeNo) {
                        function orderByDateAscending(a, b) {
                            if (a.date == b.date) {
                                return 0;
                            } else if (a.date > b.date) {
                                return 1;
                            }
                            return -1;
                        }

                        attendanceDates.sort(orderByDateAscending);
                        $scope.reportData.push({
                            'employeeNo': employeeNo,
                            'attendanceDates': attendanceDates
                        })
                        $scope.employeeData.push({
                            'employeeNo': employeeNo,
                            'firstName': firstName,
                            'lastName': lastName,
                            'TotalAdjs': secToFormatted(totalRounded)
                        })

                    }
                });
            }
        }

    });
});

report.controller('holidaysController', function($scope, $http, $location, $routeParams) {
    //alert("holidaysController......");
    $http.get('/holidaysdata').success(function(data) {
        if (data) {
            $scope.holidaysList = data;
        }
    });

    var error = {};
    $http.get('/companydata').success(function(data) {
        if (data) {
            if (data.isovertime) {
                if (data.overtimePeriod == "weekly") {
                    $scope.weekly = true;
                }
                if (data.tooltipDelayTime) {
                    $scope.delayTime = data.tooltipDelayTime;
                }
            }
            $scope.holidayDeptWise = false;
            if (data.holidayDeptWise) {
                $scope.holidayDeptWise = data.holidayDeptWise;
            }
            if (data.departments) {
                $scope.departmentsList = data.departments;
            }
            if (data.holidayStandardHours) {
                var holidayStandardHours = data.holidayStandardHours.split(':');
                $scope.StandardHours = parseInt(holidayStandardHours[0]);
            }
            $scope.holiday = data;
        }
    });

    $scope.submitform = function() {

        $scope.holiday.holidayStandardHours = $scope.StandardHours + ':' + '00:' + 00;
        //alert($scope.holiday.holidayStandardHours);
        $http.post('/holidaysetting', $scope.holiday).success(function(data) {
            if (data == "true") {
                error.Added = "Holidays Successfully Updated";
                $scope.message = error;
                //$location.path('/home');  
            }
        });
    }
    var deptList = [];
    $scope.selectRecordByDepartmentName = function(deptId, deptName) {
        if (document.getElementById(deptId).checked == true) {
            deptList.push(deptName);
        } else {
            for (var i = 0; i < deptList.length; i++) {
                if (deptList[i] == deptName) {
                    deptList.splice(i, 1);
                }
            };
        }
    }
    $scope.createHoliday = function() {
        $scope.message = null;
        $scope.SelectErrors = null;
        if ($scope.holidayDate && $scope.holiDays.holidayName) {
            $scope.holiDays.holidayDate = moment($scope.holidayDate).format('YYYY-MM-DD');
            //if(deptList.length>0) {
            $scope.holiDays.departmentList = deptList;
            $http.post('/createHoliday', $scope.holiDays).success(function(data) {
                if (data == "true") {
                    error.AddedHoliday = "Holiday Successfully Created";
                    $scope.message = error;
                    $http.get('/holidaysdata').success(function(data) {
                        if (data) {
                            $scope.holidaysList = data;
                            setTimeout(function() {
                                $scope.message = null;
                                $scope.SelectErrors = null;
                            }, 5000);
                        }
                    });
                }
            });
            // } else {
            //   $http.post('/createHoliday',$scope.holiDays).success(function(data){
            //     if(data == "true"){ 
            //       error.AddedHoliday = "Holiday Successfully Created";       
            //       $scope.message = error;
            //       $http.get('/holidaysdata').success(function(data) { 
            //           if(data){ 
            //             $scope.holidaysList = data;
            //             setTimeout(function(){
            //               $scope.message=null;
            //               $scope.SelectErrors=null;
            //             },5000);
            //           }      
            //       });
            //     }                                     
            //   }); 
            // }
        } else {
            $scope.SelectErrors = "Enter the Holiday Date and Name..";
        }
    }

    $scope.deleteHoliDays = function(date) {
        $http.get("/getPayperiod").success(function(data) {
            if (data) {
                var datas = {
                    fromDate: data.start,
                    toDate: data.end,
                    date: date
                };
                $http.post('/deleteHoliDaysForAll', datas).success(function(data) {
                    if (data) {
                        $scope.DeletedHolidaysMsg = "Holiday of the " + moment.utc(date).format('YYYY-MM-DD') + " are deleted for all the employees";
                    }
                });
            }
        });
    }

});

function orderByTimeAscending(a, b) {
    if (a.checkTime == b.checkTime) {
        return 0;
    } else if (a.checkTime > b.checkTime) {
        return 1;
    }
    return -1;
}

function getSeconds(t) {
    var bits = t.split(':');
    //alert(bits[0]); 
    var h = bits[0] * 3600;
    var m = bits[1] * 60;
    var s = bits[2] * 1;
    return h + m + s;
}

function secToFormatted(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds % 60;
    return hours + ':' + minutes + ':00';
}

report.filter('formatDate', function() {
    return function(date) {
        //var chTime = new Date(Date.parse(date)).toUTCString();      
        var date = moment.utc(date).format('YYYY-MM-DD');
        return date;
    };
});
report.filter('formatNextDate', function() {
    return function(date) {
        //var chTime = new Date(Date.parse(date)).toUTCString();      
        var date = moment.utc(date).add('days', 1).format('YYYY-MM-DD');
        return date;
    };
});

report.filter('timeago', function() {
    return function(date) {
        var chTime = new Date(Date.parse(date)).toUTCString();
        var date = moment.utc(chTime).format('HH:mm:ss');
        return date;
    };
});
report.filter('changeFormat', function() {
    return function(value) {
        var h = '';
        var m = '';
        var time = value.split(':');
        if (time[0].length < 2) {
            h = '0' + time[0];
        } else {
            h = time[0];
        }
        if (time[1].length < 2) {
            m = '0' + time[1];
        } else {
            m = time[1];
        }
        return h + ':' + m;
    };
});

report.directive('resetLink', function($parse, $log) {
    return {
        link: function(scope, element, attrs) {
            var atrStr = '';
            var companyId = scope.$eval('companyid');
            var currentDate = scope.$eval('currentDate');
            var nextPeriod = scope.$eval('nextPeriod');
            if (companyId) {
                atrStr = attrs.myAttr.replace('companyid', companyId);
            }
            if (currentDate) {
                atrStr = atrStr.replace('currentDate', currentDate);
            }
            if (nextPeriod) {
                atrStr = atrStr.replace('nextPeriod', nextPeriod);
            }
            element.removeAttr('my-attr');
            element.attr('href', atrStr);
        }
    };
});

report.directive('fullPath', function() {
    return {
        link: function(scope, element, attrs) {
            var obj = scope.$eval(attrs.fullPath);
            //can also fallback as a string           
            // console.log(obj);
        },
    }
});

report.directive('ngSparkline', function() {
    return {
        link: function(scope, element, attrs) {
            var obj = scope.$eval(attrs.fullPath);
            //can also fallback as a string

            // console.log(obj);
        },
    }
});

/*function changeFormat(value){
 
  var h ='';
  var m ='';
  var time = value.split(':');
  if(time[0].length<2){
    h = '0'+time[0];
  }else{
    h = time[0];
  }
  if(time[1].length<2){
    m = '0'+time[1];
  }else{
    m = time[1];
  }

  return h +':'+ m;
}*/
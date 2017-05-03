var admin = angular.module('admin', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ui.bootstrap.datetimepicker']);

admin.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/dashboard/', {
            controller: 'dashboardController',
            templateUrl: '/dashboard', // create employee template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                ReportIp: ['$http', '$route', function($http, $route) {
                    return $http({
                        method: 'get',
                        url: '/getReportIp'
                    });
                }]
            }
        })
        .when('/getCompanyEmployee/:companyId', {
            controller: 'companyEmployeeController',
            templateUrl: '/companyEmployee' // edit employee template
        })
        .when('/changeadminpassword', {
            controller: 'changeadminpasswordController',
            templateUrl: '/changeadminpassword' // attendance template
        })
        .when('/sendmessage/', {
            controller: 'sendmessageController',
            templateUrl: '/sendmessage' // create employee template
        })
        .when('/addreports/:companyId', {
            controller: 'addreportsController',
            templateUrl: '/addcompanyreports', // addreports template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                ReportIp: ['$http', '$route', function($http, $route) {
                    return $http({
                        method: 'get',
                        url: '/getReportIp'
                    });
                }]
            }
        })
        .when('/addEmails/:companyId', {
            controller: 'addEmailsController',
            templateUrl: '/addEmails', // addreports template
            resolve: { // it will get the detail of caregiver,child,prisoner,church,child from the database
                emailLists: ['$http', '$route', function($http, $route) {
                    return $http({
                        method: 'get',
                        url: '/emailLists/' + $route.current.params.companyId
                    });
                }]
            }
        })
        .when('/copyDataBase', {
            controller: 'copyDataBaseController',
            templateUrl: '/copyDataBaseRoute'
        });
});

admin.controller('copyDataBaseController', function($scope, $http) {
    $scope.error = {};
    $scope.copyDbFun = function() {
        $("#btnCopy").addClass("disabled");
        $scope.error = {};
        if ($scope.cmpId) {
            if ($scope.databaseIp) {
                if ($scope.dbName) {
                    var datas = {
                        companyId: $scope.cmpId,
                        databaseIp: $scope.databaseIp,
                        databaseName: $scope.dbName,
                        Username: $scope.Username,
                        Password: $scope.Password,
                    }
                    $http.post("/backUpTheDb", datas).success(function(data) {
                        if (data) {
                            $("#btnCopy").removeClass("disabled");
                            $scope.error.submitSuccess = "Database is copied to " + $scope.databaseIp;
                        }
                    });
                } else {
                    $scope.error.submitError = "Enter Database Name"
                }
            } else {
                $scope.error.submitError = "Enter Database Ip"
            }
        } else {
            $scope.error.submitError = "Enter Company Id"
        }
    };
});

admin.controller('addEmailsController', function(emailLists, $route, $scope, $http, $location, $routeParams) {
    $scope.emailLists = emailLists.data;
    $scope.addEmail = function(detail) {
        if (detail.addEmails) {
            $http.post('/addEmailsToDb', detail).success(function(data) {
                $http.get('/emailLists/' + detail.companyId).success(function(data) {
                    $("#invalidEmail" + detail._id).html("");
                    console.log(data);
                    $scope.emailLists = data;
                });
            });
        } else {
            $("#invalidEmail" + detail._id).html("<span style='padding: 5px; border-radius: 5px;' class='alert alert-danger'>Invalid Email</span>");
        }
    }
    $scope.deleteEmail = function(email, detail) {
        detail.removedEmail = email;
        $http.post('/deleteEmailsFromDb', detail).success(function(data) {
            $http.get('/emailLists/' + detail.companyId).success(function(data) {
                $("#invalidEmail" + detail._id).html("");
                $scope.emailLists = data;
            });
        });
    }
});

admin.controller('dashboardController', function(ReportIp, $route, $scope, $http, $location, $routeParams, $timeout) {

    $scope.checkData = {};
    $scope.reportsIp = ReportIp.data.reportIp;

    // function setCompany(id){
    //   console.log("set company");
    //   angular.forEach($scope.companyData, function(data){
    //     if(data._id == id){
    //       $scope.company = data;
    //       console.log($scope.company);
    //     }
    //   });
    // }

    function reloadCompany(id) {
        console.log("get company");
        $http.get('/getCompany/' + id).success(function(data) {
            angular.forEach($scope.companyData, function(updateData) {
                if (updateData._id == id) {
                    updateData.maxActiveUsers = data.maxActiveUsers;
                    updateData.activeUsers = data.activeUsers;
                    updateData.showTag = false;
                    $scope.company = data;
                    // console.log(updateData);
                }
            })
        });
    }

    function updateData(cmnDetail) {
        $http.post('/updateCompanyDetail', cmnDetail).success(function(data) {
            if (data.limit) {
                cmnDetail.daysLimitSaved = true;
                $timeout(function() {
                    cmnDetail.daysLimitSaved = false;
                    reloadCompany(cmnDetail._id);
                }, 2000);
            } else if (data.users) {
                cmnDetail.maxUserSaved = true;
                $timeout(function() {
                    cmnDetail.maxUserSaved = false;
                    reloadCompany(cmnDetail._id);
                }, 2000);
            } else {
                cmnDetail.isExceptionTotal1 = false;
                $timeout(function() {
                    reloadCompany(cmnDetail._id);
                }, 2000);
            }
        });
    }

    // function isNumbers(str) {
    //     console.log(/^[1-9][0-9]*$/.test(str));
    //     return /^[1-9][0-9]*$/.test(str);
    // }

    $scope.reloadData = function() {
        console.log("Init companies");
        $http.get('/allCompanyData').success(function(data) {
            if (data) {
                $scope.companyData = data;
                $scope.companyData.visible = false;
                $scope.companyData.showTag = false;
            }
        });
    };

    /* expand-collapse effect*/
    $scope.toggle = function(data) {
        // console.log(data.visible);
        data.visible = !data.visible;
    };

    $scope.changeCompanyPwd = function(companyId, newPwd) {
        var companyData = {
            'userId': companyId,
            'password': newPwd
        }
        $http.post('/recoverpassword', companyData).success(function(data) {
            if (data == "true") {
                $scope.pwdUpdated = true;
                $timeout(function() {
                    $scope.pwdUpdated = false;
                    reloadCompany(companyId);
                }, 2000);
            }
        });
    };

    $scope.saveReportIp = function() {
        $http.post('/saveReportIP', {
            reportIP: $scope.reportsIp
        }).success(function(data) {
            if (data) {
                $('#showReportModel').modal('hide');
            }
        });
    };

    $scope.replaceTheSymbol = function(id) { // during the sorting it will used to change the icon and sort the record on ascending and descending order...
        $("table thead tr th i").removeClass('icon-sort-up');
        $("table thead tr th i").removeClass('icon-sort-down');
        $("table thead tr th i").addClass('icon-sort');
        if ($scope.sort === id) {
            $("table thead tr th#" + id + " i").removeClass('icon-sort');
            $("table thead tr th#" + id + " i").addClass('icon-sort-down');
            $scope.sort = "-" + id;
        } else {
            $("table thead tr th#" + id + " i").removeClass('icon-sort');
            $("table thead tr th#" + id + " i").addClass('icon-sort-up');
            $scope.sort = id;
        }
    };

    $scope.changeCompanyDetail = function(cmnDetail, param = false) {
        if ($scope.checkData.isExceptionTotal != cmnDetail.isExceptionTotal) {
            cmnDetail.isExceptionTotal1 = true;
        }

        if (param == "lock") {
            cmnDetail.isLocked = !cmnDetail.isLocked;
            updateData(cmnDetail);
        } else if (param == "max") {
            if (isNaN(cmnDetail.maxActiveUsers)) {
                cmnDetail.maxUserSavedError = true;
                $timeout(function() {
                    cmnDetail.maxUserSavedError = false;
                    reloadCompany(cmnDetail._id);
                }, 2000);
            } else if (isNaN(cmnDetail.daysLimit)) {
                cmnDetail.daysLimitSavedError = true;
                $timeout(function() {
                    cmnDetail.daysLimitSavedError = false;
                    reloadCompany(cmnDetail._id);
                }, 2000);
            } else {
                updateData(cmnDetail);
            }
        } else {
            console.log("else update");
            updateData(cmnDetail);
        }
    };

    $scope.showModel = function(cmpDetail) {
        $('#myModal').modal('show');
        // console.log(cmpDetail);
        $http.get('/getCompany/' + cmpDetail._id).success(function(data) {
            $scope.company = data;
            angular.copy(data, $scope.checkData);
            reloadCompany(cmpDetail._id);
        });
    };

    $scope.openLink = function(type, id) {
        $('#myModal').modal('hide');
        if (type == 'reports')
            $location.path("/addreports/" + id);
        else
            $location.path("/addEmails/" + id);
    };

    $scope.openModel = function() {
        var modalInstance = $modal.open({
            templateUrl: 'report-popup.html',
            controller: ReportCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue) {
                console.log(resultValue);
            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var ReportCtrl = function($scope, $modalInstance) {
        var error = {};
        $scope.saveReportIp = function() {
            $http.post('/saveReportIP', {
                reportIP: $scope.reportsIp
            }).success(function(data) {
                if (data) {
                    $('#showReportModel').modal('hide');
                }
            });
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.showInputText = function(company) {
        company.showTag = true;
    };

    // init data
    $scope.reloadData();
});

admin.controller('dashboardHeaderController', function($modal, $log, $route, $scope, $http, $location, $routeParams, $timeout) {

    $scope.openModel = function() {
        var modalInstance = $modal.open({
            templateUrl: 'report-popup.html',
            controller: ReportCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue) {
                console.log(resultValue);
            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    var ReportCtrl = function($scope, $modalInstance) {
        $http.get('/getReportIp').success(function(data) {
            $scope.user = {
                'reportsIp': data.reportIp
            };
            console.log($scope.user.reportsIp);
        });

        $scope.saveReportIp = function(ip) {
            $http.post('/saveReportIP', {
                reportIP: ip
            }).success(function(data) {
                if (data) {
                    $scope.ipUpdated = true;
                    $timeout(function() {
                        $modalInstance.close();
                    }, 2000);
                } else {
                    $scope.ipUpdatedFail = true;
                }
            });
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
});

admin.controller('companyEmployeeController', function($route, $scope, $http, $location, $routeParams) {
    $http.get('/getCompanyEmployee/' + $routeParams.companyId).success(function(data) {
        if (data) {
            $scope.employeeData = data;
        }
    });

    $scope.changeEmpNo = function(employeeNo, companyId, email) {
        //alert(employeeNo+'employeeNo'+companyId+'companyId');
        var employeeData = {
            'employeeNo': employeeNo,
            'companyId': companyId,
            'email': email
        }
        $http.post('/changecompanyemployeeno', employeeData).success(function(data) {
            if (data == "true") {
                $http.get('/getCompanyEmployee/' + $routeParams.companyId).success(function(data) {
                    if (data) {
                        $scope.employeeData = data;
                        $scope.messageSucess = 'EmployeeNo Successfully Updated';
                    }
                });

            }
        });
    }

    $scope.changeEmpPwd = function(employeeNo, companyId, pwd) {
        var employeeData = {
            'employeeNo': employeeNo,
            'companyId': companyId,
            'password': pwd
        }
        $http.post('/changecompanyemployeepassword', employeeData).success(function(data) {
            if (data == "true") {
                $http.get('/getCompanyEmployee/' + $routeParams.companyId).success(function(data) {
                    if (data) {
                        $scope.employeeData = data;
                        $scope.messageSucess = 'Employee Password Successfully Updated';
                    }
                });

            }
        });
    }

    $scope.changeEmpPin = function(employeeNo, companyId, pin) {
        var employeeData = {
            'employeeNo': employeeNo,
            'companyId': companyId,
            'pin': pin
        }
        $http.post('/changecompanyemployeepin', employeeData).success(function(data) {
            if (data == "true") {
                $http.get('/getCompanyEmployee/' + $routeParams.companyId).success(function(data) {
                    if (data) {
                        $scope.employeeData = data;
                        $scope.messageSucess = 'Employee Pin Successfully Updated';
                    }
                });

            }
        });
    }

    $scope.changeEmpEmail = function(employeeNo, companyId, email) {
        var employeeData = {
            'employeeNo': employeeNo,
            'companyId': companyId,
            'email': email
        }
        $http.post('/changecompanyemployeeemail', employeeData).success(function(data) {
            if (data == "true") {
                $http.get('/getCompanyEmployee/' + $routeParams.companyId).success(function(data) {
                    if (data) {
                        $scope.employeeData = data;
                        $scope.messageSucess = 'Employee Email Successfully Updated';
                    }
                });
            }
            if (data == 'false') {
                $scope.Emailerr = 'Email already exist';
            }
        });
    }

    $scope.reloadData = function() {
        $http.get('/getCompanyEmployee/' + $routeParams.companyId).success(function(data) {
            if (data) {
                $scope.employeeData = data;
            }
        });
    }

});

admin.controller('changeadminpasswordController', function($route, $scope, $http, $location, $routeParams) {
    $scope.changePwd = function() {
        $http.get('/changeadminpassword/' + $scope.newPwd).success(function(data) {
            if (data == 'true') {
                $scope.message = 'Password Successfully Updated';
            }
        });
    }
});

admin.filter('formatDate', function() {
    return function(date) {
        //var chTime = new Date(Date.parse(date)).toUTCString();
        var date = moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
        return date;
    };
});

admin.controller('sendmessageController', function($route, $scope, $http, $location, $routeParams) {
    var error = {};
    $scope.companyData = '';
    $http.get('/allCompanyData').success(function(data) {
        if (data) {
            $scope.companyData = data;
        }
    });

    $scope.checkAll = function() {
        if ($scope.selectedAll) {
            $scope.selectedAll = false;
        } else {
            $scope.selectedAll = true;
        }
        angular.forEach($scope.companyData, function(item) {
            item.Selected = $scope.selectedAll;
        });

    }

    $scope.submitform = function() {
        if ($scope.message.subject) {
            if ($scope.message.comment) {
                var companiesArray = [];
                $('input[name="companies"]:checked').each(function() {
                    companiesArray.push(this.value);
                });
                if (companiesArray.length) {
                    $scope.message.companies = companiesArray;
                    $http.post('/sendmessagetoall', $scope.message).success(function(data) {
                        if (data == "true") {
                            $scope.messageSucess = 'Message Successfully sent';
                            $scope.message = '';
                        }
                    });
                } else {
                    alert('Please select Company');
                }
            } else {
                error.msgErr = "Please enter Message";
                $scope.message = error;
            }
        } else {
            error.msgErr = "Please enter Subject";
            $scope.message = error;
        }
    }
});

admin.controller('addreportsController', function(ReportIp, $route, $modal, $log, $scope, $http, $location, $routeParams) {
    console.log(ReportIp.data.reportIp);
    $scope.report = {};

    $scope.CustomreportsData = {};

    $http.get('/addreports/' + $routeParams.companyId).success(function(data) {
        if (data != 'false') {
            $scope.companyId = $routeParams.companyId;
            $scope.CustomreportsData = data.reportData;
        }
    });

    $scope.saveReport = function(reportsData) {
        if (reportsData.reportName && reportsData.link) {
            reportsData.companyId = $routeParams.companyId;
            $http.post('/editreport', reportsData).success(function(data) {
                if (data) {
                    $http.get('/addreports/' + $routeParams.companyId).success(function(data) {
                        if (data != 'false') {
                            $scope.messageSucess = '';
                            $scope.companyId = $routeParams.companyId;
                            $scope.CustomreportsData = data.reportData;
                        }
                    });
                }
            });
        } else {
            $scope.messageSucess = "Please enter all fields";
        }
    }

    $scope.savestdReport = function(stdreportsData) {
        if (stdreportsData.reportName && stdreportsData.link) {
            stdreportsData.companyId = $routeParams.companyId;
            $http.post('/editstdreport', stdreportsData).success(function(data) {
                if (data) {
                    $http.get('/getstandardreports/' + $routeParams.companyId).success(function(data) {
                        if (data != 'false') {
                            $scope.messageSucess = '';
                            $scope.companyId = $routeParams.companyId;
                            $scope.standardreportsData = data.reportData;
                        }
                    });
                }
            });
        } else {
            $scope.messageSucess = "Please enter all fields";
        }
    }

    $scope.deleterow = function(companyId, reportId) {
        var dataReport = {
            companyId: companyId,
            reportId: reportId
        }
        $http.post('/deleteCustomreports', dataReport).success(function(data) {
            if (data == 'true') {
                $http.get('/addreports/' + $routeParams.companyId).success(function(data) {
                    if (data != 'false') {
                        $scope.companyId = $routeParams.companyId;
                        $scope.CustomreportsData = data.reportData;
                    }
                });
            }
        });
    }

    $scope.deletestd = function(companyId, reportId) {
        var stddataReport = {
            companyId: companyId,
            reportId: reportId
        }
        $http.post('/deletestdreports', stddataReport).success(function(data) {
            if (data == 'true') {
                $http.get('/getstandardreports/' + $routeParams.companyId).success(function(data) {
                    if (data != 'false') {
                        $scope.companyId = $routeParams.companyId;
                        $scope.standardreportsData = data.reportData;
                    }
                });
            }
        });
    }

    $scope.addrow = function() {
        $scope.openModel();
        //$("#tbody").append('<tr> <td> <input  ng-model="report.active" data-ng-enter="saveReport()" type="text" class="gridtext" /></td> <td><input  ng-model="report.reportName" type="text" class="gridtext" data-ng-enter="saveReport()"/></td> <td><input  ng-model="report.link" type="text" class="gridtext" data-ng-enter="saveReport()"/></td> <td><button data-ng-click="deleterow()"><i class="icon-plus"></i>Delete</button><button data-ng-click="editRow()"><i class="icon-plus"></i>Save</button></td></tr>');
    }

    $scope.openModel = function() {
        var modalInstance = $modal.open({
            templateUrl: 'add.html',
            controller: addCtrl
        });

        modalInstance.result.then(function(resultValue) {
            if (resultValue) {
                $http.get('/addreports/' + resultValue).success(function(data) {
                    if (data != 'false') {
                        $scope.companyId = $routeParams.companyId;
                        $scope.CustomreportsData = data.reportData;
                    }
                });
            }
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    var addCtrl = function($scope, $modalInstance) {
        $scope.report = {};
        $scope.report.reportsIp = ReportIp.data.reportIp;
        var error = {};
        $scope.ok = function(value) {
            console.log(value);
            console.log(value.reportsIp + value.link);
            value.companyId = $routeParams.companyId;
            var companyId = $routeParams.companyId
            if (value.reportName && value.link && value.active) {
                $http.post('/addcustomReport', value).success(function(data) {
                    if (data == 'true') {
                        $modalInstance.close(companyId);
                    }
                });
            } else {
                error.reportxt = "Please enter all fields";
                $scope.message = error;
                return $scope.message;
            }
        };
        $scope.callfn = function() {
            this.$emit("UPDATE_PARENT", "Updated");
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };

});

admin.directive("otcDynamic", function() {
    return {
        template: "<td> ng-click='doSomething()'>sdf</td>"
    };
});

admin.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

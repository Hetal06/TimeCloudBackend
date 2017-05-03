var project = angular.module('project', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ui.bootstrap.datetimepicker']);
/* config */
project.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home/', {
            controller: 'homeController',
            templateUrl: '/projectHome'
        })
        .when('/newproject', {
            controller: 'newprojectController',
            templateUrl: '/newproject'
        })
        .when('/editproject/:projectId', {
            controller: 'editprojectController',
            templateUrl: '/editproject'
        })
        .when('/archiveProject', {
            controller: 'archievedController',
            templateUrl: '/archievedProject'
        })
        .when('/archievedProject/edit/:projectId', {
            controller: 'archievedEditController',
            templateUrl: '/archievedEditProject'
        })
        .when('/projectDetail/:projectId', {
            controller: 'projectDetailController',
            templateUrl: '/projectDetail'
        })
        .when('/employeesProject/:employeeNo', {
            controller: 'employeesProjectController',
            templateUrl: '/employeesProject'
        })
});

/* functions start*/
function secToFormatted(seconds) {
    var hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds % 60;
    return hours + ':' + minutes + ':00';
}

function toSeconds(t) {
    var bits = t.split(':');
    return bits[0] * 3600 + bits[1] * 60 + bits[2] * 1;
}
/* function end */


/* employee's Project */
project.controller("employeesProjectController", function($scope, $http, $location, $routeParams) {
    $scope.employeeNo = $routeParams.employeeNo;
    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.employeeList = data;
        }
    });
    $http.get("/getProjectDetailEmpWise/" + $routeParams.employeeNo).success(function(data) {
        var cnt = 0;
        data.projectData.forEach(function(detail) {
            cnt++;
            var projectTotal = 0;
            var firstName;
            var newList = [];
            detail.users.forEach(function(project) {
                if (project.employeeNo == $scope.employeeNo) {
                    projectTotal = projectTotal + toSeconds(project.timeTotal);
                    firstName = project.firstName;
                }
            });
            newList.push({
                firstName: firstName,
                timeTotal: secToFormatted(projectTotal)
            })
            detail.users = newList;
            if (cnt == data.projectData.length) {
                $scope.projectDetails = data.projectData;
            }
        })
    });
});

/* project detail */
project.controller("projectDetailController", function($scope, $http, $location, $routeParams) {
    $scope.project = {};
    $http.get("/getProjectDetail/" + $routeParams.projectId).success(function(data) {
        console.log(data);
    });

});

/* archieved */
project.controller("archievedEditController", function($scope, $http, $location, $routeParams) {
    $http.get('/getArchiveProjectDetail').success(function(data) {
        if (data) {
            $scope.archievedProject = data;
        }
    });
    $scope.project = {};
    $http.get("/getArchievedProjectDetail/edit/" + $routeParams.projectId).success(function(data) {
        if (data) {
            $scope.project = data[0];
            $scope.project.tasks.forEach(function(detail) {
                detail.taskCode = detail.taskCode.substring($scope.project.JC.toString().length);
            });
        }
    });
    /* activate project */
    $scope.submitform = function() {
        var tasks = $scope.project.tasks;
        var task = [];
        for (var i = 0; i < tasks.length; i++) {
            task.push(tasks[i].taskname + ':' + tasks[i].taskCode + ':' + tasks[i].nonbillable);
        };
        $scope.project.tasks = task;
        $http.post('/updateproject', $scope.project).success(function(data) {
            if (data == "true") {
                if ($scope.project.active) {
                    $http.post('/addJCInProject', {
                        workCode: $scope.project.JC
                    }).success(function(data) {});
                }
                location.href = '/project/#/home/';
            }
        });
    }
    /* not used*/
    $scope.deleteProject = function(projectId) {
        $http.post('/deleteProjectById', {
            projectId: projectId
        }).success(function(data) {
            if (data) {
                location.href = '/project/#/home/';
            }
        });
    }

})

project.controller("archievedController", function($scope, $http, $location) {
    $http.get('/getArchiveProjectDetail').success(function(data) {
        if (data) {
            $scope.archievedProject = data;
        }
    });
})

project.controller("headerController", function($scope, $rootScope, $http, $location) {
    $http.get('/companydata').success(function(data) {
        if (data) {
            $scope.delayTime = data.tooltipDelayTime;
        }
    });

    // Get videos
    var supportScreen = [];
    $http.get('/getVideos').success(function(resp) {
        if (resp.data) {
            $scope.videoList = resp.data[0];
            $scope.videoList.companyId = '';
            $scope.videoList._id = '';
            
            angular.forEach($scope.videoList, function(v,k){
                if(k !== 'companyId' || k !== '_id'){
                    angular.forEach(v, function(val){
                        supportScreen.push(val);
                    });    
                } 
            })
            // console.log(supportScreen);
        }
    });
    
    // on change path
    $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
        console.log('Current route name: ' + $location.path());
        // Get all URL parameter
        console.log(current.$$route.controller);
        var currpage ;
    
        // if(current.$$route.controller == "homeController" || current.$$route.controller == "homepageController") {
        //     currpage = "homeScreen";
        // } else if(current.$$route.controller == "editAttendanceController" || current.$$route.controller == "editAttendanceNextController" || current.$$route.controller == "changeDateController" || current.$$route.controller == "changeDateController") {
        //     currpage = "attendanceScreen";    
        // } else if(current.$$route.controller == "shiftController" || current.$$route.controller == "shiftPatternController" ||  current.$$route.controller == "createshiftPatternController" || current.$$route.controller == "editshiftPatternController") {
        //     currpage = "shiftsScreen";
        // } else if(current.$$route.controller == "reportController") {
        //     currpage = "reportsScreen";    
        // } else if(current.$$route.controller == "settingsController") {
        //     currpage = "settingsScreen";
        if(current.$$route.controller == "feedbackController"){
            $scope.helpVideos = supportScreen;
        } else {
            $scope.helpVideos = '';
        }   

        angular.forEach($scope.videoList, function(v,k){
            if(k == currpage){
                $scope.helpVideos = v;   
                console.log($scope.helpVideos);
            } 
        });
    });

    $http.get('/employeeData').success(function(data) {
        if (data) {
            $scope.employeeNo = data[0].employeeNo;
        }
    });
    $scope.toggleFn = function() {
        $(".navbar-collapse").removeClass("in").addClass("navbar-collapse collapse");
    }
})

project.controller("homeController", function($scope, $http, $location) {
    $scope.project = {};
    
    /* search */
    $scope.getSearch = function() {
        var serchData = {
            'searchtext': $scope.searchtext
        }
        $http.post("/projectSearch", serchData).success(function(data) {
            if (data) {

                $scope.projectlist = data;
                $scope.projectlist.visible = false;
            }
        });
    }

    /* init */
    $http.get('/projectsForHome').success(function(data) {
        if (data) {
            $scope.projectlist = data;
            $scope.projectlist.visible = false;
            console.log($scope.projectlist);
        }
    });

    /* go to project detail page*/
    $scope.redirectToPath = function(projectId) {
        $location.path("/projectDetail/" + projectId);
    }

    /* expand-collapse effect*/
    $scope.toggle = function(project) {
        project.visible = !project.visible;
    };
})

project.controller("newprojectController", function($scope, $http, $location) {
    var error = {};
    $scope.project = {
        active: true
    };

    $http.get('/companydata').success(function(data) {
        if (data) {
            $scope.delayTime = data.tooltipDelayTime;
        }
    });

    $scope.projectList = function() {
        $http.get('/projects').success(function(data) {
            if (data) {
                $scope.projectlist = data;
            }
        });
    };

    var i = 0;
    $scope.addtask = function() {
        $("#taskParentdiv").append('<div class="childdiv_' + i + '"> <div class="row">  <div class="col-sm-9"> <div class="row"> <label popover-placement="top" popover-trigger="mouseenter" popover="" popover-popup-delay="{{delayTime}}" class="col-sm-4" for="form-field-2">Task Name</label><input type="text" id="taskname_' + i + '"  placeholder="Task Name" class="col-xs-10 col-sm-7" /></div><div class="space-2"></div><div class="row"><label popover-placement="top" popover-trigger="mouseenter" popover="" popover-popup-delay="{{delayTime}}" class="col-sm-4" for="form-field-2">Task Code</label><input type="text" id="taskcode_' + i + '" placeholder="Task Code" class="col-xs-10 col-sm-7" /></span></div> </div> <div> <input name="form-field-checkbox" id="nonbillable_' + i + '"  type="checkbox" class="ace" /> <span class="lbl"> Non billable</span> </div> </div> </div>  <hr>');
        i++;
    }

    function checkDuplicate(tasks, callback) {
        var arr = [];
        angular.forEach(tasks, function(t) {
            var taskc = t.split(/[.:]/);
            arr.push(taskc[1]);
        })
        var sorted_arr = arr.sort(); // You can define the comparing function here. 
        // JS by default uses a crappy string compare.
        var results = false;
        for (var i = 0; i < arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results = true;
            }
        }
        callback(results);
    }

    $scope.submitform = function() {


        var n = $('#taskParentdiv').children('div').length;
        var childDiv = n;
        var tasks = [];
        // var taskCheck = [];
        for (j = 0; j < childDiv; j++) {
            var taskname = $('#taskname_' + j).val();
            var taskcode = $('#taskcode_' + j).val();
            var nonbillable = $('#nonbillable_' + j).is(':checked');
            if (taskname && taskcode) {
                // taskCheck.push(taskcode);
                tasks.push(taskname + ':' + taskcode + ':' + nonbillable);
            }
        }
        console.log(tasks);
        
        checkDuplicate(tasks, function(duplicate) {
            $scope.project.tasks = tasks;
            if (!duplicate) {
                if ($scope.project.projectname) {
                    if ($scope.project.JC) {
                        $http.post('/createproject', $scope.project).success(function(resp) {
                            console.log(resp);
                            if (resp.data == true) {
                                $http.get('/projects').success(function(data) {
                                    if (data) {
                                        $scope.projectlist = data;
                                        error.projectAdded = "Project Successfully Created";
                                        $scope.message = error;
                                        $scope.message.projectErr = null;
                                        $scope.message.projectExist = null;
                                        $scope.project.active = true;
                                        $scope.project = '';
                                        $('#taskParentdiv').children().remove();
                                        $scope.projectList();
                                    }
                                });
                            } else {

                                error.projectExist = "Project Already exist with same JC/TC ID";
                                $scope.message = error;
                                $scope.message.projectErr = null;
                                $scope.message.projectAdded = null;
                            }
                        });
                    } else {

                        error.projectErr = "Please Enter Project Jobcode";
                        $scope.message = error;
                        $scope.message.projectAdded = null;

                    }
                } else {

                    error.projectErr = "Please Enter Project Name";
                    $scope.message = error;
                    $scope.message.projectAdded = null;
                }
            } else {

                error.projectErr = "Duplicate task code found";
                $scope.message = error;
                $scope.message.projectAdded = null;
            }
        });
    }
    $scope.projectList();
})

project.controller("editprojectController", function($scope, $http, $location, $routeParams) {
    var error = {};
    $scope.project = '';

    function checkDuplicate(tasks, callback) {
        var arr = [];
        angular.forEach(tasks, function(t) {
            var taskc = t.split(/[.:]/);
            arr.push(taskc[1]);
        })
        var sorted_arr = arr.sort(); // You can define the comparing function here. 
        // console.log(sorted_arr);                              // JS by default uses a crappy string compare.
        var results = false;
        for (var i = 0; i < arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results = true;
            }
        }
        callback(results);
    }


    $http.get('/companydata').success(function(data) {
        if (data) {
            $scope.delayTime = data.tooltipDelayTime;
        }
    });

    $scope.editProjectInit = function() {
        $scope.project = '';
        $http.get('/projects').success(function(data) {
            if (data) {
                console.log(data);
                $scope.projectlist = data;
            }
        });

        $http.get('/editproject/' + $routeParams.projectId).success(function(data) {
            if (data) {
                $scope.project = data;
                $scope.project.tasks.forEach(function(detail) {
                    detail.taskCode = detail.taskCode.substring($scope.project.JC.toString().length);
                    // detail.taskCode = detail.taskCode.split($scope.project.JC).join("");           
                });
                // console.log($scope.project);
                if (data.tasks) {
                    $scope.tasklength = data.tasks.length;
                    var i;
                    if ($scope.tasklength > 0) {
                        i = $scope.tasklength;
                    } else {
                        i = 0;
                    }
                    $scope.addtask = function() {
                        $("#taskParentdiv").append('<div id="newDiv"> <div class="childdiv_' + i + '"> <div class="row">  <div class="col-sm-9"> <div class="row"> <label popover-placement="top" popover-trigger="mouseenter" popover="" popover-popup-delay="{{delayTime}}" class="col-sm-4" for="form-field-2">Task Name</label><input type="text" id="taskname_' + i + '"  placeholder="Task Name" class="col-xs-10 col-sm-7" /></div><div class="space-2"></div><div class="row"><label popover-placement="top" popover-trigger="mouseenter" popover="" popover-popup-delay="{{delayTime}}" class="col-sm-4" for="form-field-2">Task Code</label><input type="text" id="taskcode_' + i + '" placeholder="Task Code" class="col-xs-10 col-sm-7" /></span></div> </div> <div> <input name="form-field-checkbox" id="nonbillable_' + i + '"  type="checkbox" class="ace" /> <span class="lbl"> Non billable</span> </div> </div> </div> <hr> </div>');
                        i++;
                    }
                }
            }
        });
    };


    $scope.submitform = function() {
        var n = $('#taskParentdiv').children('div').length;
        var childDiv = n;
        var tasks = [];
        var myVal = true;

        for (j = 0; j < childDiv; j++) {
            var taskname = $('#taskname_' + j).val();
            var taskcode = $('#taskcode_' + j).val();
            var nonbillable = $('#nonbillable_' + j).is(':checked');

            if (taskname && taskcode) {
                if (/^\d+$/.test(taskcode)) {
                    tasks.push(taskname + ':' + taskcode + ':' + nonbillable);
                } else {
                    myVal = false;
                }
            }
        }
        // console.log($scope.project);
        if (myVal) {
            checkDuplicate(tasks, function(duplicate) {
                if (!duplicate) {
                    $scope.project.tasks = tasks;
                    // console.log($scope.project);
                    $http.post('/updateproject', $scope.project).success(function(data) {
                        if (data == "true") {
                            if ($scope.project.active) {
                                error.projectAdded = "Project Successfully Updated";
                                $scope.message = error;
                                $scope.message.projectErr = null;
                                $("div[id*=newDiv]").remove();
                                // $http.get('/editproject/'+$routeParams.projectId).success(function(data){ 
                                // if(data){ 

                                // $scope.project = data;
                                // console.log($scope.project);
                                // $scope.project.tasks.forEach(function(detail){
                                //   // detail.taskCode = detail.taskCode.split($scope.project.JC).join("");
                                //    detail.taskCode =detail.taskCode.substring($scope.project.JC.toString().length);
                                // });
                                // if(data.tasks){
                                //   $scope.tasklength = data.tasks.length;
                                //   var i;
                                //   if($scope.tasklength>0){
                                //     i = $scope.tasklength;
                                //   }else{
                                //     i = 0;
                                //   }
                                //   $scope.addtask = function(){
                                //     $("#taskParentdiv").append('<div id="newDiv"><div class="childdiv_'+i+'"> <div class="row">  <div class="col-sm-9"> <div class="row"> <label popover-placement="top" popover-trigger="mouseenter" popover="" popover-popup-delay="{{delayTime}}" class="col-sm-4" for="form-field-2">Task Name</label><input type="text" id="taskname_'+i+'"  placeholder="Task Name" class="col-xs-10 col-sm-7" /></div><div class="space-2"></div><div class="row"><label popover-placement="top" popover-trigger="mouseenter" popover="" popover-popup-delay="{{delayTime}}" class="col-sm-4" for="form-field-2">Task Code</label><input type="text" id="taskcode_'+i+'" placeholder="Task Code" class="col-xs-10 col-sm-7" /></span></div> </div> <div> <input name="form-field-checkbox" id="nonbillable_'+i+'"  type="checkbox" class="ace" /> <span class="lbl"> Non billable</span> </div> </div> </div> <hr> </div>');             
                                //     i++;
                                //   }
                                // }
                                $scope.editProjectInit();
                                //   }
                                // });
                            } else {
                                location.href = '/project/#/home/';
                            }
                        }
                    });
                } else {
                    error.projectErr = "Duplicate task code found";
                    $scope.message = error;
                }
            });
        } else {
            error.projectErr = "Only digits are allowed as a task code";
            $scope.message = error;
        }
    }

    $scope.editProjectInit();
});

google.load('visualization', '1', {
    packages: ['corechart']
});

google.setOnLoadCallback(function() {
    angular.bootstrap(document.body, ['myApp']);
});

/*project.directive("googleChart",function(){  
    return{
        restrict : "A",
        link: function($scope, $elem, $attr){
            var dt = $scope[$attr.ngModel].dataTable;

            var options = {};
            if($scope[$attr.ngModel].title)
                options.title = $scope[$attr.ngModel].title;

            var googleChart = new google.visualization[$attr.googleChart]($elem[0]);
            googleChart.draw(dt,options)
        }
    }
});*/

/*report.directive('resetLink', function() {
  return {
    link: function(scope, element, attrs){            
      var atrStr = '';
      var companyId = scope.$eval('companyid');          
      var currentDate = scope.$eval('currentDate');         
      var nextPeriod = scope.$eval('nextPeriod'); 
      if(companyId){
        atrStr = attrs.myAttr.replace('companyid', companyId);
      }          
      if(currentDate){
        atrStr = atrStr.replace('currentDate', currentDate);
      }
      if(nextPeriod){
        atrStr = atrStr.replace('nextPeriod', nextPeriod);
      }
      element.removeAttr('my-attr');                  
      element.attr('href', atrStr);        
    }
  };
});*/

/*var dataH = google.visualization.arrayToDataTable([
        ['Year', 'Sales'],
        ['2004', 1000],
        ['2005', 400],
        
      ]);
      var optionsH = {
        title: '',
        legend: {position: 'none'},
        colors: ['#66CCFF','#CC0000']
      };
      var chartH = new google.visualization.PieChart(document.getElementById('hourdiv_'+index)); 
      chartH.draw(dataH, optionsH);*/
/* Percentage */
project.filter('filterPecentage', function() {
    return function(perValue) {
        // console.log(perValue);      
        if (isNaN(perValue) || !isFinite(perValue)) {
            return 0;
        } else {
            return Math.round(perValue);
        }
    };
});

project.filter('filterHours', function() {
    return function(hValue) {
        // console.log(hValue);      
        if (!hValue) {
            return 0;
        } else {
            var bits = hValue.split(':'),
                bit1 = bits[0],
                bit2 = bits[1];

            if (bit1) {
                if (bit1.length == 1) {
                    bit1 = '0' + bit1;
                    // console.log(bit1);
                }
            }
            if (bit2) {
                if (bit2.length == 1) {
                    bit2 = '0' + bit2;
                    // console.log(bit2);
                }
            }
            // if(!bit1)
            //     bit1='00'
            // if(!bit2)
            //     bit2='00'  

            return bit1 + ':' + bit2;
        }
    };
});
/* Project Chart */
project.directive('resetDollarchart', function() {
    return function(scope, element, attrs) {
        // console.log(scope.project.usedH);
        // console.log(scope.project.budgetH);
        var percentage = 0;
        if (scope.project.budgetH !== '0') {
            percentage = scope.project.usedH * 100 / scope.project.budgetH;
            percentage = Math.round(percentage);
        }
        var div = attrs.myAttr;
        if (div) {
            var n = document.getElementById(div)
            var el = angular.element('<span/>');
            el.append('<div id="' + div + '" class="inline" style="height:100px; width:100px;" class="inline"></div>')
            element.append(el);
            var dataH = google.visualization.arrayToDataTable([
                ['budgetH', 'usedH'],
                ['', percentage],
                ['', 100],
            ]);
            var optionsH = {
                title: '',
                legend: {
                    position: 'none'
                },
                colors: ['#66CCFF', '#CC0000']
            };
            var chartH = new google.visualization.PieChart(document.getElementById(div));
            chartH.draw(dataH, optionsH);
        }
    }
});

project.directive('resetHourchart', function() {
    return function(scope, element, attrs) {

        }
        /*var dataH = google.visualization.arrayToDataTable([
          ['Year', 'Sales'],
          ['2004', 1000],
          ['2005', 400],
          
        ]);
        var optionsH = {
          title: '',
          legend: {position: 'none'},
          colors: ['#66CCFF','#CC0000']
        };
        var chartH = new google.visualization.PieChart(document.getElementById('hourdiv')); 
        chartH.draw(dataH, optionsH);*/

});
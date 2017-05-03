var user = angular.module('user', ['ngRoute', 'ngSanitize','ui.bootstrap']);

user.service('myService1', function ($http, $rootScope) {
    var firstDate = '';
    var prvDate = '';
    var date = '';
    var attendanceId='';
    var toDate = '';
    var FromDate = '';
    var DateOfnext = '';
    return {        
        setFirstDate:function(value){
            firstDate = value;
        },
        getFirstDate:function(value){
            return firstDate;
        },
        setprvDate:function(value){
            prvDate = value;
        },
        getprvDate:function(){
            return prvDate;
        },
        setAttendancedate:function(value){
            date = value;
        },
        getAttendancedate:function(){
            return date;   
        },
        setAttendanceId:function(value) {
            attendanceId = value
        },
        getAttendanceId:function() {                
            return attendanceId;   
        },
        settoDate:function(value){
          toDate = value;
        },
        gettoDate:function(value){
          return toDate;
        },
        setFromDate:function(value){
            FromDate = value;
        },
        getFromDate:function(){
            return FromDate;
        },
        setDateOfnext:function(value){
          DateOfnext = value;
        },
        getDateOfnext:function(value){
          return DateOfnext;
        },
    };
})
user.config(function ($routeProvider,$locationProvider){
    $routeProvider
    .when('/leave/',{
        controller : 'leaveController',
        templateUrl: '/leave' // create employee template
    })
    .when('/viewAttendance/:employeeNo',{
      controller : 'viewAttendanceController',
      templateUrl: '/viewAttendance', // edit attendance template
      resolve: {
        checkAuth : function(myService1,$http,$route, $location){
          $http.get('/checkAuth/'+$route.current.params.employeeNo).success(function(data) {       
            if(data == 'false'){ 
                $location.path('/forbidden'); 
            }
          });
        }
      }
    })
    .when('/viewAttendance/:employeeNo/:date',{
      controller : 'viewAttendanceNextController',
      templateUrl: '/viewAttendance', // edit attendance template
      resolve: {
        checkAuth : function(myService1,$http,$route, $location){
          $http.get('/checkAuth/'+$route.current.params.employeeNo).success(function(data) {       
            if(data == 'false'){ 
                $location.path('/forbidden'); 
            }
          });
        }
      }
    })
    .when('/viewAttendance/:employeeNo/:fromDate/:toDate',{
      controller : 'viewAttendancePrevController',
      templateUrl: '/viewAttendance', // attendance template
      resolve: {
        checkAuth : function(myService1,$http,$route, $location){
          $http.get('/checkAuth/'+$route.current.params.employeeNo).success(function(data) {       
            if(data == 'false'){ 
                $location.path('/forbidden'); 
            }
          });
        }
      }
    }) 
});

function orderByDateAscending(a, b) {
  if (a.date == b.date) {
      return 0;
  } else if (a.date > b.date) {
      return 1;
  }
  return -1;
}

function orderByShiftIndexAscending(a, b) {
  if (a.index == b.index) {
      return 0;
  } else if (a.index > b.index) {
      return 1;
  }
  return -1;
}
user.filter('dateFormat', function(){
  return function(date){
    var date = moment.utc(date).format('ddd, MMM, DD, YYYY');
    return date;       
  };
});

user.filter('formatDate', function(){
  return function(date){
    var date = moment.utc(date).format('YYYY-MM-DD');
    return date;       
  };
});

user.filter('shortText', function(){
  return function(text){
    var shortString = text.substr(0, 5);
    return shortString;       
  };
});

user.directive('formatTime', function(){
  return function(value){
    return value +':'
  };
});

user.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

user.controller('viewAttendanceController', function ( $scope,$modal,$log,$http,$location,$routeParams,$parse, myService1) {
  var empno = localStorage.getItem('empNo');
  if(empno!=$routeParams.employeeNo) {
    $location.path('/viewAttendance/'+empno);
  } else {
    var error = {};
    $scope.weeklyNT = '';
    $scope.overtime = '';
    $scope.addIOTime=false;
    $scope.adminEmail='';
    $scope.companyId='';
    $http.get('/companydata').success(function(data) { 
      if(data){
        // alert(data.isReadWrite);
        $scope.addIOTime=data.isReadWrite;
        $scope.adminEmail=data.email;
        $scope.companyId=data._id;
        if(data.isovertime){   
          if(data.overtimePeriod == "weekly") {
            if(data.overtimeLevel == "2"){
              if(data.weeklyNT){
                $scope.weeklyNT = data.weeklyNT;
              }else{
                $scope.weeklyNT = '00:00:00';
              }
              if(data.weeklyOT1){
                $scope.overtime = data.weeklyOT1;
              }else{
                $scope.overtime = '00:00:00';
              }                                 
            }else{              
              if(data.weeklyNT){
                $scope.weeklyNT = data.weeklyNT;
              }else{
                $scope.weeklyNT = '00:00:00';
              }
            }
          }   
        } 
        if(data.tooltipDelayTime){
          $scope.delayTime = data.tooltipDelayTime;
        }          
      }       
    }); 
    $http.get("/attendanceedit/"+$routeParams.employeeNo).success(function(data) {
      if(data){
        loadAttendanceData(data.attendanceData, $scope,1);
        $scope.prvDate = data.prv;
        $scope.nextPrvDate = $scope.firstDate;
        myService1.setprvDate($scope.prvDate);
        myService1.setFirstDate($scope.firstDate);
      }        
    });
    $scope.selectedEmp = $routeParams.employeeNo;
    $http.get('/employeeDetail/'+$routeParams.employeeNo).success(function(data){       
      if(data){ 
          $scope.employeeList = data;
        }                                  
    });  
    $scope.dateOptions = {
      'year-format': "yy",
      'starting-day': 1,        
      'show-weeks':false,
      'showTimezone': true,       
    };
    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];
    $scope.previousFn = function(fromDate, toDate){
      if(fromDate && toDate){      
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment.utc(toDate).subtract('days',1).format('YYYY-MM-DD');
        $location.path('/viewAttendance/'+$scope.selectedEmp+'/'+fromDate+'/'+toDate);
      }    
    }
    $scope.searchDate = function(fromDate,toDate){ 
      if(fromDate && toDate) {
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment(toDate).format('YYYY-MM-DD');
        $http.get('/attendanceedit/'+$scope.selectedEmp+'/'+fromDate+'/'+toDate).success(function(data){       
          if(data){       
            loadAttendanceData(data, $scope,1);
            $scope.firstDate = myService1.getFirstDate();
            $scope.prvDate = myService1.getprvDate();
            $scope.nextPrvDate = $scope.firstDate;
          }                                 
        });
      }    
    }

    $scope.openModel = function(id, date){
      myService1.setAttendanceId(id);
      myService1.setAttendancedate(date);

      var modalInstance = $modal.open({
        templateUrl: 'checkTime.html',
        controller: ModalInstanceCtrl       
      });   

      modalInstance.result.then(function (employeeNo) { 
        $http.get("/attendanceedit/"+employeeNo)
          .success(function(data) {
            if(data){          
              loadAttendanceData(data.attendanceData, $scope, 1);
            }        
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });  
    }

    var ModalInstanceCtrl = function ($scope, $modalInstance, myService1,$http) { 
        $scope.formatTime = function(id) { 
            var val =  $('#'+id).val();
            val = val.replace(/[^0-9]/g,'');
            if(val.length >= 2)
                val = val.substring(0,2) + ':' + val.substring(2); 
            if(val.length >= 5)
                val = val.substring(0,5); 

           $('#'+id).val(val);
        };
        $scope.readWriteFlag=false;
        $scope.adminEmail='';
        $scope.companyId = '';
        $http.get('/companydata').success(function(data) { 
          if(data){
            $scope.readWriteFlag=data.isReadWrite;
            $scope.companyId = data._id;
            $scope.adminEmail=data.email;
            if(data.jobCosting == true) {
              $scope.showJobCosting = true;
            }
          }       
        }); 
        $scope.ok = function (inTime, outTime, workCode) {
          var error = {};   
          if(inTime  && outTime) {
            var employeeNo = '';
            if(inTime.indexOf(':')>-1 && outTime.indexOf(':')>-1){          
              if(validTime(inTime) == true && validTime(outTime)== true){
                var attendanceId = myService1.getAttendanceId();
                var checkinDate = myService1.getAttendancedate(); 
                var inTime = inTime.split(':');
                var outTime = outTime.split(':');
                var checkInTime = inTime[0]+':'+inTime[1]+':00';
                var checkOuTime = outTime[0]+':'+outTime[1]+':00';
                employeeNo = $routeParams.employeeNo;           
                $http.get("/getPayperiod").success(function(data) {
                  if(data){ 
                    $scope.checkin = {
                      checkInTime: checkInTime,
                      checkOutime: checkOuTime,
                      checkinDate: checkinDate,
                      employeeNo:  $routeParams.employeeNo,
                      attendanceId: attendanceId,
                      workCode:workCode,
                      start:data.start,
                      end:data.end,
                      addIOTime:$scope.readWriteFlag,
                      adminEmail:$scope.adminEmail,
                      companyId:$scope.companyId
                    };
                    $http.post('/addinouttimeByEmp',$scope.checkin).success(function(data){       
                      if(data){ 
                        $modalInstance.close(employeeNo); 
                      }
                    });
                  }
                });              
              }else{
                error.timeErr = "Please enter valid time e.g. 08:00";       
                $scope.message = error;
                return $scope.message;
              }
            }else{
              error.timeErr = "Please enter valid time e.g. 08:00";       
              $scope.message = error;
              return $scope.message;
            }
          }else{
            error.timeErr = "Please enter value";       
            $scope.message = error;
            return $scope.message;
          }     
        };
        $scope.callfn =function(){
          this.$emit("UPDATE_PARENT", "Updated");
        }      

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    };

    $scope.changeTime = function(ckTime, label, date, attendanceId, objectId, shift){   
      if(ckTime.indexOf(':')>-1 && label == 'In' || label == 'Out'){     
        var employeeNo = $routeParams.employeeNo;
        var checkinDate = date;          
        var Time = ckTime.split(':');
        var Hour = Time[0];
        var minute = Time[1];         
        var checkTime = Hour+':'+minute+':00';
        var checkType = '';
        if(label == 'In'){
          checkType = 'I';
        }
        else if(label == 'Out'){
          checkType = 'O';
        }else{
          checkType = '';
        }
        $http.get("/getPayperiod").success(function(data) {
          if(data) { 
            $scope.checkin = {
              checkTime: checkTime,
              checkType: checkType,
              checkinDate : checkinDate,
              employeeNo: employeeNo,
              attendanceId: attendanceId,
              objectId:objectId,
              start:data.start,
              end:data.end,
              addIOTime:$scope.addIOTime,
              adminEmail:$scope.adminEmail,
              companyId:$scope.companyId
            };
            if(shift!='') {
              $http.get("/getemployeeshiftdata/"+shift).success(function(result) {
                var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                if(shiftStartDate != shiftFinishDate){
                  myService1.setEmployeeNo(employeeNo);
                  myService1.setEmployeeData($scope.checkin);
                  $scope.openModelForinout();
                }else{
                  $http.get("/attendanceDataFetch/"+attendanceId).success(function(result) {
                      var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                      var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                      var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                      var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                      var exception = result.ExceptionAssign;
                      var shift = result.shift;
                      var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                      if(shiftStartDate != shiftFinishDate){
                        myService1.setEmployeeNo(employeeNo);
                        myService1.setEmployeeData($scope.checkin);
                        $scope.openModelForinout();
                      }else{               
                          $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
                            if(data){ 
                               if(exception != '' && shift == '') {
                                  $http.get('/changeexception/'+exception+'/'+attendanceId+'/'+atnDate+'/'+employeeNo).success(function(data){       
                                    if(data){
                                      $http.get("/attendanceedit/"+$routeParams.employeeNo)
                                          .success(function(data) {
                                            if(data){          
                                              loadAttendanceData(data.attendanceData, $scope, 0);
                                              myService1.setFirstDate($scope.firstDate);    
                                            }        
                                      }); 
                                    }
                                  });  
                               }else{
                                  $http.get("/attendanceedit/"+employeeNo)
                                    .success(function(data) {
                                      if(data){          
                                        loadAttendanceData(data.attendanceData, $scope,1);
                                        myService1.setFirstDate($scope.firstDate);                                
                                      }        
                                  }); 
                               }
                            }                                 
                          });
                      }
                  });
                }
              });
            } else {
              $http.get("/attendanceDataFetch/"+attendanceId).success(function(result) {
                  var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                  var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                  var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                  var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                  var exception = result.ExceptionAssign;
                  var shift = result.shift;
                  var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                  if(shiftStartDate != shiftFinishDate){
                    myService1.setEmployeeNo(employeeNo);
                    myService1.setEmployeeData($scope.checkin);
                    $scope.openModelForinout();
                  }else{               
                      $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
                        if(data){ 
                           if(exception != '' && shift == '') {
                              $http.get('/changeexception/'+exception+'/'+attendanceId+'/'+atnDate+'/'+employeeNo).success(function(data){       
                                if(data){
                                  $http.get("/attendanceedit/"+$routeParams.employeeNo)
                                      .success(function(data) {
                                        if(data){          
                                          loadAttendanceData(data.attendanceData, $scope, 0);
                                          myService1.setFirstDate($scope.firstDate);    
                                        }        
                                  }); 
                                }
                              });  
                           }else{
                              $http.get("/attendanceedit/"+employeeNo)
                                .success(function(data) {
                                  if(data){          
                                    loadAttendanceData(data.attendanceData, $scope,1);
                                    myService1.setFirstDate($scope.firstDate);                                
                                  }        
                              }); 
                           }
                        }                                 
                      });
                  }
              });
            }             
          }
        });
      }
    }
    $scope.openModelForinout= function(){
      var modalInstance = $modal.open({
        templateUrl: 'employee.html',
        controller: changetimeCtrl       
      });
      modalInstance.result.then(function (employeeNo) { 
        var fromDate = myService1.getFromDate();     
        var toDate = myService1.gettoDate();  
        if(fromDate && toDate){
          $location.path('/attendanceedit/'+employeeNo+'/'+fromDate+'/'+toDate); 
        }else{
          $http.get("/attendanceedit/"+employeeNo)
            .success(function(data) {
              if(data){          
                loadAttendanceData(data.attendanceData, $scope, 1);
              }        
          }); 
        }
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });  
    }
    var changetimeCtrl = function ($scope, $modalInstance, myService1) { 
      $scope.checkin = myService1.getEmployeeData();  
      $scope.ok = function (value) { 
        var error = {};   
        if(value) {
          $scope.checkin.nextDate = moment(value).format("YYYY-MM-DD"); 
          var employeeNo = myService1.getEmployeeNo();
          $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
            if(data){
             $modalInstance.close(employeeNo);
            }
          });
        }else{
          error.date = "Please select Date";       
          $scope.message = error;
          return $scope.message;
        }     
      };
      $scope.callfn =function(){
        this.$emit("UPDATE_PARENT", "Updated");
      }      

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    $scope.formatTime = function(id, atnid) { 
      var val =  $('.'+id+'_'+atnid).val();
      val = val.replace(/[^0-9]/g,'');
      if(val.length >= 2)
          val = val.substring(0,2) + ':' + val.substring(2); 
      if(val.length >= 5)
          val = val.substring(0,5); 
      $('.'+id+'_'+atnid).val(val);
    };
  }
});
user.controller('viewAttendancePrevController', function ( $scope,$modal,$log,$http,$location,$routeParams,$parse, myService1) {
  var empno = localStorage.getItem('empNo');
  if(empno!=$routeParams.employeeNo) {
    $location.path('/viewAttendance/'+empno+'/'+$routeParams.fromDate+'/'+$routeParams.toDate);
  } else {
    var error = {};
    $scope.weeklyNT = '';
    $scope.overtime = '';
    $scope.addIOTime=false;
    $scope.adminEmail='';
    $scope.companyId='';
    $http.get('/companydata').success(function(data) { 
      if(data){
        $scope.addIOTime=data.isReadWrite;
        $scope.adminEmail=data.email;
        $scope.companyId=data._id;
        if(data.isovertime){   
          if(data.overtimePeriod == "weekly") {
            if(data.overtimeLevel == "2"){
              if(data.weeklyNT){
                $scope.weeklyNT = data.weeklyNT;
              }else{
                $scope.weeklyNT = '00:00:00';
              }
              if(data.weeklyOT1){
                $scope.overtime = data.weeklyOT1;
              }else{
                $scope.overtime = '00:00:00';
              }                                 
            }else{              
              if(data.weeklyNT){
                $scope.weeklyNT = data.weeklyNT;
              }else{
                $scope.weeklyNT = '00:00:00';
              }
            }
          }   
        } 
        if(data.tooltipDelayTime){
          $scope.delayTime = data.tooltipDelayTime;
        }          
      }       
    });
    $http.get('/attendanceedit/'+$routeParams.employeeNo+'/'+$routeParams.fromDate+'/'+$routeParams.toDate).success(function(dataAtn){       
      if(dataAtn){ 
        $http.get("/getPayperiod").success(function(data) {
            if(data){ 
              $scope.days = data.days;
              $scope.prvDate = moment.utc($routeParams.fromDate).subtract('days', $scope.days).format('YYYY-MM-DD');
              $scope.nextPrvDate = $routeParams.fromDate;
              $scope.firstDate = myService1.getFirstDate();
              loadAttendanceData(dataAtn, $scope,0);
            }         
        });
      }                                 
    });
    $scope.selectedEmp = $routeParams.employeeNo;
    $http.get('/employeeDetail/'+$routeParams.employeeNo).success(function(data){       
      if(data){ 
        $scope.employeeList = data;
      }                                  
    });    
    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];
    $scope.previousFn = function(fromDate, toDate){
      if(fromDate && toDate){      
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment.utc(toDate).subtract('days',1).format('YYYY-MM-DD');
        $location.path('/viewAttendance/'+$scope.selectedEmp+'/'+fromDate+'/'+toDate);             
      }    
    }

    $scope.searchDate = function(fromDate,toDate){ 
      if(fromDate && toDate){      
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment(toDate).format('YYYY-MM-DD');
        $http.get('/attendanceedit/'+$scope.selectedEmp+'/'+fromDate+'/'+toDate).success(function(data){       
          if(data) {       
            loadAttendanceData(data, $scope,1);
            $scope.firstDate = myService1.getFirstDate();
            $scope.prvDate = myService1.getprvDate();
            $scope.nextPrvDate = $scope.firstDate;
          }                                 
        });
      }
    }
    $scope.openModel = function(id, date){
      myService1.setAttendanceId(id);
      myService1.setAttendancedate(date);

      var modalInstance = $modal.open({
        templateUrl: 'checkTime.html',
        controller: ModalInstanceCtrl       
      });   

      modalInstance.result.then(function (employeeNo) { 
        $http.get('/attendanceedit/'+employeeNo+'/'+$routeParams.fromDate+'/'+$routeParams.toDate).success(function(data){       
          if(data){       
            loadAttendanceData(data, $scope, 0);
            $scope.firstDate = myService1.getFirstDate();
            $scope.prvDate = myService1.getprvDate();
            $scope.nextPrvDate = $scope.firstDate;
          }                                 
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });  
    }

    var ModalInstanceCtrl = function ($scope, $modalInstance, myService1) { 
      $scope.formatTime = function(id) { 
            var val =  $('#'+id).val();
            val = val.replace(/[^0-9]/g,'');
            if(val.length >= 2)
                val = val.substring(0,2) + ':' + val.substring(2); 
            if(val.length >= 5)
                val = val.substring(0,5); 
            /*if(val.length > 10)
                val = val.substring(0,10); */
           $('#'+id).val(val);
        };
        $scope.readWriteFlag=false;
        $scope.adminEmail='';
        $scope.companyId = '';
        $http.get('/companydata').success(function(data) { 
          if(data){
            $scope.readWriteFlag=data.isReadWrite;
            $scope.companyId = data._id;
            $scope.adminEmail=data.email;
            if(data.jobCosting == true) {
              $scope.showJobCosting = true;
            }
          }       
        }); 
        $scope.ok = function (inTime, outTime, workCode) {
          var error = {};   
          if(inTime  && outTime) {
            var employeeNo = '';
            if(inTime.indexOf(':')>-1 && outTime.indexOf(':')>-1){          
              if(validTime(inTime) == true && validTime(outTime)== true){
                var attendanceId = myService1.getAttendanceId();
                var checkinDate = myService1.getAttendancedate(); 
                var inTime = inTime.split(':');
                var outTime = outTime.split(':');
                var checkInTime = inTime[0]+':'+inTime[1]+':00';
                var checkOuTime = outTime[0]+':'+outTime[1]+':00';
                employeeNo = $routeParams.employeeNo;           
                $http.get("/getPayperiod").success(function(data) {
                  if(data){ 
                    $scope.checkin = {
                      checkInTime: checkInTime,
                      checkOutime: checkOuTime,
                      checkinDate: checkinDate,
                      employeeNo:  $routeParams.employeeNo,
                      attendanceId: attendanceId,
                      workCode:workCode,
                      start:data.start,
                      end:data.end,
                      addIOTime:$scope.readWriteFlag,
                      adminEmail:$scope.adminEmail,
                      companyId:$scope.companyId
                    };
                    $http.post('/addinouttimeByEmp',$scope.checkin).success(function(data){       
                      if(data){ 
                        $modalInstance.close(employeeNo); 
                      }
                    });
                  }
                });              
              }else{
                error.timeErr = "Please enter valid time e.g. 08:00";       
                $scope.message = error;
                return $scope.message;
              }
            }else{
              error.timeErr = "Please enter valid time e.g. 08:00";       
              $scope.message = error;
              return $scope.message;
            }
          }else{
            error.timeErr = "Please enter value";       
            $scope.message = error;
            return $scope.message;
          }     
        };
        $scope.callfn =function(){
          this.$emit("UPDATE_PARENT", "Updated");
        }      

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    };
    $scope.changeTime = function(ckTime, label, date, attendanceId, objectId, shift){   
      if(ckTime.indexOf(':')>-1 && label == 'In' || label == 'Out'){     
        var employeeNo = $routeParams.employeeNo;
        var checkinDate = date;          
        var Time = ckTime.split(':');
        var Hour = Time[0];
        var minute = Time[1];         
        var checkTime = Hour+':'+minute+':00';
        var checkType = '';
        if(label == 'In'){
          checkType = 'I';
        }
        else if(label == 'Out'){
          checkType = 'O';
        }else{
          checkType = '';
        }
        $http.get("/getPayperiod").success(function(data) {
          if(data) { 
            $scope.checkin = {
              checkTime: checkTime,
              checkType: checkType,
              checkinDate : checkinDate,
              employeeNo: employeeNo,
              attendanceId: attendanceId,
              objectId:objectId,
              start:data.start,
              end:data.end,
              addIOTime:$scope.addIOTime,
              adminEmail:$scope.adminEmail,
              companyId:$scope.companyId
            };
            if(shift!='') {
              $http.get("/getemployeeshiftdata/"+shift).success(function(result) {
                var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                if(shiftStartDate != shiftFinishDate){
                  myService1.setEmployeeNo(employeeNo);
                  myService1.setEmployeeData($scope.checkin);
                  $scope.openModelForinout();
                }else{
                  $http.get("/attendanceDataFetch/"+attendanceId).success(function(result) {
                      var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                      var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                      var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                      var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                      var exception = result.ExceptionAssign;
                      var shift = result.shift;
                      var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                      if(shiftStartDate != shiftFinishDate){
                        myService1.setEmployeeNo(employeeNo);
                        myService1.setEmployeeData($scope.checkin);
                        $scope.openModelForinout();
                      }else{               
                          $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
                            if(data){ 
                               if(exception != '' && shift == '') {
                                  $http.get('/changeexception/'+exception+'/'+attendanceId+'/'+atnDate+'/'+employeeNo).success(function(data){       
                                    if(data){
                                      $http.get("/attendanceedit/"+$routeParams.employeeNo)
                                          .success(function(data) {
                                            if(data){          
                                              loadAttendanceData(data.attendanceData, $scope, 0);
                                              myService1.setFirstDate($scope.firstDate);    
                                            }        
                                      }); 
                                    }
                                  });  
                               }else{
                                  $http.get("/attendanceedit/"+employeeNo)
                                    .success(function(data) {
                                      if(data){          
                                        loadAttendanceData(data.attendanceData, $scope,1);
                                        myService1.setFirstDate($scope.firstDate);                                
                                      }        
                                  }); 
                               }
                            }                                 
                          });
                      }
                  });
                }
              });
            } else {
              $http.get("/attendanceDataFetch/"+attendanceId).success(function(result) {
                  var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                  var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                  var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                  var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                  var exception = result.ExceptionAssign;
                  var shift = result.shift;
                  var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                  if(shiftStartDate != shiftFinishDate){
                    myService1.setEmployeeNo(employeeNo);
                    myService1.setEmployeeData($scope.checkin);
                    $scope.openModelForinout();
                  }else{               
                      $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
                        if(data){ 
                           if(exception != '' && shift == '') {
                              $http.get('/changeexception/'+exception+'/'+attendanceId+'/'+atnDate+'/'+employeeNo).success(function(data){       
                                if(data){
                                  $http.get("/attendanceedit/"+$routeParams.employeeNo)
                                      .success(function(data) {
                                        if(data){          
                                          loadAttendanceData(data.attendanceData, $scope, 0);
                                          myService1.setFirstDate($scope.firstDate);    
                                        }        
                                  }); 
                                }
                              });  
                           }else{
                              $http.get("/attendanceedit/"+employeeNo)
                                .success(function(data) {
                                  if(data){          
                                    loadAttendanceData(data.attendanceData, $scope,1);
                                    myService1.setFirstDate($scope.firstDate);                                
                                  }        
                              }); 
                           }
                        }                                 
                      });
                  }
              });
            }
          }
        });
      }
    }
    $scope.openModelForinout= function(){
      var modalInstance = $modal.open({
        templateUrl: 'employee.html',
        controller: changetimeCtrl       
      });
      modalInstance.result.then(function (employeeNo) { 
        var fromDate = myService1.getFromDate();     
        var toDate = myService1.gettoDate();  
        if(fromDate && toDate){
          $location.path('/attendanceedit/'+employeeNo+'/'+fromDate+'/'+toDate); 
        }else{
          $http.get("/attendanceedit/"+employeeNo)
            .success(function(data) {
              if(data){          
                loadAttendanceData(data.attendanceData, $scope, 1);
              }        
          }); 
        }
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });  
    }
    var changetimeCtrl = function ($scope, $modalInstance, myService1) { 
      $scope.checkin = myService1.getEmployeeData();  
      $scope.ok = function (value) { 
        var error = {};   
        if(value) {
          $scope.checkin.nextDate = moment(value).format("YYYY-MM-DD"); 
          var employeeNo = myService1.getEmployeeNo();
          $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
            if(data){
             $modalInstance.close(employeeNo);
            }
          });
        }else{
          error.date = "Please select Date";       
          $scope.message = error;
          return $scope.message;
        }     
      };
      $scope.callfn =function(){
        this.$emit("UPDATE_PARENT", "Updated");
      }      

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    $scope.formatTime = function(id, atnid) { 
      var val =  $('.'+id+'_'+atnid).val();
      val = val.replace(/[^0-9]/g,'');
      if(val.length >= 2)
          val = val.substring(0,2) + ':' + val.substring(2); 
      if(val.length >= 5)
          val = val.substring(0,5); 
      $('.'+id+'_'+atnid).val(val);
    };
  }
});
user.controller('viewAttendanceNextController', function ( $scope,$modal,$log,$http,$location,$routeParams,$parse, myService1) {
  var empno = localStorage.getItem('empNo');
  if(empno!=$routeParams.employeeNo) {
    $location.path('/viewAttendance/'+empno+'/'+$routeParams.date);
  } else {
    var error = {};
    $scope.weeklyNT = '';
    $scope.overtime = '';
    $scope.addIOTime=false;
    $scope.adminEmail='';
    $scope.companyId='';
    $http.get('/companydata').success(function(data) { 
      if(data){
        $scope.addIOTime=data.isReadWrite;
        $scope.adminEmail=data.email;
        $scope.companyId=data._id;
        if(data.isovertime){   
          if(data.overtimePeriod == "weekly") {
            if(data.overtimeLevel == "2"){
              if(data.weeklyNT){
                $scope.weeklyNT = data.weeklyNT;
              }else{
                $scope.weeklyNT = '00:00:00';
              }
              if(data.weeklyOT1){
                $scope.overtime = data.weeklyOT1;
              }else{
                $scope.overtime = '00:00:00';
              }                                 
            }else{              
              if(data.weeklyNT){
                $scope.weeklyNT = data.weeklyNT;
              }else{
                $scope.weeklyNT = '00:00:00';
              }
            }
          }   
        } 
        if(data.tooltipDelayTime){
          $scope.delayTime = data.tooltipDelayTime;
        }          
      }       
    }); 
    $http.get("/attendanceedit/"+$routeParams.employeeNo+"/"+$routeParams.date).success(function(data) {
      if(data){
        $http.get("/getPayperiod").success(function(dataP) {
          if(dataP){ 
            $scope.days = dataP.days;
            $scope.firstDate = myService1.getFirstDate();
            loadAttendanceData(data.attendanceData, $scope, 0);
            $scope.prvDate = data.prv;
            $scope.nextPrvDate = moment.utc($scope.prvDate).add('days', $scope.days).format('YYYY-MM-DD');
          }
        });
      }        
    });
    $scope.selectedEmp = $routeParams.employeeNo;
    $http.get('/employeeDetail/'+$routeParams.employeeNo).success(function(data){       
      if(data){ 
          $scope.employeeList = data;
        }                                  
    });
    
    $scope.dateOptions = {
      'year-format': "yy",
      'starting-day': 1,        
      'show-weeks':false,
      'showTimezone': true,       
    };

    $scope.formats = ['dd-MM-yyyy'];
    $scope.format = $scope.formats[0];

    $scope.previousFn = function(fromDate, toDate){
      if(fromDate && toDate){      
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment.utc(toDate).subtract('days',1).format('YYYY-MM-DD');
        $location.path('/viewAttendance/'+$scope.selectedEmp+'/'+fromDate+'/'+toDate);
       }    
    }

    $scope.searchDate = function(fromDate,toDate){ 
      if(fromDate && toDate){      
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        toDate = moment(toDate).format('YYYY-MM-DD');
        $http.get('/attendanceedit/'+$scope.selectedEmp+'/'+fromDate+'/'+toDate).success(function(data){       
          if(data){       
            loadAttendanceData(data, $scope,1);
            $scope.firstDate = myService1.getFirstDate();
            $scope.prvDate = myService1.getprvDate();
            $scope.nextPrvDate = $scope.firstDate;
          }                                 
        });
      }    
    }

    $scope.openModel = function(id, date){
      myService1.setAttendanceId(id);
      myService1.setAttendancedate(date);
      var modalInstance = $modal.open({
        templateUrl: 'checkTime.html',
        controller: ModalInstanceCtrl       
      });   

      modalInstance.result.then(function (employeeNo) {     
        var fromDate = myService1.getFromDate();     
        var toDate = myService1.gettoDate(); 
        var DateOfnext = myService1.getDateOfnext();
        $http.get("/attendanceedit/"+employeeNo+"/"+$routeParams.date)
        .success(function(data) {
          if(data){
            loadAttendanceData(data.attendanceData, $scope, 0);
          }
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });  
    }
  }
  var ModalInstanceCtrl = function ($scope, $modalInstance, myService1) { 
    $scope.formatTime = function(id) { 
          var val =  $('#'+id).val();
          val = val.replace(/[^0-9]/g,'');
          if(val.length >= 2)
              val = val.substring(0,2) + ':' + val.substring(2); 
          if(val.length >= 5)
              val = val.substring(0,5); 
          /*if(val.length > 10)
              val = val.substring(0,10); */
         $('#'+id).val(val);
      };
        $scope.readWriteFlag=false;
        $scope.adminEmail='';
        $scope.companyId = '';
        $http.get('/companydata').success(function(data) { 
          if(data){
            $scope.readWriteFlag=data.isReadWrite;
            $scope.companyId = data._id;
            $scope.adminEmail=data.email;
            if(data.jobCosting == true) {
              $scope.showJobCosting = true;
            }
          }       
        }); 
        $scope.ok = function (inTime, outTime, workCode) {
          var error = {};   
          if(inTime  && outTime) {
            var employeeNo = '';
            if(inTime.indexOf(':')>-1 && outTime.indexOf(':')>-1){          
              if(validTime(inTime) == true && validTime(outTime)== true){
                var attendanceId = myService1.getAttendanceId();
                var checkinDate = myService1.getAttendancedate(); 
                var inTime = inTime.split(':');
                var outTime = outTime.split(':');
                var checkInTime = inTime[0]+':'+inTime[1]+':00';
                var checkOuTime = outTime[0]+':'+outTime[1]+':00';
                employeeNo = $routeParams.employeeNo;           
                $http.get("/getPayperiod").success(function(data) {
                  if(data){ 
                    $scope.checkin = {
                      checkInTime: checkInTime,
                      checkOutime: checkOuTime,
                      checkinDate: checkinDate,
                      employeeNo:  $routeParams.employeeNo,
                      attendanceId: attendanceId,
                      workCode:workCode,
                      start:data.start,
                      end:data.end,
                      addIOTime:$scope.readWriteFlag,
                      adminEmail:$scope.adminEmail,
                      companyId:$scope.companyId
                    };
                    $http.post('/addinouttimeByEmp',$scope.checkin).success(function(data){       
                      if(data){ 
                        $modalInstance.close(employeeNo); 
                      }
                    });
                  }
                });              
              }else{
                error.timeErr = "Please enter valid time e.g. 08:00";       
                $scope.message = error;
                return $scope.message;
              }
            }else{
              error.timeErr = "Please enter valid time e.g. 08:00";       
              $scope.message = error;
              return $scope.message;
            }
          }else{
            error.timeErr = "Please enter value";       
            $scope.message = error;
            return $scope.message;
          }     
        };
      $scope.callfn =function(){
        this.$emit("UPDATE_PARENT", "Updated");
      }      

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
  };

   $scope.changeTime = function(ckTime, label, date, attendanceId, objectId, shift){   
      if(ckTime.indexOf(':')>-1 && label == 'In' || label == 'Out'){     
        var employeeNo = $routeParams.employeeNo;
        var checkinDate = date;          
        var Time = ckTime.split(':');
        var Hour = Time[0];
        var minute = Time[1];         
        var checkTime = Hour+':'+minute+':00';
        var checkType = '';
        if(label == 'In'){
          checkType = 'I';
        }
        else if(label == 'Out'){
          checkType = 'O';
        }else{
          checkType = '';
        }
        $http.get("/getPayperiod").success(function(data) {
          if(data) { 
            $scope.checkin = {
              checkTime: checkTime,
              checkType: checkType,
              checkinDate : checkinDate,
              employeeNo: employeeNo,
              attendanceId: attendanceId,
              objectId:objectId,
              start:data.start,
              end:data.end,
              addIOTime:$scope.addIOTime,
              adminEmail:$scope.adminEmail,
              companyId:$scope.companyId
            };
            if(shift!='') {
              $http.get("/getemployeeshiftdata/"+shift).success(function(result) {
                var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                if(shiftStartDate != shiftFinishDate){
                  myService1.setEmployeeNo(employeeNo);
                  myService1.setEmployeeData($scope.checkin);
                  $scope.openModelForinout();
                }else{
                  $http.get("/attendanceDataFetch/"+attendanceId).success(function(result) {
                      var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                      var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                      var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                      var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                      var exception = result.ExceptionAssign;
                      var shift = result.shift;
                      var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                      if(shiftStartDate != shiftFinishDate){
                        myService1.setEmployeeNo(employeeNo);
                        myService1.setEmployeeData($scope.checkin);
                        $scope.openModelForinout();
                      }else{               
                          $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
                            if(data){ 
                               if(exception != '' && shift == '') {
                                  $http.get('/changeexception/'+exception+'/'+attendanceId+'/'+atnDate+'/'+employeeNo).success(function(data){       
                                    if(data){
                                      $http.get("/attendanceedit/"+$routeParams.employeeNo)
                                          .success(function(data) {
                                            if(data){          
                                              loadAttendanceData(data.attendanceData, $scope, 0);
                                              myService1.setFirstDate($scope.firstDate);    
                                            }        
                                      }); 
                                    }
                                  });  
                               }else{
                                  $http.get("/attendanceedit/"+employeeNo)
                                    .success(function(data) {
                                      if(data){          
                                        loadAttendanceData(data.attendanceData, $scope,1);
                                        myService1.setFirstDate($scope.firstDate);                                
                                      }        
                                  }); 
                               }
                            }                                 
                          });
                      }
                  });
                }
              });
            } else {
              $http.get("/attendanceDataFetch/"+attendanceId).success(function(result) {
                  var shiftStartTime = new Date(Date.parse(result.startTime)).toUTCString();
                  var shiftFinishTime = new Date(Date.parse(result.finishTime)).toUTCString();
                  var shiftStartDate = moment.utc(shiftStartTime).format('YYYY-MM-DD');
                  var shiftFinishDate = moment.utc(shiftFinishTime).format('YYYY-MM-DD');
                  var exception = result.ExceptionAssign;
                  var shift = result.shift;
                  var atnDate = moment.utc(result.date).format('YYYY-MM-DD')
                  if(shiftStartDate != shiftFinishDate){
                    myService1.setEmployeeNo(employeeNo);
                    myService1.setEmployeeData($scope.checkin);
                    $scope.openModelForinout();
                  }else{               
                      $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
                        if(data){ 
                           if(exception != '' && shift == '') {
                              $http.get('/changeexception/'+exception+'/'+attendanceId+'/'+atnDate+'/'+employeeNo).success(function(data){       
                                if(data){
                                  $http.get("/attendanceedit/"+$routeParams.employeeNo)
                                      .success(function(data) {
                                        if(data){          
                                          loadAttendanceData(data.attendanceData, $scope, 0);
                                          myService1.setFirstDate($scope.firstDate);    
                                        }        
                                  }); 
                                }
                              });  
                           }else{
                              $http.get("/attendanceedit/"+employeeNo)
                                .success(function(data) {
                                  if(data){          
                                    loadAttendanceData(data.attendanceData, $scope,1);
                                    myService1.setFirstDate($scope.firstDate);                                
                                  }        
                              }); 
                           }
                        }                                 
                      });
                  }
              });
            } 
          }
        });
      }
    }
    $scope.openModelForinout= function(){
      var modalInstance = $modal.open({
        templateUrl: 'employee.html',
        controller: changetimeCtrl       
      });
      modalInstance.result.then(function (employeeNo) { 
        var fromDate = myService1.getFromDate();     
        var toDate = myService1.gettoDate();  
        if(fromDate && toDate){
          $location.path('/attendanceedit/'+employeeNo+'/'+fromDate+'/'+toDate); 
        }else{
          $http.get("/attendanceedit/"+employeeNo)
            .success(function(data) {
              if(data){          
                loadAttendanceData(data.attendanceData, $scope, 1);
              }        
          }); 
        }
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });  
    }
    var changetimeCtrl = function ($scope, $modalInstance, myService1) { 
      $scope.checkin = myService1.getEmployeeData();  
      $scope.ok = function (value) { 
        var error = {};   
        if(value) {
          $scope.checkin.nextDate = moment(value).format("YYYY-MM-DD"); 
          var employeeNo = myService1.getEmployeeNo();
          $http.post('/attendancetimeedit',$scope.checkin).success(function(data){       
            if(data){
             $modalInstance.close(employeeNo);
            }
          });
        }else{
          error.date = "Please select Date";       
          $scope.message = error;
          return $scope.message;
        }     
      };
      $scope.callfn =function(){
        this.$emit("UPDATE_PARENT", "Updated");
      }      

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    $scope.formatTime = function(id, atnid) { 
      var val =  $('.'+id+'_'+atnid).val();
      val = val.replace(/[^0-9]/g,'');
      if(val.length >= 2)
          val = val.substring(0,2) + ':' + val.substring(2); 
      if(val.length >= 5)
          val = val.substring(0,5); 
      $('.'+id+'_'+atnid).val(val);
    };
});
user.controller('userheaderController',function ($route, $scope,$http,$location,$routeParams) {  
  $scope.empNo = localStorage.getItem('empNo')
  $http.get('/userData').success(function(data) { 
    if(data){
       $scope.userName = data.firstName +' '+data.lastName;       
    }
  });
});

user.controller('leaveController',function ($route, $scope,$http,$location,$routeParams) {  
  var error = {};
  $http.get('/userData').success(function(data) { 
    if(data){
       $scope.employeeData = data;       
    }
  });
  $http.get('/exceptionData').success(function(data){       
      if(data){    
          $scope.exceptionList = data;
      }                                  
  });

  $scope.submitform = function(employeeNo, name) {
    $scope.message=null;    
    if($scope.userFrm.startingDate!=undefined && $scope.userFrm.finishedDate!=undefined){
      $scope.userFrm.startingDate = moment($scope.userFrm.startDate).format('YYYY-MM-DD');
      $scope.userFrm.finishedDate = moment($scope.userFrm.finishDate).format('YYYY-MM-DD');
      $scope.userFrm.employeeNo = employeeNo;
      $scope.userFrm.employeeName = name;
      $http.post('/LeaveApplication',$scope.userFrm).success(function(data){
        if(data){
           error.leaveApply = "Your Leave Application successfully submitted";       
           $scope.message = error;
           $scope.userFrm = '';
        }
      });
    }else{
      error.leaveErr = "Please select start day and finish day";       
      $scope.message = error;
    }
  }
});

function loadAttendanceData(data, $scope, change){
  $scope.attendanceList = [];
  var normalTimeTotal = [];
  var overTime1Total = [];
  var overTime2Total = [];
  var ExceptionTotal = [];
  var cutExceptionTotal = [];
  var addweeklyexcTotal = [];
  var notaddexcTotal = [];
  $scope.normalTime = 0;
  $scope.overTime1 = 0;
  $scope.overTime2 = 0;
  $scope.Exception = 0;
  $scope.cutException = 0;
  $scope.addweeklyexc = 0;
  $scope.notaddexc = 0;
  var n = 0;
  var R = 1;
  var checkBoxid = 1;
  var weekNTArray = [];
  $scope.addException = [];
  $scope.weekNTArray = [];
  $scope.newArrayNt = [];

  $.each(data, function(i, item) {
    $scope.flagValue = 0;
    if(R == 1){
      $scope.fromDate = item.date;
    }
    if(R == 1 && change == 1) {
      $scope.firstDate =  item.date;
    }
    if(R == data.length){
      $scope.toDate = item.date;
      $scope.date = moment.utc(item.date).add('days',1).format('YYYY-MM-DD');
    }
    R++;
    var date = item.date;
    var attendanceId = item._id;
    var employeeNo = item.employeeNo;
    var ot1Rule = '';
    var ot2Rule = '';
    var Exception = '';
    var totalAdjusted ='';
    if(item.totalRounded){
      var totalAdjusted = item.totalRounded;
      var array = totalAdjusted.split(':');
    }
    if(item.addException == true){
      $scope.addException.push(item.Exception);
    }
    var normalTime = item.normalTime;
    if(!item.addweeklyexc){
      $scope.newArrayNt.push(normalTime);
    }
    if(item.notaddexc){
      $scope.newArrayNt.push(normalTime);
    }
    var totalValues = item.totalValues;
    var TotalArray = [];
    if(totalValues){
      totalValues.sort(orderByCheckinNo);
      $.each(totalValues, function(j, itemtotalValues) {
        TotalArray.push({'total':itemtotalValues.total,'totalAdjusted':itemtotalValues.totalAdjusted});
      });
    }
    var shift = item.shift;
    var comment = item.comment;
    function orderByNameAscending(a, b) {
      if (a.checkTime == b.checkTime) {
        return 0;
      } else if (a.checkTime > b.checkTime) {
        return 1;
      }
      return -1;
    }
    function orderByCheckinNo(a, b) {
      if (a.checkinNo == b.checkinNo) {
        return 0;
      } else if (a.checkinNo > b.checkinNo) {
        return 1;
      }
      return -1;
    }
    var nextOrder = [];
    var checkin = [];
    var h = 0;
    var objectId = '';
    var inId = '';
    item.checkin.sort(orderByNameAscending);
    if(item.checkin){
      $.each(item.checkin, function(j, itemCheckin) {
        var checkTime = new Date(Date.parse(itemCheckin.checkTime)).toUTCString();
        var checkType = itemCheckin.checkType;
        var checkTimeSet = moment.utc(checkTime).format('HH:mm');
        var workCode = itemCheckin.workCode;
        var id = itemCheckin._id;
        var alter = itemCheckin.alter;
        var alterColor = '';
        var showConfirmBox = false;
        if(alter == 'true') {
          if(itemCheckin.alterWho==employeeNo) {
            alterColor = {color: 'blue'};
            showConfirmBox = true;
          } else {
            alterColor = {color: 'red'};
          }          
        }
        if(checkType == "O" || checkType == "o"){
          checkType = 0;
        }
        if(checkType == "i" || checkType == "I"){
          checkType = 1;
        }
        if(checkType == '1') {
          if(isInArray(parseInt(0,3), nextOrder)){
            checkin.push({
              'checktype':'',
              'label':'Out',
              'workCode':'',
              'id':'',
              'alter':'',
              'alterColor':'',
              'hideInputBox':true
            });
            objectId = '';
            checkin.push({
              'checktype':checkTimeSet,
              'label':'In',
              'workCode':workCode,
              'inid':id,
              'id':id,
              'alter':alter,
              'alterColor':alterColor,
              'showConfirmBox':showConfirmBox
            });
            objectId = id;
            nextOrder.push(0);
            nextOrder.push(3);
          } else if((item.checkin.length-1) == j) {
            var firstIn = checkTimeSet;
            checkin.push({
              'checktype':checkTimeSet,
              'label':'In',
              'workCode':workCode,
              'inid':id,
              'id':id,
              'alter':alter,
              'alterColor':alterColor,
              'showConfirmBox':showConfirmBox
            });
            objectId = id;
            checkin.push({
              'checktype':'',
              'label':'Out',
              'workCode':'',
              'id':'',              
              'alter':alter,
              'hideInputBox':true,
              'showConfirmBox':showConfirmBox,
              'alterColor':alterColor
            });
            objectId = '';
            nextOrder.push(0);
            nextOrder.push(3);
          } else {
            var firstIn = checkTimeSet;
            checkin.push({
              'checktype':checkTimeSet,
              'inid':id,
              'label':'In',
              'workCode':workCode,
              'inid':id,
              'id':id,
              'alter':alter,
              'showConfirmBox':showConfirmBox,
              'alterColor':alterColor
            });
            objectId = id;
            n++;
            nextOrder.push(0);
            nextOrder.push(3);
          }
        }
        var flag=0;
        if(isInArray(parseInt(checkType), nextOrder)) {
          var Total = '';
          var totalAdjusted  = '';
          if(TotalArray.length > 0 && h<TotalArray.length) {
            Total = TotalArray[h].total,
            totalAdjusted = TotalArray[h].totalAdjusted
          }
          if(checkType=='0' || checkType == '3'){
            objectId += ':'+id;
            checkin.push({
              'checktype':checkTimeSet,
              'label':'Out',
              'workCode':'',
              'id':id,
              'total':Total,
              'totalAdjusted':totalAdjusted,
              'checkBoxid':id,
              'alter':alter,
              'showConfirmBox':showConfirmBox,
              'alterColor':alterColor
            });
            objectId = '';
            nextOrder.length = 0;
            nextOrder.push(2);
            flag =1;
            h++;
            checkBoxid++;
          }
          if(checkType=='2'){
            if((item.checkin.length-1) == j){
              checkin.push({
                'checktype':checkTimeSet,
                'label':'In',
                'workCode':workCode,
                'inid':id,
                'id':id,
                'alter':alter,
                'showConfirmBox':showConfirmBox,
                'alterColor':alterColor
              });
              objectId = id;
              checkin.push({
                'checktype':'',
                'label':'Out',
                'workCode':'',
                'id':'',
                'alter':'',
                'hideInputBox':true,
                'alterColor':''
              });
              objectId = '';
              nextOrder.length = 0;
              nextOrder.push(0);
              nextOrder.push(3);
              flag =1;
            } else {
              checkin.push({
                'checktype':checkTimeSet,
                'label':'In',
                'inid':id,
                'workCode':workCode,
                'id':id,
                'alter':alter,
                'showConfirmBox':showConfirmBox,
                'alterColor':alterColor
              }); 
              objectId = id;
              nextOrder.length = 0;
              nextOrder.push(0);
              nextOrder.push(3);
              flag =1;
            }                          
          }
        }
        if(checkType == '2' && flag==0 ){
          if(j == 0){
            var firstIn = checkTimeSet;
            checkin.push({
              'checktype':checkTimeSet,
              'label':'In',
              'inid':id,
              'workCode':workCode,
              'id':id,
              'alter':alter,
              'showConfirmBox':showConfirmBox,
              'alterColor':alterColor
            });
            objectId = id;
            n++;
            nextOrder.push(0);
            nextOrder.push(3);
          } else {
            checkin.push({
              'checktype':'',
              'label':'Out',
              'workCode':'',
              'id':'',
              'alter':'',
              'hideInputBox':true,
              'alterColor':''
            });
            objectId = '';
            checkin.push({
              'checktype':checkTimeSet,
              'label':'In',
              'workCode':workCode,
              'inid':id,
              'id':id,
              'alter':alter,
              'showConfirmBox':showConfirmBox,
              'alterColor':alterColor
            });
            objectId = id;
            nextOrder.length = 0;
            nextOrder.push(0);
            nextOrder.push(3);
            flag=1;
          }
        }
        if(checkType == '3' && flag==0){
          var Total = '';
          var totalAdjusted  = '';
          if(TotalArray.length > 0 && h<TotalArray.length){
            Total = TotalArray[h].total,
            totalAdjusted = TotalArray[h].totalAdjusted
          }
          checkin.push({
            'checktype':'',
            'label':'In',
            'workCode':workCode,
            'id':'',
            'alter':'',
            'hideInputBox':true,
            'alterColor':''
          });   
          objectId += ':'+id;
          checkin.push({
            'checktype':checkTimeSet,
            'label':'Out',
            'workCode':'',
            'id':id,
            'total':Total,
            'totalAdjusted':totalAdjusted,
            'checkBoxid':id,
            'alter':alter,
            'showConfirmBox':showConfirmBox,
            'alterColor':alterColor
          }); 
          objectId = ''  ;
          nextOrder.length = 0;                     
          nextOrder.push(2); 
          flag=1; 
          h++;
          checkBoxid++;
        }
        if(checkType == '0' && flag==0){
          var Total = '';
          var totalAdjusted  = '';
          if(TotalArray.length > 0 && h<TotalArray.length){
              Total = TotalArray[h].total,
              totalAdjusted = TotalArray[h].totalAdjusted
          }
          checkin.push({
            'checktype':'',
            'label':'In',
            'workCode':workCode,
            'id':'',
            'alter':'',
            'hideInputBox':true,
            'alterColor':''
          });   
          objectId += ':'+id;
          checkin.push({
            'checktype':checkTimeSet,
            'label':'Out',
            'workCode':'',
            'id':id,
            'total':Total,
            'totalAdjusted':totalAdjusted,
            'checkBoxid':id,
            'alter':alter,
            'showConfirmBox':showConfirmBox,
            'alterColor':alterColor
          });   
          objectId = '';
          nextOrder.length = 0;                      
          nextOrder.push(2); 
          flag=1; 
          h++;
          checkBoxid++;
        }
      })
    }else{
      checkin.push({
        'firstIn':'',
        'lastout':'',
        'In1':'',
        'Out1':'',
        'In2':'',
        'Out2':''
      })
    }
    checkin.forEach(function(data){
        if(data.checktype == '') {
          $scope.flagValue = 1;
        }
    });

    if(item.notaddexc){
      notaddexcTotal.push(item.notaddexc);
    }
    if(normalTime && $scope.flagValue == 0) {
      var array = normalTime.split(':');
      if((array[0].length >2) || (array[1].length>2) || (array[2].length>2)) {
        normalTime = '00:00:00';
      }
      if(item.addweeklyexc){
        addweeklyexcTotal.push(item.addweeklyexc);
      } else {
        normalTimeTotal.push(normalTime);
      }
    } else {
      normalTimeTotal.push('00:00:00');
    }

    if(item.Exception && $scope.flagValue == 0 ){
      Exception = item.Exception;
    }else{
      Exception = '00:00:00';
    }

    if(item.ot1Rule && $scope.flagValue == 0 ){
      ot1Rule = item.ot1Rule;
    }else{
      ot1Rule = '00:00:00';
    }
    if(item.ot2Rule && $scope.flagValue == 0 ){
      ot2Rule = item.ot2Rule;
    }else{
      ot2Rule = '00:00:00';
    }

    if(item.cutException && $scope.flagValue == 0 ){
      cutException = item.cutException;
    }else{
      cutException = '00:00:00';
    }
              
    overTime1Total.push(ot1Rule);
    overTime2Total.push(ot2Rule);
    ExceptionTotal.push(Exception);
    cutExceptionTotal.push(cutException);
    totalAdjusted = changeFormat(totalAdjusted);

    var stringExc ='';
    if(item.ExceptionAssign && item.Exception){
       stringExc = item.ExceptionAssign +' '+item.Exception;
       stringExc = changeFormat(stringExc);
    }
    if(item.holiday){
      if(item.Exception){
        stringExc = 'Public Holiday '+ item.Exception;
        stringExc = changeFormat(stringExc);
      }else{
        stringExc = 'Public Holiday 0';
      }
      
    }
    $(".selectBox").removeAttr('disabled');
    var definedColor = '';
    if(item.holiday == true){                  
        definedColor = {color: 'red'};
    }
    $scope.attendanceList.push({
      'employeeNo':employeeNo,
      'attendanceId':attendanceId,               
      'date':date,
      'shift':shift,
      'checkinData':checkin,
      'totalRounded':totalAdjusted,
      'TotalArray':TotalArray,
      'flag':$scope.flagValue,
      'ExceptionAssign':item.ExceptionAssign,
      'managerSignedOff':item.managerSignedOff,
      'shiftColor':item.shiftColor,
      'holiday':item.holiday,
      'definedColor':definedColor,
      'stringExc':stringExc,
      'comment':comment,
      'readEmployee':item.readWriteForEmployee
    })  
  });
    
  normalTimeTotal.forEach(function(normaldata){ 
     $scope.normalTime += getSeconds(normaldata);
  });
  $scope.normalTime = secToFormatted($scope.normalTime); 

  overTime1Total.forEach(function(overTimeData){
     $scope.overTime1 += getSeconds(overTimeData);
  });
  $scope.overTime1 = secToFormatted($scope.overTime1);
 
  overTime2Total.forEach(function(overTimeData2){
     $scope.overTime2 += getSeconds(overTimeData2);
  });
  $scope.overTime2 = secToFormatted($scope.overTime2);

  ExceptionTotal.forEach(function(exceptionTotal){
     $scope.Exception += getSeconds(exceptionTotal);
  });

  cutExceptionTotal.forEach(function(cutexception1){
     $scope.cutException += getSeconds(cutexception1);
  });
  
  addweeklyexcTotal.forEach(function(addweeklyexc1){
     $scope.addweeklyexc += getSeconds(addweeklyexc1);
  });

  notaddexcTotal.forEach(function(notaddexc1){
     $scope.notaddexc += getSeconds(notaddexc1);
  });

  $scope.Exception = secToFormatted($scope.Exception);
  $scope.TotalValue = getSeconds($scope.normalTime) + getSeconds($scope.overTime1) +getSeconds($scope.overTime2) 
  $scope.Total = secToFormatted($scope.TotalValue);

  $scope.Total = changeFormat($scope.Total);
  $scope.normalTime = changeFormat($scope.normalTime);
  $scope.overTime1 = changeFormat($scope.overTime1);
  $scope.overTime2 = changeFormat($scope.overTime2);
  $scope.Exception = changeFormat($scope.Exception);

  var normalTimeTotal1 = [];
  var overTime1Total1 = [];
  var overTime2Total1 = [];
  if($scope.weeklyNT){
    var week = 0;
    var weekNT = 0;

    for(var i=0; i<$scope.newArrayNt.length;i++){  
      weekNT += getSeconds($scope.newArrayNt[i]);
      if(week == 6){
        var weeklyTime = secToFormatted(weekNT);                  
        $scope.weekNTArray.push(weeklyTime);
        weekNT = 0;
        week = 0;
      } else {
        if(!$scope.newArrayNt[i+1]){
          var weeklyTime = secToFormatted(weekNT); 
          $scope.weekNTArray.push(weeklyTime);
          weekNT = 0;
          week = 0;
        }
      }  
      week++;
    }
    for (var i = 0; i < $scope.weekNTArray.length; i++) {
      var time = getSeconds($scope.weekNTArray[i]);
      var timeWeekly = getSeconds($scope.weeklyNT); 
      var totalSeconds = '';  
      var OT1 = '';
      var OT2 = '';
      var normalTime = ''; 
      if(time > timeWeekly && $scope.weeklyNT != '00:00:00'){
        normalTime = $scope.weeklyNT;
        totalSeconds = time - timeWeekly;
        if(totalSeconds > getSeconds($scope.overtime)){  
          OT1 = $scope.overtime;
          var remaigntime = totalSeconds - getSeconds($scope.overtime);                  
          OT2 = secToFormatted(remaigntime);                  
        }else{
          OT1 = secToFormatted(totalSeconds);                  
          OT2 = '';
        }
      }else{
        normalTime = $scope.weekNTArray[i];
      }
      if(normalTime == ''){
        normalTime = '00:00:00';
      }
      if(OT1 == ''){
        OT1 = '00:00:00';
      }
      if(OT2 == ''){
        OT2 = '00:00:00';
      }
      normalTimeTotal1.push(normalTime);
      overTime1Total.push(OT1);
      overTime2Total.push(OT2);
    }
    $scope.normalTime = 0;
    $scope.overTime1 = 0;
    $scope.overTime2 = 0;       

    normalTimeTotal1.forEach(function(normalData){
       $scope.normalTime += getSeconds(normalData);
    });

    if($scope.normalTime != '00:00:00'){
      
      $scope.normalTime = $scope.normalTime - $scope.cutException
    }

    $scope.normalTime = secToFormatted($scope.normalTime); 
    overTime1Total.forEach(function(overTimeData){
       $scope.overTime1 += getSeconds(overTimeData);
    });
    $scope.overTime1 = secToFormatted($scope.overTime1);  
    overTime2Total.forEach(function(overTime2Data){
       $scope.overTime2 += getSeconds(overTime2Data);
    });

    $scope.overTime2 = secToFormatted($scope.overTime2);
    $scope.TotalValue = getSeconds($scope.normalTime) + getSeconds($scope.overTime1) +getSeconds($scope.overTime2)+ $scope.addweeklyexc
    if($scope.notaddexc){          
      $scope.TotalValue = $scope.TotalValue - $scope.notaddexc
    }
    
    $scope.Total = secToFormatted($scope.TotalValue);
    $scope.Total = changeFormat($scope.Total);
    $scope.ntm = $scope.addweeklyexc + getSeconds($scope.normalTime);
    $scope.ntmH = secToFormatted($scope.ntm);
    $scope.normalTime = changeFormat($scope.ntmH);
    $scope.overTime1 = changeFormat($scope.overTime1);
    
    $scope.overTime2 = changeFormat($scope.overTime2);
  }
}
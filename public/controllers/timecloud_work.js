// var timecloud = angular.module('timecloud',['sticky','ngRoute',"dndLists", 'ngSanitize','ui.bootstrap','employee','report','ui.bootstrap.datetimepicker']);
// timecloud.config(function ($routeProvider,$locationProvider){
// 		/*$momentProvider
// 			.asyncLoading(false)
// 			.scriptUrl('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min.js'),*/
// 		$routeProvider
// 			.when('/settings/',{
// 					controller : 'settingsController',
// 					templateUrl: '/settingspgae' // render a settings template
// 			})  
// 			.when('/home/',{     
// 					controller : 'homeController',    
// 					templateUrl: '/homepage' ,// render a home template
// 					/*resolve:{
// 						'MyServiceData':function(myService){
// 							// MyServiceData will also be injectable in your controller, if you don't want this you could create a new promise with the $q service
// 							return myService.promise;
// 						}
// 					}*/
// 			})
// 			.when('/home/:page',{
// 				 controller : 'homepageController',    
// 				 templateUrl: '/homepage' ,// render a home template           
// 			})
// 			.when('/globalrules/',{
// 					controller : 'ruleController',
// 					templateUrl: '/globalrulespage' // render a global rule template
// 			}) 
// 			.when('/shift/', {
// 					controller : 'shiftController',
// 					templateUrl: '/shift' // render a shift template
// 			}) 
// 			.when('/shift/edit/:shiftId',{
// 					controller : 'editShiftController',
// 					templateUrl: '/editshift' // render edit shift template
// 			}) 
// 			.when('/shiftpattern',{
// 					controller : 'shiftPatternController',
// 					templateUrl: '/shiftpattern' // render shift patternlist template
// 			}) 
// 			.when('/shiftpattern/create/',{
// 					controller : 'createshiftPatternController',
// 					templateUrl: '/createshiftpattern' // render shift pattern careate template
// 			})
// 			.when('/shiftpattern/edit/:shiftPatternId/',{
// 					controller : 'editshiftPatternController',
// 					templateUrl: '/editshiftpattern' // render shift pattern edit template
// 			})
// 			.when('/meterdashboard/',{
// 					controller : 'meterdashboardController',
// 					templateUrl: '/meterdashboard' // render shift pattern edit template
// 			})
// 			.when('/meterdashboard/:startDate/:endDate/:day',{
// 					controller : 'meterdashboardDayController',
// 					templateUrl: '/meterdashboard' // render shift pattern edit template
// 			})
// 			.when('/meterdashboard/:startDate/:endDate',{
// 					controller : 'meterDashboardNextControllers',
// 					templateUrl: '/meterdashboard', // render shift pattern edit template
// 					// resolve : { // it will get the detail of caregiver,child,prisoner,church,child from the database
// 					// 	getPeriodicData: ['$http','$route', function($http,$route) {
// 					// 		return $http({
// 					// 				method: 'get',
// 					// 				url: '/getdahboardData/'+$route.current.params.startDate+"/"+$route.current.params.endDate
// 					// 		});
// 					// 	}]
// 					// }
// 			})
// 			.when('/leaves/',{
// 					controller : 'leavesController',
// 					templateUrl: '/leaves' // render shift pattern edit template
// 			})
// 			.when('/usermessages',{
// 					controller : 'usermessagesController',
// 					templateUrl: '/usermessages'
// 			})
// 			.when('/usermessages/:page',{
// 				 controller : 'usermessagesNextController',    
// 				 templateUrl: '/usermessages' ,// render a home template           
// 			})
// 			.when('/openmessage/:msgId',{ 
// 					controller : 'openmessageController',
// 					templateUrl: '/openmessage'
// 			})				
// });
// timecloud.run(function ($rootScope, $location, $http, myService) {
// 	$rootScope.$on('$routeChangeStart', function (event, next, current) {
// 		$http.get('/isloggedin').success(function(data) {       
// 			if(data == 'false'){
// 				 location.reload();
// 			}
// 		});
// 		$http.get('/checkmessage').success(function(data) {       
// 			if(data != 0){       
// 				myService.setmessages(data.count); 
// 				if(data.msgData) {  
// 						myService.openModel(data.msgData);
// 				}
// 			}else{
// 				myService.setmessages(0);
// 			}
// 		});
// 	}); 
// });
// timecloud.service('myService', function ($http, $rootScope) {
// 	var shiftId = '' ;
// 	var shiftpatternId = '';
// 	var pattern = '';
// 	var shift = '';
// 	var updated = 0;
// 	var delayTime = 0;
// 	var myData = '';
// 	var settingValue = 0;
// 	var messageCount = '';
// 	var MessageData = '';
// 	var modalFlag = 0;
// 	var createPaternValue = 0;
// 	var department = '';
// 	return { 
// 			doStuff: function () {
// 					return myData;//.getSomeData();
// 			} ,        
// 			getShift : function() {
// 					return shiftId;
// 			},
// 			setCurrentShift: function(value){
// 					shiftId = value;
// 			},
// 			setArray: function(value){
// 				shift = value;
// 			},
// 			getShiftData : function() {
// 					return shift;
// 			},
// 			setUpdate : function() {
// 					updated = 1;
// 			},
// 			getUpdate :function() {
// 					return updated;
// 			},
// 			setDelayTime:function(value) {
// 					delayTime = value
// 			},
// 			getDelayTime:function() {                
// 					return delayTime;   
// 			},
// 			setCurrentShiftpattern: function(value){
// 					shiftpatternId = value;
// 			},
// 			ShiftpatternArray : function(value){
// 				pattern = value;
// 			},
// 			getCurrentShiftpattern: function(){
// 					return shiftpatternId;
// 			},
// 			getShiftpatternArray :function(){
// 					return pattern;
// 			},
// 			setSettingsValue:function(value){
// 				settingValue = value;
// 			},
// 			getSettingsValue:function(){
// 				return settingValue;
// 			},
// 			getmessages:function(){
// 				return messageCount;
// 			},
// 			setmessages:function(value){
// 				if(value != 0){
// 					messageCount = value ;
// 				}else{
// 					messageCount = '' ;
// 				}              
// 				$rootScope.$broadcast('message');
// 			},
// 			openModel:function(value){
// 				if(value){
// 					MessageData = value;
// 					$rootScope.$broadcast('openModel');
// 				}
// 			},
// 			getMessageData:function(){
// 				return MessageData;
// 			},
// 			setFlag:function(value){
// 				modalFlag = value;
// 			},
// 			getFlag:function(){
// 				return modalFlag;
// 			},
// 			setcreatePatern:function(value){
// 				createPaternValue = value
// 			},
// 			getcreatePatern:function(){
// 				return createPaternValue;
// 			},
// 			setDepartment:function(value){
// 				department = value
// 			},
// 			getDepartment:function(){
// 				return department;
// 			}
// 	};
// });
// timecloud.service('holidayservice', function ($rootScope) {
// 	var holidayval = 0;
// 	var rosterValue = 0;
// 	var projectValue = 0;
// 	var dashboardValue = 0;
// 	var time = 0;
// 	return {
// 		assignHoliday: function(holidayValue){
// 			holidayval = holidayValue;
// 			$rootScope.$broadcast('holidayChanged');
// 		},
// 		getAssignHoliday: function(){      
// 			return holidayval;
// 		},
// 		setTooltip: function(value){
// 			time = value;
// 			$rootScope.$broadcast('timeChanged');
// 		},
// 		getTooltip: function(){      
// 			return time;
// 		},
// 		assignRoster: function(value){
// 			rosterValue = value;
// 			$rootScope.$broadcast('rosterChanged');
// 		},
// 		getAssignRoster: function(){      
// 			return rosterValue;
// 		},
// 		assignProject : function(value){
// 			projectValue = value;
// 			$rootScope.$broadcast('projectChanged');
// 		},
// 		getAssignProject: function(){      
// 			return projectValue;
// 		},
// 		assignDashboard: function(value){
// 			dashboardValue = value;
// 			$rootScope.$broadcast('dashboardChanged');
// 		},
// 		getdashboard: function(){      
// 			return dashboardValue;
// 		},
// 	};
// });
// timecloud.controller('meterDashboardNextControllers',function ($route, $scope,$http,$location, myService,holidayservice,$routeParams, $modal,$timeout, $parse) { //header controller  
// 	// var dataDash = getPeriodicData.data.data;
// 	// console.log(dataDash);
// 	$scope.$on("$destroy", function(){
//     	clearTimeout(clearTime);
//   	});
// 	function changebutton(percentage,id){
// 		$("#half"+id).removeClass("buttonCustomCssGreen");
// 		$("#halfup"+id).removeClass("buttonCustomCssGreen");
// 		$("#full"+id).removeClass("buttonCustomCssGreen");
// 		$("#half"+id).addClass("buttonCustomCss");
// 		$("#halfup"+id).addClass("buttonCustomCss");
// 		$("#full"+id).addClass("buttonCustomCss");
// 		if(percentage >= 50 && percentage<= 74){
// 			$("#half"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#halfup"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#full"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}else if(percentage >= 75 && percentage<= 99){
// 			$("#halfup"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#half"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#full"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}else if(percentage >= 100){
// 			$("#full"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#half"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#halfup"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}    
// 	};  
// 	function initDashboardFirst(){
// 		var idArry1 = [];
// 		var idArry = [];
// 		var clearTime;
// 		$scope.showDashboard = true;
// 		$scope.lastPerData='';
// 		$scope.showLoading = false;
// 		$scope.subDepartmentUser = localStorage.getItem("adminType");
// 		$scope.adminDeptList = [];
// 		$scope.dynamicText = "week";
// 		$http.get('/checkadminDept').success(function(deptList) {
// 			$scope.adminDeptList = deptList;
// 			var data = {
// 				'start':$route.current.params.startDate,
// 				'end':$route.current.params.endDate
// 			};	
// 			$http.get("/getPayperiod").success(function(periodicData) {
// 				if(data.start == periodicData.start && data.end == periodicData.end){
// 					$scope.initDashboard(true);	
// 				}
// 				console.log(periodicData);
// 				var date = moment(periodicData.end);
// 				var sDate = date.add(42, 'days');
// 				var sDt = moment(sDate).format("YYYY-MM-DD");
// 				console.log($route.current.params.endDate);
// 				console.log(sDt);
// 				if(sDt==$route.current.params.endDate) {
// 					$("#nextBtn").removeClass("buttonCustomCss");
// 					$("#nextBtn").addClass("buttonCustomDisable");
// 				} else {
// 					$("#nextBtn").addClass("buttonCustomCss");
// 					$("#nextBtn").removeClass("buttonCustomDisable");
// 				}
// 			});	
// 			getDashboardData(deptList,data);			
// 		});
// 	};	
// 	function getDashboardData(deptList, data) {
// 		// console.log(data);
// 		// var date = moment(periodicData.end);
// 		// var sDate = date.add(1, 'days');
// 		// var sDt = moment(sDate).format("YYYY-MM-DD");
// 		// if(sDt=dataDash.weekStart) {
// 		// 	$("#nextBtn").removeClass("buttonCustomCss");
// 		// 	$("#nextBtn").addClass("buttonCustomDisable");
// 		// } else {
// 		// 	$("#nextBtn").addClass("buttonCustomCss");
// 		// 	$("#nextBtn").removeClass("buttonCustomDisable");
// 		// }
// 	    $http.get("/getdahboardData/" + data.start + "/" + data.end).success(function(dataDashs) {
// 	        var startDate = data.start;
// 	        var endDate = data.end;
// 	        $scope.dateArray = [];
// 	        while (startDate <= endDate) {
// 	            $scope.dateArray.push(startDate);
// 	            var date = moment(startDate);
// 	            var sDate = date.add(1, 'days');
// 	            startDate = moment(sDate).format("YYYY-MM-DD");
// 	        }
// 	        var dataDash = dataDashs.data;
// 	        console.log("cal status " +dataDash.calfalg);
// 	        if (dataDash !== null) {
// 	        	// console.log("not null");
// 	            var workHours = dataDash.workedHours;
// 	            workHours = workHours.split(":");
// 	            workHours = workHours[0];
// 	            workHours = parseInt(workHours);
// 	            var moneySpent = dataDash.moneySpent;
// 	            if (workHours == '0') {
// 	                $scope.actulPer = '00';
// 	            } else if (moneySpent == '0') {
// 	                $scope.actulPer = '00';
// 	            } else {
// 	                $scope.actulPer = Math.round(workHours * 100 / parseInt(moneySpent));
// 	            }
// 	            if (dataDash.budgetedSales)
// 	                $scope.budgetedSale = dataDash.budgetedSales;
// 	            if (dataDashs.prvsDatas !== true) {
// 	                $("#prvBtn").removeClass("buttonCustomCss");
// 	                $("#prvBtn").addClass("buttonCustomDisable");
// 	            } else {
// 	                $("#prvBtn").addClass("buttonCustomCss");
// 	                $("#prvBtn").removeClass("buttonCustomDisable");
// 	            }
// 	            var percentage = dataDash.percentageUsed;
// 	            if (parseInt(percentage) > 150 && (dataDash.percentageUsed) !== '') {
// 	                $scope.pData = 150;
// 	            } else if ((dataDash.percentageUsed) !== '') {
// 	                if (dataDash.percentageUsed == 'NaN') {
// 	                    $scope.pData = 0;
// 	                } else {
// 	                    $scope.pData = dataDash.percentageUsed;
// 	                }
// 	            } else {
// 	                $scope.pData = 0;
// 	            }
// 	            changebutton(percentage, 'main');
// 	            if ($scope.pData != $scope.lastPerData) {
// 	            	console.log("% work changed");
// 	                $scope.showLoading = false;
// 	                $("#showLoading").css("opacity", "1");
// 	                $scope.lastPerData = $scope.pData;
// 	                $scope.pData = Math.round($scope.pData);
// 	                if (deptList != 'false') {
// 	                	console.log("Subadmin data");
// 	                    if (dataDash.departments !== null) {
// 	                        var newallocatedHours = 0;
// 	                        var newworkedHours = 0;
// 	                        var newmoneySpent = 0;
// 	                        var budgetedSalesTotal = 0;
// 	                        var budgetedWagesTotal = 0;
// 	                        var actualSalesTotal = 0;
// 	                        var result = [];
// 	                        var cnt = 0;
// 	                        deptList.forEach(function(key) {
// 	                            cnt++;
// 	                            dataDash.departments.filter(function(item) {
// 	                                if (item.departmentName == key) {
// 	                                    budgetedSalesTotal += parseInt(item.budgetedSales);
// 	                                    budgetedWagesTotal += parseInt(item.budgetedWages);
// 	                                    actualSalesTotal += parseInt(item.actualSales);
// 	                                    result.push(item);
// 	                                    var alcHrs = item.allocatedHours.split(":");
// 	                                    alcHrs = alcHrs[0];
// 	                                    alcHrs = parseInt(alcHrs);
// 	                                    newallocatedHours = newallocatedHours + alcHrs;
// 	                                    var workedH = item.workedHours.split(":");
// 	                                    workedH = workedH[0];
// 	                                    workedH = parseInt(workedH);
// 	                                    newworkedHours = newworkedHours + workedH;
// 	                                    var mSpend = item.moneySpent;
// 	                                    mSpend = parseInt(mSpend);
// 	                                    newmoneySpent = newmoneySpent + mSpend;
// 	                                }
// 	                            });
// 	                            if (cnt == deptList.length) {
// 	                                dataDash.budgetedSales = budgetedSalesTotal;
// 	                                dataDash.budgetedWages = budgetedWagesTotal;
// 	                                dataDash.moneySpent = newmoneySpent;
// 	                                dataDash.actualSales = actualSalesTotal;
// 	                                if (newworkedHours != '0') {
// 	                                    dataDash.percentageUsed = (newworkedHours * 100) / newallocatedHours;
// 	                                } else {
// 	                                    dataDash.percentageUsed = 0;
// 	                                }
// 	                                dataDash.allocatedHours = newallocatedHours + ":00:00";
// 	                                dataDash.workedHours = newworkedHours + ":00:00";
// 	                                dataDash.departments = result;
// 	                                $scope.dashboardData = dataDash;
// 	                            }
// 	                        });
// 	                    }
// 	                    console.log(dataDashs);
// 	                    if (dataDashs.subDepartmentList.subDepartments && localStorage.getItem("adminType") == "subAdmin") {
// 	                        var result1 = [];
// 	                        var cnt1 = 0;
// 	                        deptList.forEach(function(key1) {
// 	                            cnt1++;
// 	                            dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 	                                if (item1.parentDeptName == key1) {
// 	                                    result1.push(item1);
// 	                                }
// 	                            });
// 	                            if (cnt1 == deptList.length) {
// 	                                dataDashs.subDepartmentList.subDepartments = result1;
// 	                                if (localStorage.getItem("adminType") == "subAdmin") {
// 	                                    $scope.subDepartments = dataDashs.subDepartmentList;
// 	                                }
// 	                            }
// 	                        });
// 	                    }
// 		            } else {
// 	                	// console.log("Admin data");
// 	                    if (localStorage.getItem("adminType") == "subAdmin") {
// 	                        $scope.subDepartments = dataDashs.subDepartmentList;
// 	                    }
// 	                    $scope.dashboardData = dataDash;
// 	                    // console.log($scope.dashboardData);
// 	                    // console.log("i am here final");
// 	                }
// 	                idArry1 = [];
// 	                idArry = [];
// 	                $('#guageMeter').highcharts({
// 	                    chart: {
// 	                        type: 'gauge',
// 	                        plotBackgroundColor: null,
// 	                        plotBackgroundImage: null,
// 	                        plotBorderWidth: 0,
// 	                        plotShadow: false
// 	                    },
// 	                    title: {
// 	                        text: ''
// 	                    },
// 	                    pane: {
// 	                        startAngle: -150,
// 	                        endAngle: 150,
// 	                    },
// 	                    yAxis: {
// 	                        min: 0,
// 	                        max: 150,
// 	                        minorTickInterval: 'auto',
// 	                        minorTickWidth: 1,
// 	                        minorTickLength: 10,
// 	                        minorTickPosition: 'inside',
// 	                        minorTickColor: '#666',
// 	                        tickPixelInterval: 20,
// 	                        tickWidth: 2,
// 	                        tickPosition: 'inside',
// 	                        tickLength: 10,
// 	                        tickColor: '#666',
// 	                        labels: {
// 	                            step: 2,
// 	                            rotation: 'auto'
// 	                        },
// 	                        title: {
// 	                            text: 'Percentage',
// 	                            y: 15, // 10 pixels down from the top
// 	                        },
// 	                        plotBands: [{
// 	                            from: 0,
// 	                            to: 75,
// 	                            color: '#56c03c' // green
// 	                        }, {
// 	                            from: 75,
// 	                            to: 100,
// 	                            color: '#f27c4e' // orange
// 	                        }, {
// 	                            from: 100,
// 	                            to: 150,
// 	                            color: '#e15352' // red
// 	                        }]
// 	                    },
// 	                    series: [{
// 	                        name: 'Hour Used',
// 	                        data: [$scope.pData],
// 	                        tooltip: {
// 	                            valueSuffix: ' %'
// 	                        }
// 	                    }]
// 	                }, function(chart) {
// 	                    clearTime = setTimeout(function() {
// 	                        getDashboardData(deptList, data);
// 	                    }, 10000);
// 	                });
// 	            } else {
// 	            	 $scope.showLoading = false;
// 	            	console.log("% work unchanged " +$scope.lastPerData);
// 	                clearTime = setTimeout(function() {
// 	                    getDashboardData(deptList, data);
// 	                }, 10000);
// 	            }
// 	        }else{
// 	        	$scope.showLoading = false;
// 	        	console.log("dashboard null");
// 	        }
// 	    });
// 	};
// 	$scope.getSubCategories=function(department) {
// 		var workHours = department.workedHours;
// 		workHours = workHours.split(":");
// 		workHours = workHours[0];
// 		workHours = parseInt(workHours);
// 		var moneySpent = department.moneySpent;
// 		if(workHours=='0') {
// 			$scope.actualDeptPer = '00';
// 		} else if(moneySpent=='0') {
// 			$scope.actualDeptPer = '00';
// 		} else {
// 			var actualDeptPer = workHours * 100 / parseInt(moneySpent);
// 			$scope.actualDeptPer =  Math.round(actualDeptPer);
// 		}
// 		if(idArry.indexOf(department._id)==-1) {
// 			idArry.push(department._id);
// 			var percentages = 0;
// 			if(department.percentageUsed!='NaN' && department.percentageUsed!='') {
// 				percentages = Math.round(department.percentageUsed);
// 			}
// 			if(percentages>150) {
// 				percentages=150;
// 			}      
// 			if(department.departmentName) {
// 				$('#meter'+department._id).highcharts({
// 					chart: {
// 						type: 'gauge',
// 						plotBackgroundColor: null,
// 						plotBackgroundImage: null,
// 						plotBorderWidth: 0,
// 						plotShadow: false
// 					},
// 					title: {
// 						text: ''
// 					},
// 					pane: {
// 						startAngle: -150,
// 						endAngle: 150,
// 					},
// 					yAxis: {
// 						min: 0,
// 						max: 150,
// 						minorTickInterval: 'auto',
// 						minorTickWidth: 1,
// 						minorTickLength: 10,
// 						minorTickPosition: 'inside',
// 						minorTickColor: '#666',
// 						tickPixelInterval: 20,
// 						tickWidth: 2,
// 						tickPosition: 'inside',
// 						tickLength: 10,
// 						tickColor: '#666',
// 						labels: {
// 							step: 2,
// 							rotation: 'auto'
// 						},
// 						title: {
// 							text: 'Percentage',
// 							y: 15, // 10 pixels down from the top
// 							style: {
// 									fontSize: '11px'                 
// 							}
// 						},
// 						plotBands: [{
// 							from: 0,
// 							to: 75,
// 							color: '#56c03c' // green
// 						}, {
// 							from: 75,
// 							to: 100,
// 							color: '#f27c4e' // orange
// 						}, {
// 							from: 100,
// 							to: 150,
// 							color: '#e15352' // red
// 						}]
// 					},
// 					series: [{
// 						name: 'Hour Used',
// 						data: [percentages],
// 						tooltip: {
// 							valueSuffix: ' %'
// 						}
// 					}]
// 				},function (chart) {
// 					//setTimeout(poll(),10000);
// 				});
// 			}
// 		}
// 	};
// 	function getDateWiseData(deptList,dataDash,dataDashs,type) {
// 		if(dataDash!=null) {
// 			var workHours = dataDash.workedHours;
// 			workHours = workHours.split(":");
// 			workHours = workHours[0];
// 			workHours = parseInt(workHours);
// 			var moneySpent = dataDash.moneySpent;						
// 			if(workHours=='0') {
// 				$scope.actulPer = '00';
// 			} else if(moneySpent=='0') {
// 				$scope.actulPer = '00';
// 			} else {
// 				$scope.actulPer = Math.round(workHours * 100 / parseInt(moneySpent));
// 			}
// 			if(dataDash.budgetedSales)
// 				$scope.budgetedSale = dataDash.budgetedSales;				
// 			// if(dataDashs.prvsDatas!==true) {
// 			// 	$("#prvBtn").removeClass("buttonCustomCss");
// 			// 	$("#prvBtn").addClass("buttonCustomDisable");
// 			// } else {
// 			// 	$("#prvBtn").addClass("buttonCustomCss");
// 			// 	$("#prvBtn").removeClass("buttonCustomDisable");
// 			// }						
// 			var percentage = dataDash.percentageUsed;
// 			if(parseInt(percentage)>150 && (dataDash.percentageUsed)!='') {
// 				$scope.pData = 150;
// 			} else if((dataDash.percentageUsed)!='') {
// 				if(dataDash.percentageUsed=='NaN') {
// 					$scope.pData = 0;
// 				} else {
// 					$scope.pData = dataDash.percentageUsed;							
// 				}              
// 			} else {
// 				$scope.pData = 0;
// 			}
// 			changebutton(percentage,'main');
// 			$scope.showLoading=false;
// 			$("#showLoading").css("opacity","1");			
// 			$scope.lastPerData = $scope.pData;
// 			$scope.pData = Math.round($scope.pData);
// 			if(deptList != 'false') {
// 				if(dataDash.departments!=null) {
// 					var newallocatedHours = 0;
// 					var newworkedHours = 0;									
// 					var newmoneySpent = 0;
// 					var budgetedSalesTotal=0;
// 					var budgetedWagesTotal=0;
// 					var result = [];
// 					var actualSalesTotal = 0;
// 					var cnt = 0;
// 					deptList.forEach(function(key) {
// 						cnt++;										
// 						dataDash.departments.filter(function(item) {											
// 							if(item.departmentName == key) {												
// 								budgetedSalesTotal+=parseInt(item.budgetedSales);
// 								budgetedWagesTotal+=parseInt(item.budgetedWages);
// 								actualSalesTotal += parseInt(item.actualSales);
// 								result.push(item);
// 								var alcHrs=item.allocatedHours.split(":");												
// 								alcHrs = alcHrs[0];
// 								alcHrs = parseInt(alcHrs);
// 								newallocatedHours=newallocatedHours+alcHrs;
// 								var workedH=item.workedHours.split(":");
// 								workedH = workedH[0];
// 								workedH = parseInt(workedH);
// 								newworkedHours=newworkedHours+workedH;
// 								var mSpend=item.moneySpent;												
// 								mSpend = parseInt(mSpend);
// 								newmoneySpent=newmoneySpent+mSpend;
// 							}
// 						});
// 						if(cnt==deptList.length) {											
// 							dataDash.budgetedSales=budgetedSalesTotal;
// 							dataDash.budgetedWages=budgetedWagesTotal;
// 							dataDash.moneySpent = newmoneySpent;
// 							dataDash.actualSales = actualSalesTotal;
// 							if(newworkedHours!='0') {
// 								dataDash.percentageUsed = (newworkedHours*100)/newallocatedHours;	
// 							} else {
// 								dataDash.percentageUsed = 0;
// 							}
// 							dataDash.allocatedHours = newallocatedHours+":00:00";
// 							dataDash.workedHours = newworkedHours+":00:00";
// 							dataDash.departments = result
// 							$scope.dashboardData = dataDash; 
// 						}
// 					});
// 				}
// 				if(dataDashs.subDepartmentList.subDepartments && localStorage.getItem("adminType")=="subAdmin") {
// 					var result1 = [];
// 					var cnt1 = 0;
// 					deptList.forEach(function(key1) {
// 						cnt1++;
// 						dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 							if(item1.parentDeptName == key1) {
// 								result1.push(item1);												
// 							}
// 						});
// 						if(cnt1==deptList.length) {
// 							dataDashs.subDepartmentList.subDepartments = result1;
// 							if(localStorage.getItem("adminType")=="subAdmin") {
// 								$scope.subDepartments = dataDashs.subDepartmentList; 
// 							}
// 						}
// 					})
// 				}
// 			} else {
// 				if(localStorage.getItem("adminType")=="subAdmin") {
// 					$scope.subDepartments= dataDashs.subDepartmentList;
// 				}
// 				$scope.dashboardData = dataDash;
// 			}							
// 			idArry1 = [];
// 			idArry = [];
// 			$('#guageMeter').highcharts({
// 				chart: {
// 					type: 'gauge',
// 					plotBackgroundColor: null,
// 					plotBackgroundImage: null,
// 					plotBorderWidth: 0,
// 					plotShadow: false
// 				},
// 				title: {
// 					text: ''
// 				},
// 				pane: {
// 					startAngle: -150,
// 					endAngle: 150,
// 				},
// 				yAxis: {
// 					min: 0,
// 					max: 150,
// 					minorTickInterval: 'auto',
// 					minorTickWidth: 1,
// 					minorTickLength: 10,
// 					minorTickPosition: 'inside',
// 					minorTickColor: '#666',
// 					tickPixelInterval: 20,
// 					tickWidth: 2,
// 					tickPosition: 'inside',
// 					tickLength: 10,
// 					tickColor: '#666',
// 					labels: {
// 						step: 2,
// 						rotation: 'auto'
// 					},
// 					title: {
// 						text: 'Percentage',
// 						y: 15, // 10 pixels down from the top
// 					},
// 					plotBands: [{
// 						from: 0,
// 						to: 75,
// 						color: '#56c03c' // green
// 					}, {
// 						from: 75,
// 						to: 100,
// 						color: '#f27c4e' // orange
// 					}, {
// 						from: 100,
// 						to: 150,
// 						color: '#e15352' // red
// 					}]
// 				},
// 				series: [{
// 					name: 'Hour Used',
// 					data: [$scope.pData],
// 					tooltip: {
// 						valueSuffix: ' %'
// 					}
// 				}]
// 			},function (chart) {
// 			});				
// 		}
// 	};
// 	/*date change*/
// 	$scope.dateWiseDashboard = function(date,start,end,companyId) {
// 		if(date!==""){
// 			$scope.dynamicText = "day";
// 			$("#weeklyDashboard").addClass("buttonCustomCss");
// 			$("#weeklyDashboard").removeClass("buttonCustomDisable1");
// 			$("#currentDateDashboard").addClass("buttonCustomCss");
// 			$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 			$scope.showLoading=true;				
// 			$("#showLoading").css("opacity","0.2");
// 			clearTimeout(clearTime);
// 			var datas = {date:date,startDate:start,endDate:end};
// 			var deptList =$scope.adminDeptList;
// 			$http.post('/getDateWiseRecord',datas).success(function(dataDashs) {
// 				if(dataDashs.data) {
// 					var dataDash = dataDashs.data;
// 					dataDash.weekEnd=end;
// 					dataDash.weekStart=start;
// 					getDateWiseData(deptList,dataDash,dataDashs,$scope.dynamicText);
// 				}
// 			});
// 		}else{
// 			$scope.dynamicText = "week";
// 			$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 			$("#weeklyDashboard").removeClass("buttonCustomCss");
// 			// $("#currentDateDashboard").addClass("buttonCustomDisable1");
// 			// $("#currentDateDashboard").removeClass("buttonCustomCss");
// 			console.log("empty date selected");
// 			$scope.initDashboard(false);
// 		}	
// 	};
// 	$scope.initDashboard = function(cal){
// 		console.log(cal);
// 		if($route.current.params.startDate && $route.current.params.endDate && cal===true)
// 			$location.path('/meterdashboard');
// 	}
// 	$scope.getSubsSubCategories=function(department) {
// 		if(idArry1.indexOf(department._id)==-1) {
// 			idArry1.push(department._id);
// 			var percentages = 0;
// 			if(department.percentageUsed!='NaN' && department.percentageUsed!='') {
// 				percentages = Math.round(department.percentageUsed);
// 			}
// 			if(percentages>150) {
// 				percentages=150;
// 			}      
// 			if(department.subDeptName) {
// 				$('#subMeter'+department._id).highcharts({
// 					chart: {
// 						type: 'gauge',
// 						plotBackgroundColor: null,
// 						plotBackgroundImage: null,
// 						plotBorderWidth: 0,
// 						plotShadow: false
// 					},
// 					title: {
// 						text: ''
// 					},
// 					pane: {
// 						startAngle: -150,
// 						endAngle: 150,
// 					},
// 					yAxis: {
// 						min: 0,
// 						max: 150,
// 						minorTickInterval: 'auto',
// 						minorTickWidth: 1,
// 						minorTickLength: 10,
// 						minorTickPosition: 'inside',
// 						minorTickColor: '#666',
// 						tickPixelInterval: 20,
// 						tickWidth: 2,
// 						tickPosition: 'inside',
// 						tickLength: 10,
// 						tickColor: '#666',
// 						labels: {
// 							step: 2,
// 							rotation: 'auto'
// 						},
// 						title: {
// 							text: 'Percentage',
// 							y: 15, // 10 pixels down from the top
// 							style: {
// 									fontSize: '11px'                 
// 							}
// 						},
// 						plotBands: [{
// 							from: 0,
// 							to: 75,
// 							color: '#56c03c' // green
// 						}, {
// 							from: 75,
// 							to: 100,
// 							color: '#f27c4e' // orange
// 						}, {
// 							from: 100,
// 							to: 150,
// 							color: '#e15352' // red
// 						}]
// 					},
// 					series: [{
// 						name: 'Hour Used',
// 						data: [percentages],
// 						tooltip: {
// 							valueSuffix: ' %'
// 						}
// 					}]
// 				},function (chart) {
// 					//setTimeout(poll(),10000);
// 				});
// 			}
// 		}
// 	}
// 	$scope.checkPerFun = function(percentage,id) {
// 		changebutton(percentage,id);
// 	};
// 	$scope.previousDashBoardDataFn=function(weekStart,weekEnd,companyId) {
// 		var date = moment(weekStart);
// 		var eDate = date.subtract(1, 'days');
// 		var EndDate = moment(eDate).format("YYYY-MM-DD");
// 		var d1 = moment(weekStart);
// 		var d2 = moment(weekEnd);
// 		var days = moment.duration(d2.diff(d1)).asDays();
// 		var sDate = date.subtract(days, 'days');
// 		var startDate = moment(sDate).format("YYYY-MM-DD");
// 		$location.path('/meterdashboard/'+startDate+'/'+EndDate);
// 	}
// 	$scope.nextDashBoardDataFn=function(weekStart,weekEnd,companyId) {
// 		var date = moment(weekEnd);
// 		var sDate = date.add(1, 'days');
// 		var startDate = moment(sDate).format("YYYY-MM-DD");
// 		var d1 = moment(weekStart);
// 		var d2 = moment(weekEnd);
// 		var days = moment.duration(d2.diff(d1)).asDays();
// 		var eDate = date.add(days, 'days');
// 		var endDate = moment(eDate).format("YYYY-MM-DD");
// 		$location.path('/meterdashboard/'+startDate+'/'+endDate);
// 	}
// 	// $scope.saveSubDeptBudgetedSale = function(id,budgetedSubDeptSale) {
// 	// 	if(budgetedSubDeptSale=='') 
// 	// 		budgetedSubDeptSale = 0
// 	// 	var data = {subDepartmentId:id,weekEnd:$routeParams.endDate,weekStart:$routeParams.startDate,budgetedSale:budgetedSubDeptSale};
// 	// 	$http.post('/budgetedSubDeptSaleSave',data).success(function(resp){
// 	// 		if(resp===true){
// 	// 			model.assign($scope, true);
// 	// 			$timeout(function() {
// 	// 		        model.assign($scope, false);
// 	// 		    }, 3000);
// 	// 		}else{
// 	// 			model.assign($scope, 'errors');
// 	// 			$timeout(function() {
// 	// 		        model.assign($scope, false);
// 	// 		    }, 3000);
// 	// 		}    
// 	// 	});		
// 	// }
// 	$scope.saveSubDeptBudgetedSale = function(id,budgetedSubDeptSale,index,curDate,allocatedHours) {
// 		var model = $parse('subDeptSaleSaved'+index);
// 		console.log(parseInt(allocatedHours));
// 		if(parseInt(allocatedHours)>0){
// 			if(budgetedSubDeptSale=='') 
// 				budgetedSubDeptSale = 0
// 			// var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,myDate:curDate,budgetedSale:budgetedSubDeptSale};
// 			var data = {subDepartmentId:id,weekEnd:$routeParams.endDate,weekStart:$routeParams.startDate,myDate:curDate,budgetedSale:budgetedSubDeptSale};
// 			// console.log(data);
// 			$http.post('/budgetedSubDeptSaleSave',data).success(function(resp){
// 				console.log(JSON.parse(resp));
// 				if(JSON.parse(resp)){
// 					console.log("if");
// 					model.assign($scope, true);
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}else{
// 					console.log("else");
// 					model.assign($scope, 'errors');
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}    
// 			});
// 		}else{
// 			model.assign($scope, 'errors');
// 			$timeout(function() {
// 		        model.assign($scope, false);
// 		    }, 3000);
// 		}	
// 	};
// 	// $scope.saveSubDeptActualSale = function(id,actualSales) {
// 	// 	if(actualSales=='') 
// 	// 		actualSales = 0
// 	// 	var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,actualSales:actualSales};
// 	// 	$http.post('/actualSubDeptSaleSave',data).success(function(resp){
// 	// 		if(resp===true){
// 	// 			model.assign($scope, true);
// 	// 			$timeout(function() {
// 	// 		        model.assign($scope, false);
// 	// 		    }, 3000);
// 	// 		}else{
// 	// 			model.assign($scope, 'errors');
// 	// 			$timeout(function() {
// 	// 		        model.assign($scope, false);
// 	// 		    }, 3000);
// 	// 		}    	
// 	// 	});		
// 	// }
// 	$scope.saveSubDeptActualSale = function(id,actualSales,index,curDate,allocatedHours) {
// 		var model = $parse('actSubDeptSaleSaved'+index);
// 		console.log(parseInt(allocatedHours));
// 		if(parseInt(allocatedHours)>0){
// 			if(actualSales=='') 
// 				actualSales = 0
// 			var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,myDate:curDate,actualSales:actualSales};
// 			// var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,actualSales:actualSales};
// 			$http.post('/actualSubDeptSaleSave',data).success(function(resp){
// 				console.log(JSON.parse(resp));
// 				if(JSON.parse(resp)){
// 					console.log("if");
// 					model.assign($scope, true);
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}else{
// 					console.log("else");
// 					model.assign($scope, 'errors');
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}    
// 			});
// 		}else{
// 			model.assign($scope, 'errors');
// 			$timeout(function() {
// 		        model.assign($scope, false);
// 		    }, 3000);
// 		}				
// 	};
// 	initDashboardFirst();
// 	// $scope.saveBudgetedSale = function(budgetedSales) {
// 	// 	if(budgetedSales=='')
// 	// 		budgetedSales = '0'
// 	// 	var data = {weekEnd:$routeParams.endDate,weekStart:$routeParams.startDate,budgetedSale:budgetedSales};
// 	// 	console.log(data)
// 	// 	$http.post('/budgetedSaleSave',data).success(function(data) {
// 	// 		if(data){
// 	// 			$scope.saleSaved=true;
// 	// 			$timeout(function() {
// 	// 		        $scope.saleSaved=false;
// 	// 		    }, 3000);
// 	// 		}
// 	// 	});
// 	// }
// 	// $scope.saveDeptBudgetedSale = function(id,budgetedDeptSale,index) {
// 	// 	console.log(index);
// 	// 	var the_string = 'deptSaleSaved'+index;
// 	// 	var model = $parse(the_string);
// 	// 	if(budgetedDeptSale=='')
// 	// 		budgetedDeptSale=0;
// 	// 	var data = {departmentId:id,weekEnd:$routeParams.endDate,weekStart:$routeParams.startDate,budgetedSale:budgetedDeptSale};
// 	// 	$http.post('/budgetedDeptSaleSave',data).success(function(data){
// 	// 		if(data){
// 	// 			model.assign($scope, true);
// 	// 			$timeout(function() {
// 	// 		        model.assign($scope, false);
// 	// 		    }, 3000);
// 	// 		}
// 	// 	});		
// 	// }
// 	// $scope.saveMainActualSale = function(actualSales) {
// 	// 	if(actualSales=='')
// 	// 		actualSales = '0'
// 	// 	var data = {weekEnd:$routeParams.endDate,weekStart:$routeParams.startDate,actualSales:actualSales};
// 	// 	console.log(data);
// 	// 	$http.post('/actualSaleSave',data).success(function(data) {
// 	// 		if(data){
// 	// 			$scope.aSaleSaved= true;
// 	// 		}
// 	// 	});
// 	// }
// 	// $scope.saveDeptActualSale = function(id,actualDeptSale) {
// 	// 	if(actualDeptSale=='')
// 	// 		actualDeptSale=0;
// 	// 	var data = {departmentId:id,weekEnd:$routeParams.endDate,weekStart:$routeParams.startDate,actualSale:actualDeptSale};
// 	// 	$http.post('/actualDeptSaleSave',data).success(function(data){});		
// 	// }
// 	// $scope.assignSubHours = function(value, id){
// 	// 	var data = {
// 	// 		start:$scope.start,
// 	// 		end:$scope.end,
// 	// 		hours:value,
// 	// 		id:'dept/'+id,
// 	// 	}
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.post('/allocateSubHours',data).success(function(data){
// 	// 			if(data == "true"){     
// 	// 				$http.get("/getdahboardData/"+$routeParams.startDate+"/"+$routeParams.endDate).success(function(dataDash) {
// 	// 					if(dataDash){ 
// 	// 						$("#"+id).val('');
// 	// 						idArry = [];
// 	// 						idArry1 = [];
// 	// 						if(deptList != 'false') {								
// 	// 							if(dataDash.data.departments!=null) {
// 	// 								var newallocatedHours = 0;
// 	// 								var newworkedHours = 0;									
// 	// 								var newmoneySpent = 0;									
// 	// 								var result = [];
// 	// 								var cnt = 0;
// 	// 								deptList.forEach(function(key) {
// 	// 									cnt++;
// 	// 									dataDash.data.departments.filter(function(item) {
// 	// 										if(item.departmentName == key) {
// 	// 											result.push(item);
// 	// 											var alcHrs=item.allocatedHours.split(":");												
// 	// 											alcHrs = alcHrs[0];
// 	// 											alcHrs = parseInt(alcHrs);
// 	// 											newallocatedHours=newallocatedHours+alcHrs;
// 	// 											var workedH=item.workedHours.split(":");
// 	// 											workedH = workedH[0];
// 	// 											workedH = parseInt(workedH);
// 	// 											newworkedHours=newworkedHours+workedH;
// 	// 											var mSpend=item.moneySpent;												
// 	// 											mSpend = parseInt(mSpend);
// 	// 											newmoneySpent=newmoneySpent+mSpend;
// 	// 										}
// 	// 									});
// 	// 									if(cnt==deptList.length) {
// 	// 										dataDash.data.moneySpent = newmoneySpent;
// 	// 										dataDash.data.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 										dataDash.data.allocatedHours = newallocatedHours+":00:00";
// 	// 										dataDash.data.workedHours = newworkedHours+":00:00";
// 	// 										dataDash.data.departments = result
// 	// 										$scope.dashboardData = dataDash.data; 
// 	// 									}
// 	// 								});
// 	// 							}
// 	// 							if(dataDash.subDepartmentList!=null) {
// 	// 								var result1 = [];
// 	// 								var cnt1 = 0;
// 	// 								deptList.forEach(function(key1) {
// 	// 									cnt1++;
// 	// 									dataDash.subDepartmentList.filter(function(item1) {
// 	// 										if(item1.parentDeptName == key1) {
// 	// 											result1.push(item1);
// 	// 										}
// 	// 									});
// 	// 									if(cnt1==deptList.length) {
// 	// 										dataDash.subDepartmentList = result;
// 	// 										if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 											$scope.subDepartments =dataDash.subDepartmentList; 
// 	// 										}
// 	// 									}
// 	// 								})
// 	// 							}
// 	// 						} else {
// 	// 							if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 								$scope.subDepartments= dataDashs.subDepartmentList;
// 	// 							}								
// 	// 							$scope.dashboardData = dataDash.data;
// 	// 						}
// 	// 					}
// 	// 				}); 
// 	// 			}
// 	// 		});
// 	// 	});
// 	// }
// 	// $scope.assignHours = function(value, id){
// 	// 	var data = {
// 	// 		start:$scope.start,
// 	// 		end:$scope.end,
// 	// 		hours:value,
// 	// 		id:'dept/'+id,
// 	// 	}
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.post('/allocateHours',data).success(function(data){
// 	// 			if(data == "true") {
// 	// 				setTimeout(function(){      
// 	// 					$http.get("/getdahboardData/"+$routeParams.startDate+"/"+$routeParams.endDate).success(function(dataDash) {
// 	// 						if(dataDash){
// 	// 							$("#"+id).val('');
// 	// 							idArry = [];
// 	// 							idArry1 = [];
// 	// 							if(deptList != 'false') {								
// 	// 								if(dataDash.data.departments!=null) {
// 	// 									var newallocatedHours = 0;
// 	// 									var newworkedHours = 0;									
// 	// 									var newmoneySpent = 0;									
// 	// 									var result = [];
// 	// 									var cnt = 0;
// 	// 									deptList.forEach(function(key) {
// 	// 										cnt++;
// 	// 										dataDash.data.departments.filter(function(item) {
// 	// 											if(item.departmentName == key) {
// 	// 												result.push(item);
// 	// 												var alcHrs=item.allocatedHours.split(":");												
// 	// 												alcHrs = alcHrs[0];
// 	// 												alcHrs = parseInt(alcHrs);
// 	// 												newallocatedHours=newallocatedHours+alcHrs;
// 	// 												var workedH=item.workedHours.split(":");
// 	// 												workedH = workedH[0];
// 	// 												workedH = parseInt(workedH);
// 	// 												newworkedHours=newworkedHours+workedH;
// 	// 												var mSpend=item.moneySpent;												
// 	// 												mSpend = parseInt(mSpend);
// 	// 												newmoneySpent=newmoneySpent+mSpend;
// 	// 											}
// 	// 										});
// 	// 										if(cnt==deptList.length) {
// 	// 											dataDash.data.moneySpent = newmoneySpent;
// 	// 											dataDash.data.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 											dataDash.data.allocatedHours = newallocatedHours+":00:00";
// 	// 											dataDash.data.workedHours = newworkedHours+":00:00";
// 	// 											dataDash.data.departments = result
// 	// 											$scope.dashboardData = dataDash.data; 
// 	// 										}
// 	// 									});
// 	// 								}
// 	// 								if(dataDash.subDepartmentList!=null) {
// 	// 									var result1 = [];
// 	// 									var cnt1 = 0;
// 	// 									deptList.forEach(function(key1) {
// 	// 										cnt1++;
// 	// 										dataDash.subDepartmentList.filter(function(item1) {
// 	// 											if(item1.parentDeptName == key1) {
// 	// 												result1.push(item1);
// 	// 											}
// 	// 										});
// 	// 										if(cnt1==deptList.length) {
// 	// 											dataDash.subDepartmentList = result;
// 	// 											if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 												$scope.subDepartments =dataDash.subDepartmentList; 
// 	// 											}
// 	// 										}
// 	// 									})
// 	// 								}
// 	// 							} else {
// 	// 								if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 									$scope.subDepartments= dataDashs.subDepartmentList;
// 	// 								}
// 	// 								$scope.dashboardData = dataDash.data;
// 	// 							}
// 	// 						}        
// 	// 					});
// 	// 				},1000);
// 	// 			}
// 	// 		});
// 	// 	});
// 	// }
// 	// $scope.assigntotalHours = function(value, id,divId){
// 	// 	var data = {
// 	// 		start:$scope.start,
// 	// 		end:$scope.end,
// 	// 		hours:value,
// 	// 		id:'cmp/'+id,
// 	// 	}
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.post('/allocateHours',data).success(function(data){
// 	// 			if(data == "true") {
// 	// 				setTimeout(function(){ 
// 	// 					$http.get("/getdahboardData/"+$routeParams.startDate+"/"+$routeParams.endDate).success(function(dataDashs) {
// 	// 						if(dataDashs!=false){
// 	// 							$("#"+id).val('');
// 	// 							idArry = [];
// 	// 							idArry1 = [];
// 	// 							if(deptList != 'false') {								
// 	// 								if(dataDashs.data.departments!=null) {
// 	// 									var newallocatedHours = 0;
// 	// 									var newworkedHours = 0;									
// 	// 									var newmoneySpent = 0;									
// 	// 									var result = [];
// 	// 									var cnt = 0;
// 	// 									deptList.forEach(function(key) {
// 	// 										cnt++;
// 	// 										dataDashs.data.departments.filter(function(item) {
// 	// 											if(item.departmentName == key) {
// 	// 												result.push(item);
// 	// 												var alcHrs=item.allocatedHours.split(":");												
// 	// 												alcHrs = alcHrs[0];
// 	// 												alcHrs = parseInt(alcHrs);
// 	// 												newallocatedHours=newallocatedHours+alcHrs;
// 	// 												var workedH=item.workedHours.split(":");
// 	// 												workedH = workedH[0];
// 	// 												workedH = parseInt(workedH);
// 	// 												newworkedHours=newworkedHours+workedH;
// 	// 												var mSpend=item.moneySpent;												
// 	// 												mSpend = parseInt(mSpend);
// 	// 												newmoneySpent=newmoneySpent+mSpend;
// 	// 											}
// 	// 										});
// 	// 										if(cnt==deptList.length) {
// 	// 											dataDashs.data.moneySpent = newmoneySpent;
// 	// 											dataDashs.data.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 											dataDashs.data.allocatedHours = newallocatedHours+":00:00";
// 	// 											dataDashs.data.workedHours = newworkedHours+":00:00";
// 	// 											dataDashs.data.departments = result
// 	// 											$scope.dashboardData = dataDashs.data; 
// 	// 										}
// 	// 									});
// 	// 								}
// 	// 								if(dataDashs.subDepartmentList.subDepartments) {
// 	// 									var result1 = [];
// 	// 									var cnt1 = 0;
// 	// 									deptList.forEach(function(key1) {
// 	// 										cnt1++;
// 	// 										dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 	// 											if(item1.parentDeptName == key1) {
// 	// 												result1.push(item1);
// 	// 											}
// 	// 										});
// 	// 										if(cnt1==deptList.length) {
// 	// 											dataDashs.subDepartmentList.subDepartments = result;
// 	// 											if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 												$scope.subDepartments =dataDashs.subDepartmentList;
// 	// 											}
// 	// 										}
// 	// 									})
// 	// 								}
// 	// 							} else {
// 	// 								if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 									$scope.subDepartments= dataDashs.subDepartmentList;
// 	// 								}
// 	// 								$scope.dashboardData = dataDashs.data;
// 	// 							}
// 	// 							var dataDash = dataDashs.data;
// 	// 							var percentage = dataDash.percentageUsed;
// 	// 							changebutton(percentage,'main');
// 	// 							if(parseInt(percentage)>150 && (dataDash.percentageUsed)!='') {
// 	// 								$scope.pData = 150;
// 	// 							} else if((dataDash.percentageUsed)!='') {
// 	// 								if(dataDash.percentageUsed=='NaN') {
// 	// 									$scope.pData = 0;
// 	// 								} else {
// 	// 									$scope.pData = Math.round(dataDash.percentageUsed);  
// 	// 								}              
// 	// 							} else {
// 	// 								$scope.pData = 0;
// 	// 							}
// 	// 							$('#guageMeter').highcharts({
// 	// 								chart: {
// 	// 									type: 'gauge',
// 	// 									plotBackgroundColor: null,
// 	// 									plotBackgroundImage: null,
// 	// 									plotBorderWidth: 0,
// 	// 									plotShadow: false
// 	// 								},
// 	// 								title: {
// 	// 									text: ''
// 	// 								},
// 	// 								pane: {
// 	// 									startAngle: -150,
// 	// 									endAngle: 150,
// 	// 								},
// 	// 								yAxis: {
// 	// 									min: 0,
// 	// 									max: 150,
// 	// 									minorTickInterval: 'auto',
// 	// 									minorTickWidth: 1,
// 	// 									minorTickLength: 10,
// 	// 									minorTickPosition: 'inside',
// 	// 									minorTickColor: '#666',
// 	// 									tickPixelInterval: 20,
// 	// 									tickWidth: 2,
// 	// 									tickPosition: 'inside',
// 	// 									tickLength: 10,
// 	// 									tickColor: '#666',
// 	// 									labels: {
// 	// 										step: 2,
// 	// 										rotation: 'auto'
// 	// 									},
// 	// 									title: {
// 	// 										text: 'Percentage'
// 	// 									},
// 	// 									plotBands: [{
// 	// 										from: 0,
// 	// 										to: 75,
// 	// 										color: '#56c03c' // green
// 	// 									}, {
// 	// 										from: 75,
// 	// 										to: 100,
// 	// 										color: '#f27c4e' // orange
// 	// 									}, {
// 	// 										from: 100,
// 	// 										to: 150,
// 	// 										color: '#e15352' // red
// 	// 									}]
// 	// 								},
// 	// 								series: [{
// 	// 									name: 'Hour Used',
// 	// 									data: [$scope.pData],
// 	// 									tooltip: {
// 	// 										valueSuffix: ' %'
// 	// 									}
// 	// 								}]
// 	// 							},function (chart) {});
// 	// 						}        
// 	// 					});
// 	// 				}, 1000);				
// 	// 			}
// 	// 		});
// 	// 	});
// 	// }
// });
// timecloud.filter('parsePerInInt', function(){
//   return function(timeValue){
//     if(timeValue!=null){
//       var per = 0;
//       per = Math.round(timeValue);
//       return per;
//     } else {      
//       return 0;
//     } 
//   };
// });
// timecloud.filter('filterPecentage', function(){
//   return function(perValue){ 
//     // console.log(perValue);      
//     if(isNaN(perValue) || !isFinite(perValue)){
//       return 0;
//     }else{
//       return Math.round(perValue);
//     }
//   };
// });
// timecloud.controller('meterdashboardDayController',function ($route, $scope,$http,$location, myService,holidayservice,$routeParams, $modal, $timeout,$parse) { //header controller   
// 	console.log("day");
// 	$scope.$on("$destroy", function(){
//     	clearTimeout(clearTime);
//   	});
//   	function changebutton(percentage,id){
// 		$("#half"+id).removeClass("buttonCustomCssGreen");
// 		$("#halfup"+id).removeClass("buttonCustomCssGreen");
// 		$("#full"+id).removeClass("buttonCustomCssGreen");
// 		$("#half"+id).addClass("buttonCustomCss");
// 		$("#halfup"+id).addClass("buttonCustomCss");
// 		$("#full"+id).addClass("buttonCustomCss");
// 		if(percentage >= 50 && percentage<= 74){
// 			$("#half"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#halfup"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#full"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}else if(percentage >= 75 && percentage<= 99){
// 			$("#halfup"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#half"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#full"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}else if(percentage >= 100){
// 			$("#full"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#half"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#halfup"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}    
// 	};
// 	function getDateWiseData(deptList) {
// 		var datas = {date:$routeParams.day,startDate:$routeParams.startDate,endDate:$routeParams.endDate};
// 		$http.post('/getDateWiseRecord',datas).success(function(dataDashs) {
// 			if(dataDashs.data) {
// 				var dataDash = dataDashs.data;
// 				dataDash.weekEnd=$routeParams.endDate;
// 				dataDash.weekStart=$routeParams.startDate;
// 				console.log(dataDash);
// 				var workHours = dataDash.workedHours;
// 				workHours = workHours.split(":");
// 				workHours = workHours[0];
// 				workHours = parseInt(workHours);
// 				var moneySpent = dataDash.moneySpent;						
// 				if(workHours=='0') {
// 					$scope.actulPer = '00';
// 				} else if(moneySpent=='0') {
// 					$scope.actulPer = '00';
// 				} else {
// 					$scope.actulPer = Math.round(workHours * 100 / parseInt(moneySpent));
// 				}
// 				if(dataDash.budgetedSales)
// 					$scope.budgetedSale = dataDash.budgetedSales;				
// 				// if(dataDashs.prvsDatas!==true) {
// 				// 	$("#prvBtn").removeClass("buttonCustomCss");
// 				// 	$("#prvBtn").addClass("buttonCustomDisable");
// 				// } else {
// 				// 	$("#prvBtn").addClass("buttonCustomCss");
// 				// 	$("#prvBtn").removeClass("buttonCustomDisable");
// 				// }						
// 				var percentage = dataDash.percentageUsed;
// 				if(parseInt(percentage)>150 && (dataDash.percentageUsed)!='') {
// 					$scope.pData = 150;
// 				} else if((dataDash.percentageUsed)!='') {
// 					if(dataDash.percentageUsed=='NaN') {
// 						$scope.pData = 0;
// 					} else {
// 						$scope.pData = dataDash.percentageUsed;							
// 					}              
// 				} else {
// 					$scope.pData = 0;
// 				}
// 				changebutton(percentage,'main');
// 				$scope.showLoading=false;
// 				$("#showLoading").css("opacity","1");			
// 				$scope.lastPerData = $scope.pData;
// 				$scope.pData = Math.round($scope.pData);
// 				if(deptList != 'false') {
// 					if(dataDash.departments!=null) {
// 						var newallocatedHours = 0;
// 						var newworkedHours = 0;									
// 						var newmoneySpent = 0;
// 						var budgetedSalesTotal=0;
// 						var budgetedWagesTotal=0;
// 						var result = [];
// 						var actualSalesTotal = 0;
// 						var cnt = 0;
// 						deptList.forEach(function(key) {
// 							cnt++;										
// 							dataDash.departments.filter(function(item) {											
// 								if(item.departmentName == key) {												
// 									// budgetedSalesTotal+=parseInt(item.budgetedSales);
// 									// budgetedWagesTotal+=parseInt(item.budgetedWages);
// 									// actualSalesTotal += parseInt(item.actualSales);
// 									result.push(item);
// 									var alcHrs=item.allocatedHours.split(":");												
// 									alcHrs = alcHrs[0];
// 									alcHrs = parseInt(alcHrs);
// 									newallocatedHours=newallocatedHours+alcHrs;
// 									var workedH=item.workedHours.split(":");
// 									workedH = workedH[0];
// 									workedH = parseInt(workedH);
// 									newworkedHours=newworkedHours+workedH;
// 									var mSpend=item.moneySpent;												
// 									mSpend = parseInt(mSpend);
// 									newmoneySpent=newmoneySpent+mSpend;
// 								}
// 							});
// 							if(cnt==deptList.length) {											
// 								if(newworkedHours!='0') {
// 									dataDash.percentageUsed = (newworkedHours*100)/newallocatedHours;	
// 								} else {
// 									dataDash.percentageUsed = 0;
// 								}
// 								dataDash.allocatedHours = newallocatedHours+":00:00";
// 								dataDash.workedHours = newworkedHours+":00:00";
// 								dataDash.departments = result
// 								$scope.dashboardData = dataDash; 
// 							}
// 						});
// 					}
// 					if(dataDashs.subDepartmentList.subDepartments && localStorage.getItem("adminType")=="subAdmin") {
// 						var result1 = [];
// 						var cnt1 = 0;
// 						deptList.forEach(function(key1) {
// 							cnt1++;
// 							dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 								if(item1.parentDeptName == key1) {
// 									result1.push(item1);												
// 								}
// 							});
// 							if(cnt1==deptList.length) {
// 								dataDashs.subDepartmentList.subDepartments = result1;
// 								if(localStorage.getItem("adminType")=="subAdmin") {
// 									$scope.subDepartments = dataDashs.subDepartmentList; 
// 								}
// 							}
// 						})
// 					}
// 				} else {
// 					if(localStorage.getItem("adminType")=="subAdmin") {
// 						$scope.subDepartments= dataDashs.subDepartmentList;
// 					}
// 					// console.log(dataDash);
// 					$scope.dashboardData = dataDash;
// 				}							
// 				idArry1 = [];
// 				idArry = [];
// 				$('#guageMeter').highcharts({
// 					chart: {
// 						type: 'gauge',
// 						plotBackgroundColor: null,
// 						plotBackgroundImage: null,
// 						plotBorderWidth: 0,
// 						plotShadow: false
// 					},
// 					title: {
// 						text: ''
// 					},
// 					pane: {
// 						startAngle: -150,
// 						endAngle: 150,
// 					},
// 					yAxis: {
// 						min: 0,
// 						max: 150,
// 						minorTickInterval: 'auto',
// 						minorTickWidth: 1,
// 						minorTickLength: 10,
// 						minorTickPosition: 'inside',
// 						minorTickColor: '#666',
// 						tickPixelInterval: 20,
// 						tickWidth: 2,
// 						tickPosition: 'inside',
// 						tickLength: 10,
// 						tickColor: '#666',
// 						labels: {
// 							step: 2,
// 							rotation: 'auto'
// 						},
// 						title: {
// 							text: 'Percentage',
// 							y: 15, // 10 pixels down from the top
// 						},
// 						plotBands: [{
// 							from: 0,
// 							to: 75,
// 							color: '#56c03c' // green
// 						}, {
// 							from: 75,
// 							to: 100,
// 							color: '#f27c4e' // orange
// 						}, {
// 							from: 100,
// 							to: 150,
// 							color: '#e15352' // red
// 						}]
// 					},
// 					series: [{
// 						name: 'Hour Used',
// 						data: [$scope.pData],
// 						tooltip: {
// 							valueSuffix: ' %'
// 						}
// 					}]
// 				}, function(chart) {
// 					clearTime = setTimeout(function() {
// 						getDateWiseData(deptList);
// 				    }, 30000);
// 	            });		
// 			}
// 		});
// 	};
// 	$scope.initDashboard = function(cal){
// 		console.log("init");
// 		// console.log(cal);
// 		var idArry1 = [];
// 		var idArry = [];
// 		var clearTime;
// 		$scope.showPeriod = true;
// 		$("#weeklyDashboard").removeClass("buttonCustomCss");
// 		$("#weeklyDashboard").addClass("buttonCustomDisable1");	
// 		$scope.showDashboard = true;
// 		$scope.dynamicText = "week";
// 		// var lastPerData = '';
// 		$scope.lastPerData='';
// 		$scope.showLoading = false;
// 		$scope.subDepartmentUser = localStorage.getItem("adminType");
// 		//alert(localStorage.getItem("adminType"));
// 		$scope.adminDeptList = [];
// 		$scope.dateArray = [];
// 		var stDate = $routeParams.startDate;
// 			enDate = $routeParams.endDate;
//         while (stDate <= enDate) {
//             $scope.dateArray.push(stDate);
//             var date = moment(stDate);
//             var sDate = date.add(1, 'days');
//             stDate = moment(sDate).format("YYYY-MM-DD");
//         }
//         $scope.selectDate = $routeParams.day;
//         console.log($scope.selectDate);
// 		$http.get('/checkadminDept').success(function(deptList) {
// 			$scope.adminDeptList = deptList;
// 			// $http.get("/getPayperiod").success(function(data) {
// 			// 	$scope.start = data.start;
// 			// 	$scope.end = data.end;
// 			// 	$scope.days = data.days;
// 			// 	$scope.from = data.start;
// 			// 	$scope.to =  data.end;
// 				// console.log(deptList);
// 				getDateWiseData(deptList);			
// 			// });
// 		});
// 	};	
// 	/* for Week */
// 	$scope.periodicDashboard = function(start,end,companyId) {
// 		clearTimeout(clearTime);
// 		// console.log(start);
// 		// console.log(end);
// 		$("#weeklyDashboard").removeClass("buttonCustomCss");
// 		$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 		$("#currentDateDashboard").addClass("buttonCustomCss");
// 		$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 		$scope.showLoading=true;	
// 		$scope.lastPerData='';	
// 		$scope.dynamicText = "week";		
// 		$("#showLoading").css("opacity","0.2");
// 		var datas = {start:start,end:end,companyId:companyId,currentDayCal:false};
// 		$http.post('/displayDashboardAcrodingNeed',datas).success(function(updatedCalculation) {
// 			getDashboardData($scope.adminDeptList,datas);
// 		});
// 	};
// 	// /* till current date*/
// 	$scope.currentDateDashboard = function(start,end,companyId) {
// 		clearTimeout(clearTime);
// 		$scope.dynamicText = "week";	
// 		$("#weeklyDashboard").addClass("buttonCustomCss");
// 		$("#weeklyDashboard").removeClass("buttonCustomDisable1");
// 		$("#currentDateDashboard").removeClass("buttonCustomCss");
// 		$("#currentDateDashboard").addClass("buttonCustomDisable1");
// 		var datas = {start:start,end:end,companyId:companyId,currentDayCal:true};
// 		var deptList =$scope.adminDeptList;
// 		$scope.showLoading=true;				
// 		$("#showLoading").css("opacity","0.2");
// 		$http.post('/displayDashboardAcrodingNeed',datas).success(function(dataDashs) {
// 			if(dataDashs.data.companyId){
// 				var dataDash = dataDashs.data;
// 				dataDash.weekEnd=end;
// 				dataDash.weekStart=start;
// 				dataDash.companyId=companyId;
// 				getDateWiseData(deptList,dataDash,dataDashs,$scope.dynamicText);
// 			}else{
// 				$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 				$("#weeklyDashboard").removeClass("buttonCustomCss");
// 				$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 				$("#currentDateDashboard").addClass("buttonCustomCss");
// 				$scope.initDashboard(false);
// 			}	
// 		});
// 	};
// 	$scope.dateWiseDashboard = function(date,start,end,companyId) {
// 		if(date!==""){
// 			$scope.dynamicText = "day";
// 			$("#weeklyDashboard").addClass("buttonCustomCss");
// 			$("#weeklyDashboard").removeClass("buttonCustomDisable1");
// 			$("#currentDateDashboard").addClass("buttonCustomCss");
// 			$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 			$scope.showLoading=true;				
// 			$("#showLoading").css("opacity","0.2");
// 			clearTimeout(clearTime);
// 			var datas = {date:date,startDate:start,endDate:end};
// 			var deptList =$scope.adminDeptList;
// 			$location.path('/meterdashboard/'+start+'/'+end+'/'+date);
// 			// $http.post('/getDateWiseRecord',datas).success(function(dataDashs) {
// 			// 	if(dataDashs.data) {
// 			// 		var dataDash = dataDashs.data;
// 			// 		dataDash.weekEnd=end;
// 			// 		dataDash.weekStart=start;
// 			// 		dataDash.daySelect=date;
// 			// 		getDateWiseData(deptList,dataDash,dataDashs,$scope.dynamicText);
// 			// 	}
// 			// });
// 		}else{
// 			$scope.dynamicText = "week";
// 			$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 			$("#weeklyDashboard").removeClass("buttonCustomCss");
// 			// $("#currentDateDashboard").addClass("buttonCustomDisable1");
// 			// $("#currentDateDashboard").removeClass("buttonCustomCss");
// 			console.log("empty date selected");
// 			$scope.initDashboard(false);
// 		}	
// 	};
// 	$scope.getSubCategories=function(department) {
// 		var workHours = department.workedHours;
// 		workHours = workHours.split(":");
// 		workHours = workHours[0];
// 		workHours = parseInt(workHours);
// 		var moneySpent = department.moneySpent;
// 		if(workHours=='0') {
// 			$scope.actualDeptPer = '00';
// 		} else if(moneySpent=='0') {
// 			$scope.actualDeptPer = '00';
// 		} else {
// 			var actualDeptPer = workHours * 100 / parseInt(moneySpent);
// 			$scope.actualDeptPer =  Math.round(actualDeptPer);
// 		}
// 		if(idArry.indexOf(department._id)==-1) {
// 			idArry.push(department._id);			
// 			var percentages = 0;
// 			if(department.percentageUsed!='NaN' && department.percentageUsed!='') {
// 				percentages = Math.round(department.percentageUsed);
// 			}
// 			if(percentages>150) {
// 				percentages=150;
// 			}  
// 			if(department.departmentName) {
// 				$('#meter'+department._id).highcharts({
// 					chart: {
// 						type: 'gauge',
// 						plotBackgroundColor: null,
// 						plotBackgroundImage: null,
// 						plotBorderWidth: 0,
// 						plotShadow: false
// 					},
// 					title: {
// 						text: ''
// 					},
// 					pane: {
// 						startAngle: -150,
// 						endAngle: 150,
// 					},
// 					yAxis: {
// 						min: 0,
// 						max: 150,
// 						minorTickInterval: 'auto',
// 						minorTickWidth: 1,
// 						minorTickLength: 10,
// 						minorTickPosition: 'inside',
// 						minorTickColor: '#666',
// 						tickPixelInterval: 20,
// 						tickWidth: 2,
// 						tickPosition: 'inside',
// 						tickLength: 10,
// 						tickColor: '#666',
// 						labels: {
// 							step: 2,
// 							rotation: 'auto'
// 						},
// 						title: {
// 							text: 'Percentage',
// 							y: 15, // 10 pixels down from the top
// 							style: {
// 									fontSize: '11px'                 
// 							}
// 						},
// 						plotBands: [{
// 							from: 0,
// 							to: 75,
// 							color: '#56c03c' // green
// 						}, {
// 							from: 75,
// 							to: 100,
// 							color: '#f27c4e' // orange
// 						}, {
// 							from: 100,
// 							to: 150,
// 							color: '#e15352' // red
// 						}]
// 					},
// 					series: [{
// 						name: 'Hour Used',
// 						data: [percentages],
// 						tooltip: {
// 							valueSuffix: ' %'
// 						}
// 					}]
// 				},function (chart) {
// 					//setTimeout(poll(),10000);
// 				});
// 			}
// 		}
// 	};
// 	$scope.checkPerFun = function(percentage,id) {
// 		changebutton(percentage,id);
// 	};	
// 	$scope.nextDashBoardDataFn=function(weekStart,weekEnd,companyId) {
// 		clearTimeout(clearTime);
// 		var date = moment(weekEnd);
// 		var sDate = date.add(1, 'days');
// 		var startDate = moment(sDate).format("YYYY-MM-DD");
// 		var d1 = moment(weekStart);
// 		var d2 = moment(weekEnd);
// 		var days = moment.duration(d2.diff(d1)).asDays();
// 		var eDate = date.add(days, 'days');
// 		var endDate = moment(eDate).format("YYYY-MM-DD");
// 		$location.path('/meterdashboard/'+startDate+'/'+endDate);
// 	};
// 	$scope.previousDashBoardDataFn=function(weekStart,weekEnd,companyId) {
// 		clearTimeout(clearTime);
// 		var lastData = 0;
// 		$scope.dashboardData=[];
// 		var date = moment(weekStart);
// 		var eDate = date.subtract(1, 'days');
// 		var EndDate = moment(eDate).format("YYYY-MM-DD");
// 		var d1 = moment(weekStart);
// 		var d2 = moment(weekEnd);
// 		var days = moment.duration(d2.diff(d1)).asDays();
// 		var date1 = moment(EndDate);
// 		var sDate = date.subtract(days, 'days');
// 		var startDate = moment(sDate).format("YYYY-MM-DD");
// 		$location.path('/meterdashboard/'+startDate+'/'+EndDate);
// 	};
// 	$scope.saveSubDeptBudgetedSale = function(id,budgetedSubDeptSale,index,curDate,allocatedHours) {
// 		var model = $parse('subDeptSaleSaved'+index);
// 		console.log(parseInt(allocatedHours));
// 		if(parseInt(allocatedHours)>0){
// 			if(budgetedSubDeptSale=='') 
// 				budgetedSubDeptSale = 0
// 			var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,myDate:curDate,budgetedSale:budgetedSubDeptSale};
// 			// console.log(data);
// 			$http.post('/budgetedSubDeptSaleSave',data).success(function(resp){
// 				console.log(JSON.parse(resp));
// 				if(JSON.parse(resp)){
// 					console.log("if");
// 					model.assign($scope, true);
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}else{
// 					console.log("else");
// 					model.assign($scope, 'errors');
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}    
// 			});
// 		}else{
// 			model.assign($scope, 'errors');
// 			$timeout(function() {
// 		        model.assign($scope, false);
// 		    }, 3000);
// 		}	
// 		// .error(function(err){
// 		// 	console.log("erro5r");
// 		// });		
// 	};
// 	$scope.saveSubDeptActualSale = function(id,actualSales,index,curDate,allocatedHours) {
// 		var model = $parse('actSubDeptSaleSaved'+index);
// 		console.log(parseInt(allocatedHours));
// 		if(parseInt(allocatedHours)>0){
// 			if(actualSales=='') 
// 				actualSales = 0
// 			var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,myDate:curDate,actualSales:actualSales};
// 			$http.post('/actualSubDeptSaleSave',data).success(function(resp){
// 				console.log(JSON.parse(resp));
// 				if(JSON.parse(resp)){
// 					console.log("if");
// 					model.assign($scope, true);
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}else{
// 					console.log("else");
// 					model.assign($scope, 'errors');
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}    
// 			});
// 		}else{
// 			model.assign($scope, 'errors');
// 			$timeout(function() {
// 		        model.assign($scope, false);
// 		    }, 3000);
// 		}				
// 	};
// 	$scope.calculateThePer = function (dept) {
// 		var workHours = dept.workedHours;
// 		workHours = workHours.split(":");
// 		workHours = workHours[0];
// 		workHours = parseInt(workHours);
// 		var moneySpent = dept.moneySpent;
// 		$scope.actualDeptPer = workHours * 100 / parseInt(moneySpent);
// 		// $scope.actualDeptPer = dept.workedHours;
// 	};
// });
// timecloud.controller('meterdashboardController',function ($route, $scope,$http,$location, myService,holidayservice,$routeParams, $modal, $timeout,$parse) { //header controller   
// 	$scope.$on("$destroy", function(){
//     	clearTimeout(clearTime);
//   	});
// 	function changebutton(percentage,id){
// 		$("#half"+id).removeClass("buttonCustomCssGreen");
// 		$("#halfup"+id).removeClass("buttonCustomCssGreen");
// 		$("#full"+id).removeClass("buttonCustomCssGreen");
// 		$("#half"+id).addClass("buttonCustomCss");
// 		$("#halfup"+id).addClass("buttonCustomCss");
// 		$("#full"+id).addClass("buttonCustomCss");
// 		if(percentage >= 50 && percentage<= 74){
// 			$("#half"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#halfup"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#full"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}else if(percentage >= 75 && percentage<= 99){
// 			$("#halfup"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#half"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#full"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}else if(percentage >= 100){
// 			$("#full"+id).removeClass("buttonCustomCss").addClass("buttonCustomCssGreen");
// 			$("#half"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 			$("#halfup"+id).removeClass("buttonCustomCssGreen").addClass("buttonCustomCss");
// 		}    
// 	};
// 	function getDashboardData(deptList, data) {
// 		// console.log(data);
// 	    $http.get("/getdahboardData/" + data.start + "/" + data.end).success(function(dataDashs) {
// 	        var startDate = data.start;
// 	        var endDate = data.end;
// 	        $scope.dateArray = [];
// 	        while (startDate <= endDate) {
// 	            $scope.dateArray.push(startDate);
// 	            var date = moment(startDate);
// 	            var sDate = date.add(1, 'days');
// 	            startDate = moment(sDate).format("YYYY-MM-DD");
// 	        }
// 	        var dataDash = dataDashs.data;
// 	        console.log("cal status " +dataDash.calfalg);
// 	        if (dataDash !== null) {
// 	        	// console.log("not null");
// 	            var workHours = dataDash.workedHours;
// 	            workHours = workHours.split(":");
// 	            workHours = workHours[0];
// 	            workHours = parseInt(workHours);
// 	            var moneySpent = dataDash.moneySpent;
// 	            if (workHours == '0') {
// 	                $scope.actulPer = '00';
// 	            } else if (moneySpent == '0') {
// 	                $scope.actulPer = '00';
// 	            } else {
// 	                $scope.actulPer = Math.round(workHours * 100 / parseInt(moneySpent));
// 	            }
// 	            if (dataDash.budgetedSales)
// 	                $scope.budgetedSale = dataDash.budgetedSales;
// 	            if (dataDashs.prvsDatas !== true) {
// 	                $("#prvBtn").removeClass("buttonCustomCss");
// 	                $("#prvBtn").addClass("buttonCustomDisable");
// 	            } else {
// 	                $("#prvBtn").addClass("buttonCustomCss");
// 	                $("#prvBtn").removeClass("buttonCustomDisable");
// 	            }
// 	            var percentage = dataDash.percentageUsed;
// 	            if (parseInt(percentage) > 150 && (dataDash.percentageUsed) !== '') {
// 	                $scope.pData = 150;
// 	            } else if ((dataDash.percentageUsed) !== '') {
// 	                if (dataDash.percentageUsed == 'NaN') {
// 	                    $scope.pData = 0;
// 	                } else {
// 	                    $scope.pData = dataDash.percentageUsed;
// 	                }
// 	            } else {
// 	                $scope.pData = 0;
// 	            }
// 	            changebutton(percentage, 'main');
// 	            if ($scope.pData != $scope.lastPerData) {
// 	            	console.log("% work changed");
// 	                $scope.showLoading = false;
// 	                $("#showLoading").css("opacity", "1");
// 	                $scope.lastPerData = $scope.pData;
// 	                $scope.pData = Math.round($scope.pData);
// 	                if (deptList != 'false') {
// 	                	console.log("Subadmin data");
// 	                    if (dataDash.departments !== null) {
// 	                        var newallocatedHours = 0;
// 	                        var newworkedHours = 0;
// 	                        var newmoneySpent = 0;
// 	                        var budgetedSalesTotal = 0;
// 	                        var budgetedWagesTotal = 0;
// 	                        var actualSalesTotal = 0;
// 	                        var result = [];
// 	                        var cnt = 0;
// 	                        deptList.forEach(function(key) {
// 	                            cnt++;
// 	                            dataDash.departments.filter(function(item) {
// 	                                if (item.departmentName == key) {
// 	                                    budgetedSalesTotal += parseInt(item.budgetedSales);
// 	                                    budgetedWagesTotal += parseInt(item.budgetedWages);
// 	                                    actualSalesTotal += parseInt(item.actualSales);
// 	                                    result.push(item);
// 	                                    var alcHrs = item.allocatedHours.split(":");
// 	                                    alcHrs = alcHrs[0];
// 	                                    alcHrs = parseInt(alcHrs);
// 	                                    newallocatedHours = newallocatedHours + alcHrs;
// 	                                    var workedH = item.workedHours.split(":");
// 	                                    workedH = workedH[0];
// 	                                    workedH = parseInt(workedH);
// 	                                    newworkedHours = newworkedHours + workedH;
// 	                                    var mSpend = item.moneySpent;
// 	                                    mSpend = parseInt(mSpend);
// 	                                    newmoneySpent = newmoneySpent + mSpend;
// 	                                }
// 	                            });
// 	                            if (cnt == deptList.length) {
// 	                                dataDash.budgetedSales = budgetedSalesTotal;
// 	                                dataDash.budgetedWages = budgetedWagesTotal;
// 	                                dataDash.moneySpent = newmoneySpent;
// 	                                console.log(actualSalesTotal);
// 	                                dataDash.actualSales = actualSalesTotal;
// 	                                if (newworkedHours != '0') {
// 	                                    dataDash.percentageUsed = (newworkedHours * 100) / newallocatedHours;
// 	                                } else {
// 	                                    dataDash.percentageUsed = 0;
// 	                                }
// 	                                dataDash.allocatedHours = newallocatedHours + ":00:00";
// 	                                dataDash.workedHours = newworkedHours + ":00:00";
// 	                                dataDash.departments = result;
// 	                                $scope.dashboardData = dataDash;
// 	                            }
// 	                        });
// 	                    }
// 	                    // console.log(dataDashs);
// 	                    if (dataDashs.subDepartmentList.subDepartments && localStorage.getItem("adminType") == "subAdmin") {
// 	                        var result1 = [];
// 	                        var cnt1 = 0;
// 	                        deptList.forEach(function(key1) {
// 	                            cnt1++;
// 	                            dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 	                                if (item1.parentDeptName == key1) {
// 	                                	// console.log(item1);
// 	                                    result1.push(item1);
// 	                                }
// 	                            });
// 	                            if (cnt1 == deptList.length) {
// 	                                dataDashs.subDepartmentList.subDepartments = result1;
// 	                                if (localStorage.getItem("adminType") == "subAdmin") {
// 	                                    $scope.subDepartments = dataDashs.subDepartmentList;
// 	                                }
// 	                            }
// 	                        });
// 	                    }
// 		            } else {
// 	                	// console.log("Admin data");
// 	                    if (localStorage.getItem("adminType") == "subAdmin") {
// 	                        $scope.subDepartments = dataDashs.subDepartmentList;
// 	                    }
// 	                    // console.log(dataDash);
// 	                    $scope.dashboardData = dataDash;
// 	                    // console.log($scope.dashboardData);
// 	                    // console.log("i am here final");
// 	                }
// 	                idArry1 = [];
// 	                idArry = [];
// 	                $('#guageMeter').highcharts({
// 	                    chart: {
// 	                        type: 'gauge',
// 	                        plotBackgroundColor: null,
// 	                        plotBackgroundImage: null,
// 	                        plotBorderWidth: 0,
// 	                        plotShadow: false
// 	                    },
// 	                    title: {
// 	                        text: ''
// 	                    },
// 	                    pane: {
// 	                        startAngle: -150,
// 	                        endAngle: 150,
// 	                    },
// 	                    yAxis: {
// 	                        min: 0,
// 	                        max: 150,
// 	                        minorTickInterval: 'auto',
// 	                        minorTickWidth: 1,
// 	                        minorTickLength: 10,
// 	                        minorTickPosition: 'inside',
// 	                        minorTickColor: '#666',
// 	                        tickPixelInterval: 20,
// 	                        tickWidth: 2,
// 	                        tickPosition: 'inside',
// 	                        tickLength: 10,
// 	                        tickColor: '#666',
// 	                        labels: {
// 	                            step: 2,
// 	                            rotation: 'auto'
// 	                        },
// 	                        title: {
// 	                            text: 'Percentage',
// 	                            y: 15, // 10 pixels down from the top
// 	                        },
// 	                        plotBands: [{
// 	                            from: 0,
// 	                            to: 75,
// 	                            color: '#56c03c' // green
// 	                        }, {
// 	                            from: 75,
// 	                            to: 100,
// 	                            color: '#f27c4e' // orange
// 	                        }, {
// 	                            from: 100,
// 	                            to: 150,
// 	                            color: '#e15352' // red
// 	                        }]
// 	                    },
// 	                    series: [{
// 	                        name: 'Hour Used',
// 	                        data: [$scope.pData],
// 	                        tooltip: {
// 	                            valueSuffix: ' %'
// 	                        }
// 	                    }]
// 	                }, function(chart) {
// 	                    clearTime = setTimeout(function() {
// 	                        getDashboardData(deptList, data);
// 	                    }, 10000);
// 	                });
// 	            } else {
// 	            	 $scope.showLoading = false;
// 	            	console.log("% work unchanged " +$scope.lastPerData);
// 	                clearTime = setTimeout(function() {
// 	                    getDashboardData(deptList, data);
// 	                }, 10000);
// 	            }
// 	        }else{
// 	        	$scope.showLoading = false;
// 	        	console.log("dashboard null");
// 	        }
// 	    });
// 	};
// 	function getDateWiseData(deptList,dataDash,dataDashs, dashType) {
// 		console.log(dashType);
// 		if(dataDash!=null) {
// 			var workHours = dataDash.workedHours;
// 			workHours = workHours.split(":");
// 			workHours = workHours[0];
// 			workHours = parseInt(workHours);
// 			var moneySpent = dataDash.moneySpent;						
// 			if(workHours=='0') {
// 				$scope.actulPer = '00';
// 			} else if(moneySpent=='0') {
// 				$scope.actulPer = '00';
// 			} else {
// 				$scope.actulPer = Math.round(workHours * 100 / parseInt(moneySpent));
// 			}
// 			if(dataDash.budgetedSales)
// 				$scope.budgetedSale = dataDash.budgetedSales;				
// 			// if(dataDashs.prvsDatas!==true) {
// 			// 	$("#prvBtn").removeClass("buttonCustomCss");
// 			// 	$("#prvBtn").addClass("buttonCustomDisable");
// 			// } else {
// 			// 	$("#prvBtn").addClass("buttonCustomCss");
// 			// 	$("#prvBtn").removeClass("buttonCustomDisable");
// 			// }						
// 			var percentage = dataDash.percentageUsed;
// 			if(parseInt(percentage)>150 && (dataDash.percentageUsed)!='') {
// 				$scope.pData = 150;
// 			} else if((dataDash.percentageUsed)!='') {
// 				if(dataDash.percentageUsed=='NaN') {
// 					$scope.pData = 0;
// 				} else {
// 					$scope.pData = dataDash.percentageUsed;							
// 				}              
// 			} else {
// 				$scope.pData = 0;
// 			}
// 			changebutton(percentage,'main');
// 			$scope.showLoading=false;
// 			$("#showLoading").css("opacity","1");			
// 			$scope.lastPerData = $scope.pData;
// 			$scope.pData = Math.round($scope.pData);
// 			if(deptList != 'false') {
// 				if(dataDash.departments!=null) {
// 					var newallocatedHours = 0;
// 					var newworkedHours = 0;									
// 					var newmoneySpent = 0;
// 					var budgetedSalesTotal=0;
// 					var budgetedWagesTotal=0;
// 					var result = [];
// 					var actualSalesTotal = 0;
// 					var cnt = 0;
// 					deptList.forEach(function(key) {
// 						cnt++;										
// 						dataDash.departments.filter(function(item) {											
// 							if(item.departmentName == key) {												
// 								// budgetedSalesTotal+=parseInt(item.budgetedSales);
// 								// budgetedWagesTotal+=parseInt(item.budgetedWages);
// 								// actualSalesTotal += parseInt(item.actualSales);
// 								result.push(item);
// 								var alcHrs=item.allocatedHours.split(":");												
// 								alcHrs = alcHrs[0];
// 								alcHrs = parseInt(alcHrs);
// 								newallocatedHours=newallocatedHours+alcHrs;
// 								var workedH=item.workedHours.split(":");
// 								workedH = workedH[0];
// 								workedH = parseInt(workedH);
// 								newworkedHours=newworkedHours+workedH;
// 								var mSpend=item.moneySpent;												
// 								mSpend = parseInt(mSpend);
// 								newmoneySpent=newmoneySpent+mSpend;
// 							}
// 						});
// 						if(cnt==deptList.length) {											
// 							// dataDash.budgetedSales=budgetedSalesTotal;
// 							// dataDash.budgetedWages=budgetedWagesTotal;
// 							// dataDash.actualSales = actualSalesTotal;
// 							// dataDash.moneySpent = newmoneySpent;
// 							if(newworkedHours!='0') {
// 								dataDash.percentageUsed = (newworkedHours*100)/newallocatedHours;	
// 							} else {
// 								dataDash.percentageUsed = 0;
// 							}
// 							dataDash.allocatedHours = newallocatedHours+":00:00";
// 							dataDash.workedHours = newworkedHours+":00:00";
// 							dataDash.departments = result
// 							$scope.dashboardData = dataDash; 
// 						}
// 					});
// 				}
// 				if(dataDashs.subDepartmentList.subDepartments && localStorage.getItem("adminType")=="subAdmin") {
// 					var result1 = [];
// 					var cnt1 = 0;
// 					deptList.forEach(function(key1) {
// 						cnt1++;
// 						dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 							if(item1.parentDeptName == key1) {
// 								result1.push(item1);												
// 							}
// 						});
// 						if(cnt1==deptList.length) {
// 							dataDashs.subDepartmentList.subDepartments = result1;
// 							if(localStorage.getItem("adminType")=="subAdmin") {
// 								$scope.subDepartments = dataDashs.subDepartmentList; 
// 							}
// 						}
// 					})
// 				}
// 			} else {
// 				if(localStorage.getItem("adminType")=="subAdmin") {
// 					$scope.subDepartments= dataDashs.subDepartmentList;
// 				}
// 				// console.log(dataDash);
// 				$scope.dashboardData = dataDash;
// 			}							
// 			idArry1 = [];
// 			idArry = [];
// 			$('#guageMeter').highcharts({
// 				chart: {
// 					type: 'gauge',
// 					plotBackgroundColor: null,
// 					plotBackgroundImage: null,
// 					plotBorderWidth: 0,
// 					plotShadow: false
// 				},
// 				title: {
// 					text: ''
// 				},
// 				pane: {
// 					startAngle: -150,
// 					endAngle: 150,
// 				},
// 				yAxis: {
// 					min: 0,
// 					max: 150,
// 					minorTickInterval: 'auto',
// 					minorTickWidth: 1,
// 					minorTickLength: 10,
// 					minorTickPosition: 'inside',
// 					minorTickColor: '#666',
// 					tickPixelInterval: 20,
// 					tickWidth: 2,
// 					tickPosition: 'inside',
// 					tickLength: 10,
// 					tickColor: '#666',
// 					labels: {
// 						step: 2,
// 						rotation: 'auto'
// 					},
// 					title: {
// 						text: 'Percentage',
// 						y: 15, // 10 pixels down from the top
// 					},
// 					plotBands: [{
// 						from: 0,
// 						to: 75,
// 						color: '#56c03c' // green
// 					}, {
// 						from: 75,
// 						to: 100,
// 						color: '#f27c4e' // orange
// 					}, {
// 						from: 100,
// 						to: 150,
// 						color: '#e15352' // red
// 					}]
// 				},
// 				series: [{
// 					name: 'Hour Used',
// 					data: [$scope.pData],
// 					tooltip: {
// 						valueSuffix: ' %'
// 					}
// 				}]
// 			}, function(chart) {
// 				if(dashType==="day"){
// 	                clearTime = setTimeout(function() {
// 	                	var datas = {date:dataDash.daySelect,startDate:dataDash.weekStart,endDate:dataDash.weekEnd};
// 	                	$http.post('/getDateWiseRecord',datas).success(function(dataDashs) {
// 							if(dataDashs.data) {
// 								// dataDash.weekEnd=dataDash.weekEnd;
// 								// dataDash.weekStart=dataDash.weekStart;
// 								// dataDash.daySelect=dataDash.daySelect;
// 								// var dataDash = dataDashs.data;
// 								getDateWiseData(deptList,dataDash,dataDashs,"day");
// 							}
// 						});
// 	                }, 10000);
// 	            }else if(dashType === "week"){
// 	            	clearTime = setTimeout(function() {
// 	            		var datas = {start:dataDash.weekStart,end:dataDash.weekEnd,companyId:dataDash.companyId,currentDayCal:true};
// 	                	$http.post('/displayDashboardAcrodingNeed',datas).success(function(dataDashs) {
// 							if(dataDashs.data.companyId){
// 								// var dataDash = dataDashs.data;
// 								// dataDash.weekEnd=dataDash.weekEnd;
// 								// dataDash.weekStart=dataDash.weekStart;
// 								getDateWiseData(deptList,dataDash,dataDashs,"week");
// 							}else{
// 								// $("#weeklyDashboard").addClass("buttonCustomDisable1");
// 								// $("#weeklyDashboard").removeClass("buttonCustomCss");
// 								// $("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 								// $("#currentDateDashboard").addClass("buttonCustomCss");
// 								// $scope.initDashboard(false);
// 							}	
// 						});   
// 	                }, 10000);
// 	            }    
//             });		
// 		}
// 	};
// 	$scope.initDashboard = function(cal){
// 		// console.log("init");
// 		// console.log(cal);
// 		var idArry1 = [];
// 		var idArry = [];
// 		var clearTime;
// 		$scope.showPeriod = true;
// 		$("#weeklyDashboard").removeClass("buttonCustomCss");
// 		$("#weeklyDashboard").addClass("buttonCustomDisable1");	
// 		$scope.showDashboard = true;
// 		$scope.dynamicText = "week";
// 		// var lastPerData = '';
// 		$scope.lastPerData='';
// 		$scope.showLoading = false;
// 		$scope.subDepartmentUser = localStorage.getItem("adminType");
// 		//alert(localStorage.getItem("adminType"));
// 		$scope.adminDeptList = [];
// 		$http.get('/checkadminDept').success(function(deptList) {
// 			$scope.adminDeptList = deptList;
// 			$http.get("/getPayperiod").success(function(data) {
// 				$scope.start = data.start;
// 				$scope.end = data.end;
// 				$scope.days = data.days;
// 				$scope.from = data.start;
// 				$scope.to =  data.end;
// 				// console.log(deptList);
// 				getDashboardData(deptList,data);			
// 			});
// 		});
// 	};	
// 	/*date change*/
// 	$scope.dateWiseDashboard = function(date,start,end,companyId) {
// 		if(date!==""){
// 			$scope.dynamicText = "day";
// 			$("#weeklyDashboard").addClass("buttonCustomCss");
// 			$("#weeklyDashboard").removeClass("buttonCustomDisable1");
// 			$("#currentDateDashboard").addClass("buttonCustomCss");
// 			$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 			$scope.showLoading=true;				
// 			$("#showLoading").css("opacity","0.2");
// 			clearTimeout(clearTime);
// 			var datas = {date:date,startDate:start,endDate:end};
// 			var deptList =$scope.adminDeptList;
// 			$location.path('/meterdashboard/'+start+'/'+end+'/'+date);
// 			// $http.post('/getDateWiseRecord',datas).success(function(dataDashs) {
// 			// 	if(dataDashs.data) {
// 			// 		var dataDash = dataDashs.data;
// 			// 		dataDash.weekEnd=end;
// 			// 		dataDash.weekStart=start;
// 			// 		dataDash.daySelect=date;
// 			// 		getDateWiseData(deptList,dataDash,dataDashs,$scope.dynamicText);
// 			// 	}
// 			// });
// 		}else{
// 			$scope.dynamicText = "week";
// 			$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 			$("#weeklyDashboard").removeClass("buttonCustomCss");
// 			// $("#currentDateDashboard").addClass("buttonCustomDisable1");
// 			// $("#currentDateDashboard").removeClass("buttonCustomCss");
// 			console.log("empty date selected");
// 			$scope.initDashboard(false);
// 		}	
// 	};
// 	/* for Week */
// 	$scope.periodicDashboard = function(start,end,companyId) {
// 		clearTimeout(clearTime);
// 		// console.log(start);
// 		// console.log(end);
// 		$("#weeklyDashboard").removeClass("buttonCustomCss");
// 		$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 		$("#currentDateDashboard").addClass("buttonCustomCss");
// 		$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 		$scope.showLoading=true;	
// 		$scope.lastPerData='';	
// 		$scope.dynamicText = "week";		
// 		$("#showLoading").css("opacity","0.2");
// 		var datas = {start:start,end:end,companyId:companyId,currentDayCal:false};
// 		$http.post('/displayDashboardAcrodingNeed',datas).success(function(updatedCalculation) {
// 			getDashboardData($scope.adminDeptList,datas);
// 		});
// 	};
// 	/* till current date*/
// 	$scope.currentDateDashboard = function(start,end,companyId) {
// 		clearTimeout(clearTime);
// 		$scope.dynamicText = "week";	
// 		$("#weeklyDashboard").addClass("buttonCustomCss");
// 		$("#weeklyDashboard").removeClass("buttonCustomDisable1");
// 		$("#currentDateDashboard").removeClass("buttonCustomCss");
// 		$("#currentDateDashboard").addClass("buttonCustomDisable1");
// 		var datas = {start:start,end:end,companyId:companyId,currentDayCal:true};
// 		var deptList =$scope.adminDeptList;
// 		$scope.showLoading=true;				
// 		$("#showLoading").css("opacity","0.2");
// 		$http.post('/displayDashboardAcrodingNeed',datas).success(function(dataDashs) {
// 			if(dataDashs.data.companyId){
// 				var dataDash = dataDashs.data;
// 				dataDash.weekEnd=end;
// 				dataDash.weekStart=start;
// 				dataDash.companyId=companyId;
// 				getDateWiseData(deptList,dataDash,dataDashs,$scope.dynamicText);
// 			}else{
// 				$("#weeklyDashboard").addClass("buttonCustomDisable1");
// 				$("#weeklyDashboard").removeClass("buttonCustomCss");
// 				$("#currentDateDashboard").removeClass("buttonCustomDisable1");
// 				$("#currentDateDashboard").addClass("buttonCustomCss");
// 				$scope.initDashboard(false);
// 			}	
// 		});
// 	};
// 	$scope.getSubCategories=function(department) {
// 		var workHours = department.workedHours;
// 		workHours = workHours.split(":");
// 		workHours = workHours[0];
// 		workHours = parseInt(workHours);
// 		var moneySpent = department.moneySpent;
// 		if(workHours=='0') {
// 			$scope.actualDeptPer = '00';
// 		} else if(moneySpent=='0') {
// 			$scope.actualDeptPer = '00';
// 		} else {
// 			var actualDeptPer = workHours * 100 / parseInt(moneySpent);
// 			$scope.actualDeptPer =  Math.round(actualDeptPer);
// 		}
// 		if(idArry.indexOf(department._id)==-1) {
// 			idArry.push(department._id);			
// 			var percentages = 0;
// 			if(department.percentageUsed!='NaN' && department.percentageUsed!='') {
// 				percentages = Math.round(department.percentageUsed);
// 			}
// 			if(percentages>150) {
// 				percentages=150;
// 			}  
// 			if(department.departmentName) {
// 				$('#meter'+department._id).highcharts({
// 					chart: {
// 						type: 'gauge',
// 						plotBackgroundColor: null,
// 						plotBackgroundImage: null,
// 						plotBorderWidth: 0,
// 						plotShadow: false
// 					},
// 					title: {
// 						text: ''
// 					},
// 					pane: {
// 						startAngle: -150,
// 						endAngle: 150,
// 					},
// 					yAxis: {
// 						min: 0,
// 						max: 150,
// 						minorTickInterval: 'auto',
// 						minorTickWidth: 1,
// 						minorTickLength: 10,
// 						minorTickPosition: 'inside',
// 						minorTickColor: '#666',
// 						tickPixelInterval: 20,
// 						tickWidth: 2,
// 						tickPosition: 'inside',
// 						tickLength: 10,
// 						tickColor: '#666',
// 						labels: {
// 							step: 2,
// 							rotation: 'auto'
// 						},
// 						title: {
// 							text: 'Percentage',
// 							y: 15, // 10 pixels down from the top
// 							style: {
// 									fontSize: '11px'                 
// 							}
// 						},
// 						plotBands: [{
// 							from: 0,
// 							to: 75,
// 							color: '#56c03c' // green
// 						}, {
// 							from: 75,
// 							to: 100,
// 							color: '#f27c4e' // orange
// 						}, {
// 							from: 100,
// 							to: 150,
// 							color: '#e15352' // red
// 						}]
// 					},
// 					series: [{
// 						name: 'Hour Used',
// 						data: [percentages],
// 						tooltip: {
// 							valueSuffix: ' %'
// 						}
// 					}]
// 				},function (chart) {
// 					//setTimeout(poll(),10000);
// 				});
// 			}
// 		}
// 	};
// 	$scope.getSubsSubCategories=function(department) {
// 		var workHours = department.workedHours;
// 		workHours = workHours.split(":");
// 		workHours = workHours[0];
// 		workHours = parseInt(workHours);
// 		var moneySpent = department.moneySpent;
// 		if(workHours=='0') {
// 			$scope.actualSubDeptPer = '00';
// 		} else if(moneySpent=='0') {
// 			$scope.actualSubDeptPer = '00';
// 		} else {
// 			var actualDeptPer = workHours * 100 / parseInt(moneySpent);
// 			$scope.actualSubDeptPer =  Math.round(actualDeptPer);
// 		}
// 		if(idArry1.indexOf(department._id)==-1) {
// 			idArry1.push(department._id);
// 			var percentages = 0;
// 			if(department.percentageUsed!='NaN' && department.percentageUsed!='') {
// 				percentages = Math.round(department.percentageUsed);
// 			}
// 			if(percentages>150) {
// 				percentages=150;
// 			}
// 			if(department.subDeptName) {
// 				$('#subMeter'+department._id).highcharts({
// 					chart: {
// 						type: 'gauge',
// 						plotBackgroundColor: null,
// 						plotBackgroundImage: null,
// 						plotBorderWidth: 0,
// 						plotShadow: false
// 					},
// 					title: {
// 						text: ''
// 					},
// 					pane: {
// 						startAngle: -150,
// 						endAngle: 150,
// 					},
// 					yAxis: {
// 						min: 0,
// 						max: 150,
// 						minorTickInterval: 'auto',
// 						minorTickWidth: 1,
// 						minorTickLength: 10,
// 						minorTickPosition: 'inside',
// 						minorTickColor: '#666',
// 						tickPixelInterval: 20,
// 						tickWidth: 2,
// 						tickPosition: 'inside',
// 						tickLength: 10,
// 						tickColor: '#666',
// 						labels: {
// 							step: 2,
// 							rotation: 'auto'
// 						},
// 						title: {
// 							text: 'Percentage',
// 							y: 15, // 10 pixels down from the top
// 							style: {
// 									fontSize: '11px'                 
// 							}
// 						},
// 						plotBands: [{
// 							from: 0,
// 							to: 75,
// 							color: '#56c03c' // green
// 						}, {
// 							from: 75,
// 							to: 100,
// 							color: '#f27c4e' // orange
// 						}, {
// 							from: 100,
// 							to: 150,
// 							color: '#e15352' // red
// 						}]
// 					},
// 					series: [{
// 						name: 'Hour Used',
// 						data: [percentages],
// 						tooltip: {
// 							valueSuffix: ' %'
// 						}
// 					}]
// 				},function (chart) {
// 					//setTimeout(poll(),10000);
// 				});
// 			}
// 		}
// 	};
// 	$scope.checkPerFun = function(percentage,id) {
// 		changebutton(percentage,id);
// 	};	
// 	$scope.nextDashBoardDataFn=function(weekStart,weekEnd,companyId) {
// 		clearTimeout(clearTime);
// 		var date = moment(weekEnd);
// 		var sDate = date.add(1, 'days');
// 		var startDate = moment(sDate).format("YYYY-MM-DD");
// 		var d1 = moment(weekStart);
// 		var d2 = moment(weekEnd);
// 		var days = moment.duration(d2.diff(d1)).asDays();
// 		var eDate = date.add(days, 'days');
// 		var endDate = moment(eDate).format("YYYY-MM-DD");
// 		$location.path('/meterdashboard/'+startDate+'/'+endDate);
// 	};
// 	$scope.previousDashBoardDataFn=function(weekStart,weekEnd,companyId) {
// 		clearTimeout(clearTime);
// 		var lastData = 0;
// 		$scope.dashboardData=[];
// 		var date = moment(weekStart);
// 		var eDate = date.subtract(1, 'days');
// 		var EndDate = moment(eDate).format("YYYY-MM-DD");
// 		var d1 = moment(weekStart);
// 		var d2 = moment(weekEnd);
// 		var days = moment.duration(d2.diff(d1)).asDays();
// 		var date1 = moment(EndDate);
// 		var sDate = date.subtract(days, 'days');
// 		var startDate = moment(sDate).format("YYYY-MM-DD");
// 		$location.path('/meterdashboard/'+startDate+'/'+EndDate);
// 	};
// 	$scope.saveSubDeptBudgetedSale = function(id,budgetedSubDeptSale,index,curDate,allocatedHours) {
// 		var model = $parse('subDeptSaleSaved'+index);
// 		console.log(parseInt(allocatedHours));
// 		if(parseInt(allocatedHours)>0){
// 			if(budgetedSubDeptSale=='') 
// 				budgetedSubDeptSale = 0
// 			var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,myDate:curDate,budgetedSale:budgetedSubDeptSale};
// 			// console.log(data);
// 			$http.post('/budgetedSubDeptSaleSave',data).success(function(resp){
// 				console.log(JSON.parse(resp));
// 				if(JSON.parse(resp)){
// 					console.log("if");
// 					model.assign($scope, true);
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}else{
// 					console.log("else");
// 					model.assign($scope, 'errors');
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}    
// 			});
// 		}else{
// 			model.assign($scope, 'errors');
// 			$timeout(function() {
// 		        model.assign($scope, false);
// 		    }, 3000);
// 		}	
// 		// .error(function(err){
// 		// 	console.log("erro5r");
// 		// });		
// 	};
// 	$scope.saveSubDeptActualSale = function(id,actualSales,index,curDate,allocatedHours) {
// 		var model = $parse('actSubDeptSaleSaved'+index);
// 		console.log(parseInt(allocatedHours));
// 		if(parseInt(allocatedHours)>0){
// 			if(actualSales=='') 
// 				actualSales = 0
// 			var data = {subDepartmentId:id,weekEnd:$scope.to,weekStart:$scope.from,myDate:curDate,actualSales:actualSales};
// 			$http.post('/actualSubDeptSaleSave',data).success(function(resp){
// 				console.log(JSON.parse(resp));
// 				if(JSON.parse(resp)){
// 					console.log("if");
// 					model.assign($scope, true);
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}else{
// 					console.log("else");
// 					model.assign($scope, 'errors');
// 					$timeout(function() {
// 				        model.assign($scope, false);
// 				    }, 3000);
// 				}    
// 			});
// 		}else{
// 			model.assign($scope, 'errors');
// 			$timeout(function() {
// 		        model.assign($scope, false);
// 		    }, 3000);
// 		}				
// 	};
// 	$scope.calculateThePer = function (dept) {
// 		var workHours = dept.workedHours;
// 		workHours = workHours.split(":");
// 		workHours = workHours[0];
// 		workHours = parseInt(workHours);
// 		var moneySpent = dept.moneySpent;
// 		$scope.actualDeptPer = workHours * 100 / parseInt(moneySpent);
// 		// $scope.actualDeptPer = dept.workedHours;
// 	};
// 	// $scope.saveBudgetedSale = function(budgetedSales) {
// 	// 	if(budgetedSales=='')
// 	// 		budgetedSales = '0'
// 	// 	var data = {weekEnd:$scope.to,weekStart:$scope.from,budgetedSale:budgetedSales};
// 	// 	$http.post('/budgetedSaleSave',data).success(function(data) {
// 	// 		if(data){
// 	// 			$scope.saleSaved= true;
// 	// 			$timeout(function() {
// 	// 		        $scope.saleSaved=false;
// 	// 		    }, 3000);
// 	// 		}
// 	// 	});
// 	// };	
// 	// $scope.saveDeptBudgetedSale = function(id,budgetedDeptSale,index) {
// 	// 	var model = $parse('deptSaleSaved'+index);
// 	// 	if(budgetedDeptSale=='')
// 	// 		budgetedDeptSale=0;
// 	// 	var data = {departmentId:id,weekEnd:$scope.to,weekStart:$scope.from,budgetedSale:budgetedDeptSale};
// 	// 	$http.post('/budgetedDeptSaleSave',data).success(function(data){
// 	// 		model.assign($scope, true);
// 	// 		$timeout(function() {
// 	// 	        model.assign($scope, false);
// 	// 	    }, 3000);
// 	// 	});		
// 	// };
// 	// $scope.saveMainActualSale = function(actualSales) {
// 	// 	if(actualSales=='')
// 	// 		actualSales = '0'
// 	// 	var data = {weekEnd:$scope.to,weekStart:$scope.from,actualSales:actualSales};
// 	// 	$http.post('/actualSaleSave',data).success(function(data) {
// 	// 		if(data){
// 	// 			$scope.actSaleSaved= true;
// 	// 			$timeout(function() {
// 	// 		       $scope.actSaleSaved= false;
// 	// 		    }, 3000);
// 	// 		}
// 	// 	});
// 	// };
// 	// $scope.saveDeptActualSale = function(id,actualDeptSale,index) {
// 	// 	var model = $parse('actDeptSaleSaved'+index);
// 	// 	if(actualDeptSale=='')
// 	// 		actualDeptSale=0;
// 	// 	var data = {departmentId:id,weekEnd:$scope.to,weekStart:$scope.from,actualSale:actualDeptSale};
// 	// 	$http.post('/actualDeptSaleSave',data).success(function(data){
// 	// 		if(data){
// 	// 			model.assign($scope, true);
// 	// 			$timeout(function() {
// 	// 		        model.assign($scope, false);
// 	// 		    }, 3000);
// 	// 		}    
// 	// 	});		
// 	// };	
// 	// $scope.assignSubHours = function(value, id){
// 	// 	var data = {
// 	// 		start:$scope.start,
// 	// 		end:$scope.end,
// 	// 		hours:value,
// 	// 		id:'dept/'+id,
// 	// 	}
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.post('/allocateSubHours',data).success(function(data){
// 	// 			if(data == "true"){     
// 	// 				$http.get("/getdahboardData/"+$scope.start+"/"+$scope.end).success(function(dataDash) {
// 	// 					if(dataDash){
// 	// 						$("#"+id).val('');
// 	// 						idArry = [];
// 	// 						idArry1 = [];							
// 	// 						if(deptList != 'false') {
// 	// 							if(dataDash.data.departments!=null) {
// 	// 								var newallocatedHours = 0;
// 	// 								var newworkedHours = 0;
// 	// 								var newmoneySpent = 0;
// 	// 								var budgetedSalesTotal=0;
// 	// 								var budgetedWagesTotal=0;								
// 	// 								var result = [];
// 	// 								var cnt = 0;
// 	// 								deptList.forEach(function(key) {
// 	// 									cnt++;										
// 	// 									dataDash.data.departments.filter(function(item) {
// 	// 										if(item.departmentName == key) {
// 	// 											budgetedSalesTotal+=parseInt(item.budgetedSales);
// 	// 											budgetedWagesTotal+=parseInt(item.budgetedWages);
// 	// 											result.push(item);
// 	// 											var alcHrs=item.allocatedHours.split(":");												
// 	// 											alcHrs = alcHrs[0];
// 	// 											alcHrs = parseInt(alcHrs);
// 	// 											newallocatedHours=newallocatedHours+alcHrs;
// 	// 											var workedH=item.workedHours.split(":");
// 	// 											workedH = workedH[0];
// 	// 											workedH = parseInt(workedH);
// 	// 											newworkedHours=newworkedHours+workedH;
// 	// 											var mSpend=item.moneySpent;												
// 	// 											mSpend = parseInt(mSpend);
// 	// 											newmoneySpent=newmoneySpent+mSpend;
// 	// 										}
// 	// 									});
// 	// 									if(cnt==deptList.length) {
// 	// 										dataDash.data.budgetedSales=budgetedSalesTotal;
// 	// 										dataDash.data.budgetedWages=budgetedWagesTotal;
// 	// 										dataDash.data.moneySpent = newmoneySpent;
// 	// 										dataDash.data.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 										dataDash.data.allocatedHours = newallocatedHours+":00:00";
// 	// 										dataDash.data.workedHours = newworkedHours+":00:00";
// 	// 										dataDash.data.departments = result;
// 	// 										$scope.dashboardData = dataDash.data; 
// 	// 									}
// 	// 								});
// 	// 							}
// 	// 							if(dataDash.subDepartmentList!=null) {
// 	// 								var result1 = [];
// 	// 								var cnt1 = 0;
// 	// 								deptList.forEach(function(key1) {
// 	// 									cnt1++;										
// 	// 									dataDash.subDepartmentList.filter(function(item1) {
// 	// 										if(item1.parentDeptName == key1) {
// 	// 											result1.push(item1);
// 	// 										}
// 	// 									});
// 	// 									if(cnt1==deptList.length) {
// 	// 										dataDash.subDepartmentList = result;
// 	// 										if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 											$scope.subDepartments = dataDash.subDepartmentList; 
// 	// 										}											
// 	// 									}
// 	// 								})
// 	// 							}
// 	// 						} else {
// 	// 							if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 								$scope.subDepartments = dataDash.subDepartmentList;
// 	// 							}								
// 	// 							$scope.dashboardData = dataDash.data;
// 	// 						}							
// 	// 					}
// 	// 				}); 
// 	// 			}
// 	// 		});
// 	// 	});    
// 	// };
// 	// $scope.assignHours = function(value, id){
// 	// 	var data = {
// 	// 		start:$scope.start,
// 	// 		end:$scope.end,
// 	// 		hours:value,
// 	// 		id:'dept/'+id,
// 	// 	}
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.post('/allocateHours',data).success(function(data){
// 	// 			if(data == "true") {
// 	// 				setTimeout(function(){      
// 	// 					$http.get("/getdahboardData/"+$scope.start+"/"+$scope.end).success(function(dataDash) {
// 	// 						if(dataDash){
// 	// 							$("#"+id).val('');
// 	// 							idArry = [];
// 	// 							idArry1 = [];
// 	// 							if(deptList != 'false') {																								
// 	// 								if(dataDash.data.departments!=null) {
// 	// 									var newallocatedHours = 0;
// 	// 									var newworkedHours = 0;
// 	// 									var newmoneySpent = 0;
// 	// 									var budgetedSalesTotal=0;
// 	// 									var budgetedWagesTotal=0;
// 	// 									var result = [];
// 	// 									var cnt = 0;
// 	// 									deptList.forEach(function(key) {
// 	// 										cnt++;
// 	// 										dataDash.data.departments.filter(function(item) {
// 	// 											if(item.departmentName == key) {
// 	// 												budgetedSalesTotal+=parseInt(item.budgetedSales);
// 	// 												budgetedWagesTotal+=parseInt(item.budgetedWages);
// 	// 												result.push(item);
// 	// 												var alcHrs=item.allocatedHours.split(":");												
// 	// 												alcHrs = alcHrs[0];
// 	// 												alcHrs = parseInt(alcHrs);
// 	// 												newallocatedHours=newallocatedHours+alcHrs;
// 	// 												var workedH=item.workedHours.split(":");
// 	// 												workedH = workedH[0];
// 	// 												workedH = parseInt(workedH);
// 	// 												newworkedHours=newworkedHours+workedH;
// 	// 												var mSpend=item.moneySpent;												
// 	// 												mSpend = parseInt(mSpend);
// 	// 												newmoneySpent=newmoneySpent+mSpend;
// 	// 											}
// 	// 										});
// 	// 										if(cnt==deptList.length) {
// 	// 											dataDash.data.budgetedSales=budgetedSalesTotal;
// 	// 											dataDash.data.budgetedWages=budgetedWagesTotal;
// 	// 											dataDash.data.moneySpent = newmoneySpent;
// 	// 											dataDash.data.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 											dataDash.data.allocatedHours = newallocatedHours+":00:00";
// 	// 											dataDash.data.workedHours = newworkedHours+":00:00";
// 	// 											dataDash.data.departments = result;
// 	// 											$scope.dashboardData = dataDash.data; 
// 	// 										}
// 	// 									});
// 	// 								}
// 	// 								if(dataDash.subDepartmentList!=null) {
// 	// 									var result1 = [];
// 	// 									var cnt1 = 0;
// 	// 									deptList.forEach(function(key1) {
// 	// 										cnt1++;
// 	// 										dataDash.subDepartmentList.filter(function(item1) {
// 	// 											if(item1.parentDeptName == key1) {
// 	// 												result1.push(item1);
// 	// 											}
// 	// 										});
// 	// 										if(cnt1==deptList.length) {
// 	// 											dataDash.subDepartmentList = result;
// 	// 											if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 												$scope.subDepartments = dataDash.subDepartmentList; 
// 	// 											}												
// 	// 										}
// 	// 									})
// 	// 								}
// 	// 							} else {
// 	// 								if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 									$scope.subDepartments = dataDash.subDepartmentList;
// 	// 								}									
// 	// 								$scope.dashboardData = dataDash.data;
// 	// 							}
// 	// 						}        
// 	// 					});
// 	// 				},1000);
// 	// 			}
// 	// 		});
// 	// 	});
// 	// };
// 	// $scope.assigntotalHours = function(value, id,divId){
// 	// 	var data = {
// 	// 		start:$scope.start,
// 	// 		end:$scope.end,
// 	// 		hours:value,
// 	// 		id:'cmp/'+id,
// 	// 	}
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.post('/allocateHours',data).success(function(data){
// 	// 			if(data == "true") {
// 	// 				setTimeout(function(){ 
// 	// 					$http.get("/getdahboardData/"+$scope.start+"/"+$scope.end).success(function(dataDashs) {
// 	// 						if(dataDashs!=false){
// 	// 							$("#"+id).val('');
// 	// 							idArry = [];
// 	// 							idArry1 = [];
// 	// 							if(deptList != 'false') {								
// 	// 								if(dataDashs.data.departments!=null) {
// 	// 									var newallocatedHours = 0;
// 	// 									var newworkedHours = 0;
// 	// 									var newmoneySpent = 0;
// 	// 									var budgetedSalesTotal=0;
// 	// 									var budgetedWagesTotal=0;
// 	// 									var result = [];
// 	// 									var cnt = 0;
// 	// 									deptList.forEach(function(key) {
// 	// 										cnt++;
// 	// 										dataDashs.data.departments.filter(function(item) {
// 	// 											if(item.departmentName == key) {
// 	// 												budgetedSalesTotal+=parseInt(item.budgetedSales);
// 	// 												budgetedWagesTotal+=parseInt(item.budgetedWages);
// 	// 												result.push(item);
// 	// 												var alcHrs=item.allocatedHours.split(":");
// 	// 												alcHrs = alcHrs[0];
// 	// 												alcHrs = parseInt(alcHrs);
// 	// 												newallocatedHours=newallocatedHours+alcHrs;
// 	// 												var workedH=item.workedHours.split(":");
// 	// 												workedH = workedH[0];
// 	// 												workedH = parseInt(workedH);
// 	// 												newworkedHours=newworkedHours+workedH;
// 	// 												var mSpend=item.moneySpent;												
// 	// 												mSpend = parseInt(mSpend);
// 	// 												newmoneySpent=newmoneySpent+mSpend;
// 	// 											}
// 	// 										});
// 	// 										if(cnt==deptList.length) {
// 	// 											dataDash.data.budgetedSales=budgetedSalesTotal;
// 	// 											dataDash.data.budgetedWages=budgetedWagesTotal;
// 	// 											dataDashs.data.moneySpent = newmoneySpent;
// 	// 											dataDashs.data.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 											dataDashs.data.allocatedHours = newallocatedHours+":00:00";
// 	// 											dataDashs.data.workedHours = newworkedHours+":00:00";
// 	// 											dataDashs.data.departments = result;
// 	// 											$scope.dashboardData = dataDashs.data; 
// 	// 										}
// 	// 									});
// 	// 								}
// 	// 								if(dataDashs.subDepartmentList.subDepartments) {
// 	// 									var result1 = [];
// 	// 									var cnt1 = 0;
// 	// 									deptList.forEach(function(key1) {
// 	// 										cnt1++;
// 	// 										dataDashs.subDepartmentList.subDepartments.filter(function(item1) {
// 	// 											if(item1.parentDeptName == key1) {
// 	// 												result1.push(item1);
// 	// 											}
// 	// 										});
// 	// 										if(cnt1==deptList.length) {
// 	// 											dataDashs.subDepartmentList.subDepartments = result;
// 	// 											if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 												$scope.subDepartments = dataDashs.subDepartmentList;
// 	// 											}
// 	// 										}
// 	// 									})
// 	// 								}
// 	// 							} else {
// 	// 								if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 									$scope.subDepartments = dataDashs.subDepartmentList;
// 	// 								}									
// 	// 								$scope.dashboardData = dataDashs.data;
// 	// 							}
// 	// 							// $scope.dashboardData = dataDashs.data;
// 	// 							var dataDash = dataDashs.data;
// 	// 							var percentage = dataDash.percentageUsed;
// 	// 							changebutton(percentage,'main');
// 	// 							if(parseInt(percentage)>150 && (dataDash.percentageUsed)!='') {
// 	// 								$scope.pData = 150;
// 	// 							} else if((dataDash.percentageUsed)!='') {
// 	// 								if(dataDash.percentageUsed=='NaN') {
// 	// 									$scope.pData = 0;
// 	// 								} else {
// 	// 									$scope.pData = Math.round(dataDash.percentageUsed);  
// 	// 								}              
// 	// 							} else {
// 	// 								$scope.pData = 0;
// 	// 							}
// 	// 							$('#guageMeter').highcharts({
// 	// 								chart: {
// 	// 									type: 'gauge',
// 	// 									plotBackgroundColor: null,
// 	// 									plotBackgroundImage: null,
// 	// 									plotBorderWidth: 0,
// 	// 									plotShadow: false
// 	// 								},
// 	// 								title: {
// 	// 									text: ''
// 	// 								},
// 	// 								pane: {
// 	// 									startAngle: -150,
// 	// 									endAngle: 150,
// 	// 								},
// 	// 								yAxis: {
// 	// 									min: 0,
// 	// 									max: 150,
// 	// 									minorTickInterval: 'auto',
// 	// 									minorTickWidth: 1,
// 	// 									minorTickLength: 10,
// 	// 									minorTickPosition: 'inside',
// 	// 									minorTickColor: '#666',
// 	// 									tickPixelInterval: 20,
// 	// 									tickWidth: 2,
// 	// 									tickPosition: 'inside',
// 	// 									tickLength: 10,
// 	// 									tickColor: '#666',
// 	// 									labels: {
// 	// 										step: 2,
// 	// 										rotation: 'auto'
// 	// 									},
// 	// 									title: {
// 	// 										text: 'Percentage',
// 	// 										y: 15, // 10 pixels down from the top
// 	// 										// style: {
// 	// 										// 		fontSize: '11px'                 
// 	// 										// }
// 	// 									},
// 	// 									plotBands: [{
// 	// 										from: 0,
// 	// 										to: 75,
// 	// 										color: '#56c03c' // green
// 	// 									}, {
// 	// 										from: 75,
// 	// 										to: 100,
// 	// 										color: '#f27c4e' // orange
// 	// 									}, {
// 	// 										from: 100,
// 	// 										to: 150,
// 	// 										color: '#e15352' // red
// 	// 									}]
// 	// 								},
// 	// 								series: [{
// 	// 									name: 'Hour Used',
// 	// 									data: [$scope.pData],
// 	// 									tooltip: {
// 	// 										valueSuffix: ' %'
// 	// 									}
// 	// 								}]
// 	// 							},function (chart) {});
// 	// 						}        
// 	// 					});
// 	// 				}, 1000);				
// 	// 			}
// 	// 		});
// 	// 	});
// 	// };
// });
// timecloud.controller('headerController',function ($route, $scope,$http,$location, myService,holidayservice,$routeParams, $modal) { //header controller
// 		$scope.$on('message', function() {
// 			$scope.messages = myService.getmessages();
// 		});
// 		$scope.$on('timeChanged', function() {
// 			$scope.delayTime = holidayservice.getTooltip()
// 			/*if(holidayservice.getTooltip() == true){
// 				$scope.showHolidays = 1;
// 			}      
// 			else {
// 				$scope.showHolidays = 0;       
// 			}
// 			$scope.showMenu = 1;   */     
// 		});
// 		$scope.$on('activeChange', function() {
// 			$http.get('/adminEmployeeNo').success(function(data) { 
// 				if(data){ 
// 					$scope.employeeNo = data; 
// 				}      
// 			});
// 		});
// 		$scope.$on('holidayChanged', function() {
// 			if(holidayservice.getAssignHoliday() == true){
// 				$scope.showHolidays = 1;       
// 			}      
// 			else {
// 				$scope.showHolidays = 0;       
// 			}
// 			$scope.showMenu = 1;        
// 		});
// 		$scope.$on('rosterChanged', function() {
// 			if(holidayservice.getAssignRoster() == true){
// 				$scope.showRoster = 1;       
// 			}      
// 			else {
// 				$scope.showRoster = 0;       
// 			}
// 			$scope.showMenu = 1;        
// 		});
// 		$scope.$on('projectChanged', function() {
// 			if(holidayservice.getAssignProject() == true){
// 				$scope.showProject = 1;       
// 			}      
// 			else {
// 				$scope.showProject = 0;       
// 			}
// 			$scope.showMenu = 1;        
// 		});
// 		$scope.$on('dashboardChanged', function() {
// 			if(holidayservice.getdashboard() == true){
// 				$scope.showDashboard = 1;       
// 			}      
// 			else {
// 				$scope.showDashboard = 0;       
// 			}
// 			$scope.showMenu = 1;        
// 		});
// 		$scope.$on('openModel', function() {
// 			var flag = myService.getFlag();
// 			if(flag == 0){
// 				$scope.openModel();
// 			}
// 		});
// 		$scope.openModel = function () {   
// 			var modalInstance = $modal.open({
// 				templateUrl: 'instantmessage.html',
// 				backdrop: 'static',
// 				controller: ModalInstanceCtrl       
// 			});  
// 			myService.setFlag(1);   
// 		}
// 		var ModalInstanceCtrl = function ($scope, $modalInstance, myService) { 
// 			$scope.msgData = myService.getMessageData();
// 			$scope.ok = function (value) {  
// 				var checkbox = document.getElementById('confirm');
// 				if(checkbox.checked){
// 					$http.get('/messageconfirmation/'+value).success(function(data) { 
// 						if(data){ 
// 							 myService.setFlag(0); 
// 							 $modalInstance.dismiss('cancel');
// 							 $http.get('/checkmessage').success(function(data) {       
// 								if(data != 0){       
// 									myService.setmessages(data.count); 
// 									if(data.msgData) {  
// 											myService.openModel(data.msgData);
// 									}
// 								}else{
// 									myService.setmessages(0);
// 								}
// 							});
// 						}      
// 					});				 
// 				}else{
// 					alert('please confirm message read');
// 				}				
// 			};					 
// 			$scope.cancel = function () {
// 				$modalInstance.dismiss('cancel');
// 				$scope.modelflag = 0;
// 			};
// 		};
// 		$scope.$location = $location;
// 		var ln = $scope.$location.path();   
// 		if(ln.indexOf('/employeelist') >-1 ){
// 			$scope.hideHeader = 'true';     
// 		}
// 		if(ln.indexOf('/daycardpaytime') >-1 ){
// 			$scope.hideHeader = 'true';     
// 		}
// 		if(ln.indexOf('/daycardstandard') >-1 ){
// 			$scope.hideHeader = 'true';     
// 		}
// 	 	$http.get('/companydata').success(function(data) { 
// 			if(data){   
// 				$scope.delayTime = data.tooltipDelayTime;
// 			}
// 			if(data.isHolidays == true){
// 				$scope.showHolidays = 1;
// 			} else {
// 				$scope.showHolidays = 0;
// 			}
// 			if(data.isRoster == true){
// 				$scope.showRoster = 1;
// 			}else{
// 				$scope.showRoster = 0;
// 			}
// 			if(data.isProject == true){
// 				$scope.showProject = 1;
// 			}else{
// 				$scope.showProject = 0;
// 			}
// 			if(data.isdashboard == true){
// 				$scope.showDashboard = 1;       
// 			}else {
// 				$scope.showDashboard = 0;       
// 			}
// 			if(data.isMap == true){
// 				$scope.showMaps = 1;       
// 			} else {
// 				$scope.showMaps = 0;       
// 			}
// 			if(data.isScheduling == true){
// 				$scope.showScheduling = 1;       
// 			} else {
// 				$scope.showScheduling = 0;       
// 			}
// 			if(data.country && data.email && data.phone && data.companyname){
// 				$scope.showMenu = 1;
// 			}else{
// 				$scope.showMenu = 0;
// 			}			
// 		}); 
// 	 	$scope.toggleFn = function(page){
// 			if(page=='attendanceedit') {
// 				if(localStorage.getItem("empNo")!=null) {
// 					$location.path('/attendanceedit/'+localStorage.getItem("empNo"));
// 				} else {
// 					$http.get('/adminEmployeeNo').success(function(data) { 
// 						if(data){ 
// 							$location.path('/attendanceedit/'+data);
// 						}      
// 					});
// 				}
// 			}
// 			if(page=='logout') {
// 				localStorage.removeItem("empNo");
// 				localStorage.removeItem("userId");
// 				localStorage.removeItem("adminType");
// 			}
// 			$(".navbar-collapse").removeClass("in").addClass("navbar-collapse collapse");
// 	 	}
// });
// function message(data, $scope){
// 	if(data.msgData){   
// 		$scope.messageList = data.msgData;              
// 	}
// 	$scope.page = data.page;
// 	$scope.pages = data.pages;
// 	var ranges = [];
// 	$scope.currentPage = 1;
// 	$('#'+$scope.currentPage).addClass('active');
// 	for(var i=1;i<=data.pages;i++) {
// 		if(i<10) {
// 			ranges.push(i);
// 		}
// 	}
// 	$scope.range = ranges;
// 	$scope.getPage = function (pageNo) {
// 		$scope.currentPage = pageNo;
// 	}
// 	$scope.getPageNext = function (pagevalue) {
// 		if(pagevalue<data.pages) {
// 			$scope.currentPage = pagevalue+1;
// 		}
// 	};
// 	$scope.getPagePrevious = function (pagevalue) {
// 		if(pagevalue>1) {
// 			$scope.currentPage = pagevalue-1;
// 		}
// 	};
// }
// timecloud.controller('usermessagesController',function ($scope,$http,$location, myService,$routeParams) { //usermessages controller     
// 	$http.get('/getMessageList').success(function(data) { 
// 			message(data, $scope);
// 	}); 
// 	$scope.checkAll = function(){
// 		//alert($scope.selectedAll);
// 		if($scope.selectedAll) {
// 				$scope.selectedAll = false;
// 		} else {
// 				$scope.selectedAll = true;
// 		}
// 		angular.forEach($scope.messageList, function (item) { 
// 			item.Selected = $scope.selectedAll;
// 		});
// 	}
// 	$scope.delete = function(){
// 		var checkboxes = [];
// 		var inputElements = document.getElementsByName('messageChk');
// 		for(var i=0; inputElements[i]; ++i){
// 			if(inputElements[i].checked){             
// 				checkboxes.push(inputElements[i].value);                
// 			}
// 		}
// 		if(checkboxes.length>0){
// 			$scope.formData = {
// 			'messagesId':checkboxes
// 			}
// 			$http.post('/deletemessages',$scope.formData).success(function(data){
// 				if(data == "true"){     
// 					$http.get('/getMessageList').success(function(newData) { 
// 						if(newData){ 
// 							$scope.selectedAll = false; 
// 							$http.get('/checkmessage').success(function(data) {       
// 								if(data != 0){    
// 									message(newData, $scope);   
// 									myService.setmessages(data.count);         //alert(data);
// 								}else{
// 									message(newData, $scope);   
// 									myService.setmessages(0);
// 								}
// 							});           
// 						}
// 					}); 
// 				}                                     
// 			});
// 		}else{
// 			alert('please select message');
// 		}		
// 	}
// 	$scope.markRead = function(){
// 		var checkboxes = [];
// 		var inputElements = document.getElementsByName('messageChk');
// 		for(var i=0; inputElements[i]; ++i){
// 			if(inputElements[i].checked){             
// 				checkboxes.push(inputElements[i].value);                
// 			}
// 		}
// 		if(checkboxes.length>0){
// 			$scope.formData = {
// 				'messagesId':checkboxes
// 			}
// 			$http.post('/markasRead',$scope.formData).success(function(data){
// 				if(data == "true"){     
// 					$http.get('/getMessageList').success(function(newData) { 
// 						if(newData){   
// 							//$scope.messageList = data.msgData; 
// 							$scope.selectedAll = false;    
// 							$http.get('/checkmessage').success(function(data) {       
// 								if(data != 0){  
// 									message(newData, $scope);        
// 									myService.setmessages(data.count);         //alert(data);
// 								}else{
// 									message(newData, $scope);   
// 									myService.setmessages(0);
// 								}
// 							});
// 						}
// 					});
// 				}                                     
// 			});
// 		}else{
// 			alert('please select message');
// 		}
// 	}
// 	$http.get('/companydata').success(function(data) { 
// 		if(data){   
// 			$scope.delayTime = data.tooltipDelayTime;
// 		}
// 	}); 
// });
// function messageNext(data, $scope){
// 				if(data.msgData){   
// 					$scope.messageList = data.msgData;              
// 				}
// 				$scope.page = data.page;
// 				/*alert(data.page);*/
// 				$scope.pages = data.pages;
// 				var ranges = [];
// 				//$scope.currentPage = 1;
// 				$('#'+$scope.currentPage).addClass('active'); 
// 				for(var i=1;i<=data.pages;i++)
// 				{
// 						if(i<10)
// 						{
// 								ranges.push(i);
// 						}
// 				}
// 				$scope.page = data.page;
// 				$scope.pages = data.pages;
// 				var ranges = [];
// 				$scope.currentPage = data.page;   
// 				if(data.page >10)
// 				{
// 						var start = data.page-10;
// 						var n =0;
// 						for(var i=start+1;i<data.pages;i++)
// 						{
// 								n++;
// 								if(n<=10)
// 								{
// 										ranges.push(i);
// 								}
// 						}
// 						$scope.range = ranges;
// 				}
// 				else
// 				{
// 						for(var i=1;i<=data.pages;i++)
// 						{
// 								if(i<=10)
// 								{
// 										ranges.push(i);
// 								}
// 						}
// 						$scope.range = ranges;
// 				}
// 				$scope.getPageNext = function (pagevalue) {
// 						if(pagevalue < data.pages)
// 						{
// 								pagevalue++;
// 								$scope.currentPage = pagevalue;
// 						}
// 				};
// 				$scope.getPagePrevious = function (pagevalue) {
// 						if(pagevalue>1)
// 						{
// 								$scope.currentPage = pagevalue - 1;
// 						}
// 				};
// }
// timecloud.controller('usermessagesNextController',function ($scope,$http,$location, myService,$routeParams) { //usermessages controller     
// 	$http.get('/getMessageList/'+$routeParams.page).success(function(data) {    
// 			messageNext(data, $scope);
// 	}); 
// 	$scope.checkAll = function(){
// 		//alert($scope.selectedAll);
// 			if($scope.selectedAll) {
// 					$scope.selectedAll = false;
// 			} else {
// 					$scope.selectedAll = true;
// 			}
// 			angular.forEach($scope.messageList, function (item) { 
// 					item.Selected = $scope.selectedAll;
// 			});
// 	}
// 	$scope.delete = function(){
// 		var checkboxes = [];
// 		var inputElements = document.getElementsByName('messageChk');
// 		for(var i=0; inputElements[i]; ++i){
// 			if(inputElements[i].checked){             
// 				checkboxes.push(inputElements[i].value);                
// 			}
// 		}
// 		if(checkboxes.length>0){
// 			$scope.formData = {
// 			'messagesId':checkboxes
// 			}
// 			$http.post('/deletemessages',$scope.formData).success(function(data){
// 					if(data == "true"){  
// 						if($scope.selectedAll == true){              
// 							$scope.selectedAll = false;  
// 							var page = $routeParams.page - 1 
// 							$location.path('/usermessages/'+page)
// 						}else{
// 							$http.get('/getMessageList/'+$routeParams.page).success(function(newData) { 
// 									$http.get('/checkmessage').success(function(data) {       
// 										if(data != 0){     
// 											messageNext(newData, $scope);  
// 											myService.setmessages(data.count);         //alert(data);
// 										}else{
// 											messageNext(newData, $scope);
// 											myService.setmessages(0);
// 										}
// 									});  
// 							}); 
// 						}
// 					}                                     
// 			});
// 		}else{
// 			alert('please select message');
// 		}
// 	}
// 	$scope.markRead = function(){
// 		var checkboxes = [];
// 		var inputElements = document.getElementsByName('messageChk');
// 		for(var i=0; inputElements[i]; ++i){
// 			if(inputElements[i].checked){             
// 				checkboxes.push(inputElements[i].value);                
// 			}
// 		}
// 		if(checkboxes.length>0){
// 			$scope.formData = {
// 				'messagesId':checkboxes
// 			}
// 			$http.post('/markasRead',$scope.formData).success(function(data){
// 					if(data == "true"){   
// 						$scope.selectedAll = false;      
// 						$http.get('/getMessageList/'+$routeParams.page).success(function(newData) { 
// 							$http.get('/checkmessage').success(function(data) {       
// 								if(data != 0){     
// 									messageNext(newData, $scope);  
// 									myService.setmessages(data.count);         //alert(data);
// 								}else{
// 									messageNext(newData, $scope);
// 									myService.setmessages(0);
// 								}
// 							});     
// 						}); 
// 					}                                     
// 			});
// 		}else{
// 			alert('please select message');
// 		}
// 	}
// 	$http.get('/companydata').success(function(data) { 
// 			if(data){   
// 				$scope.delayTime = data.tooltipDelayTime;  
// 			}
// 	}); 
// });
// timecloud.controller('openmessageController',function ($scope,$http,$location, myService,$routeParams) { //openmessageController
//  // alert('openmessageController');
// 	$http.get('/openmessage/'+$routeParams.msgId).success(function(data) { 
// 			if(data){   
// 				$scope.messageData = data;              
// 			}
// 	}); 
// 	$http.get('/checkmessage').success(function(data) {       
// 			if(data != 0){       
// 				myService.setmessages(data.count);         //alert(data);
// 			}else{
// 				myService.setmessages(0);
// 			}
// 		});
// });
// timecloud.controller('footerController',function ($scope,$http,$location, myService,$routeParams) { //footer controller     
// 	$scope.$location = $location;
// 	 var ln = $scope.$location.path();   
// 	 if(ln.indexOf('/employeelist') >-1 ){
// 			$scope.hideFooter = 'true';     
// 	 }
// 	 if(ln.indexOf('/daycardpaytime') >-1 ){
// 			$scope.hideFooter = 'true';     
// 	 }
// 	 if(ln.indexOf('/daycardstandard') >-1 ){
// 			$scope.hideFooter = 'true';     
// 	 }
// 	$http.get('/companydata').success(function(data) { 
// 			if(data){   
// 				$scope.delayTime = data.tooltipDelayTime;  
// 			}
// 	}); 
// });
// //timecloud module controllers
// timecloud.controller('homeController',function ($scope,$http,$location, myService,$routeParams) { //home controller       
// 	$scope.departments=[];
// 	var test = {"D":{"path":"","font":{"name":"square","size":"50px"},"length":0,"text":[]},"G":{"path":"","font":{"name":"square","size":"50px"},"length":0,"text":[]},"E":{"path":"","font":{"name":"square","size":"50px"},"length":0,"text":[{"text":"rest"}]}};
// 	$scope.testRepeat = ["test","test"];
// 	$http.get('/companydata').success(function(data) { 
// 		if(data){ 
// 			$http.get('/checkadminDept').success(function(deptList) {
// 				if(data.isSubDepartmentEnable) {
// 					$http.get('/getSubDepartmentList').success(function(data) { 
// 						if(data){							
// 							if(deptList != 'false') { 
// 								var result = [];
// 								var cnt = 0;
// 								deptList.forEach(function(key) {
// 									cnt++;
// 									data.filter(function(item) {
// 										if(item.parentDeptName== key) {
// 											result.push(item);
// 										}
// 									});
// 									if(cnt==deptList.length) {
// 										$scope.subDepartmentList = result; 
// 									}
// 								})
// 							} else {
// 								$scope.subDepartmentList = data;
// 							}
// 						}
// 					});
// 				}
// 				if(data.tooltipDelayTime){
// 					$scope.delayTime = data.tooltipDelayTime;
// 				}
// 				if(data.departments && data.isdepartments){
// 					if(deptList != 'false') { 
// 						var result = [];
// 						var cnt = 0;
// 						deptList.forEach(function(key) {
// 							cnt++;
// 							data.departments.filter(function(item) {
// 								if(item.name== key) {
// 									result.push(item);
// 								}
// 							});
// 							if(cnt==deptList.length) {
// 								$scope.departments = result; 
// 							}
// 						})
// 					} else {
// 						$scope.departments = data.departments;  
// 					}
// 				}
// 			});
// 		}      
// 	});
// 	$http.get('/employeeHomeData').success(function(data) { 
// 		if(data){ 
// 			$scope.employeeList = []; 
// 			$http.get('/currentCheckin').success(function(attendancedata) { 
// 				if(attendancedata){   
// 				var checkins = [];
// 					attendancedata.forEach(function(employeeAttendance){          
// 							var employeeNo = employeeAttendance.employeeNo;
// 							if(employeeAttendance.checkin){
// 								 employeeAttendance.checkin.sort(orderByNameAscending);
// 								 var n = 1;  
// 								employeeAttendance.checkin.forEach(function(checkin){ 
// 										if(n==(employeeAttendance.checkin.length)){
// 												var checkType = checkin.checkType;
// 												//alert(checkType);
// 												var status = '';
// 												if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 														status = 'In';
// 												}else{
// 													if(checkType == 3){
// 														status = 'Break';
// 													}else{
// 														status = 'Out';
// 													}
// 												}
// 												checkins.push({
// 														'employeeNo':employeeNo,
// 														'status':status
// 												})
// 										}
// 										n++;     
// 								}); 
// 							}   
// 					});
// 					//console.log(checkins +'checkinscheckinscheckins');
// 					data.EmployeeData.sort(orderByempNo);
// 					// console.log(data.EmployeeData);
// 					checkins.sort(orderByempNo);
// 					//console.log(checkins);
// 					//alert(checkins.length);
// 					data.EmployeeData.forEach(function(emp){
// 						var status = '';
// 						for(var i=0; i<checkins.length; i++){
// 							if(checkins[i].employeeNo == emp.employeeNo){                  
// 								status = checkins[i].status;
// 							}                
// 						}
// 						//alert(status);
// 						//$scope.employeeList = '';
// 						$scope.employeeList.push({
// 							'employeeNo':emp.employeeNo,
// 							'firstName':emp.firstName,
// 							'lastName':emp.lastName,
// 							'shift':emp.shift,
// 							'department':emp.department,
// 							'subDepartment':emp.subDepartment,
// 							'_id':emp._id,
// 							'status':status
// 						})
// 						// console.log($scope.employeeList);
// 					});
// 				}
// 			}); 
// 			//$scope.employeeList =  data.EmployeeData;
// 		}      
// 	});  
// 	$scope.getSearch = function(){ 
// 			var serchData = {
// 				'searchtext': $scope.searchtext
// 			}
// 			$http.post("/employeeSearch", serchData).success(function(data){
// 				if(data){ 
// 					$scope.employeeList = [];
// 					$http.get('/currentCheckin').success(function(attendancedata) { 
// 						if(attendancedata){   
// 						var checkins = [];   
// 							attendancedata.forEach(function(employeeAttendance){          
// 									var employeeNo = employeeAttendance.employeeNo;
// 									//alert(employeeNo);
// 									//alert(employeeNo );
// 									if(employeeAttendance.checkin){
// 										 employeeAttendance.checkin.sort(orderByNameAscending);
// 										 var n = 1;  
// 										employeeAttendance.checkin.forEach(function(checkin){ 
// 												if(n==(employeeAttendance.checkin.length)){
// 														var checkType = checkin.checkType;
// 														//alert(checkType);
// 														var status = '';
// 														if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 																status = 'In';
// 														}else{
// 															if(checkType == 3){
// 																status = 'Break';
// 															}else{
// 																status = 'Out';
// 															}
// 														}
// 														checkins.push({
// 																'employeeNo':employeeNo,
// 																'status':status
// 														})
// 												}
// 												n++;     
// 										}); 
// 									}   
// 							});
// 							//console.log(checkins +'checkinscheckinscheckins');
// 							data.EmployeeData.sort(orderByempNo);
// 							checkins.sort(orderByempNo);
// 							//console.log(checkins);
// 							//alert(checkins.length);
// 							data.EmployeeData.forEach(function(emp){
// 								var status = '';
// 								for(var i=0; i<checkins.length; i++){
// 									if(checkins[i].employeeNo == emp.employeeNo){
// 										status = checkins[i].status;
// 									}                
// 								}
// 								$scope.employeeList.push({
// 									'employeeNo':emp.employeeNo,
// 									'firstName':emp.firstName,
// 									'lastName':emp.lastName,
// 									'shift':emp.shift,
// 									'department':emp.department,
// 									'_id':emp._id,
// 									'status':status
// 								})
// 								console.log($scope.employeeList);
// 							});
// 						}
// 					}); 
// 					//$scope.employeeList =  data.EmployeeData;
// 							/*$http.get('/employeeData').success(function(data) { 
// 								if(data){    
// 									$scope.employeeList = data;
// 								}      
// 							}); */ 
// 				}                                   
// 			});
// 	}
// 		$scope.deleteFrm = function(employeeId){
// 			$http.post("/employeedelete/"+employeeId).success(function(data){
// 						if(data == "true"){    
// 							$http.get('/employeeData').success(function(data) { 
// 								if(data){    
// 									$scope.employeeList = []; 
// 								}      
// 							});  
// 						}                                     
// 			});
// 		}  
// 		$scope.departmentFilter = function(department){
// 			$scope.subDepartment = '';
// 			if(department){
// 				$http.get('/employeeHomeDataDepartment/'+department).success(function(data) { 
// 					if(data){ 
// 						$scope.employeeList = []; 
// 						$http.get('/currentCheckin').success(function(attendancedata) { 
// 							if(attendancedata){   
// 							var checkins = [];   
// 								attendancedata.forEach(function(employeeAttendance){          
// 										var employeeNo = employeeAttendance.employeeNo;
// 										//alert(employeeNo);
// 										//alert(employeeNo );
// 										if(employeeAttendance.checkin){
// 											 employeeAttendance.checkin.sort(orderByNameAscending);
// 											 var n = 1;  
// 											employeeAttendance.checkin.forEach(function(checkin){ 
// 													if(n==(employeeAttendance.checkin.length)){
// 															var checkType = checkin.checkType;
// 															//alert(checkType);
// 															var status = '';
// 															if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 																	status = 'In';
// 															}else{
// 																if(checkType == 3){
// 																	status = 'Break';
// 																}else{
// 																	status = 'Out';
// 																}
// 															}
// 															checkins.push({
// 																	'employeeNo':employeeNo,
// 																	'status':status
// 															})
// 													}
// 													n++;     
// 											}); 
// 										}   
// 								});
// 								//console.log(checkins +'checkinscheckinscheckins');
// 								data.EmployeeData.sort(orderByempNo);
// 								checkins.sort(orderByempNo);
// 								//console.log(checkins);
// 								//alert(checkins.length);
// 								data.EmployeeData.forEach(function(emp){
// 									var status = '';
// 									for(var i=0; i<checkins.length; i++){
// 										if(checkins[i].employeeNo == emp.employeeNo){
// 											status = checkins[i].status;
// 										}                
// 									}
// 									$scope.employeeList.push({
// 										'employeeNo':emp.employeeNo,
// 										'firstName':emp.firstName,
// 										'lastName':emp.lastName,
// 										'shift':emp.shift,
// 										'department':emp.department,
// 										'subDepartment':emp.subDepartment,
// 										'_id':emp._id,
// 										'status':status
// 									})
// 								});
// 							}
// 						}); 
// 						//$scope.employeeList =  data.EmployeeData;
// 					}      
// 				});  
// 			}else{
// 				$http.get('/employeeHomeData').success(function(data) { 
// 				if(data){ 
// 					$scope.employeeList = []; 
// 					$http.get('/currentCheckin').success(function(attendancedata) { 
// 						if(attendancedata){   
// 						var checkins = [];   
// 							attendancedata.forEach(function(employeeAttendance){          
// 									var employeeNo = employeeAttendance.employeeNo;
// 									//alert(employeeNo);
// 									//alert(employeeNo );
// 									if(employeeAttendance.checkin){
// 										employeeAttendance.checkin.sort(orderByNameAscending);
// 										 var n = 1;  
// 										employeeAttendance.checkin.forEach(function(checkin){ 
// 												if(n==(employeeAttendance.checkin.length)){
// 														var checkType = checkin.checkType;
// 														//alert(checkType);
// 														var status = '';
// 														if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 																status = 'In';
// 														}else{
// 															if(checkType == 3){
// 																status = 'Break';
// 															}else{
// 																status = 'Out';
// 															}
// 														}
// 														checkins.push({
// 																'employeeNo':employeeNo,
// 																'status':status
// 														})
// 												}
// 												n++;     
// 										}); 
// 									}   
// 							});
// 							//console.log(checkins +'checkinscheckinscheckins');
// 							data.EmployeeData.sort(orderByempNo);
// 							checkins.sort(orderByempNo);
// 							//console.log(checkins);
// 							//alert(checkins.length);
// 							data.EmployeeData.forEach(function(emp){
// 								var status = '';
// 								for(var i=0; i<checkins.length; i++){
// 									if(checkins[i].employeeNo == emp.employeeNo){
// 										status = checkins[i].status;
// 									}                
// 								}
// 								$scope.employeeList.push({
// 									'employeeNo':emp.employeeNo,
// 									'firstName':emp.firstName,
// 									'lastName':emp.lastName,
// 									'shift':emp.shift,
// 									'department':emp.department,
// 									'subDepartment':emp.subDepartment,
// 									'_id':emp._id,
// 									'status':status
// 								})
// 							});
// 						}
// 					}); 
// 					//$scope.employeeList =  data.EmployeeData;
// 				}      
// 			});  
// 			}
// 		}
// 		$scope.sortByempNo = function(){
// 			$scope.employeeList.sort(orderByempNo);
// 		}
// 		$scope.sortByName = function(){
// 			$scope.employeeList.sort(orderByName);
// 		}
// 		$scope.sortByLastName = function(){
// 			$scope.employeeList.sort(orderByLastName);
// 		}
// 		$scope.sortByShiftPattern = function(){
// 			$scope.employeeList.sort(orderByShiftPattern);
// 		}
// 		$scope.sortByDepartment = function(){
// 			$scope.employeeList.sort(orderByDepartment);
// 		}
// 		$scope.sortByStatus = function(){
// 			$scope.employeeList.sort(orderByStatus);
// 		}
// 		/*$scope.check = function(value){
// 			alert('ss');
// 		}*/
// }); 
// timecloud.controller('homepageController',function ($scope,$http,$location, myService, $routeParams) { //home controller     
// 	$http.get('/companydata').success(function(data) { 
// 		if(data){ 
// 		 if(data.tooltipDelayTime){
// 				$scope.delayTime = data.tooltipDelayTime;
// 			}
// 		}      
// 	});
// 	$http.get('/employeeHomeData/'+$routeParams.page).success(function(data) { 
// 		if(data){    
// 			$scope.employeeList = []; 
// 			$http.get('/currentCheckin').success(function(attendancedata) { 
// 				if(attendancedata){   
// 				var checkins = [];
// 					attendancedata.forEach(function(employeeAttendance){          
// 							var employeeNo = employeeAttendance.employeeNo;
// 							//alert(employeeNo);
// 							//alert(employeeNo );
// 							if(employeeAttendance.checkin){
// 								employeeAttendance.checkin.sort(orderByNameAscending);
// 								 var n = 1;  
// 								employeeAttendance.checkin.forEach(function(checkin){ 
// 										if(n==(employeeAttendance.checkin.length)){
// 												var checkType = checkin.checkType;
// 												//alert(checkType);
// 												var status = '';
// 												if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 														status = 'In';
// 												}else{
// 													if(checkType == 3){
// 														status = 'Break';
// 													}else{
// 														status = 'Out';
// 													}
// 												}
// 												checkins.push({
// 														'employeeNo':employeeNo,
// 														'status':status
// 												})
// 										}
// 										n++;     
// 								}); 
// 							}   
// 					});
// 					//console.log(checkins +'checkinscheckinscheckins');
// 					data.EmployeeData.sort(orderByempNo);
// 					checkins.sort(orderByempNo);
// 					//console.log(checkins);
// 					//alert(checkins.length);
// 					data.EmployeeData.forEach(function(emp){
// 						var status = '';
// 						for(var i=0; i<checkins.length; i++){
// 							if(checkins[i].employeeNo == emp.employeeNo){
// 								status = checkins[i].status;
// 							}                
// 						}
// 						$scope.employeeList.push({
// 							'employeeNo':emp.employeeNo,
// 							'firstName':emp.firstName,
// 							'lastName':emp.lastName,
// 							'shift':emp.shift,
// 							'department':emp.department,
// 							'_id':emp._id,
// 							'status':status
// 						})
// 					});
// 				}
// 			}); 
// 			$scope.page = data.page;
// 			/*alert(data.page);*/
// 			$scope.pages = data.pages;
// 			var ranges = [];
// 			$scope.currentPage = data.page;   
// 			if(data.page >10)
// 			{
// 					var start = data.page-10;
// 					var n =0;
// 					for(var i=start+1;i<data.pages;i++)
// 					{
// 							n++;
// 							if(n<=10)
// 							{
// 									ranges.push(i);
// 							}
// 					}
// 					$scope.range = ranges;
// 			}
// 			else
// 			{
// 					for(var i=1;i<=data.pages;i++)
// 					{
// 							if(i<=10)
// 							{
// 									ranges.push(i);
// 							}
// 					}
// 					$scope.range = ranges;
// 			}
// 				$scope.getPageNext = function (pagevalue) {
// 						if(pagevalue < data.pages)
// 						{
// 								pagevalue++;
// 								$scope.currentPage = pagevalue;
// 								//$scope.url="#/articles/social/?page="+$scope.currentPage
// 						}
// 				};
// 				$scope.getPagePrevious = function (pagevalue) {
// 						if(pagevalue>1)
// 						{
// 								$scope.currentPage = pagevalue - 1;
// 						}
// 				};
// 		}      
// 	});  
// 	$scope.deleteFrm = function(employeeId){
// 		$http.post("/employeedelete/"+employeeId).success(function(data){
// 					if(data == "true"){    
// 						$http.get('/employeeData').success(function(data) { 
// 							if(data){    
// 								$scope.employeeList = data;
// 							}      
// 						});  
// 					}                                     
// 		});
// 	} 
// 	$scope.departmentFilter = function(department){
// 		if(department){
// 		$http.get('/employeeHomeDataDepartment/'+department).success(function(data) { 
// 			if(data){ 
// 				$scope.employeeList = []; 
// 				$http.get('/currentCheckin').success(function(attendancedata) { 
// 					if(attendancedata){   
// 					var checkins = [];   
// 						attendancedata.forEach(function(employeeAttendance){          
// 								var employeeNo = employeeAttendance.employeeNo;
// 								if(employeeAttendance.checkin){
// 									employeeAttendance.checkin.sort(orderByNameAscending); 
// 									 var n = 1;  
// 									employeeAttendance.checkin.forEach(function(checkin){ 
// 											if(n==(employeeAttendance.checkin.length)){
// 													var checkType = checkin.checkType;
// 													//alert(checkType);
// 													var status = '';
// 													if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 															status = 'In';
// 													}else{
// 														if(checkType == 3){
// 															status = 'Break';
// 														}else{
// 															status = 'Out';
// 														}
// 													}
// 													checkins.push({
// 															'employeeNo':employeeNo,
// 															'status':status
// 													})
// 											}
// 											n++;     
// 									}); 
// 								}   
// 						});
// 						//console.log(checkins +'checkinscheckinscheckins');
// 						data.EmployeeData.sort(orderByempNo);
// 						checkins.sort(orderByempNo);
// 						data.EmployeeData.forEach(function(emp){
// 							var status = '';
// 							for(var i=0; i<checkins.length; i++){
// 								if(checkins[i].employeeNo == emp.employeeNo){
// 									status = checkins[i].status;
// 								}                
// 							}
// 							$scope.employeeList.push({
// 								'employeeNo':emp.employeeNo,
// 								'firstName':emp.firstName,
// 								'lastName':emp.lastName,
// 								'shift':emp.shift,
// 								'department':emp.department,
// 								'_id':emp._id,
// 								'status':status
// 							})
// 						});
// 					}
// 				}); 
// 				//$scope.employeeList =  data.EmployeeData;
// 				$scope.page = data.page;
// 				/*alert(data.page);*/
// 				$scope.pages = data.pages;
// 				var ranges = [];
// 				$scope.currentPage = 1;
// 				$('#'+$scope.currentPage).addClass('active'); 
// 				for(var i=1;i<=data.pages;i++)
// 				{
// 						if(i<10)
// 						{
// 								ranges.push(i);
// 						}
// 				}
// 				$scope.range = ranges;
// 				$scope.getPage = function (pageNo) {
// 						$scope.currentPage = pageNo;
// 				}
// 				$scope.getPageNext = function (pagevalue) {
// 						if(pagevalue<data.pages)
// 						{
// 								$scope.currentPage = pagevalue+1;
// 						}
// 				};
// 				$scope.getPagePrevious = function (pagevalue) {
// 						if(pagevalue>1)
// 						{
// 								$scope.currentPage = pagevalue-1;
// 						}
// 				};
// 			}      
// 		});  
// 		}else{
// 			$http.get('/employeeHomeData').success(function(data) { 
// 			if(data){ 
// 				$scope.employeeList = []; 
// 				$http.get('/currentCheckin').success(function(attendancedata) { 
// 					if(attendancedata){   
// 					var checkins = [];   
// 						attendancedata.forEach(function(employeeAttendance){          
// 								var employeeNo = employeeAttendance.employeeNo;
// 								//alert(employeeNo);
// 								//alert(employeeNo );
// 								if(employeeAttendance.checkin){
// 									 employeeAttendance.checkin.sort(orderByNameAscending);
// 									 var n = 1;  
// 									employeeAttendance.checkin.forEach(function(checkin){ 
// 											if(n==(employeeAttendance.checkin.length)){
// 													var checkType = checkin.checkType;
// 													//alert(checkType);
// 													var status = '';
// 													if(checkType == 1 || checkType == 2 || checkType == 'i' || checkType == 'I' ){  
// 															status = 'In';
// 													}else{
// 														if(checkType == 3){
// 															status = 'Break';
// 														}else{
// 															status = 'Out';
// 														}
// 													}
// 													checkins.push({
// 															'employeeNo':employeeNo,
// 															'status':status
// 													})
// 											}
// 											n++;     
// 									}); 
// 								}   
// 						});
// 						//console.log(checkins +'checkinscheckinscheckins');
// 						data.EmployeeData.sort(orderByempNo);
// 						checkins.sort(orderByempNo);
// 						//console.log(checkins);
// 						//alert(checkins.length);
// 						data.EmployeeData.forEach(function(emp){
// 							var status = '';
// 							for(var i=0; i<checkins.length; i++){
// 								if(checkins[i].employeeNo == emp.employeeNo){
// 									status = checkins[i].status;
// 								}                
// 							}
// 							$scope.employeeList.push({
// 								'employeeNo':emp.employeeNo,
// 								'firstName':emp.firstName,
// 								'lastName':emp.lastName,
// 								'shift':emp.shift,
// 								'department':emp.department,
// 								'_id':emp._id,
// 								'status':status
// 							})
// 						});
// 					}
// 				}); 
// 				//$scope.employeeList =  data.EmployeeData;
// 				$scope.page = data.page;
// 				/*alert(data.page);*/
// 				$scope.pages = data.pages;
// 				var ranges = [];
// 				$scope.currentPage = 1;
// 				$('#'+$scope.currentPage).addClass('active'); 
// 				for(var i=1;i<=data.pages;i++)
// 				{
// 						if(i<10)
// 						{
// 								ranges.push(i);
// 						}
// 				}
// 				$scope.range = ranges;
// 				$scope.getPage = function (pageNo) {
// 						$scope.currentPage = pageNo;
// 				}
// 				$scope.getPageNext = function (pagevalue) {
// 						if(pagevalue<data.pages)
// 						{
// 								$scope.currentPage = pagevalue+1;
// 						}
// 				};
// 				$scope.getPagePrevious = function (pagevalue) {
// 						if(pagevalue>1)
// 						{
// 								$scope.currentPage = pagevalue-1;
// 						}
// 				};
// 			}      
// 		});  
// 		}
// 	}   
// 	$scope.sortByempNo = function(){
// 		$scope.employeeList.sort(orderByempNo);
// 	}
// 	$scope.sortByName = function(){
// 		$scope.employeeList.sort(orderByName);
// 	}
// 	$scope.sortByLastName = function(){
// 		$scope.employeeList.sort(orderByLastName);
// 	}
// 	$scope.sortByShiftPattern = function(){
// 		$scope.employeeList.sort(orderByShiftPattern);
// 	}
// 	$scope.sortByDepartment = function(){
// 		$scope.employeeList.sort(orderByDepartment);
// 	}
// 	$scope.sortByStatus = function(){
// 		$scope.employeeList.sort(orderByStatus);
// 	}
// }); 
// timecloud.controller('settingsController',function ($route,$scope,$modal,$http,$location,holidayservice,myService) { //setting controller
// 	var error = {};
// 	// $scope.message=error;
// 	$scope.departments=[];
// 	$http.get('/settings').success(function(data) {
// 		$scope.versions = data.versions;
// 		$scope.settingForm = data; 
// 		$scope.settingForm.pwd="";
// 		$scope.dash = data.isdashboard;
// 		$scope.showSubDept = data.isSubDepartmentEnable;
// 		if(data.isSubDepartmentEnable) {
// 			$http.get('/getSubDepartmentList').success(function(data) { 
// 				if(data){
// 					$scope.settingForm.subDepartmentList = data;
// 				}
// 			});
// 		}
// 		if(data.isallowances == true){  
// 			$scope.allowanceValue = 1;
// 		}  
// 		if(data.isdepartments == true){  
// 			$scope.departmentValue = 1;
// 		}
// 		if(data.payPeriodStartDate && data.payPeriod == '2weeks') {
// 			$scope.ruleStart = true;
// 		}
// 		if(data.clockNotctive == true){
// 			$scope.clockNotctive = true
// 		}
// 		if(data.isovertime == true){  
// 			$scope.overtimeValue = 1;
// 			 if(data.overtimePeriod == '' && data.overtimeLevel == ''){
// 				$scope.settingForm.overtimePeriod = 'daily'; 
// 				$scope.settingForm.overtimeLevel = 1; 
// 			}
// 		}  
// 		if(data.shiftCutoff == true){
// 			$scope.shiftCutoffValue  = 1;
// 			var nameSc = "sc"+data.shiftCutoffPeriod;
// 			$('#scweekly').removeClass('btn btn-primary active').addClass('btn btn-primary'); 
// 			$('#'+nameSc).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 		}
// 		if(data.ispayroll == true){  
// 			$scope.payrollValue = 1;
// 		} 
// 		if(data.email){
// 			$scope.settingForm.repeatEmail = data.email;
// 		}      
// 		$scope.settingForm.passcodes = data.passcode;
// 		if(data.overtimePeriod){ 
// 			if(data.overtimePeriod != 'daily'){          
// 				$('#daily').removeClass('btn btn-primary active').addClass('btn btn-primary');      
// 				$('#weeklyOver').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 			}        
// 		} 
// 		if(data.overtimeLevel){ 
// 			if(data.overtimeLevel != 1){
// 				$('#1').removeClass('btn btn-primary active').addClass('btn btn-primary');             
// 				$('#'+data.overtimeLevel).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 			}
// 		}
// 		if(data.WeekdayStart){ 
// 			if(data.WeekdayStart != 'mon')  {
// 				$('#mon').removeClass('btn btn-primary active').addClass('btn btn-primary');              
// 				$('#'+data.WeekdayStart).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 			}        
// 		}else{
// 			$scope.settingForm.WeekdayStart = 'mon'
// 		}
// 		if(data.payrollSystem){         
// 			$('#'+data.payrollSystem).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 		}  
// 		if(data.payPeriod){                 
// 			var name = data.payPeriod+'P';
// 			$('#weeklyP').removeClass('btn btn-primary active').addClass('btn btn-primary'); 
// 			$('#'+name).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 		} else{
// 			$scope.settingForm.payPeriod = 'weekly'
// 		}
// 		if(data.tooltipDelayTime == "400"){                 
// 			var name = 'fastP';
// 			$('#fastP').removeClass('btn btn-primary active').addClass('btn btn-primary'); 
// 			$('#'+name).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 		} 
// 		else if(data.tooltipDelayTime == "900"){                 
// 			var name = 'mediumP';
// 			$('#fastP').removeClass('btn btn-primary active').addClass('btn btn-primary'); 
// 			$('#'+name).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 		} 
// 		else if(data.tooltipDelayTime == "2000"){                 
// 			var name = 'slowP';
// 			$('#fastP').removeClass('btn btn-primary active').addClass('btn btn-primary'); 
// 			$('#'+name).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 		} 
// 		else {
// 			$scope.settingForm.tooltipDelayTime = '400';
// 		}
// 		if(data.phone){
// 			$scope.hiddenValue = 1;    
// 		}
// 	});
// 	$scope.submitform = function(){
// 		// alert("aaaa");
// 		if($scope.settingForm.email){ 
// 			if($scope.settingForm.companyname) {
// 				if($scope.settingForm.country) {           
// 					if($scope.settingForm.phone) {
// 						if($scope.settingForm.firstname) {
// 							if($scope.settingForm.pwd && $scope.settingForm.repeatPassword) {
// 								if($scope.settingForm.pwd != $scope.settingForm.repeatPassword){                      
// 									$scope.settingForm.password =null;
// 									error.password = "Password does not match";       
// 									$scope.message = error;
// 									$(window).scrollTop(0);
// 								} else {
// 									error.password = null;
// 									$scope.message = error;
// 									$scope.settingForm.password = $scope.settingForm.pwd;
// 								}
// 							}
// 							if($scope.settingForm.email != $scope.settingForm.repeatEmail) {
// 								$scope.settingForm.email =null;
// 								error.email = "email does not match";       
// 								$scope.message = error;
// 								$(window).scrollTop(0);
// 							} else {
// 								error.email = null;
// 								$scope.message = error;
// 							}
// 							if($scope.settingForm.payPeriod == '2weeks' && $scope.settingForm.payPeriodStartDate == null ) {
// 								$scope.settingForm.payPeriod=null;
// 								error.period = "Please select First Date of Rule";       
// 								$scope.message = error;                  
// 							}
// 							if($scope.settingForm.email && $scope.settingForm.password && $scope.settingForm.payPeriod) {
// 								$http.post('/settings',$scope.settingForm).success(function(data){
// 									// alert(data);
// 									if(data == "true") {
// 										if($scope.dash == false && $scope.settingForm.isdashboard == true) {
// 											$http.get('/createPeriods');
// 										}
// 										myService.setSettingsValue(1);
// 										error.success = "Settings Successfully Updated";       
// 										$scope.message = error;                       
// 										holidayservice.assignHoliday($scope.settingForm.isHolidays);
// 										holidayservice.assignRoster($scope.settingForm.isRoster);
// 										holidayservice.assignProject($scope.settingForm.isProject);
// 										holidayservice.assignDashboard($scope.settingForm.isdashboard);
// 										holidayservice.setTooltip($scope.settingForm.tooltipDelayTime);
// 										$location.path('/home');
// 										$(window).scrollTop(0);
// 									}
// 								});
// 							}												
// 						} else {
// 							error.firstname = "Please enter First Name";       
// 							$scope.message = error;
// 							$(window).scrollTop(0);
// 						}
// 					 } else {
// 						error.phone = "Please enter Phone No";       
// 						$scope.message = error;
// 						$(window).scrollTop(0);
// 					}
// 				} else {
// 					error.country = "Please enter Country";       
// 					$scope.message = error;
// 					$(window).scrollTop(0);
// 				}
// 			} else {
// 				error.company = "Please enter Company Name";       
// 				$scope.message = error;
// 				$(window).scrollTop(0);
// 			}
// 		}else{
// 			error.setting = "Please enter email";       
// 			$scope.message = error;
// 			$(window).scrollTop(0);
// 		}
// 	}
// 	$scope.createdepartment = function(){ 
// 		var error = {};
// 		$scope.message=error;    
// 		if($scope.settingForm.isdepartments){
// 			if($scope.settingForm.departmentname){
// 				$http.post('/department',$scope.settingForm).success(function(data){
// 					if(data == "true"){ 
// 						$http.get("/getPayperiod").success(function(dataPeriod) {
// 							if(dataPeriod){ 
// 								var dataDsh = {
// 									start:dataPeriod.start,
// 									end:dataPeriod.end,
// 									department:$scope.settingForm.departmentname,
// 								}
// 								$http.post('/adddashboarddepartment',dataDsh).success(function(createDashData){
// 									if(createDashData) {
// 										error.added = "Department Successfully added";       
// 										$scope.message = error;  
// 										$http.get('/companydata').success(function(data) { 
// 											if(data){
// 												if(data.departments && data.isdepartments){
// 													$scope.settingForm.departments = data.departments;
// 													$scope.settingForm.departmentname ='' 
// 												}  
// 											}
// 									 });
// 									}
// 								})
// 							}
// 						});
// 					}                         
// 				});
// 			}else{
// 				error.department = "Department required";       
// 				$scope.message = error;
// 			}
// 		}else{
// 			error.departmentOption = "You are not using departments";       
// 			$scope.message = error;
// 		}
// 	};
// 	$scope.createSubDepartment= function() {
// 		var error = {};
// 		$scope.message=error;
// 		if($scope.settingForm.mainDeparment){
// 			if($scope.settingForm.subDeptName) {
// 				$http.get("/getPayperiod").success(function(dataPeriod) {
// 					if(dataPeriod){ 
// 						var dataDsh = {
// 							start:dataPeriod.start,
// 							end:dataPeriod.end,
// 							departmentList:$scope.settingForm.departments,
// 							parentDept:$scope.settingForm.mainDeparment,
// 							subDept:$scope.settingForm.subDeptName,
// 						}
// 						$http.post('/saveSubDepartment',dataDsh).success(function(data){
// 							if(data == "true"){
// 								error.successDeparment = "Sub-Department Added...";       
// 								$scope.message = error;
// 								setTimeout(function(){
// 									var error = {};
// 									$scope.message = error;
// 								},1000);
// 								$http.get('/getSubDepartmentList').success(function(data) { 
// 									if(data){
// 										$scope.settingForm.subDepartmentList = data;
// 										$scope.settingForm.subDeptName ='';
// 									}
// 								});
// 							}
// 						});
// 					}
// 				});
// 			} else {
// 				error.mainDeparment = "Enter Department Name";       
// 				$scope.message = error;
// 			}      
// 		} else {
// 			error.mainDeparment = "Select Parent Department Name";       
// 			$scope.message = error;
// 		}
// 	}
// 	$scope.openModel = function () {   
// 			var modalInstance = $modal.open({
// 				templateUrl: 'department.html',
// 				backdrop: 'static',
// 				controller: ModalInstanceCtrl1       
// 			});
// 			modalInstance.result.then(function (resultValue) {
// 				if(resultValue == 1){
// 					error.added = "Department Successfully deleted";
// 					$scope.message = error;
// 					$http.get('/companydata').success(function(data) {
// 						if(data) {
// 							if(data.departments && data.isdepartments){
// 								$scope.settingForm.departments = data.departments;
// 								$scope.settingForm.departmentname ='';
// 							}
// 							if(data.isSubDepartmentEnable) {
// 								$http.get('/getSubDepartmentList').success(function(subDept) { 
// 									if(subDept){
// 										$scope.settingForm.subDepartmentList = subDept;
// 										$scope.settingForm.subDeptName ='';
// 									}
// 								});
// 							}
// 						}
// 					});
// 				}
// 			}, function () {
// 				// $log.info('Modal dismissed at: ' + new Date());
// 			}); 
// 	}
// 	var ModalInstanceCtrl1 = function ($scope, $modalInstance, myService) { 
// 		$scope.Departmentdata = myService.getDepartment();
// 		$scope.ok = function (value) {  
// 			var error = {};   
// 			if(value) {
// 				$scope.Departmentdata.dateStart = value;   
// 				$http.post('/deleteDepartment',$scope.Departmentdata).success(function(data){
// 						if(data == "true"){     
// 							$modalInstance.close(1);
// 						}                         
// 				});          
// 			}else{
// 				error.date = "Please select Date";       
// 				$scope.message = error;
// 				return $scope.message;
// 			}     
// 		};
// 		$scope.cancel = function () {
// 			$modalInstance.dismiss('cancel');
// 			$scope.modelflag = 0;
// 		};
// 	};
// 	$scope.openModel1 = function () {   
// 			var modalInstance = $modal.open({
// 				templateUrl: 'department.html',
// 				backdrop: 'static',
// 				controller: ModalInstanceCtrl       
// 			});
// 			modalInstance.result.then(function (resultValue) {
// 				if(resultValue == 1){
// 					error.successDeparment = "Sub-Department Successfully deleted";
// 					$scope.message = error;
// 					$http.get('/getSubDepartmentList').success(function(data) { 
// 						if(data){
// 							$scope.settingForm.subDepartmentList = data;
// 							$scope.settingForm.subDeptName ='';
// 						}
// 					});
// 				}
// 			}, function () {
// 			}); 
// 	}
// 	var ModalInstanceCtrl = function($scope, $modalInstance, myService) { 
// 			$scope.Departmentdata = myService.getDepartment();
// 			$scope.ok = function (value) {  
// 				var error = {};   
// 				if(value) {
// 					$scope.Departmentdata.dateStart = value;   
// 					$http.post('/deleteSubDepartment',$scope.Departmentdata).success(function(data){
// 							if(data == "true"){     
// 								$modalInstance.close(1);
// 							}                         
// 					});          
// 				}else{
// 					error.date = "Please select Date";       
// 					$scope.message = error;
// 					return $scope.message;
// 				}     
// 			};
// 			$scope.cancel = function () {
// 				$modalInstance.dismiss('cancel');
// 				$scope.modelflag = 0;
// 			};
// 	};
// 	$scope.deleteDepartment = function(departmentName,departmentId){
// 		var error = {};
// 		$scope.message=error;
// 		$scope.Departmentdata = {
// 			departmentName:departmentName,
// 			departmentId:departmentId
// 		}     
// 		myService.setDepartment($scope.Departmentdata);
// 		$scope.openModel();
// 	}
// 	$scope.deleteSubDepartment = function(deptName,deptId){
// 		var error = {};
// 		$scope.message=error;
// 		$http.get("/getPayperiod").success(function(dataPeriod) {
// 			if(dataPeriod){ 
// 				$scope.Departmentdata = {
// 					start:dataPeriod.start,
// 					end:dataPeriod.end,
// 					departmentName:deptName,
// 					departmentId:deptId
// 				}   
// 				myService.setDepartment($scope.Departmentdata);
// 				$scope.openModel1();
// 			}
// 		});  
// 	}
// 	$scope.allowanceToggle = function(){
// 		$scope.allowanceValue = '';
// 		if($scope.settingForm.isallowances == true){     
// 			$scope.allowanceValue = 1
// 			return $scope.allowanceValue;
// 		}else{
// 			$scope.allowanceValue = 0
// 			return $scope.allowanceValue;
// 		}
// 	}
// 	$scope.shiftCutoffToggle = function(){
// 		$scope.shiftCutoffValue = '';
// 		if($scope.settingForm.shiftCutoff == true){     
// 			$scope.shiftCutoffValue = 1
// 			return $scope.shiftCutoffValue;
// 		}else{
// 			$scope.shiftCutoffValue = 0
// 			return $scope.shiftCutoffValue;
// 		}
// 	}
// 	$scope.departmentToggle = function(){
// 		$scope.departmentValue = '';
// 		if($scope.settingForm.isdepartments == true){     
// 			$scope.departmentValue = 1
// 			return $scope.departmentValue;
// 		}else{
// 			$scope.departmentValue = 0
// 			return $scope.departmentValue;
// 		}
// 	} 
// 	$scope.overtimeToggle = function(){
// 		$scope.overtimeValue = '';
// 		if($scope.settingForm.isovertime == true){     
// 			$scope.overtimeValue = 1
// 			$scope.settingForm.overtimePeriod = 'daily'; 
// 			$scope.settingForm.overtimeLevel = 1;       
// 			return $scope.overtimeValue;      
// 		}else{
// 			$scope.overtimeValue = 0
// 			return $scope.overtimeValue;
// 		}
// 	}
// 	$scope.payrollToggle = function(){
// 		$scope.payrollValue = '';
// 		if($scope.settingForm.ispayroll == true){     
// 			$scope.payrollValue = 1
// 			return $scope.payrollValue;
// 		}else{
// 			$scope.payrollValue = 0
// 			return $scope.payrollValue;
// 		}
// 	}
// 	$scope.createpasscode = function(){
// 		if($scope.settingForm.passcodeno){
// 			$http.post('/passcode',$scope.settingForm).success(function(data){
// 				if(data == "true"){                
// 					error.passcodeadded = "Passcode Successfully added";       
// 					$scope.message = error;
// 					$http.get('/companydata').success(function(data) { 
// 							if(data){
// 								if(data.allowances){
// 									$scope.settingForm.passcodes = data.passcode;
// 									$scope.settingForm.passcodeno =''
// 									return $scope.settingForm.passcodes;
// 								}  
// 							}
// 					});
// 				}                         
// 			});
// 		}else{
// 			error.passcode = "Passcode required";       
// 			$scope.message = error;
// 		}
// 	}
// 	$scope.createallowance = function(){
// 		if($scope.settingForm.isallowances){
// 			if($scope.settingForm.allowancename){
// 				$http.post('/allowance',$scope.settingForm).success(function(data){
// 						if(data == "true"){                
// 							error.allowanceadded = "Allowance Successfully added";       
// 							$scope.message = error;
// 							$http.get('/companydata').success(function(data) { 
// 									if(data){
// 										if(data.allowances){
// 											$scope.settingForm.allowances = data.allowances;
// 											$scope.settingForm.allowancename =''
// 											return $scope.settingForm.allowances;
// 										}  
// 									}
// 							});
// 						}                         
// 				});
// 			}else{
// 				error.allowance = "Allowance required";       
// 				$scope.message = error;
// 			}
// 		}else{
// 			error.allowanceOption = "You are not using Allowances";       
// 						$scope.message = error;
// 		}
// 	},
//  $scope.overtime = function(value) {   
// 		$scope.settingForm.overtimePeriod = value
//  }
//  $scope.overtimeLevel = function(value) {   
// 		$scope.settingForm.overtimeLevel = value
//  }
//  $scope.WeekdayStart = function(value) {   
// 		$scope.settingForm.WeekdayStart = value
//  }
//  $scope.payrollSystem = function(value) {    
// 		if($scope.settingForm.ispayroll){  
// 				$scope.settingForm.payrollSystem = value;  
// 		}else{ 
// 			error.payroll = "You are not using payroll export";       
// 			$scope.message = error;    
// 		}  
//  }
//  $scope.payPeriod = function(value) { 
// 	if(value == '2weeks'){
// 		$scope.ruleStart = true;
// 	}else{
// 		$scope.ruleStart = false;
// 	}
// 	$scope.settingForm.payPeriod = value     
//  } 
//  $scope.shiftCutoff = function(value){  
// 	$scope.settingForm.shiftCutoffPeriod = value 
//  }
//  $scope.tooltipTime = function(value) {
// 	$scope.settingForm.tooltipDelayTime = value     
//  }  
// });
// timecloud.controller('ruleController',function ($scope,$http,$location) { //rule controller
// 	var error = {};  
// 	$scope.formatTime = function(id) { 
// 			var val =  $('#'+id).val();
// 			val = val.replace(/[^0-9]/g,'');
// 			if(val.length >= 2)
// 					val = val.substring(0,2) + ':' + val.substring(2); 
// 			if(val.length >= 5)
// 					val = val.substring(0,5); 
// 		 $('#'+id).val(val);
// 	}; 
// 	$http.get('/globalrules').success(function(data) {       
// 				$scope.globalfm = data; 
// 				if(data.country){
// 						var date = moment.utc().tz(data.country).format('llll');
// 						var d = moment(date).set('minute', 00).format('llll');
// 						var ordinarytimeDate = moment({hour: 00, minute: 00,second: 00}).format();
// 						var Overtime = moment({hour: 00, minute: 00,second: 00}).format();
// 						$scope.weeklyNT =  ordinarytimeDate;
// 						$scope.weeklyOT1 = Overtime;
// 						$scope.hstep = 1;
// 						$scope.mstep = 15;
// 						$scope.options = {
// 							hstep: [1, 2, 3],
// 							mstep: [1, 5, 10, 15, 25, 30]
// 						};
// 						$scope.ismeridian = false;
// 			}
// 				if(data.weeklyNT){
// 						var weeklyNT = data.weeklyNT.split(':');             
// 						$scope.weeklyNT = weeklyNT[0] +':'+weeklyNT[1]; 
// 				}else{          
// 					$scope.weeklyNT = parseInt('80'); 
// 				}
// 				if(data.weeklyOT1){
// 					var weeklyOT1 = data.weeklyOT1.split(':');             
// 					$scope.weeklyOT1 = weeklyOT1[0]+':'+weeklyOT1[1] ; 
// 				}else{
// 					$scope.weeklyOT1 = '80';
// 				}
// 				if(data.isrounding== true){
// 					$scope.descriptionValue = 1;
// 				}else{
// 					$scope.descriptionValue = 0;
// 				}
// 				if(data.rounding){ 
// 					if(data.rounding == 'in/out'){
// 						$scope.valueIn = 1;
// 						$('#inout').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 					} else{
// 						$scope.valueR = 1;
// 						$('#'+data.rounding).removeClass('btn btn-primary').addClass('btn btn-primary active');
// 					}            
// 				}else{
// 					$scope.valueIn = 1;
// 					$('#inout').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 					$('#15In').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 					$scope.globalfm.inroundupafter = 7;
// 					$('#15out').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 					$scope.globalfm.outroundupafter = 7;
// 					$('#15total').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 					$scope.globalfm.roundUpAfter = 7;
// 					$scope.globalfm.inRounding = 15;
// 					$scope.globalfm.outRounding = 15;
// 				}
// 				if(data.inRounding){  
// 					$('#'+data.inRounding+'In').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 				}
// 				if(data.outRounding){        
// 					$('#'+data.outRounding+'out').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 				}
// 				if(data.closestMin){  
// 					$('#'+data.closestMin+'total').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 				}
// 				if(data.tooltipDelayTime){
// 					$scope.delayTime = data.tooltipDelayTime;
// 				}
// 				if(data.isovertime){   
// 					if(data.overtimePeriod == "weekly") {
// 						if(data.overtimeLevel == 1){
// 							$scope.overtime1 = 1;
// 						}else{
// 							$scope.overtime2 = 1;
// 						}
// 					} 
// 				}
// 	});
// 	$scope.description = function(){   
// 		if($scope.globalfm.isrounding == true){
// 			 $scope.globalfm.rounding = 'in/out'; 
// 			return $scope.descriptionValue = 1;
// 		}else{
// 			 //$scope.globalfm.rounding = 'totalH'; 
// 			return $scope.descriptionValue = 0;
// 		}
// 	}
// 	$scope.submitform = function(){ 
// 	if($scope.weeklyNT){
// 	 $scope.globalfm.weeklyNT  = $scope.weeklyNT+':00';  
// 	}
// 	if($scope.weeklyOT1){
// 	 $scope.globalfm.weeklyOT1  = $scope.weeklyOT1+':00';  
// 	}  
// 	if($scope.globalfm.rounding =="totalH"){
// 		if($scope.globalfm.closestMin){
// 				if(parseInt($scope.globalfm.roundUpAfter) > parseInt($scope.globalfm.closestMin)){
// 					 error.globalErr = "Please Make Round Up After Minute smaller than closest Minute ";       
// 					$scope.message = error;
// 				}else{
// 						$http.post('/globalrounding',$scope.globalfm).success(function(data){
// 							if(data == "true"){                       
// 								error.rule = "Global Rule Successfully added";       
// 								$scope.message = error;
// 								$location.path('/shiftpattern');  
// 								$(window).scrollTop(0);
// 							}                                     
// 				 });
// 				}
// 			}else{
// 				error.globalErr = "Please select closest Min";       
// 				$scope.message = error;
// 			}
// 	}else{
// 		if($scope.globalfm.inRounding && $scope.globalfm.outRounding){
// 				if(parseInt($scope.globalfm.inroundupafter) > parseInt($scope.globalfm.inRounding) || parseInt($scope.globalfm.outroundupafter) > parseInt($scope.globalfm.outRounding)){
// 					 error.globalErr = "Please Make Round Up After Minute smaller than closest Minute ";       
// 					$scope.message = error;
// 				}else{
// 					$http.post('/globalrounding',$scope.globalfm).success(function(data){
// 						if(data == "true"){                       
// 							error.rule = "Global Rule Successfully added";       
// 							$scope.message = error;
// 							$location.path('/shiftpattern');  
// 							$(window).scrollTop(0);
// 						}                                     
// 					});
// 				}        
// 		}else{
// 			error.globalErr = "Please select closest Min";   
// 			$scope.message = error;
// 		} 
// 	}
// 	}
// 	$scope.rounding = function(value){  
// 		 $scope.globalfm.rounding = value;   
// 		 $scope.valueIn ='';
// 		 $scope.valueR = '';
// 		 if(value == "in/out"){
// 				$scope.valueIn = 1;
// 				return $scope.valueIn
// 		 }else{
// 			 $scope.valueR = 1
// 			return $scope.valueR 
// 		 }     
// 	}
// 	$scope.inRoundingfn = function(value){
// 		$scope.globalfm.inRounding = value;
// 		if(value=='5'){
// 			$scope.globalfm.inroundupafter = '3';
// 		}else if(value=='15'){
// 			$scope.globalfm.inroundupafter = '7';
// 		}else{
// 			$scope.globalfm.inroundupafter = '15';
// 		}    
// 		return $scope.globalfm.inroundupafter  ;
// 	}
// 	$scope.outRoundingfn = function(value){   
// 		$scope.globalfm.outRounding = value; 
// 		if(value=='5'){
// 			$scope.globalfm.outroundupafter = '3';
// 		}else if(value=='15'){
// 			$scope.globalfm.outroundupafter = '7';
// 		}else{
// 			$scope.globalfm.outroundupafter = '15';
// 		}    
// 		return $scope.globalfm.outroundupafter  ;   
// 	}
// 	$scope.totalTime = function(value){   
// 		$scope.globalfm.closestMin = value;
// 		if(value=='5'){
// 			$scope.globalfm.roundUpAfter = '3';
// 		}else if(value=='15'){
// 			$scope.globalfm.roundUpAfter = '7';
// 		}else{
// 			$scope.globalfm.roundUpAfter = '15';
// 		}    
// 		return $scope.globalfm.roundUpAfter  ;      
// 	}   
// });
// function toSeconds(t) {
// 		var bits = t.split(':');
// 		return bits[0]*3600 + bits[1]*60 + bits[2]*1;
// }
// timecloud.controller('shiftController',function ($scope,$http,$location,$timeout) { //shift controller
// 	var error = {};	
// 	$scope.tagsList=[];
// 	$scope.timezonesLists = [];
// 	$scope.timezonesLists.push({id:1,name:"",startTime:"",finishTime:"",payPeriod:""});
// 	$http.get('/companydata').success(function(data) { 
// 		if(data){ 
// 			if(data.country){
// 				var date = moment.utc().tz(data.country).format('llll');
// 				var d = moment(date).set('minute', 00).format('llll');
// 				var ordinarytimeDate = moment({hour: 00, minute: 00,second: 00}).format();
// 				var Overtime = moment({hour: 00, minute: 00,second: 00}).format();
// 				$scope.startTime =  moment(d).format('HH:mm');
// 				$scope.finishTime = moment(d).format('HH:mm');
// 				$scope.hstep = 1;
// 				$scope.mstep = 15;
// 				$scope.options = {
// 					hstep: [1, 2, 3],
// 					mstep: [1, 5, 10, 15, 25, 30]
// 				};
// 				$scope.ismeridian = false;
// 			}
// 			if(data.isovertime){ 
// 			 if(data.overtimePeriod == "daily") { 
// 					if(data.overtimeLevel == 1){
// 						$scope.overtime1 = 1;
// 					}else{
// 						$scope.overtime2 = 1;
// 					}
// 				}else{
// 					$scope.overtime1 = 0;
// 					$scope.overtime2 = 0;
// 				}
// 			}
// 			if(data.isallowances == true){
// 				if(data.allowances){
// 					$scope.allowanceList = data.allowances;
// 				}  
// 			}  
// 			if(data.tooltipDelayTime){
// 				$scope.delayTime = data.tooltipDelayTime;
// 			}
// 			if(data.isdepartments) {
// 				$scope.departments = data.departments;	
// 			}
// 			if(data.isDepartmentTagsInShift) {
// 				$scope.showShiftTags = true;
// 			}
// 			if(data.isTimeZoneForShift) {
// 				$scope.showShiftTimezone = true;
// 			}
// 			if(data.isSecondBreakInShift) {
// 				$scope.showsecondBreak = true;
// 			}
// 			$scope.zoneTagList = data.zoneTags;
// 		} 
// 		$scope.shift = '';
// 	});
// 	$http.get('/shiftData').success(function(data){       
// 		if(data){            
// 			$scope.shiftList = data;
// 		}                                     
// 	});
// 	$scope.submitform = function() {		
// 		var cnt = 0;
// 		var newTimeZoneList = [];
// 		$scope.timezonesLists.forEach(function(detail){
// 			var tName      = document.getElementById("timezone"+detail.id).value;
// 			var tStartTimet= document.getElementById("tStartTime"+detail.id).value;
// 			var tFinishTime= document.getElementById("tFinishTime"+detail.id).value;
// 			var payPeriod  = document.getElementById("payPeriod"+detail.id).value;
// 			var zoneName  = document.getElementById("zoneName"+detail.id).value;
// 			if(zoneName!="" || tName!="" || tStartTimet!="" || tFinishTime!="" || payPeriod!="") {
// 				if(tName!="") {
// 					$("#timezone"+detail.id).css("border-color","#d5d5d5");
// 					$("#timezone"+detail.id).css("background-color","#fff");
// 					$("#timezone"+detail.id).css("color","#858585");
// 				} else {
// 					$("#timezone"+detail.id).css("border-color","#eed3d7");
// 					$("#timezone"+detail.id).css("background-color","#f2dede");
// 					$("#timezone"+detail.id).css("color","#b94a48");
// 				}
// 				if(tStartTimet!="") {
// 					$("#tStartTime"+detail.id).css("border-color","#d5d5d5");
// 					$("#tStartTime"+detail.id).css("background-color","#fff");
// 					$("#tStartTime"+detail.id).css("color","#858585");
// 				} else {
// 					$("#tStartTime"+detail.id).css("border-color","#eed3d7");
// 					$("#tStartTime"+detail.id).css("background-color","#f2dede");
// 					$("#tStartTime"+detail.id).css("color","#b94a48");
// 				}
// 				if(tFinishTime!="") {
// 					$("#tFinishTime"+detail.id).css("border-color","#d5d5d5");
// 					$("#tFinishTime"+detail.id).css("background-color","#fff");
// 					$("#tFinishTime"+detail.id).css("color","#858585");
// 				} else {
// 					$("#tFinishTime"+detail.id).css("border-color","#eed3d7");
// 					$("#tFinishTime"+detail.id).css("background-color","#f2dede");
// 					$("#tFinishTime"+detail.id).css("color","#b94a48");
// 				}
// 				if(payPeriod!="") {
// 					$("#payPeriod"+detail.id).css("border-color","#d5d5d5");
// 					$("#payPeriod"+detail.id).css("background-color","#fff");
// 					$("#payPeriod"+detail.id).css("color","#858585");
// 				} else {
// 					$("#payPeriod"+detail.id).css("border-color","#eed3d7");
// 					$("#payPeriod"+detail.id).css("background-color","#f2dede");
// 					$("#payPeriod"+detail.id).css("color","#b94a48");
// 				}
// 				if(zoneName!="") {
// 					$("#zoneName"+detail.id).css("border-color","#d5d5d5");
// 					$("#zoneName"+detail.id).css("background-color","#fff");
// 					$("#zoneName"+detail.id).css("color","#858585");
// 				} else {
// 					$("#zoneName"+detail.id).css("border-color","#eed3d7");
// 					$("#zoneName"+detail.id).css("background-color","#f2dede");
// 					$("#zoneName"+detail.id).css("color","#b94a48");
// 				}
// 				if(detail.zoneName && detail.payPeriod && detail.finishTime && detail.name && detail.startTime) {
// 					cnt++;
// 					newTimeZoneList.push({zoneName:detail.zoneName,name: detail.name,startTime:detail.startTime,finishTime:detail.finishTime,payPeriod:detail.payPeriod});
// 				}
// 			} else {
// 				cnt++;
// 			}
// 			if(cnt==$scope.timezonesLists.length) {
// 				$http.get('/companydata').success(function(data) { 
// 					if(data){ 
// 						if(data.country){
// 							if($scope.breakTime){
// 								$scope.shift.breakTime = $scope.breakTime+':'+00;
// 							}else{
// 								$scope.shift.breakTime = "00:00:00";
// 							}
// 							if($scope.breakAfter){            
// 									$scope.shift.breakAfter = $scope.breakAfter+':'+00;                   
// 							}
// 							if($scope.breakTime2){
// 								$scope.shift.breakTime2 = $scope.breakTime2+':'+00;
// 							}else{
// 								$scope.shift.breakTime1 = "00:00:00";
// 							}
// 							if($scope.breakAfter2){
// 								$scope.shift.breakAfter2 = $scope.breakAfter2+':'+00;
// 							} else {
// 								$scope.shift.breakAfter2 = "00:00:00";
// 							}
// 							if($scope.ordinarytime){
// 								$scope.shift.ordinarytime = $scope.ordinarytime+':'+00;
// 							}
// 							if($scope.overTime1){
// 								$scope.shift.overTime1 = $scope.overTime1+':'+00;
// 							}
// 							var dateF = moment({hour: 00, minute: 00,second: 00}).format('YYYY-MM-DD HH:mm:ss');
// 							var startscopeTime = $scope.startTime.split(':');
// 							var sHour = startscopeTime[0];
// 							var sMinute = startscopeTime[1];
// 							var date = moment().format('YYYY-MM-DD');  
// 							var startSeconds = toSeconds($scope.startTime+':00');
// 							var finishscopeTime = $scope.finishTime.split(':');
// 							var fHour = finishscopeTime[0];
// 							var fMinute = finishscopeTime[1]      ;
// 							var finishSeconds = toSeconds($scope.finishTime+':00'); 
// 							if(finishSeconds < startSeconds) {
// 								var Hourset = moment.utc(date).set('hours', sHour);
// 								var fdate = moment.utc(date).add('Days',1).format('YYYY-MM-DD');
// 								var fHourset = moment.utc(fdate).set('hours', fHour);               
// 							}else{
// 								var Hourset = moment.utc(date).set('hours', sHour);
// 								var fdate = moment(date).format('YYYY-MM-DD');
// 								var fHourset = moment.utc(fdate).set('hours', fHour);   
// 							}
// 							$scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
// 							$scope.shift.finishTime =  moment(fHourset).set('minute', fMinute).format();							
// 							var allowanceArray = [];							
// 							if($scope.shift.name){
// 								// if($scope.shift.startTime == $scope.shift.finishTime) {
// 									// error.shiftErr = "Shift Start time and finish time cannot be same";
// 									// $scope.message = error; 
// 								// } else { 
// 									$scope.message  = {};
// 									$('input[name="allowanceCheck"]:checked').each(function() {        
// 										var payAfter = $('#'+this.value).val();       
// 										allowanceArray.push(this.value+'/'+payAfter);
// 									});
// 									$scope.shift.allowance = allowanceArray;
// 									$scope.shift.timezoneList = newTimeZoneList;
// 									$scope.shift.tags = $scope.tagsList;
// 									$http.post('/shift',$scope.shift).success(function(data){
// 										if(data == "true"){                       
// 											error.shiftAdded = "Shift Successfully Created";       
// 											$scope.message1 = error;
// 											$scope.message = '';
// 											$location.path('/shiftpattern');
// 										}                                     
// 									});
// 								// }
// 							}else{      
// 								error.shiftErr = "Please enter Shift Name";       
// 								$scope.message = error;  
// 							}
// 						}
// 					}
// 				});		
// 			}
// 		});		
// 	}
// 	$scope.addMoreTimezone = function() {
// 		var len = $scope.timezonesLists.length + 1;
// 		$scope.timezonesLists.push({id:len,timezones:"",timeZoneStartTime:"",timeZoneFinishTime:"",payPeriod:""});
// 	}
// 	$scope.formatTime = function(id) {
// 			var val =  $('#'+id).val();
// 			val = val.replace(/[^0-9]/g,'');
// 			if(val.length >= 2)
// 					val = val.substring(0,2) + ':' + val.substring(2); 
// 			if(val.length >= 5)
// 					val = val.substring(0,5); 
// 			$('#'+id).val(val);
// 	};
// 	$scope.createPattern = function(){  
// 		$http.get('/companydata').success(function(data) { 
// 			if(data){ 
// 				if(data.country){
// 					if($scope.breakTime){
// 						$scope.shift.breakTime = $scope.breakTime+':'+00;
// 					}else{
// 						$scope.shift.breakTime = "00:00:00";
// 					}
// 					if($scope.breakAfter){            
// 							$scope.shift.breakAfter = $scope.breakAfter+':'+00;                   
// 					} 
// 					if($scope.ordinarytime){
// 						$scope.shift.ordinarytime = $scope.ordinarytime+':'+00;
// 					}
// 					if($scope.overTime1){
// 						$scope.shift.overTime1 = $scope.overTime1+':'+00;
// 					}
// 					var startscopeTime = $scope.startTime.split(':');
// 					var sHour = startscopeTime[0];
// 					var sMinute = startscopeTime[1];
// 					var date = moment().format('YYYY-MM-DD');  
// 					var startSeconds = toSeconds($scope.startTime+':00');
// 					var finishscopeTime = $scope.finishTime.split(':');
// 					var fHour = finishscopeTime[0];
// 					var fMinute = finishscopeTime[1]      ;
// 					var finishSeconds = toSeconds($scope.finishTime+':00'); 
// 					if(finishSeconds < startSeconds){
// 						var Hourset = moment.utc(date).set('hours', sHour); 
// 						var fdate = moment.utc(date).add('Days',1).format('YYYY-MM-DD');
// 						var fHourset = moment.utc(fdate).set('hours', fHour);               
// 					}else{
// 						var Hourset = moment.utc(date).set('hours', sHour); 
// 						var fdate = moment(date).format('YYYY-MM-DD');
// 						var fHourset = moment.utc(fdate).set('hours', fHour);   
// 					}
// 					$scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
// 					$scope.shift.finishTime =  moment(fHourset).set('minute', fMinute).format();
// 					var allowanceArray = [];
// 					 if($scope.shift.name){      
// 						$('input[name="allowanceCheck"]:checked').each(function() {        
// 							var payAfter = $('#'+this.value).val();       
// 							allowanceArray.push(this.value+':'+payAfter);
// 						}); 
// 						$scope.shift.allowance = allowanceArray; 
// 						$http.post('/shift',$scope.shift).success(function(data){
// 								if(data == "true"){  
// 									$location.path('/shiftpattern/create');
// 								}                                     
// 						}); 
// 					}else{      
// 						error.shiftErr = "Please enter Shift Name";       
// 						$scope.message = error;  
// 					}
// 				}
// 			}
// 		});
// 	}
// 	$scope.redirectForm = function(){    
// 		$scope.shift.startTime = $scope.startTime;
// 		$scope.shift.finishTime = $scope.finishTime;
// 		 var allowanceArray = [];
// 		 if($scope.shift.name){      
// 			$('input[name="allowanceCheck"]:checked').each(function() {        
// 				var payAfter = $('#'+this.value).val();       
// 				allowanceArray.push(this.value+':'+payAfter);
// 			}); 
// 			$scope.shift.allowance = allowanceArray; 
// 			$http.post('/shift',$scope.shift).success(function(data){
// 					if(data == "true"){                       
// 						error.shiftAdded = "Shift Successfully Created";       
// 						$scope.message = error;
// 						$location.path('/shiftpattern/create/');
// 					}                                     
// 			}); 
// 		}else{      
// 			error.shiftErr = "Please enter Shift Name";       
// 			$scope.message = error;  
// 		}
// 	}
// 	$scope.selectAllDept= function() {
//     $scope.tagsList=[];
//     if(document.getElementById("selectAllDept").checked==true) {
//       $('.selectAllDept').each(function(){ this.checked = true; });
//     } else {
//       $('.selectAllDept').each(function(){ this.checked = false; });
//     }
//     var checkboxes = [];    
//     var inputElements = document.getElementsByName('departmentName');
//     for(var i=0; inputElements[i]; ++i){
//       if(inputElements[i].checked){             
//         checkboxes.push(inputElements[i].value);
//       }
//       if(i==inputElements.length-1){
//         $scope.tagsList = checkboxes;
//       }
//     }
//   }
//   $scope.addDepartmentName = function(id,name) {
//     if(document.getElementById(id).checked==true) {
//       $scope.tagsList.push(name);
//     } else {
//       for (var i = 0; i < $scope.tagsList.length; i++) {
//         if($scope.tagsList[i]==name) {
//           $scope.tagsList.splice(i,1);
//         }
//       };
//     }
//   }
// });
// timecloud.controller('editShiftController',function ($scope,$modal, $log, $http,$location,$routeParams, myService) { //edit shift controller
// 	var error = {};
// 	$scope.shift = [];
// 	$http.get('/companydata').success(function(data) { 
// 		if(data){ 
// 			$scope.country = data.country; 
// 			if(data.isovertime){ 
// 				if(data.overtimePeriod == "daily") {       
// 					if(data.overtimeLevel == 1){
// 						$scope.overtime1 = 1;
// 					}else{
// 						$scope.overtime2 = 1;
// 					}
// 				}
// 			}
// 			if(data.isallowances){          
// 				if(data.allowances){
// 					$scope.allowanceList = data.allowances;
// 				}  
// 			}
// 			if(data.tooltipDelayTime){
// 					$scope.delayTime = data.tooltipDelayTime;
// 			}
// 			if(data.isdepartments) {
// 				$scope.departments = data.departments;	
// 			}
// 			if(data.isDepartmentTagsInShift) {
// 				$scope.showShiftTags = true;
// 			}
// 			if(data.isTimeZoneForShift) {
// 				$scope.showShiftTimezone = true;
// 			}
// 			if(data.isSecondBreakInShift) {
// 				$scope.showsecondBreak = true;
// 			}
// 			$http.get('/shiftData').success(function(data){       
// 				if(data) {       
// 						$scope.shiftList = data;
// 				}                                     
// 			});
// 			$http.get("/shift/edit/"+$routeParams.shiftId)
// 				.success(function(data) {
// 					if(data){
// 						var startTime = new Date(Date.parse(data.startTime)).toUTCString();
// 						var finishTime = new Date(Date.parse(data.finishTime)).toUTCString();
// 						$scope.startTime = moment.utc(startTime).format('HH:mm');
// 						$scope.finishTime = moment.utc(finishTime).format('HH:mm');
// 						if(data.ordinarytime){
// 								var Time = data.ordinarytime.split(':');                
// 								$scope.ordinarytime = Time[0]+':'+Time[1];
// 						}else{
// 							$scope.ordinarytime = '00:00';
// 						}
// 						if(data.overTime1){
// 							var Time = data.overTime1.split(':');
// 							$scope.overTime1 = Time[0]+':'+Time[1];
// 						}else{
// 							$scope.overTime1 =  '00:00';
// 						}
// 						if(data.breakTime){
// 								var breakT = data.breakTime.split(':');             
// 								$scope.breakTime = breakT[0]+':'+breakT[1];           
// 							}
// 						if(data.breakAfter){
// 							var breakA = data.breakAfter.split(':');               
// 							$scope.breakAfter= breakA[0] +':'+breakA[1];              
// 						}  
// 						if(data.breakTime2){
// 								var breakT = data.breakTime2.split(':');             
// 								$scope.breakTime2 = breakT[0]+':'+breakT[1];           
// 							}
// 						if(data.breakAfter2){
// 							var breakA = data.breakAfter2.split(':');               
// 							$scope.breakAfter2= breakA[0] +':'+breakA[1];              
// 						}
// 						if(data.allowance)  {
// 							var allowances = data.allowance;              
// 							allowances.forEach(function(allowance){
// 								if(allowance.active == true){
// 									$('#'+allowance.name+'Id').attr("checked", true);
// 									$('#'+allowance.name).val(allowance.payAfter);
// 								}  
// 							});              
// 						}
// 						var timezones = [];
// 						if(data.timeZones.length>0){
// 							timezones = data.timeZones;
// 						} else {
// 							timezones.push({"_id":1,"payPeriod" : "","finishTime" : "","startTime" : "","name" : ""});
// 						}
// 						$scope.shift = {
// 								'name' : data.name,
// 								'startLimit':data.startLimit,
// 								'finishLimit' :data.finishLimit,
// 								'breakIn': data.breakIn,
// 								'_id':data._id,
// 								'ordinarytime':data.ordinarytime,
// 								'overTime1':data.overTime1,
// 								'overTime2':data.overTime2,
// 								'breakTime':data.breakTime,
// 								'breakAfter':data.breakAfter,
// 								'breakIn2':data.breakIn2,
// 								'color':data.color,
// 								'tags':data.tags,
// 								'timeZones':timezones,
// 						}						
// 				}
// 			});
// 			$scope.zoneTagList = data.zoneTags; 
// 		}
// 	});
// 	$scope.hstep = 1;
// 	$scope.mstep = 10;
// 	$scope.options = {
// 		hstep: [1, 2, 3],
// 		mstep: [0, 1, 5, 10, 15, 25, 30]
// 	};
// 	$scope.ismeridian = false;
// 	$scope.formatTime = function(id) { 
// 			var val =  $('#'+id).val();
// 			val = val.replace(/[^0-9]/g,'');
// 			if(val.length >= 2)
// 					val = val.substring(0,2) + ':' + val.substring(2); 
// 			if(val.length >= 5)
// 					val = val.substring(0,5); 
// 		 $('#'+id).val(val);
// 	};
// 	$scope.submitform = function() {		
// 		$(".removealerts").css("border-color","#d5d5d5");
// 		$(".removealerts").css("background-color","#fff");
// 		$(".removealerts").css("color","#858585");
// 		var cnt = 0;
// 		var newTimeZoneList = [];
// 		if($scope.shift.timeZones.length>0) {
// 			$scope.shift.timeZones.forEach(function(detail){				
// 				var tName      = document.getElementById("timezone"+detail._id).value;
// 				var tStartTimet= document.getElementById("tStartTime"+detail._id).value;
// 				var tFinishTime= document.getElementById("tFinishTime"+detail._id).value;
// 				var payPeriod  = document.getElementById("payPeriod"+detail._id).value;
// 				var zoneName  = document.getElementById("zoneName"+detail._id).value;
// 				if(tName!="" || tStartTimet!="" || tFinishTime!="" || payPeriod!="" || zoneName!="") {
// 					if(tName!="") {
// 						$("#timezone"+detail._id).css("border-color","#d5d5d5");
// 						$("#timezone"+detail._id).css("background-color","#fff");
// 						$("#timezone"+detail._id).css("color","#858585");
// 					} else {
// 						$("#timezone"+detail._id).css("border-color","#eed3d7");
// 						$("#timezone"+detail._id).css("background-color","#f2dede");
// 						$("#timezone"+detail._id).css("color","#b94a48");
// 					}
// 					if(tStartTimet!="") {
// 						$("#tStartTime"+detail._id).css("border-color","#d5d5d5");
// 						$("#tStartTime"+detail._id).css("background-color","#fff");
// 						$("#tStartTime"+detail._id).css("color","#858585");
// 					} else {
// 						$("#tStartTime"+detail._id).css("border-color","#eed3d7");
// 						$("#tStartTime"+detail._id).css("background-color","#f2dede");
// 						$("#tStartTime"+detail._id).css("color","#b94a48");
// 					}
// 					if(tFinishTime!="") {
// 						$("#tFinishTime"+detail._id).css("border-color","#d5d5d5");
// 						$("#tFinishTime"+detail._id).css("background-color","#fff");
// 						$("#tFinishTime"+detail._id).css("color","#858585");
// 					} else {
// 						$("#tFinishTime"+detail._id).css("border-color","#eed3d7");
// 						$("#tFinishTime"+detail._id).css("background-color","#f2dede");
// 						$("#tFinishTime"+detail._id).css("color","#b94a48");
// 					}
// 					if(payPeriod!="") {
// 						$("#payPeriod"+detail._id).css("border-color","#d5d5d5");
// 						$("#payPeriod"+detail._id).css("background-color","#fff");
// 						$("#payPeriod"+detail._id).css("color","#858585");
// 					} else {
// 						$("#payPeriod"+detail._id).css("border-color","#eed3d7");
// 						$("#payPeriod"+detail._id).css("background-color","#f2dede");
// 						$("#payPeriod"+detail._id).css("color","#b94a48");
// 					}
// 					if(zoneName!="") {
// 						$("#zoneName"+detail._id).css("border-color","#d5d5d5");
// 						$("#zoneName"+detail._id).css("background-color","#fff");
// 						$("#zoneName"+detail._id).css("color","#858585");
// 					} else {
// 						$("#zoneName"+detail._id).css("border-color","#eed3d7");
// 						$("#zoneName"+detail._id).css("background-color","#f2dede");
// 						$("#zoneName"+detail._id).css("color","#b94a48");
// 					}					
// 					if(detail.zoneName && detail.payPeriod && detail.finishTime && detail.name && detail.startTime) {
// 						cnt++;
// 						newTimeZoneList.push({zoneName:detail.zoneName,name: detail.name,startTime:detail.startTime,finishTime:detail.finishTime,payPeriod:detail.payPeriod});
// 					}
// 				} else {
// 					cnt++;
// 				}
// 				if(cnt==$scope.shift.timeZones.length) {					
// 					$http.get("/shift/edit/"+$routeParams.shiftId).success(function(data){
// 						myService.setCurrentShift(data._id);
// 						var startscopeTime = $scope.startTime.split(':');
// 						var sHour = startscopeTime[0];
// 						var sMinute = startscopeTime[1];
// 						var date = moment().format('YYYY-MM-DD');  
// 						var startSeconds = toSeconds($scope.startTime+':00');
// 						var finishscopeTime = $scope.finishTime.split(':');
// 						var fHour = finishscopeTime[0];
// 						var fMinute = finishscopeTime[1]      ;
// 						var finishSeconds = toSeconds($scope.finishTime+':00'); 
// 						if(finishSeconds < startSeconds){
// 							var Hourset = moment.utc(date).set('hours', sHour); 
// 							var fdate = moment.utc(date).add('Days',1).format('YYYY-MM-DD');
// 							var fHourset = moment.utc(fdate).set('hours', fHour);               
// 						}else{
// 							var Hourset = moment.utc(date).set('hours', sHour); 
// 							var fdate = moment(date).format('YYYY-MM-DD');
// 							var fHourset = moment.utc(fdate).set('hours', fHour);   
// 						}              
// 						$scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
// 						$scope.shift.finishTime =  moment(fHourset).set('minute', fMinute).format();
// 						if($scope.breakTime){
// 							$scope.shift.breakTime = $scope.breakTime+':'+00;
// 						}else{
// 							$scope.shift.breakTime = "00:00:00";
// 						}
// 						if($scope.breakAfter){
// 							$scope.shift.breakAfter = $scope.breakAfter+':'+00;
// 						}
// 						if($scope.breakTime2){
// 							$scope.shift.breakTime2 = $scope.breakTime2+':'+00;
// 						}else{
// 							$scope.shift.breakTime2 = "00:00:00";
// 						}
// 						if($scope.breakAfter2){
// 							$scope.shift.breakAfter2 = $scope.breakAfter2+':'+00;
// 						} else {
// 							$scope.shift.breakAfter2 = "00:00:00";
// 						} 
// 						 $scope.shift.ordinarytime = $scope.ordinarytime+':00';
// 						 $scope.shift.overTime1 = $scope.overTime1+':00';
// 						var allowanceArray = [];
// 						if($scope.shift.name){							
// 							if($scope.shift.startTime == $scope.shift.finishTime) {
// 								error.shiftErr = "Shift Start time and finish time cannot be same";
// 								$scope.message = error; 
// 							} else { 
// 								$scope.message  = {};
// 								$('input[name="allowanceCheck"]:checked').each(function() {        
// 								var payAfter = $('#'+this.value).val();       
// 									allowanceArray.push(this.value+'/'+payAfter);
// 								});
// 								$scope.shift.allowance = allowanceArray; 
// 								$scope.shift.timeZoneList = newTimeZoneList;
// 								myService.setArray($scope.shift);
// 								if(moment.utc(data.startTime).format('llll') != $scope.startTime || moment.utc(data.finishTime).format('llll') != $scope.finishTime || $scope.shift.startLimit != data.startLimit || $scope.shift.finishLimit != data.finishLimit){ 
// 									$scope.openModel();
// 								}else{
// 									$http.post('/editshift',$scope.shift).success(function(data){
// 											if(data == "true"){                       
// 												error.shiftAdded = "Shift Successfully Updated";       
// 												$scope.message = error;
// 												$(window).scrollTop(0);
// 											}                                     
// 									}); 
// 								}
// 							}
// 						}else{      
// 							error.shiftErr = "Please enter Shift Name";       
// 							$scope.message = error;  
// 						} 
// 					}); 		
// 				}
// 			});
// 		}
// 	}	
// 	$scope.addMoreTimezone = function() {
// 		var len = $scope.shift.timeZones.length + 1;		
// 		$scope.shift.timeZones.push({_id:len,timezones:"",timeZoneStartTime:"",timeZoneFinishTime:"",payPeriod:""});
// 	}
// 	$scope.createPattern = function(){ 
// 		$http.get("/shift/edit/"+$routeParams.shiftId)
// 				.success(function(data){
// 						myService.setCurrentShift(data._id);            
// 						var startscopeTime = $scope.startTime.split(':');
// 						var sHour = startscopeTime[0];
// 						var sMinute = startscopeTime[1];
// 						var date = moment().format('YYYY-MM-DD');  
// 						var startSeconds = toSeconds($scope.startTime+':00');
// 						var finishscopeTime = $scope.finishTime.split(':');
// 						var fHour = finishscopeTime[0];
// 						var fMinute = finishscopeTime[1]      ;
// 						var finishSeconds = toSeconds($scope.finishTime+':00');  
// 						if(finishSeconds < startSeconds){
// 							var Hourset = moment.utc(date).set('hours', sHour); 
// 							var fdate = moment.utc(date).add('Days',1).format('YYYY-MM-DD');
// 							var fHourset = moment.utc(fdate).set('hours', fHour);               
// 						}else{
// 							var Hourset = moment.utc(date).set('hours', sHour); 
// 							var fdate = moment(date).format('YYYY-MM-DD');
// 							var fHourset = moment.utc(fdate).set('hours', fHour);   
// 						}              
// 						$scope.shift.startTime = moment(Hourset).set('minute', sMinute).format();
// 						$scope.shift.finishTime =  moment(fHourset).set('minute', fMinute).format();
// 						if($scope.breakTime){
// 							$scope.shift.breakTime = $scope.breakTime+':'+00;
// 						}else{
// 							$scope.shift.breakTime = "00:00:00";
// 						}
// 						if($scope.breakAfter){
// 							$scope.shift.breakAfter = $scope.breakAfter+':'+00;  
// 						}              
// 						$scope.shift.ordinarytime = $scope.ordinarytime+':00';
// 						 $scope.shift.overTime1 = $scope.overTime1+':00';
// 						var allowanceArray = [];
// 						if($scope.shift.name){ 
// 							$('input[name="allowanceCheck"]:checked').each(function() {        
// 								var payAfter = $('#'+this.value).val();       
// 								allowanceArray.push(this.value+':'+payAfter);
// 							}); 
// 								$scope.shift.allowance = allowanceArray; 
// 								myService.setArray($scope.shift);
// 								if(moment.utc(data.startTime).format('llll') != $scope.startTime || moment.utc(data.finishTime).format('llll') != $scope.finishTime){ 
// 									myService.setcreatePatern(1);
// 									$scope.openModel();
// 								}else{
// 									$http.post('/editshift',$scope.shift).success(function(data){
// 											if(data == "true"){                       
// 												$location.path('/shiftpattern/create/');
// 											}                                     
// 									}); 
// 								}
// 						}else{      
// 							error.shiftErr = "Please enter Shift Name";       
// 							$scope.message = error;  
// 						} 
// 		});    
// 	}
// 	$scope.dateStart  = '';
// 	$scope.openModel = function () {
// 		var modalInstance = $modal.open({
// 			templateUrl: 'shift.html',
// 			controller: ModalInstanceCtrl       
// 		});
// 		modalInstance.result.then(function (resultValue) {     
// 			if(resultValue == 1){
// 				error.shiftAdded = "Shift Successfully Updated";       
// 				$scope.message = error;
// 				return $scope.message;
// 				$(window).scrollTop(0);     
// 			}else{
// 				if(resultValue == 2){
// 					$location.path('/shiftpattern/create/');
// 				}
// 			}
// 		}, function () {
// 			$log.info('Modal dismissed at: ' + new Date());
// 		});  
// 	}
// 	var ModalInstanceCtrl = function ($scope, $modalInstance, myService) { 
// 			$scope.Id = myService.getShift();
// 			$scope.shift = myService.getShiftData();  
// 			$scope.pattern = myService.getcreatePatern() ;
// 			$scope.ok = function (value) {  
// 				var error = {};   
// 				if(value) {
// 					$scope.shift.dateStart = value;     
// 					$http.post('/editshift',$scope.shift).success(function(data){
// 							if(data == "true"){ 
// 								if($scope.pattern == 1) {
// 									$modalInstance.close(2);
// 								}else{
// 									$modalInstance.close(1);
// 								}
// 							}                                     
// 					}); 
// 				}else{
// 					error.date = "Please select Date";       
// 					$scope.message = error;
// 					return $scope.message;
// 				}     
// 			};
// 			$scope.callfn =function(){
// 				this.$emit("UPDATE_PARENT", "Updated");
// 			}      
// 			$scope.cancel = function () {
// 				$modalInstance.dismiss('cancel');
// 			};
// 	};
// 	$scope.deleteShift = function(){ 
// 		$http.post('/deleteshift',$scope.shift).success(function(data){
// 					if(data == "true"){                       
// 						error.shiftAdded = "Shift Successfully Deleted";       
// 						$scope.message = error;
// 						$location.path('/shiftpattern');  
// 					}                                     
// 			}); 
// 	}
// 	$scope.selectAllDept= function() {
//     $scope.shift.tags=[];
//     if(document.getElementById("selectAllDept").checked==true) {
//       $('.selectAllDept').each(function(){ this.checked = true; });
//     } else {
//       $('.selectAllDept').each(function(){ this.checked = false; });
//     }
//     var checkboxes = [];    
//     var inputElements = document.getElementsByName('departmentName');
//     for(var i=0; inputElements[i]; ++i){
//       if(inputElements[i].checked){             
//         checkboxes.push(inputElements[i].value);
//       }
//       if(i==inputElements.length-1){
//         $scope.shift.tags = checkboxes;
//       }
//     }
//   }
//   $scope.addDepartmentName = function(id,name) {
//     if(document.getElementById(id).checked==true) {
//       $scope.shift.tags.push(name);
//     } else {
//       for (var i = 0; i < $scope.shift.tags.length; i++) {
//         if($scope.shift.tags[i]==name) {
//           $scope.shift.tags.splice(i,1);
//         }
//       };
//     }
//   }
// });
// timecloud.controller('leavesController',function ($scope,$http,$location,$routeParams) { // employee leave list controller
// 	$http.get('/companydata').success(function(data) { 
// 		if(data.tooltipDelayTime){
// 					$scope.delayTime = data.tooltipDelayTime;
// 			}       
// 	});
// 	$http.get('/getleavesList').success(function(data) { 
// 		if(data){
// 					$scope.leavesList = data;
// 			}       
// 	});
// 	$scope.Accept = function(leaveId){
// 		$http.get('/accpetleave/'+leaveId).success(function(data){
// 				if(data == "true"){                       
// 					$http.get('/getleavesList').success(function(data) { 
// 						if(data){
// 									$scope.leavesList = data;
// 							}       
// 					});
// 				}                                     
// 		}); 
// 	}
// 	$scope.Reject = function(leaveId){
// 		$http.get('/rejectleave/'+leaveId).success(function(data){
// 				if(data == "true"){                       
// 					$http.get('/getleavesList').success(function(data) { 
// 						if(data){
// 									$scope.leavesList = data;
// 							}       
// 					});
// 				}                                     
// 		}); 
// 	}
// });
// timecloud.controller('shiftPatternController',function ($scope,$http,$location,$routeParams) { // shift pattern list controller
// 	$http.get('/companydata').success(function(data) { 
// 		if(data.tooltipDelayTime){
// 			$scope.delayTime = data.tooltipDelayTime;
// 			$scope.country = data.country;
// 		}
// 		if(data.isHolidays == true){
// 			$scope.showHolidays = 1;
// 		} else {
// 			$scope.showHolidays = 0;
// 		}
// 		$scope.manageLeaves = false;
// 		if(data.manageLeaves){
// 			$scope.manageLeaves = true;
// 		}
// 	});
// 	$http.get('/shiftData').success(function(data){       
// 		if(data){            
// 			$scope.shiftList = data;
// 		}                                     
// 	});
// 	$http.get('/shiftpatterndata').success(function(data) { 
// 		if(data){                      
// 			$scope.shiftPatternList = data;
// 		}    
// 	}); 
// 	/*shift order set*/
// 	$scope.saveshiftOrder= function() {
// 		console.log("dfgdf");
// 		$http.post('/saveShiftOrder',{shiftList:$scope.shiftList}).success(function(data) { 
// 			if(data){
// 				$http.get('/shiftData').success(function(data){
// 					if(data){
// 						$scope.shiftList = data;
// 					}
// 				});
// 			}    
// 		});
// 	}
// });
// timecloud.controller('createshiftPatternController',function ($scope,$http,$location,$routeParams) { // create shift pattern controller
// 	$http.get('/companydata').success(function(data) { 
// 			if(data){   
// 				$scope.WeekdayStart = data.WeekdayStart;
// 				$('#Weekly').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 				$('#noOfDays').val(1);
// 				$scope.DaysNo = 7;
// 				$scope.weekDayshow = 1; 
// 				var date = new Date();
// 				$scope.updateText(date); 
// 			} 
// 			if(data.tooltipDelayTime){
// 					$scope.delayTime = data.tooltipDelayTime;
// 			}   
// 			$scope.SelectedOption = 'Weeks'
// 	});
// 	var error = {};   
// 	$http.get('/shiftpatterndata').success(function(data) { 
// 		if(data){                      
// 			$scope.shiftPatternList = data;
// 		}    
// 	});
// 	$scope.rule = '';
// 	$scope.submitform = function(){
// 		$scope.rule.noOfDays = $scope.DaysNo;    
// 		if($scope.rule.name){
// 					var daysArray = [];
// 					var shiftValueArray = [];
// 					// $("#daysDiv select").each(function(i) {
// 					//   var day = $(this).attr("name");
// 					//   var shiftValue =  $(this).val(); 
// 					//   shiftValueArray.push(shiftValue);
// 					//   daysArray.push(day+':'+shiftValue);
// 					// }); 
// 					// $scope.rule.days = daysArray;
// 					$("#daysDiv select").each(function(i) {
// 						var day = $(this).attr("name");
// 						var shiftValue =  $(this).val();           
// 						shiftValueArray.push(shiftValue);
// 						//daysArray.push(day+':'+shiftValue);
// 						daysArray.push({day:day,shiftValue:shiftValue});
// 						$scope.rule.days = daysArray;   
// 					});
// 					if(daysArray.length <=0){
// 						$('#errors').addClass('span3 alert alert-danger ng-binding');
// 						error.paternErr = "Please select correct first date of rule.!";       
// 						$scope.message = error;
// 						return $scope.message;
// 					}
// 					if ( $.inArray('All', shiftValueArray) > -1 ) {
// 						$('#errors').addClass('span3 alert alert-danger ng-binding');
// 						error.paternErr = "Please select shift for all days";       
// 						$scope.message = error;
// 						return $scope.message;
// 					}else{
// 						$http.post('/createshiftpattern',$scope.rule).success(function(data){
// 							if(data == "true"){                       
// 								error.patternAdded = "Shift Pattern Successfully Created";       
// 								$scope.message = error;
// 								$location.path('/shiftpattern');  
// 							}                                     
// 						});
// 					}        
// 		}else{
// 			$('#errors').addClass('span3 alert alert-danger ng-binding');
// 				error.paternErr = "Please enter shift pattern name";       
// 				$scope.message = error;
// 		}    
// 	}
// 		$scope.dateOptions = {
// 				'year-format': "'yy'",
// 				'starting-day': 1,        
// 				'show-weeks':false,
// 				'showTimezone': true, 
// 		};
// 		$scope.formats = ['yyyy-MM-dd'];
// 		$scope.format = $scope.formats[0];
// 		$scope.updateText = function(datePicker){    
// 			var todayDate = new Date(); 
// 			var weekday=new Array(7);
// 					weekday[0]="Sunday";
// 					weekday[1]="Monday";
// 					weekday[2]="Tuesday";
// 					weekday[3]="Wednesday";
// 					weekday[4]="Thursday";
// 					weekday[5]="Friday";
// 					weekday[6]="Saturday";   
// 					if($scope.DaysNo){        
// 						$("#daysDiv").html(''); 
// 						var WeekdayStart = $scope.WeekdayStart; 
// 						var settingDay = '';
// 						var DayWeek = '';
// 						if(WeekdayStart == 'sun'){
// 							var settingDay = 0;  
// 							var  DayWeek = 'Sunday';
// 						}else if(WeekdayStart == 'mon'){
// 							var settingDay = 1;  
// 							var  DayWeek = 'Monday';
// 						}else if(WeekdayStart == 'tues'){
// 							var settingDay = 2;
// 							var  DayWeek = 'Tuesday';            
// 						}else if(WeekdayStart == 'wed'){
// 							var settingDay = 3; 
// 							var  DayWeek = 'Wednesday';            
// 						}else if(WeekdayStart == 'thurs'){
// 							var settingDay = 4;  
// 							var  DayWeek = 'Thursday';             
// 						}else if(WeekdayStart == 'fri'){
// 							var settingDay = 5; 
// 							var  DayWeek = 'Friday';             
// 						}else if(WeekdayStart == 'sat'){
// 							var settingDay = 6;
// 							var  DayWeek = 'Saturday';            
// 						}else{
// 							var settingDay = '';
// 							var  DayWeek = '';
// 						}
// 						Date.prototype.addDays = function(days) {
// 								this.setDate(this.getDate() + days);
// 								return this;
// 						};
// 						var DateGiven = new Date(datePicker)
// 						var dayinGivenDate = DateGiven.getDay();
// 						var dateValue = '';
// 						if($scope.SelectedOption == 'Days'){
// 							dateValue = datePicker;
// 						}
// 						else if(dayinGivenDate == settingDay) {            
// 							dateValue = datePicker;
// 						}else{
// 							var days = $scope.DaysNo;   
// 							var start = new Date(DateGiven)
// 							var end = start.addDays(days);        
// 							var start = new Date(DateGiven),
// 									endDate = end,
// 								currentDate = new Date(start),
// 								between = [],
// 								days = $scope.DaysNo
// 							;
// 							while (currentDate < endDate) {  
// 								var dayMatch = currentDate.getDay();           
// 								if(dayMatch == settingDay){               
// 									dateValue = currentDate;  
// 									break;
// 								}              
// 								currentDate.setDate(currentDate.getDate() + 1);
// 							}
// 						}  
// 						var days = $scope.DaysNo;
// 						$scope.rule.noOfDays = days;          
// 						var start = new Date(dateValue)
// 						var end = start.addDays(days);        
// 						var start = new Date(dateValue),
// 								endDate = end,
// 							currentDate = new Date(start),
// 							between = [],
// 							days = $scope.DaysNo
// 						;
// 						while (currentDate < endDate) {
// 								between.push(new Date(currentDate));
// 								currentDate.setDate(currentDate.getDate() + 1);
// 						}
// 						if($scope.SelectedOption == 'Days') {
// 							for(i=0;i<=between.length;i++){
// 							if(between[i]){
// 									 var inc = i+1;
// 									 var day = 'Day'+inc;
// 									 $("#daysDiv").append('<div class="form-group"><label class="col-sm-3" for="form-field-1">'+day+' </label><div class="col-sm-9"><select name='+day+' class="col-xs-10 col-sm-5" id=='+day+' popover-placement="top" popover-trigger="mouseenter" popover="tooltip2" popover-popup-delay="500"><option value="All">Choose a Shift</option></select>');         
// 								 }       
// 							}
// 						}else{
// 							for(i=0;i<=between.length;i++){
// 							if(between[i]){
// 									 var day = weekday[between[i].getDay()];
// 									 $("#daysDiv").append('<div class="form-group"><label class="col-sm-3" for="form-field-1">'+day+' </label><div class="col-sm-9"><select name='+day+' class="col-xs-10 col-sm-5" id=='+day+' popover-placement="top" popover-trigger="mouseenter" popover="tooltip2" popover-popup-delay="500"><option value="All">Choose a Shift</option></select>');         
// 								 }       
// 							}
// 						}            
// 					 $http.get('/shiftData').success(function(data){       
// 							if(data){  
// 									$.each(data, function(i, item) {                
// 											var shift = data[i].name; 
// 											var color = data[i].color; 
// 											$("#daysDiv select").each(function(i) {
// 												// $(this).append('<option value='+shift+' style="background-color:'+color+'; color:black">'+shift+'</option>');     
// 												$(this).append("<option value='"+shift+"' style=\"background-color:"+color+"; color:black\">"+shift+"</option>");
// 											});
// 									})
// 							}                                     
// 						});
// 				} 
// 		}
// 		$scope.noOfDaysFn = function(value){ 
// 			error.paternErr = "";       
// 			$scope.message = error;
// 			$('#errors').removeClass('span3 alert alert-danger ng-binding');
// 			var date  = new Date(); 
// 			if($('#noOfDays').val()){ 
// 				var noOfDays = $('#noOfDays').val();
// 				if(value == "Daily"){
// 					 $scope.SelectedOption = 'Days';
// 				}else if(value == "Weekly"){      
// 					 $scope.SelectedOption = 'Weeks';                            
// 				}           
// 				if($scope.SelectedOption == 'Weeks'){
// 					$scope.DaysNo = noOfDays * 7; 
// 				}else {
// 					$scope.DaysNo = noOfDays * 1; 
// 				}
// 				if(noOfDays >35 && $scope.SelectedOption == 'Days'){
// 					$('#errors').addClass('span3 alert alert-danger ng-binding');
// 						error.paternErr = "You cant select more than 35 Days";       
// 						$scope.message = error;
// 						return $scope.message;
// 				}else if(noOfDays >5 && $scope.SelectedOption == 'Weeks'){
// 						$('#errors').addClass('span3 alert alert-danger ng-binding');
// 						error.paternErr = "You cant select more than 5 weeks";       
// 						$scope.message = error;
// 						return $scope.message;
// 				}  
// 				if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 					$scope.weekDayshow = 1; 
// 				}else{
// 					$scope.weekDayshow = 0; 
// 				}
// 				$scope.rule.ruleStartDate = date;  
// 				$scope.updateText(date);   
// 				/*var value = $('#noOfDays').val(); 
// 				var date  = new Date();       
// 				if($scope.SelectedOption == 'Weeks'){
// 					$scope.DaysNo = value * 7;            
// 				}else {
// 					$scope.DaysNo = value * 1; 
// 				}
// 				if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 					$scope.weekDayshow = 1; 
// 				}else{
// 					$scope.weekDayshow = 0; 
// 				}
// 				$scope.rule.ruleStartDate = date;  
// 				$scope.updateText(date); */
// 			}else{
// 				if(value == "Daily"){ 
// 					 $('#noOfDays').val(1) ;
// 					 $scope.SelectedOption = 'Days';
// 					 $scope.DaysNo = 1;          
// 				}else if(value == "Weekly"){      
// 					 $('#noOfDays').val(1)  ; 
// 					 $scope.SelectedOption = 'Weeks';  
// 					 $scope.DaysNo = 7;               
// 				} 
// 				if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 					$scope.weekDayshow = 1; 
// 				}else{
// 					$scope.weekDayshow = 0; 
// 				}     
// 				$scope.rule.ruleStartDate = date;  
// 				$scope.updateText(date);   
// 			} 
// 		}
// 		$scope.showDate = function(){ 
// 			if(!$scope.SelectedOption){
// 					error.paternErr = "Please select Length of Period";       
// 					$scope.message = error;
// 					return $scope.message;
// 			}else{
// 					error.paternErr = "";       
// 					$scope.message = error;
// 					$('#errors').removeClass('span3 alert alert-danger ng-binding');
// 					var value = $('#noOfDays').val(); 
// 					if(value >35 && $scope.SelectedOption == 'Days'){
// 						$('#errors').addClass('span3 alert alert-danger ng-binding');
// 							error.paternErr = "You cant select more than 35 Days";       
// 							$scope.message = error;
// 							return $scope.message;
// 					}else if(value >5 && $scope.SelectedOption == 'Weeks'){
// 							$('#errors').addClass('span3 alert alert-danger ng-binding');
// 							error.paternErr = "You cant select more than 5 weeks";       
// 							$scope.message = error;
// 							return $scope.message;
// 					}else{
// 						var date  = new Date();       
// 						if($scope.SelectedOption == 'Weeks'){
// 							$scope.DaysNo = value * 7; 
// 						}else {
// 							$scope.DaysNo = value * 1; 
// 						}
// 						if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 							$scope.weekDayshow = 1; 
// 						}else{
// 							$scope.weekDayshow = 0; 
// 						}
// 						$scope.rule.ruleStartDate = date;  
// 						$scope.updateText(date); 
// 					}
// 				}      
// 		} 
// });
// timecloud.controller('editshiftPatternController',function ($scope,$modal,$log, $http,$location,$routeParams,myService) { // edit shift pattern controller
// 	var error = {}; 
// 	$scope.delayTime = myService.getDelayTime();
// 	$http.get('/companydata').success(function(data) { 
// 			if(data){                     
// 				$scope.WeekdayStart = data.WeekdayStart;
// 			 /* $('#Weekly').removeClass('btn btn-primary').addClass('btn btn-primary active');
// 				$('#noOfDays').val(1);
// 				$scope.DaysNo = 7;
// 				$scope.weekDayshow = 1; 
// 				var date = new Date();
// 				$scope.updateText(date);  */
// 			}         
// 	});  
// 	$http.get('/shiftpatterndata').success(function(data) { 
// 		if(data){                      
// 			$scope.shiftPatternList = data; 
// 		}    
// 	});
// 	/*$http.get('/departments').success(function(data) { 
// 		if(data){                      
// 			$scope.departments = data; 
// 		}    
// 	});*/
// 	$http.get("/shiftpattern/edit/"+$routeParams.shiftPatternId)
// 		.success(function(data) {     
// 				$scope.rule = data;
// 				$scope.daysList = data.days;
// 				// console.log($scope.daysList);
// 				$scope.daysList.sort(orderByShiftIndexAscending); 
// 				// console.log($scope.daysList);
// 				if(data.noOfDays>=14){
// 					$scope.weekDayshow = 0;
// 				}else{
// 					$scope.weekDayshow = 1;
// 				}
// 				$scope.weekDayshow = 0;
// 				if(data.name){
// 					$http.post("/checkassigneduser",{shiftPattern:data.name}).success(function(data) {
// 						if(data =='false') {
// 							$scope.deleteBtn = 1;
// 						}
// 					});
// 				}
// 				$http.get('/shiftData').success(function(data){       
// 					if(data){
// 						$scope.shiftList = data; 
// 						$scope.shiftValue = 'noon'
// 					}                                     
// 				}); 
// 	});
// 	$scope.deleteshiftPattern = function(){  
// 		$http.get("/deleteshiftPattern/"+$routeParams.shiftPatternId)
// 		.success(function(data) {     
// 			if(data == 'true'){
// 				$location.path('/shiftpattern');  
// 			}
// 		});
// 	}
// 	$scope.submitform = function(){  
// 		$http.get("/shiftpattern/edit/"+$routeParams.shiftPatternId).success(function(data) {     
// 			myService.setCurrentShiftpattern(data._id);
// 			if($scope.rule.name){
// 				var daysArray = [];
// 				var shiftValueArray = [];
// 				$("#daysDiv select").each(function(i) {
// 					var day = $(this).attr("name");
// 					var shiftValue =  $(this).val();           
// 					shiftValueArray.push(shiftValue);
// 					//daysArray.push(day+':'+shiftValue);
// 					daysArray.push({day:day,shiftValue:shiftValue});
// 					$scope.rule.days = daysArray;   
// 				});  
// 				var dataDaysArray = [];
// 				var dataShiftValueArray = [];
// 				$.each(data.days, function(j, daysData) { 
// 					var day = daysData.day;
// 					var shiftValue =  daysData.shift; 
// 					dataDaysArray.push(day+':'+shiftValue); 
// 				});
// 				if( $.inArray('All', shiftValueArray) > -1 ) {
// 					$('#errors').addClass('span3 alert alert-danger ng-binding');
// 					error.paternErr = "Please select shift for all days";       
// 					$scope.message = error;
// 					return $scope.message;
// 				}else{
// 					myService.ShiftpatternArray($scope.rule);
// 					var compare = true;
// 					for(i=0;i<daysArray.length;i++){
// 						for(ii=0;ii<dataDaysArray.length;ii++) 
// 						{ 
// 							if(daysArray[i]!= dataDaysArray[ii]) 
// 							{ 
// 								compare = false; 
// 							}
// 							i++;
// 						}
// 					}
// 					if(compare == false){
// 							$scope.openModel();
// 					}else{
// 						$http.post('/editshiftpattern',$scope.rule).success(function(data){
// 							if(data == "true"){                       
// 								error.patternAdded = "Shift Pattern Successfully Updated";       
// 								$scope.message = error;
// 							}                                     
// 						}); 
// 					}                
// 				}                  
// 			}else{
// 				error.paternErr = "Please enter shift pattern name";       
// 				$scope.message = error;
// 			} 
// 		});
// 	}
// 		$scope.dateOptions = {
// 				'year-format': "'yy'",
// 				'starting-day': 1,        
// 				'show-weeks':false
// 		};
// 		$scope.formats = ['yyyy-MM-dd'];
// 		$scope.format = $scope.formats[0];
// 		$scope.updateText = function(datePicker){       
// 			var todayDate = new Date(); 
// 			var weekday=new Array(7);
// 					weekday[0]="Sunday";
// 					weekday[1]="Monday";
// 					weekday[2]="Tuesday";
// 					weekday[3]="Wednesday";
// 					weekday[4]="Thursday";
// 					weekday[5]="Friday";
// 					weekday[6]="Saturday";   
// 					if($scope.DaysNo){        
// 						$("#daysDiv").html(''); 
// 						var WeekdayStart = $scope.WeekdayStart; 
// 						var settingDay = '';
// 						var DayWeek = '';
// 						if(WeekdayStart == 'sun'){
// 							var settingDay = 0;  
// 							var  DayWeek = 'Sunday';
// 						}else if(WeekdayStart == 'mon'){
// 							var settingDay = 1;  
// 							var  DayWeek = 'Monday';
// 						}else if(WeekdayStart == 'tues'){
// 							var settingDay = 2;
// 							var  DayWeek = 'Tuesday';            
// 						}else if(WeekdayStart == 'wed'){
// 							var settingDay = 3; 
// 							var  DayWeek = 'Wednesday';            
// 						}else if(WeekdayStart == 'thurs'){
// 							var settingDay = 4;  
// 							var  DayWeek = 'Thursday';             
// 						}else if(WeekdayStart == 'fri'){
// 							var settingDay = 5; 
// 							var  DayWeek = 'Friday';             
// 						}else if(WeekdayStart == 'sat'){
// 							var settingDay = 6;
// 							var  DayWeek = 'Saturday';            
// 						}else{
// 							var settingDay = '';
// 							var  DayWeek = '';
// 						}
// 						Date.prototype.addDays = function(days) {
// 								this.setDate(this.getDate() + days);
// 								return this;
// 						};
// 						var DateGiven = new Date(datePicker)
// 						var dayinGivenDate = DateGiven.getDay();
// 						var dateValue = '';
// 						if($scope.SelectedOption == 'Days'){
// 							dateValue = datePicker;
// 						}
// 						else if(dayinGivenDate == settingDay) {            
// 							dateValue = datePicker;
// 							/*$('#errors') .removeClass('span3 alert alert-danger ng-binding')
// 							error.paternErr = "";       
// 							$scope.message = error;*/
// 						}else{
// 							 /*$('#errors') .addClass('span3 alert alert-danger ng-binding')
// 							error.paternErr = "Your Work Start Day is "+DayWeek;       
// 							$scope.message = error;
// 							return $scope.message;*/
// 							var days = $scope.DaysNo;   
// 							var start = new Date(DateGiven)
// 							var end = start.addDays(days);        
// 							var start = new Date(DateGiven),
// 								endDate = end,
// 								currentDate = new Date(start),
// 								between = [],
// 								days = $scope.DaysNo
// 							;
// 							while (currentDate < endDate) {  
// 								var dayMatch = currentDate.getDay();           
// 								if(dayMatch == settingDay){               
// 									dateValue = currentDate;  
// 									//$scope.rule.ruleStartDate = currentDate;              
// 									break;
// 								}              
// 								currentDate.setDate(currentDate.getDate() + 1);
// 							}
// 						}  
// 						var days = $scope.DaysNo;
// 						$scope.rule.noOfDays = days;          
// 						var start = new Date(dateValue)
// 						var end = start.addDays(days);        
// 						var start = new Date(dateValue),
// 								endDate = end,
// 							currentDate = new Date(start),
// 							between = [],
// 							days = $scope.DaysNo
// 						;
// 						while (currentDate < endDate) {
// 								between.push(new Date(currentDate));
// 								currentDate.setDate(currentDate.getDate() + 1);
// 						}
// 						/*var weekday=new Array(7);
// 								weekday[0]="Sunday";
// 								weekday[1]="Monday";
// 								weekday[2]="Tuesday";
// 								weekday[3]="Wednesday";
// 								weekday[4]="Thursday";
// 								weekday[5]="Friday";
// 								weekday[6]="Saturday";       */
// 						if($scope.SelectedOption == 'Days') {
// 							for(i=0;i<=between.length;i++){
// 							if(between[i]){
// 									 var inc = i+1;
// 									 var day = 'Day'+inc;
// 									 $("#daysDiv").append('<div class="form-group"><label class="col-sm-3" for="form-field-1">'+day+' </label><div class="col-sm-9"><select name='+day+' class="col-xs-10 col-sm-5" id=='+day+' popover-placement="top" popover-trigger="mouseenter" popover="tooltip2" popover-popup-delay="500"><option value="All">Choose a Shift</option></select>');         
// 								 }       
// 							}
// 						}else{
// 							for(i=0;i<=between.length;i++){
// 							if(between[i]){
// 									 var day = weekday[between[i].getDay()];
// 									 $("#daysDiv").append('<div class="form-group"><label class="col-sm-3" for="form-field-1">'+day+' </label><div class="col-sm-9"><select name='+day+' class="col-xs-10 col-sm-5" id=='+day+' popover-placement="top" popover-trigger="mouseenter" popover="tooltip2" popover-popup-delay="500"><option value="All">Choose a Shift</option></select>');         
// 								 }       
// 							}
// 						}
// 						$http.get('/shiftData').success(function(data){       
// 							if(data){  
// 									$.each(data, function(i, item) {                
// 											var shift = data[i].name; 
// 											$("#daysDiv select").each(function(i) {
// 												// $(this).append('<option value='+shift+' style="background-color:'+color+'; color:black">'+shift+'</option>'); 
// 												$(this).append("<option value='"+shift+"' style=\"background-color:"+color+"; color:black\">"+shift+"</option>");                         
// 													//$(this).append(new Option(shift, shift));                    
// 											});
// 									})
// 							}                                     
// 						});
// 				}/*else{        
// 						error.paternErr = "Please select Length of Period";       
// 						$scope.message = error;
// 						return $scope.message;
// 				} */
// 		}
// 		$scope.noOfDaysFn = function(value){ 
// 			$scope.DaysNo = '';
// 			$scope.SelectedOption = '';
// 			error.paternErr = "";       
// 			$scope.message = error;
// 			$('#errors').removeClass('span3 alert alert-danger ng-binding');
// 			var date  = new Date(); 
// 			if($('#noOfDays').val()){  
// 					var noOfDays = $('#noOfDays').val();
// 					if(value == "Daily"){
// 						 $scope.SelectedOption = 'Days';
// 					}else if(value == "Weekly"){      
// 						 $scope.SelectedOption = 'Weeks';                            
// 					}           
// 					if($scope.SelectedOption == 'Weeks'){
// 						$scope.DaysNo = noOfDays * 7; 
// 					}else {
// 						$scope.DaysNo = noOfDays * 1; 
// 					}
// 					if(noOfDays >35 && $scope.SelectedOption == 'Days'){
// 						$('#errors').addClass('span3 alert alert-danger ng-binding');
// 							error.paternErr = "You cant select more than 35 Days";       
// 							$scope.message = error;
// 							return $scope.message;
// 					}else if(noOfDays >5 && $scope.SelectedOption == 'Weeks'){
// 							$('#errors').addClass('span3 alert alert-danger ng-binding');
// 							error.paternErr = "You cant select more than 5 weeks";       
// 							$scope.message = error;
// 							return $scope.message;
// 					}  
// 					if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 						$scope.weekDayshow = 1; 
// 					}else{
// 						$scope.weekDayshow = 0; 
// 					}
// 					$scope.rule.ruleStartDate = date;  
// 					$scope.updateText(date);     
// 			}else{
// 				if(value == "Daily"){ 
// 					 $('#noOfDays').val(1) ;
// 					 $scope.SelectedOption = 'Days';
// 					 $scope.DaysNo = 1;          
// 				}else if(value == "Weekly"){      
// 					 $('#noOfDays').val(1)  ; 
// 					 $scope.SelectedOption = 'Weeks';  
// 					 $scope.DaysNo = 7;               
// 				} 
// 				if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 					$scope.weekDayshow = 1; 
// 				}else{
// 					$scope.weekDayshow = 0; 
// 				}     
// 				$scope.rule.ruleStartDate = date;  
// 				$scope.updateText(date);   
// 			}                   
// 		}
// 	$scope.showDate = function(){ 
// 		if(!$scope.SelectedOption){
// 				error.paternErr = "Please select Length of Period";       
// 				$scope.message = error;
// 				return $scope.message;
// 		}else{
// 				error.paternErr = "";       
// 				$scope.message = error;
// 				$('#errors').removeClass('span3 alert alert-danger ng-binding');
// 				var value = $('#noOfDays').val(); 
// 				if(value >35 && $scope.SelectedOption == 'Days'){
// 					$('#errors').addClass('span3 alert alert-danger ng-binding');
// 						error.paternErr = "You cant select more than 35 Days";       
// 						$scope.message = error;
// 						return $scope.message;
// 				}else if(value >5 && $scope.SelectedOption == 'Weeks'){
// 						$('#errors').addClass('span3 alert alert-danger ng-binding');
// 						error.paternErr = "You cant select more than 5 weeks";       
// 						$scope.message = error;
// 						return $scope.message;
// 				}else{
// 					var date  = new Date();       
// 					if($scope.SelectedOption == 'Weeks'){
// 						$scope.DaysNo = value * 7; 
// 					}else {
// 						$scope.DaysNo = value * 1; 
// 					}
// 					if($scope.DaysNo < 8 && $scope.SelectedOption == 'Weeks'){
// 						$scope.weekDayshow = 1; 
// 					}else{
// 						$scope.weekDayshow = 0; 
// 					}
// 					$scope.rule.ruleStartDate = date;  
// 					$scope.updateText(date); 
// 				}
// 			}      
// 	}   
// 	$scope.dateStart  = '';
// 	$scope.openModel = function () {
// 		var modalInstance = $modal.open({
// 			templateUrl: 'shiftpattern.html',
// 			controller: ModalInstanceCtrl       
// 		});   
// 		modalInstance.result.then(function (resultValue) {     
// 			if(resultValue == 1){
// 				error.patternAdded = "Shift Pattern Successfully Updated";       
// 				$scope.message = error;
// 				return $scope.message;
// 				$(window).scrollTop(0);
// 			}
// 		}, function () {
// 			$log.info('Modal dismissed at: ' + new Date());
// 		});  
// 	}
// 	var ModalInstanceCtrl = function ($scope, $modalInstance, myService) { 
// 			$scope.Id = myService.getCurrentShiftpattern();
// 			$scope.rule = myService.getShiftpatternArray();    
// 			$scope.ok = function (value) {  
// 				var error = {};   
// 				if(value) {
// 					$scope.rule.dateStarting = moment(value).format("YYYY-MM-DD");         
// 					$http.post('/editshiftpattern',$scope.rule).success(function(data){
// 							if(data == "true"){ 
// 								$modalInstance.close(1);              
// 							}                                     
// 					}); 
// 				}else{
// 					error.date = "Please select Date";       
// 					$scope.message = error;
// 					return $scope.message;
// 				}     
// 			};
// 			$scope.callfn =function(){
// 				this.$emit("UPDATE_PARENT", "Updated");
// 			}      
// 			$scope.cancel = function () {
// 				$modalInstance.dismiss('cancel');
// 			};
// 	};
// });
// timecloud.filter('utcTime', function(){
// 		return function(date){
// 			if(date){
// 				var chTime = new Date(Date.parse(date)).toUTCString();      
// 				var date = moment.utc(chTime).format('YYYY-MM-DD HH:mm:ss');
// 				return date;   
// 			}else{
// 				return '00:00';   
// 			}
// 		};
// });
// timecloud.filter('timeago', function(){
// 		return function(date){
// 			if(date){
// 				var chTime = new Date(Date.parse(date)).toUTCString();      
// 				var date = moment.utc(chTime).format('HH:mm');
// 				return date;   
// 			}else{
// 				return '00:00';   
// 			}
// 		};
// });
// function orderByempNo(a, b) {
// 		if (a.employeeNo == b.employeeNo) {
// 				return 0;
// 		} else if (a.employeeNo > b.employeeNo) {
// 				return 1;
// 		}
// 		return -1;
// }
// function orderByName(a, b) {
// 		if (a.firstName == b.firstName) {
// 				return 0;
// 		} else if (a.firstName > b.firstName) {
// 				return 1;
// 		}
// 		return -1;
// }
// function orderByLastName(a, b) {
// 		if (a.lastName == b.lastName) {
// 				return 0;
// 		} else if (a.lastName > b.lastName) {
// 				return 1;
// 		}
// 		return -1;
// }
// function orderByShiftPattern(a, b) {
// 		if (a.shift == b.shift) {
// 				return 0;
// 		} else if (a.shift > b.shift) {
// 				return 1;
// 		}
// 		return -1;
// }
// function orderByDepartment(a, b) {
// 		if (a.department == b.department) {
// 				return 0;
// 		} else if (a.department > b.department) {
// 				return 1;
// 		}
// 		return -1;
// }
// function orderByStatus(a, b) {
// 		if (a.status == b.status) {
// 				return 0;
// 		} else if (a.status > b.status) {
// 				return 1;
// 		}
// 		return -1;
// }
// function orderByNameAscending(a, b) {
// 		if (a.checkTime == b.checkTime) {
// 				return 0;
// 		} else if (a.checkTime > b.checkTime) {
// 				return 1;
// 		}
// 		return -1;
// }
// timecloud.directive('demoDirective', function($compile) {
// 		return {
// 			template: '<div><label>{{input.label}} </label></div>',
// 			replace: true,
// 			link: function(scope, element) {
// 				var el = angular.element('<span/>');
// 				switch(scope.input.inputType) {
// 					case 'checkbox':
// 						el.append('<input type="checkbox" ng-model="input.checked"/>');
// 						break;
// 					case 'text':
// 						el.append('<input type="text" ng-model="input.value"/>');
// 						break;
// 				}
// 				$compile(el)(scope);
// 				element.append(el);
// 			}
// 		}
// 	});
// function validTime(time) {
// 		var result = false, m;
// 		var re = /^\s*([01]?\d|2[0-3]):?([0-5]\d)\s*$/;
// 		if ((m = time.match(re))) {
// 				result = true;
// 		}
// 		return result;
// }
// function orderByShiftIndexAscending(a, b) {
// 		if (a.index == b.index) {
// 				return 0;
// 		} else if (a.index > b.index) {
// 				return 1;
// 		}
// 		return -1;
// }
// 	// if(dataDash!=null){
// 	// 	$http.get('/checkadminDept').success(function(deptList) {
// 	// 		$http.get("/getPayperiod").success(function(periodicData) {
// 	// 			if(periodicData){
// 	// 				if(dataDash.budgetedSales)
// 	// 					$scope.budgetedSale = dataDash.budgetedSales;
// 	// 				var date = moment(periodicData.end);
// 	// 				var sDate = date.add(1, 'days');
// 	// 				var sDt = moment(sDate).format("YYYY-MM-DD");
// 	// 				console.log(sDt);
// 	// 				console.log(dataDash.weekStart);
// 	// 				console.log(getPeriodicData.data.prvsDatas);
// 	// 				if(sDt=dataDash.weekStart) {
// 	// 					$("#nextBtn").removeClass("buttonCustomCss");
// 	// 					$("#nextBtn").addClass("buttonCustomDisable");
// 	// 				} else {
// 	// 					$("#nextBtn").addClass("buttonCustomCss");
// 	// 					$("#nextBtn").removeClass("buttonCustomDisable");
// 	// 				}
// 	// 				if(getPeriodicData.data.prvsDatas) {
// 	// 					$("#prvBtn").addClass("buttonCustomCss");
// 	// 					$("#prvBtn").removeClass("buttonCustomDisable");
// 	// 				} else {
// 	// 					$("#prvBtn").removeClass("buttonCustomCss");
// 	// 					$("#prvBtn").addClass("buttonCustomDisable");
// 	// 				}
// 	// 				if(dataDash.workedHours!='' && dataDash.workedHours!=lastData) {
// 	// 					lastData = dataDash.workedHours;
// 	// 				}
// 	// 				var percentage = dataDash.percentageUsed;
// 	// 				if(parseInt(percentage)>150 && (dataDash.percentageUsed)!='') {
// 	// 					$scope.pData =150;
// 	// 				} else if((dataDash.percentageUsed)!='') {
// 	// 					if(dataDash.percentageUsed=='NaN') {
// 	// 						$scope.pData = 0;
// 	// 					} else {
// 	// 						$scope.pData = Math.round(dataDash.percentageUsed);  
// 	// 					} 
// 	// 				} else
// 	// 				$scope.pData = 0;
// 	// 				if(deptList != 'false') {								
// 	// 					if(dataDash.departments!=null) {
// 	// 						var newallocatedHours = 0;
// 	// 						var newworkedHours = 0;									
// 	// 						var newmoneySpent = 0;									
// 	// 						var result = [];
// 	// 						var cnt = 0;
// 	// 						deptList.forEach(function(key) {
// 	// 							cnt++;
// 	// 							dataDash.departments.filter(function(item) {
// 	// 								if(item.departmentName == key) {
// 	// 									result.push(item);
// 	// 									var alcHrs=item.allocatedHours.split(":");												
// 	// 									alcHrs = alcHrs[0];
// 	// 									alcHrs = parseInt(alcHrs);
// 	// 									newallocatedHours=newallocatedHours+alcHrs;
// 	// 									var workedH=item.workedHours.split(":");
// 	// 									workedH = workedH[0];
// 	// 									workedH = parseInt(workedH);
// 	// 									newworkedHours=newworkedHours+workedH;
// 	// 									var mSpend=item.moneySpent;												
// 	// 									mSpend = parseInt(mSpend);
// 	// 									newmoneySpent=newmoneySpent+mSpend;
// 	// 								}
// 	// 							});
// 	// 							if(cnt==deptList.length) {
// 	// 								dataDash.moneySpent = newmoneySpent;
// 	// 								if(newworkedHours!='0') {
// 	// 									dataDash.percentageUsed = (newworkedHours*100)/newallocatedHours;
// 	// 								} else {
// 	// 									dataDash.percentageUsed = 0;
// 	// 								}
// 	// 								dataDash.allocatedHours = newallocatedHours+":00:00";
// 	// 								dataDash.workedHours = newworkedHours+":00:00";
// 	// 								dataDash.departments = result
// 	// 								$scope.dashboardData = dataDash; 
// 	// 							}
// 	// 						});
// 	// 					}
// 	// 					if(getPeriodicData.data.subDepartmentList.subDepartments) {
// 	// 						var result1 = [];
// 	// 						var cnt1 = 0;
// 	// 						deptList.forEach(function(key1) {
// 	// 							cnt1++;
// 	// 							getPeriodicData.data.subDepartmentList.subDepartments.filter(function(item1) {
// 	// 								if(item1.parentDeptName == key1) {
// 	// 									result1.push(item1);
// 	// 								}
// 	// 							});
// 	// 							if(cnt1==deptList.length) {
// 	// 								getPeriodicData.data.subDepartmentList.subDepartments = result1;
// 	// 								if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 									$scope.subDepartments = getPeriodicData.data.subDepartmentList;
// 	// 								}									
// 	// 							}
// 	// 						})
// 	// 					}
// 	// 				} else {
// 	// 					if(localStorage.getItem("adminType")=="subAdmin") {
// 	// 						$scope.subDepartments= getPeriodicData.data.subDepartmentList;
// 	// 					}						
// 	// 					$scope.dashboardData = dataDash;
// 	// 				}
// 	// 				changebutton(percentage,'main');
// 	// 				$('#guageMeter').highcharts({
// 	// 					chart: {
// 	// 						type: 'gauge',
// 	// 						plotBackgroundColor: null,
// 	// 						plotBackgroundImage: null,
// 	// 						plotBorderWidth: 0,
// 	// 						plotShadow: false
// 	// 					},
// 	// 					title: {
// 	// 						text: ''
// 	// 					},
// 	// 					pane: {
// 	// 						startAngle: -150,
// 	// 						endAngle: 150,
// 	// 					},
// 	// 					yAxis: {
// 	// 						min: 0,
// 	// 						max: 150,
// 	// 						minorTickInterval: 'auto',
// 	// 						minorTickWidth: 1,
// 	// 						minorTickLength: 10,
// 	// 						minorTickPosition: 'inside',
// 	// 						minorTickColor: '#666',
// 	// 						tickPixelInterval: 20,
// 	// 						tickWidth: 2,
// 	// 						tickPosition: 'inside',
// 	// 						tickLength: 10,
// 	// 						tickColor: '#666',
// 	// 						labels: {
// 	// 							step: 2,
// 	// 							rotation: 'auto'
// 	// 						},
// 	// 						title: {
// 	// 							text: 'Percentage',
// 	// 							y: 15, // 10 pixels down from the top								
// 	// 						},
// 	// 						plotBands: [{
// 	// 							from: 0,
// 	// 							to: 75,
// 	// 							color: '#56c03c' // green
// 	// 						}, {
// 	// 							from: 75,
// 	// 							to: 100,
// 	// 							color: '#f27c4e' // orange
// 	// 						}, {
// 	// 							from: 100,
// 	// 							to: 150,
// 	// 							color: '#e15352' // red
// 	// 						}]
// 	// 					},
// 	// 					series: [{
// 	// 						name: 'Hour Used',
// 	// 						data: [$scope.pData],
// 	// 						tooltip: {
// 	// 							valueSuffix: ' %'
// 	// 						}
// 	// 					}]
// 	// 				},function (chart) {
// 	// 				});
// 	// 			}
// 	// 		});
// 	// 	});
// 	// }
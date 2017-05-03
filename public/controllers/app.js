var registration = angular.module('registration',['ngRoute', 'ngSanitize']);
registration.controller("loginController",function ($scope,$http,$location)
{
	$scope.login = function(){
		var error = {};
		   if($scope.userForm.email && $scope.userForm.pwd){
			$http.post('/login',$scope.userForm).success(function(data){
				if(data == "true"){
				  location.href='admin/#/dashboard';
				} else if(data == "false"){
					error.login = "Invalid username or password";
					$scope.message = error;
				}else if(data.pin == 1){
					localStorage.removeItem("empNo");
					localStorage.setItem('empNo',data.employeeNo);
					location.href='user/#/viewAttendance/'+data.employeeNo;
				} else if(data.error){
					error.login = "Your account is locked - please arrange payment immediately and contact the administrator";
					$scope.message = error;
				} else{
					localStorage.setItem("userId",data.user);
					localStorage.setItem("adminType",data.adminType);
					localStorage.removeItem("empNo");
					location.href='index/#/home';
				}
			});
		}
		else {
			error.login = "Please enter all the fields";
			$scope.message = error;
		}
	}

	$scope.getCookie = function(cname){
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) != -1) {
				$scope.userForm.email = c.substring(name.length, c.length);
				//alert($scope.userForm.email);
				$scope.userForm.remember = true;
			}
		}

	}
});

registration.controller('signupController',function ($scope,$http,$location) {
	var error = {};
	$scope.signup = function(){
		if($scope.userFormSign.email && $scope.userFormSign.password){
			if($scope.userFormSign.email == $scope.userFormSign.repeatEmail){
				if($scope.userFormSign.password == $scope.userFormSign.repeatPassword){
					if($scope.userFormSign.firstname){
						if($scope.userFormSign.lastname){
							if($scope.userFormSign.country){
								if($scope.userFormSign.version) {
									if($scope.userFormSign.key){
										$http.post('/checkKey',$scope.userFormSign).success(function(data){
											if(data == "true"){
												$http.post('/signup',$scope.userFormSign).success(function(data){
													if(data == "true"){
														localStorage.setItem("adminType",'mainAdmin');
														location.href='index/#/settings';
													}
													if(data == "false"){
														error.signup = "email already exist";
														$scope.message = error;
													}
												});
											}
											if(data == "false"){
												error.signup = "Incorrect Registration key";
												$scope.message = error;
											}
											if(data == 1){
												error.signup = "Registration key already used";
												$scope.message = error;
											}
										});
									}else{
										 error.signup = "Please enter Registration Key";
										$scope.message = error;
									}
								}else{
										 error.signup = "Please choose a version";
										$scope.message = error;
								}

							}else{
							   error.signup = "Please choose a Location";
							   $scope.message = error;
							}
						}else{
							error.signup = "Please enter your Last Name";
							$scope.message = error;
						}
					}else{
						error.signup = "Please enter your First Name";
						$scope.message = error;
					}
				}else{
					error.signup = "Password does not match";
					$scope.message = error;
				}
			} else{
				error.signup = "Email does not match";
				$scope.message = error;
			}
		}else {
			error.signup = "Please enter all the fields";
			$scope.message = error;
		}
	}
});

registration.controller('forgotPasswordController',function ($scope,$http,$location) {
	$scope.message = {};
	$scope.forgot = function(){
		if($scope.userFormForgot.email){
			$http.post('/forgotpassword',$scope.userFormForgot).success(function(data){
				if(data == "true"){
					$scope.message = {success:"Mail sent. Please check your mail"};
				} else {
			 		$scope.message = {error:"email does not exist"};
				}
			});
		}else {
			$scope.message = {error:"Please enter email"};
		}
	}
});


registration.controller('recoverController',function ($scope,$http,$location) { //recoverpassword controller
	var error = {};
	$scope.validate = function(){
	$scope.recoverForm.userId = $('#recoverUserid').val();
		if($scope.recoverForm.password){
			if($scope.recoverForm.password != $scope.recoverForm.repeatPassword){
				error.recover = "Password does not match";
				$scope.message = error;
			}else{
				$http.post('/recoverpassword',$scope.recoverForm).success(function(data){
					if(data == "true"){
					   location.href='/';
					}
				});
			}
		}else{
			error.recover = "Please enter all field";
			$scope.message = error;
		}
	}
});

function setCookie(cname,cvalue,exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname+"="+cvalue+"; "+expires;
}

var mongoose = require('mongoose')
  , Company = mongoose.model('Company')
  , Employee = mongoose.model('Employee')
  , Exception = mongoose.model('Exceptions')
  , Attendance = mongoose.model('Attendance')
  , Moment = require('moment-timezone')
  , Holidays = mongoose.model('Holidays')
  , empFn = require('../../functions/employeefn.js')
  , Customreports = mongoose.model('Customreports')
  , Standardreports = mongoose.model('Standardreports')
  var async    =    require('async');
 require ('mongoose-pagination');

var paginate = require('mongoose-paginate');
//var google_calendar = new gcal.GoogleCalendar(accessToken);

exports.getPayperiodSession = function (req, res) {
  Company.findById(req.session.user, function(err, companyData) {
    if(companyData){
      if(companyData.payPeriod){
        var payPeriod = companyData.payPeriod;
        var WeekdayStart = companyData.WeekdayStart;
        var payPeriodStartDate = companyData.payPeriodStartDate;
        var days = 0;
        if(payPeriod == 'weekly'){
            days = 7;
        }else if(payPeriod == '2weeks'){
            days = 14;
        }else if(payPeriod == '4weeks'){
            days = 28;
        }else if(payPeriod == 'monthly'){
            days = 30;
        } 
        var settingDay = '';               
        if(WeekdayStart == 'sun'){
          var settingDay = 0; 
        }else if(WeekdayStart == 'mon'){
          var settingDay = 1; 
        }else if(WeekdayStart == 'tues'){
          var settingDay = 2;           
        }else if(WeekdayStart == 'wed'){
          var settingDay = 3;            
        }else if(WeekdayStart == 'thurs'){
          var settingDay = 4;         
        }else if(WeekdayStart == 'fri'){
          var settingDay = 5;           
        }else if(WeekdayStart == 'sat'){
          var settingDay = 6;          
        }else{
          var settingDay = '';
        }

        var payperiodFn = function(currentDate1, startD, endD, callback){
          var newstartD = startD;
          var newendD = endD;
          while (startD <= endD) {
              if(startD == endD){
                  var startD = endD; 
                  var endD = Moment.utc(endD).add('days', 14).format('YYYY-MM-DD'); 
                  newstartD = startD;
                  newendD = endD;                                     
              }else if(currentDate1 == startD){                   
                  var data ={
                      'start':newstartD,
                      'end':newendD,
                      'status':1
                  }                            
                  callback(data);     
                  break;                            
              }else{
                  startD = Moment.utc(startD).add('days', 1).format('YYYY-MM-DD');   
              }
          } 
        }

        if(payPeriod == '2weeks'){
            var startDate =  Moment.utc(payPeriodStartDate).startOf('week').format('YYYY-MM-DD');
            var endDate = Moment.utc(payPeriodStartDate).endOf('week').format('YYYY-MM-DD');
            var currentDay = Moment.utc().format('YYYY-MM-DD');                    
        }else{
            var startDate =  Moment.utc().startOf('week').format('YYYY-MM-DD');
            var endDate = Moment.utc().endOf('week').format('YYYY-MM-DD');
        }
        
        var between = [];
        while (startDate <= endDate) {
            var dayMatch = Moment(startDate).day(); 
            if(dayMatch == settingDay){
                between.push(Moment.utc(startDate).format('YYYY-MM-DD'));
            } 
            startDate = Moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
        }
        if(payPeriod == '2weeks'){
            var start = between[0];               
            var end = Moment.utc(start).add('days', days).format('YYYY-MM-DD');                    
            var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');  
            payperiodFn(currentDay, start,end, function(result){
              if(result.status ==1){
                empFn.getLastDateSession(req.session.user,function(resultRe){
                  if(resultRe == false){
                      start = result.start;
                      end = Moment.utc(result.end).subtract('days', 1).format('YYYY-MM-DD'); 
                      res.json({'start':start, 'end':end, 'days':days})
                  }else{
                      var stringDate = resultRe.split('/')
                      var start = stringDate[0];
                      var end = stringDate[1];
                      res.json({'start':start, 'end':end, 'days':days})
                   }
                });
              }
            });            
        }else{            
            empFn.getLastDateSession(req.session.user,function(resultRe){
              if(resultRe == false){
                  var start = between[0];               
                  var end = Moment.utc(start).add('days', days-1).format('YYYY-MM-DD');                    
                  var prv = Moment.utc(start).subtract('days', days).format('YYYY-MM-DD');                   
                  res.json({'start':start, 'end':end, 'days':days})
              }else{
                  var stringDate = resultRe.split('/')
                  var start = stringDate[0];
                  var end = stringDate[1];
                  res.json({'start':start, 'end':end, 'days':days})
               }
            });
        }
      }
    }
  });  
}

exports.getPayperiod = function (req, res) {
  console.log("getPayperiod...");
  empFn.getPayperiod(req.session.user,function(result){
    console.log(result);
    res.json(result);
  });
}

exports.getemployeereport = function(req, res){
  var companyId = req.session.user;
  var start = req. params.from;
  var end = req. params.to;
  console.log(start);
  console.log(end);
  global.empdataArray = [];
  Employee.find({'companyId':companyId},function(err, employeeData){
      if(employeeData){  
        //console.log(employeeData);
        var employeeNo = []; 
        var attendanceArray = []; 
        employeeData.forEach(function(dataEmp){ 
          empdataArray.push(dataEmp);
          employeeNo.push(dataEmp.employeeNo); 
        }); 
        function getData(callback)    
        {
          for(i=0; i<employeeNo.length; i++){
            empFn.getAttendanceData(employeeNo[i],companyId,start,end, function(result){
              attendanceArray.push(result);                                  
              if(employeeNo.length == attendanceArray.length) {
                callback(attendanceArray);
              }
            });  
          } 
        } 
        getData(function (result){                
            res.json({"employeeData":empdataArray,"attendanceData":result});        
        })                        
      }
    }); 
}


exports.createHoliday = function(req, res){
  var adminDetil = {email:req.session.email,userType:req.session.userType};
  var holidayDate = Moment.utc(req.body.holidayDate).format('YYYY-MM-DD');
  var holidays = new Holidays();
  holidays.companyId = req.session.user;
  holidays.date = holidayDate;
  holidays.holidayName = req.body.holidayName;
  holidays.save(function(err,data) { 
    if(data){
      if(req.body.departmentList && req.body.departmentList.length>0) {
        Attendance.update({department:{$in:req.body.departmentList},date:new Date(holidayDate),companyId:req.session.user}, 
          {$set: {  
              holiday:true,             
          }},{upsert: false, new: false, multi: true}, function(err,data){
            if(err) {
              console.log(err);
            }else{
              console.log(req.session.user);
              Company.find({'_id':req.session.user}, function(err, CompanyData){
                console.log(err);
                console.log(CompanyData);
                CompanyData.forEach(function(dataCompany){ 
                  if(dataCompany){
                    empFn.getHolidays(dataCompany._id, function(holidayresult){
                      var currentDate = Moment.utc().format('YYYY-MM-DD');
                      var previousDate = Moment.utc().subtract('days',30).format('YYYY-MM-DD');
                      Attendance.find({'companyId':dataCompany._id,"date":new Date(holidayDate),department:{$in:req.body.departmentList}}).sort({'_id':'asc'}).exec(function(err, data){
                        if(data.length>0){ 
                          data.forEach(function(employeeAttendance){
                            empFn.calculateAtn(adminDetil,holidayresult,dataCompany,employeeAttendance,function(result){});                
                          });           
                        }
                      }); // attendance find
                    }); //holiday fn     
                  }
                });  
              });
              res.json(true);
            }
        });

      } else {
        Attendance.update({date:new Date(holidayDate),companyId:req.session.user}, 
          {$set: {  
              holiday:true,
          }},{upsert: false, new: false, multi: true}, function(err,data){
            if(err) {
              console.log(err);
            }else{              
              Company.find({'_id':req.session.user}, function(err, CompanyData){
                console.log(err);
                console.log(CompanyData);
                CompanyData.forEach(function(dataCompany){ 
                  if(dataCompany){
                    empFn.getHolidays(dataCompany._id, function(holidayresult){
                      var currentDate = Moment.utc().format('YYYY-MM-DD');
                      var previousDate = Moment.utc().subtract('days',30).format('YYYY-MM-DD');
                      Attendance.find({'companyId':dataCompany._id,"date":new Date(holidayDate)}).sort({'_id':'asc'}).exec(function(err, data){
                        if(data.length>0){ 
                          data.forEach(function(employeeAttendance){
                            empFn.calculateAtn(adminDetil,holidayresult,dataCompany,employeeAttendance,function(result){});                
                          });           
                        }
                      }); // attendance find
                    }); //holiday fn     
                  }
                });  
              });
              res.json(true);
            }
        });
      }      
    }else{
      console.log(err);
    }
  });
}

exports.fetchReports = function(req, res){
  Customreports.findOne({'companyId':req.params.companyId},function(err, CustomreportsData){
      if(CustomreportsData){
        res.json(CustomreportsData);
      }else{
        res.json(false);
      }
  });
}

exports.getstandardreports = function(req, res){
  Standardreports.findOne({'companyId':req.params.companyId},function(err, StandardreportsData){
      if(StandardreportsData){
        res.json(StandardreportsData);
      }else{
        res.json(false);
      }
  });
}

exports.addcustomReport = function(req, res){ 
  Customreports.update(
      {'companyId': req.body.companyId},
      {$push: {       
          reportData: { 
            reportName: req.body.reportName,
            link:req.body.reportsIp+req.body.link,
            active:req.body.active
          }
      }},{upsert: true, new: false}, function(err,data){
        if(err) {
           res.json(false);
        }else{
          res.json(true);
        }
    });
}

exports.deleteCustomreports = function(req, res){
  Customreports.update(
  {'companyId': req.body.companyId},
  {$pull: {       
      reportData: { 
        '_id':req.body.reportId
      }
  }},{upsert: false, new: false}, function(err,data){
    if(err) {
     res.json(false);
    }else{  
      res.json(true);
    }
  });
}

exports.deletestdreports = function(req, res){
  Standardreports.update(
  {'companyId': req.body.companyId},
  {$pull: {       
      reportData: { 
        '_id':req.body.reportId
      }
  }},     
  {upsert: false, new: false}, function(err,data){
        if(err) {
           res.json(false);
        }else{  
            res.json(true);
        }
  });
}

exports.editreport = function(req, res){
  Customreports.update(
    {'reportData._id':req.body._id,'companyId': req.body.companyId},                           
    {$set: {     
          'reportData.$.reportName': req.body.reportName,    
          'reportData.$.link': req.body.link, 
          'reportData.$.active': req.body.active
    }},             
    {upsert: false, new: false}, function(err,data){
        if(err) {
           res.json(false);
        }else{  
            res.json(true);
        }
    })
  
}

exports.editstdreport = function(req, res){
  var companyId = req.body.companyId;
  var reportName = req.body.reportName;
  var link = req.body.link;
  var active = req.body.active;
  var reportId = req.body._id;  
  Standardreports.update({'reportData._id':reportId,'companyId': companyId},                           
    {$set: {     
          'reportData.$.reportName': reportName,    
          'reportData.$.link': link, 
          'reportData.$.active': active
    }},             
    {upsert: true, new: false}, function(err,data){
        if(err) {
           res.json(false);
        }else{  
            res.json(true);
        }
    })
}

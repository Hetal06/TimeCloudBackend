var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var projectSchema = mongoose.Schema({
    companyId: { type: String},  // company user Id (id of tenant)
    companyname :{ type: String, default: '' }, 
    projectname : { type: String, default: '' },
    clientname : { type: String, default: '' },
    JC : { type: String, default: '' },
    budgetH : { type: String, default: '0' },
    budget$ : { type: String, default: '0' },
    supervisorH : { type: String, default: '0' },
    supervisor$ : { type: String, default: '0' },
    usedH  : { type: String, default: '0' },
    used$ : { type: String, default: '0' },
    usedsupervisorH : { type: String, default: '0' },
    usedsupervisor$ : { type: String, default: '0' },
    alerts :  { type: String, default: '' },
    isalert : { type: Boolean, default: false }, 
    projectJCTotal : { type: String, default: '' },
    users: [{
        date :{ type: String, default: '' },
        employeeNo : { type: String, default: '' },
        firstName : { type: String, default: '' },
        lastName : { type: String, default: '' },
        hourlyRate : { type: String, default: '' },
        chargeoutRate : { type: String, default: '' },
        workCode : { type: String, default: '' },
        timeTotal : { type: String, default: '' }
    }],
    tasks: [{
        taskname : { type: String, default: '' },  
        taskCode : { type: String, default: '' },  
        total :{ type: String, default: '' },
        nonbillable:{ type: Boolean, default: false },
        calcInclude:{ type: Boolean, default: true }
    }],
    active:{ type: Boolean, default: true},
    calFlag:{ type: Boolean, default: false},
});
  
module.exports = mongoose.model('Project', projectSchema, 'project');
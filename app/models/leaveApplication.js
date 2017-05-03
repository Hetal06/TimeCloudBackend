var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var leaveApplicationSchema = mongoose.Schema({
    companyId: { type: String} ,     // company user Id (id of tenant)
    employeeNo :{ type: String, default: '' },
    startDate:{ type: Date, default: '' },
    finishDate:{ type: Date, default: '' },
    comment:{ type: String, default: '' },
    exception : { type: String, default: '' },
    employeeName: { type: String, default: '' },
    accepted:{ type: Boolean, default: false }, 
    rejected:{ type: Boolean, default: false }
});

leaveApplicationSchema.index({ companyId: 1}); // schema level

  
module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema, 'leaveApplication');
var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var weeklyOTSchema = mongoose.Schema({
   companyId: { type: String} ,  
   employeeNo :{ type: String, default: '' },
   weekStart:{ type: String, default: '' },
   weekEnd:{ type: String, default: '' },
   weeklyOT1:{ type: String, default: '' },
   weeklyOT2:{ type: String, default: '' },
   weeklyNT:{ type: String, default: '' },
   totalOT:{ type: String, default: '' },
   readflag:{ type: Boolean, default: false }, 
});

weeklyOTSchema.index({readflag:1,companyId: 1, employeeNo: 1}); // schema level

module.exports = mongoose.model('WeeklyOT', weeklyOTSchema, 'weeklyOT');
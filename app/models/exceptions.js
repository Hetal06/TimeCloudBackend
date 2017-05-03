var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var exceptionSchema = mongoose.Schema({
    companyId: String,      // company user Id (id of tenant)
    title:{ type: String, default: '' },
    standardHours:{ type: String, default: '' },
    exceptiontype:{ type: String, default: '' },
    payrollCode:{ type: String, default: '' },
    addToStandardHours:{ type: Boolean, default: false },
    exceptionTotal:{ type: Boolean, default: false },
    weeklyOtinclude : { type: Boolean, default: false },
});
  
module.exports = mongoose.model('Exceptions', exceptionSchema, 'exceptions');
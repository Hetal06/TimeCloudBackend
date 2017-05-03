var mongoose = require('mongoose')
  , Schema = mongoose.Schema
var configDB = require('../../config/config');
var schedulingSchema = mongoose.Schema({
    companyId: { type: String},  // company user Id (id of tenant)
    sectionNames:[{
    	sectionName:{ type: String, default: '' },
    	shiftName:[String],
    }],
    departments:[{
    	departmentName:{ type: String, default: '' },
    	sectionList:[String],
    }],
    sortOrder:[String]
});
// attendanceSchema.index({ companyId: 1, employeeNo: 1, date: 1}); // schema level 
module.exports = mongoose.model('scheduling', schedulingSchema, 'scheduling');
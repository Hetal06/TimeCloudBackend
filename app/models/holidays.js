var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var holidaySchema = mongoose.Schema({
	companyId: { type: String} ,      // company user Id (id of tenant)
    holidayName: { type: String, default: '' }, 
    date:{ type: Date, default: '' }, 
    regions:{ type: String, default: '' }, 
});

holidaySchema.index({ companyId: 1}); // schema level
  
module.exports = mongoose.model('Holidays', holidaySchema, 'holidays');
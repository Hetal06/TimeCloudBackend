var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var customreportsSchema = mongoose.Schema({
	companyId: { type: String},  // company user Id (id of tenant)
	reportData:[{
		reportName:{ type: String}, 
    	active:{ type: Boolean, default: false }, 
    	link:{ type: String}
	}]
    
});

customreportsSchema.index({ companyId: 1}); // schema level
  
module.exports = mongoose.model('Customreports', customreportsSchema, 'customreports');
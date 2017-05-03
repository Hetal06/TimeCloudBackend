var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var standardreportsSchema = mongoose.Schema({
	reportName:{ type: String}, 
	active:{ type: Boolean, default: false }, 
	link:{ type: String}
});
  
module.exports = mongoose.model('Standardreports', standardreportsSchema, 'standardreports');
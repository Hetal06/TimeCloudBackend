var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subDeparmentSchema = mongoose.Schema({
	parentDeptId   : { type: String, default: '' },
	parentDeptName : { type: String, default: '' },
	companyId      : { type: String, default: '' },
	name           : { type: String, default: '' },	
});
  // create the model for users and expose it to our app
module.exports = mongoose.model('subDeparment', subDeparmentSchema, 'subDeparment');

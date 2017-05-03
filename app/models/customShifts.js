var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var customShiftsSchema = mongoose.Schema({
	companyId: { type: String} ,    // company user Id (id of tenant)
	company:{ type: String, default: '' },
	name:{ type: String, default: '' },    
	startTime:{ type : Date, default : '' },
	startLimit:{ type: Boolean, default: false },
	finishTime:{ type : Date, default : '' },
	finishLimit:{ type: Boolean, default: false },
	ordinarytime:{ type: String, default: '' },
	overTime1:{ type: String, default: '' },
	overTime2:{ type: String, default: '' },
	breakTime:{ type: String, default: '' },
	breakAfter:{ type: String, default: '' },
	breakTime2:{ type: String, default: '' },
	breakAfter2:{ type: String, default: '' },
	breakIn:{ type: Boolean, default: false },
	breakIn2:{ type: Boolean, default: false },
	color:{ type: String, default: '' },
	allowance:[{
		name: String, 
		active:{ type: Boolean, default: true },  
		payAfter:{ type: String, default: '' },
	}],	
	shiftorder:{ type: Number, default: 0 },
	timeZones:[{            
		name: { type: String, default: '' }, 
		startTime:{ type: String, default: '' },
		finishTime:{ type: String, default: '' },
		payPeriod:{ type: String, default: '' },
		zoneName:{ type: String, default: '' },
	}],
	tags: [String],
});

customShiftsSchema.index({ companyId: 1}); // schema level

module.exports = mongoose.model('customShifts', customShiftsSchema, 'customShifts');
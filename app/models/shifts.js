var mongoose = require('mongoose')
	, Schema = mongoose.Schema

	var shiftsSchema = mongoose.Schema({
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
		allowance:[{            
			name: String, 
			active:{ type: Boolean, default: true },  
			payAfter:{ type: String, default: '' },
		}],
		color:{ type: String, default: '' },
		allowDelete:{type:Boolean,default:false},
		shiftorder:{ type: Number, default: 0 }, //shift order
		timeZones:[{            
			name: { type: String, default: '' }, 
			startTime:{ type: String, default: '' },
			finishTime:{ type: String, default: '' },
			payPeriod:{ type: String, default: '' },
			zoneName:{ type: String, default: '' },
		}],
		tags: [String]
});

shiftsSchema.index({companyId:1}); // schema level
	
module.exports = mongoose.model('Shifts', shiftsSchema, 'shifts');
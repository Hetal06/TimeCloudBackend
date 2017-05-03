var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var meterDashboardSchema = mongoose.Schema({
	companyId: { type: String},  // company user Id (id of tenant)
	companyName:{ type: String, default: '' },    
	workedHours:{ type: String, default: '00:00:00' },
	allocatedHours:{ type: String, default: '00:00:00' },
	percentageUsed:{ type: String, default: '0' },
	moneySpent:{ type: String, default: '0' },
	budgetedSales :{ type: String, default: '0' },
	actualSales :{ type: String, default: '0' },
	budgetedWages :{ type: String, default: '0' },
	date:{type:String},
	departments: [{        
		departmentId :{ type: String, default: '' },
		departmentName :{ type: String, default: '' },
		workedHours:{ type: String, default: '00:00:00' },
		allocatedHours:{ type: String, default: '00:00:00' },
		percentageUsed:{ type: String, default: '0' },
		moneySpent:{ type: String, default: '0' },
		emailStatus:{ type: String, default: '' },
		budgetedSales :{ type: String, default: '0' },
		budgetedWages :{ type: String, default: '0' },
		actualSales :{ type: String, default: '0' },
	}], 
	calfalg:{ type: Boolean, default: false },
	currentDayCal:{ type: Boolean, default: false },
	emailStatus:{ type: String, default: '' }
});

meterDashboardSchema.index({ companyId: 1}); // schema level
  
module.exports = mongoose.model('meterDashboard', meterDashboardSchema, 'meterDashboard');
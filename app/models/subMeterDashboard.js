var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var subMeterDashboardSchema = mongoose.Schema({
	companyId: { type: String},  // company user Id (id of tenant)
	date:{type:String},
	subDepartments: [{        
		departmentId :{ type: String, default: '' },
		parentDeptName:{ type: String, default: '' },
		subDeptId : { type: String, default: '' },
		subDeptName : { type: String, default: '' },
		workedHours:{ type: String, default: '00:00:00' },
		allocatedHours:{ type: String, default: '00:00:00' },
		percentageUsed:{ type: String, default: '0' },
		moneySpent:{ type: String, default: '0' },
		emailStatus:{ type: String, default: '' },
		budgetedSales :{ type: String, default: '0' },
		budgetedWages :{ type: String, default: '0' },
		actualSales :{ type: String, default: '0' },
	}], 
});

subMeterDashboardSchema.index({ companyId: 1,date:1}); // schema level
  
module.exports = mongoose.model('subMeterDashboard', subMeterDashboardSchema, 'subMeterDashboard');
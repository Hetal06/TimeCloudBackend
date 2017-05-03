var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var subDashboardSchema = mongoose.Schema({
	companyId: { type: String},  // company user Id (id of tenant)    
	weekStart:{ type: String, default: '' },
	weekEnd:{ type: String, default: '' },    
	subDepartments: [{
		departmentId :{ type: String, default: '' },
		parentDeptName:{ type: String, default: '' },
		subDeptId : { type: String, default: '' },
		subDeptName : { type: String, default: '' },
		workedHours : { type: String, default: '00:00:00' },
		allocatedHours : { type: String, default: '' },
		percentageUsed : { type: String, default: '0' },
		moneySpent : { type: String, default: '0' },
		emailStatus : { type: String, default: '' },
		budgetedSales : { type: String, default: '0' },
		budgetedWages : { type: String, default: '0' },
		actualSales : { type: String, default: '0' },
	}],
	// subCalFlag:{ type: Boolean, default: false },
});

subDashboardSchema.index({companyId: 1,weekStart:1}); // schema level
  
module.exports = mongoose.model('subDashboard', subDashboardSchema, 'subDashboard');
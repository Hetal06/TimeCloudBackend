var mongoose = require('mongoose');
var employeeNumbersSchema = mongoose.Schema({  
    employeeNo :{type: Number},
    usedEmployeeNo:{ type: Boolean, default: false }, 
});

employeeNumbersSchema.index({employeeNo:1, usedEmployeeNo: 1}); // schema level
module.exports = mongoose.model('employeeNumbers', employeeNumbersSchema, 'employeeNumbers');

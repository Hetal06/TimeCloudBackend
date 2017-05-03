var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt   = require('bcrypt-nodejs');
 

var employeeSchema = mongoose.Schema({  
    employeeNo :{type: Number},   
    oldEmployeeNo:{type: Number, default: ''},
    companyId: { type: String}, // company user Id(id of the tenant)
    firstName : { type: String, default: '' },
    lastName : { type: String, default: '' },
    administrator:{ type: Boolean, default: false },
    adminType : { type: String, default: '' },
    active:{ type: Boolean, default: true },
    companyname :{ type: String, default: '' },
    password : { type: String, default: '' },
    email:{ type: String, default: '' },
    pin:{ type: Number, default: '' },
    shift:{ type: String, default: '' },
    department : { type: String, default: '' },
    subDepartment : { type: String, default: '' },
    payrollCode: { type: String, default: '' },
    hourlyRate: { type: String, default: '' },
    chargeoutRate: { type: String, default: '' },
    allowExport:{ type: Boolean, default: false },
    job:{ type: String, default: '' },
    taskId:{ type: String, default: '' },
    staffId:{ type: String, default: '' },
    permission: [String],
    readWriteForEmployee:{ type: Boolean, default: false },
    defaultJC:{ type: String, default: '' },
});

employeeSchema.index({active:1, companyId: 1, employeeNo: 1}); // schema level

employeeSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
employeeSchema.methods.validPassword = function(password) {   
    if(this.password){
        return bcrypt.compareSync(password, this.password);
    }else{
        return false;
    }
};
module.exports = mongoose.model('Employee', employeeSchema, 'employee');

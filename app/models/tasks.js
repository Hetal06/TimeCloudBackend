var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var taskSchema = mongoose.Schema({
    companyId: { type: String},  // company user Id (id of tenant)
    companyName :{ type: String, default: '' }, 
    tasks: [{
        taskName : { type: String, default: '' },  
        taskCode : { type: String, default: '' },  
        // nonbillable:{ type: Boolean, default: false }
    }],
});
  
module.exports = mongoose.model('Tasks', taskSchema, 'tasks');
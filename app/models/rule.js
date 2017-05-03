var mongoose = require('mongoose')
  , Schema = mongoose.Schema

 
var ruleSchema = mongoose.Schema({  
    companyId: { type: String} ,    // company user Id (id of tenant)    
    company:{ type: String, default: '' },
    name:{ type: String, default: '' },
    noOfDays:Number,
    ruleStartDate:{ type : Date, default : Date.now },      
    days:[{
    	day:String,
        date:{ type : Date, default : Date.now },  
    	shift:String,
        index:Number
    }] 
});

ruleSchema.index({ companyId: 1}); // schema level

module.exports = mongoose.model('Rule', ruleSchema, 'rule');

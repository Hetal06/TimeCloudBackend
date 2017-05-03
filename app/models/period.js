var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var periodSchema = mongoose.Schema({
    companyId: { type: String, default: '' },
    period: { type: String, default: '' }    
});
  
module.exports = mongoose.model('Period', periodSchema, 'period');
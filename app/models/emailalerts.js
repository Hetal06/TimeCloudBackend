var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var emailalertsSchema = mongoose.Schema({
    companyId    : { type: String},  // company user Id (id of tenant)
    email        : [String],
    emailType    : { type: String, default: '' }
});

// emailalertsSchema.index({ companyId: 1}); // schema level  
module.exports = mongoose.model('emailalerts', emailalertsSchema, 'emailalerts');

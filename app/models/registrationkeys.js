var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var registrationkeySchema = mongoose.Schema({
    key: { type: String, default: '' },
    used: { type: Boolean, default: false }
});
  
module.exports = mongoose.model('Registrationkeys', registrationkeySchema, 'registrationkeys');
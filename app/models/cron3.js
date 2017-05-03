var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var cron3Schema = mongoose.Schema({
    mysql3LastId : { type: Number, default: 0}
});
  
module.exports = mongoose.model('Cron3', cron3Schema, 'cron3');
var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var cron2Schema = mongoose.Schema({
    mysql2LastId : { type: Number, default: 0}
});
  
module.exports = mongoose.model('Cron2', cron2Schema, 'cron2');
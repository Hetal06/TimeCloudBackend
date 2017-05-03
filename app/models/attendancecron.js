var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var attendancecronSchema = mongoose.Schema({
    attendanceLastId: { type: Number, default: 0},    
});
  
module.exports = mongoose.model('Attendancecron', attendancecronSchema, 'Attendancecron');
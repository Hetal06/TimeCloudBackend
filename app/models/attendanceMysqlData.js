var mongoose = require('mongoose')
  , Schema = mongoose.Schema
 
var configDB = require('../../config/config');

var attendanceMysqlSchema = mongoose.Schema({
    employeeNo :{ type: String, default: '' },
    SN:{ type: String, default: '' },
    checkTime:{ type: Date, default:  '' },
    checkType:{ type: String, default: '' },
    verifyCode:{ type: Boolean, default: false }, 
    sensorId:{ type: String, default: '' },
    workCode:{ type: String, default: '' },
    Reserved:{ type: String, default: '' },
    readFlag:{ type: Boolean, default: false },
    latitude:{ type: String, default: '' },
    longitude:{ type: String, default: '' },
    address:{ type: String, default: '' }
});

module.exports = mongoose.model('AttendanceMysql', attendanceMysqlSchema, 'attendanceMysql');

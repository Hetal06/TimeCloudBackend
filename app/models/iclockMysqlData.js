var mongoose = require('mongoose')
  , Schema = mongoose.Schema
 
var configDB = require('../../config/config');

var iclockMysqlSchema = mongoose.Schema({   
    SN:{ type: String, default: '' },
    State:{ type: String, default:  '' },
    LastActivity:{ type: Date, default: '' },   
    TransTimes:{ type: String, default: '' },
    TZAdj:{ type: String, default: '' },
    emailflag:{ type: Boolean, default: false},
    tzAdjmail:{ type: Boolean, default: false},
    Alias:{ type: String, default: ''},
});

module.exports = mongoose.model('IclockMysql', iclockMysqlSchema, 'iclockMysql');

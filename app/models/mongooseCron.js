var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var mongooseCronSchema = mongoose.Schema({   
    mongooseLastId: { type: Number, default: 0}
});
  
module.exports = mongoose.model('mongooseCron', mongooseCronSchema, 'mongooseCron');
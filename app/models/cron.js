var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var cronSchema = mongoose.Schema({
    mysqlLastId: { type: Number, default: 0}
});
  
cronSchema.index({mysqlLastId: 1}); // schema level
module.exports = mongoose.model('Cron', cronSchema, 'cron');
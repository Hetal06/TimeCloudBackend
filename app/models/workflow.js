var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var workflowSchema = mongoose.Schema({
    lastDateSend: { type: Number, default: 0}
});
  
module.exports = mongoose.model('Workflow', workflowSchema, 'workflow');
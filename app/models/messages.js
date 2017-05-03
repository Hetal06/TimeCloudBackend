var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var messageSchema = mongoose.Schema({
    companyId: { type: String} ,      // company user Id (id of tenant)
    subject:{ type: String, default: '' },
    message:{ type: String, default: '' },
    confirmation:{ type: Boolean, default: false }, 
    read:{ type: Boolean, default: false }, 
    instantRead:{ type: Boolean, default: false }, 
    received:{ type: Date, default: '' },
    from:{ type: String, default: 'Super Admin' },
    //companyname :{ type: String, default: '' }
});

messageSchema.index({ companyId: 1}); // schema level

  
module.exports = mongoose.model('Messages', messageSchema, 'messages');
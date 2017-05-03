var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt   = require('bcrypt-nodejs');
 

var SuperAdminSchema = mongoose.Schema({      
    email:{ type: String, default: '' }, 
    password  : { type: String, default: '' },
    password2 : { type: String, default: '' },
    reportIP  : { type: String, default: '' },
});

SuperAdminSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
SuperAdminSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

SuperAdminSchema.methods.validPassword1 = function(password) {
    return bcrypt.compareSync(password, this.password2);
};
module.exports = mongoose.model('SuperAdmin', SuperAdminSchema, 'superAdmin');

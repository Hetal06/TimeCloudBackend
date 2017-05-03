var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var supportVideosSchema = mongoose.Schema({
    companyId: { type: String},  
    loginScreen: [{
        name : { type: String, default: '' },  
        path : { type: String, default: '' },  
    }],
    homeScreen: [{
    	name : { type: String, default: '' },
        path : { type: String, default: '' },   
    }],
    attendanceScreen: [{
    	name : { type: String, default: '' },
        path : { type: String, default: '' },   
    }],
    shiftsScreen: [{
    	name : { type: String, default: '' },
        path : { type: String, default: '' },   
    }],
    reportsScreen: [{
    	name : { type: String, default: '' },
        path : { type: String, default: '' },   
    }],
    settingsScreen: [{
    	name : { type: String, default: '' },  
        path : { type: String, default: '' }, 
    }]
});
  
module.exports = mongoose.model('supportVideos', supportVideosSchema, 'supportVideos');
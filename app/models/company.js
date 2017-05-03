var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

var companySchema = mongoose.Schema({
    companyname: {
        type: String,
        default: ''
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    passcode: [{
        no: {
            type: String,
            default: ''
        },
        clockNotctive: {
            type: Boolean,
            default: false
        },
    }],
    mobile: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    isdepartments: {
        type: Boolean,
        default: false
    },
    departments: [{
        name: {
            type: String,
            default: ''
        },
    }],
    isovertime: {
        type: Boolean,
        default: false
    },
    overtimePeriod: {
        type: String,
        default: ''
    },
    overtimeLevel: {
        type: String,
        default: ''
    },
    WeekdayStart: {
        type: String,
        default: ''
    },
    isallowances: {
        type: Boolean,
        default: false
    },
    allowances: [{
        name: {
            type: String,
            default: ''
        },
    }],
    snFeed: [{
        no: {
            type: String,
            default: ''
        },
    }],
    isrounding: {
        type: Boolean,
        default: false
    },
    rounding: {
        type: String,
        default: ''
    },
    closestMin: {
        type: String,
        default: ''
    },
    roundUpAfter: {
        type: String,
        default: ''
    },
    inRounding: {
        type: String,
        default: ''
    },
    inroundupafter: {
        type: String,
        default: ''
    },
    outRounding: {
        type: String,
        default: ''
    },
    outroundupafter: {
        type: String,
        default: ''
    },
    weeklyNT: {
        type: String,
        default: ''
    },
    weeklyOT1: {
        type: String,
        default: ''
    },
    weeklyOT2: {
        type: String,
        default: ''
    },
    ispayroll: {
        type: Boolean,
        default: false
    },
    payrollSystem: {
        type: String,
        default: ''
    },
    payPeriod: {
        type: String,
        default: ''
    },
    payPeriodStartDate: {
        type: Date,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    countryCode: {
        type: String,
        default: ''
    },
    ischargeOutRate: {
        type: Boolean,
        default: false
    },
    chargeOutRate: {
        type: String,
        default: ''
    },
    isHolidays: {
        type: Boolean,
        default: false
    },
    tooltipDelayTime: {
        type: String,
        default: '500'
    },
    holidayStandardHours: {
        type: String,
        default: ''
    },
    holidaymultiplier: {
        type: String,
        default: ''
    },
    holidayweeklyOtinclude: {
        type: Boolean,
        default: false
    },
    holidayaddToStandardHours: {
        type: Boolean,
        default: false
    },
    payrollCode: {
        type: String,
        default: ''
    },
    jobCosting: {
        type: Boolean,
        default: false
    },
    shiftCutoff: {
        type: Boolean,
        default: false
    },
    shiftCutoffPeriod: {
        type: String,
        default: ''
    },
    lastLoggedin: {
        type: Date,
        default: ''
    },
    isRoster: {
        type: Boolean,
        default: false
    },
    isProject: {
        type: Boolean,
        default: false
    },
    ishourlywage: {
        type: Boolean,
        default: false
    },
    isdashboard: {
        type: Boolean,
        default: false
    },
    versions: {
        type: String,
        default: ''
    },
    holidayDeptWise: {
        type: Boolean,
        default: false
    },
    isReadWrite: {
        type: Boolean,
        default: false
    },
    isSubDepartmentEnable: {
        type: Boolean,
        default: false
    },
    isScheduling: {
        type: Boolean,
        default: false
    },
    isMap: {
        type: Boolean,
        default: false
    },
    isEmpNoNewMode: {
        type: Boolean,
        default: false
    }, //Employee no with 6 digit
    is3GIdMode: {
        type: Boolean,
        default: false
    }, //Employee no with 5 digit
    isAutoTask: {
        type: Boolean,
        default: false
    }, //Task based
    isDepartmentTagsInShift: {
        type: Boolean,
        default: false
    },
    isTimeZoneForShift: {
        type: Boolean,
        default: false
    },
    isSecondBreakInShift: {
        type: Boolean,
        default: false
    },
    zoneTags: [{
        name: {
            type: String,
            default: ''
        },
    }],
    IsUniqueScheduling: {
        type: Boolean,
        default: true
    },
    IsEnableReportSystem1: {
        type: Boolean,
        default: false
    },
    isExceptionTotal: {
        type: Boolean,
        default: false
    },
    manageLeaves: {
        type: Boolean,
        default: false
    },
    manageExceptions: {
        type: Boolean,
        default: false
    },
    daysLimit: {
        type: String,
        default: '60'
    },
    isDefaultJC: {
        type: Boolean,
        default: false
    },
    isSecondTick: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    maxActiveUsers: {
        type: String,
        default: ""
    },
    activeUsers: {
        type: Number
    }
});

// methods ======================
// generating a hash
companySchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
companySchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Company', companySchema, 'company');

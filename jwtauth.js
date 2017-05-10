var jwt = require('jsonwebtoken');
var configDB = require('./config/config');
// console.log("tokenCtrl");
// var globalToken = decoded;
exports.tokenCtrl = function(req,res) {
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, configDB.conn_conf.secret, function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.',
                    data: err
                });
            } else {
                console.log("------\n line 16",decoded);;
                req.user = decoded;
                console.log("------\n line 17",req.user);
                next();
            }
        });
    }
    // console.log("------>\n line 5");
    // var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // if (token) {
    //     // verifies secret and checks exp
    //     console.log("-------\n line 9 if token", token);

    //     jwt.verify(token, configDB.conn_conf.secret, function(err, decoded) {
    //         // console.log("---------\n line 12 decoded", decoded);
    //         console.log("---------\n line 12 err", err);
    //         if (err) { //failed verification.
    //             return res.json({
    //                 "error": true
    //             });
    //         }

    //         req.user = decoded;
    //         console.log("---- line 20");
    //         // return decoded;
    //         next(); //no error, proceed
    //     });
    // } else {
    //     // forbidden without token
    //     // return res.status(403).send({
    //     //     "error": true
    //     // });
    // }
}

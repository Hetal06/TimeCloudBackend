var email   = require("emailjs/email");
var server  = email.server.connect({
    user:    "support@timecloud.co.nz",  //username to connect to your SMTP HOST
    password:"M@nila2015", //M@nila2015 //password to connect to you SMTP HOST
    host:    "smtp.gmail.com", //SMTP HOST to send an email
    ssl:     true,
    port:    465
});

function send_mail(email,subject,body, callback){
    server.send({
        text:   body,
        from:    "barnie@tme.co.nz", // Email address from id
        to:      email, //'bhumixapatel@jacksolutions.biz', // Email address on which request form gets submitted on
        subject: subject,
        attachment:
        [
          {data:body, alternative:true}
        ]
    }, function(err, message) {   
        if(err){   
            console.log(err);         
            callback(false) ;
        }else{
            callback(true) ;
        }
    });

}

function send_mail1(email,subject,body, callback){
    server.send({
        from:    "barnie@tme.co.nz", // Email address from id
        to:      email, //'bhumixapatel@jacksolutions.biz', // Email address on which request form gets submitted on
        subject: subject,
        attachment:
        [
          {data:body, alternative:true}
        ]
    }, function(err, message) {
        console.log(err);
        console.log("message");
        if(err){   
            console.log(err);         
            callback(false) ;
        }else{
            console.log("success...............");
            callback(true) ;
        }
    });

}

module.exports.send_mail1 = send_mail1;
module.exports.send_mail = send_mail;
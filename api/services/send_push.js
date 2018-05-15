var moment = require('moment-timezone');

module.exports = {

    push: function (data, done) {

        var arr_key_data = data.data;
        var token_fcm = data.token_fcm;

        var FCM = require('fcm-node');
        var serverKey = 'AAAAIpsQYfQ:APA91bEPY5WDK_vG040qLZTPckBp0bRmjdjO1yrgV_vF0tiq50-hBMlfSCKOiGAjL8PEzOdx2eLp59EUPFt6y_xEcCsukfRIYbIu4ow48VM5MMAlbwFRu0bO_MFZQ8LCeiRO0kwMAoX6'; //put your server key here
        var fcm = new FCM(serverKey);
        token_fcm.forEach(function (value_fcm, index) {

            var message = {//this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: value_fcm,
                collapse_key: data.collapse_key,

                notification: {
                    title: data.title,
                    body: data.body
                },

                data: data.data
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong: ", err);
//                    return done(null, err);

                } else {
                    console.log("Successfully sent with response: ", response);
//                    return done(null, response);
                }
            });
        });

    },
};
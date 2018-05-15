var moment = require('moment-timezone');

// api/services/authentication_login.js
module.exports = {

    /**
     * check token login on app.
     *
     * @required {String} token_login
     */
    checkToken: function (data, done) {

//        check req token_login
        var token_login = data.token_login;
        var uuid = data.uuid;
        if (!token_login || token_login == '' || !uuid || uuid == '') {
            return done(null, null);
        }
        Users.findOne({select: ['id', 'token_fcm', 'username'], where: {token_login: token_login, uuid: uuid}}, function (err, check_token) {
            if (err) {
                return done(err);
            }
            if (!check_token) {
                return done(null, false);
            } else {
                console.log('♥♥♥♥♥♥♥♥♥♥☻♥♥♥♥♥♥♥♥♥♥');
                console.log(convertDBDatetimeToJSDatetime(new Date));
                console.log(check_token);
                console.log('♥♥♥♥♥♥♥♥♥♥☻♥♥♥♥♥♥♥♥♥♥');
                return done(null, check_token);
            }
            function convertDBDatetimeToJSDatetime(date) {
                return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD HH:mm:ss');
            }
        });
    },
};
const passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        bcrypt = require('bcrypt');
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
    Admin.findOne({id}, function (err, user) {
        cb(err, user);
    });
});
passport.use(new LocalStrategy({
    usernameField: 'account',
    passportField: 'password'
}, function (account, password, cb) {
    Admin.findOne({account: account}, function (err, user) {
        if (err)
            return cb(err);
        if (!user)
            return cb(null, false, {message: 'Account not found'});

        bcrypt.compare(password, user.password, function (err, res) {
            if (!res)
                return cb(null, false, {message: 'Invalid Password'});
            let userDetails = {
                email: user.email,
                username: user.username,
                id: user.id
            };
            return cb(null, userDetails, {message: 'Login Succesful'});
        });
    })
}));
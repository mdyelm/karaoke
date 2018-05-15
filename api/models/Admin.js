/**
 * Admin.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');

module.exports = {

    attributes: {

        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            required: true,
            type: 'email',
//            unique: true
        },
        account: {
            required: true,
            type: 'string',
            unique: true
        },
        username: {
            required: true,
            type: 'string',
//            unique: true
        },
        password: {
            required: true,
            type: 'string',
        },
        role: {
            type: 'integer',
            required: true,
            size: 2
        },
        image: {
            type: 'string',
            required: true
        },
    },
    customToJSON: function () {
        return _.omit(this, ['password'])
    },
    beforeCreate: function (user, cb) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    cb(err);
                } else {
                    user.password = hash;
                    cb();
                }
            });
        });
    },
    validationMessages: {
        account: {
            required: '入力して下さい。',
            unique: 'アカウントは既に存在します。',
        },
        username: {
            required: '入力して下さい。',
        },
        email: {
            required: '入力して下さい。',
        },
        password: {
            required: '入力して下さい。',
        },
        image: {
            required: '入力して下さい。',
        },
    },
};


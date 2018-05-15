/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');
module.exports = {
    types: {
        confirmpassword: function (password) {
            return password === this.password_conf;
        },
        check_reg_normal: function (login_account) {
            if ((!this.login_account || this.login_account == '' || this.login_account == 'undefine')) {
                return false;
            } else {
                return true;
            }
        },
    },
    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
        },
        hash: {
            type: 'string',
            unique: true
        },
        login_account: {
            type: 'string',
//            check_reg_normal: true,
//            unique: true,
//            required: true,
        },
        facebook_id: {
            type: 'string',
            unique: true
        },
        google_id: {
            type: 'string',
            unique: true
        },
        yahoo_id: {
            type: 'string',
            unique: true
        },
        avatar: {
            type: 'string'
        },
        uuid: {
            type: 'string',
            unique: true,
            required: true,
        },
        username: {
            type: 'string',
            size: 50,
            minLength: 6,
            maxLength: 30,
            required: true,
//            checkexist: true,
        },
        password: {
            type: 'string',
            minLength: 6,
            maxLength: 16,
            confirmpassword: true,
            required: true
        },
        city: {
            type: 'string',
            size: 50,
        },
        age: {
            type: 'integer',
            size: 50,
        },
        sex: {
            type: 'string',
            size: 11,
        },
        intro: {
            type: 'string',
        },
        year_of_birth: {
            type: 'string',
        },
        token_login: {
            type: 'string',
            unique: true
        },
        token_fcm: {
            type: 'string',
            unique: true
        },
        relationship: {
            collection: 'Relationships',
            via: 'user_two_id'
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
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
        login_account: {
            check_reg_normal: '入力して下さい。',
            required: '入力して下さい。',
        },
        facebook_id: {
            unique: 'facebookはもう存在しました。',
        },
        google_id: {
            unique: 'googleはもう存在しました。',
        },
        yahoo_id: {
            unique: 'yahooはもう存在しました。',
        },
        token_login: {
            unique: '入力して下さい。',
        },
        uuid: {
            type: '入力して下さい。',
            required: '入力して下さい。',
            unique: 'uuidはもう存在しました。',
        },
        username: {
            minLength: '6文字から30文字以内半角英数字のみ。',
            maxLength: '6文字から30文字以内半角英数字のみ。',
            required: '入力して下さい。',
            type: '文字列を入力。',
        },
        password: {
            minLength: '6文字から16文字以内半角英数字のみ。',
            maxLength: '6文字から16文字以内半角英数字のみ。',
            required: '入力して下さい。',
            confirmpassword: '確認用パスワードに誤りがあります。'
        },
    },

}
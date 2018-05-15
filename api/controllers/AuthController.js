/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const passport = require('passport');
var consts = require('../services/const');
var log = require('../services/log');

module.exports = {

    register: function (req, res) {
        var e_img = new Promise((resolve, reject) => {
            req.file('image').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/admins'
            }, function (err, data_img) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_img.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'image'});
                    } else {
                        resolve({status: true, data: data_img});
                    }
                }

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Auth',
                action: 'register',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        Promise.all([e_img]).then(values => {
            return {data: values}
        }).then(function (results) {
            var data_song, file_name_img;
            if (results.data[0].data != null) {
                data_song = results.data[0].data;
                var arr_img = data_song[0].fd.split("/");
                file_name_img = '' + arr_img.slice(-1).pop();
            }
            //  save data
            Admin.create({
                account: req.body.account,
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                image: file_name_img,
                role: req.body.role
            }).exec(function (err, file) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    if (obj.error == "E_VALIDATION") {
                        return res.json({
                            status: 400,
                            data: obj.Errors
                        });
                    } else {
                        //save log
                        log.save({
                            controller: 'Auth',
                            action: 'register',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        })
                        return res.json({
                            status: 404,
                            message: 'error',
                            data: consts.apiServer
                        });
                    }
                } else {
                    return res.json({
                        status: 200,
                        data: file
                    });
                }
            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Auth',
                action: 'register',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 404,
                message: 'error',
                data: consts.apiServer
            });
        });

    },
    login: function (req, res) {
        passport.authenticate('local', function (err, user, info) {
            if ((err) || (!user)) {
                return res.view('auth/login', {
                    status: 401,
                    datas: info,
                    data_p: req.body,
                    message: 'tài khoản hoặc mật khẩu chưa đúng'
                })
            }
            req.logIn(user, function (err) {
                if (err)
                    res.send(err);
                return res.redirect('/admin/home');
            });
        })(req, res);
    },
    logout: function (req, res) {
        req.logout();
        res.redirect('auth/login');
    },
};


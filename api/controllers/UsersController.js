/**
 * UsersController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var auth_login = require('../services/auth_login');
var Q = require('q');
var fs = require('fs');
var consts = require('../services/const');
var moment = require('moment-timezone');
var send_push = require('../services/send_push');
var log = require('../services/log');
var async = require('async');

module.exports = {
    /**
     * login normal
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    login: function (req, res) {

        try {
            var login_account = req.body.login_account;
            var password = req.body.password;
            var uuid = req.body.uuid;
            Users.findOne({login_account: login_account, uuid: uuid}, function (err, user) {
                if (err) {
                    //save log
                    log.save({
                        controller: 'Auth',
                        action: 'login',
                        data: req.body
                    }, {error: err}
                    , function (e) {
                        console.log(e || "save log!");
                    })
                    return res.json({
                        code: 4,
                        message: consts.apiServer
                    });
                }
                if (!user) {
                    //                return done(null, false, {message: 'tài khoản chưa đúng.'});
                    return res.json({
                        code: 0,
                        message: 'error',
                        data: {message: consts.loginUserPass},
                    });
                }
                /**
                 * pw encryption, and check pw
                 */
                bcrypt.compare(req.body.password, user.password, (err, valid) => {
                    if (!valid) {
                        return res.status(404).json({
                            code: 0,
                            message: 'error',
                            data: {message: consts.loginUserPass},
                        });
                    }

                    //                update token_login for user
                    var getToken = randomstring.generate();
                    Users.update({id: user.id}, {token_login: getToken}).exec(function (err, update) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Auth',
                                action: 'login',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }
                        if (update) {
                            var dataUser = update.pop().toJSON();
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: dataUser
                            });
                        }
                    })
                });
            });
        } catch (e) {
            //save log
            log.save({
                controller: 'Auth',
                action: 'login',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * login google facebook yahoo
     * @param {type} req
     * @param {type} res
     * @param {type} next
     * @returns {string}
     */
    loginOther: function (req, res, next) {
        try {
            //        console.log(req.body);

            var login_account = req.body.login_account1;
            var facebook_id = req.body.facebook_id;
            var google_id = req.body.google_id;
            var yahoo_id = req.body.yahoo_id;
            var username = req.body.username;
            var uuid = req.body.uuid;
            /**
             * check uuid
             */
            Users.findOne({uuid: uuid}, function (err, user) {
                if (err) {
                    //save log
                    log.save({
                        controller: 'Auth',
                        action: 'loginOther',
                        data: req.body
                    }, {error: err}
                    , function (e) {
                        console.log(e || "save log!");
                    })
                    return console.log(err)

                }
                // uuid not exist
                if (!user) {
                    /**
                     * start
                     */
                    upload_avatar().then(function (data) {
                        // This function will be called after upload_avatar() will be executed. 
                        if (data.type == true) {
                            // if upload true call create_user()
                            create_user(data.path).then(function (data_create) {
                                if (data_create.type == true) {
                                    create_category(data_create.data.id).then(function (data_cate) {
                                        if (data_cate.type == true) {
                                            return res.json({
                                                code: 1,
                                                message: 'success',
                                                data: data_create.data
                                            });
                                        } else if (data_cate.type == false) {
                                            return res.json({
                                                code: 0,
                                                message: 'error',
                                                data: data_cate.data
                                            });
                                        }

                                    }).catch(function (err) {
                                        //save log
                                        log.save({
                                            controller: 'Auth',
                                            action: 'loginOther',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        });
                                    });
                                } else if (data_create.type == false) {
                                    var msg_error;
                                    try {
                                        var cnt = 0;
                                        async.forEachOf(data_create.data, function (value, key) {
                                            if (cnt < 1) {
                                                msg_error = value[0].message;
                                            }
                                            cnt++;
                                        }, function (err) {
                                            if (err) {
                                                console.log("Error: " + err);
                                            } else {
                                            }
                                        });
                                        return res.json({
                                            code: 0,
                                            message: 'error',
                                            data: {message: msg_error}
                                        });
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Users',
                                            action: 'loginOther',
                                            data: req.body
                                        }, {error: e}
                                        , function (err) {
                                            console.log(err || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            data: consts.apiServer
                                        });

                                    }
                                }

                            }).catch(function (err) {
                                //save log
                                log.save({
                                    controller: 'Auth',
                                    action: 'loginOther',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return res.json({
                                    code: 4,
                                    message: consts.apiServer
                                });
                            });
                        } else if (data.type == false && data.img_type == false) {
                            return res.json({
                                code: 0,
                                message: 'error',
                                avatar: consts.uploadIm
                            });
                        } else if (data.type == false && data.img_type == true) {
                            create_user(data.path).then(function (data_create) {
                                if (data_create.type == true) {
                                    create_category(data_create.data.id).then(function (data_cate) {
                                        if (data_cate.type == true) {
                                            return res.json({
                                                code: 1,
                                                message: 'success',
                                                data: data_create.data
                                            });
                                        } else if (data_cate.type == false) {
                                            return res.json({
                                                code: 0,
                                                message: 'error',
                                                data: data_cate.data
                                            });
                                        }

                                    }).catch(function (err) {
                                        //save log
                                        log.save({
                                            controller: 'Auth',
                                            action: 'loginOther',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        });
                                    });
                                } else if (data_create.type == false) {
                                    var msg_error;
                                    try {
                                        var cnt = 0;
                                        async.forEachOf(data_create.data, function (value, key) {
                                            if (cnt < 1) {
                                                msg_error = value[0].message;
                                            }
                                            cnt++;
                                        }, function (err) {
                                            if (err) {
                                                console.log("Error: " + err);
                                            } else {
                                            }
                                        });
                                        return res.json({
                                            code: 0,
                                            message: 'error',
                                            data: {message: msg_error}
                                        });
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Users',
                                            action: 'loginOther',
                                            data: req.body
                                        }, {error: e}
                                        , function (err) {
                                            console.log(err || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            data: consts.apiServer
                                        });

                                    }
                                }

                            }).catch(function (err) {
                                //save log
                                log.save({
                                    controller: 'Auth',
                                    action: 'loginOther',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return res.json({
                                    code: 4,
                                    message: consts.apiServer
                                });
                            });
                        }

                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Auth',
                            action: 'loginOther',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        })
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                    /**
                     * upload avatar user
                     * @returns {.Q@call;defer.promise}
                     */
                    function upload_avatar() {
                        var deferred = Q.defer();
                        var avatar;
                        req.file('avatar') // this is the name of the file in your multipart form
                                .upload({
                                    // optional
                                    // dirname: [SOME PATH TO SAVE IN A CUSTOM DIRECTORY]
                                    //                                    maxBytes: 4194304,
                                    maxBytes: 41943040000,
                                    dirname: '../../assets/avatar',
                                }, function (err, uploads) {
                                    // try to always handle errors
                                    if (err) {
                                        deferred.resolve({type: false, path: null, img_type: false});
                                    }
                                    //                             uploads is an array of files uploaded 
                                    //                             so remember to expect an array object
                                    else if (uploads.length === 0) {
                                        deferred.resolve({type: false, path: null, img_type: true});
                                    } else {
                                        if (uploads[0].type != 'image/jpeg' && uploads[0].type != 'image/png' && uploads[0].type != 'application/octet-stream') {
                                            fs.readFile(uploads[0].fd, function () {
                                                fs.unlink(uploads[0].fd, function (err) {
                                                    console.log(err);
                                                });
                                            });
                                            deferred.resolve({type: false, path: null, img_type: false});
                                        } else {
                                            var str = uploads[0].fd;
                                            var arr = str.split("/");
                                            avatar = 'http://karaoke.brite.vn/avatar/' + arr.slice(-1).pop();
                                            deferred.resolve({type: true, path: avatar});
                                        }
                                    }
                                })
                        return deferred.promise;
                    }
                    /**
                     * save data
                     * @param {type} avatar
                     * @returns {.Q@call;defer.promise}
                     */
                    function create_user(avatar) {
                        var deferred = Q.defer();
                        var data_create;
                        //                  get token
                        var getToken = randomstring.generate();
                        //                  get hash
                        shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        hash = shasum.digest('hex');
                        if (avatar == null) {
                            data_create = {
                                login_account: login_account,
                                username: username,
                                password: '123456',
                                password_conf: '123456',
                                facebook_id: facebook_id,
                                google_id: google_id,
                                yahoo_id: yahoo_id,
                                uuid: uuid,
                                token_login: getToken,
                                avatar: null,
                                hash: hash
                            }
                        } else {
                            data_create = {
                                login_account: login_account,
                                username: username,
                                password: '123456',
                                password_conf: '123456',
                                facebook_id: facebook_id,
                                google_id: google_id,
                                yahoo_id: yahoo_id,
                                uuid: uuid,
                                token_login: getToken,
                                avatar: avatar,
                                hash: hash
                            }
                        }
                        Users.create(data_create).exec(function (err, register) {
                            if (err) {
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    if (obj.Errors.hash) {
                                        create_user(avatar);
                                    }
                                    deferred.resolve({type: false, data: obj.Errors});
                                } else {
                                    //save log
                                    log.save({
                                        controller: 'Auth',
                                        action: 'loginOther',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return console.log(err)
                                }
                            }
                            if (register) {
                                deferred.resolve({type: true, data: register});
                            }
                        });
                        return deferred.promise;
                    }

                    /**
                     * create category for user
                     * @param {type} user_id
                     * @returns {.Q@call;defer.promise}
                     */
                    function create_category(user_id) {
                        var deferred = Q.defer();
                        for (var i = 1; i <= 8; i++) {
                            Categories.create({
                                user_id: user_id,
                                c_number: i,
                                c_name: 'リスト' + i,
                            }).exec(function (err, cate) {
                                if (err) {
                                    var errorValidate = JSON.stringify(err);
                                    obj = JSON.parse(errorValidate);
                                    if (obj.error == "E_VALIDATION") {
                                        deferred.resolve({type: false, data: obj.Errors});
                                    } else {
                                        //save log
                                        log.save({
                                            controller: 'Auth',
                                            action: 'loginOther',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return console.log(err)
                                    }
                                }
                                if (cate) {
                                    deferred.resolve({type: true, data: cate});
                                }
                            });
                        }
                        return deferred.promise;
                    }


                } else { // uuid exist
                    //                check fb yh gg
                    if (user.facebook_id && facebook_id) {
                        if (facebook_id != user.facebook_id) {
                            return res.json({
                                code: 0,
                                message: consts.loginFacebookId
                            });
                        }

                    } else if (user.google_id && google_id) {
                        if (google_id != user.google_id) {
                            return res.json({
                                code: 0,
                                message: consts.loginGoogleId
                            });
                        }
                    } else if (user.yahoo_id && yahoo_id) {
                        if (yahoo_id != user.yahoo_id) {
                            return res.json({
                                code: 0,
                                message: consts.loginYahooId
                            });
                        }
                    }
                    // update fb yh gg
                    var getToken = randomstring.generate();
                    var update_type_id;
                    if (facebook_id) {
                        update_type_id = {token_login: getToken, facebook_id: facebook_id};
                    } else if (google_id) {
                        update_type_id = {token_login: getToken, google_id: google_id};
                    } else if (yahoo_id) {
                        update_type_id = {token_login: getToken, yahoo_id: yahoo_id};
                    }
                    Users.update(
                            {id: user.id},
                            update_type_id
                            ).exec(function (err, update) {
                        if (err) {
                            var errorValidate = JSON.stringify(err);
                            obj = JSON.parse(errorValidate);
                            if (obj.error == "E_VALIDATION") {
                                var msg_error;
                                try {
                                    var cnt = 0;
                                    async.forEachOf(obj.Errors, function (value, key) {
                                        if (cnt < 1) {
                                            msg_error = value[0].message;
                                        }
                                        cnt++;
                                    }, function (err) {
                                        if (err) {
                                            console.log("Error: " + err);
                                        } else {
                                        }
                                    });
                                    return res.json({
                                        code: 0,
                                        message: 'error',
                                        data: {message: msg_error}
                                    });
                                } catch (e) {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'loginOther',
                                        data: req.body
                                    }, {error: e}
                                    , function (err) {
                                        console.log(err || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        data: consts.apiServer
                                    });

                                }
                            } else {
                                //save log
                                log.save({
                                    controller: 'Auth',
                                    action: 'loginOther',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return console.log(err);

                            }
                        }
                        if (update) {
                            var dataUser = update.pop().toJSON();
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: dataUser
                            });
                        }
                    })
                }
            })
        } catch (e) {
            //save log
            log.save({
                controller: 'Auth',
                action: 'loginOther',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }


    },
    /**
     * update token_fcm for user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    fcm: function (req, res) {
        try {
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var token_fcm;
                    token_fcm = req.body.token_fcm;
                    try {
                        Users.update({id: user.id}, {token_fcm: token_fcm}).exec(function (err, update) {
                            if (err) {
                                //save log
                                log.save({
                                    controller: 'Auth',
                                    action: 'checkLogin',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return res.json({
                                    code: 4,
                                    message: consts.apiServer
                                });
                            }
                            return res.json({
                                code: 1,
                                mesage: 'success',
                            });

                        });
                    } catch (e) {
                        //save log
                        log.save({
                            controller: 'Auth',
                            action: 'fcm',
                            data: req.body
                        }, {error: e}
                        , function (err) {
                            console.log(err || "save log!");
                        })
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    }
                }
            })
        } catch (e) {
            //save log
            log.save({
                controller: 'Auth',
                action: 'fcm',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }

    },
    checkLogin: function (req, res) {
        try {
            var token_login = req.body.token_login;
            var uuid = req.body.uuid;

            Users.findOne({select: ['id', 'token_fcm', 'username', 'avatar', 'username', 'city', 'age', 'sex', 'intro', 'year_of_birth'], where: {token_login: token_login, uuid: uuid}}, function (err, data) {
                if (err) {
                    //save log
                    log.save({
                        controller: 'Auth',
                        action: 'checkLogin',
                        data: req.body
                    }, {error: err}
                    , function (e) {
                        console.log(e || "save log!");
                    })
                    return res.json({
                        code: 4,
                        message: consts.apiServer
                    });
                }
                if (!data) {
                    return res.json({
                        code: 0,
                        message: 'error',
                        data: consts.uuidOrToken
                    });
                } else {
                    return res.json({
                        code: 1,
                        message: 'success',
                        data: data
                    });
                }

            });
        } catch (e) {
            //save log
            log.save({
                controller: 'Auth',
                action: 'checkLogin',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }

    },
    /**
     * register user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    register: function (req, res) {
        try {

//        console.log(req.body);
            var username = req.body.username;
            var password = req.body.password;
            var password_conf = req.body.password_conf;
            var city = req.body.city;
            var login_account = req.body.login_account;
            var uuid = req.body.uuid;

            /**
             * start
             */

            create_user().then(function (data) {
// This function will be called after create_user() will be executed.
                if (data.type == true) {
                    create_category(data.data.id).then(function (data_cate) {
                        if (data_cate.type == true) {
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: data.data
                            });
                        } else if (data_cate.type == false) {
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: data_cate.data
                            });
                        }
                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Users',
                            action: 'register',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        })
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                } else if (data.type == false) {
                    var msg_error;
                    try {
                        var cnt = 0;
                        async.forEachOf(data.data, function (value, key) {
                            if (cnt < 1) {
                                msg_error = value[0].message;
                            }
                            cnt++;
                        }, function (err) {
                            if (err) {
                                console.log("Error: " + err);
                            } else {
                            }
                        });
                        return res.json({
                            code: 0,
                            message: 'error',
                            data: {message: msg_error}
                        });
                    } catch (e) {
                        //save log
                        log.save({
                            controller: 'Users',
                            action: 'register',
                            data: req.body
                        }, {error: e}
                        , function (err) {
                            console.log(err || "save log!");
                        })
                        return res.json({
                            code: 4,
                            data: consts.apiServer
                        });

                    }

                }

            }).catch(function (err) {
                //save log
                log.save({
                    controller: 'Users',
                    action: 'register',
                    data: req.body
                }, {error: err}
                , function (e) {
                    console.log(e || "save log!");
                })
                return res.json({
                    code: 4,
                    message: consts.apiServer
                });
            });
            /**
             * save data
             * @returns {.Q@call;defer.promise}
             */
            function create_user() {
                //                get hash
                var deferred = Q.defer();
                var shasum = crypto.createHash('sha1');
                shasum.update(new Date().toJSON());
                hash = shasum.digest('hex');
                Users.create({
                    login_account: login_account,
                    username: username,
                    password: password,
                    password_conf: password_conf,
                    city: city,
                    uuid: uuid,
                    hash: hash
                }).exec(function (err, register) {
                    if (err) {
                        var errorValidate = JSON.stringify(err);
                        obj = JSON.parse(errorValidate);
                        if (obj.error == "E_VALIDATION") {
                            if (obj.Errors.hash) {
                                create_user();
                            }
                            deferred.resolve({type: false, data: obj.Errors});
                        } else {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'register',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return console.log(err)
                        }
                    }
                    if (register) {
                        deferred.resolve({type: true, data: register});
                    }
                });
                return deferred.promise;
            }

            /**
             * create list category for user
             * @param {type} user_id
             * @returns {.Q@call;defer.promise}
             */

            function create_category(user_id) {
                var deferred = Q.defer();
                for (var i = 1; i <= 8; i++) {
                    Categories.create({
                        user_id: user_id,
                        c_number: i,
                        c_name: 'リスト' + i,
                    }).exec(function (err, cate) {
                        if (err) {
                            var errorValidate = JSON.stringify(err);
                            obj = JSON.parse(errorValidate);
                            if (obj.error == "E_VALIDATION") {
                                deferred.resolve({type: false, data: obj.Errors});
                            } else {
                                //save log
                                log.save({
                                    controller: 'Users',
                                    action: 'register',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return console.log(err)
                            }
                        }
                        if (cate) {
                            deferred.resolve({type: true, data: cate});
                        }
                    });
                }
                return deferred.promise;
            }

        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'register',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }

    },
    /**
     * edit profile
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    editUser: function (req, res) {

        try {

            var city = req.body.city;
            var username = req.body.username;
            var intro = req.body.intro;
            var sex = req.body.sex;
            var age = req.body.age;
            /**
             * check login
             */

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {

                    /**
                     * start
                     */

                    upload_avatar().then(function (data) {
                        // This function will be called after upload_avatar() will be executed.
                        if (data.type == true) {
                            update_user(data.path, true)
                        } else if (data.type == false && data.img_type == false) {
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: consts.uploadImg
                            });
                        } else {
                            update_user(data.path, false)
                        }
                    }).catch(function (err) {
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                    /**
                     * update data user
                     */
                    function update_user(path_image, status) {
                        var data_update;
                        if (age) {
                            var curr = new Date;
                            var year_of_birth = curr.getFullYear() - age;
                            console.log('5465456');
                        }
                        if (status == true) {
                            data_update = {city: city, username: username, sex: sex, intro: intro, age: age, year_of_birth, avatar: path_image}
                        } else {
                            data_update = {city: city, username: username, sex: sex, intro: intro, age: age, year_of_birth}
                        }
                        Users.update({id: user.id}, data_update).exec(function (err, update) {
                            if (err) {
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    return res.json({
                                        code: 0,
                                        message: 'error',
                                        data: obj.Errors
                                    });
                                } else {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'editUser',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return console.log(err)
                                }
                            }
                            if (update) {
                                var dataUser = update.pop().toJSON();
                                return res.json({
                                    code: 1,
                                    message: 'success',
                                    data: dataUser
                                });
                            }
                        })
                    }
                    /**
                     * upload file avatar
                     * @returns {.Q@call;defer.promise}
                     */

                    function upload_avatar() {
                        var deferred = Q.defer();
                        var path_avatar;
                        req.file('avatar').upload({
//                            maxBytes: 4194304,
                            maxBytes: 41943040000,
                            dirname: '../../assets/avatar'
                        }, function (err, uploadedIcon) {
                            if (err) {
                                deferred.resolve({type: false, path: null, img_type: false});
                            } else if (uploadedIcon.length === 0) {
                                deferred.resolve({type: false, path: null, img_type: true});
                            } else {
                                if (uploadedIcon[0].type != 'image/jpeg' && uploadedIcon[0].type != 'image/png' && uploadedIcon[0].type != 'application/octet-stream') {
                                    fs.readFile(uploadedIcon[0].fd, function () {
                                        fs.unlink(uploadedIcon[0].fd, function (err) {
                                            console.log(err);
                                        });
                                    });
                                    deferred.resolve({type: false, path: null, img_type: false});
                                } else {
                                    var arr_avatar = uploadedIcon[0].fd.split("/");
//                    file_name = sails.getBaseUrl() + '/songs/' + arr_song[1];
                                    path_avatar = 'http://karaoke.brite.vn/avatar/' + arr_avatar.slice(-1).pop();
                                    deferred.resolve({type: true, path: path_avatar});
                                }
                            }
                        })
                        return deferred.promise;
                    }



//
                }
            });
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'editUser',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     *  search list user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    searchAllUser: function (req, res) {
        try {
            /**
             * check login
             */

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {

                    var page, offset, limit;
                    limit = 10;
                    page = req.body.page;
                    if (!req.body.page || req.body.page == 0 || req.body.page == 1) {
                        page = 1;
                        offset = 0;
                    } else {
                        offset = (page - 1) * 10;
                    }
                    var s_name = '';
                    if (req.body.name) {
                        s_name = req.body.name;
                    }
                    var sql = "SELECT u.id, u.hash, u.username, u.city, u.avatar, u.createdAt, r.status, r.action_user_id FROM users u left join relationships r on (";
                    sql += "u.id = r.user_one_id and " + user.id + " = r.user_two_id or ";
                    sql += user.id + " = r.user_one_id and u.id = r.user_two_id)";
                    sql += "WHERE u.id != " + user.id + " AND (r.status != 1 or r.status IS NULL) AND u.username LIKE " + "'%" + s_name + "%'";
                    sql += " ORDER BY u.createdAt asc LIMIT " + limit + " OFFSET " + offset;
                    Users.query(sql, function (err, data_user) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'searchAllUser',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }
                        if (!data_user) {
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: null
                            });
                        } else {
                            try {
                                // An array to store all the final user objects
                                var assignedArray = [];
                                for (index in data_user) {
                                    var myObj = {}, key, value;
                                    myObj['id'] = data_user[index].id;
                                    myObj['username'] = data_user[index].username;
                                    myObj['hash'] = data_user[index].hash;
                                    myObj['city'] = data_user[index].city;
                                    myObj['avatar'] = data_user[index].avatar;
                                    if (data_user[index].status == null) {
                                        myObj['status'] = 6;
                                    } else if (data_user[index].status == 0) {
                                        if (data_user[index].action_user_id == user.id) {
                                            myObj['status'] = 8;
                                        } else {
                                            myObj['status'] = 9;
                                        }

                                    } else {
                                        myObj['status'] = data_user[index].status;
                                    }
                                    myObj['action_user_id'] = data_user[index].action_user_id;
                                    myObj['createdAt'] = data_user[index].createdAt;
                                    // Adding the object to the main array
                                    assignedArray.push(myObj);
                                }
                                return res.json({
                                    code: 1,
                                    message: 'success',
                                    data: assignedArray
                                });
                            } catch (err) {
                                //save log
                                log.save({
                                    controller: 'Users',
                                    action: 'searchAllUser',
                                    message: 'searchAllUser assignedArray for',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return res.json({
                                    code: 4,
                                    message: consts.apiServer
                                });
                            }
                        }
                    })

                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'searchAllUser',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * get list Friend
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listFriend: function (req, res) {
        try {
            /**
             * check login
             */

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {

                    /**
                     * start
                     */
                    get_list_friend().then(function (data_friend) {
//                    console.log(data_friend);
                        if (data_friend.type == true) {
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: data_friend.data
                            });
                        } else {
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }
                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Users',
                            action: 'listFriend',
                            message: 'get_friend_id',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        });
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                    /**
                     * find data by user.id
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_list_friend() {
                        var page, offset, limit;
                        limit = 10;
                        page = req.body.page;
                        if (!req.body.page || req.body.page == 0 || req.body.page == 1) {
                            page = 1;
                            offset = 0;
                        } else {
                            offset = (page - 1) * 10;
                        }
                        var s_name = '';
                        if (req.body.name) {
                            s_name = req.body.name;
                        }
                        var deferred = Q.defer();
                        var sql = "SELECT u.id, u.username, u.hash, u.city, u.avatar, r.status FROM users u INNER JOIN relationships r ON (u.id = r.user_one_id AND r.user_two_id = " + user.id + " OR u.id = r.user_two_id AND r.user_one_id = " + user.id + ") WHERE u.id != " + user.id + " AND r.status = 1 AND u.username LIKE " + "'%" + s_name + "%'";
                        sql += "ORDER BY r.id asc LIMIT " + limit + " OFFSET " + offset;
                        Relationships.query(sql, function (err, rawResult) {
                            if (err) {
                                console.log("query listFriend " + err);
                                deferred.resolve({type: false, data: null});
                            }
                            deferred.resolve({type: true, data: rawResult});
                        })
                        return deferred.promise;
                    }
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'listFriend',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },

    userDetail: function (req, res) {
        /**
         * check login
         */

        auth_login.checkToken({
            token_login: req.body.token_login,
            uuid: req.body.uuid,
        }, function (err, user) {
            if (err) {
                return res.serverError(err);
            }
            if (!user) {
                return res.json({
                    code: 2,
                    message: consts.uuidOrToken
                });
            } else {
                var hash = req.body.hash;
                /**
                 * start
                 */
                get_user_detail(hash).then(function (data_user) {
                    if (data_user.type == true) {
                        var result = {}
                        result['login_account'] = data_user.data.login_account;
                        result['username'] = data_user.data.username;
                        result['avatar'] = data_user.data.avatar;
                        result['city'] = data_user.data.city;
                        result['age'] = data_user.data.age;
                        result['sex'] = data_user.data.sex;
                        result['intro'] = data_user.data.intro;
                        result['action_user_id'] = data_user.data.action_user_id;
                        if (data_user.data.status == null) {
                            result['status'] = 6;
                        } else if (data_user.data.status == 0) {
                            if (data_user.data.action_user_id == user.id) {
                                result['status'] = 8;
                            } else {
                                result['status'] = 9;
                            }
                        } else {
                            result['status'] = data_user.data.status;
                        }
                        return res.json({
                            code: 1,
                            message: 'success',
                            data: result,
                        });
                    } else {
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    }


                }).catch(function (err) {
                    //save log
                    log.save({
                        controller: 'Users',
                        action: 'userDetail',
                        message: 'get_friend_id',
                        data: req.body
                    }, {error: err}
                    , function (e) {
                        console.log(e || "save log!");
                    })
                    return res.json({
                        code: 4,
                        message: consts.apiServer
                    });
                });
                /**
                 * get user detail
                 */
                function get_user_detail(hash) {
                    var deferred = Q.defer();
                    var sql = "SELECT u.id, u.hash, u.username, u.avatar, u.city, u.age, u.sex, u.intro, r.status, r.action_user_id, r.status FROM users u LEFT JOIN relationships r ON (u.id = r.user_one_id AND r.user_two_id = " + user.id + " OR u.id = r.user_two_id AND r.user_one_id = " + user.id + ") WHERE u.hash = " + '"' + hash + '"';
                    Users.query(sql, function (err, rawResult) {
                        if (err) {
                            console.log("query get_user_detail " + err);
                            deferred.resolve({type: false, data: null});
                        }
                        deferred.resolve({type: true, data: rawResult[0]});
                    })
                    return deferred.promise;
                }
            }
        })
    },
    /**
     * profile user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    profile: function (req, res) {
        try {
            /**
             * check login
             */

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {

                    /**
                     * find data by user.id
                     */
                    Users.findOne({id: user.id}).exec(function (err, data_user) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'profile',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 0,
                                message: 'erros',
                            });
                        }
                        if (!data_user) {
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: null
                            });
                        } else {
                            var result = {}
                            result['login_account'] = data_user.login_account;
                            result['username'] = data_user.username;
                            result['avatar'] = data_user.avatar;
                            result['city'] = data_user.city;
                            result['age'] = data_user.age;
                            result['sex'] = data_user.sex;
                            result['intro'] = data_user.intro;
                        }
                        return res.json({
                            code: 1,
                            message: 'success',
                            data: result
                        });
                    });
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'profile',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * waiting list friends
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    pendingFriend: function (req, res) {
        /**
         * check login
         */
        auth_login.checkToken({
            token_login: req.body.token_login,
            uuid: req.body.uuid,
        }, function (err, user) {
            if (err) {
                return res.serverError(err);
            }
            if (!user) {
                return res.json({
                    code: 2,
                    message: consts.uuidOrToken
                });
            } else {

                /**
                 * start
                 */
                get_list_friend().then(function (data_friend) {
//                    console.log(data_friend);
                    if (data_friend.type == true) {
                        return res.json({
                            code: 1,
                            message: 'success',
                            data: data_friend.data
                        });
                    } else {
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    }
                }).catch(function (err) {
                    //save log
                    log.save({
                        controller: 'Users',
                        action: 'pendingFriend',
                        message: 'get_friend_id',
                        data: req.body
                    }, {error: err}
                    , function (e) {
                        console.log(e || "save log!");
                    })
                    return res.json({
                        code: 4,
                        message: consts.apiServer
                    });
                });
                /**
                 * find data by user.id
                 * @returns {.Q@call;defer.promise}
                 */
                function get_list_friend() {
                    var deferred = Q.defer();
                    var sql = "SELECT u.id, u.username, u.hash, u.city, u.avatar, r.status FROM users u INNER JOIN relationships r ON (u.id = r.user_one_id AND r.user_two_id = " + user.id + " OR u.id = r.user_two_id AND r.user_one_id = " + user.id + ") WHERE u.id != " + user.id + " AND r.status = 0 AND action_user_id != " + user.id + " ";
                    sql += "ORDER BY r.id asc";
                    Relationships.query(sql, function (err, rawResult) {
                        if (err) {
                            console.log("query listFriend " + err);
                            deferred.resolve({type: true, data: null});
                        }
                        deferred.resolve({type: true, data: rawResult});
                    })
                    return deferred.promise;
                }
            }
        })
    },
    /**
     * Duet invitation list
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    listInvi: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var page;
                    limit = 10;
                    page = req.body.page;
                    if (!req.body.page || req.body.page == 0 || req.body.page == 1) {
                        page = 1;
                        offset = 0;
                    } else {
                        offset = (page - 1) * 10;
                    }
                    var sql = "SELECT d.hash, d.status, song_r.hash as song_r_hash, song_r.path as song_r_path, song_r.final_score as song_r_final_score, song_r.duet_hash as song_r_duet_hash, song.singer, song.icon, song.path_midi, song.song_name, u.hash as data_u_hash, u.avatar as data_u_avatar, u.username as data_u_username, u.city as data_u_city FROM duet_invitations d";
                    sql += " INNER JOIN song_ratings song_r ON d.song_rate_id = song_r.id";
                    sql += " INNER JOIN songs song ON song_r.song_id = song.id";
                    sql += " INNER JOIN users u ON song_r.user_id = u.id";
                    sql += " WHERE d.target_id = " + user.id;
                    sql += " ORDER BY d.id asc LIMIT " + limit + " OFFSET " + offset;
                    duet_invitations.query(sql, function (err, data) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'listInvi',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }

                        try {
//                                    // An array to store all the final user objects
                            var assignedArray = [];
                            for (index in data) {
                                var myObj = {}, key, value;
                                // Object in format {key: value}
                                myObj['hash'] = data[index].hash;
                                myObj['status'] = data[index].status;
                                myObj['data_song'] = {
                                    hash: data[index].song_r_hash,
                                    path: data[index].song_r_path,
                                    final_score: data[index].song_r_final_score,
                                    duet_hash: data[index].song_r_duet_hash,
                                    singer: data[index].singer,
                                    icon: data[index].icon,
                                    song_name: data[index].song_name,
                                    path_midi: data[index].path_midi,
                                }
                                myObj['data_user_invi'] = {
                                    hash: data[index].data_u_hash,
                                    avatar: data[index].data_u_avatar,
                                    username: data[index].data_u_username,
                                    city: data[index].data_u_city,
                                }
                                assignedArray.push(myObj);
                            }
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: assignedArray
                            });
                        } catch (e) {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'listInvi',
                                message: 'listinvi for',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }
                    })
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'listInvi',
                message: 'listinvi for',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * add song to Playlist
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    addPlaylist: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    get_song_id().then(function (data_song) {

                        if (data_song.type == true && data_song.song_type == true) {

                            create_playlist(req.body, user, data_song).then(function (data_create) {
                                if (data_create.type == true) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                    });
                                } else if (data_create.type == false) {
                                    return res.json({
                                        code: 0,
                                        message: 'error',
                                        data: data_create.data
                                    });
                                }
                            }).catch(function (err) {
                                //save log
                                log.save({
                                    controller: 'Users',
                                    action: 'addPlaylist',
                                    message: 'create_recorde',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return res.json({
                                    code: 4,
                                    message: consts.apiServer
                                });
                            });
                        } else if (data_song.type == false && data_song.song_type == false) {
                            return res.json({
                                code: 4,
                                message: consts.apiServer()
                            });
                        } else {
                            return res.json({
                                code: 3,
                                message: 'error',
                                data: consts.songNotExist
                            });
                        }
                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Users',
                            action: 'addPlaylist',
                            message: 'get_song_id',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        })
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                    /**
                     * get song id by song_hash
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_song_id() {

                        var deferred = Q.defer();
                        Songs.findOne({select: ['id'], where: {hash: req.body.song_hash}}, function (err, get_song_id) {
                            if (err) {
                                deferred.resolve({type: false, song: get_song_id, song_type: false});
                            }
                            if (!get_song_id) {
                                deferred.resolve({type: false, song: get_song_id, song_type: true});
                            } else {
                                deferred.resolve({type: true, song: get_song_id, song_type: true});
                            }
                        });
                        return deferred.promise;
                    }
                    /**
                     * save data
                     * @param {type} data_body
                     * @param {type} user
                     * @param {type} data_song
                     * @returns {.Q@call;defer.promise}
                     */
                    function create_playlist(data_body, user, data_song) {
                        var deferred = Q.defer();
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        hash = shasum.digest('hex');
                        // save
                        Playlists.create({
                            hash: hash,
                            user_id: user.id,
                            cat_number: req.body.cat_number,
                            song_id: data_song.song.id,
                        }).exec(function (err, register) {
                            if (err) {
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    if (obj.Errors.hash) {
                                        create_recorde(req.body, user, data_song);
                                    }
                                    deferred.resolve({type: false, data: obj.Errors});
                                } else {
                                    deferred.resolve({type: false, data: null});
                                }
                            }
                            if (register) {
                                deferred.resolve({type: true, data: register});
                            }
                        });
                        return deferred.promise;
                    }
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'addPlaylist',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * add song to History
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    addHistory: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {


                    get_song_id().then(function (data_song) {
                        if (data_song.type == true && data_song.song_type == true) {
                            // check add in day
                            var curr = new Date;
                            var firstday = new Date(curr.setDate(curr.getDate()));
                            var timeNow = (
                                    firstday.getFullYear() + '-' +
                                    (firstday.getMonth() + 1) + '-' +
                                    firstday.getDate() + ' ' +
                                    firstday.getHours() + ':' +
                                    firstday.getMinutes() + ':' +
                                    firstday.getSeconds()
                                    );
                            var startDate = (firstday.getFullYear() + '-' + (firstday.getMonth() + 1) + '-' + firstday.getDate() + ' ' + '00:00:00');
                            var endDate = (firstday.getFullYear() + '-' + (firstday.getMonth() + 1) + '-' + firstday.getDate() + ' ' + '23:59:59');
                            Histories.findOne({select: ['id'], where: {user_id: user.id, song_id: data_song.song.id, 'createdAt': {'>=': startDate, '<=': endDate}}}, function (err, data_check) {
                                if (err) {
                                    deferred.resolve({type: false, song: get_song_id, song_type: false});
                                }
                                if (!data_check) {
                                    create_history(req.body, user, data_song).then(function (data_create) {
                                        if (data_create.type == true) {
                                            return res.json({
                                                code: 1,
                                                message: 'success',
                                                data: {
                                                    hash: data_create.data.hash
                                                }
                                            });
                                        } else if (data_create.type == false) {
                                            return res.json({
                                                code: 0,
                                                message: 'error',
                                                data: data_create.data
                                            });
                                        }

                                    }).catch(function (err) {
                                        //save log
                                        log.save({
                                            controller: 'Users',
                                            action: 'addHistory',
                                            message: 'create_recorde',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        });
                                    });
                                } else {
                                    Histories.update(
                                            {id: data_check.id},
                                            {createdAt: timeNow}
                                    ).exec(function (err, update) {
                                        if (err) {
                                            //save log
                                            log.save({
                                                controller: 'Users',
                                                action: 'addHistory',
                                                data: req.body
                                            }, {error: err}
                                            , function (e) {
                                                console.log(e || "save log!");
                                            })
                                            return res.json({
                                                code: 4,
                                                message: consts.apiServer
                                            });
                                        }
                                        if (update) {
                                            return res.json({
                                                code: 1,
                                                message: 'success',
                                                data: {
                                                    hash: update[0].hash
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        } else if (data_song.type == false && data_song.song_type == false) {
                            console.log('err type false false');
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        } else {
                            return res.json({
                                code: 3,
                                message: 'error',
                                data: consts.songNotExist
                            });
                        }
                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Users',
                            action: 'addHistory',
                            message: 'get_song_id',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        })
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                    /**
                     * get song id by song hash
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_song_id() {

                        var deferred = Q.defer();
                        Songs.findOne({select: ['id'], where: {hash: req.body.song_hash}}, function (err, get_song_id) {
                            if (err) {
                                deferred.resolve({type: false, song: get_song_id, song_type: false});
                            }
                            if (!get_song_id) {
                                deferred.resolve({type: false, song: get_song_id, song_type: true});
                            } else {
                                deferred.resolve({type: true, song: get_song_id, song_type: true});
                            }
                        });
                        return deferred.promise;
                    }
                    /**
                     * save data
                     * @param {type} data_body
                     * @param {type} user
                     * @returns {.Q@call;defer.promise}
                     */

                    function create_history(data_body, user, data_song) {
                        var deferred = Q.defer();
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        hash = shasum.digest('hex');
                        // save
                        Histories.create({
                            hash: hash,
                            user_id: user.id,
                            song_id: data_song.song.id
                        }).exec(function (err, register) {
                            if (err) {
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    if (obj.Errors.hash) {
                                        create_history(req.body, user, data_song);
                                    }
                                    deferred.resolve({type: false, data: obj.Errors});
                                } else {
                                    deferred.resolve({type: false, data: null});
                                }
                            }
                            if (register) {
                                deferred.resolve({type: true, data: register});
                            }
                        });
                        return deferred.promise;
                    }
                }
            })
        } catch (e) {
            //save log
            log.save({
                controller: 'Users',
                action: 'addHistory',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * get song of playlist
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    listPlaylist: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    /**
                     * get data by user.id and cate_number
                     */
                    Playlists.find({user_id: user.id, cat_number: req.body.cat_number})
                            .populate('song_id')
                            .exec(function (err, list_song) {
                                console.log(err);
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'listPlaylist',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                }
                                if (!list_song) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: null
                                    });
                                } else {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: list_song
                                    });
                                }
                            })
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'listPlaylist',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * The history of the songs was sung
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    listHistory: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {

                    var sort;
                    var page = 1;
                    if (!req.body.sort || req.body.sort == 'date') {
                        sort = 'createdAt DESC';
                    } else {
                        sort = 'final_score DESC';
                    }
                    if (req.body.page) {
                        page = req.body.page;
                    }
                    /**
                     * get data by user.id
                     */
                    Histories.find({user_id: user.id})
                            .sort(sort)
                            .populate('song_id')
                            .paginate({page: page, limit: 10})
                            .exec(function (err, list_song) {
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'listHistory',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                }
                                if (!list_song) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: null
                                    });
                                } else {
                                    try {
                                        // An array to store all the final user objects
                                        var assignedArray = [];
                                        for (index in list_song) {
                                            var myObj = {}, key, value;
                                            // Object in format {key: value}
                                            myObj['user_id'] = list_song[index].user_id;
                                            myObj['hash'] = list_song[index].hash;
                                            myObj['final_score'] = list_song[index].final_score;
                                            myObj['date'] = convertDBDatetimeToJSDatetime(list_song[index].createdAt);
                                            myObj['data_song'] = {
                                                hash: list_song[index].song_id.hash,
                                                artist: list_song[index].song_id.artist,
                                                singer: list_song[index].song_id.singer,
                                                song_name: list_song[index].song_id.song_name,
                                                path: list_song[index].song_id.path,
                                                path_full: list_song[index].song_id.path_full,
                                                icon: list_song[index].song_id.icon,
                                                img_ct: list_song[index].song_id.img_ct,
                                                createdAt: convertDBDatetimeToJSDatetime(list_song[index].song_id.createdAt),
                                            }
                                            // Adding the object to the main array
                                            assignedArray.push(myObj);
                                        }
                                        return res.json({
                                            code: 1,
                                            message: 'success',
                                            data: assignedArray
                                        });
                                    } catch (err) {
                                        //save log
                                        log.save({
                                            controller: 'Users',
                                            action: 'listHistory',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        });
                                    }
                                }
                            })
                }

                function convertDBDatetimeToJSDatetime(date) {
                    return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                }
            })
        } catch (e) {
            //save log
            log.save({
                controller: 'Users',
                action: 'listHistory',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * list songs exist final_score
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listMyScore: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {

                    var page;
                    if (!req.body.page) {
                        page = 1;
                    } else {
                        page = req.body.page;
                    }
                    var sort = 'createdAt DESC';
                    if (!req.body.sort) {
                        sort = 'createdAt DESC';
                    } else if (req.body.sort == 'final_score') {
                        sort = 'final_score DESC';
                    }
                    song_ratings.find()
                            .populate('song_id')
                            .sort(sort)
                            .where({user_id: user.id, final_score: {'!': null}})
                            .paginate({page: page, limit: 10})
                            .exec(function (err, songs) {
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'listMyScore',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                }
                                if (!songs) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: null
                                    });
                                } else {

                                    var assignedArray = [];
                                    try {

                                        for (index in songs) {
                                            var myObj = {}, key, value;
                                            // Object in format {key: value}
                                            myObj['data_song'] = {
                                                icon: songs[index].song_id.icon,
                                                singer: songs[index].song_id.singer,
                                                album_name: songs[index].song_id.album_name,
                                                hash: songs[index].song_id.hash,
                                                song_name: songs[index].song_id.song_name,
                                                createdAt: convertDBDatetimeToJSDatetime(songs[index].song_id.createdAt)
                                            };
                                            myObj['hash'] = songs[index].hash;
                                            myObj['path'] = songs[index].path;
                                            myObj['final_score'] = songs[index].final_score;
                                            myObj['song_name'] = songs[index].path;
                                            myObj['date'] = convertDBDatetimeToJSDatetime(songs[index].createdAt);
                                            // Adding the object to the main array
                                            assignedArray.push(myObj);
                                        }
                                    } catch (err) {
                                        //save log
                                        log.save({
                                            controller: 'Users',
                                            action: 'listMyScore',
                                            message: 'listMyScore assignedArray',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: 'error',
                                            data: err
                                        });
                                    }
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: assignedArray
                                    });
                                }
                            });
                }
                /**
                 * convert date
                 * @param {type} date
                 * @returns {date}
                 */
                function convertDBDatetimeToJSDatetime(date) {
                    return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'listMyScore',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * rank top user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    myTopScore: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var curr = new Date;
                    var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
                    var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));
                    var startDate = (firstday.getFullYear() + '-' + (firstday.getMonth() + 1) + '-' + firstday.getDate() + ' ' + '00:00:00');
                    var endDate = (lastday.getFullYear() + '-' + (lastday.getMonth() + 1) + '-' + lastday.getDate() + ' ' + '23:59:59');
                    /**
                     * get data by user.id , date , and final_score != null
                     */
                    song_ratings.findOne({user_id: user.id, final_score: {'!': null}, createdAt: {'>=': startDate, '<=': endDate}})
                            .populate('song_id')
                            .populate('user_id')
                            .sort('final_score DESC')
                            .exec(function (err, songs) {
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'myTopScore',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                }
                                if (!songs) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: null
                                    });
                                } else {
                                    try {
                                        var myObj = {};
                                        myObj['data_song'] = {
                                            icon: songs.song_id.icon,
                                            singer: songs.song_id.singer,
                                            album_name: songs.song_id.album_name,
                                            hash: songs.song_id.hash,
                                            song_name: songs.song_id.song_name,
                                            createdAt: convertDBDatetimeToJSDatetime(songs.song_id.createdAt)
                                        };
                                        myObj['data_user'] = {
                                            login_account: songs.user_id.login_account,
                                            avatar: songs.user_id.avatar,
                                            username: songs.user_id.username,
                                            city: songs.user_id.city,
                                            age: songs.user_id.age,
                                            sex: songs.user_id.sex,
                                        };
                                        myObj['hash'] = songs.hash;
                                        myObj['path'] = songs.path;
                                        myObj['final_score'] = songs.final_score;
                                        myObj['song_name'] = songs.path;
                                        myObj['date'] = convertDBDatetimeToJSDatetime(songs.createdAt);
                                        // Adding the object to the main array

                                        return res.json({
                                            code: 1,
                                            message: 'success',
                                            data: myObj
                                        });
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Users',
                                            action: 'myTopScore',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        });
                                    }


                                }
                            });
                }
                /**
                 * convert date
                 * @param {type} date
                 * @returns {date}
                 */
                function convertDBDatetimeToJSDatetime(date) {
                    return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'myTopScore',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * delete Song from Playlist
     * @param {type} req
     * @param {type} res
     * @returns {tring}
     */
    deleteSongPlaylist: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    /**
                     * delete by hash
                     */
                    Playlists.destroy(
                            {hash: req.body.hash}).exec(function (err, destroy) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'deleteSongPlaylist',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }
                        if (!destroy || destroy == '') {
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: consts.deleteSongPlaylistEr
                            });
                        } else if (destroy) {
                            return res.json({
                                code: 1,
                                message: 'success',
                            });
                        }
                    })
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'deleteSongPlaylist',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * remove record
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    deleteHistory: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    Histories.destroy(
                            {hash: req.body.hash}).exec(function (err, destroy) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Users',
                                action: 'deleteHistory',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        }
                        if (!destroy || destroy == '') {
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: consts.deleteSongPlaylistEr
                            });
                        } else if (destroy) {
                            return res.json({
                                code: 1,
                                message: 'success',
                            });
                        }
                    })
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'deleteHistory',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * listNameCategory
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listNameCategory: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    Categories.find({user_id: user.id})
                            .exec(function (err, data) {
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'listNameCategory',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                }
                                if (!data) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: null
                                    });
                                } else {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: data
                                    });
                                }
                            })
                }
            })
        } catch (err) { //save log
            log.save({
                controller: 'Users',
                action: 'listNameCategory',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }

    },
    /**
     * edit Name Category
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    editNameCategory: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    /**
                     * update data
                     */
                    Categories.update({user_id: user.id, c_number: req.body.cat_number}, {c_name: req.body.cat_name}).exec(function (err, data_update) {
                        if (err) {
                            var errorValidate = JSON.stringify(err);
                            obj = JSON.parse(errorValidate);
                            if (obj.error == "E_VALIDATION") {
                                return res.json({
                                    code: 0,
                                    message: 'error',
                                    data: obj.Errors
                                });
                            } else {
                                //save log
                                log.save({
                                    controller: 'Users',
                                    action: 'editNameCategory',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                return console.log(err)
                            }
                        }
                        if (data_update) {
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: data_update
                            });
                        }
                    })
                }
            })
        } catch (e) { //save log
            log.save({
                controller: 'Users',
                action: 'editNameCategory',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * send request from user
     * @param {type} req
     * @param {type} res
     * @returns {tring}
     */
    request: function (req, res) {
        try {

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    create_recorde().then(function (data) {
                        if (data.type == true) {
                            return res.json({
                                code: 1,
                                message: 'success',
                            });
                        } else if (data.type == false) {
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: data.data
                            });
                        }
                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Users',
                            action: 'request',
                            data: req.body
                        }, {error: err}
                        , function (e) {
                            console.log(e || "save log!");
                        })
                        return res.json({
                            code: 4,
                            message: consts.apiServer
                        });
                    });
                    /**
                     * save data
                     * @returns {.Q@call;defer.promise}
                     */
                    function create_recorde() {
                        //                get hash
                        var deferred = Q.defer();
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        hash = shasum.digest('hex');
                        Requests.create({
                            user_id: user.id,
                            singer_name: req.body.singer_name,
                            song_name: req.body.song_name,
                            content: req.body.content,
                            hash: hash
                        }).exec(function (err, register) {
                            if (err) {
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    if (obj.Errors.hash) {
                                        create_user();
                                    }
                                    deferred.resolve({type: false, data: obj.Errors});
                                } else {
                                    //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'request',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return console.log(err)
                                }
                            }
                            if (register) {
                                deferred.resolve({type: true, data: register});
                            }
                        });
                        return deferred.promise;
                    }
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Users',
                action: 'request',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    /**
     * list data push all
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listPush: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var page = 1;
                    var type = 1;
                    if (req.body.page) {
                        page = req.body.page;
                    }
                    if (req.body.type) {
                        type = req.body.type;
                    }
                    /**
                     * find data by user.id
                     */
                    Pushs.find({user_id_target: user.id, type_push: type})
                            .populate('user_id')
                            .populate('user_id_target')
                            .paginate({page: page, limit: 10})
                            .exec(function (err, data) {
                                if (err) { //save log
                                    log.save({
                                        controller: 'Users',
                                        action: 'listPush',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                }
                                if (!data) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                        data: null
                                    });
                                } else {
                                    try {
                                        // An array to store all the final user objects
                                        var assignedArray = [];
                                        for (index in data) {
                                            console.log(data);
                                            var myObj = {}, key, value;
                                            // Object in format {key: value}
                                            myObj['hash'] = data[index].hash;
                                            myObj['title'] = data[index].title;
                                            myObj['type_push'] = data[index].type_push;
                                            myObj['date'] = convertDBDatetimeToJSDatetime(data[index].createdAt);
                                            myObj['user'] = {
                                                username: data[index].user_id.username,
                                                avatar: data[index].user_id.avatar,
                                            }
                                            myObj['user_target'] = {
                                                username: data[index].user_id_target.username,
                                                avatar: data[index].user_id_target.avatar,
                                            }

                                            // Adding the object to the main array
                                            assignedArray.push(myObj);
                                        }
                                        return res.json({
                                            code: 1,
                                            message: 'success',
                                            data: assignedArray
                                        });
                                    } catch (e) {
                                        log.save({
                                            controller: 'Users',
                                            action: 'listPush',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        });
                                    }
                                }
                                /**
                                 * convert date
                                 * @param {type} date
                                 * @returns {date}
                                 */
                                function convertDBDatetimeToJSDatetime(date) {
                                    return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                                }
                            })
                }
                /**
                 * convert date
                 * @param {type} date
                 * @returns {date}
                 */
                function convertDBDatetimeToJSDatetime(date) {
                    return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                }
            })
        } catch (e) {
            log.save({
                controller: 'Users',
                action: 'listPush',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
    checkPush: function (req, res) {
        try {
            /**
             * check login
             */
            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, user) {
                if (err) {
                    return res.serverError(err);
                }
                if (!user) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    /**
                     * update all status
                     */
                    Pushs.update({user_id_target: user.id}, {status: 1}).exec(function afterwards(err, updated) {

                        if (err) {
                            log.save({
                                controller: 'Users',
                                action: 'checkPush',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        } else {
                            return res.json({
                                code: 1,
                                message: 'success'
                            });
                        }
                    });
                }
            })
        } catch (e) {
            log.save({
                controller: 'Users',
                action: 'checkPush',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            })
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }
    },
};

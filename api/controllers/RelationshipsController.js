/**
 * RelationshipsController
 *
 * @description :: Server-side logic for managing relationships
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var auth_login = require('../services/auth_login');
var Q = require('q');
var consts = require('../services/const');
var send_push = require('../services/send_push');
var crypto = require('crypto');
var log = require('../services/log');

module.exports = {
    /**
     * friend requests
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    addFriend: function (req, res) {
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

                    get_user_two_id().then(function (data) {
                        // This function will be called after get_user_two_id() will be executed. 
                        if (data.type == true && data.user_type == true) {
                            var user_one_id = user.id;
                            var user_two_id = data.user.id;
                            var action_user_id = user_one_id;
//              sort the data user_one_id and user_two_id
                            if (user_one_id > user_two_id) {
                                var tmp = user_one_id;
                                user_one_id = user_two_id;
                                user_two_id = tmp;
                            }
                            var one_id_and_two_id = user_one_id + '' + user_two_id;
                            /**
                             * save data
                             */
                            Relationships.create({
                                user_one_id: user_one_id,
                                user_two_id: user_two_id,
                                status: 0,
                                one_id_and_two_id: one_id_and_two_id,
                                action_user_id: action_user_id
                            }).exec(function (err, register) {
                                if (err) {
                                    var errorValidate = JSON.stringify(err);
                                    obj = JSON.parse(errorValidate);
                                    if (obj.error == "E_VALIDATION") {
                                        if (obj.Errors) {
                                            return res.json({
                                                code: 0,
                                                message: 'error',
                                                data: obj.Errors
                                            })
                                        }
                                    } else {
                                        //save log
                                        log.save({
                                            controller: 'Relationship',
                                            action: 'addFriend',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return res.json({
                                            code: 4,
                                            message: consts.apiServer
                                        })
                                    }
                                }
                                if (register) {

                                    try {
                                        Users.findOne({select: ['token_fcm'], where: {hash: req.body.hash}}).exec(function (err, data_fcm) {
                                            if (data_fcm) {
                                                // start push
                                                try {
                                                    send_push.push({
                                                        token_fcm: [data_fcm.token_fcm],
                                                        collapse_key: 'add_friend',
                                                        title: '友達追加',
                                                        body: user.username + ' から友達追加リクエストがありました。',
                                                        data: {
                                                            view_type: 'addFriend',
                                                        }
                                                    }, function (err, data) {
                                                        if (err) {
                                                            //save log
                                                            log.save({
                                                                controller: 'Relationship',
                                                                action: 'addFriend',
                                                                data: req.body
                                                            }, {error: err}
                                                            , function (e) {
                                                                console.log(e || "save log!");
                                                            })
                                                        }
                                                        if (data) {
                                                            sails.log.info(data);
                                                        }
                                                    })
                                                } catch (e) {
                                                    sails.log.error('push addfriend error' + e);
                                                }
                                            }
                                        });
                                    } catch (e) {
                                        console.log('push addfiend err');
                                    }
                                    // save data push
                                    try {
                                        create_push(data.user.id).then(function (data_push) {

                                        }).catch(function (err) {
                                            log.save({
                                                controller: 'Relationship',
                                                action: 'addFriend',
                                                message: 'err create data push addfriend',
                                                data: req.body
                                            }, {error: err}
                                            , function (e) {
                                                console.log(e || "save log!");
                                            })
                                        });
                                    } catch (e) {
                                        log.save({
                                            controller: 'Relationship',
                                            action: 'addFriend',
                                            message: 'err create data push addfriend',
                                            data: req.body
                                        }, {error: e}
                                        , function (err) {
                                            console.log(err || "save log!");
                                        })
                                    }
//                                    
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                    })
                                }
                            });
                        } else if (data.type == false && data.user_type == false) {
                            console.log('get_user_two_id() = false');
                            return res.json({
                                code: 4,
                                message: consts.apiServer
                            });
                        } else {
                            return res.json({
                                code: 3,
                                message: 'error',
                                data: consts.userNotExist
                            });
                        }
                    }).catch(function (err) {
                        log.save({
                            controller: 'Relationship',
                            action: 'addFriend',
                            message: 'err get_user_two_id',
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
                     *  save data push
                     * @param {type} data_target
                     * @param {type} data_song
                     * @returns {.Q@call;defer.promise}
                     */
                    function create_push(data_target) {
                        var deferred = Q.defer();
                        var ctr = 0;
                        var user_id = user.id;
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        var hash = shasum.digest('hex');
                        var arr_err = [];
                        var arr_data = [];
                        Pushs.create({
                            hash: hash,
                            user_id: user_id,
                            user_id_target: data_target,
                            title: '友達追加',
                            type_push: 1,
                            status: 0
                        }).exec(function (err, register) {
                            ctr++;
                            if (err) {
                                //save log
                                log.save({
                                    controller: 'Relationships',
                                    action: 'addFriend',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    if (obj.Errors) {
                                        if (obj.Errors.hash) {
                                            create(data_target);
                                        }
                                    }
                                    arr_err.push(obj.Errors);
                                } else {
                                    arr_err.push(obj.Errors);
                                }
                                if (ctr === data_target.length) {
                                    deferred.resolve({type: true, data: arr_data, data_error: arr_err});
                                }
                            }
                        });
                        return deferred.promise;
                    }
                    /**
                     * get user target id by hash
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_user_two_id() {

                        var deferred = Q.defer();
                        Users.findOne({select: ['id'], where: {hash: req.body.hash}}, function (err, data_user_two_id) {
                            if (err) {
                                deferred.resolve({type: false, user: data_user_two_id, user_type: false});
                            }
                            if (!data_user_two_id) {
                                deferred.resolve({type: false, user: data_user_two_id, user_type: true});
                            } else {
                                deferred.resolve({type: true, user: data_user_two_id, user_type: true});
                            }
                        });
                        return deferred.promise;
                    }
                }
            })
        } catch (e) {
            log.save({
                controller: 'Relationship',
                action: 'addFriend',
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
     * accept friend request
     * @param {type} req
     * @param {type} res
     * @returns {String}
     */
    acceptFriend: function (req, res) {
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
                    if (!req.body.hash) {
                        return res.json({
                            code: 0,
                            message: 'error',
                            data: {
                                hash: consts.notBlank
                            },
                        });
                    }
                    /**
                     * find data by hash 
                     */
                    Users.findOne({select: ['id'], where: {hash: req.body.hash}}, function (err, data_accept) {
                        if (err) {
                            log.save({
                                controller: 'Relationship',
                                action: 'acceptFriend',
                                message: 'find accept_id',
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
                        if (!data_accept) {
                            return res.json({
                                code: 3,
                                message: 'error',
                                data: consts.userNotExist
                            });
                        } else {
                            var tmp;
                            if (user.id > data_accept.id) {
                                tmp = data_accept.id;
                                data_accept.id = user.id;
                                user.id = tmp;
                            }
                            /**
                             * update data
                             */
                            Relationships.update(
                                    {user_one_id: user.id, user_two_id: data_accept.id}, {status: 1, action_user_id: user.id}).exec(function (err, update) {
                                if (err) {
                                    var errorValidate = JSON.stringify(err);
                                    obj = JSON.parse(errorValidate);
                                    console.log('update Relationships' + err);
                                    if (obj.error == "E_VALIDATION") {
                                        return res.json({
                                            code: 0,
                                            message: 'error',
                                            data: obj.Errors
                                        });
                                    } else {
                                        log.save({
                                            controller: 'Relationship',
                                            action: 'acceptFriend',
                                            message: 'update data',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                        return console.log(err);
                                    }
                                }
                                if (update) {
                                    return res.json({
                                        code: 1,
                                        message: 'success',
                                    });
                                }
                            })
                        }

                    })
                }
            })
        } catch (e) {
            log.save({
                controller: 'Relationship',
                action: 'acceptFriend',
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
     * decline friend request
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    declineFriend: function (req, res) {
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
                    if (!req.body.hash) {
                        return res.json({
                            code: 0,
                            message: 'error',
                            data: {
                                hash: consts.notBlank
                            },
                        });
                    }
                    /**
                     * find data by hash
                     */
                    Users.findOne({select: ['id'], where: {hash: req.body.hash}}, function (err, data_accept) {
                        if (err) {
                            log.save({
                                controller: 'Relationship',
                                action: 'declineFriend',
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
                        if (!data_accept) {
                            return res.json({
                                code: 3,
                                message: 'error',
                                data: consts.userNotExist
                            });
                        } else {
                            var tmp;
                            if (user.id > data_accept.id) {
                                tmp = data_accept.id;
                                data_accept.id = user.id;
                                user.id = tmp;
                            }
                            /**
                             * remove record
                             */
                            Relationships.destroy(
                                    {user_one_id: user.id, user_two_id: data_accept.id, status: 0}).exec(function (err, destroy) {
                                if (err) {
                                    log.save({
                                        controller: 'Relationship',
                                        action: 'declineFriend',
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
                                        data: consts.declineFriend
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

                }
            })
        } catch (e) {
            log.save({
                controller: 'Relationship',
                action: 'declineFriend',
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
     * delete friend by hash 
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    deleteFriend: function (req, res) {
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
                    if (!req.body.hash) {
                        return res.json({
                            code: 0,
                            message: 'error',
                            data: {
                                hash: consts.notBlank
                            },
                        });
                    }
                    Users.findOne({select: ['id'], where: {hash: req.body.hash}}, function (err, data_accept) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Relationship',
                                action: 'deleteFriend',
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
                        if (!data_accept) {
                            return res.json({
                                code: 3,
                                message: 'error',
                                data: consts.userNotExist
                            });
                        } else {
                            var tmp;
                            if (user.id > data_accept.id) {
                                tmp = data_accept.id;
                                data_accept.id = user.id;
                                user.id = tmp;
                            }
                            /**
                             * delete
                             */
                            Relationships.destroy(
                                    {user_one_id: user.id, user_two_id: data_accept.id, status: 0}).exec(function (err, destroy) {
                                if (err) {
                                    log.save({
                                        controller: 'Relationship',
                                        action: 'deleteFriend',
                                        message: 'deleteFriend',
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
                                        data: consts.declineFriend
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

                }
            })
        } catch (e) {
            log.save({
                controller: 'Relationship',
                action: 'deleteFriend',
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
};


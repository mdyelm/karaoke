/**
 * ChallengesController
 *
 * @description :: Server-side logic for managing challenges
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var auth_login = require('../services/auth_login');
var Q = require('q');
var crypto = require('crypto');
var moment = require('moment-timezone');
var send_push = require('../services/send_push');
var request = require("request");
var fs = require('fs');
var log = require('../services/log');
var consts = require('../services/const');

module.exports = {

    /**
     * send challenge letter
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    addChallenge: function (req, res) {
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
                    //convert hash to array
                    try {
                        if (req.body.hash) {
//                        var arr_hash = JSON.parse(req.body.hash);
                            var arr_hash = req.body.hash.split(",");
                        }
                    } catch (e) {
                        return res.json({
                            code: 0,
                            message: 'error',
                            data: {
                                hash: consts.errHash
                            }
                        });
                    }
                    //check array
                    if (!arr_hash || arr_hash == '' || arr_hash == 'undefined') {
                        return res.json({
                            code: 0,
                            message: 'error',
                            data: {
                                hash: consts.notBlank
                            }
                        });
                    }
                    /**
                     * start
                     */
                    upload_recorde().then(function (data_rc) {
                        if (data_rc.type == true) {
                            get_song_id().then(function (data_song) {
//                        // This function will be called after get_song_id() will be executed.
                                if (data_song.type == true) {
                                    // call api scoring
                                    try {
                                        var path_file = data_rc.path.split('record_audio')
                                        var data = {
                                            AudioFile: data_rc.path,
                                            MidiFile: data_song.song.path_midi,
//                                            AudioFile: 'http://karaoke.brite.vn/record_audio/8/15221414330788/f5eb0bef-59fe-48c1-95e7-795576626d11.aac',
//                                            MidiFile: 'http://karaoke.brite.vn/mids/5cd915dc-730d-422b-b705-d7d52f245370.mid',
                                            user_id: user.id,
                                        }
                                        request.post({url: 'http://karaokescore.brite.vn/App.php', form: data}, function (err, httpResponse, body) {
                                            if (err) {
                                                //save log
                                                log.save({
                                                    controller: 'Challenges',
                                                    action: 'addChallenge',
                                                    data: req.body
                                                }, {error: err}
                                                , function (e) {
                                                    console.log(e || "save log!");
                                                })
                                                return res.json({
                                                    code: 0,
                                                    message: 'error',
                                                    data: 'call api score'
                                                });
                                            } else {
//                                                delete file recording
                                                try {
                                                    fs.unlinkSync("assets/record_audio" + path_file.slice(-1).pop());
                                                } catch (e) {
                                                    sails.log.error('delete file score' + e);
                                                }
                                                get_target_id().then(function (data_target) {
                                                    // This function will be called after get_target_id() will be executed.
                                                    if (data_target.type == true) {
                                                        create(data_target.data, data_song, data_target.data_fcm, Number(body)).then(function (data_create) {
                                                            try {
                                                                if (data_create.data_error[0]) {
                                                                    return res.json({
                                                                        code: "0",
                                                                        message: 'error',
                                                                        data: data_create.data_error[0]
                                                                    });
                                                                }
                                                            } catch (e) {
                                                                console.log(e + 'data_error of create ChallengesController');
                                                            }



                                                            // This function will be called after data_create() will be executed.
                                                            if (data_create.type == true) {
                                                                return res.json({
                                                                    code: 1,
                                                                    message: 'success',
                                                                    data: {
                                                                        score: Number(body)
                                                                    }
                                                                });
                                                            }
                                                        }).catch(function (err) {
                                                            //save log
                                                            log.save({
                                                                controller: 'Challenge',
                                                                action: 'addChallenge',
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
                                                    } else if (data_target.type == false && data_target.data == false) {
                                                        console.log('get_target_id() = false');
                                                        return res.json({
                                                            code: 4,
                                                            message: consts.apiServer
                                                        });
                                                    } else if (data_target.type == true && data_target.data == null) {
                                                        return res.json({
                                                            code: 3,
                                                            message: 'error',
                                                            data: consts.userNotExist
                                                        });
                                                    }
                                                }).catch(function (err) {
                                                    console.log(err + 'err get_target_id');
                                                    return res.json({
                                                        code: 4,
                                                        message: consts.apiServer
                                                    });
                                                });
                                            }
                                        })
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Challenge',
                                            action: 'addChallenge',
                                            data: req.body
                                        }, {error: e}
                                        , function (err) {
                                            console.log(err || "save log!");
                                        })
                                    }
//                                    
                                } else if (data_song.type == false && data_song.song == false) {
                                    console.log('get_song_id() = false');
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
                                    controller: 'Challenge',
                                    action: 'addChallenge',
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
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: {
                                    file_recorde: '入力して下さい。'
                                }
                            });
                        }
                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Challenge',
                            action: 'addChallenge',
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
                     * upload file recording
                     * @param {type} user_id
                     * @returns {.Q@call;defer.promise}
                     */
                    function upload_recorde() {
                        var deferred = Q.defer();
                        var path_recorde;
                        var path_save = user.id + '/' + new Date().getTime() + user.id;
                        req.file('file_recorde') // this is the name of the file in your multipart form
                                .upload({
                                    // optional
                                    // dirname: [SOME PATH TO SAVE IN A CUSTOM DIRECTORY]
                                    maxBytes: 250000000000,
                                    dirname: '../../assets/record_audio/' + path_save,
                                }, function (err, uploads) {
                                    // try to always handle errors
                                    if (err) {
                                        return res.json({
                                            code: 0,
                                            message: 'error',
                                            data: consts.uploadRecorde
                                        });
                                    }
//                             uploads is an array of files uploaded 
                                    if (uploads.length === 0) {
                                        deferred.resolve({type: false, path: null});
                                    } else {

                                        var str = uploads[0].fd;
                                        var arr = str.split("/");
                                        path_recorde = 'http://karaoke.brite.vn/record_audio/' + path_save + '/' + arr.slice(-1).pop();
                                        deferred.resolve({type: true, path: path_recorde, file_name: uploads[0].filename});
                                    }
                                })
                        return deferred.promise;
                    }

                    /**
                     * get id song by song_hash
                     * @returns {.Q@call;defer.promise}
                     */

                    function get_song_id() {
                        var deferred = Q.defer();
                        Songs.findOne({select: ['id', 'path_midi'], where: {hash: req.body.song_hash}}).exec(function (err, song) {
                            if (err) {
                                deferred.resolve({type: false, song: false});
                            }
                            if (!song) {
                                deferred.resolve({type: false, song: null});
                            } else {
                                deferred.resolve({type: true, song: song});
                            }
                        })
                        return deferred.promise;
                    }

                    /**
                     * get target_id by hash
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_target_id() {
                        var deferred = Q.defer();
                        var ctr = 0;
                        var arr_data = [];
                        var arr_data_fcm = [];
                        arr_hash.forEach(function (hash, index) {
                            Users.find({select: ['id', 'token_fcm'], where: {hash: hash}}).exec(function (err, data) {
                                if (err) {
                                    deferred.resolve({type: false, data: false});
                                }
                                if (!data || data == 'undefined' || data == '') {
                                    arr_data.push(null);
                                } else {
                                    arr_data.push(data[0].id);
                                    arr_data_fcm.push(data[0].token_fcm);
                                }
                                ctr++;
                                if (ctr === arr_hash.length) {
                                    deferred.resolve({type: true, data: arr_data, data_fcm: arr_data_fcm});
                                }
                            });
                        });
                        return deferred.promise;
                    }
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
                        data_target.forEach(function (id_target, index) {
                            var hash_new = hash + index;
                            Pushs.create({
                                hash: hash_new,
                                user_id: user_id,
                                user_id_target: id_target,
                                title: 'バトル',
                                type_push: 2,
                                status: 0
                            }).exec(function (err, register) {
                                ctr++;
                                if (err) {
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
                        });
                        return deferred.promise;
                    }
                    /**
                     *  save data
                     * @param {type} data_target
                     * @param {type} data_song
                     * @returns {.Q@call;defer.promise}
                     */
                    function create(data_target, data_song, data_fcm, data_score) {
                        var deferred = Q.defer();
                        var ctr = 0;
                        var user_id = user.id;
                        var song_id = data_song.song.id;
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        var hash = shasum.digest('hex');
                        var arr_err = [];
                        var arr_data = [];
                        data_target.forEach(function (id_target, index) {
                            var hash_new = hash + index;
                            Challenges.create({
                                hash: hash_new,
                                user_id: user.id,
                                user_target: id_target,
                                song_id: song_id,
                                final_score_user_id: data_score,
                                status: 0
                            }).exec(function (err, register) {
                                ctr++;

                                if (err) {
                                    var errorValidate = JSON.stringify(err);
                                    obj = JSON.parse(errorValidate);
                                    if (obj.error == "E_VALIDATION") {
                                        if (obj.Errors) {
                                            if (obj.Errors.hash) {
                                                create(data_target, data_song);
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

                                if (register) {
                                    arr_data.push(register);
                                    if (ctr === data_target.length) {
                                        deferred.resolve({type: true, data: arr_data, data_error: arr_err});

                                        //start push
                                        try {
                                            send_push.push({
                                                token_fcm: data_fcm,
                                                collapse_key: 'add_challenge',
                                                title: 'バトル',
                                                body: '新規バトルリクエストありました。',
                                                data: {
                                                    view_type: 'listChallenge',
                                                }
                                            }, function (err, data) {
                                                if (err) {
                                                    sails.log.error(err);
                                                }
                                                if (data) {
                                                    sails.log.info(data);
                                                }
                                            })
                                        } catch (e) {
                                            //save log
                                            log.save({
                                                controller: 'Challenge',
                                                action: 'addChallenge',
                                                message: 'push addfriend error',
                                                data: req.body
                                            }, {error: e}
                                            , function (err) {
                                                console.log(err || "save log!");
                                            })
                                        }
                                    }
                                }
                            });
                        });
                        // save data push
                        try {
                            create_push(data_target).then(function (data_push) {

                            }).catch(function (err) {
                                log.save({
                                    controller: 'Challenge',
                                    action: 'addChallenge',
                                    message: 'err create data push addchallenge',
                                    data: req.body
                                }, {error: err}
                                , function (e) {
                                    console.log(e || "save log!");
                                })
                            });
                        } catch (e) {

                        }
                        return deferred.promise;
                    }
                }
            })
        } catch (e) {
            log.save({
                controller: 'Challenge',
                action: 'addChallenge',
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
     * list letter challenge
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listChallenge: function (req, res) {
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
                    if (req.body.page) {
                        page = req.body.page;
                    }
                    /**
                     * find data by user.id
                     */
                    Challenges.find({user_target: user.id, status: 0})
                            .populate('user_id')
                            .populate('song_id')
                            .paginate({page: page, limit: 10})
                            .exec(function (err, data) {
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Challenge',
                                        action: 'listChallenge',
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
                                            var myObj = {}, key, value;
                                            // Object in format {key: value}
                                            myObj['hash'] = data[index].hash;
                                            myObj['user_target'] = data[index].user_target;
                                            myObj['final_score_user_id'] = data[index].final_score_user_id;
                                            myObj['final_score_target_id'] = data[index].final_score_target_id;
                                            myObj['status'] = data[index].status;
                                            myObj['data_song'] = {
                                                hash: data[index].song_id.hash,
                                                artist: data[index].song_id.artist,
                                                singer: data[index].song_id.singer,
                                                song_name: data[index].song_id.song_name,
                                                path: data[index].song_id.path,
                                                icon: data[index].song_id.icon,
                                                img_ct: data[index].song_id.img_ct,
                                                createdAt: convertDBDatetimeToJSDatetime(data[index].song_id.createdAt),
                                            }
                                            myObj['data_user'] = {
                                                hash: data[index].user_id.hash,
                                                avatar: data[index].user_id.avatar,
                                                username: data[index].user_id.username,
                                                city: data[index].user_id.city,
                                                age: data[index].user_id.age,
                                                sex: data[index].user_id.sex,
                                                year_of_birth: data[index].user_id.year_of_birth,
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
                                        //save log
                                        log.save({
                                            controller: 'Challenge',
                                            action: 'listChallenge',
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
            //save log
            log.save({
                controller: 'Challenge',
                action: 'listChallenge',
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
     * accept challenge
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    acceptChallenge: function (req, res) {
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
                    upload_recorde().then(function (data_rc) {
                        if (data_rc.type == true) {
                            get_song_id().then(function (data_song) {
                                if (data_song.type == true) {
                                    // call api scoring
                                    try {
                                        var path_file = data_rc.path.split('record_audio')
                                        var data = {
                                            AudioFile: data_rc.path,
                                            MidiFile: data_song.song.path_midi,
//                                            AudioFile: 'http://karaoke.brite.vn/record_audio/8/15222874611238/1d338ae2-7af6-4a00-b346-0c43569bd664.aac',
//                                            MidiFile: 'http://karaoke.brite.vn/mids/5cd915dc-730d-422b-b705-d7d52f245370.mid',
                                            user_id: user.id,
                                        }
                                        request.post({url: 'http://karaokescore.brite.vn/App.php', form: data}, function (err, httpResponse, body) {
                                            console.log(httpResponse.body);
                                            if (err) {
                                                //save log
                                                log.save({
                                                    controller: 'Challenge',
                                                    action: 'acceptChallenge',
                                                    data: req.body
                                                }, {error: err}
                                                , function (e) {
                                                    console.log(e || "save log!");
                                                })
                                                return res.json({
                                                    code: 0,
                                                    message: 'error',
                                                    data: 'call api score'
                                                });
                                            } else {
//                                        delete file
                                                try {
                                                    fs.unlinkSync("assets/record_audio" + path_file.slice(-1).pop());
                                                } catch (e) {
                                                    sails.log.error('delete file score' + e);
                                                }

                                                /**
                                                 * update final score
                                                 * @type type
                                                 */
                                                var data_update = {final_score_target_id: Number(body), status: 1}
                                                Challenges.update({hash: req.body.hash}, data_update).exec(function (err, update) {
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
                                                                controller: 'Challenge',
                                                                action: 'acceptChallenge',
                                                                data: req.body
                                                            }, {error: err}
                                                            , function (e) {
                                                                console.log(e || "save log!");
                                                            })
                                                            return res.json({
                                                                code: 4,
                                                                message: 'error',
                                                                data: consts.apiServer
                                                            });
                                                        }
                                                    }
                                                    if (update) {
                                                        Challenges.findOne({hash: req.body.hash})
                                                                .populate('user_id')
                                                                .populate('song_id')
                                                                .exec(function (err, data) {
                                                                    if (err) {
                                                                        //save log
                                                                        log.save({
                                                                            controller: 'Challenge',
                                                                            action: 'acceptChallenge',
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
                                                                            var myObj = {};
                                                                            myObj['hash'] = data.hash;
                                                                            myObj['user_target'] = data.user_target;
                                                                            myObj['final_score_user_id'] = data.final_score_user_id;
                                                                            myObj['final_score_target_id'] = data.final_score_target_id;
                                                                            myObj['status'] = data.status;
                                                                            myObj['data_song'] = {
                                                                                hash: data.song_id.hash,
                                                                                artist: data.song_id.artist,
                                                                                singer: data.song_id.singer,
                                                                                song_name: data.song_id.song_name,
                                                                                path: data.song_id.path,
                                                                                icon: data.song_id.icon,
                                                                                img_ct: data.song_id.img_ct,
                                                                                createdAt: convertDBDatetimeToJSDatetime(data.song_id.createdAt),
                                                                            }
                                                                            myObj['data_user'] = {
                                                                                hash: data.user_id.hash,
                                                                                avatar: data.user_id.avatar,
                                                                                username: data.user_id.username,
                                                                                city: data.user_id.city,
                                                                                age: data.user_id.age,
                                                                                sex: data.user_id.sex,
                                                                                year_of_birth: data.user_id.year_of_birth,
                                                                            }
                                                                            // save data push
                                                                            try {
                                                                                create_push(data.user.id).then(function (data_push) {

                                                                                }).catch(function (err) {
                                                                                    //save log
                                                                                    log.save({
                                                                                        controller: 'Challenge',
                                                                                        action: 'acceptChallenge',
                                                                                        data: req.body
                                                                                    }, {error: err}
                                                                                    , function (e) {
                                                                                        console.log(e || "save log!");
                                                                                    })
                                                                                });
                                                                            } catch (e) {
                                                                                //save log
                                                                                log.save({
                                                                                    controller: 'Challenge',
                                                                                    action: 'acceptChallenge',
                                                                                    data: req.body
                                                                                }, {error: err}
                                                                                , function (e) {
                                                                                    console.log(e || "save log!");
                                                                                })
                                                                            }
                                                                            //push app
                                                                            try {
                                                                                send_push.push({
                                                                                    token_fcm: [data.user_id.token_fcm],
                                                                                    collapse_key: 'accept_challenge',
                                                                                    title: 'バトル',
                                                                                    body: 'バトルリクエストを承認しました。',
                                                                                    data: {
                                                                                        view_type: 'detail_challenge',
                                                                                        hash: data.hash
                                                                                    }
                                                                                }, function (err, data) {
                                                                                    if (err) {
                                                                                        //save log
                                                                                        log.save({
                                                                                            controller: 'Challenge',
                                                                                            action: 'acceptChallenge',
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
                                                                                //save log
                                                                                log.save({
                                                                                    controller: 'Challenge',
                                                                                    action: 'acceptChallenge',
                                                                                    data: req.body
                                                                                }, {error: e}
                                                                                , function (err) {
                                                                                    console.log(err || "save log!");
                                                                                })
                                                                            }
                                                                            // Adding the object to the main array
                                                                            return res.json({
                                                                                code: 1,
                                                                                message: 'success',
                                                                                data: myObj
                                                                            });
                                                                        } catch (e) {
                                                                            //save log
                                                                            log.save({
                                                                                controller: 'Challenge',
                                                                                action: 'acceptChallenge',
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
                                                    }
                                                })
                                            }
                                        })
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Challenge',
                                            action: 'acceptChallenge',
                                            data: req.body
                                        }, {error: e}
                                        , function (err) {
                                            console.log(err || "save log!");
                                        })
                                    }
                                } else {
                                    console.log(err + 'err get_song_id ChallengesController');
                                    return res.json({
                                        code: 0,
                                        message: 'error',
                                        message: consts.apiServer + ' or ' + consts.songNotExist
                                    });
                                }

                            }).catch(function (err) {
                                console.log(err + 'err get_song_id ChallengesController');
                                return res.json({
                                    code: 4,
                                    message: consts.apiServer
                                });
                            });
                        } else {
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: {
                                    file_recorde: '入力して下さい。'
                                }
                            });
                        }


                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Challenge',
                            action: 'acceptChallenge',
                            message: 'upload_recorde',
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
                            user_id: data_target,
                            title: 'バトル',
                            type_push: 'acceptChallenge',
                            status: 0
                        }).exec(function (err, register) {
                            ctr++;
                            if (err) {
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
                     * upload file recording
                     * @param {type} user_id
                     * @returns {.Q@call;defer.promise}
                     */
                    function upload_recorde() {
                        var deferred = Q.defer();
                        var path_recorde;
                        var path_save = user.id + '/' + new Date().getTime() + user.id;
                        req.file('file_recorde') // this is the name of the file in your multipart form
                                .upload({
                                    // optional
                                    // dirname: [SOME PATH TO SAVE IN A CUSTOM DIRECTORY]
                                    maxBytes: 250000000000,
                                    dirname: '../../assets/record_audio/' + path_save,
                                }, function (err, uploads) {
                                    // try to always handle errors
                                    if (err) {
                                        return res.json({
                                            code: 0,
                                            message: 'error',
                                            data: consts.uploadRecorde
                                        });
                                    }
//                             uploads is an array of files uploaded 
                                    if (uploads.length === 0) {
                                        deferred.resolve({type: false, path: null});
                                    } else {

                                        var str = uploads[0].fd;
                                        var arr = str.split("/");
                                        path_recorde = 'http://karaoke.brite.vn/record_audio/' + path_save + '/' + arr.slice(-1).pop();
                                        deferred.resolve({type: true, path: path_recorde, file_name: uploads[0].filename});
                                    }
                                })
                        return deferred.promise;
                    }
                    /**
                     * get song id by song_hash
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_song_id() {

                        var deferred = Q.defer();
                        Songs.findOne({select: ['id', 'path_midi'], where: {hash: req.body.song_hash}}, function (err, get_song_id) {
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

                    function convertDBDatetimeToJSDatetime(date) {
                        return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                    }
                }
            })
        } catch (e) {
            //save log
            log.save({
                controller: 'Challenge',
                action: 'acceptChallenge',
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
     * delete record challenge
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    declineChallenge: function (req, res) {
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
                    Challenges.destroy({hash: req.body.hash}).exec(function (err, destroy) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Challenge',
                                action: 'declineChallenge',
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
                                data: consts.deleteChallengeEr
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
        } catch (e) {
            //save log
            log.save({
                controller: 'Challenge',
                action: 'declineChallenge',
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
     * result challenge
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    detailChallenge: function (req, res) {
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
                    /**
                     * find record by hash
                     */
                    Challenges.findOne({hash: req.body.hash})
                            .populate('user_id')
                            .populate('song_id').exec(function (err, data) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Challenge',
                                action: 'detailChallenge',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return res.json({
                                code: 4,
                                message: 'error',
                                data: consts.apiServer
                            });
                        }
                        if (!data) {
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: null
                            });
                        } else {

                            var myObj = {}
                            // Object in format {key: value}
                            myObj['hash'] = data.hash;
                            myObj['user_target'] = data.user_target;
                            myObj['final_score_user_id'] = data.final_score_user_id;
                            myObj['final_score_target_id'] = data.final_score_target_id;
                            myObj['status'] = data.status;
                            myObj['data_song'] = {
                                hash: data.song_id.hash,
                                artist: data.song_id.artist,
                                singer: data.song_id.singer,
                                song_name: data.song_id.song_name,
                                path: data.song_id.path,
                                icon: data.song_id.icon,
                                img_ct: data.song_id.img_ct,
                                createdAt: convertDBDatetimeToJSDatetime(data.song_id.createdAt),
                            }
                            myObj['data_user'] = {
                                hash: data.user_id.hash,
                                username: data.user_id.username,
                                city: data.user_id.city,
                                age: data.user_id.age,
                                sex: data.user_id.sex,
                                year_of_birth: data.user_id.year_of_birth,
                            }

                            return res.json({
                                code: 1,
                                message: 'success',
                                data: myObj
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
                }
            })
        } catch (e) {
            //save log
            log.save({
                controller: 'Challenge',
                action: 'detailChallenge',
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
    tournamentNormal: function (req, res) {
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

            }
        })
    },
};

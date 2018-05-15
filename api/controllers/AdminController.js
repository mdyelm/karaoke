/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');
var log = require('../services/log');
var crypto = require('crypto');
var consts = require('../services/const');
var moment = require('moment-timezone');
module.exports = {
    index: function (req, res) {
        res.view('admins/home', {layout: 'layout_admin', nav: 'home'})
    },
    profile: function (req, res) {
        res.view('admins/profile', {layout: 'layout_admin', nav: 'profile'})
    },
    user: function (req, res) {
        res.view('admins/user', {layout: 'layout_admin', nav: 'user', title: 'User'})
    },
    song: function (req, res) {
        res.view('admins/song', {layout: 'layout_admin', nav: 'song', title: 'Song'})
    },
    add_upload: function (req, res) {
        res.view('admins/upload', {layout: 'layout_admin', nav: 'list_song', title: 'Song'})
    },
    rank: function (req, res) {
        res.view('admins/rank', {layout: 'layout_admin', nav: 'rank', title: 'Rank'})
    },
    contact: function (req, res) {
        res.view('admins/contact', {layout: 'layout_admin', nav: 'contact', title: 'Contact'})
    },
    request: function (req, res) {
        res.view('admins/request', {layout: 'layout_admin', nav: 'request', title: 'Request'})
    },
    event: function (req, res) {
        res.view('admins/event', {layout: 'layout_admin', nav: 'event', title: 'Event'})
    },
    add_event: function (req, res) {
        res.view('admins/add_event', {layout: 'layout_admin', nav: 'event', title: 'Event'})
    },
    add_team: function (req, res) {
        res.view('admins/add_team', {layout: 'layout_admin', event_id: req.param('id'), arr_city: consts.city, nav: 'event', title: 'Event'})
    },
    /**
     * upload music
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    create_upload: async function (req, res) {
        /**
         * upload file song
         * @type Promise
         */
        var song_p = new Promise((resolve, reject) => {
            req.file('song').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/file_songs'
            }, function (err, data_song) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_song.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'song'});
                    } else {
                        resolve({status: true, data: data_song});
                    }
                }

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'create_upload',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * upload file song full
         * @type Promise
         */
        var song_full_p = new Promise((resolve, reject) => {
            req.file('song_full').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/file_song_full'
            }, function (err, data_song_full) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_song_full.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'song_full'});
                    } else {
                        resolve({status: true, data: data_song_full});
                    }
                }

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'create_upload',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * upload file song midis
         * @type Promise
         */
        var midi_p = new Promise((resolve, reject) => {
            req.file('file_midi').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/midis'
            }, function (err, data_song_midi) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_song_midi.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'file_midi'});
                    } else {
                        resolve({status: true, data: data_song_midi});
                    }
                }
//              

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'create_upload',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * upload file song midis
         * @type Promise
         */
        var icon_p = new Promise((resolve, reject) => {
            req.file('icon').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/icon_song'
            }, function (err, data_icon) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_icon.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'icon'});
                    } else {
                        resolve({status: true, data: data_icon});
                    }
                }
//              

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'create_upload',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * upload file song midis
         * @type Promise
         */
        var imt_ct_p = new Promise((resolve, reject) => {
            req.file('img_ct').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/img_ct_song'
            }, function (err, data_img_ct) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_img_ct.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'img_ct'});
                    } else {
                        resolve({status: true, data: data_img_ct});
                    }
                }
//              

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'create_upload',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * start
         */
        Promise.all([song_p, song_full_p, midi_p, icon_p, imt_ct_p]).then(values => {
            var arr_error = [];
            var msg_error = {};
            var data;
            values.forEach(function (el, index) {
                if (el.status == false) {
                    arr_error.push(el.data);
                } else if (el.status == true && el.data == null) {
                    data = {key: el.key, data: el.message}
                    arr_error.push(data);
                    msg_error[el.key] = el.message
                }
            });
            if (!req.body.singer || req.body.singer == '') {
                arr_error.push({key: 'singer', data: '入力して下さい。'});
                msg_error['singer'] = '入力して下さい。'
            }
            if (!req.body.song_name || req.body.song_name == '') {
                arr_error.push({key: 'song_name', data: '入力して下さい。'});
                msg_error['song_name'] = '入力して下さい。'
            }
            return {data: values, arr_error: arr_error, msg_error: msg_error}
        }).then(function (results) {
            if (!results.arr_error || results.arr_error == '') {
                var singer = req.body.singer;
                var song_name = req.body.song_name;
//                get hash
                var shasum = crypto.createHash('sha1');
                shasum.update(new Date().toJSON());
                var hash = shasum.digest('hex');
                var data_icon, data_song_full, data_img_ct, data_midi, data_song, file_name_song_full, file_name_song, path_name_song, file_name_icon, file_name_img, file_name_midi;
                results.data.forEach(function (item) {
                    if (item.data[0].field == 'song') {
                        data_song = item.data;
                    } else if (item.data[0].field == 'song_full') {
                        data_song_full = item.data;
                    } else if (item.data[0].field == 'file_midi') {
                        data_midi = item.data;
                    } else if (item.data[0].field == 'icon') {
                        data_icon = item.data;
                    } else if (item.data[0].field == 'img_ct') {
                        data_img_ct = item.data;
                    }
                })

//                        path name song
                var arr_song = data_song[0].fd.split("/");
//                        path name song full
                var arr_song_full = data_song_full[0].fd.split("/");
//                      path name midi
                var arr_midi = data_midi[0].fd.split("/");
//                      path name icon
                var arr_icon = data_icon[0].fd.split("/");
//                      file name img_ct
                var arr_img = data_img_ct[0].fd.split("/");
//                      file name song
                var arr_name_song = data_song[0].filename.split(".");
//                    file_name = sails.getBaseUrl() + '/songs/' + arr_song[1];
                file_name_song = arr_name_song[0];
                path_name_song = 'http://karaoke.brite.vn/file_songs/' + arr_song.slice(-1).pop();
                path_name_song_full = 'http://karaoke.brite.vn/file_song_full/' + arr_song_full.slice(-1).pop();
                file_name_icon = 'http://karaoke.brite.vn/icon_song/' + arr_icon.slice(-1).pop();
                file_name_img = 'http://karaoke.brite.vn/img_ct_song/' + arr_img.slice(-1).pop();
                file_name_midi = 'http://karaoke.brite.vn/mids/' + arr_midi.slice(-1).pop();
//                        save data
                Songs.create({
                    path: path_name_song,
                    path_full: path_name_song_full,
                    path_midi: file_name_midi,
                    icon: file_name_icon,
                    img_ct: file_name_img,
                    singer: singer,
                    song_name: song_name,
                    hash: hash
                }).exec(function (err, file) {
                    if (err) {
                        var errorValidate = JSON.stringify(err);
                        obj = JSON.parse(errorValidate);
                        if (obj.error == "E_VALIDATION") {
                            return res.json({
                                status: 403,
                                data: obj.Errors
                            });
                        } else {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'uploadSong',
                                data: req.body
                            }, {error: err}
                            , function (e) {
                                console.log(e || "save log!");
                            })
                            return console.log(err)
                        }
                    } else {
                        return res.json({
                            status: 200,
                            data: file
                        });
//                        return res.view('admins/upload', {datas: file, status: 200, layout: 'layout_admin'})
                    }
                })
            } else {
                return res.json({
                    status: 403,
                    data: results,
                    msg_error: results.msg_error
                });
//                return res.view('admins/upload', {datas: results, status: 500, msg_error: results.msg_error, layout: 'layout_admin'})
            }

        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'uploadSong',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            console.log(err.message); // some coding error in handling happened
        });
    },
    /**
     * get list all user ajax
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    ajax_list_user: function (req, res) {

        var page = req.body.draw;
        Users.count(function (err, num) {
            if (err) {
                return console.log(err);
            } else {
                Users.find()
                        .paginate({page: page, limit: 10})
                        .exec(function (err, data) {
                            if (err) {
                                return res.json({
                                    status: 400,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            } else {
                                var result = [];
                                data.forEach(function (el, index) {
                                    if (typeof (el.avatar) && el.avatar != null) {
                                        var arr = el.avatar.split("/");
                                        var avatar = "/avatar/" + arr.slice(-1).pop();
                                    } else {
                                        var avatar = '/avatar/';
                                    }
                                    el['avatar_user'] = "<img src='" + avatar + "' class='avatar_list_user'>";
                                    el['action'] = "<a href='/admin/edit_user/" + el.id + "' class='btn btn-primary'>Edit</a>";
                                    el['action'] += "<button data-id='" + el.id + "' class='btn btn-danger delete_user' style='margin-left:5px'>Delete</button>";
                                    result.push(el);
                                });
                                return res.json({
                                    status: 200,
                                    recordsTotal: num,
                                    recordsFiltered: num,
                                    data: result,
                                });
                            }
                        });
            }

        });
    },
    /**
     * delete all data user by id
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    delete_user: function (req, res) {

        /**
         * start delete record
         * @type Promise
         */
        var d_history = new Promise((resolve, reject) => {
            Histories.destroy({user_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Histories'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_history',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_contact = new Promise((resolve, reject) => {
            Contacts.destroy({user_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_contact',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_song_ratings = new Promise((resolve, reject) => {
            song_ratings.destroy({user_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_song_ratings',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_relationships = new Promise((resolve, reject) => {
            Relationships.destroy({
                or: [
                    {user_one_id: req.body.id},
                    {user_two_id: req.body.id}
                ]
            }).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_relationships',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_pushs = new Promise((resolve, reject) => {
            Pushs.destroy({
                or: [
                    {user_id: req.body.id},
                    {user_id_target: req.body.id}
                ]
            }).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_pushs',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_playlists = new Promise((resolve, reject) => {
            Playlists.destroy({user_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_playlists',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_duet_invitations = new Promise((resolve, reject) => {
            duet_invitations.destroy({
                or: [
                    {user_id: req.body.id},
                    {target_id: req.body.id}
                ]
            }).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_duet_invitations',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_challenges = new Promise((resolve, reject) => {
            Challenges.destroy({
                or: [
                    {user_id: req.body.id},
                    {user_target: req.body.id}
                ]
            }).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_challenges',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_categories = new Promise((resolve, reject) => {
            Categories.destroy({id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_categories',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        var d_users = new Promise((resolve, reject) => {
            Users.destroy({id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                message: 'd_users',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * end delete recode
         */

        Promise.all([d_history, d_contact, d_song_ratings, d_relationships, d_pushs, d_playlists, d_duet_invitations, d_challenges, d_categories, d_users]).then(values => {
            var arr_error = [];
            var check_err = true;
            values.forEach(function (el, index) {
                if (el.status == false) {
                    arr_error[el.key] = false;
                    check_err = false
                }
            });
            return {data: values, arr_error: arr_error, check_err: check_err}
        }).then(function (results) {
            if (results.check_err == true) {
                return res.json({
                    status: 204,
                    data: {'message': 'detele user success'}
                });
            } else {

                return res.json({
                    status: 400,
                    data: {'message': 'delete user error'},
                });
//    

            }
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_user',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            console.log(err.message); // some coding error in handling happened
        });
    },
    /**
     * ajax get list all song 
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    ajax_list_song: function (req, res) {
        var page = req.body.draw;
        Songs.count(function (err, num) {
            if (err) {
                return console.log(err);
            } else {
                Songs.find()
                        .paginate({page: page, limit: 10})
                        .exec(function (err, data) {
                            if (err) {
                                return res.json({
                                    status: 500,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            } else {
                                var result = [];
                                data.forEach(function (el, index) {
                                    el['path'] = "<a href='" + el.path + "' data-sn='" + el.song_name + "' data-sg='" + el.singer + "' class='trigger btn btn-primary'>watch video</a>";
                                    el['path_full'] = "<a href='" + el.path_full + "' data-sn='" + el.song_name + "' data-sg='" + el.singer + "' class='trigger btn btn-primary'>watch video</a>";
                                    // split url icon
                                    if (typeof (el.icon) && el.icon != null) {
                                        var arr_icon = el.icon.split("/");
                                        var icon = "/icon_song/" + arr_icon.slice(-1).pop();
                                    } else {
                                        var icon = '/icon_song/';
                                    }
                                    // split url img_ct
                                    if (typeof (el.img_ct) && el.img_ct != null) {
                                        var arr_img_ct = el.img_ct.split("/");
                                        var img_ct = "/img_ct_song/" + arr_img_ct.slice(-1).pop();
                                    } else {
                                        var img_ct = '/img_ct_song/';
                                    }
                                    el['icon'] = "<img src='" + icon + "' class='img_list_song'>";
                                    el['img_ct'] = "<img src='" + img_ct + "' class='img_list_song'>";
                                    el['action'] = "<a href='/admin/edit_song/" + el.id + "' class='btn btn-primary'>Edit</a>";
                                    el['action'] += "<button data-id='" + el.id + "' class='btn btn-danger delete_song' style='margin-left:5px'>Delete</button>";
                                    result.push(el);
                                });
                                return res.json({
                                    status: 200,
                                    recordsTotal: num,
                                    recordsFiltered: num,
                                    data: result,
                                });
                            }
                        });
            }

        });
    },
    /**
     * ajax delete all data song by id
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    delete_song: function (req, res) {

        /**
         * start delete record
         * @type Promise
         */
        var d_midis = new Promise((resolve, reject) => {
            Midis.destroy({song_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Midis'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                message: 'd_midis',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /*-------------------------------------*/
        var d_challenges = new Promise((resolve, reject) => {
            Challenges.destroy({song_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                message: 'd_challenges',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /*-------------------------------------*/
        var d_history = new Promise((resolve, reject) => {
            Histories.destroy({song_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Histories'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                message: 'd_history',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /*-------------------------------------*/
        var d_events = new Promise((resolve, reject) => {
            Events.destroy({song_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Events'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                message: 'd_events',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /*-------------------------------------*/

        var d_song_ratings = new Promise((resolve, reject) => {
            song_ratings.destroy({song_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Contacts'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_songs',
                message: 'd_song_ratings',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /*-------------------------------------*/

        var d_songs = new Promise((resolve, reject) => {

            Songs.destroy({id: req.body.id}).exec(function (err) {
                if (err) {
                    console.log(err);
                    resolve({status: false, data: err, key: 'err_Songs'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                message: 'd_songs',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /*-------------------------------------*/

        var d_playlists = new Promise((resolve, reject) => {
            Playlists.destroy({song_id: req.body.id}).exec(function (err) {
                if (err) {
                    resolve({status: false, data: err, key: 'err_Playlists'});
                } else {
                    resolve({status: true});
                }
            });
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                message: 'd_playlists',
                data: req.body.id
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * end delete recode
         */

        Promise.all([d_history, d_song_ratings, d_midis, d_playlists, d_challenges, d_songs, d_events]).then(values => {
            var arr_error = [];
            var check_err = true;
            values.forEach(function (el, index) {
                if (el.status == false) {
                    arr_error[el.key] = false;
                    check_err = false
                }
            });
            return {data: values, arr_error: arr_error, check_err: check_err}
        }).then(function (results) {
            if (results.check_err == true) {
                return res.json({
                    status: 204,
                    data: {'message': 'detele song success'}
                });
            } else {
                return res.json({
                    status: 400,
                    data: {'message': 'delete song error'},
                });
//    
            }
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'delete_song',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            console.log(err.message); // some coding error in handling happened
        });
    },
    /**
     * edit a song details
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    edit_song: function (req, res) {
        if (req.param('id')) {
            Songs.findOne({
                id: req.param('id')
            }).exec(function (err, find) {
                if (err) {
                    return res.serverError(err);
                }
                if (!find) {
                    return res.notFound('Could not find, sorry.');
                }
                res.view('admins/edit_song', {datas: find, layout: 'layout_admin', nav: 'upload'})
            });
        } else {
            res.view('admins/song', {layout: 'layout_admin', nav: 'upload'})
        }
    },
    /**
     * save data edit a song details
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    save_edit_song: function (req, res) {
        var id = req.body.id;
        var singer = req.body.singer;
        var song_name = req.body.song_name;
        if (req.body.id) {
            Songs.update({id: id}, {song_name: song_name, singer: singer}).exec(function afterwards(err, updated) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    return res.json({
                        status: 500,
                        msg_error: obj
                    });
                } else {
                    return res.json({
                        status: 200,
                        data: updated
                    });
                }
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    },
    /**
     * edit a user details
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    edit_user: function (req, res) {
        if (req.param('id')) {
            Users.findOne({
                id: req.param('id')
            }).exec(function (err, find) {
                if (err) {
                    return res.serverError(err);
                }
                if (!find) {
                    return res.notFound('Could not find, sorry.');
                }
                res.view('admins/edit_user', {datas: find, arr_city: consts.city, layout: 'layout_admin', nav: 'user'})
            });
        } else {
            res.view('admins/user', {layout: 'layout_admin', nav: 'upload'})
        }
    },
    /**
     * save data edit a song details
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    save_edit_user: function (req, res) {
        var id = req.body.id;
        if (req.body.id) {
            Users.update({id: id}, req.body).exec(function afterwards(err, updated) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    return res.json({
                        status: 404,
                        msg_error: obj.Errors
                    });
                } else {
                    return res.json({
                        status: 200,
                        data: updated
                    });
                }
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    },
    /**
     * the rating of the song
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    ajax_list_rank_score: function (req, res) {
        try {
            var sort;
            var page;
            var sort = 'final_score DESC';
            if (req.body.sort == 'DESC' || req.body.sort == 'ASC') {
                sort = 'final_score' + ' ' + req.body.sort;
            }
            if (!req.body.page) {
                page = 1;
            } else {
                page = req.body.page;
            }
            var lastday = function (y, m) {
                return  new Date(y, m, 0).getDate();
            }
            var date = new Date();
            if (req.body.type == 1) {
                date.setMonth(11);
                date.setDate(1);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                getEndDate = lastday(year, month);
                var startDate = (year + '-' + 01 + '-' + 01 + ' ' + '00:00:00');
                var endDate = (year + '-' + month + '-' + getEndDate + ' ' + '23:59:59');
            } else if (req.body.type == 2) {
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                getEndDate = lastday(year, month);
                var startDate = (year + '-' + month + '-' + 01 + ' ' + '00:00:00');
                var endDate = (year + '-' + month + '-' + getEndDate + ' ' + '23:59:59');
            } else {
                var firstday = new Date(date.setDate(date.getDate() - date.getDay() + 1));
                var lastday = new Date(date.setDate(date.getDate() - date.getDay() + 7));
                var startDate = (firstday.getFullYear() + '-' + (firstday.getMonth() + 1) + '-' + firstday.getDate() + ' ' + '00:00:00');
                var endDate = (lastday.getFullYear() + '-' + (lastday.getMonth() + 1) + '-' + lastday.getDate() + ' ' + '23:59:59');
            }
            song_ratings.count({'createdAt': {'>=': startDate, '<=': endDate}, 'final_score': {'!': null}}).exec(function (err, cnt) {
                if (err) {
                    return console.log(err);
                } else {
                    var list = song_ratings.find();
                    list.where({'createdAt': {'>=': startDate, '<=': endDate}, 'final_score': {'!': null}});
                    list.populate('song_id');
                    list.populate('user_id');
                    list.sort(sort);
                    list.paginate({page: page, limit: 10});
                    list.exec(function (err, songs) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'listRankScoreOfWeek',
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
                        // An array to store all the final user objects
                        try {
                            if (!songs) {
                                return res.json({
                                    status: 204,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            } else {
//                        console.log(songs);
                                var result = [];
                                var data_tmp = {};
                                songs.forEach(function (el, index) {
                                    data_tmp = {};
                                    data_tmp['path'] = "<a href='" + el.path + "' data-sn='" + el.song_id.song_name + "' data-sg='" + el.song_id.singer + "' class='trigger btn btn-primary'>watch video</a>";
//                            el['icon'] = "<img src='" + el.icon + "' style='width:200px'>";
//                            el['img_ct'] = "<img src='" + el.img_ct + "' style='width:200px'>";
                                    data_tmp['username'] = el.user_id.username;
                                    data_tmp['uuid'] = el.user_id.uuid;
                                    data_tmp['song_name'] = el.song_id.song_name;
                                    data_tmp['final_score'] = el.final_score;
//                            data_tmp['action'] = "<a href='/admin/edit_song/" + el.id + "' class='btn btn-primary'>Edit</a>";
                                    data_tmp['action'] = "<button data-id='" + el.id + "' class='btn btn-danger delete_rank' style='margin-left:5px'>Delete</button>";
                                    result.push(data_tmp);
                                });
                                // This will be sent/returned to AJAX
                                return res.json({
                                    status: 200,
                                    recordsTotal: cnt,
                                    recordsFiltered: cnt,
                                    data: result,
                                });
                            }
                        } catch (err) {
                            //save log
                            log.save({
                                controller: 'Admin',
                                action: 'ajax_list_rank_score',
                                message: 'list rank of week assignedArray err',
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
                    });
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'ajax_list_rank_score',
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
     * delete recorde by id
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    delete_rank: function (req, res) {
        song_ratings.destroy({id: req.body.id}).exec(function (err) {
            if (err) {
                return res.json({
                    status: 400,
                    data: {'message': 'detele error'}
                });
            } else {
                return res.json({
                    status: 204,
                    data: {'message': 'detele success'}
                });
            }
        });
    },
    /**
     * get data contact all user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    ajax_list_contact: function (req, res) {

        var page = req.body.draw;
        Contacts.count(function (err, num) {
            if (err) {
                return console.log(err);
            } else {
                Contacts.find()
                        .populate('user_id')
                        .paginate({page: page, limit: 10})
                        .exec(function (err, data) {
                            if (err) {
                                return res.json({
                                    status: 400,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            } else {
                                var result = [];
                                data.forEach(function (el, index) {
                                    el['username'] = el.user_id.username;
                                    if (typeof (el.user_id) && el.user_id.avatar != null) {
                                        var arr = el.user_id.avatar.split("/");
                                        var avatar_user = "/avatar/" + arr.slice(-1).pop();
                                    } else {
                                        var avatar_user = '/avatar/';
                                    }
                                    el['avatar_user'] = "<img src='" + avatar_user + "' class='img_list_contact'>";
                                    el['action'] = "<a href='/admin/detail_contact/" + el.id + "' class='btn btn-primary'>Detail</a>";
                                    el['action'] += "<button data-id='" + el.id + "' class='btn btn-danger delete_contact' style='margin-left:5px;'>Delete</button>";
                                    result.push(el);
                                });
                                return res.json({
                                    status: 200,
                                    recordsTotal: num,
                                    recordsFiltered: num,
                                    data: result,
                                });
                            }
                        });
            }

        });
    },
    detail_contact: function (req, res) {
        if (req.param('id')) {
            Contacts.findOne({id: req.param('id')})
                    .populate('user_id')
                    .exec(function (err, find) {
                        if (err) {
                            return res.serverError(err);
                        }
                        if (!find) {
                            res.view('admins/contact', {layout: 'layout_admin', nav: 'contact'})
                        } else {
                            if (typeof (find.user_id.avatar) && find.user_id.avatar != null) {
                                var arr = find.user_id.avatar.split("/");
                                var avatar_user = "/avatar/" + arr.slice(-1).pop();
                                find.user_id.avatar = avatar_user;
                            } else {
                                find.user_id.avatar = '/avatar/';
                            }
                            res.view('admins/detail_contact', {datas: find, layout: 'layout_admin', nav: 'contact'})
                        }
                    });
        } else {
            res.view('admins/contact', {layout: 'layout_admin', nav: 'contact'})
        }
    },
    delete_contact: function (req, res) {
        Contacts.destroy({id: req.body.id}).exec(function (err) {
            if (err) {
                return res.json({
                    status: 400,
                    data: {'message': 'detele error'}
                });
            } else {
                return res.json({
                    status: 204,
                    data: {'message': 'detele success'}
                });
            }
        });
    },
    /**
     * get data request all user
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    ajax_list_request: function (req, res) {
        console.log(req.user);
        var page = req.body.draw;
        Requests.count().exec(function (err, num) {
            if (err) {
                return console.log(err);
            } else {
                Requests.find()
                        .populate('user_id')
                        .paginate({page: page, limit: 10})
                        .exec(function (err, data) {
                            if (err) {
                                return res.json({
                                    status: 400,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            } else {
                                var result = [];
                                data.forEach(function (el, index) {
                                    el['username'] = el.user_id.username;
                                    if (typeof (el.user_id) && el.user_id.avatar != null) {
                                        var arr = el.user_id.avatar.split("/");
                                        var avatar_user = "/avatar/" + arr.slice(-1).pop();
                                    } else {
                                        var avatar_user = '/avatar/';
                                    }
                                    el['avatar_user'] = "<img src='" + avatar_user + "' class='img_list_contact'>";
                                    el['action'] = "<button data-id='" + el.id + "' class='btn btn-danger delete_request'>Delete</button>";
                                    result.push(el);
                                });
                                return res.json({
                                    status: 200,
                                    recordsTotal: num,
                                    recordsFiltered: num,
                                    data: result,
                                });
                            }
                        });
            }

        });
    },
    delete_request: function (req, res) {
        Requests.destroy({id: req.body.id}).exec(function (err) {
            if (err) {
                return res.json({
                    status: 400,
                    data: {'message': 'detele error'}
                });
            } else {
                return res.json({
                    status: 204,
                    data: {'message': 'detele success'}
                });
            }
        });
    },
    /**
     * create event by admin
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    create_event: async function (req, res) {
        /**
         * @type Promise
         */
        var e_img = new Promise((resolve, reject) => {
            req.file('img').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/event'
            }, function (err, data_img) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_img.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'img'});
                    } else {
                        resolve({status: true, data: data_img});
                    }
                }

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'create_event',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * start
         */
        Promise.all([e_img]).then(values => {
            return {data: values}
        }).then(function (results) {
//            get hash
            var shasum = crypto.createHash('sha1');
            shasum.update(new Date().toJSON());
            var hash = shasum.digest('hex');
            var data_icon, file_name_img, start_date, end_date;
            if (typeof req.body.start_date != 'undefined' && req.body.start_date) {
                start_date = req.body.start_date + ' 00:00:00'
            }
            if (typeof req.body.end_date != 'undefined' && req.body.end_date) {
                end_date = req.body.start_date + ' 00:00:00'
            }

            if (results.data[0].data != null) {
                data_song = results.data[0].data;
                var arr_img = data_song[0].fd.split("/");
                file_name_img = '' + arr_img.slice(-1).pop();
            }
            //  save data
            Events.create({
                hash: hash,
                title: req.body.title,
                e_owner_id: req.user.id,
                content: req.body.content,
                start_date: start_date,
                end_date: end_date,
                img: file_name_img,
                status: 0
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
                            controller: 'Admin',
                            action: 'create_event',
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
                controller: 'Admin',
                action: 'create_event',
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
    /**
     * ajax get list all event 
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    ajax_list_event: function (req, res) {
        var page = req.body.draw;
        Events.count({status: 0}).exec(function (err, num) {
            if (err) {
                return console.log(err);
            } else {
                Events.find({status: 0})
                        .paginate({page: page, limit: 10})
                        .populate('e_owner_id')
                        .exec(function (err, data) {
                            if (err) {
                                return res.json({
                                    status: 404,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            } else {
                                var result = [];
                                data.forEach(function (el, index) {
                                    el['start_date'] = convertDBDatetimeToJSDatetime(el.start_date);
                                    el['end_date'] = convertDBDatetimeToJSDatetime(el.end_date);
                                    if (typeof (el.img) && el.img != null) {
                                        var img = "/event/" + el.img;
                                    } else {
                                        var img = '/event/';
                                    }
                                    el['a_username'] = el.e_owner_id.username;
                                    el['img'] = "<img src='" + img + "' class='img_list_event'>";
                                    el['view'] = "<a href='/admin/event/team/" + el.id + "' class='btn btn-info'>View</a>";
                                    el['action'] = "<a href='/admin/edit_event/" + el.id + "' class='btn btn-primary'>Edit</a>";
                                    el['action'] += "<button data-id='" + el.id + "' class='btn btn-danger delete_event' style='margin-left:5px'>Delete</button>";
                                    result.push(el);
                                });
                                return res.json({
                                    status: 200,
                                    recordsTotal: num,
                                    recordsFiltered: num,
                                    data: result,
                                });
                            }
                        });
                function convertDBDatetimeToJSDatetime(date) {
                    return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD HH:mm:ss');
                }
            }

        });
    },
    /**
     * edit a user details
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    edit_event: function (req, res) {
        if (req.param('id')) {
            Events.findOne({
                id: req.param('id')
            }).exec(function (err, find) {
                if (err) {
                    return res.serverError(err);
                }
                if (!find) {
                    return res.notFound('Could not find, sorry.');
                } else {
                    find.start_date = convertDBDatetimeToJSDatetime(find.start_date);
                    find.end_date = convertDBDatetimeToJSDatetime(find.end_date);
                    res.view('admins/edit_event', {datas: find, layout: 'layout_admin', nav: 'event'})
                }
            });
            function convertDBDatetimeToJSDatetime(date) {
                return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY-MM-DD');
            }
        } else {
            res.view('admins/event', {layout: 'layout_admin', nav: 'event'})
        }
    },
    /**
     * edit event by admin
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    save_edit_event: async function (req, res) {
        /**
         * @type Promise
         */
        var e_img = new Promise((resolve, reject) => {
            req.file('img').upload({
                maxBytes: 41943040000,
                dirname: '../../assets/event'
            }, function (err, data_img) {
                if (err) {
                    var errorValidate = JSON.stringify(err);
                    obj = JSON.parse(errorValidate);
                    resolve({status: false, data: obj});
                } else {
                    if (data_img.length === 0) {
                        resolve({status: true, data: null, message: consts.notBlank, key: 'img'});
                    } else {
                        resolve({status: true, data: data_img});
                    }
                }

            })
        }).catch(function (err) {
            //save log
            log.save({
                controller: 'Admin',
                action: 'save_edit_event',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            })
            resolve(err);
        });
        /**
         * start
         */
        Promise.all([e_img]).then(values => {
            return {data: values}
        }).then(function (results) {
//            get hash
            var id = req.body.id;
            var shasum = crypto.createHash('sha1');
            shasum.update(new Date().toJSON());
            var hash = shasum.digest('hex');
            var data_icon, file_name_img;
            if (results.data[0].data != null) {
                data_song = results.data[0].data;
                var arr_img = data_song[0].fd.split("/");
                file_name_img = '' + arr_img.slice(-1).pop();
            }
            var data_update
            if (typeof (file_name_img) != 'undefined') {
                data_update = {
                    hash: hash,
                    title: req.body.title,
                    e_owner_id: req.user.id,
                    content: req.body.content,
                    start_date: req.body.start_date + ' 00:00:00',
                    end_date: req.body.end_date + ' 00:00:00',
                    img: file_name_img,
                    before_id: id
                }
            } else {
                data_update = {
                    hash: hash,
                    title: req.body.title,
                    e_owner_id: req.user.id,
                    content: req.body.content,
                    start_date: req.body.start_date + ' 00:00:00',
                    end_date: req.body.end_date + ' 00:00:00',
                    before_id: id
                }
            }

            //  save data
            Events.update({id: id}, data_update).exec(function (err, file) {
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
                            controller: 'Admin',
                            action: 'create_event',
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
                controller: 'Admin',
                action: 'create_event',
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
    delete_event: function (req, res) {
        Events.update({id: req.body.id}, {status: 1}).exec(function (err) {
            if (err) {
                return res.json({
                    status: 400,
                    data: {'message': 'detele error'}
                });
            } else {
                return res.json({
                    status: 204,
                    data: {'message': 'detele success'}
                });
            }
        });
    },
    team: function (req, res) {
        if (req.param('id')) {
            Events.findOne({id: req.param('id')}, {select: ['id', 'title']}).exec(function (err, data_event) {
                if (err) {
                    return res.view('admins/event', {layout: 'layout_admin', nav: 'event'})
                }
                if (!data_event) {
                    return res.view('admins/event', {layout: 'layout_admin', nav: 'event'})
                } else {
                    Teams.find({
                        event_id: req.param('id')
                    })
                            .populate('user_id_1')
                            .populate('user_id_2')
                            .exec(function (err, find) {
                                if (err) {
                                    res.view('admins/event', {layout: 'layout_admin', nav: 'event'})
                                }
                                if (!find) {
                                    res.view('admins/team', {datas: find, event_id: req.param('id'), arr_city: consts.city, layout: 'layout_admin', nav: 'event'})
                                } else {
                                    var result = {};
                                    result.team_1 = [];
                                    result.team_2 = [];
                                    result.team_3 = [];
                                    result.team_4 = [];
                                    find.forEach(function (el, index) {
                                        if (typeof (el.name) && el.name != null) {
                                            if (el.name == 1) {
                                                result.team_1.push(el)
                                            } else if (el.name == 2) {
                                                result.team_2.push(el)
                                            } else if (el.name == 3) {
                                                result.team_3.push(el)
                                            } else if (el.name == 4) {
                                                result.team_4.push(el)
                                            }
                                        }
                                    });
                                    res.view('admins/team', {result: result, datas: find, data_event: data_event, arr_city: consts.city, layout: 'layout_admin', nav: 'event'})
                                }
                            });
                    function convertDBDatetimeToJSDatetime(date) {
                        return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY-MM-DD');
                    }
                }

            });

        } else {
            res.view('admins/event', {layout: 'layout_admin', nav: 'event'})
        }
    },
    /**
     * get all user by city
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    ajax_get_user_by_city: function (req, res) {
        var city;
        if (typeof req.body.city != 'undefined') {
            city = req.body.city;
        }
        var sql = "SELECT u.id, u.username, u.city, u.avatar, t.name FROM users u LEFT JOIN teams t ON (u.id = t.user_id_1 OR u.id = t.user_id_2) WHERE u.city = '" + city + "' AND t.name IS NULL ";
        sql += "ORDER BY u.id asc";
        Users.query(sql, function (err, rawResult) {
            if (err) {
                console.log(err);
                return res.json({
                    status: 400,
                });
            } else {
                return res.json({
                    status: 200,
                    data: rawResult,
                });
            }
        });
    },
    /**
     * add user for team and city
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    ajax_add_user_to_team: function (req, res) {
        //            get hash
        var shasum = crypto.createHash('sha1');
        shasum.update(new Date().toJSON());
        var hash = shasum.digest('hex');
        var id_1 = req.body.id_1;
        var id_2 = req.body.id_2;
        var city = req.body.city;
        var event_id = req.body.event_id;
        var unique_id;
        var name = req.body.team;
        if (typeof id_1 != "undefined" && typeof id_2 != "undefined") {
            if (id_1 <= id_2) {
                unique_id = id_1 + '' + id_2;
            } else {
                unique_id = id_2 + '' + id_1;
            }

        }
        Teams.create({
            hash: hash,
            user_id_1: id_1,
            user_id_2: id_2,
            event_id: event_id,
            name: name,
            city: city,
            unique_id: unique_id,
            status: 0
        }).exec(function (err, file) {
            if (err) {
                console.log(err);
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
                        controller: 'Admin',
                        action: 'ajax_add_user_to_team',
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
    },
};


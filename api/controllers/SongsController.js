/**
 * SongsController
 *
 * @description :: Server-side logic for managing songs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var crypto = require('crypto');
var auth_login = require('../services/auth_login');
var Q = require('q');
var fs = require('fs');
var consts = require('../services/const');
var moment = require('moment-timezone');
var send_push = require('../services/send_push');
var request = require("request");
var log = require('../services/log');


module.exports = {

    /*
     * list my song
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    listSongUser: function (req, res) {

        try {

//      check token login
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
                    var score = 1, conditon;
                    if (req.body.score == 2) {
                        condition = {
                            user_id: user.id,
                            final_score: null
                        }
                    } else {
                        condition = {
                            user_id: user.id,
                            final_score: {'!': null}
                        }
                    }
                    console.log(condition);
                    if (req.body.page) {
                        page = req.body.page;
                    }

                    if (req.body.sort && req.body.sort == 'null') {
                        condition = {
                            user_id: user.id,
                            final_score: null
                        }
                    }
                    /**
                     * get data by user.id
                     */
                    song_ratings.find(condition)
                            .populate('song_id')
//                            .sort(sort)
                            .paginate({page: page, limit: 10})
                            .exec(function (err, songs) {
                                if (err) {
                                    //save log
                                    log.save({
                                        controller: 'Songs',
                                        action: 'listSongUser',
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
                                        var assignedArray = [];
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
                                            myObj['path_full'] = songs[index].path_full;
                                            myObj['final_score'] = songs[index].final_score;
                                            myObj['song_name'] = songs[index].path;
                                            myObj['date'] = convertDBDatetimeToJSDatetime(songs[index].createdAt);
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
                                            controller: 'Songs',
                                            action: 'listSongUser',
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
                    /**
                     * convert date
                     * @param {type} date
                     * @returns {date}
                     */
                    function convertDBDatetimeToJSDatetime(date) {
                        return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                    }
                }
            });
        } catch (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'listSongUser',
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
     * list rank of week by final_score
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listRankScoreOfWeek: function (req, res) {

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
            //      check token login

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, status) {
                if (err) {
                    return res.serverError(err);
                }
                if (!status) {
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
                            var assignedArray = [];
                            for (index in songs) {
                                var myObj = {}, key, value;
                                // Object in format {key: value}
                                myObj['id'] = songs[index].id;
                                myObj['final_score'] = songs[index].final_score;
                                myObj['data_user'] = {
                                    username: songs[index].user_id.username,
                                    avatar: songs[index].user_id.avatar,
                                }
                                // Adding the object to the main array
                                assignedArray.push(myObj);
                            }
                            if (!songs) {
                                return res.json({
                                    code: 1,
                                    message: 'success',
                                    data: null
                                });
                            } else {
                                return res.json({
                                    code: 1,
                                    message: 'success',
                                    data: assignedArray
                                });
                            }
                        } catch (err) {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'listRankScoreOfWeek',
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
            });
        } catch (err) {
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
    },
    /**
     * list rank of month by final_score
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listRankScoreOfMonth: function (req, res) {

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
            //      check token login

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, status) {
                if (err) {
                    return res.serverError(err);
                }
                if (!status) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var lastday = function (y, m) {
                        return  new Date(y, m, 0).getDate();
                    }

                    var date = new Date();
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    getEndDate = lastday(year, month);
                    var startDate = (year + '-' + month + '-' + 01 + ' ' + '00:00:00');
                    var endDate = (year + '-' + month + '-' + getEndDate + ' ' + '23:59:59');
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
                                action: 'listRankScoreOfMonth',
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
                                // An array to store all the final user objects
                                var assignedArray = [];
                                songs.forEach(function (data, index) {
                                    var myObj = {};
                                    myObj['final_score'] = data.final_score;
                                    myObj['data_user'] = {
                                        username: data.user_id.username,
                                        avatar: data.user_id.avatar,
                                    }
                                    // Adding the object to the main array
                                    assignedArray.push(myObj);
                                });
                                return res.json({
                                    code: 1,
                                    message: 'success',
                                    data: assignedArray
                                });
                            } catch (err) {
                                //save log
                                log.save({
                                    controller: 'Songs',
                                    action: 'listRankScoreOfMonth',
                                    message: 'list rank or month assignedArray err',
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
                    });
                }
            });
        } catch (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'listRankScoreOfMonth',
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
     * list rank of year by final_score
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    listRankScoreOfYear: function (req, res) {

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
            //      check token login

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, status) {
                if (err) {
                    return res.serverError(err);
                }
                if (!status) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var lastday = function (y, m) {
                        return  new Date(y, m, 0).getDate();
                    }

                    var date = new Date();
                    date.setMonth(11);
                    date.setDate(1);
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    getEndDate = lastday(year, month);
                    var startDate = (year + '-' + 01 + '-' + 01 + ' ' + '00:00:00');
                    var endDate = (year + '-' + month + '-' + getEndDate + ' ' + '23:59:59');
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
                                action: 'listRankScoreOfYear',
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
                                // An array to store all the final user objects
                                var assignedArray = [];
                                for (index in songs) {
                                    var myObj = {}, key, value;
                                    // Object in format {key: value}
                                    myObj['final_score'] = songs[index].final_score;
                                    myObj['data_user'] = {
                                        username: songs[index].user_id.username,
                                        avatar: songs[index].user_id.avatar,
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
                                    controller: 'Songs',
                                    action: 'listRankScoreOfYear',
                                    message: 'list rank or year assignedArray',
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
                    });
                }
            });
        } catch (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'listRankScoreOfYear',
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
    /*
     * list sing the most
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    listSongRanking: function (req, res) {

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

                    var page, offset, limit;
                    limit = 10;
                    page = req.body.page;
                    if (!req.body.page || req.body.page == 0 || req.body.page == 1) {
                        page = 1;
                        offset = 0;
                    } else {
                        offset = (page - 1) * 10;
                    }
                    /**
                     * find data 
                     * @type type
                     */
                    var sql = "SELECT s.hash, s.singer, s.song_name, s.path, s.path_full, s.icon, s.img_ct, count(song_r.id) as total, s.createdAt FROM songs s LEFT JOIN song_ratings song_r on song_r.song_id = s.id";
                    sql += " GROUP BY s.id";
                    sql += " ORDER BY total desc LIMIT " + limit + " OFFSET " + offset;
                    Users.query(sql, function (err, data) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'listSongRanking',
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
                            // cnt push new
                            Pushs.count({user_id_target: user.id, status: 0}).exec(function (err, data_cnt) {
                                if (err) {
                                    return res.json({
                                        code: 4,
                                        message: consts.apiServer
                                    });
                                } else {
                                    try {
                                        // This will be sent/returned to API
                                        var assignedArray = [];
                                        for (index in data) {
                                            var myObj = {}, key, value;
                                            // Object in format {key: value}
                                            myObj['hash'] = data[index].hash;
                                            myObj['singer'] = data[index].singer;
                                            myObj['song_name'] = data[index].song_name;
                                            myObj['path'] = data[index].path;
                                            myObj['path_full'] = data[index].path_full;
                                            myObj['icon'] = data[index].icon;
                                            myObj['img_ct'] = data[index].img_ct;
                                            myObj['total'] = data[index].total;
                                            myObj['createdAt'] = convertDBDatetimeToJSDatetime(data[index].createdAt);
                                            // Adding the object to the main array
                                            assignedArray.push(myObj);
                                        }
                                        return res.json({
                                            code: 1,
                                            message: 'success',
                                            cnt_push: data_cnt,
                                            page: page,
                                            data: assignedArray
                                        });
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Songs',
                                            action: 'listSongRanking',
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
                            });

                        }


                    })
                    /**
                     * convert date
                     * @param {type} date
                     * @returns {date}
                     */
                    function convertDBDatetimeToJSDatetime(date) {
                        return moment(date, "YYYY-MM-DD HH:mm:ss ZZ").format('YYYY/MM/DD');
                    }
                }
            });
        } catch (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'listSongRanking',
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
     * get data song by hash
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */

    songDetail: function (req, res) {

        try {

            //      check token login

            auth_login.checkToken({
                token_login: req.body.token_login,
                uuid: req.body.uuid,
            }, function (err, status) {
                if (err) {
                    return res.serverError(err);
                }
                if (!status) {
                    return res.json({
                        code: 2,
                        message: consts.uuidOrToken
                    });
                } else {
                    var list = Songs.findOne();
                    list.where({'hash': req.body.hash});
                    list.exec(function (err, songs) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'songDetail',
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
                            return res.json({
                                code: 1,
                                message: 'success',
                                data: songs
                            });
                        }

                    });
                }
            });
        } catch (err) {
            log.save({
                controller: 'Songs',
                action: 'songDetail',
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
     * get data sort and search
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    searchSongAll: function (req, res) {

        try {

            var sortBy = req.body.type;
            var sort;
            var page;
//        sort by type
            if (!sortBy) {
                sortBy = 'song_name';
            } else if (sortBy && sortBy == 'new') {
                sortBy = 'id';
            } else if (sortBy && sortBy == 'name') {
                sortBy = 'song_name';
            } else if (sortBy && sortBy == 'popularity') {
                sortBy = 'popularity';
            } else if (sortBy && sortBy == 'singer') {
                sortBy = 'singer';
            }
            //sort
            if (!req.body.sort) {
                if (sortBy == 'popularity' || sortBy == 'new') {
                    sort = 'DESC';

                } else {
                    sort = 'ASC';
                }
            } else {
                if (sortBy == 'popularity' || sortBy == 'new') {
                    sort = 'DESC';
                } else {
                    sort = req.body.sort;
                }
            }
            // page paginate
            if (!req.body.page) {
                page = 1;
            } else {
                page = req.body.page;
            }
            //      check token login

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

                    // search by song_name
                    var list = Songs.find();
                    list.where({
                        like: {song_name: '%' + req.body.song_name + '%'}
                    });
                    list.sort(sortBy + ' ' + sort);
                    list.paginate({page: page, limit: 10});
                    list.exec(function (err, songs) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'searchSongAll',
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
                            return res.json({
                                code: 1,
                                message: 'success',
                                type: sortBy,
                                data: songs
                            });
                        }

                    });
                }
            });
        } catch (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'searchSongAll',
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
    add_song: function (req, res) {
        return res.view('songs/add_song', {layout: 'layout_admin'})
    },
    /**
     * upload music
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    uploadSong: async function (req, res) {
        console.log(req.body);
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
                controller: 'Songs',
                action: 'uploadSong',
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
                controller: 'Songs',
                action: 'uploadSong',
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
                controller: 'Songs',
                action: 'uploadSong',
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
                controller: 'Songs',
                action: 'uploadSong',
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
                controller: 'Songs',
                action: 'uploadSong',
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
//            console.log('arr_error');
//            console.log(arr_error);
//            console.log('arr_error');
//            console.log('cart');
//            console.log(msg_error);
//            console.log('cart');
            return {data: values, arr_error: arr_error, msg_error: msg_error}
        }).then(function (results) {
            if (!results.arr_error || results.arr_error == '') {
                console.log('ok');
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
                                status: 500,
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
//                        return res.json({
//                            status: 200,
//                            data: file
//                        });
                        return res.view('admins/upload', {datas: file, status: 200, layout: 'layout_admin'})
                    }
                })
            } else {
//                return res.json({
//                    status: 500,
//                    data: results,
//                    msg_error: results.msg_error
//                });
                return res.view('admins/upload', {datas: results, status: 500, msg_error: results.msg_error, layout: 'layout_admin'})
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
     * upload file recording, join file recording and file video 
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    uploadRecording: function (req, res) {

        try {
//
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
                    // check type upload
                    var check_type = 1;
                    var folder_name = 'file_songs';

                    if (req.body.type == 2) {
                        check_type = 2;
                    } else if (req.body.type == 3) {
                        check_type = 3;
                        folder_name = 'file_recorde';
                    }
                    /**
                     * start
                     */
                    console.log('start');
                    try {
                        if (req.body.hash) {
//                            var arr_hash = JSON.parse(req.body.hash);
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
                    // check and update score to history
                    try {
                        if (req.body.history_hash && req.body.score) {
                            update_score_history(true).then(function () {

                            })
                        } else if (req.body.history_hash) {
                            update_score_history(false).then(function () {

                            })
                        }

                    } catch (e) {
                        sails.log.info('history_hash and score null');
                    }

                    upload_recorde().then(function (data_rc) {
                        // This function will be called after upload_recorde() will be executed. 
                        if (data_rc.type == true) {

                            get_song_id().then(function (song_id) {
                                // This function will be called after get_song_id() will be executed. 
                                if (song_id.type_song == true) {
                                    /**
                                     * join file video and file recording
                                     * @type Module util|Module util
                                     */

                                    var util = require('util'), child_process = require('child_process');
                                    var exec = child_process.exec;
                                    var shasum = crypto.createHash('sha1');
                                    shasum.update(new Date().toJSON());
                                    var arr_path_file = [];
                                    arr_path_file.push(data_rc.path);
                                    hash_cv = shasum.digest('hex');
                                    hash_cv_1 = hash_cv + '_1';
                                    arr_path_file.push(hash_cv_1 + '.mp3');
                                    hash_cv_2 = hash_cv + '_2';
                                    arr_path_file.push(hash_cv_2 + '.mp3');
                                    hash_cv_3 = hash_cv + '_3';
                                    arr_path_file.push(hash_cv_3 + '.mp3');
                                    hash_cv_4 = hash_cv + '_4';
                                    console.log('==============================================');
                                    console.log(data_rc.path);
                                    console.log(hash_cv_1);
                                    console.log(hash_cv_2);
                                    console.log(hash_cv_3);
                                    console.log(hash_cv_4);
                                    console.log('==============================================');

                                    //check fordel
                                    if (fs.existsSync("assets/uploads/" + user.id + "/")) {
                                        // fordel exist
                                    } else {
//                                create fordel
                                        fs.mkdir("assets/uploads/" + user.id + "/", function (err) {
                                            if (err) {
                                                console.log('failed to create directory', err);
                                            } else {
                                                console.log('ok');
                                            }
                                        });
                                    }
                                    exec("ffmpeg -i assets/" + folder_name + "/" + song_id.path_song + " -vn -ar 44100 -ac 2 -ab 192k -f mp3 assets/uploads/" + user.id + "/" + hash_cv_1 + ".mp3", (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`exec error ( create audio): ${error}`);
                                            return res.json({
                                                code: 4,
                                                message: 'error',
                                                data: 'status 1'
                                            });
                                        } else {
                                            console.log('2');
                                            exec("ffmpeg -i assets/uploads/" + user.id + "/" + data_rc.path + " assets/uploads/" + user.id + "/" + hash_cv_2 + ".mp3", (error, stdout, stderr) => {
                                                if (error) {
                                                    console.error(`exec error (file recorde to mp3): ${error}`);
                                                    return res.json({
                                                        code: 4,
                                                        message: 'error',
                                                        data: 'status 2'
                                                    });
                                                } else {
                                                    console.log('3');
//                                                    exec("ffmpeg -i assets/uploads/" + user.id + "/" + hash_cv_1 + ".mp3 -i assets/uploads/" + user.id + "/" + hash_cv_2 + ".mp3 -filter_complex amix=inputs=2:duration=first:dropout_transition=0 -codec:a libmp3lame -q:a 0 assets/uploads/" + user.id + "/" + hash_cv_3 + ".mp3", (error, stdout, stderr) => {
                                                    exec("ffmpeg -i assets/uploads/" + user.id + "/" + hash_cv_1 + ".mp3 -i assets/uploads/" + user.id + "/" + hash_cv_2 + ".mp3 -filter_complex amix=inputs=2:duration=longest:dropout_transition=0 -codec:a libmp3lame -q:a 0 assets/uploads/" + user.id + "/" + hash_cv_3 + ".mp3", (error, stdout, stderr) => {
//                                                    exec("ffmpeg -i assets/uploads/" + user.id + "/" + hash_cv_1 + ".mp3 -i assets/uploads/" + user.id + "/" + hash_cv_2 + ".mp3 -c:v copy -c:a aac -strict experimental assets/uploads/" + user.id + "/" + hash_cv_3 + ".mp3", (error, stdout, stderr) => {
                                                        if (error) {
                                                            console.error(`exec error ( join file mp3 ): ${error}`);
                                                            return res.json({
                                                                code: 4,
                                                                message: 'error',
                                                                data: 'status 3'
                                                            });
                                                        } else {
                                                            console.log('4');
                                                            //check fordel
                                                            if (fs.existsSync("assets/file_recorde/")) {
                                                                // fordel exist
                                                            } else {
//                                create fordel
                                                                fs.mkdir("assets/file_recorde/", function (err) {
                                                                    if (err) {
                                                                        console.log('failed to create directory', err);
                                                                    } else {
                                                                        console.log('ok');
                                                                    }
                                                                });
                                                            }
                                                            exec("ffmpeg -i assets/" + folder_name + "/" + song_id.path_song + " -i assets/uploads/" + user.id + "/" + hash_cv_3 + ".mp3 -map 0:0 -map 1:0 assets/file_recorde/" + hash_cv_4 + ".mp4", (error, stdout, stderr) => {
//                                                            exec("ffmpeg -i assets/" + folder_name + "/" + song_id.path_song + " -i assets/uploads/" + user.id + "/" + hash_cv_3 + ".mp3 -map 0:v -map 1:a -c copy -y assets/file_recorde/" + hash_cv_4 + ".mp4", (error, stdout, stderr) => {
                                                                if (error) {
                                                                    console.error(`exec error (join file video and audio): ${error}`);
                                                                    return res.json({
                                                                        code: 4,
                                                                        message: 'error',
                                                                        data: 'status 4'
                                                                    });
                                                                } else {
                                                                    sails.log.info('convert file ok');
                                                                    // if upload true call create_recorde()
                                                                    create_recorde(req.body, user, song_id, hash_cv_4 + ".mp4", arr_path_file).then(function (data_create) {
                                                                        if (data_create.type == true) {
                                                                            // if create_recorde true call get_user_id_invi()
                                                                            if (check_type == 1) {
                                                                                sails.log.info('type 1 ok');
                                                                                return res.json({
                                                                                    code: 1,
                                                                                    message: 'success',
                                                                                });
                                                                            } else if (check_type == 3) {
                                                                                duet_invitations.destroy({hash: req.body.hash_duet}).exec(function (err) {
                                                                                    if (err) {
                                                                                        //save log
                                                                                        log.save({
                                                                                            controller: 'Songs',
                                                                                            action: 'uploadRecording',
                                                                                            message: 'delete duet_invitations',
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
                                                                                    sails.log.info('type 1 3');
                                                                                    return res.json({
                                                                                        code: 1,
                                                                                        message: 'success',
                                                                                    });
                                                                                });
                                                                            } else if (check_type == 2) {

                                                                                if (!arr_hash || arr_hash == '' || arr_hash == 'undefined') {
                                                                                    return res.json({
                                                                                        code: 1,
                                                                                        message: 'success',
                                                                                    });
                                                                                } else {
                                                                                    sails.log.info('type 2 ok');
                                                                                    get_user_id_invi().then(function (data_duet) {
                                                                                        if (data_duet.type == true) {
                                                                                            // if data_save true call get_user_id_invi()
                                                                                            save_duet_invi(data_duet.data, data_create.data, data_duet.data_fcm).then(function (data_save) {
                                                                                                if (data_save.type == true) {
                                                                                                    return res.json({
                                                                                                        code: 1,
                                                                                                        message: 'success',
//                                                                                                    data: data_save.data
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
                                                                                                    controller: 'Songs',
                                                                                                    action: 'uploadRecording',
                                                                                                    message: 'save_duet_invi',
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
                                                                                                code: 4,
                                                                                                message: consts.apiServer
                                                                                            });
                                                                                        }

                                                                                    }).catch(function (err) {
                                                                                        //save log
                                                                                        log.save({
                                                                                            controller: 'Songs',
                                                                                            action: 'uploadRecording',
                                                                                            message: 'get_user_id_invi',
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

                                                                            }
//                                                                           
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
                                                                            controller: 'Songs',
                                                                            action: 'uploadRecording',
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
                                                                }

                                                            });
                                                        }

                                                    });
                                                }

                                            });
                                        }
                                    });
                                } else if (song_id.type_song == false && song_id.song === null) {
                                    return res.json({
                                        code: 0,
                                        message: 'error',
                                        data: consts.songNotExist
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
                                    controller: 'Songs',
                                    action: 'uploadRecording',
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
                        } else if (data_rc.type == false) {
                            sails.log.info("api: uploadRecorde file upload null");
                            return res.json({
                                code: 0,
                                message: 'error',
                                data: {
                                    file_recorde: consts.notBlank
                                }
                            });
                        }

                    }).catch(function (err) {
                        //save log
                        log.save({
                            controller: 'Songs',
                            action: 'uploadRecording',
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
                     * save data
                     * @param {type} data_body
                     * @param {type} data_rc
                     * @param {type} data_user
                     * @param {type} data_song
                     * @param {type} path_rc
                     * @returns {.Q@call;defer.promise}
                     */

                    function create_recorde(data_body, data_user, data_song, path_rc, arr_path_file) {
                        var deferred = Q.defer();
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        hash = shasum.digest('hex');
                        var data_score
                        try {
                            if (data_body.score) {
                                data_score = data_body.score;
                            } else {
                                data_score = null;
                            }
                        } catch (e) {
                            console.log(e);
                            data_score = null;
                        }
//                        check save data
                        if (check_type == 3) {
                            var duet_hash;
                            if (!req.body.hash) {
                                duet_hash = req.body.song_hash;
                            }
                            var data_save = {
                                hash: hash,
                                final_score: data_score,
                                type: data_body.type,
                                song_name: data_body.song_name,
                                user_id: user.id,
                                duet_hash: duet_hash,
                                song_id: data_song.song.song_id,
                                path: 'http://karaoke.brite.vn/file_recorde/' + path_rc,
                            };
                        } else {
                            var data_save = {
                                hash: hash,
                                final_score: data_score,
                                type: data_body.type,
                                song_name: data_body.song_name,
                                user_id: user.id,
                                song_id: data_song.song.id,
                                path: 'http://karaoke.brite.vn/file_recorde/' + path_rc,
                            };
                        }

                        // save
                        song_ratings.create(data_save).exec(function (err, register) {
                            if (err) {
                                var errorValidate = JSON.stringify(err);
                                obj = JSON.parse(errorValidate);
                                if (obj.error == "E_VALIDATION") {
                                    if (obj.Errors.hash) {
                                        create_recorde(req.body, data_user, data_song, path_rc);
                                    }
                                    deferred.resolve({type: false, data: obj.Errors});
                                } else {
                                    deferred.resolve({type: false});
                                }
                            }
                            if (register) {
//                                delete file
                                try {
                                    arr_path_file.forEach(function (file, index) {
                                        fs.unlinkSync("assets/uploads/" + user.id + "/" + file);
                                    });
                                } catch (e) {
                                    sails.log.error('delete file uploadrecorde' + e);
                                }
                                deferred.resolve({type: true, data: register});
                            }
                        });
                        return deferred.promise;
                    }
                    /**
                     * 
                     * @returns {string}
                     */
                    function update_score_history(check) {
                        try {
                            var data_score;

                            if (check == true) {
                                data_score = req.body.score
                            } else {
                                data_score = null;
                            }
                            Histories.update(
                                    {hash: req.body.history_hash},
                                    {final_score: data_score}
                            ).exec(function (err, update) {})
                        } catch (e) {
                            sails.log.error('songscontroller, uploadrecording, update score history err ');
                        }


                    }


                    /**
                     * save data duet invi
                     * @param {type} data_user_target
                     * @param {type} data_create_rc
                     * @returns {.Q@call;defer.promise}
                     */

                    function save_duet_invi(data_user_target, data_create_rc, data_fcm) {
                        var deferred = Q.defer();
                        var ctr = 0;
                        var arr_data = [];
                        var arr_err = [];
                        var shasum = crypto.createHash('sha1');
                        shasum.update(new Date().toJSON());
                        hash = shasum.digest('hex');
                        data_user_target.forEach(function (id, index) {
                            var hash_new = hash + index;
                            duet_invitations.create({
                                hash: hash_new,
                                user_id: user.id,
                                song_rate_id: data_create_rc.id,
                                target_id: id,
                                status: 0,
                            }).exec(function (err, create_duet) {
                                if (err) {
                                    console.log(err);
                                    // delete recording 
//                                    song_ratings.destroy({hash: data_create_rc.hash}).exec(function (err, destroy) {})
                                    arr_err.push(err);
                                }
                                arr_data.push(create_duet);
                                ctr++;
                                if (ctr === data_user_target.length) {
                                    deferred.resolve({type: true, data: arr_data, error: arr_err});
//                                    start push
                                    try {
                                        send_push.push({
                                            token_fcm: data_fcm,
                                            collapse_key: 'send_duet_invi',
                                            title: 'デュエット',
                                            body: '新規デュエットリクエストありました。',
                                            data: {
                                                view_type: 'listInvi',
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
                                        sails.log.error('push send_duet_invi error' + e);
                                    }
                                }
                            });
                        });
                        // save data push
                        try {
                            create_push(data_user_target).then(function (data_push) {

                            }).catch(function (err) {
                                console.log(err + 'err create data push send_duet_invi');
                            });
                        } catch (e) {
                            console.log(err + 'err create data push send_duet_invi');

                        }
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
                                title: 'デュエット',
                                type_push: 3,
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
                     * get song id by song_hash
                     * @returns {.Q@call;defer.promise}
                     */

                    function get_song_id() {
                        var deferred = Q.defer();
//                        check find by type
                        if (check_type == 3) {
                            song_ratings.findOne({select: ['id', 'path', 'user_id', 'song_id', 'hash'], where: {hash: req.body.song_hash}}).exec(function (err, data_user_duet) {
                                if (err) {
                                    deferred.resolve({type_song: false, song: null});
                                }
                                if (!data_user_duet) {
                                    deferred.resolve({type_song: false, song: null});
                                } else {
                                    try {
                                        Songs.findOne({select: ['popularity'], where: {id: data_user_duet.id}}).exec(function (err, song) {
                                            if (song) {
                                                Songs.update(
                                                        {id: data_user_duet.song_id},
                                                        {popularity: Number(song.popularity) + 1}
                                                ).exec(function (err, update) {})
                                            }
                                        })

                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Songs',
                                            action: 'uploadrecoding',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                    }
                                    var arr = data_user_duet.path.split("/");
                                    deferred.resolve({type_song: true, song: data_user_duet, path_song: arr.slice(-1).pop()});
                                }
                            });
                        } else {
                            Songs.findOne({select: ['id', 'path', 'path_midi', 'popularity'], where: {hash: req.body.song_hash}}).exec(function (err, song) {
                                if (err) {
                                    deferred.resolve({type_song: false, song: null});
                                }
                                if (!song) {
                                    deferred.resolve({type_song: false, song: null});
                                } else {
                                    // save popularity
                                    try {
                                        Songs.update(
                                                {id: song.id},
                                                {popularity: Number(song.popularity) + 1}
                                        ).exec(function (err, update) {})
                                    } catch (e) {
                                        //save log
                                        log.save({
                                            controller: 'Songs',
                                            action: 'uploadrecoding',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
                                    }
                                    var arr = song.path.split("/");
                                    var arr_midi = song.path_midi.split("/");
                                    deferred.resolve({type_song: true, song: song, path_song: arr.slice(-1).pop(), path_midi: arr_midi.slice(-1).pop()});
                                }
                            })
                        }
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
//                       
                        req.file('file_recorde') // this is the name of the file in your multipart form
                                .upload({
                                    // optional
                                    // dirname: [SOME PATH TO SAVE IN A CUSTOM DIRECTORY]
                                    maxBytes: 250000000000,
                                    dirname: '../../assets/uploads/' + user.id,
                                }, function (err, uploads) {
                                    // try to always handle errors
                                    if (err) {
                                        //save log
                                        log.save({
                                            controller: 'Songs',
                                            action: 'uploadRecording',
                                            message: 'upload_recorde',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        })
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
//                                        path_recorde = 'http://karaoke.brite.vn/file_recorde/' + arr.slice(-1).pop();
                                        deferred.resolve({type: true, path: arr.slice(-1).pop(), file_name: uploads[0].filename});
                                    }
                                })
                        return deferred.promise;
                    }
                    /**
                     * get user_id by hash
                     * @returns {.Q@call;defer.promise}
                     */
                    function get_user_id_invi() {
                        var deferred = Q.defer();
                        var ctr = 0;
                        var arr_data = [];
                        var arr_data_fcm = [];
                        arr_hash.forEach(function (hash, index) {
                            Users.find({select: ['id', 'token_fcm'], where: {hash: hash}}).exec(function (err, data) {
                                if (err) {
                                    deferred.resolve({type: false, data: err});
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
                }
            })
        } catch (err) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'uploadRecording',
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
     * delete record duet_invi
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    declineDuetInvi: function (req, res) {
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
                    duet_invitations.destroy({hash: req.body.hash}).exec(function (err, destroy) {
                        if (err) {
                            //save log
                            log.save({
                                controller: 'Songs',
                                action: 'declineDuetInvi',
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
                                data: consts.deleteDuetInvi
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
                controller: 'Songs',
                action: 'declineDuetInvi',
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
     * call api scoring return result
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    scoring: function (req, res) {
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
                    upload_recorde().then(function (data_rc) {
                        if (data_rc.type == true) {

                            var path_file = data_rc.path.split('record_audio')

                            var data = {
                                AudioFile: data_rc.path,
                                MidiFile: req.body.path_midi,
//                                AudioFile: 'http://karaoke.brite.vn/record_audio/98cd0c7f-5dfd-49a1-a355-c89cdc41c63b.aac',
//                                MidiFile: 'http://karaoke.brite.vn/mids/5cd915dc-730d-422b-b705-d7d52f245370.mid',
                                user_id: user.id,
                            }
                            request.post({url: 'http://karaokescore.brite.vn/App.php', form: data}, function (err, httpResponse, body) {
                                try {
                                    if (err) {
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
                                        return res.json({
                                            code: 1,
                                            message: 'success',
                                            data: {
                                                score: Number(body),
                                            }
                                        });
                                    }
                                } catch (err) {
//save log
                                    log.save({
                                        controller: 'Song',
                                        action: 'scoring',
                                        data: req.body
                                    }, {error: err}
                                    , function (e) {
                                        console.log(e || "save log!");
                                    })
                                }
                            })
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
                            controller: 'Song',
                            action: 'scoring',
                            message: 'upload_recorde',
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
                                        log.save({
                                            controller: 'Song',
                                            action: 'scoring',
                                            data: req.body
                                        }, {error: err}
                                        , function (e) {
                                            console.log(e || "save log!");
                                        });
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
                }
            })
        } catch (err) {
            log.save({
                controller: 'Song',
                action: 'scoring',
                data: req.body
            }, {error: err}
            , function (e) {
                console.log(e || "save log!");
            });
            return res.json({
                code: 4,
                message: consts.apiServer
            });
        }

    },
    cancelUpload: function (req, res) {

        try {
            if (req.body.path_recorde) {
//                            var arr_hash = JSON.parse(req.body.hash);
                var arr_path_rc = req.body.path_recorde.split('record_audio');
            }
        } catch (e) {
            return res.json({
                code: 0,
                message: 'error',
                data: {
                    hash: consts.errPathRc
                }
            });
        }
        try {
            var deleteFolderRecursive = function (path) {
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(function (file, index) {
                        var curPath = path + "/" + file;
                        if (fs.lstatSync(curPath).isDirectory()) { // recurse
                            deleteFolderRecursive(curPath);
                        } else { // delete file
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(path);
                }
            };
            //remove folder
            var arr = arr_path_rc[1].split('/');
            var directory = arr_path_rc[1].split('/' + arr.slice(-1).pop());
            deleteFolderRecursive("assets/record_audio" + directory[0]);
            return res.json({
                code: 1,
                message: 'success'
            });
        } catch (e) {
            //save log
            log.save({
                controller: 'Songs',
                action: 'cancelUpload',
                message: 'delete folder uploadrecorde',
                data: req.body
            }, {error: e}
            , function (err) {
                console.log(err || "save log!");
            });
        }
    },
};


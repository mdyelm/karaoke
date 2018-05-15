/**
 * ContactsController
 *
 * @description :: Server-side logic for managing contacts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var crypto = require('crypto');
var auth_login = require('../services/auth_login');
var Q = require('q');
var consts = require('../services/const');
var log = require('../services/log');

module.exports = {

    /**
     * create contact
     * @param {type} req
     * @param {type} res
     * @returns {string}
     */
    contact: function (req, res) {
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
                            controller: 'Contacts',
                            action: 'contact',
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
                        Contacts.create({
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
        } catch (e) {
            //save log
            log.save({
                controller: 'Contacts',
                action: 'contact',
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


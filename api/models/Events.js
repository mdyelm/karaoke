var fs = require('fs');
/**
 * Events.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

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
        e_owner_id: {
            required: true,
            type: 'integer',
            model: 'Admin',
        },
        title: {
            required: true,
            type: 'string',
        },
        content: {
            required: true,
            type: 'string',
        },
        img: {
            required: true,
            type: 'string',
        },
        start_date: {
            required: true,
            type: 'datetime'
        },
        end_date: {
            required: true,
            type: 'datetime'
        },
        status: {
            required: true,
            type: 'integer',
            size: 2
        },
        toJSON: function () {
            var obj = this.toObject();
//            delete obj.id;
//            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    },
    beforeUpdate: function (newValues, callback) {
        // remove image old 
        if (typeof (newValues.img) != 'undefined') {
            Events.findOne(newValues.before_id)
                    .exec(function (err, currentValues) {
                        try {
                            fs.unlinkSync("assets/event/" + currentValues.img);
                            return callback();
                        } catch (e) {
                            console.log(e);
                            return callback();
                        }
                    });
        } else {
            return callback();
        }

    },

    validationMessages: {
        hash: {
            required: '入力して下さい。'
        },
        title: {
            required: '入力して下さい。',
        },
        e_owner_id: {
            required: '入力して下さい。',
        },
        song_id: {
            required: '入力して下さい。',
        },
        content: {
            required: '入力して下さい。',
        },
        start_date: {
            required: '入力して下さい。',
            datetime: 'は日付として正しくありません。'
        },
        end_date: {
            required: '入力して下さい。',
            datetime: 'は日付として正しくありません。'
        },
    },
};


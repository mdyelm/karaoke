/**
 * song_ratings.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true
        },
        hash: {
            type: 'string',
            unique: true,
        },
        user_id: {
            type: 'integer',
            required: true,
            model: 'Users'
        },
        user_id_1: {
            type: 'integer',
//            required: true
        },
        song_id: {
            type: 'integer',
//            required: true,
            model: 'Songs'
        },
        song_name: {
            type: 'string'
        },
        type: {
            type: 'integer',
            size: 4
        },
        duet_hash: {
            type: 'string',
        },
        final_score: {
            type: 'integer',
//            required: true,
        },
        path: {
            type: 'string'
        },
        icon: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
//            delete obj.id;
            delete obj.updatedAt;
            return obj;
        }
    },
    /**
     * delete record duet_invi by id of song_rating
     * @param {type} destroyedDuetInvi
     * @param {type} cb
     * @returns {type}
     */
    afterDestroy: function (destroyedDuetInvi, cb) {
        var ids = _.pluck(destroyedDuetInvi, 'id');
        if (ids && ids.length) {
            duet_invitations.destroy({song_rate_id: ids})
                    .exec(function (err, data) {
                        cb();
                    });
        } else {
            cb();
        }

    },
    validationMessages: {
        final_score: {
            required: '入力して下さい。'
        },
        user_id: {
            required: '入力して下さい。'
        },
        song_id: {
            required: '入力して下さい。'
        },
    },
};


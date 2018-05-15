/**
 * duet_invitations.js
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
            unique: true,
            required: true,
        },
        song_rate_id: {
            type: 'integer',
            required: true,
            model: 'song_ratings'
        },
        user_id: {
            type: 'integer',
            required: true,
            model: 'users'
        },
        target_id: {
            type: 'integer',
            required: true,
        },
        status: {
            type: 'integer',
            required: true,
            size: 2
        },
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    },
};


/**
 * Challenges.js
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
            required: true,
            unique: true
        },
        song_id: {
            type: 'integer',
            model: 'Songs',
            required: true,
        },
        user_id: {
            type: 'integer',
            model: 'Users',
            required: true,
        },
        user_target: {
            type: 'integer',
            required: true
        },
        final_score_user_id: {
            type: 'integer',
            required: true
        },
        final_score_target_id: {
            type: 'integer',
        },
        status: {
            type: 'integer',
            size: 2
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    },
    validationMessages: {
        song_id: {
            required: '入力して下さい。'
        },
        user_id: {
            required: '入力して下さい。'
        },
        user_target: {
            required: '入力して下さい。'
        },
        final_score_user_id: {
            required: '入力して下さい。'
        },
    },
};


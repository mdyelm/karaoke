/**
 * Categories.js
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
        user_id: {
            type: 'integer',
            required: true
        },
        c_number: {
            type: 'integer',
            model: 'Playlists',
            required: true
        },
        c_name: {
            type: 'string',
            required: true
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
        user_id: {
            required: '入力して下さい。'
        },
        c_number: {
            required: '入力して下さい。',
        },
        c_name: {
            required: '入力して下さい。',
        },
    },
};


/**
 * Playlists.js
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
        user_id: {
            type: 'integer',
            model: 'Users',
            required: true
        },
        cat_number: {
            type: 'integer',
            required: true
        },
        song_id: {
            type: 'integer',
            model: 'Songs',
            required: true
        },
        cat_info: {
            collection: 'Categories',
            via: 'c_number'
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
        cate_id: {
            required: '入力して下さい。',
        },
        song_id: {
            required: '入力して下さい。',
        },
    },
};


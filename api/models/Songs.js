/**
 * Songs.js
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
        artist: {
            type: 'string',
//            required: true,
        },
        singer: {
            type: 'string',
            required: true,
        },
        genres: {
            type: 'string',
        },
        popularity: {
            type: 'integer',
        },
        song_name: {
            type: 'string',
            required: true,
        },
        path: {
            type: 'string',
        },
        path_full: {
            type: 'string',
        },
        path_midi: {
            type: 'string',
        },
        icon: {
            type: 'string',
        },
        img_ct: {
            type: 'string',
        },
        album_name: {
            type: 'string',
        },
        country: {
            type: 'string',
        },
        length: {
            type: 'string',
        },
        year_active: {
            type: 'integer',
        },
        list_song_rates: {
            collection: 'song_ratings',
            via: 'song_id'
        },
        toJSON: function () {
            var obj = this.toObject();
//            delete obj.id;
//            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        },
    },
    validationMessages: {
        singer: {
            required: '入力して下さい。'
        },
        song_name: {
            required: '入力して下さい。'
        },

    }
};


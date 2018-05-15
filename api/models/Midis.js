/**
 * Midis.js
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
        song_id: {
            type: 'integer',
            model: 'Songs',
            required: true
        },

        toJSON: function () {
            var obj = this.toObject();
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
};


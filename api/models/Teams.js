/**
 * Teams.js
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
        name: {
            type: 'integer',
//            unique: true,
            required: true,
        },
        user_id_1: {
            type: 'integer',
            model: 'Users',
            required: true,
        },
        user_id_2: {
            type: 'integer',
            model: 'Users',
            required: true,
        },
        city: {
            type: 'string',
            required: true,
        },
        event_id: {
            type: 'integer',
            required: true,
        },
        unique_id: {
            type: 'integer',
            required: true,
        },
        status: {
            type: 'integer',
            required: true,
            size: 2
        },

    }
};


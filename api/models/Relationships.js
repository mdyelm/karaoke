/**
 * Relationship.js
 *
 * @description :: TODO: Friends Relationship
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
        },
        user_one_id: {
            type: 'integer',
            model: 'users',
            required: true
        },
        user_two_id: {
            type: 'integer',
            model: 'Users',
            required: true,
        },
        status: {
            type: 'integer',
            required: true,
            size: 2
        },
        action_user_id: {
            type: 'integer',
            required: true
        },
        one_id_and_two_id: {
            type: 'integer',
            unique: true
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
        one_id_and_two_id: {
            unique: 'failed to exist.'
        },
    },
};


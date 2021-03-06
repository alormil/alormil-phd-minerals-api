const Joi = require('joi');
const Boom = require('boom');
const Regions = require('../models/regions').Regions;
const mongoose = require('mongoose');


exports.getAll = {
    handler: (request, reply) => {
        Regions.find({}, (err, regions) => {
            if (!err) {
                return reply(regions);
            }
            return reply(Boom.badImplementation(err)); // 500 error
        });
    },
};

exports.getOne = {
    handler: (request, reply) => {
        Regions.findOne({ uid: request.params.uid }, (err, regions) => {
            if (!err) {
                return reply(regions);
            }
            return reply(Boom.badImplementation(err)); // 500 error
        });
    },
};

exports.create = {
    validate: {
        payload: {
            uid: Joi.string().required(),
            name: Joi.string().required(),
            link: Joi.string().required(),
            descriptions: Joi.any(),
            images: Joi.any(),
            dateCreated: Joi.date(),
            lastUpdated: Joi.date(),
            author: Joi.string(),
        },
    },
    handler: (request, reply) => {
        const regions = new Regions(request.payload);
        regions.save((err, result) => {
            if (!err) {
                return reply(regions).created(`/regions/${result.id}`); // HTTP 201
            }
            if (err.code === 11000 || err.code === 11001) {
                return reply(Boom.forbidden('please provide another regions id, it already exist'));
            }
            return reply(Boom.forbidden(err)); // HTTP 403
        });
    },
};

exports.update = {
    validate: {
        payload: {
            name: Joi.string().required(),
            link: Joi.string().required(),
            descriptions: Joi.any(),
            images: Joi.any(),
            dateCreated: Joi.date(),
            lastUpdated: Joi.date(),
            author: Joi.string(),
        },
    },
    handler: (request, reply) => {
        Regions.findOne({ uid: request.params.uid }, (err, regions) => {
            if (!err) {
                regions.name = request.payload.name;
                regions.link = request.payload.link;
                regions.save((error, result) => {
                    if (!error) {
                        return reply(result); // HTTP 201
                    }
                    if (error.code === 11000 || error.code === 11001) {
                        return reply(Boom.forbidden('Provide other regions id, it already exist'));
                    }
                    return reply(Boom.badImplementation(err)); // 500 error
                });
            }
            return reply(Boom.badImplementation(err)); // 500 error
        });
    },
};

exports.remove = {
    handler: (request, reply) => {
        Regions.findOne({ uid: request.params.uid }, (err, regions) => {
            if (!err && regions) {
                regions.remove();
                return reply({ message: 'regions deleted successfully' });
            }
            if (!err) {
                return reply(Boom.notFound());
            }
            return reply(Boom.badRequest('Could not delete regions'));
        });
    },
};

exports.removeAll = {
    handler: (request, reply) => {
        mongoose.connection.db.dropCollection('regions', (err) => {
            if (!err) {
                return reply({ message: 'regions database successfully deleted' });
            }
            return reply(Boom.badRequest('Could not delete regions'));
        });
    },
};

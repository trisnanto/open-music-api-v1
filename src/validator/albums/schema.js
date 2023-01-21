const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().max(9999).required(),
});

module.exports = { AlbumPayloadSchema };

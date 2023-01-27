const Joi = require('joi');

const ExportPlaylistByIdPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportPlaylistByIdPayloadSchema;

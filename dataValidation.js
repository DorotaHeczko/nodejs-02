const Joi = require("joi");

function validateAddContact(payload) {
  const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });

  return contactSchema.validate(payload, { abortEarly: false });
}

function validateUpdateContact(payload) {
  const updateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  }).or("name", "email", "phone");

  return updateSchema.validate(payload, { abortEarly: false });
}

module.exports = {
  validateAddContact,
  validateUpdateContact,
};

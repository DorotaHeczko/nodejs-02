const Contact = require("./schemas/contact");

const getAllContacts = () => Contact.find();

const getContactById = (id) => Contact.findOne({ _id: id });

const createContact = ({ name, email, phone }) =>
  Contact.create({ name, email, phone });

const updateContact = (id, fields) =>
  Contact.findOneAndUpdate({ _id: id }, { $set: fields }, { new: true });

const removeContact = (id) => Contact.findByIdAndRemove(id);

const updateStatusContact = (id, fields) =>
  Contact.findOneAndUpdate({ _id: id }, { $set: fields }, { new: true });

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
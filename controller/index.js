const userInfo = require("../service");
const {
  validateAddContact,
  validateUpdateContact,
  validateFavorite,
} = require("../dataValidation");

const mongoose = require("mongoose");

const validateContactId = (contactId, res) => {
  const isValidId = mongoose.isValidObjectId(contactId);
  if (!isValidId) return res.status(400).send({ message: "Invalid payload" });
};


const get = async (req, res, next) => {
  try {
    const allContacts = await userInfo.getAllContacts();
    res.status(200).json({
      message: "success",
      data: { allContacts },
    });
  } catch (error) {
    res.status(500).json(`Contacts download error - ${error}`);
  }
};

const getById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    validateContactId(contactId, res);
    const contact = await userInfo.getContactById(contactId);
    if (contact) {
      res.status(200).json({
        message: "success",
        data: { contact },
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    res.status(500).json(`Contact download error - ${error}`);
  }
};

const create = async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = validateAddContact(body);
    if (error) return res.status(400).send({ message: error.details });
    const allContactsData = await userInfo.createContact(body);
    res.status(201).json({
      message: "contact added",
      data: { allContactsData },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(`Contact create error - ${error}`);
  }
};

const remove = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    validateContactId(contactId, res);
    const isContactDeleted = await userInfo.removeContact(contactId);
    isContactDeleted
      ? res.status(200).json({ message: "Contact deleted successfully" })
      : res.status(404).json({ message: "Contact not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json(`Contact delete error - ${error}`);
  }
};

const update = async (req, res, next) => {
  try {
    const body = req.body;
    const { contactId } = req.params;
    const { error } = validateUpdateContact(body);
    if (error) return res.status(400).send({ message: error.details });
    validateContactId(contactId, res);
    const modifiedContact = await userInfo.updateContact(contactId, body);
    if (modifiedContact) {
      res.status(200).json({
        message: "contact edited",
        data: { modifiedContact },
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(`Contact update error - ${error}`);
  }
};

const favorite = async (req, res, next) => {
  try {
    const body = req.body;
    const { contactId } = req.params;
    const { error } = validateFavorite(body);

    if (error)
      return res
        .status(400)
        .send({ message: "Too much fields or missing field favorite" });

    validateContactId(contactId, res);

    const editFavorite = await userInfo.updateStatusContact(contactId, body);

    if (editFavorite) {
      res.status(200).json({
        message: "contact edited",
        data: editFavorite,
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(`Favorite contact update error - ${error}`);
  }
};

module.exports = {
  get,
  getById,
  create,
  remove,
  update,
  favorite,
};

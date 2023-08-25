const express = require("express");
const contacts = require("../../models/contacts");
const { validateAddContact, validateUpdateContact } = require("../../dataValidation");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const allContacts = await contacts.listContacts();
    res.status(200).json({
      message: "success",
      data: { allContacts },
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await contacts.getContactById(contactId);

    if (contact) {
      res.status(200).json({
        message: "success",
        data: { contact },
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = validateAddContact(body);

    if (error) return res.status(400).send({ message: error.details });

    const allContactsData = await contacts.addContact(body);
    res.status(201).json({
      message: "contact added",
      data: { allContactsData },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const isContactDeleted = await contacts.removeContact(contactId);

    if (isContactDeleted) {
      res.status(200).json({ message: "Contact deleted successfully" });
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const body = req.body;
    const { contactId } = req.params;
    const { error } = validateUpdateContact(body);

    if (error) return res.status(400).send({ message: error.details });

    const modifiedContact = await contacts.updateContact(contactId, body);

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
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;

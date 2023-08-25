const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const getContacts = async () => {
  const contacts = fs.readFile("models/contacts.json");
  return JSON.parse(await contacts);
};

const saveContact = async (data) =>
  await fs.writeFile("models/contacts.json", JSON.stringify(data));



const listContacts = async () => {
  try {
    const contacts = await getContacts();
    return contacts;
  } catch (error) {
    console.log(error);
    throw error; 
  }
};


const getContactById = async (contactId) => {
  try {
    const contacts = await getContacts();

    return contacts.find((data) => data.id === contactId);
  } catch (error) {
    console.log(error);
    throw error; 
  }
};


const removeContact = async (contactId) => {
  try {
    const contacts = await getContacts();
    const targetContact = contacts.find((data) => data.id === contactId);

    if (targetContact) {
      const contactsAfterRemove = contacts.filter(
        (contact) => contact.id !== contactId
      );
      await saveContact(contactsAfterRemove);

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    throw error; 
  }
};


const addContact = async (body) => {
  try {
    const { name, email, phone } = body;
    const newContact = {
      id: nanoid(),
      name,
      email,
      phone,
    };

    const contacts = await getContacts();
    contacts.push(newContact);
    await saveContact(contacts);

    return newContact;
  } catch (error) {
    console.log(error);
    throw error; 
  }
};

const updateContact = async (contactId, body) => {
  try {
    const { name, email, phone } = body;
    const editContact = {
      name,
      email,
      phone,
    };
    console.log(editContact);

    const contacts = await getContacts();
    const foundContactIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (foundContactIndex === -1) return false;

    const contact = contacts[foundContactIndex];
    const updatedContact = { ...contact, ...body };
    contacts[foundContactIndex] = updatedContact;

    await saveContact(contacts);

    return contacts;
  } catch (error) {
    console.log(error);
    throw error; 
  }
};


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

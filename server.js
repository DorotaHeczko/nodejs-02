const app = require("./app");
const mongoose = require("mongoose");

const uriDb = process.env.DB_HOST;

async function startServer() {
  try {
    await mongoose.connect(uriDb, { dbName: "db-contacts" });
    console.log("Database connection successful");

    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  } catch (error) {
    console.error(`Server not running. Error message: ${error.message}`);
    process.exit(1);
  }
}

startServer();

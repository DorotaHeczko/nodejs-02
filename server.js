const app = require("./app");
const mongoose = require("mongoose");
const uriDb = process.env.DB_HOST;
const join = mongoose.connect(uriDb, { dbName: "db-contacts" });

join
  .then(() => {
    app.listen(3000, () => {
      console.log("Databese connection successfull");
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((error) => {
    console.log(`Server not running. Error message: ${error.message}`);
    process.exit(1);
  });

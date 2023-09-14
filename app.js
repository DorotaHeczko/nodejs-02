const express = require('express')
const logger = require('morgan')
const cors = require('cors')
require("dotenv").config();
require("./config/config-passport");

const myCustomRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");



const app = express()

const logFormats = app.get("env") === "development" ? "dev" : "short";

app.use(logger(logFormats));
app.use(cors())
app.use(express.json())

app.use("/api/contacts", myCustomRouter);
app.use("/api/users", usersRouter);


app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app







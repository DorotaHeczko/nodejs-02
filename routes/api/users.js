const express = require("express");
const router = express.Router();
const contactController = require("../../controller/users");

// const {signup} = require("../../controller/users")

router.post("/signup", contactController.signup);

router.post("/login", contactController.login);

router.get("/logout", contactController.auth, contactController.logout);

router.get("/current", contactController.auth, contactController.current);

router.patch("/subscription", contactController.auth, contactController.subscription);

module.exports = router;


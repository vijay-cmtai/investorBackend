const express = require("express");
const { submitContactForm } = require("../controllers/contactController.js");

const router = express.Router();

router.post("/submit", submitContactForm);

module.exports = router;

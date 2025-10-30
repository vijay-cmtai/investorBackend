// /routes/saleRoutes.js

const express = require("express");
const { createSale, getAllSales } = require("../controllers/saleController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

router
  .route("/")
  .get(protect, authorize("Admin", "Company"), getAllSales)
  .post(protect, authorize("Associate", "Admin"), createSale);

module.exports = router;

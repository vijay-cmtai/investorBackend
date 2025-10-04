const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getBrokers,
} = require("../controllers/userController");

const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getUsers); 

router.route("/brokers").get(getBrokers);
router
  .route("/:id")
  .get(getUserById) 
  .put(updateUser) 
  .delete(deleteUser); 

module.exports = router;

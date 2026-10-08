const express = require("express");
const router = express.Router();

const cartController =
  require("../controllers/cartController");

const {
  authenticate,
  requireRole,
} = require("../middleware/authMiddleware");

// Tất cả API giỏ hàng chỉ dành cho Customer
router.use(authenticate, requireRole("customer"));

router.get("/", cartController.getCart);

router.post("/items", cartController.addItem);

router.patch("/items/:id", cartController.updateItem);

router.delete("/items/:id", cartController.removeItem);

router.post("/checkout", cartController.checkout);

module.exports = router;
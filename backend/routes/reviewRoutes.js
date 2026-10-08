const express = require("express");
const router = express.Router();

const reviewController =
  require("../controllers/reviewController");

const {
  authenticate,
  requireRole,
} = require("../middleware/authMiddleware");

// Ai cũng có thể xem đánh giá
router.get(
  "/product/:id",
  reviewController.getByProduct
);

// Chỉ Customer xem quyền đánh giá của mình
router.get(
  "/my/:id",
  authenticate,
  requireRole("customer"),
  reviewController.getMyStatus
);

// Customer thêm đánh giá
router.post(
  "/",
  authenticate,
  requireRole("customer"),
  reviewController.create
);

// Customer chỉnh sửa đánh giá của chính mình
router.put(
  "/:id",
  authenticate,
  requireRole("customer"),
  reviewController.update
);

module.exports = router;
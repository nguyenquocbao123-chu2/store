const express = require("express");
const router = express.Router();

const inventoryController =
  require("../controllers/inventoryController");

const {
  authenticate,
  requireRole,
} = require("../middleware/authMiddleware");

// Chỉ Owner được sử dụng API tồn kho
router.use(authenticate, requireRole("owner"));

// Danh sách tồn kho
router.get("/", inventoryController.getAll);

// Cảnh báo tồn kho thấp
router.get(
  "/alerts",
  inventoryController.getLowStockProducts
);

// Lịch sử biến động tồn kho
router.get(
  "/movements",
  inventoryController.getMovements
);

// Sửa ngưỡng cảnh báo
router.patch(
  "/:id/threshold",
  inventoryController.updateThreshold
);

module.exports = router;
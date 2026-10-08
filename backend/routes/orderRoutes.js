const express = require("express");
const router = express.Router();

const orderController =
  require("../controllers/orderController");

const customerOrderController =
  require("../controllers/customerOrderController");

const orderAdminController =
  require("../controllers/orderAdminController");

const {
  authenticate,
  requireRole,
} = require("../middleware/authMiddleware");

// Khách hàng tạo đơn hàng
router.post(
  "/",
  authenticate,
  requireRole("customer"),
  orderController.createOrder
);

// Khách hàng xem lịch sử đơn hàng
router.get(
  "/my",
  authenticate,
  requireRole("customer"),
  customerOrderController.getMyOrders
);

// Khách hàng xem chi tiết đơn của mình
router.get(
  "/my/:id",
  authenticate,
  requireRole("customer"),
  customerOrderController.getMyOrderDetail
);

// Owner xem danh sách đơn hàng
router.get(
  "/admin",
  authenticate,
  requireRole("owner"),
  orderAdminController.getAll
);

// Owner xem chi tiết đơn hàng
router.get(
  "/admin/:id",
  authenticate,
  requireRole("owner"),
  orderAdminController.getById
);

// Owner cập nhật trạng thái đơn hàng
router.patch(
  "/admin/:id/status",
  authenticate,
  requireRole("owner"),
  orderAdminController.updateStatus
);

module.exports = router;
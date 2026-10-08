const OrderAdmin = require("../models/orderAdminModel");

const orderAdminController = {
  // Danh sách đơn hàng
  getAll(req, res) {
    OrderAdmin.getAll((err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể lấy danh sách đơn hàng",
        });
      }

      res.json({
        message: "Lấy danh sách đơn hàng thành công",
        total: rows.length,
        orders: rows,
      });
    });
  },

  // Chi tiết đơn hàng
  getById(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Mã đơn hàng không hợp lệ",
      });
    }

    OrderAdmin.getById(id, (err, order) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể lấy chi tiết đơn hàng",
        });
      }

      if (!order) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng",
        });
      }

      res.json({
        message: "Lấy chi tiết đơn hàng thành công",
        order,
      });
    });
  },

  // Cập nhật trạng thái
  async updateStatus(req, res) {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Mã đơn hàng không hợp lệ",
      });
    }

    const allowedStatuses = [
      "processing",
      "shipping",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Trạng thái yêu cầu không hợp lệ",
      });
    }

    try {
      const order = await OrderAdmin.updateStatus(
        id,
        status
      );

      res.json({
        message: "Cập nhật trạng thái thành công",
        order,
      });
    } catch (err) {
      console.error(
        "Lỗi cập nhật đơn hàng:",
        err.message
      );

      res.status(err.statusCode || 500).json({
        message: err.statusCode
          ? err.message
          : "Lỗi hệ thống khi cập nhật đơn hàng",
      });
    }
  },
};

module.exports = orderAdminController;
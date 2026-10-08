const Inventory = require("../models/inventoryModel");

const inventoryController = {
  // Danh sách tồn kho
  getAll(req, res) {
    Inventory.getAll((err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể lấy danh sách tồn kho",
        });
      }

      res.json({
        message: "Lấy tồn kho thành công",
        total: rows.length,
        products: rows,
      });
    });
  },

  // Cảnh báo tồn kho thấp
  getLowStockProducts(req, res) {
    Inventory.getLowStock((err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể lấy cảnh báo tồn kho",
        });
      }

      res.json({
        message: "Danh sách cảnh báo tồn kho",
        total: rows.length,
        products: rows,
      });
    });
  },

  // Lịch sử nhập và bán hàng
  getMovements(req, res) {
    Inventory.getMovements((err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể lấy lịch sử tồn kho",
        });
      }

      res.json({
        message: "Lấy lịch sử tồn kho thành công",
        movements: rows,
      });
    });
  },

  // Sửa ngưỡng cảnh báo
  updateThreshold(req, res) {
    const productId = Number(req.params.id);
    const { low_stock_threshold } = req.body;

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        message: "Mã sản phẩm không hợp lệ",
      });
    }

    if (
      !Number.isSafeInteger(low_stock_threshold) ||
      low_stock_threshold < 0 ||
      low_stock_threshold > 1000000
    ) {
      return res.status(400).json({
        message: "Ngưỡng cảnh báo phải từ 0 đến 1000000",
      });
    }

    Inventory.updateThreshold(
      productId,
      low_stock_threshold,
      (err, product) => {
        if (err) {
          return res.status(500).json({
            message: "Không thể cập nhật ngưỡng cảnh báo",
          });
        }

        if (!product) {
          return res.status(404).json({
            message: "Không tìm thấy sản phẩm",
          });
        }

        res.json({
          message: "Cập nhật ngưỡng cảnh báo thành công",
          product,
        });
      }
    );
  },
};

module.exports = inventoryController;
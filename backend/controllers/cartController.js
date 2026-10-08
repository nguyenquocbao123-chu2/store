const Cart = require("../models/cartModel");

function sendError(res, err) {
  console.error("Lỗi giỏ hàng:", err.message);

  return res.status(err.statusCode || 500).json({
    message: err.statusCode
      ? err.message
      : "Lỗi hệ thống khi xử lý giỏ hàng",
  });
}

function validId(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function validQuantity(value) {
  return (
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= 1000
  );
}

const cartController = {
  async getCart(req, res) {
    try {
      const cart = await Cart.getCart(
        req.user.user_id
      );

      res.json({ cart });
    } catch (err) {
      sendError(res, err);
    }
  },

  async addItem(req, res) {
    const { product_id, quantity = 1 } =
      req.body || {};

    if (
      !validId(product_id) ||
      !validQuantity(quantity)
    ) {
      return res.status(400).json({
        message: "Mã sản phẩm hoặc số lượng không hợp lệ",
      });
    }

    try {
      const item = await Cart.addItem(
        req.user.user_id,
        product_id,
        quantity
      );

      res.status(201).json({
        message: "Đã thêm vào giỏ hàng",
        item,
      });
    } catch (err) {
      sendError(res, err);
    }
  },

  async updateItem(req, res) {
    const itemId = Number(req.params.id);
    const { quantity } = req.body || {};

    if (
      !validId(itemId) ||
      !validQuantity(quantity)
    ) {
      return res.status(400).json({
        message: "Dữ liệu cập nhật không hợp lệ",
      });
    }

    try {
      const item = await Cart.updateItem(
        req.user.user_id,
        itemId,
        quantity
      );

      res.json({
        message: "Cập nhật số lượng thành công",
        item,
      });
    } catch (err) {
      sendError(res, err);
    }
  },

  async removeItem(req, res) {
    const itemId = Number(req.params.id);

    if (!validId(itemId)) {
      return res.status(400).json({
        message: "Mã sản phẩm trong giỏ không hợp lệ",
      });
    }

    try {
      await Cart.removeItem(
        req.user.user_id,
        itemId
      );

      res.json({
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
      });
    } catch (err) {
      sendError(res, err);
    }
  },

  async checkout(req, res) {
    const {
      receiver_name,
      receiver_phone,
      shipping_address,
      payment_method,
    } = req.body || {};

    if (
      typeof receiver_name !== "string" ||
      !receiver_name.trim() ||
      receiver_name.trim().length > 100 ||
      typeof receiver_phone !== "string" ||
      !receiver_phone.trim() ||
      receiver_phone.trim().length > 20 ||
      typeof shipping_address !== "string" ||
      !shipping_address.trim() ||
      shipping_address.trim().length > 255
    ) {
      return res.status(400).json({
        message: "Thông tin giao hàng không hợp lệ",
      });
    }

    if (payment_method !== "cod") {
      return res.status(400).json({
        message: "Hiện tại chỉ hỗ trợ COD",
      });
    }

    try {
      const order = await Cart.checkout(
        req.user.user_id,
        {
          receiver_name: receiver_name.trim(),
          receiver_phone: receiver_phone.trim(),
          shipping_address: shipping_address.trim(),
        }
      );

      res.status(201).json({
        message: "Đặt hàng thành công",
        order,
      });
    } catch (err) {
      sendError(res, err);
    }
  },
};

module.exports = cartController;
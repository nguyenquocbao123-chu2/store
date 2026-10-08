const CustomerOrder =
  require("../models/customerOrderModel");

const customerOrderController = {
  // Xem đơn hàng của tôi
  getMyOrders(req, res) {
    const userId = req.user.user_id;

    CustomerOrder.getByUserId(
      userId,
      (err, orders) => {
        if (err) {
          return res.status(500).json({
            message: "Không thể lấy lịch sử đơn hàng",
          });
        }

        res.json({
          message: "Lấy lịch sử đơn hàng thành công",
          total: orders.length,
          orders,
        });
      }
    );
  },

  // Xem chi tiết đơn hàng của tôi
  getMyOrderDetail(req, res) {
    const userId = req.user.user_id;
    const orderId = Number(req.params.id);

    if (
      !Number.isSafeInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message: "Mã đơn hàng không hợp lệ",
      });
    }

    CustomerOrder.getDetail(
      userId,
      orderId,
      (err, order) => {
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
      }
    );
  },
};

module.exports = customerOrderController;
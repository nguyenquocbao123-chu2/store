const db = require("../config/database");

const CustomerOrder = {
  // Lấy tối đa 100 đơn hàng mới nhất của khách hàng
  getByUserId(userId, callback) {
    db.all(
      `
      SELECT
        order_id,
        total_amount,
        receiver_name,
        receiver_phone,
        shipping_address,
        payment_method,
        status,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY order_id DESC
      LIMIT 100
      `,
      [userId],
      callback
    );
  },

  // Lấy chi tiết một đơn thuộc đúng khách hàng
  getDetail(userId, orderId, callback) {
    db.get(
      `
      SELECT
        order_id,
        user_id,
        total_amount,
        receiver_name,
        receiver_phone,
        shipping_address,
        payment_method,
        status,
        created_at
      FROM orders
      WHERE order_id = ?
        AND user_id = ?
      `,
      [orderId, userId],
      (err, order) => {
        if (err) return callback(err);

        if (!order) {
          return callback(null, null);
        }

        db.all(
          `
          SELECT
            d.order_detail_id,
            d.product_id,
            p.product_name,
            p.image,
            d.quantity,
            d.price,
            d.quantity * d.price AS subtotal
          FROM order_details d
          LEFT JOIN products p
            ON d.product_id = p.product_id
          WHERE d.order_id = ?
          ORDER BY d.order_detail_id
          `,
          [orderId],
          (detailErr, items) => {
            if (detailErr) {
              return callback(detailErr);
            }

            callback(null, {
              ...order,
              items,
            });
          }
        );
      }
    );
  },
};

module.exports = CustomerOrder;
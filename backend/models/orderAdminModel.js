const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const db = require("../config/database");

const DB_PATH = path.join(
  __dirname,
  "../database/electronic_store.db"
);

const NEXT_STATUS = {
  confirmed: ["processing", "cancelled"],
  processing: ["shipping", "cancelled"],
  shipping: ["completed"],
  completed: [],
  cancelled: [],
};

function businessError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const connection = new sqlite3.Database(
      DB_PATH,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) return reject(err);

        connection.configure("busyTimeout", 5000);
        resolve(connection);
      }
    );
  });
}

function run(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.run(sql, params, function (err) {
      if (err) return reject(err);

      resolve({
        changes: this.changes,
        lastID: this.lastID,
      });
    });
  });
}

function get(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function closeDatabase(connection) {
  return new Promise((resolve, reject) => {
    connection.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const ORDER_SELECT = `
  SELECT
    o.order_id,
    o.user_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    o.receiver_name,
    o.receiver_phone,
    o.shipping_address,
    o.payment_method,
    o.total_amount,
    o.status,
    o.created_at
  FROM orders o
  JOIN users u ON o.user_id = u.user_id
`;

const OrderAdmin = {
  // Lấy 100 đơn hàng mới nhất
  getAll(callback) {
    db.all(
      `
      ${ORDER_SELECT}
      ORDER BY o.order_id DESC
      LIMIT 100
      `,
      [],
      callback
    );
  },

  // Xem chi tiết một đơn hàng
  getById(orderId, callback) {
    db.get(
      `
      ${ORDER_SELECT}
      WHERE o.order_id = ?
      `,
      [orderId],
      (err, order) => {
        if (err || !order) {
          return callback(err, order || null);
        }

        db.all(
          `
          SELECT
            d.order_detail_id,
            d.product_id,
            p.product_name,
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

  // Cập nhật trạng thái và xử lý hoàn kho khi hủy
  async updateStatus(orderId, newStatus) {
    const connection = await openDatabase();
    let inTransaction = false;

    try {
      await run(connection, "PRAGMA foreign_keys = ON");

      await run(
        connection,
        "BEGIN IMMEDIATE TRANSACTION"
      );

      inTransaction = true;

      const order = await get(
        connection,
        `
        SELECT order_id, status
        FROM orders
        WHERE order_id = ?
        `,
        [orderId]
      );

      if (!order) {
        throw businessError(
          "Không tìm thấy đơn hàng",
          404
        );
      }

      const allowed =
        NEXT_STATUS[order.status] || [];

      if (!allowed.includes(newStatus)) {
        throw businessError(
          `Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`,
          409
        );
      }

      // Khi hủy đơn, cộng lại hàng đã trừ lúc đặt
      if (newStatus === "cancelled") {
        const items = await all(
          connection,
          `
          SELECT product_id, quantity
          FROM order_details
          WHERE order_id = ?
          `,
          [orderId]
        );

        if (items.length === 0) {
          throw businessError(
            "Đơn hàng không có chi tiết sản phẩm",
            409
          );
        }

        for (const item of items) {
          const result = await run(
            connection,
            `
            UPDATE products
            SET stock_quantity =
              stock_quantity + ?
            WHERE product_id = ?
              AND stock_quantity <= ?
            `,
            [
              item.quantity,
              item.product_id,
              Number.MAX_SAFE_INTEGER - item.quantity,
            ]
          );

          if (result.changes !== 1) {
            throw businessError(
              "Không thể hoàn lại tồn kho",
              409
            );
          }
        }
      }

      const result = await run(
        connection,
        `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
          AND status = ?
        `,
        [
          newStatus,
          orderId,
          order.status,
        ]
      );

      if (result.changes !== 1) {
        throw businessError(
          "Trạng thái đơn hàng đã thay đổi",
          409
        );
      }

      await run(connection, "COMMIT");
      inTransaction = false;

      return {
        order_id: orderId,
        status: newStatus,
      };
    } catch (err) {
      if (inTransaction) {
        try {
          await run(connection, "ROLLBACK");
        } catch (rollbackError) {
          console.error(
            "Lỗi rollback:",
            rollbackError.message
          );
        }
      }

      throw err;
    } finally {
      try {
        await closeDatabase(connection);
      } catch (closeError) {
        console.error(
          "Lỗi đóng SQLite:",
          closeError.message
        );
      }
    }
  },
};

module.exports = OrderAdmin;
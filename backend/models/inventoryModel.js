const db = require("../config/database");

const Inventory = {
  // Lấy toàn bộ sản phẩm và số lượng tồn kho
  getAll(callback) {
    db.all(
      `
      SELECT
        p.product_id,
        p.product_name,
        p.brand,
        p.stock_quantity,
        COALESCE(p.low_stock_threshold, 0)
          AS low_stock_threshold,
        COALESCE(p.status, 'active') AS status,
        c.category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      ORDER BY p.product_id DESC
      `,
      [],
      callback
    );
  },

  // Lấy sản phẩm đang bán có tồn kho thấp
  getLowStock(callback) {
    db.all(
      `
      SELECT
        p.product_id,
        p.product_name,
        p.brand,
        p.stock_quantity,
        COALESCE(p.low_stock_threshold, 0)
          AS low_stock_threshold,
        c.category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      WHERE COALESCE(p.status, 'active') = 'active'
        AND p.stock_quantity <=
            COALESCE(p.low_stock_threshold, 0)
      ORDER BY p.stock_quantity ASC
      `,
      [],
      callback
    );
  },

  // Lịch sử biến động tồn kho từ nhập hàng và đặt hàng
  getMovements(callback) {
    db.all(
      `
      SELECT *
      FROM (
        SELECT
          'import' AS movement_type,
          d.import_detail_id AS movement_id,
          d.import_id AS reference_id,
          d.product_id,
          p.product_name,
          d.quantity AS quantity,
          i.created_at
        FROM import_details d
        JOIN imports i
          ON d.import_id = i.import_id
        JOIN products p
          ON d.product_id = p.product_id

        UNION ALL

        SELECT
          'order' AS movement_type,
          d.order_detail_id AS movement_id,
          d.order_id AS reference_id,
          d.product_id,
          p.product_name,
          -d.quantity AS quantity,
          o.created_at
        FROM order_details d
        JOIN orders o
          ON d.order_id = o.order_id
        JOIN products p
          ON d.product_id = p.product_id
      ) AS movements
      ORDER BY
        datetime(created_at) DESC,
        movement_type DESC,
        movement_id DESC
      LIMIT 50
      `,
      [],
      callback
    );
  },

  // Thay đổi ngưỡng cảnh báo, không sửa số lượng tồn kho
  updateThreshold(productId, threshold, callback) {
    db.run(
      `
      UPDATE products
      SET low_stock_threshold = ?
      WHERE product_id = ?
      `,
      [threshold, productId],
      function (err) {
        if (err) return callback(err);

        db.get(
          `
          SELECT
            product_id,
            product_name,
            stock_quantity,
            low_stock_threshold
          FROM products
          WHERE product_id = ?
          `,
          [productId],
          callback
        );
      }
    );
  },
};

module.exports = Inventory;

const db = require("../config/database");

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    db.get(sql, [], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function queryAll(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

const Report = {
  async getOverview() {
    const [summary, monthly, topProducts] =
      await Promise.all([
        queryOne(`
          SELECT
            COUNT(*) AS total_orders,

            COALESCE(SUM(
              CASE WHEN status = 'completed'
              THEN 1 ELSE 0 END
            ), 0) AS completed_orders,

            COALESCE(SUM(
              CASE WHEN status = 'cancelled'
              THEN 1 ELSE 0 END
            ), 0) AS cancelled_orders,

            COALESCE(SUM(
              CASE
                WHEN status NOT IN ('completed', 'cancelled')
                THEN 1 ELSE 0
              END
            ), 0) AS active_orders,

            COALESCE(SUM(
              CASE WHEN status = 'completed'
              THEN total_amount ELSE 0 END
            ), 0) AS completed_revenue

          FROM orders
        `),

        queryAll(`
          WITH RECURSIVE months(month_start) AS (
            SELECT date('now', 'start of month', '-5 months')

            UNION ALL

            SELECT date(month_start, '+1 month')
            FROM months
            WHERE month_start <
              date('now', 'start of month')
          )

          SELECT
            strftime('%Y-%m', months.month_start) AS month,

            COALESCE(SUM(o.total_amount), 0) AS revenue,

            COUNT(o.order_id) AS completed_orders

          FROM months

          LEFT JOIN orders o
            ON o.status = 'completed'
            AND strftime('%Y-%m', o.created_at) =
                strftime('%Y-%m', months.month_start)

          GROUP BY months.month_start
          ORDER BY months.month_start
        `),

        queryAll(`
          SELECT
            d.product_id,

            COALESCE(
              p.product_name,
              'Sản phẩm đã xóa'
            ) AS product_name,

            SUM(d.quantity) AS sold_quantity,

            SUM(d.quantity * d.price) AS revenue

          FROM order_details d

          JOIN orders o
            ON o.order_id = d.order_id

          LEFT JOIN products p
            ON p.product_id = d.product_id

          WHERE o.status = 'completed'

          GROUP BY d.product_id

          ORDER BY sold_quantity DESC, revenue DESC

          LIMIT 5
        `),
      ]);

    return {
      summary,
      monthly,
      top_products: topProducts,
    };
  },
};

module.exports = Report;

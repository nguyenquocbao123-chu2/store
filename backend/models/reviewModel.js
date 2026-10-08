const db = require("../config/database");

function businessError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const Review = {
  // Lấy đánh giá và điểm trung bình
  getByProduct(productId, callback) {
    db.get(
      "SELECT product_id FROM products WHERE product_id = ?",
      [productId],
      (err, product) => {
        if (err) return callback(err);

        if (!product) {
          return callback(
            businessError("Không tìm thấy sản phẩm", 404)
          );
        }

        db.all(
          `
          SELECT
            r.review_id,
            r.rating,
            r.comment,
            r.created_at,
            u.full_name AS reviewer_name
          FROM reviews r
          JOIN users u ON r.user_id = u.user_id
          WHERE r.product_id = ?
          ORDER BY r.review_id DESC
          LIMIT 100
          `,
          [productId],
          (listErr, reviews) => {
            if (listErr) return callback(listErr);

            db.get(
              `
              SELECT
                COUNT(*) AS total_reviews,
                COALESCE(
                  ROUND(AVG(rating), 1), 0
                ) AS average_rating
              FROM reviews
              WHERE product_id = ?
              `,
              [productId],
              (summaryErr, summary) => {
                if (summaryErr) {
                  return callback(summaryErr);
                }

                callback(null, {
                  reviews,
                  summary,
                });
              }
            );
          }
        );
      }
    );
  },

  // Kiểm tra khách hàng có được đánh giá không
  getMyStatus(userId, productId, callback) {
    db.get(
      `
      SELECT
        review_id,
        rating,
        comment,
        created_at
      FROM reviews
      WHERE user_id = ?
        AND product_id = ?
      ORDER BY review_id DESC
      LIMIT 1
      `,
      [userId, productId],
      (err, review) => {
        if (err) return callback(err);

        db.get(
          `
          SELECT 1 AS eligible
          FROM orders o
          JOIN order_details d
            ON o.order_id = d.order_id
          WHERE o.user_id = ?
            AND o.status = 'completed'
            AND d.product_id = ?
          LIMIT 1
          `,
          [userId, productId],
          (checkErr, order) => {
            if (checkErr) return callback(checkErr);

            callback(null, {
              review: review || null,
              can_review: Boolean(order),
            });
          }
        );
      }
    );
  },

  // Thêm đánh giá, chỉ khi đã mua hàng hoàn thành
  create(userId, productId, rating, comment, callback) {
    db.run(
      `
      INSERT INTO reviews (
        user_id,
        product_id,
        order_id,
        rating,
        comment
      )
      SELECT
        ?, ?, o.order_id, ?, ?
      FROM orders o
      JOIN order_details d
        ON o.order_id = d.order_id
      WHERE o.user_id = ?
        AND o.status = 'completed'
        AND d.product_id = ?
        AND NOT EXISTS (
          SELECT 1
          FROM reviews r
          WHERE r.user_id = ?
            AND r.product_id = ?
        )
      ORDER BY o.order_id DESC
      LIMIT 1
      `,
      [
        userId,
        productId,
        rating,
        comment,
        userId,
        productId,
        userId,
        productId,
      ],
      function (err) {
        if (err) return callback(err);

        if (this.changes === 1) {
          return callback(null, {
            review_id: this.lastID,
            product_id: productId,
            rating,
            comment,
          });
        }

        Review.getMyStatus(
          userId,
          productId,
          (checkErr, status) => {
            if (checkErr) return callback(checkErr);

            if (status.review) {
              return callback(
                businessError(
                  "Bạn đã đánh giá sản phẩm này. Hãy chỉnh sửa đánh giá cũ.",
                  409
                )
              );
            }

            callback(
              businessError(
                "Bạn cần có đơn hàng hoàn thành chứa sản phẩm này để đánh giá.",
                403
              )
            );
          }
        );
      }
    );
  },

  // Chỉ chủ sở hữu đánh giá được chỉnh sửa
  update(userId, reviewId, rating, comment, callback) {
    db.run(
      `
      UPDATE reviews
      SET rating = ?,
          comment = ?
      WHERE review_id = ?
        AND user_id = ?
      `,
      [rating, comment, reviewId, userId],
      function (err) {
        if (err) return callback(err);

        if (this.changes === 0) {
          return callback(
            businessError(
              "Không tìm thấy đánh giá của bạn",
              404
            )
          );
        }

        callback(null, {
          review_id: reviewId,
          rating,
          comment,
        });
      }
    );
  },
};

module.exports = Review;
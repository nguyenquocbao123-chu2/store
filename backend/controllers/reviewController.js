const Review = require("../models/reviewModel");

function sendError(res, err) {
  console.error("Review error:", err.message);

  res.status(err.statusCode || 500).json({
    message: err.statusCode
      ? err.message
      : "Lỗi hệ thống khi xử lý đánh giá",
  });
}

function validId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function validateReview(body) {
  const { rating, comment = "" } = body || {};

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return "Số sao phải từ 1 đến 5";
  }

  if (
    typeof comment !== "string" ||
    comment.trim().length > 1000
  ) {
    return "Nội dung đánh giá tối đa 1000 ký tự";
  }

  return null;
}

const reviewController = {
  getByProduct(req, res) {
    const productId = Number(req.params.id);

    if (!validId(productId)) {
      return res.status(400).json({
        message: "Mã sản phẩm không hợp lệ",
      });
    }

    Review.getByProduct(
      productId,
      (err, data) => {
        if (err) return sendError(res, err);

        res.json(data);
      }
    );
  },

  getMyStatus(req, res) {
    const productId = Number(req.params.id);

    if (!validId(productId)) {
      return res.status(400).json({
        message: "Mã sản phẩm không hợp lệ",
      });
    }

    Review.getMyStatus(
      req.user.user_id,
      productId,
      (err, data) => {
        if (err) return sendError(res, err);

        res.json(data);
      }
    );
  },

  create(req, res) {
    const productId = req.body?.product_id;

    if (!validId(productId)) {
      return res.status(400).json({
        message: "Mã sản phẩm không hợp lệ",
      });
    }

    const validationError = validateReview(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    Review.create(
      req.user.user_id,
      productId,
      req.body.rating,
      (req.body.comment || "").trim(),
      (err, review) => {
        if (err) return sendError(res, err);

        res.status(201).json({
          message: "Đánh giá thành công",
          review,
        });
      }
    );
  },

  update(req, res) {
    const reviewId = Number(req.params.id);

    if (!validId(reviewId)) {
      return res.status(400).json({
        message: "Mã đánh giá không hợp lệ",
      });
    }

    const validationError = validateReview(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    Review.update(
      req.user.user_id,
      reviewId,
      req.body.rating,
      (req.body.comment || "").trim(),
      (err, review) => {
        if (err) return sendError(res, err);

        res.json({
          message: "Cập nhật đánh giá thành công",
          review,
        });
      }
    );
  },
};

module.exports = reviewController;
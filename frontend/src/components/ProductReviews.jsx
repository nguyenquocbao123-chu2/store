import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMe,
  getProductReviews,
  getMyReviewStatus,
  createReview,
  updateReview,
} from "../services/api";

import "./ProductReviews.css";

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    average_rating: 0,
    total_reviews: 0,
  });

  const [user, setUser] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [canReview, setCanReview] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setUser(null);
      setMyReview(null);
      setCanReview(false);
      setRating(5);
      setComment("");

      try {
        const data = await getProductReviews(productId);

        if (cancelled) return;

        setReviews(data.reviews || []);
        setSummary(
          data.summary || {
            average_rating: 0,
            total_reviews: 0,
          }
        );

        if (localStorage.getItem("token")) {
          try {
            const me = await getMe();

            if (cancelled) return;

            setUser(me.user);

            if (me.user?.role === "customer") {
              const status =
                await getMyReviewStatus(productId);

              if (cancelled) return;

              setMyReview(status.review);
              setCanReview(status.can_review);

              if (status.review) {
                setRating(status.review.rating);
                setComment(status.review.comment || "");
              }
            }
          } catch (authError) {
            if (!cancelled) {
              setUser(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Không thể tải đánh giá."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function refreshReviews() {
    const data = await getProductReviews(productId);

    setReviews(data.reviews || []);
    setSummary(data.summary || {
      average_rating: 0,
      total_reviews: 0,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        rating,
        comment: comment.trim(),
      };

      if (myReview) {
        await updateReview(myReview.review_id, payload);
      } else {
        await createReview({
          product_id: Number(productId),
          ...payload,
        });
      }

      const status =
        await getMyReviewStatus(productId);

      setMyReview(status.review);
      setCanReview(status.can_review);

      await refreshReviews();

      setMessage(
        "Đánh giá của bạn đã được lưu thành công!"
      );
    } catch (err) {
      setError(
        err.message || "Không thể lưu đánh giá."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="product-reviews">
        <p>Đang tải đánh giá sản phẩm...</p>
      </section>
    );
  }

  return (
    <section className="product-reviews">
      <h2>Đánh giá và nhận xét sản phẩm</h2>

      {error && (
        <p className="review-error">{error}</p>
      )}

      {message && (
        <p className="review-success">{message}</p>
      )}

      <div className="review-summary">
        <div>
          <strong className="review-average">
            {Number(summary.average_rating).toFixed(1)}
          </strong>
          <span> / 5</span>
        </div>

        <div>
          <div className="review-stars">
            {"★".repeat(
              Math.round(summary.average_rating)
            )}
            {"☆".repeat(
              5 - Math.round(summary.average_rating)
            )}
          </div>

          <p>
            {summary.total_reviews} lượt đánh giá
          </p>
        </div>
      </div>

      {!user ? (
        <p>
          <Link to="/login">Đăng nhập</Link> để kiểm tra
          quyền đánh giá sản phẩm.
        </p>
      ) : user.role !== "customer" ? (
        <p>Chỉ tài khoản khách hàng được viết đánh giá.</p>
      ) : !canReview && !myReview ? (
        <p className="review-info">
          Bạn cần mua sản phẩm và có đơn hàng ở trạng thái
          hoàn thành trước khi đánh giá.
        </p>
      ) : (
        <form
          className="review-form"
          onSubmit={handleSubmit}
        >
          <h3>
            {myReview
              ? "Chỉnh sửa đánh giá của bạn"
              : "Viết đánh giá của bạn"}
          </h3>

          <label>Chọn số sao</label>

          <div
            className="review-rating-buttons"
            role="group"
            aria-label="Chọn số sao đánh giá"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} sao`}
                aria-pressed={rating === star}
                onClick={() => setRating(star)}
                className={
                  star <= rating ? "selected" : ""
                }
              >
                ★
              </button>
            ))}
          </div>

          <label htmlFor="review-comment">
            Nội dung nhận xét
          </label>

          <textarea
            id="review-comment"
            rows={4}
            maxLength={1000}
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
          />

          <p className="review-character-count">
            {comment.length}/1000 ký tự
          </p>

          <button
            type="submit"
            className="review-submit"
            disabled={saving}
          >
            {saving
              ? "Đang lưu..."
              : myReview
                ? "Cập nhật đánh giá"
                : "Gửi đánh giá"}
          </button>
        </form>
      )}

      <div className="review-list">
        <h3>Nhận xét của khách hàng</h3>

        {reviews.length === 0 ? (
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          reviews.map((review) => (
            <article
              className="review-card"
              key={review.review_id}
            >
              <div className="review-card-heading">
                <strong>{review.reviewer_name}</strong>

                <span className="review-stars">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>

              <p className="review-date">
                {review.created_at}
              </p>

              <p className="review-comment">
                {review.comment || "Không có nhận xét."}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ProductReviews;
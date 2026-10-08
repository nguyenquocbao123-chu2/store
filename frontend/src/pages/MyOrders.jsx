import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getMyOrders,
  getMyOrderDetail,
} from "../services/api";

import "./MyOrders.css";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_STEPS = [
  "confirmed",
  "processing",
  "shipping",
  "completed",
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(
    value.includes("T")
      ? value
      : value.replace(" ", "T") + "Z"
  );

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("vi-VN");
}

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra đăng nhập và lấy danh sách đơn
  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (!localStorage.getItem("token")) {
        navigate("/login", {
          replace: true,
          state: { from: "/my-orders" },
        });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const me = await getMe();

        if (cancelled) return;

        if (me.user?.role !== "customer") {
          setForbidden(true);
          return;
        }

        const data = await getMyOrders();

        if (!cancelled) {
          setOrders(
            Array.isArray(data.orders) ? data.orders : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Không thể tải lịch sử đơn hàng."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [navigate, reloadKey]);

  // Tải chi tiết khi chọn một đơn
  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      setLoadingDetail(false);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setLoadingDetail(true);
      setDetail(null);

      try {
        const data = await getMyOrderDetail(selectedId);

        if (!cancelled) {
          setDetail(data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Không thể xem chi tiết đơn hàng."
          );
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedId, reloadKey]);

  const filteredOrders = orders.filter((order) => {
    const search = keyword.trim().toLowerCase();

    const matchesKeyword =
      String(order.order_id).includes(search) ||
      String(order.receiver_name || "")
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesKeyword && matchesStatus;
  });

  function toggleDetail(orderId) {
    setError("");

    setSelectedId((current) =>
      current === orderId ? null : orderId
    );
  }

  function renderProgress(status) {
    if (status === "cancelled") {
      return (
        <p className="my-order-cancelled">
          Đơn hàng đã được hủy.
        </p>
      );
    }

    if (status === "pending") {
      return <p>Đơn hàng đang chờ xác nhận.</p>;
    }

    const currentStep = STATUS_STEPS.indexOf(status);

    return (
      <div className="my-order-progress">
        {STATUS_STEPS.map((step, index) => (
          <div
            key={step}
            className={
              "my-order-step " +
              (index <= currentStep ? "active" : "")
            }
          >
            <span className="my-order-step-number">
              {index + 1}
            </span>

            <span>{STATUS_LABELS[step]}</span>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <main className="my-orders-page">
        <p>Đang tải đơn hàng của bạn...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="my-orders-page">
        <h2>Không có quyền truy cập</h2>
        <p>Trang này dành cho tài khoản khách hàng.</p>
        <Link to="/">Về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-heading">
        <div>
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi lịch sử mua hàng tại UMA.VN</p>
        </div>

        <div className="my-orders-links">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Làm mới
          </button>

          <Link to="/products">Tiếp tục mua sắm</Link>
        </div>
      </div>

      {error && (
        <div className="my-orders-error">
          {error}{" "}
          <Link to="/login">Đăng nhập lại</Link>
        </div>
      )}

      <section className="my-orders-panel">
        <div className="my-orders-summary">
          <h2>Lịch sử đơn hàng</h2>
          <span>{orders.length} đơn hàng gần nhất</span>
        </div>

        <div className="my-orders-filters">
          <input
            type="text"
            placeholder="Tìm mã đơn hoặc tên người nhận..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">Tất cả trạng thái</option>

            {Object.entries(STATUS_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="my-orders-empty">
            <p>Không có đơn hàng phù hợp.</p>
            <Link to="/products">Xem sản phẩm</Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {filteredOrders.map((order) => (
              <article
                key={order.order_id}
                className="my-order-card"
              >
                <div className="my-order-card-header">
                  <div>
                    <h3>Đơn hàng #{order.order_id}</h3>

                    <p>
                      Ngày đặt: {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={
                      "my-order-status " + order.status
                    }
                  >
                    {STATUS_LABELS[order.status] ||
                      order.status}
                  </span>
                </div>

                <div className="my-order-card-body">
                  <p>
                    <strong>Người nhận:</strong>{" "}
                    {order.receiver_name}
                  </p>

                  <p>
                    <strong>Tổng tiền:</strong>{" "}
                    <span className="my-order-price">
                      {formatMoney(order.total_amount)}
                    </span>
                  </p>
                </div>

                <button
                  className="my-order-detail-button"
                  onClick={() =>
                    toggleDetail(order.order_id)
                  }
                >
                  {selectedId === order.order_id
                    ? "Ẩn chi tiết"
                    : "Xem chi tiết"}
                </button>

                {selectedId === order.order_id && (
                  <div className="my-order-detail">
                    {loadingDetail ? (
                      <p>Đang tải chi tiết...</p>
                    ) : detail ? (
                      <>
                        <h4>Trạng thái đơn hàng</h4>
                        {renderProgress(detail.status)}

                        <h4>Thông tin giao hàng</h4>

                        <p>
                          <strong>Người nhận:</strong>{" "}
                          {detail.receiver_name}
                        </p>

                        <p>
                          <strong>Số điện thoại:</strong>{" "}
                          {detail.receiver_phone}
                        </p>

                        <p>
                          <strong>Địa chỉ:</strong>{" "}
                          {detail.shipping_address}
                        </p>

                        <p>
                          <strong>Thanh toán:</strong>{" "}
                          {detail.payment_method === "cod"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : detail.payment_method}
                        </p>

                        <h4>Sản phẩm đã mua</h4>

                        <div className="my-order-table-wrap">
                          <table className="my-order-table">
                            <thead>
                              <tr>
                                <th>Sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(detail.items || []).map(
                                (item) => (
                                  <tr key={item.order_detail_id}>
                                    <td>
                                      {item.product_name ||
                                        `Sản phẩm #${item.product_id}`}
                                    </td>

                                    <td>{item.quantity}</td>

                                    <td>
                                      {formatMoney(item.price)}
                                    </td>

                                    <td>
                                      {formatMoney(item.subtotal)}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="my-order-total">
                          Tổng thanh toán:
                          <strong>
                            {formatMoney(detail.total_amount)}
                          </strong>
                        </div>
                      </>
                    ) : (
                      <p>Không thể hiển thị chi tiết đơn hàng.</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyOrders;
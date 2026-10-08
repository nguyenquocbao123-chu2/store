import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
} from "../services/api";

import "./AdminOrders.css";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const NEXT_STATUS = {
  confirmed: ["processing", "cancelled"],
  processing: ["shipping", "cancelled"],
  shipping: ["completed"],
  completed: [],
  cancelled: [],
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function formatDate(value) {
  if (!value) return "—";

  const iso = value.includes("T")
    ? value
    : value.replace(" ", "T") + "Z";

  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("vi-VN");
}

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!localStorage.getItem("token")) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/orders" },
        });
        return;
      }

      try {
        const me = await getMe();

        if (cancelled) return;

        if (me.user?.role !== "owner") {
          setForbidden(true);
          return;
        }

        const data = await getAdminOrders();

        if (!cancelled) {
          setOrders(
            Array.isArray(data.orders) ? data.orders : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải đơn hàng.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function showDetail(orderId) {
    if (selectedId === orderId) {
      setSelectedId(null);
      setDetail(null);
      return;
    }

    setSelectedId(orderId);
    setDetail(null);
    setLoadingDetail(true);
    setError("");

    try {
      const data = await getAdminOrderDetail(orderId);
      setDetail(data.order);
    } catch (err) {
      setError(err.message || "Không thể xem chi tiết đơn.");
      setSelectedId(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function changeStatus(orderId, newStatus) {
    if (busyId !== null) return;

    if (newStatus === "cancelled") {
      const confirmed = window.confirm(
        "Bạn có chắc muốn hủy đơn hàng này? " +
        "Số lượng sản phẩm sẽ được hoàn lại vào kho."
      );

      if (!confirmed) return;
    }

    setError("");
    setMessage("");
    setBusyId(orderId);

    try {
      await updateAdminOrderStatus(orderId, newStatus);

      setOrders((current) =>
        current.map((order) =>
          order.order_id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setDetail((current) =>
        current?.order_id === orderId
          ? { ...current, status: newStatus }
          : current
      );

      setMessage(
        `Đơn hàng #${orderId} đã chuyển sang trạng thái ` +
        `${STATUS_LABELS[newStatus]}.`
      );
    } catch (err) {
      setError(
        err.message || "Không thể cập nhật trạng thái."
      );
    } finally {
      setBusyId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const search = keyword.trim().toLowerCase();

    const matchesKeyword =
      String(order.order_id).includes(search) ||
      String(order.customer_name || "")
        .toLowerCase()
        .includes(search) ||
      String(order.receiver_name || "")
        .toLowerCase()
        .includes(search) ||
      String(order.receiver_phone || "").includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesKeyword && matchesStatus;
  });

  if (loading) {
    return (
      <main className="admin-orders">
        <p>Đang tải danh sách đơn hàng...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="admin-orders">
        <h2>403 - Không có quyền truy cập</h2>
        <p>Chỉ Owner được quản lý đơn hàng.</p>
        <Link to="/">Quay về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="admin-orders">
      <div className="orders-heading">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Theo dõi và xử lý đơn đặt hàng của khách</p>
        </div>

        <Link to="/admin">← Quay lại Dashboard</Link>
      </div>

      {error && (
        <div className="orders-notice error">{error}</div>
      )}

      {message && (
        <div className="orders-notice success">{message}</div>
      )}

      <div className="orders-stats">
        <div>
          <span>Đơn hàng đang hiển thị</span>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <span>Đang xử lý</span>
          <strong>
            {
              orders.filter(
                (order) => order.status === "processing"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Đang giao</span>
          <strong>
            {
              orders.filter(
                (order) => order.status === "shipping"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Hoàn thành</span>
          <strong>
            {
              orders.filter(
                (order) => order.status === "completed"
              ).length
            }
          </strong>
        </div>
      </div>

      <section className="orders-panel">
        <h2>Danh sách đơn hàng</h2>

        <p className="orders-description">
          Hiển thị tối đa 100 đơn hàng mới nhất.
        </p>

        <div className="orders-filters">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm mã đơn, tên hoặc số điện thoại..."
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

        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Người nhận</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>

                  <td>{order.customer_name}</td>

                  <td>{order.receiver_name}</td>

                  <td>{formatMoney(order.total_amount)}</td>

                  <td>{formatDate(order.created_at)}</td>

                  <td>
                    <span
                      className={
                        "order-status " + order.status
                      }
                    >
                      {STATUS_LABELS[order.status] ||
                        order.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="orders-view"
                      onClick={() =>
                        showDetail(order.order_id)
                      }
                    >
                      {selectedId === order.order_id
                        ? "Đóng"
                        : "Chi tiết"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <p>Không tìm thấy đơn hàng phù hợp.</p>
        )}
      </section>

      {selectedId !== null && (
        <section className="orders-panel">
          <h2>Chi tiết đơn hàng #{selectedId}</h2>

          {loadingDetail ? (
            <p>Đang tải chi tiết đơn hàng...</p>
          ) : detail ? (
            <>
              <div className="order-detail-grid">
                <p>
                  <strong>Khách hàng:</strong>{" "}
                  {detail.customer_name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {detail.customer_email}
                </p>

                <p>
                  <strong>Người nhận:</strong>{" "}
                  {detail.receiver_name}
                </p>

                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {detail.receiver_phone}
                </p>

                <p>
                  <strong>Địa chỉ giao:</strong>{" "}
                  {detail.shipping_address}
                </p>

                <p>
                  <strong>Thanh toán:</strong>{" "}
                  {detail.payment_method === "cod"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : detail.payment_method}
                </p>
              </div>

              <h3>Sản phẩm đã đặt</h3>

              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(detail.items || []).map((item) => (
                      <tr key={item.order_detail_id}>
                        <td>
                          {item.product_name ||
                            `Sản phẩm #${item.product_id}`}
                        </td>

                        <td>{item.quantity}</td>

                        <td>{formatMoney(item.price)}</td>

                        <td>{formatMoney(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-detail-total">
                Tổng cộng:
                <strong>
                  {formatMoney(detail.total_amount)}
                </strong>
              </div>

              <div className="order-status-actions">
                <h3>Cập nhật trạng thái</h3>

                {(
                  NEXT_STATUS[detail.status] || []
                ).length === 0 ? (
                  <p>
                    Đơn hàng này không có thao tác chuyển
                    trạng thái tiếp theo.
                  </p>
                ) : (
                  <div className="order-action-buttons">
                    {NEXT_STATUS[detail.status].map(
                      (nextStatus) => (
                        <button
                          key={nextStatus}
                          disabled={busyId !== null}
                          className={
                            nextStatus === "cancelled"
                              ? "order-cancel-button"
                              : "order-update-button"
                          }
                          onClick={() =>
                            changeStatus(
                              detail.order_id,
                              nextStatus
                            )
                          }
                        >
                          {busyId === detail.order_id
                            ? "Đang cập nhật..."
                            : nextStatus === "cancelled"
                              ? "Hủy đơn hàng"
                              : `Chuyển sang ${
                                  STATUS_LABELS[nextStatus]
                                }`}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p>Không có dữ liệu chi tiết đơn hàng.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default AdminOrders;
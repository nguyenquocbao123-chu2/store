
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getSalesReport,
} from "../services/api";

import "./AdminReports.css";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function AdminReports() {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      if (!localStorage.getItem("token")) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/reports" },
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

        const data = await getSalesReport();

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Không thể tải báo cáo."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <main className="sales-report">
        <p>Đang tải báo cáo...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="sales-report">
        <h2>403 - Không có quyền truy cập</h2>
        <p>Chỉ tài khoản Owner được xem báo cáo.</p>
        <Link to="/">Về trang chủ</Link>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="sales-report">
        <h2>Không tải được báo cáo</h2>
        <p>{error || "Dữ liệu không khả dụng."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </main>
    );
  }

  const stats = report.summary || {};
  const monthly = Array.isArray(report.monthly)
    ? report.monthly
    : [];
  const topProducts = Array.isArray(report.top_products)
    ? report.top_products
    : [];

  const maxRevenue = Math.max(
    1,
    ...monthly.map((item) => Number(item.revenue) || 0)
  );

  return (
    <main className="sales-report">
      <div className="report-heading">
        <div>
          <h1>Báo cáo kinh doanh</h1>
          <p>Thống kê đơn hàng và doanh thu UMA.VN</p>
        </div>

        <Link to="/admin">← Quay lại Dashboard</Link>
      </div>

      <div className="report-stats">
        <div className="report-stat">
          <span>Tổng đơn hàng</span>
          <strong>{stats.total_orders || 0}</strong>
        </div>

        <div className="report-stat">
          <span>Đơn hoàn thành</span>
          <strong>{stats.completed_orders || 0}</strong>
        </div>

        <div className="report-stat">
          <span>Đơn đang xử lý</span>
          <strong>{stats.active_orders || 0}</strong>
        </div>

        <div className="report-stat">
          <span>Đơn đã hủy</span>
          <strong>{stats.cancelled_orders || 0}</strong>
        </div>
      </div>

      <section className="report-revenue">
        <p>Tổng doanh thu đơn hàng hoàn thành</p>
        <h2>{formatMoney(stats.completed_revenue)}</h2>
        <small>
          Chỉ tính đơn có trạng thái completed.
        </small>
      </section>

      <section className="report-panel">
        <h2>Doanh thu 6 tháng gần nhất</h2>

        <div className="report-chart">
          {monthly.map((item) => {
            const revenue = Number(item.revenue) || 0;
            const height = (revenue / maxRevenue) * 100;

            return (
              <div
                className="report-chart-item"
                key={item.month}
              >
                <div className="report-bar-value">
                  {formatMoney(revenue)}
                </div>

                <div className="report-bar-area">
                  <div
                    className="report-bar"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <span>
                  {item.month.slice(5)}/
                  {item.month.slice(0, 4)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="report-panel">
        <h2>Top 5 sản phẩm bán chạy</h2>

        {topProducts.length === 0 ? (
          <p>Chưa có sản phẩm trong đơn hoàn thành.</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>

              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.product_id}>
                    <td>{index + 1}</td>
                    <td>{product.product_name}</td>
                    <td>{product.sold_quantity}</td>
                    <td>
                      {formatMoney(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link
        className="report-orders-link"
        to="/admin/orders"
      >
        Xem danh sách đơn hàng →
      </Link>
    </main>
  );
}

export default AdminReports;

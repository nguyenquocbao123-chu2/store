import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMe,
  getProducts,
  getInventoryAlerts,
} from "../services/api";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin" },
        });
        return;
      }

      try {
        // Kiểm tra quyền Owner
        const me = await getMe();

        if (me.user?.role !== "owner") {
          if (!cancelled) setForbidden(true);
          return;
        }

        // Lấy dữ liệu thật từ Backend
        const [productData, alertData] = await Promise.all([
          getProducts(),
          getInventoryAlerts(),
        ]);

        if (!cancelled) {
          setProducts(
            Array.isArray(productData.products)
              ? productData.products
              : []
          );

          setAlerts(
            Array.isArray(alertData.products)
              ? alertData.products
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải Dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum,product) =>
      sum + (Number(product.stock_quantity) || 0),
    0
  );

  const totalAlerts = alerts.length;

  if (loading) {
    return (
      <main className="admin-dashboard">
        <p>Đang tải dữ liệu Dashboard...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="admin-dashboard">
        <h2>403 - Không có quyền truy cập</h2>
        <p>Chỉ tài khoản Owner mới được xem Dashboard.</p>
        <Link to="/">Quay về trang chủ</Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-dashboard">
        <h2>Không tải được Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Tổng quan quản trị</h1>
          <p>Theo dõi sản phẩm và tình trạng tồn kho</p>
        </div>

        <Link to="/admin/products" className="dashboard-action">
          Quản lý sản phẩm
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p>Tổng sản phẩm đang bán</p>
          <h2>{totalProducts}</h2>
        </div>

        <div className="dashboard-stat">
          <p>Tổng số lượng tồn kho</p>
          <h2>{totalStock.toLocaleString("vi-VN")}</h2>
        </div>

        <div className="dashboard-stat warning">
          <p>Sản phẩm cần cảnh báo</p>
          <h2>{totalAlerts}</h2>
        </div>
      </div>

      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <h2>Cảnh báo tồn kho thấp</h2>
          <span>{totalAlerts} sản phẩm</span>
        </div>

        {alerts.length === 0 ? (
          <p>Hiện không có sản phẩm nào dưới ngưỡng cảnh báo.</p>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Tồn kho</th>
                  <th>Ngưỡng cảnh báo</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {alerts.map((product) => {
                  const stock = Number(product.stock_quantity) || 0;

                  return (
                    <tr key={product.product_id}>
                      <td>#{product.product_id}</td>
                      <td>{product.product_name}</td>
                      <td>{product.brand || "—"}</td>
                      <td>{stock}</td>
                      <td>{product.low_stock_threshold}</td>
                      <td>
                        <span
                          className={
                            stock === 0
                              ? "stock-badge out"
                              : "stock-badge low"
                          }
                        >
                          {stock === 0 ? "Hết hàng" : "Sắp hết"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="dashboard-links">
        <Link to="/admin/products">
          Thêm / Sửa / Xóa sản phẩm →
        </Link>

        <Link to="/admin/suppliers">
          Quản lý nhà cung cấp →
        </Link>

        <Link to="/admin/imports">
          Quản lý nhập hàng →
        </Link>

        <Link to="/admin/inventory">
          Quản lý tồn kho →
        </Link>

        <Link to="/admin/orders">
          Quản lý đơn hàng →
        </Link>

        <Link to="/admin/reports">
          Báo cáo doanh thu →
        </Link>

        <Link to="/products">
          Xem cửa hàng →
        </Link>
      </div>
    </main>
  );
}

export default AdminDashboard;
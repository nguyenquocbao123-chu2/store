import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getInventory,
  getInventoryMovements,
  updateInventoryThreshold,
} from "../services/api";

import "./AdminInventory.css";

function AdminInventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [drafts, setDrafts] = useState({});

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function applyProducts(rows) {
    setProducts(rows);

    const values = {};

    rows.forEach((product) => {
      values[product.product_id] =
        String(product.low_stock_threshold);
    });

    setDrafts(values);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!localStorage.getItem("token")) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/inventory" },
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

        const [inventoryData, movementData] =
          await Promise.all([
            getInventory(),
            getInventoryMovements(),
          ]);

        if (cancelled) return;

        applyProducts(inventoryData.products || []);
        setMovements(movementData.movements || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải tồn kho.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function getStockStatus(product) {
    if (product.status === "inactive") {
      return "inactive";
    }

    const stock = Number(product.stock_quantity);
    const threshold = Number(product.low_stock_threshold);

    if (stock === 0) return "out";
    if (stock <= threshold) return "low";

    return "ok";
  }

  const activeProducts = products.filter(
    (p) => p.status !== "inactive"
  );

  const totalStock = activeProducts.reduce(
    (sum, p) => sum + Number(p.stock_quantity || 0),
    0
  );

  const lowStockCount = activeProducts.filter(
    (p) => getStockStatus(p) === "low"
  ).length;

  const outOfStockCount = activeProducts.filter(
    (p) => getStockStatus(p) === "out"
  ).length;

  const filteredProducts = products.filter((product) => {
    const search = keyword.toLowerCase().trim();

    const matchesKeyword =
      product.product_name.toLowerCase().includes(search) ||
      String(product.brand || "")
        .toLowerCase()
        .includes(search) ||
      String(product.product_id).includes(search);

    const matchesFilter =
      filter === "all" ||
      getStockStatus(product) === filter;

    return matchesKeyword && matchesFilter;
  });

  async function saveThreshold(productId) {
    const value = String(drafts[productId] ?? "").trim();

    setError("");
    setMessage("");

    if (!/^\d+$/.test(value)) {
      setError("Ngưỡng cảnh báo phải là số nguyên không âm.");
      return;
    }

    const threshold = Number(value);

    if (
      !Number.isSafeInteger(threshold) ||
      threshold > 1000000
    ) {
      setError("Ngưỡng cảnh báo phải từ 0 đến 1000000.");
      return;
    }

    try {
      setSavingId(productId);

      await updateInventoryThreshold(
        productId,
        threshold
      );

      setMessage("Đã lưu ngưỡng cảnh báo thành công.");

      try {
        const data = await getInventory();
        applyProducts(data.products || []);
      } catch (refreshError) {
        setError(
          "Đã lưu ngưỡng cảnh báo nhưng chưa tải lại được dữ liệu."
        );
      }
    } catch (err) {
      setError(err.message || "Không thể cập nhật.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <main className="admin-inventory">
        <p>Đang tải dữ liệu tồn kho...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="admin-inventory">
        <h2>403 - Không có quyền truy cập</h2>
        <p>Chỉ Owner được quản lý tồn kho.</p>
        <Link to="/">Quay về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="admin-inventory">
      <div className="inventory-heading">
        <div>
          <h1>Quản lý tồn kho</h1>
          <p>Theo dõi số lượng và cảnh báo sản phẩm</p>
        </div>

        <div className="inventory-actions">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/imports" className="inventory-primary">
            + Nhập hàng
          </Link>
        </div>
      </div>

      {error && (
        <p className="inventory-notice error">{error}</p>
      )}

      {message && (
        <p className="inventory-notice success">{message}</p>
      )}

      <div className="inventory-stats">
        <div className="inventory-stat">
          <span>Sản phẩm đang bán</span>
          <strong>{activeProducts.length}</strong>
        </div>

        <div className="inventory-stat">
          <span>Tổng số lượng tồn kho</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="inventory-stat">
          <span>Sắp hết hàng</span>
          <strong>{lowStockCount}</strong>
        </div>

        <div className="inventory-stat">
          <span>Đã hết hàng</span>
          <strong>{outOfStockCount}</strong>
        </div>
      </div>

      <section className="inventory-panel">
        <h2>Danh sách tồn kho</h2>

        <div className="inventory-filters">
          <input
            type="text"
            placeholder="Tìm tên, thương hiệu, mã sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả sản phẩm</option>
            <option value="ok">Còn đủ hàng</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>

        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Tồn kho</th>
                <th>Ngưỡng cảnh báo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product);

                const statusLabel = {
                  ok: "Còn hàng",
                  low: "Sắp hết",
                  out: "Hết hàng",
                  inactive: "Ngừng bán",
                };

                return (
                  <tr key={product.product_id}>
                    <td>#{product.product_id}</td>
                    <td>{product.product_name}</td>
                    <td>{product.brand || "—"}</td>
                    <td>{product.stock_quantity}</td>

                    <td>
                      <input
                        className="inventory-threshold"
                        type="number"
                        min="0"
                        max="1000000"
                        step="1"
                        value={
                          drafts[product.product_id] ?? ""
                        }
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [product.product_id]:
                              e.target.value,
                          }))
                        }
                      />
                    </td>

                    <td>
                      <span className={`inventory-status ${status}`}>
                        {statusLabel[status]}
                      </span>
                    </td>

                    <td>
                      <button
                        className="inventory-save"
                        disabled={savingId !== null}
                        onClick={() =>
                          saveThreshold(product.product_id)
                        }
                      >
                        {savingId === product.product_id
                          ? "Đang lưu..."
                          : "Lưu ngưỡng"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        )}
      </section>

      <section className="inventory-panel">
        <h2>Lịch sử biến động tồn kho</h2>

        <p className="inventory-description">
          Hiển thị tối đa 50 giao dịch nhập hàng và đặt hàng
          gần nhất.
        </p>

        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Loại giao dịch</th>
                <th>Mã chứng từ</th>
                <th>Sản phẩm</th>
                <th>Thay đổi</th>
                <th>Thời gian</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr
                  key={
                    movement.movement_type +
                    "-" +
                    movement.movement_id
                  }
                >
                  <td>
                    {movement.movement_type === "import"
                      ? "Nhập hàng"
                      : "Đặt hàng"}
                  </td>

                  <td>#{movement.reference_id}</td>

                  <td>{movement.product_name}</td>

                  <td
                    className={
                      movement.quantity > 0
                        ? "inventory-positive"
                        : "inventory-negative"
                    }
                  >
                    {movement.quantity > 0 ? "+" : ""}
                    {movement.quantity}
                  </td>

                  <td>{movement.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {movements.length === 0 && (
          <p>Chưa có lịch sử nhập hàng hoặc đặt hàng.</p>
        )}
      </section>
    </main>
  );
}

export default AdminInventory;
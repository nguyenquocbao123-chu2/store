import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getProducts,
  getSuppliers,
  getImports,
  createImport,
} from "../services/api";

import "./AdminImports.css";

const newItem = (id) => ({
  id,
  product_id: "",
  quantity: "1",
  import_price: "",
});

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

function AdminImports() {
  const navigate = useNavigate();
  const nextId = useRef(2);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [imports, setImports] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([newItem(1)]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lastCreated, setLastCreated] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!localStorage.getItem("token")) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/imports" },
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

        const [supplierData, productData, importData] =
          await Promise.all([
            getSuppliers(),
            getProducts(),
            getImports(),
          ]);

        if (cancelled) return;

        setSuppliers(supplierData.suppliers || []);
        setProducts(productData.products || []);
        setImports(importData.imports || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải dữ liệu.");
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

  function updateItem(id, field, value) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function addItem() {
    if (items.length >= 30) {
      setError("Mỗi phiếu nhập tối đa 30 sản phẩm.");
      return;
    }

    setError("");
    setItems((current) => [
      ...current,
      newItem(nextId.current++),
    ]);
  }

  function removeItem(id) {
    setItems((current) =>
      current.length > 1
        ? current.filter((item) => item.id !== id)
        : current
    );
  }

  const totalAmount = items.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.import_price);

    if (
      !Number.isSafeInteger(quantity) ||
      !Number.isSafeInteger(price) ||
      quantity < 1 ||
      price < 0
    ) {
      return sum;
    }

    return sum + quantity * price;
  }, 0);

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    setError("");
    setMessage("");

    const selectedSupplier = Number(supplierId);

    if (
      !Number.isSafeInteger(selectedSupplier) ||
      selectedSupplier <= 0 ||
      !suppliers.some(
        (s) => Number(s.supplier_id) === selectedSupplier
      )
    ) {
      setError("Vui lòng chọn nhà cung cấp hợp lệ.");
      return;
    }

    const selectedIds = new Set();
    const payloadItems = [];

    for (const item of items) {
      const productId = Number(item.product_id);

      if (
        !item.product_id ||
        !products.some(
          (p) => Number(p.product_id) === productId
        )
      ) {
        setError("Vui lòng chọn đầy đủ sản phẩm.");
        return;
      }

      if (selectedIds.has(productId)) {
        setError(
          "Không được chọn trùng sản phẩm trong cùng phiếu nhập."
        );
        return;
      }

      selectedIds.add(productId);

      const quantityText = String(item.quantity).trim();
      const priceText = String(item.import_price).trim();

      if (
        !/^\d+$/.test(quantityText) ||
        !/^\d+$/.test(priceText)
      ) {
        setError("Số lượng và giá nhập phải là số nguyên.");
        return;
      }

      const quantity = Number(quantityText);
      const importPrice = Number(priceText);

      if (
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        !Number.isSafeInteger(importPrice) ||
        importPrice < 0
      ) {
        setError(
          "Số lượng phải lớn hơn 0 và giá nhập không được âm."
        );
        return;
      }

      payloadItems.push({
        product_id: productId,
        quantity,
        import_price: importPrice,
      });
    }

    const calculatedTotal = payloadItems.reduce(
      (sum, item) => sum + item.quantity * item.import_price,
      0
    );

    if (!Number.isSafeInteger(calculatedTotal)) {
      setError("Tổng tiền nhập hàng vượt giới hạn.");
      return;
    }

    if (note.trim().length > 1000) {
      setError("Ghi chú tối đa 1000 ký tự.");
      return;
    }

    try {
      setSaving(true);

      const result = await createImport({
        supplier_id: selectedSupplier,
        note: note.trim(),
        items: payloadItems,
      });

      setLastCreated(result.import || null);

      setMessage(
        `Tạo phiếu nhập #${result.import?.import_id} thành công!`
      );

      setSupplierId("");
      setNote("");
      setItems([newItem(nextId.current++)]);

      // Tải lại dữ liệu sau khi nhập thành công
      try {
        const [productData, importData] = await Promise.all([
          getProducts(),
          getImports(),
        ]);

        setProducts(productData.products || []);
        setImports(importData.imports || []);
      } catch (refreshError) {
        setError(
          "Phiếu nhập đã được lưu nhưng chưa tải lại được danh sách. " +
          "Hãy tải lại trang để xem dữ liệu mới."
        );
      }
    } catch (err) {
      setError(err.message || "Không thể tạo phiếu nhập.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-imports">
        <p>Đang tải dữ liệu nhập hàng...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="admin-imports">
        <h2>403 - Không có quyền truy cập</h2>
        <p>Chỉ Owner được quản lý nhập hàng.</p>
        <Link to="/">Quay về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="admin-imports">
      <div className="imports-heading">
        <div>
          <h1>Quản lý nhập hàng</h1>
          <p>Tạo phiếu nhập và cập nhật tồn kho tự động</p>
        </div>

        <Link to="/admin">← Dashboard</Link>
      </div>

      {error && (
        <div className="imports-notice error">{error}</div>
      )}

      {message && (
        <div className="imports-notice success">{message}</div>
      )}

      <section className="imports-panel">
        <h2>Tạo phiếu nhập mới</h2>

        {suppliers.length === 0 && (
          <p className="imports-warning">
            Chưa có nhà cung cấp. Hãy thêm nhà cung cấp trước.
            {" "}
            <Link to="/admin/suppliers">
              Quản lý nhà cung cấp
            </Link>
          </p>
        )}

        {products.length === 0 && (
          <p className="imports-warning">
            Chưa có sản phẩm để nhập hàng.
            {" "}
            <Link to="/admin/products">
              Quản lý sản phẩm
            </Link>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="imports-field">
            <label>Nhà cung cấp *</label>

            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
            >
              <option value="">-- Chọn nhà cung cấp --</option>

              {suppliers.map((supplier) => (
                <option
                  key={supplier.supplier_id}
                  value={supplier.supplier_id}
                >
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          </div>

          <h3>Danh sách sản phẩm nhập</h3>

          {items.map((item, index) => (
            <div className="import-item" key={item.id}>
              <div className="import-item-title">
                <strong>Sản phẩm {index + 1}</strong>

                {items.length > 1 && (
                  <button
                    type="button"
                    className="imports-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Xóa dòng
                  </button>
                )}
              </div>

              <div className="import-item-fields">
                <div className="imports-field">
                  <label>Sản phẩm *</label>

                  <select
                    value={item.product_id}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "product_id",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      -- Chọn sản phẩm --
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.product_id}
                        value={product.product_id}
                      >
                        {product.product_name}
                        {" "}— Tồn: {product.stock_quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="imports-field">
                  <label>Số lượng nhập *</label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="imports-field">
                  <label>Giá nhập / sản phẩm (VNĐ) *</label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.import_price}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "import_price",
                        e.target.value
                      )
                    }
                    placeholder="Ví dụ: 1000000"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="imports-add-item"
            onClick={addItem}
            disabled={items.length >= 30}
          >
            + Thêm sản phẩm vào phiếu
          </button>

          <div className="imports-field imports-note">
            <label>Ghi chú</label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              maxLength={1000}
              placeholder="Ghi chú về đợt nhập hàng..."
            />
          </div>

          <div className="imports-total">
            <span>Tổng tiền nhập dự kiến:</span>
            <strong>
              {Number.isSafeInteger(totalAmount)
                ? formatMoney(totalAmount)
                : "Giá trị không hợp lệ"}
            </strong>
          </div>

          <button
            type="submit"
            className="imports-submit"
            disabled={
              saving ||
              suppliers.length === 0 ||
              products.length === 0
            }
          >
            {saving ? "Đang tạo phiếu..." : "Xác nhận nhập hàng"}
          </button>
        </form>
      </section>

      {lastCreated && (
        <section className="imports-panel">
          <h2>Phiếu nhập vừa tạo</h2>

          <p>
            Mã phiếu: <strong>#{lastCreated.import_id}</strong>
          </p>

          <p>
            Nhà cung cấp: {lastCreated.supplier_name}
          </p>

          <p>
            Tổng tiền:{" "}
            <strong>
              {formatMoney(lastCreated.total_amount)}
            </strong>
          </p>

          <div className="imports-table-wrap">
            <table className="imports-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá nhập</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>

              <tbody>
                {(lastCreated.items || []).map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.import_price)}</td>
                    <td>{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="imports-panel">
        <div className="imports-list-heading">
          <h2>Lịch sử nhập hàng</h2>
          <span>{imports.length} phiếu nhập</span>
        </div>

        {imports.length === 0 ? (
          <p>Chưa có phiếu nhập nào.</p>
        ) : (
          <div className="imports-table-wrap">
            <table className="imports-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Nhà cung cấp</th>
                  <th>Tổng tiền</th>
                  <th>Ghi chú</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>

              <tbody>
                {imports.map((item) => (
                  <tr key={item.import_id}>
                    <td>#{item.import_id}</td>
                    <td>{item.supplier_name}</td>
                    <td>{formatMoney(item.total_amount)}</td>
                    <td>{item.note || "—"}</td>
                    <td>{item.created_at || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminImports;
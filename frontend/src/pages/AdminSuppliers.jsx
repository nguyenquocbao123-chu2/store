import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getSuppliers,
  createSupplier,
} from "../services/api";

import "./AdminSuppliers.css";

const initialForm = {
  supplier_name: "",
  phone: "",
  email: "",
  address: "",
};

function AdminSuppliers() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSuppliers() {
    const data = await getSuppliers();

    setSuppliers(
      Array.isArray(data.suppliers) ? data.suppliers : []
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/suppliers" },
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

        const data = await getSuppliers();

        if (!cancelled) {
          setSuppliers(
            Array.isArray(data.suppliers) ? data.suppliers : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải nhà cung cấp.");
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

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.supplier_name.trim()) {
      setError("Vui lòng nhập tên nhà cung cấp.");
      return;
    }

    const payload = {
      supplier_name: form.supplier_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    };

    try {
      setSaving(true);

      await createSupplier(payload);

      await loadSuppliers();

      setForm(initialForm);
      setMessage("Thêm nhà cung cấp thành công!");
    } catch (err) {
      setError(err.message || "Không thể thêm nhà cung cấp.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-suppliers">
        <p>Đang tải dữ liệu nhà cung cấp...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="admin-suppliers">
        <h2>403 - Không có quyền truy cập</h2>
        <p>Chỉ tài khoản Owner mới có quyền quản lý nhà cung cấp.</p>
        <Link to="/">Quay về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="admin-suppliers">
      <div className="suppliers-heading">
        <div>
          <h1>Quản lý nhà cung cấp</h1>
          <p>Thêm và theo dõi thông tin nhà cung cấp</p>
        </div>

        <Link to="/admin" className="suppliers-back">
          ← Quay lại Dashboard
        </Link>
      </div>

      {error && (
        <div className="suppliers-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="suppliers-alert success">
          {message}
        </div>
      )}

      <section className="suppliers-panel">
        <h2>Thêm nhà cung cấp</h2>

        <form onSubmit={handleSubmit} className="suppliers-form">
          <div className="suppliers-field">
            <label>Tên nhà cung cấp *</label>
            <input
              type="text"
              name="supplier_name"
              value={form.supplier_name}
              onChange={handleChange}
              placeholder="Ví dụ: Công ty phân phối ABC"
              maxLength={150}
              required
            />
          </div>

          <div className="suppliers-field">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              maxLength={20}
            />
          </div>

          <div className="suppliers-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email"
              maxLength={150}
            />
          </div>

          <div className="suppliers-field">
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              maxLength={255}
            />
          </div>

          <div className="suppliers-form-actions">
            <button
              type="submit"
              className="suppliers-submit"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "+ Thêm nhà cung cấp"}
            </button>
          </div>
        </form>
      </section>

      <section className="suppliers-panel">
        <div className="suppliers-list-heading">
          <h2>Danh sách nhà cung cấp</h2>
          <span>Tổng: {suppliers.length}</span>
        </div>

        {suppliers.length === 0 ? (
          <p>Chưa có nhà cung cấp nào.</p>
        ) : (
          <div className="suppliers-table-wrap">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Mã NCC</th>
                  <th>Tên nhà cung cấp</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Địa chỉ</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td>#{supplier.supplier_id}</td>
                    <td>{supplier.supplier_name}</td>
                    <td>{supplier.phone || "—"}</td>
                    <td>{supplier.email || "—"}</td>
                    <td>{supplier.address || "—"}</td>
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

export default AdminSuppliers;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);

    try {
      await register(
        form.fullName.trim(),
        form.email.trim(),
        form.password,
        form.phone.trim(),
        form.address.trim()
      );

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email: form.email.trim(),
        },
      });
    } catch (err) {
      setError(
        err.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* CỘT GIỚI THIỆU */}
        <aside className="auth-side">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">U</span>
            UMA.VN
          </Link>

          <div className="auth-side-content">
            <span className="auth-side-tag">
              THAM GIA CÙNG UMA.VN
            </span>

            <h2>
              Bắt đầu hành trình
              <br />
              mua sắm công nghệ.
            </h2>

            <p>
              Tạo tài khoản miễn phí để khám phá
              sản phẩm và quản lý đơn hàng.
            </p>

            <div className="auth-feature">
              <span>✓</span>
              Lưu sản phẩm vào giỏ hàng
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Quản lý lịch sử mua sắm
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Đánh giá sản phẩm đã mua
            </div>
          </div>

          <p className="auth-side-footer">
            UMA.VN — Your Technology Store
          </p>
        </aside>

        {/* FORM ĐĂNG KÝ */}
        <div className="auth-content">
          <div className="auth-card auth-register-card">
            <Link to="/" className="auth-back">
              ← Quay về cửa hàng
            </Link>

            <div className="auth-mobile-brand">
              UMA.VN
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">
                TÀI KHOẢN MỚI
              </span>

              <h1>Tạo tài khoản</h1>

              <p>
                Điền thông tin bên dưới để đăng ký
                thành viên UMA.VN.
              </p>
            </div>

            {error && (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-form-grid">
                <div className="auth-field">
                  <label htmlFor="register-name">
                    Họ và tên *
                  </label>

                  <input
                    id="register-name"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="register-phone">
                    Số điện thoại
                  </label>

                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">
                  Địa chỉ email *
                </label>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  maxLength={120}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-address">
                  Địa chỉ giao hàng
                </label>

                <input
                  id="register-address"
                  name="address"
                  type="text"
                  placeholder="Nhập địa chỉ của bạn"
                  value={form.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  maxLength={255}
                />
              </div>

              <div className="auth-form-grid">
                <div className="auth-field">
                  <label htmlFor="register-password">
                    Mật khẩu *
                  </label>

                  <div className="auth-password-wrap">
                    <input
                      id="register-password"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      placeholder="Ít nhất 8 ký tự"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />

                    <button
                      type="button"
                      className="auth-toggle-password"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-confirm">
                    Nhập lại mật khẩu *
                  </label>

                  <input
                    id="register-confirm"
                    name="confirmPassword"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <p className="auth-hint">
                Mật khẩu cần có ít nhất 8 ký tự.
              </p>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Đang tạo tài khoản..."
                  : "Tạo tài khoản →"}
              </button>
            </form>

            <div className="auth-divider">
              <span>Đã có tài khoản?</span>
            </div>

            <Link
              to="/login"
              className="auth-secondary-button"
            >
              Đăng nhập ngay
            </Link>

            <p className="auth-bottom-note">
              Chào mừng bạn đến với UMA.VN
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;

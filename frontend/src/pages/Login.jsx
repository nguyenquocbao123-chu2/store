
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { login, getMe } from "../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await login(email.trim(), password);

      if (!data.token) {
        throw new Error("Không nhận được token đăng nhập.");
      }

      localStorage.setItem("token", data.token);

      // Kiểm tra tài khoản bằng JWT
      const meData = await getMe();

      if (!meData.user) {
        throw new Error("Không thể xác thực tài khoản.");
      }

      localStorage.setItem(
        "user",
        JSON.stringify(meData.user)
      );

      window.dispatchEvent(new Event("auth-change"));

      // Trở lại trang trước hoặc trang phù hợp
      const from = location.state?.from;

      const destination =
        typeof from === "string" &&
        from.startsWith("/") &&
        !from.startsWith("//")
          ? from
          : meData.user.role === "owner"
          ? "/admin"
          : "/";

      navigate(destination, { replace: true });
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(new Event("auth-change"));

      setError(
        err.message || "Đăng nhập thất bại. Vui lòng thử lại."
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
              CỬA HÀNG CÔNG NGHỆ
            </span>

            <h2>
              Công nghệ tốt hơn.
              <br />
              Cuộc sống dễ dàng hơn.
            </h2>

            <p>
              Khám phá điện thoại, laptop và phụ kiện
              công nghệ tại UMA.VN.
            </p>

            <div className="auth-feature">
              <span>✓</span>
              Sản phẩm đa dạng
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Theo dõi đơn hàng dễ dàng
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Mua sắm nhanh chóng
            </div>
          </div>

          <p className="auth-side-footer">
            UMA.VN — Your Technology Store
          </p>
        </aside>

        {/* FORM ĐĂNG NHẬP */}
        <div className="auth-content">
          <div className="auth-card">
            <Link to="/" className="auth-back">
              ← Quay về cửa hàng
            </Link>

            <div className="auth-mobile-brand">
              UMA.VN
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">
                CHÀO MỪNG TRỞ LẠI
              </span>

              <h1>Đăng nhập</h1>

              <p>
                Đăng nhập để tiếp tục trải nghiệm
                mua sắm tại UMA.VN.
              </p>
            </div>

            {location.state?.registered && (
              <div
                className="auth-alert auth-alert-success"
                role="status"
              >
                Đăng ký thành công! Hãy đăng nhập
                bằng tài khoản vừa tạo.
              </div>
            )}

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
              <div className="auth-field">
                <label htmlFor="login-email">
                  Địa chỉ email
                </label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">
                  Mật khẩu
                </label>

                <div className="auth-password-wrap">
                  <input
                    id="login-password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Đang đăng nhập..."
                  : "Đăng nhập →"}
              </button>
            </form>

            <div className="auth-divider">
              <span>Chưa có tài khoản?</span>
            </div>

            <Link
              to="/register"
              className="auth-secondary-button"
            >
              Tạo tài khoản mới
            </Link>

            <p className="auth-bottom-note">
              Mua sắm tiện lợi cùng UMA.VN
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;

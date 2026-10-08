import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getMe,
  getCart,
  updateCartItem,
  removeCartItem,
  checkoutCart,
} from "../services/api";

import "./Cart.css";

const emptyCart = {
  items: [],
  total_quantity: 0,
  total_amount: 0,
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_phone: "",
    shipping_address: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!localStorage.getItem("token")) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const me = await getMe();

        if (cancelled) return;

        if (me.user?.role !== "customer") {
          setForbidden(true);
          return;
        }

        setForm({
          receiver_name: me.user.full_name || "",
          receiver_phone: me.user.phone || "",
          shipping_address: me.user.address || "",
        });

        const data = await getCart();

        if (!cancelled) {
          setCart(data.cart || emptyCart);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Không thể tải giỏ hàng.");
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

  async function refreshCart() {
    const data = await getCart();
    setCart(data.cart || emptyCart);

    window.dispatchEvent(new Event("cart-updated"));
  }

  async function changeQuantity(item, newQuantity) {
    if (busy || newQuantity < 1) return;

    setBusy(true);
    setError("");

    try {
      await updateCartItem(
        item.cart_item_id,
        newQuantity
      );

      await refreshCart();
    } catch (err) {
      setError(err.message || "Không thể sửa số lượng.");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(itemId) {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await removeCartItem(itemId);
      await refreshCart();
    } catch (err) {
      setError(err.message || "Không thể xóa sản phẩm.");
    } finally {
      setBusy(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCheckout(event) {
    event.preventDefault();

    if (busy || cart.items.length === 0) return;

    setBusy(true);
    setError("");

    try {
      const data = await checkoutCart({
        receiver_name: form.receiver_name.trim(),
        receiver_phone: form.receiver_phone.trim(),
        shipping_address: form.shipping_address.trim(),
        payment_method: "cod",
      });

      setSuccess(data.order);
      setCart(emptyCart);
      setCheckoutOpen(false);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      setError(err.message || "Đặt hàng thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const unavailableItems = cart.items.filter(
    (item) =>
      item.status !== "active" ||
      Number(item.stock_quantity) < Number(item.quantity)
  );

  if (loading) {
    return (
      <main className="cart-page">
        <p>Đang tải giỏ hàng...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="cart-page">
        <h2>Không có quyền truy cập</h2>
        <p>Giỏ hàng dành cho tài khoản khách hàng.</p>
        <Link to="/">Về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <h1>Giỏ hàng của tôi</h1>
          <p>Kiểm tra sản phẩm trước khi đặt hàng</p>
        </div>

        <Link to="/products">← Tiếp tục mua sắm</Link>
      </div>

      {error && (
        <div className="cart-notice cart-error">
          {error}
        </div>
      )}

      {success && (
        <div className="cart-success">
          <h2>Đặt hàng thành công!</h2>

          <p>
            Mã đơn hàng:{" "}
            <strong>#{success.order_id}</strong>
          </p>

          <p>
            Tổng thanh toán:{" "}
            <strong>
              {formatMoney(success.total_amount)}
            </strong>
          </p>

          <p>Phương thức thanh toán: COD</p>

          <Link to="/my-orders">
            Xem đơn hàng của tôi →
          </Link>
        </div>
      )}

      {cart.items.length === 0 ? (
        <section className="cart-empty">
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy chọn sản phẩm bạn muốn mua.</p>

          <Link to="/products">
            Khám phá sản phẩm
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-panel">
            <h2>
              Sản phẩm trong giỏ ({cart.total_quantity})
            </h2>

            {cart.items.map((item) => {
              const unavailable =
                item.status !== "active" ||
                item.stock_quantity < item.quantity;

              return (
                <div
                  className="cart-item"
                  key={item.cart_item_id}
                >
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.product_name}
                      />
                    ) : (
                      <span>Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <Link
                      to={`/products/${item.product_id}`}
                    >
                      <h3>{item.product_name}</h3>
                    </Link>

                    <p>Thương hiệu: {item.brand || "—"}</p>

                    <p className="cart-item-price">
                      {formatMoney(item.price)}
                    </p>

                    <p>
                      Tồn kho: {item.stock_quantity}
                    </p>

                    {unavailable && (
                      <p className="cart-item-warning">
                        Sản phẩm không còn đủ hàng hoặc
                        đã ngừng bán.
                      </p>
                    )}

                    <div className="cart-item-actions">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          disabled={busy || item.quantity <= 1}
                          onClick={() =>
                            changeQuantity(
                              item,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          disabled={
                            busy ||
                            item.quantity >= item.stock_quantity ||
                            item.quantity >= 1000 ||
                            item.status !== "active"
                          }
                          onClick={() =>
                            changeQuantity(
                              item,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        disabled={busy}
                        onClick={() =>
                          removeItem(item.cart_item_id)
                        }
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <strong className="cart-subtotal">
                    {formatMoney(item.subtotal)}
                  </strong>
                </div>
              );
            })}
          </section>

          <aside className="cart-summary">
            <h2>Thông tin đơn hàng</h2>

            <div className="cart-summary-row">
              <span>Tổng số lượng</span>
              <strong>{cart.total_quantity}</strong>
            </div>

            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <strong>
                {formatMoney(cart.total_amount)}
              </strong>
            </div>

            <div className="cart-summary-total">
              <span>Tổng tiền dự kiến</span>
              <strong>
                {formatMoney(cart.total_amount)}
              </strong>
            </div>

            <p className="cart-summary-note">
              Giá và tồn kho sẽ được Backend kiểm tra
              lại khi xác nhận đặt hàng.
            </p>

            {unavailableItems.length > 0 && (
              <p className="cart-item-warning">
                Vui lòng điều chỉnh các sản phẩm không
                còn đủ hàng trước khi đặt.
              </p>
            )}

            {!checkoutOpen ? (
              <button
                className="cart-checkout-button"
                disabled={
                  busy || unavailableItems.length > 0
                }
                onClick={() => setCheckoutOpen(true)}
              >
                Tiến hành đặt hàng
              </button>
            ) : (
              <form
                className="cart-checkout-form"
                onSubmit={handleCheckout}
              >
                <h3>Thông tin giao hàng</h3>

                <label>
                  Họ tên người nhận
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.receiver_name}
                    onChange={(e) =>
                      updateForm(
                        "receiver_name",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Số điện thoại
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    value={form.receiver_phone}
                    onChange={(e) =>
                      updateForm(
                        "receiver_phone",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Địa chỉ giao hàng
                  <textarea
                    required
                    maxLength={255}
                    rows={3}
                    value={form.shipping_address}
                    onChange={(e) =>
                      updateForm(
                        "shipping_address",
                        e.target.value
                      )
                    }
                  />
                </label>

                <p>
                  <strong>Thanh toán:</strong>{" "}
                  COD — Thanh toán khi nhận hàng
                </p>

                <button
                  type="submit"
                  className="cart-checkout-button"
                  disabled={busy}
                >
                  {busy
                    ? "Đang xử lý đơn hàng..."
                    : "Xác nhận đặt hàng"}
                </button>

                <button
                  type="button"
                  className="cart-back-button"
                  disabled={busy}
                  onClick={() => setCheckoutOpen(false)}
                >
                  Quay lại giỏ hàng
                </button>
              </form>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
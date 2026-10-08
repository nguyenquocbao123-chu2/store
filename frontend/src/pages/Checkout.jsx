import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    createOrder,
    getMe,
    getProductById
} from "../services/api";

import "./Checkout.css";


function Checkout() {

    const { id } = useParams();

    const navigate =
        useNavigate();


    const [product, setProduct] =
        useState(null);

    const [receiverName, setReceiverName] =
        useState("");

    const [receiverPhone, setReceiverPhone] =
        useState("");

    const [shippingAddress, setShippingAddress] =
        useState("");

    const [quantity, setQuantity] =
        useState(1);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD CHECKOUT
    // =========================

    useEffect(() => {

        initializeCheckout();

    }, [id]);


    async function initializeCheckout() {

        const token =
            localStorage.getItem("token");


        // Chưa đăng nhập
        if (!token) {

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        from:
                            `/checkout/${id}`
                    }
                }
            );

            return;

        }


        try {

            setLoading(true);
            setError("");


            // Kiểm tra JWT và lấy user thật
            const meData =
                await getMe();


            // Backend chỉ cho customer đặt hàng
            if (
                meData.user.role !==
                "customer"
            ) {

                setError(
                    "Chức năng mua hàng chỉ dành cho tài khoản khách hàng."
                );

                return;

            }


            // Lấy sản phẩm
            const productData =
                await getProductById(id);


            setProduct(
                productData.product
            );


            // Điền sẵn thông tin tài khoản
            setReceiverName(
                meData.user.full_name || ""
            );

            setReceiverPhone(
                meData.user.phone || ""
            );

            setShippingAddress(
                meData.user.address || ""
            );


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    }


    // =========================
    // SUBMIT ORDER
    // =========================

    async function handleSubmit(event) {

        event.preventDefault();


        if (!product) {
            return;
        }


        const orderQuantity =
            Number(quantity);


        if (
            !Number.isInteger(
                orderQuantity
            ) ||
            orderQuantity < 1
        ) {

            setError(
                "Số lượng sản phẩm không hợp lệ."
            );

            return;

        }


        if (
            orderQuantity >
            Number(
                product.stock_quantity
            )
        ) {

            setError(
                "Số lượng đặt mua vượt quá tồn kho."
            );

            return;

        }


        try {

            setSubmitting(true);
            setError("");


            const data =
                await createOrder({

                    receiver_name:
                        receiverName,

                    receiver_phone:
                        receiverPhone,

                    shipping_address:
                        shippingAddress,

                    payment_method:
                        "cod",

                    items: [
                        {
                            product_id:
                                Number(
                                    product.product_id
                                ),

                            quantity:
                                orderQuantity
                        }
                    ]

                });


            // Thành công → trang kết quả
            navigate(
                "/order-success",
                {
                    replace: true,

                    state: {

                        message:
                            data.message,

                        productName:
                            product.product_name,

                        quantity:
                            orderQuantity,

                        total:
                            Number(
                                product.price
                            ) *
                            orderQuantity

                    }

                }
            );


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setSubmitting(false);

        }

    }


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="checkout-status">
                Đang tải thông tin thanh toán...
            </div>
        );

    }


    if (
        error &&
        !product
    ) {

        return (
            <div className="checkout-status">

                <h2>
                    Không thể thanh toán
                </h2>

                <p>
                    {error}
                </p>

                <Link to="/products">
                    Quay lại sản phẩm
                </Link>

            </div>
        );

    }


    if (!product) {

        return (
            <div className="checkout-status">
                Không tìm thấy sản phẩm.
            </div>
        );

    }


    const total =
        Number(product.price) *
        Number(quantity || 0);


    return (
        <div className="checkout-page">

            <div className="checkout-heading">

                <Link
                    to={
                        `/products/${product.product_id}`
                    }
                >
                    ← Quay lại sản phẩm
                </Link>

                <h1>
                    Thanh toán
                </h1>

                <p>
                    Kiểm tra thông tin trước
                    khi đặt hàng.
                </p>

            </div>


            <div className="checkout-layout">

                {/* =====================
                    FORM
                ====================== */}

                <section className="checkout-form-box">

                    <h2>
                        Thông tin nhận hàng
                    </h2>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="checkout-field">

                            <label>
                                Họ tên người nhận
                            </label>

                            <input
                                type="text"
                                value={
                                    receiverName
                                }
                                onChange={
                                    event =>
                                        setReceiverName(
                                            event.target.value
                                        )
                                }
                                required
                            />

                        </div>


                        <div className="checkout-field">

                            <label>
                                Số điện thoại
                            </label>

                            <input
                                type="tel"
                                value={
                                    receiverPhone
                                }
                                onChange={
                                    event =>
                                        setReceiverPhone(
                                            event.target.value
                                        )
                                }
                                required
                            />

                        </div>


                        <div className="checkout-field">

                            <label>
                                Địa chỉ nhận hàng
                            </label>

                            <textarea
                                value={
                                    shippingAddress
                                }
                                onChange={
                                    event =>
                                        setShippingAddress(
                                            event.target.value
                                        )
                                }
                                rows="4"
                                required
                            />

                        </div>


                        <div className="checkout-field">

                            <label>
                                Số lượng
                            </label>

                            <input
                                type="number"
                                min="1"
                                max={
                                    product.stock_quantity
                                }
                                value={
                                    quantity
                                }
                                onChange={
                                    event =>
                                        setQuantity(
                                            event.target.value
                                        )
                                }
                                required
                            />

                            <small>
                                Hiện có{" "}
                                {
                                    product.stock_quantity
                                }{" "}
                                sản phẩm
                            </small>

                        </div>


                        <div className="payment-method">

                            <h3>
                                Phương thức thanh toán
                            </h3>

                            <label>

                                <input
                                    type="radio"
                                    checked
                                    readOnly
                                />

                                Thanh toán khi nhận hàng
                                (COD)

                            </label>

                        </div>


                        {
                            error && (

                                <div className="checkout-error">
                                    {error}
                                </div>

                            )
                        }


                        <button
                            type="submit"
                            className="place-order-button"
                            disabled={
                                submitting ||
                                product.stock_quantity <= 0
                            }
                        >

                            {
                                submitting
                                    ? "Đang đặt hàng..."
                                    : "Đặt hàng"
                            }

                        </button>

                    </form>

                </section>


                {/* =====================
                    ORDER SUMMARY
                ====================== */}

                <aside className="order-summary">

                    <h2>
                        Đơn hàng
                    </h2>


                    <div className="summary-product">

                        <div className="summary-image">

                            {
                                product.image ? (

                                    <img
                                        src={
                                            product.image
                                        }
                                        alt={
                                            product.product_name
                                        }
                                    />

                                ) : (

                                    <span>
                                        UMA
                                    </span>

                                )
                            }

                        </div>


                        <div>

                            <h3>
                                {
                                    product.product_name
                                }
                            </h3>

                            <p>
                                {
                                    product.brand
                                }
                            </p>

                        </div>

                    </div>


                    <div className="summary-row">

                        <span>
                            Đơn giá
                        </span>

                        <strong>

                            {
                                Number(
                                    product.price
                                ).toLocaleString(
                                    "vi-VN"
                                )
                            }

                            {" "}VNĐ

                        </strong>

                    </div>


                    <div className="summary-row">

                        <span>
                            Số lượng
                        </span>

                        <strong>
                            {quantity || 0}
                        </strong>

                    </div>


                    <div className="summary-row">

                        <span>
                            Phí vận chuyển
                        </span>

                        <strong>
                            Chưa tính
                        </strong>

                    </div>


                    <div className="summary-total">

                        <span>
                            Tổng tiền sản phẩm
                        </span>

                        <strong>

                            {
                                total.toLocaleString(
                                    "vi-VN"
                                )
                            }

                            {" "}VNĐ

                        </strong>

                    </div>

                </aside>

            </div>

        </div>
    );

}


export default Checkout;
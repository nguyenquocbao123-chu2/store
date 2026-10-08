import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams,
    useNavigate
} from "react-router-dom";

import {
    getProductById,
    getProducts,
    addToCart
} from "../services/api";

import ProductCard
    from "../components/ProductCard";

import ProductReviews from "../components/ProductReviews";

import "./ProductDetail.css";


function ProductDetail() {

    const { id } = useParams();
    const navigate =
        useNavigate();


    const [product, setProduct] =
        useState(null);

    const [relatedProducts, setRelatedProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [quantity, setQuantity] =
        useState(1);

    const [adding, setAdding] =
        useState(false);

    const [cartError, setCartError] =
        useState("");


    // =========================
    // LOAD PRODUCT
    // =========================

    useEffect(() => {

        loadProduct();

    }, [id]);


    async function loadProduct() {

        try {

            setLoading(true);
            setError("");


            const [
                productData,
                allProductsData
            ] = await Promise.all([

                getProductById(id),

                getProducts()

            ]);


            const currentProduct =
                productData.product;


            setProduct(
                currentProduct
            );


            // Loại sản phẩm hiện tại
            // và lấy tối đa 3 sản phẩm khác
            const otherProducts =
                (
                    allProductsData.products ||
                    []
                )
                    .filter(
                        item =>
                            Number(
                                item.product_id
                            ) !== Number(id)
                    )
                    .slice(0, 3);


            setRelatedProducts(
                otherProducts
            );


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    }

    function handleBuyNow() {

        const token =
            localStorage.getItem("token");

        const storedUser =
            localStorage.getItem("user");

        // Chưa đăng nhập
        if (
            !token ||
            !storedUser
        ) {

            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/checkout/${product.product_id}`
                    }
                }
            );

            return;

        }

        try {

            const user =
                JSON.parse(
                    storedUser
                );

            if (
                user.role !==
                "customer"
            ) {

                alert(
                    "Chức năng mua hàng chỉ dành cho tài khoản khách hàng."
                );

                return;

            }

            navigate(
                `/checkout/${product.product_id}`
            );

        } catch {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/checkout/${product.product_id}`
                    }
                }
            );

        }

    }

    async function handleAddToCart() {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        if (
            !Number.isSafeInteger(quantity) ||
            quantity < 1 ||
            quantity > Number(product.stock_quantity)
        ) {
            setCartError("Số lượng không hợp lệ.");
            return;
        }

        try {
            setAdding(true);
            setCartError("");

            await addToCart(
                Number(product.product_id),
                quantity
            );

            window.dispatchEvent(
                new Event("cart-updated")
            );

            navigate("/cart");
        } catch (err) {
            setCartError(
                err.message || "Không thể thêm vào giỏ hàng."
            );
        } finally {
            setAdding(false);
        }
    }


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="detail-status">

                Đang tải sản phẩm...

            </div>
        );

    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="detail-status">

                <h2>
                    Không thể tải sản phẩm
                </h2>

                <p>
                    {error}
                </p>

                <Link to="/products">
                    ← Quay lại danh sách sản phẩm
                </Link>

            </div>
        );

    }


    if (!product) {

        return (
            <div className="detail-status">

                Không tìm thấy sản phẩm.

            </div>
        );

    }


    const outOfStock =
        Number(
            product.stock_quantity
        ) <= 0;


    return (
        <div className="product-detail-page">

            {/* =========================
                BREADCRUMB
            ========================= */}

            <div className="detail-breadcrumb">

                <Link to="/">
                    Trang chủ
                </Link>

                <span>
                    /
                </span>

                <Link to="/products">
                    Sản phẩm
                </Link>

                <span>
                    /
                </span>

                <span>
                    {product.product_name}
                </span>

            </div>


            {/* =========================
                MAIN DETAIL
            ========================= */}

            <section className="detail-main">

                {/* IMAGE */}

                <div className="detail-image-box">

                    {
                        product.image ? (

                            <img
                                src={product.image}
                                alt={
                                    product.product_name
                                }
                            />

                        ) : (

                            <div className="detail-no-image">

                                <div className="image-placeholder-icon">
                                    UMA
                                </div>

                                <p>
                                    Sản phẩm chưa có hình ảnh
                                </p>

                            </div>

                        )
                    }

                </div>


                {/* INFORMATION */}

                <div className="detail-information">

                    <p className="detail-category">

                        {
                            product.category_name ||
                            "Sản phẩm"
                        }

                    </p>


                    <h1>
                        {product.product_name}
                    </h1>


                    <div className="detail-meta">

                        <span>
                            Thương hiệu:
                            {" "}
                            <strong>
                                {
                                    product.brand ||
                                    "Chưa cập nhật"
                                }
                            </strong>
                        </span>

                        <span className="meta-divider">
                            |
                        </span>

                        <span>
                            Mã SP:
                            {" "}
                            #{product.product_id}
                        </span>

                    </div>


                    {/* REVIEW */}

                    <div className="detail-rating">

                        <span className="rating-star">
                            ★
                        </span>

                        <span>
                            Đánh giá chưa được hỗ trợ
                        </span>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="detail-description">

                        <h3>
                            Mô tả
                        </h3>

                        <p>
                            {
                                product.description ||
                                "Sản phẩm chưa có mô tả."
                            }
                        </p>

                    </div>


                    {/* PRICE */}

                    <div className="detail-price">

                        {
                            Number(
                                product.price
                            ).toLocaleString(
                                "vi-VN"
                            )
                        }

                        {" "}VNĐ

                    </div>


                    {/* STOCK */}

                    <div
                        className={
                            outOfStock
                                ? "stock-status out-of-stock"
                                : "stock-status"
                        }
                    >

                        {
                            outOfStock
                                ? "Hết hàng"
                                : `Còn ${product.stock_quantity} sản phẩm`
                        }

                    </div>

                    {product.status === "active" &&
                        Number(product.stock_quantity) > 0 && (
                            <div style={{ margin: "20px 0" }}>
                                <label>
                                    Số lượng:{" "}
                                    <input
                                        type="number"
                                        min="1"
                                        max={Math.min(
                                            Number(product.stock_quantity),
                                            1000
                                        )}
                                        value={quantity}
                                        onChange={(event) =>
                                            setQuantity(Number(event.target.value))
                                        }
                                        style={{
                                            width: "75px",
                                            padding: "9px",
                                            marginRight: "15px",
                                        }}
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                    style={{
                                        background: "#16803c",
                                        color: "white",
                                        padding: "12px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {adding
                                        ? "Đang thêm..."
                                        : "Thêm vào giỏ hàng"}
                                </button>

                                {cartError && (
                                    <p style={{ color: "#dc2626" }}>
                                        {cartError}
                                    </p>
                                )}
                            </div>
                        )}


                    {/* BUTTON */}

                    <div className="detail-actions">
                        <button
                            type="button"
                            className="buy-now-button"
                            disabled={
                                outOfStock
                            }
                            onClick={
                                handleBuyNow
                            }
                        >
                            Mua ngay
                        </button>

                    </div>

                </div>

            </section>

            <ProductReviews productId={product.product_id} />

            {/* =========================
                SPECIFICATIONS
            ========================= */}

            <section className="detail-section">

                <div className="detail-section-title">

                    <p>
                        THÔNG TIN
                    </p>

                    <h2>
                        Thông số kỹ thuật
                    </h2>

                </div>


                <div className="specification-box">

                    <div className="spec-row">

                        <span>
                            Tên sản phẩm
                        </span>

                        <strong>
                            {product.product_name}
                        </strong>

                    </div>


                    <div className="spec-row">

                        <span>
                            Thương hiệu
                        </span>

                        <strong>
                            {
                                product.brand ||
                                "Chưa cập nhật"
                            }
                        </strong>

                    </div>


                    <div className="spec-row">

                        <span>
                            Danh mục
                        </span>

                        <strong>
                            {
                                product.category_name ||
                                "Chưa cập nhật"
                            }
                        </strong>

                    </div>


                    <div className="spec-row">

                        <span>
                            Thông số
                        </span>

                        <strong>
                            {
                                product.specifications ||
                                "Chưa cập nhật"
                            }
                        </strong>

                    </div>


                    <div className="spec-row">

                        <span>
                            Trạng thái
                        </span>

                        <strong>
                            {
                                product.status === "active"
                                    ? "Đang kinh doanh"
                                    : "Ngừng kinh doanh"
                            }
                        </strong>

                    </div>


                    <div className="spec-row">

                        <span>
                            Số lượng tồn
                        </span>

                        <strong>
                            {
                                product.stock_quantity
                            }
                        </strong>

                    </div>

                </div>

            </section>


            {/* =========================
                RELATED PRODUCTS
            ========================= */}

            {
                relatedProducts.length > 0 && (

                    <section className="detail-section">

                        <div className="related-heading">

                            <div>

                                <p>
                                    KHÁM PHÁ THÊM
                                </p>

                                <h2>
                                    Các sản phẩm khác
                                </h2>

                            </div>


                            <Link to="/products">
                                Xem tất cả →
                            </Link>

                        </div>


                        <div className="related-grid">

                            {
                                relatedProducts.map(
                                    item => (

                                        <ProductCard
                                            key={
                                                item.product_id
                                            }
                                            product={
                                                item
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    </section>

                )
            }

        </div>
    );

}


export default ProductDetail;
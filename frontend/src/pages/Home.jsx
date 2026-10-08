import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    getProducts
} from "../services/api";

import ProductCard from "../components/ProductCard";

import "./Home.css";


function Home() {

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadProducts();

    }, []);


    async function loadProducts() {

        try {

            setLoading(true);

            setError("");

            const data =
                await getProducts();

            setProducts(
                data.products || []
            );

        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    }


    // Backend hiện đang ORDER BY product_id DESC
    // nên lấy 3 sản phẩm đầu làm sản phẩm mới.
    const newProducts =
        products.slice(0, 3);


    return (
        <div className="home">

            {/* =========================
                HERO BANNER
            ========================= */}

            <section className="hero">

                <div className="hero-main">

                    <div className="hero-content">

                        <p className="hero-label">
                            UMA.VN
                        </p>

                        <h1>
                            Công nghệ cho
                            <br />
                            mọi nhu cầu
                        </h1>

                        <p>
                            Khám phá điện thoại,
                            laptop và phụ kiện
                            tại UMA.VN.
                        </p>

                        <Link
                            to="/products"
                            className="hero-button"
                        >
                            Xem sản phẩm
                        </Link>

                    </div>


                    <div className="hero-decoration">

                        <div className="hero-circle">
                            UMA
                        </div>

                    </div>

                </div>


                <div className="hero-side">

                    <div className="side-banner">

                        <p>
                            LAPTOP
                        </p>

                        <h2>
                            Làm việc
                            <br />
                            & Gaming
                        </h2>

                        <Link
                            to="/products?category_id=2"
                        >
                            Khám phá →
                        </Link>

                    </div>


                    <div className="side-banner">

                        <p>
                            PHỤ KIỆN
                        </p>

                        <h2>
                            Hoàn thiện
                            <br />
                            góc máy
                        </h2>

                        <Link
                            to="/products?category_id=3"
                        >
                            Khám phá →
                        </Link>

                    </div>

                </div>

            </section>


            {/* =========================
                SẢN PHẨM MỚI
            ========================= */}

            <section className="home-section">

                <div className="section-heading">

                    <div>

                        <p className="section-label">
                            SẢN PHẨM
                        </p>

                        <h2>
                            Sản phẩm mới
                        </h2>

                    </div>


                    <Link
                        to="/products"
                        className="view-all"
                    >
                        Xem tất cả →
                    </Link>

                </div>


                {
                    loading && (

                        <p className="home-message">
                            Đang tải sản phẩm...
                        </p>

                    )
                }


                {
                    error && (

                        <p className="home-error">
                            {error}
                        </p>

                    )
                }


                {
                    !loading &&
                    !error &&
                    newProducts.length === 0 && (

                        <p className="home-message">
                            Hiện chưa có sản phẩm.
                        </p>

                    )
                }


                {
                    !loading &&
                    !error && (

                        <div className="product-grid">

                            {
                                newProducts.map(
                                    (product) => (

                                        <ProductCard
                                            key={
                                                product.product_id
                                            }
                                            product={
                                                product
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    )
                }

            </section>


            {/* =========================
                POPULAR PLACEHOLDER
            ========================= */}

            <section className="home-section">

                <div className="section-heading">

                    <div>

                        <p className="section-label">
                            GỢI Ý
                        </p>

                        <h2>
                            Sản phẩm được ưa chuộng
                        </h2>

                    </div>

                </div>


                <div className="popular-placeholder">

                    <h3>
                        Dữ liệu đang được cập nhật
                    </h3>

                    <p>
                        Hệ thống hiện chưa có dữ liệu
                        lượt mua hoặc mức độ phổ biến
                        để xác định sản phẩm được
                        ưa chuộng nhất.
                    </p>

                    <Link
                        to="/products"
                    >
                        Khám phá tất cả sản phẩm →
                    </Link>

                </div>

            </section>

        </div>
    );

}


export default Home;
import {
    useEffect,
    useState
} from "react";

import {
    useSearchParams
} from "react-router-dom";

import {
    getProducts
} from "../services/api";

import ProductCard
    from "../components/ProductCard";

import "./Products.css";


function Products() {

    const [searchParams, setSearchParams] =
        useSearchParams();


    // =========================
    // FILTER TỪ URL
    // =========================

    const keyword =
        searchParams.get("keyword") || "";

    const categoryId =
        searchParams.get("category_id") || "";

    const brand =
        searchParams.get("brand") || "";

    const minPrice =
        searchParams.get("min_price") || "";

    const maxPrice =
        searchParams.get("max_price") || "";

    const sort =
        searchParams.get("sort") || "newest";


    // =========================
    // STATE
    // =========================

    const [products, setProducts] =
        useState([]);

    const [brands, setBrands] =
        useState([]);

    const [priceFrom, setPriceFrom] =
        useState(minPrice);

    const [priceTo, setPriceTo] =
        useState(maxPrice);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // Khi URL thay đổi thì đồng bộ input giá
    useEffect(() => {

        setPriceFrom(minPrice);
        setPriceTo(maxPrice);

    }, [minPrice, maxPrice]);


    // =========================
    // LOAD PRODUCT
    // =========================

    useEffect(() => {

        loadProducts();

    }, [
        keyword,
        categoryId,
        brand,
        minPrice,
        maxPrice
    ]);


    async function loadProducts() {

        try {

            setLoading(true);
            setError("");


            // Một request lấy sản phẩm đã lọc
            // Một request lấy toàn bộ để tạo danh sách brand
            const [
                filteredData,
                allData
            ] = await Promise.all([

                getProducts({
                    keyword: keyword,
                    category_id: categoryId,
                    brand: brand,
                    min_price: minPrice,
                    max_price: maxPrice
                }),

                getProducts()

            ]);


            setProducts(
                filteredData.products || []
            );


            const allProducts =
                allData.products || [];


            const uniqueBrands = [
                ...new Set(
                    allProducts
                        .map(
                            product =>
                                product.brand
                        )
                        .filter(Boolean)
                )
            ];


            setBrands(
                uniqueBrands
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
    // THAY ĐỔI FILTER
    // =========================

    function updateFilter(
        name,
        value
    ) {

        const params =
            new URLSearchParams(
                searchParams
            );


        if (value) {

            params.set(
                name,
                value
            );

        } else {

            params.delete(
                name
            );

        }


        setSearchParams(
            params
        );

    }


    // =========================
    // LỌC THEO GIÁ
    // =========================

    function handlePriceFilter(event) {

        event.preventDefault();


        const params =
            new URLSearchParams(
                searchParams
            );


        if (priceFrom) {

            params.set(
                "min_price",
                priceFrom
            );

        } else {

            params.delete(
                "min_price"
            );

        }


        if (priceTo) {

            params.set(
                "max_price",
                priceTo
            );

        } else {

            params.delete(
                "max_price"
            );

        }


        setSearchParams(
            params
        );

    }


    // =========================
    // XÓA BỘ LỌC
    // =========================

    function clearFilters() {

        setPriceFrom("");
        setPriceTo("");

        setSearchParams({});

    }


    // =========================
    // SORT FRONTEND
    // =========================

    const sortedProducts =
        [...products].sort(
            (a, b) => {

                if (
                    sort === "price-asc"
                ) {

                    return (
                        Number(a.price) -
                        Number(b.price)
                    );

                }


                if (
                    sort === "price-desc"
                ) {

                    return (
                        Number(b.price) -
                        Number(a.price)
                    );

                }


                // Mới nhất:
                // product_id lớn hơn trước
                return (
                    Number(b.product_id) -
                    Number(a.product_id)
                );

            }
        );


    return (
        <div className="products-page">

            {/* =====================
                SIDEBAR
            ====================== */}

            <aside className="filter-sidebar">

                <div className="filter-title">

                    <h2>
                        Bộ lọc
                    </h2>

                    <button
                        type="button"
                        className="clear-filter"
                        onClick={
                            clearFilters
                        }
                    >
                        Xóa bộ lọc
                    </button>

                </div>


                {/* THƯƠNG HIỆU */}

                <div className="filter-group">

                    <h3>
                        Thương hiệu
                    </h3>


                    <label
                        className="filter-option"
                    >

                        <input
                            type="radio"
                            name="brand"
                            checked={
                                brand === ""
                            }
                            onChange={
                                () =>
                                    updateFilter(
                                        "brand",
                                        ""
                                    )
                            }
                        />

                        Tất cả

                    </label>


                    {
                        brands.map(
                            item => (

                                <label
                                    className="filter-option"
                                    key={item}
                                >

                                    <input
                                        type="radio"
                                        name="brand"
                                        checked={
                                            brand === item
                                        }
                                        onChange={
                                            () =>
                                                updateFilter(
                                                    "brand",
                                                    item
                                                )
                                        }
                                    />

                                    {item}

                                </label>

                            )
                        )
                    }

                </div>


                {/* KHOẢNG GIÁ */}

                <div className="filter-group">

                    <h3>
                        Khoảng giá
                    </h3>


                    <form
                        onSubmit={
                            handlePriceFilter
                        }
                    >

                        <label
                            className="price-label"
                        >
                            Giá từ
                        </label>

                        <input
                            className="price-input"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={
                                priceFrom
                            }
                            onChange={
                                event =>
                                    setPriceFrom(
                                        event.target.value
                                    )
                            }
                        />


                        <label
                            className="price-label"
                        >
                            Giá đến
                        </label>

                        <input
                            className="price-input"
                            type="number"
                            min="0"
                            placeholder="50.000.000"
                            value={
                                priceTo
                            }
                            onChange={
                                event =>
                                    setPriceTo(
                                        event.target.value
                                    )
                            }
                        />


                        <button
                            className="apply-filter"
                            type="submit"
                        >
                            Áp dụng
                        </button>

                    </form>

                </div>


                {/* BỘ NHỚ */}

                <div className="filter-group">

                    <h3>
                        Bộ nhớ
                    </h3>

                    <p className="filter-note">
                        Sẽ bổ sung khi Backend
                        hỗ trợ bộ lọc dung lượng.
                    </p>

                </div>

            </aside>


            {/* =====================
                PRODUCT CONTENT
            ====================== */}

            <section className="products-content">

                <div className="products-heading">

                    <div>

                        <h1>
                            Sản phẩm
                        </h1>


                        {
                            keyword && (

                                <p className="search-result">

                                    Kết quả tìm kiếm:

                                    {" "}

                                    <strong>
                                        "{keyword}"
                                    </strong>

                                </p>

                            )
                        }


                        <p className="product-count">

                            {
                                loading
                                    ? "Đang tải..."
                                    : `${products.length} sản phẩm`
                            }

                        </p>

                    </div>


                    <div className="sort-box">

                        <label>
                            Sắp xếp:
                        </label>

                        <select
                            value={sort}
                            onChange={
                                event =>
                                    updateFilter(
                                        "sort",
                                        event.target.value
                                    )
                            }
                        >

                            <option value="newest">
                                Mới nhất
                            </option>

                            <option value="price-asc">
                                Giá thấp đến cao
                            </option>

                            <option value="price-desc">
                                Giá cao đến thấp
                            </option>

                        </select>

                    </div>

                </div>


                {/* LOADING */}

                {
                    loading && (

                        <div className="products-message">
                            Đang tải sản phẩm...
                        </div>

                    )
                }


                {/* ERROR */}

                {
                    error && (

                        <div className="products-error">
                            {error}
                        </div>

                    )
                }


                {/* EMPTY */}

                {
                    !loading &&
                    !error &&
                    sortedProducts.length === 0 && (

                        <div className="products-message">

                            <h3>
                                Không tìm thấy sản phẩm
                            </h3>

                            <p>
                                Hãy thử thay đổi
                                bộ lọc hoặc từ khóa.
                            </p>

                        </div>

                    )
                }


                {/* PRODUCT GRID */}

                {
                    !loading &&
                    !error &&
                    sortedProducts.length > 0 && (

                        <div className="products-grid">

                            {
                                sortedProducts.map(
                                    product => (

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

        </div>
    );

}


export default Products;
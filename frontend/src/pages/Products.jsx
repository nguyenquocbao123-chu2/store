import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useSearchParams
} from "react-router-dom";

import {
    getProducts
} from "../services/api";


function Products() {
    const [searchParams] =
    useSearchParams();

    const keyword =
        searchParams.get("keyword") || "";

    const categoryId =
        searchParams.get("category_id") || "";

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadProducts();

    }, [keyword, categoryId]);


    async function loadProducts() {

        try {

            setLoading(true);

            setError("");

            const data =
                await getProducts({
                    keyword: keyword,
                    category_id: categoryId
                });

            setProducts(
                data.products || []
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (
            <div>
                <h1>Sản phẩm</h1>

                <p>
                    Đang tải sản phẩm...
                </p>
            </div>
        );

    }


    if (error) {

        return (
            <div>
                <h1>Sản phẩm</h1>

                <p>
                    Lỗi: {error}
                </p>
            </div>
        );

    }


    return (
        <div>

            <h1>
                Danh sách sản phẩm
            </h1>

            {keyword && (

                <p>
                    Kết quả tìm kiếm cho:
                    {" "}
                    <strong>
                        "{keyword}"
                    </strong>
                </p>

            )}

            <p>
                Tổng số sản phẩm:
                {" "}
                {products.length}
            </p>


            {products.length === 0 && (

                <p>
                    Không tìm thấy sản phẩm phù hợp.
                </p>

            )}

            {products.map((product) => (

                <div
                    key={product.product_id}
                >

                    <h2>
                        {product.product_name}
                    </h2>

                    <p>
                        Thương hiệu:
                        {" "}
                        {product.brand}
                    </p>

                    <p>
                        Danh mục:
                        {" "}
                        {product.category_name}
                    </p>

                    <p>
                        Giá:
                        {" "}
                        {Number(
                            product.price
                        ).toLocaleString(
                            "vi-VN"
                        )}
                        {" "}VNĐ
                    </p>

                    <p>
                        Tồn kho:
                        {" "}
                        {product.stock_quantity}
                    </p>

                    <Link
                        to={
                            `/products/${product.product_id}`
                        }
                    >
                        Xem chi tiết
                    </Link>

                    <hr />

                </div>

            ))}

        </div>
    );
}


export default Products;
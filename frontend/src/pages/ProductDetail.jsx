import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import {
    getProductById
} from "../services/api";


function ProductDetail() {

    // Lấy ID từ URL
    // Ví dụ: /products/1
    const { id } = useParams();


    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadProduct();

    }, [id]);


    async function loadProduct() {

        try {

            setLoading(true);

            setError("");

            const data =
                await getProductById(id);

            setProduct(
                data.product
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
    // ĐANG TẢI
    // =========================

    if (loading) {

        return (
            <div>

                <p>
                    Đang tải sản phẩm...
                </p>

            </div>
        );

    }


    // =========================
    // CÓ LỖI
    // =========================

    if (error) {

        return (
            <div>

                <h1>
                    Không thể tải sản phẩm
                </h1>

                <p>
                    {error}
                </p>

                <Link to="/products">
                    Quay lại danh sách sản phẩm
                </Link>

            </div>
        );

    }


    // =========================
    // KHÔNG CÓ SẢN PHẨM
    // =========================

    if (!product) {

        return (
            <div>

                <p>
                    Không tìm thấy sản phẩm.
                </p>

            </div>
        );

    }


    // =========================
    // HIỂN THỊ SẢN PHẨM
    // =========================

    return (
        <div>

            <Link to="/products">
                ← Quay lại sản phẩm
            </Link>


            <h1>
                {product.product_name}
            </h1>


            <p>
                <strong>
                    Danh mục:
                </strong>

                {" "}

                {product.category_name}
            </p>


            <p>
                <strong>
                    Thương hiệu:
                </strong>

                {" "}

                {product.brand}
            </p>


            <p>
                <strong>
                    Giá:
                </strong>

                {" "}

                {Number(
                    product.price
                ).toLocaleString(
                    "vi-VN"
                )}

                {" "}VNĐ
            </p>


            <p>
                <strong>
                    Tồn kho:
                </strong>

                {" "}

                {product.stock_quantity}
            </p>


            <h2>
                Mô tả sản phẩm
            </h2>

            <p>
                {
                    product.description ||
                    "Chưa có mô tả."
                }
            </p>


            <h2>
                Thông số kỹ thuật
            </h2>

            <p>
                {
                    product.specifications ||
                    "Chưa có thông số kỹ thuật."
                }
            </p>


            <h2>
                Trạng thái
            </h2>

            <p>
                {
                    product.status === "active"
                        ? "Đang kinh doanh"
                        : "Ngừng kinh doanh"
                }
            </p>


            <h2>
                Hình ảnh
            </h2>

            {
                product.image ? (

                    <img
                        src={product.image}
                        alt={product.product_name}
                        width="300"
                    />

                ) : (

                    <p>
                        Sản phẩm chưa có hình ảnh.
                    </p>

                )
            }

        </div>
    );

}


export default ProductDetail;
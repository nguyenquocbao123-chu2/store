import {
    Link
} from "react-router-dom";

import "./ProductCard.css";


function ProductCard({ product }) {

    return (
        <div className="product-card">

            <Link
                to={`/products/${product.product_id}`}
                className="product-image"
            >

                {
                    product.image ? (

                        <img
                            src={product.image}
                            alt={product.product_name}
                        />

                    ) : (

                        <div className="no-image">
                            Chưa có ảnh
                        </div>

                    )
                }

            </Link>


            <div className="product-info">

                <p className="product-category">
                    {
                        product.category_name ||
                        "Sản phẩm"
                    }
                </p>


                <Link
                    to={`/products/${product.product_id}`}
                    className="product-name"
                >
                    {product.product_name}
                </Link>


                <p className="product-brand">
                    {product.brand}
                </p>


                <p className="product-price">

                    {
                        Number(
                            product.price
                        ).toLocaleString(
                            "vi-VN"
                        )
                    }

                    {" "}VNĐ

                </p>


                <p className="product-stock">

                    {
                        product.stock_quantity > 0
                            ? `Còn ${product.stock_quantity} sản phẩm`
                            : "Hết hàng"
                    }

                </p>


                <Link
                    to={`/products/${product.product_id}`}
                    className="detail-button"
                >
                    Xem chi tiết
                </Link>

            </div>

        </div>
    );

}


export default ProductCard;
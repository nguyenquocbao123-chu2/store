import {
    Link,
    Navigate,
    useLocation
} from "react-router-dom";

import "./OrderSuccess.css";


function OrderSuccess() {

    const location =
        useLocation();


    const orderData =
        location.state;


    // Không cho mở trực tiếp
    // /order-success mà không có đơn hàng
    if (!orderData) {

        return (
            <Navigate
                to="/products"
                replace
            />
        );

    }


    return (
        <div className="order-success-page">

            <div className="success-box">

                <div className="success-icon">
                    ✓
                </div>


                <h1>
                    Đặt hàng thành công
                </h1>


                <p className="success-message">

                    {
                        orderData.message ||
                        "Đơn hàng đã được tạo thành công."
                    }

                </p>


                <div className="success-order-info">

                    <div>

                        <span>
                            Sản phẩm
                        </span>

                        <strong>
                            {
                                orderData.productName
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Số lượng
                        </span>

                        <strong>
                            {
                                orderData.quantity
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Tổng tiền sản phẩm
                        </span>

                        <strong>

                            {
                                Number(
                                    orderData.total
                                ).toLocaleString(
                                    "vi-VN"
                                )
                            }

                            {" "}VNĐ

                        </strong>

                    </div>


                    <div>

                        <span>
                            Thanh toán
                        </span>

                        <strong>
                            COD
                        </strong>

                    </div>

                </div>


                <div className="success-actions">

                    <Link
                        to="/products"
                        className="continue-shopping"
                    >
                        Tiếp tục mua sắm
                    </Link>


                    <Link
                        to="/"
                        className="back-home"
                    >
                        Về trang chủ
                    </Link>

                </div>

            </div>

        </div>
    );

}


export default OrderSuccess;
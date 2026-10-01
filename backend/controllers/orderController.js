
const Order = require("../models/orderModel");

const orderController = {

    async createOrder(req, res) {

        try {

            const {
                receiver_name,
                receiver_phone,
                shipping_address,
                payment_method,
                items
            } = req.body;

            const user_id = req.user.user_id;

            // =========================
            // 1. KIỂM TRA USER ID
            // =========================

            if (
                !Number.isSafeInteger(user_id) ||
                user_id <= 0
            ) {
                return res.status(400).json({
                    message: "Mã khách hàng không hợp lệ"
                });
            }

            // =========================
            // 2. KIỂM TRA THÔNG TIN NHẬN HÀNG
            // =========================

            if (
                typeof receiver_name !== "string" ||
                !receiver_name.trim() ||
                typeof receiver_phone !== "string" ||
                !receiver_phone.trim() ||
                typeof shipping_address !== "string" ||
                !shipping_address.trim()
            ) {
                return res.status(400).json({
                    message: "Vui lòng nhập đầy đủ thông tin nhận hàng"
                });
            }

            if (
                receiver_name.length > 100 ||
                receiver_phone.length > 20 ||
                shipping_address.length > 255
            ) {
                return res.status(400).json({
                    message: "Thông tin nhận hàng quá dài"
                });
            }

            // Hiện tại chỉ hỗ trợ COD
            if (payment_method !== "cod") {
                return res.status(400).json({
                    message:
                        "Hiện tại chỉ hỗ trợ thanh toán khi nhận hàng (COD)"
                });
            }

            // =========================
            // 3. KIỂM TRA GIỎ HÀNG
            // =========================

            if (
                !Array.isArray(items) ||
                items.length === 0 ||
                items.length > 30
            ) {
                return res.status(400).json({
                    message: "Danh sách sản phẩm không hợp lệ"
                });
            }

            // Gộp sản phẩm trùng ID
            const itemMap = new Map();

            for (const item of items) {

                if (
                    !item ||
                    !Number.isSafeInteger(item.product_id) ||
                    item.product_id <= 0 ||
                    !Number.isSafeInteger(item.quantity) ||
                    item.quantity <= 0
                ) {
                    return res.status(400).json({
                        message: "Mã sản phẩm hoặc số lượng không hợp lệ"
                    });
                }

                const oldQuantity =
                    itemMap.get(item.product_id) || 0;

                const newQuantity =
                    oldQuantity + item.quantity;

                if (!Number.isSafeInteger(newQuantity)) {
                    return res.status(400).json({
                        message: "Số lượng sản phẩm quá lớn"
                    });
                }

                itemMap.set(
                    item.product_id,
                    newQuantity
                );
            }

            const normalizedItems = Array.from(
                itemMap,
                ([product_id, quantity]) => ({
                    product_id,
                    quantity
                })
            );

            // =========================
            // 4. TẠO ĐƠN HÀNG
            // =========================

            const order = await Order.createOrder({
                user_id,
                receiver_name: receiver_name.trim(),
                receiver_phone: receiver_phone.trim(),
                shipping_address: shipping_address.trim(),
                items: normalizedItems
            });

            return res.status(201).json({
                message: "Đặt hàng và xác nhận đơn thành công",
                order
            });

        } catch (err) {

            console.error("Lỗi đặt hàng:", err.message);

            return res.status(
                err.statusCode || 500
            ).json({
                message: err.statusCode
                    ? err.message
                    : "Lỗi hệ thống khi tạo đơn hàng"
            });

        }
    }

};

module.exports = orderController;
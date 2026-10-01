
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(
    __dirname,
    "../database/electronic_store.db"
);

// Tạo kết nối riêng cho mỗi giao dịch đặt hàng
function openDatabase() {
    return new Promise((resolve, reject) => {
        const connection = new sqlite3.Database(
            DB_PATH,
            sqlite3.OPEN_READWRITE,
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    connection.configure("busyTimeout", 5000);
                    resolve(connection);
                }
            }
        );
    });
}

// Thực hiện câu lệnh INSERT, UPDATE...
function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
}

// Lấy một bản ghi
function get(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Đóng kết nối
function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Tạo lỗi nghiệp vụ
function businessError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

const Order = {

    async createOrder(data) {

        const db = await openDatabase();
        let inTransaction = false;

        try {

            // Bật kiểm tra khóa ngoại
            await run(db, "PRAGMA foreign_keys = ON");

            // Bắt đầu giao dịch ghi
            await run(db, "BEGIN IMMEDIATE TRANSACTION");
            inTransaction = true;

            // =========================
            // 1. KIỂM TRA TÀI KHOẢN
            // =========================

            const user = await get(
                db,
                `
                SELECT user_id
                FROM users
                WHERE user_id = ?
                AND role = 'customer'
                `,
                [data.user_id]
            );

            if (!user) {
                throw businessError(
                    "Tài khoản khách hàng không tồn tại",
                    404
                );
            }

            // =========================
            // 2. KIỂM TRA SẢN PHẨM
            // =========================

            const orderItems = [];
            let totalAmount = 0;

            for (const item of data.items) {

                const product = await get(
                    db,
                    `
                    SELECT
                        product_id,
                        product_name,
                        price,
                        stock_quantity,
                        status
                    FROM products
                    WHERE product_id = ?
                    `,
                    [item.product_id]
                );

                if (!product) {
                    throw businessError(
                        `Sản phẩm ID ${item.product_id} không tồn tại`,
                        404
                    );
                }

                if (product.status !== "active") {
                    throw businessError(
                        `${product.product_name} hiện không được bán`,
                        409
                    );
                }

                if (product.stock_quantity < item.quantity) {
                    throw businessError(
                        `${product.product_name} không đủ tồn kho. Hiện còn ${product.stock_quantity} sản phẩm`,
                        409
                    );
                }

                const subtotal = product.price * item.quantity;

                if (!Number.isFinite(subtotal)) {
                    throw businessError(
                        "Giá trị đơn hàng không hợp lệ"
                    );
                }

                totalAmount += subtotal;

                orderItems.push({
                    product_id: product.product_id,
                    product_name: product.product_name,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal
                });
            }

            if (!Number.isFinite(totalAmount)) {
                throw businessError(
                    "Tổng tiền đơn hàng không hợp lệ"
                );
            }

            // =========================
            // 3. TẠO ĐƠN HÀNG
            // =========================

            const orderResult = await run(
                db,
                `
                INSERT INTO orders (
                    user_id,
                    total_amount,
                    receiver_name,
                    receiver_phone,
                    shipping_address,
                    payment_method,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    data.user_id,
                    totalAmount,
                    data.receiver_name,
                    data.receiver_phone,
                    data.shipping_address,
                    "cod",
                    "confirmed"
                ]
            );

            const orderId = orderResult.lastID;

            // =========================
            // 4. CHI TIẾT ĐƠN + TRỪ KHO
            // =========================

            for (const item of orderItems) {

                await run(
                    db,
                    `
                    INSERT INTO order_details (
                        order_id,
                        product_id,
                        quantity,
                        price
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        orderId,
                        item.product_id,
                        item.quantity,
                        item.price
                    ]
                );

                // Chỉ trừ nếu số lượng còn đủ
                const updateResult = await run(
                    db,
                    `
                    UPDATE products
                    SET stock_quantity = stock_quantity - ?
                    WHERE product_id = ?
                    AND stock_quantity >= ?
                    `,
                    [
                        item.quantity,
                        item.product_id,
                        item.quantity
                    ]
                );

                if (updateResult.changes !== 1) {
                    throw businessError(
                        `Không đủ tồn kho cho sản phẩm ${item.product_name}`,
                        409
                    );
                }
            }

            // =========================
            // 5. HOÀN TẤT GIAO DỊCH
            // =========================

            await run(db, "COMMIT");
            inTransaction = false;

            return {
                order_id: orderId,
                user_id: data.user_id,
                total_amount: totalAmount,
                payment_method: "cod",
                status: "confirmed",
                items: orderItems
            };

        } catch (err) {

            // Hủy toàn bộ nếu có lỗi
            if (inTransaction) {
                try {
                    await run(db, "ROLLBACK");
                } catch (rollbackError) {
                    console.error(
                        "Lỗi rollback:",
                        rollbackError.message
                    );
                }
            }

            throw err;

        } finally {
            await closeDatabase(db);
        }
    }

};

module.exports = Order;
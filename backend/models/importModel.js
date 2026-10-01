
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(
    __dirname,
    "../database/electronic_store.db"
);

function openDatabase() {
    return new Promise((resolve, reject) => {

        const db = new sqlite3.Database(
            DB_PATH,
            sqlite3.OPEN_READWRITE,
            (err) => {

                if (err) {
                    return reject(err);
                }

                db.configure("busyTimeout", 5000);
                resolve(db);
            }
        );
    });
}

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

function get(db, sql, params = []) {
    return new Promise((resolve, reject) => {

        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function businessError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

const Import = {

    async createImport(data) {

        const db = await openDatabase();
        let inTransaction = false;

        try {

            // Bật kiểm tra khóa ngoại
            await run(db, "PRAGMA foreign_keys = ON");

            // Bắt đầu giao dịch
            await run(db, "BEGIN IMMEDIATE TRANSACTION");

            inTransaction = true;

            // ============================
            // 1. KIỂM TRA NHÀ CUNG CẤP
            // ============================

            const supplier = await get(
                db,
                `
                SELECT supplier_id, supplier_name
                FROM suppliers
                WHERE supplier_id = ?
                `,
                [data.supplier_id]
            );

            if (!supplier) {
                throw businessError(
                    "Nhà cung cấp không tồn tại",
                    404
                );
            }

            // ============================
            // 2. KIỂM TRA SẢN PHẨM
            // ============================

            let totalAmount = 0;

            const importItems = [];

            for (const item of data.items) {

                const product = await get(
                    db,
                    `
                    SELECT
                        product_id,
                        product_name,
                        stock_quantity
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

                const newStock =
                    product.stock_quantity + item.quantity;

                if (!Number.isSafeInteger(newStock)) {
                    throw businessError(
                        "Số lượng tồn kho vượt giới hạn cho phép"
                    );
                }

                const subtotal =
                    item.quantity * item.import_price;

                if (!Number.isSafeInteger(subtotal)) {
                    throw businessError(
                        "Giá trị nhập hàng không hợp lệ"
                    );
                }

                totalAmount += subtotal;

                if (!Number.isSafeInteger(totalAmount)) {
                    throw businessError(
                        "Tổng tiền nhập hàng vượt giới hạn"
                    );
                }

                importItems.push({
                    product_id: product.product_id,
                    product_name: product.product_name,
                    quantity: item.quantity,
                    import_price: item.import_price,
                    subtotal
                });
            }

            // ============================
            // 3. TẠO PHIẾU NHẬP
            // ============================

            const result = await run(
                db,
                `
                INSERT INTO imports (
                    supplier_id,
                    total_amount,
                    note
                )
                VALUES (?, ?, ?)
                `,
                [
                    data.supplier_id,
                    totalAmount,
                    data.note
                ]
            );

            const importId = result.lastID;

            // ============================
            // 4. LƯU CHI TIẾT + CỘNG KHO
            // ============================

            for (const item of importItems) {

                await run(
                    db,
                    `
                    INSERT INTO import_details (
                        import_id,
                        product_id,
                        quantity,
                        import_price
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        importId,
                        item.product_id,
                        item.quantity,
                        item.import_price
                    ]
                );

                const updateResult = await run(
                    db,
                    `
                    UPDATE products
                    SET stock_quantity =
                        stock_quantity + ?
                    WHERE product_id = ?
                    `,
                    [
                        item.quantity,
                        item.product_id
                    ]
                );

                if (updateResult.changes !== 1) {
                    throw businessError(
                        `Không thể cập nhật kho cho ${item.product_name}`,
                        409
                    );
                }
            }

            // ============================
            // 5. HOÀN TẤT GIAO DỊCH
            // ============================

            await run(db, "COMMIT");

            inTransaction = false;

            return {
                import_id: importId,
                supplier_id: supplier.supplier_id,
                supplier_name: supplier.supplier_name,
                total_amount: totalAmount,
                note: data.note,
                items: importItems
            };

        } catch (err) {

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

            try {
                await closeDatabase(db);
            } catch (closeError) {
                console.error(
                    "Lỗi đóng SQLite:",
                    closeError.message
                );
            }
        }
    }

};

module.exports = Import;
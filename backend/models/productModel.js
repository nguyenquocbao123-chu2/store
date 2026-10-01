
const db = require("../config/database");

const Product = {

    // Lấy danh sách, tìm kiếm và lọc sản phẩm
    getAll: (filters, callback) => {

        let sql = `
            SELECT
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE 1 = 1
        `;

        const params = [];

        // Tìm kiếm theo từ khóa
        if (filters.keyword) {
            sql += `
                AND (
                    p.product_name LIKE ?
                    OR p.brand LIKE ?
                    OR p.description LIKE ?
                    OR p.specifications LIKE ?
                )
            `;

            const keyword = `%${filters.keyword}%`;

            params.push(
                keyword,
                keyword,
                keyword,
                keyword
            );
        }

        // Lọc theo danh mục
        if (filters.category_id !== undefined) {
            sql += ` AND p.category_id = ?`;

            params.push(filters.category_id);
        }

        // Lọc theo thương hiệu
        if (filters.brand) {
            sql += ` AND p.brand LIKE ?`;

            params.push(`%${filters.brand}%`);
        }

        // Giá thấp nhất
        if (filters.min_price !== undefined) {
            sql += ` AND p.price >= ?`;

            params.push(filters.min_price);
        }

        // Giá cao nhất
        if (filters.max_price !== undefined) {
            sql += ` AND p.price <= ?`;

            params.push(filters.max_price);
        }

        sql += ` ORDER BY p.product_id DESC`;

        db.all(sql, params, callback);
    },

    // Xem chi tiết sản phẩm
    getById: (id, callback) => {

        const sql = `
            SELECT
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `;

        db.get(sql, [id], callback);
    },

    // Lấy sản phẩm dưới ngưỡng cảnh báo
    getLowStock: (callback) => {

        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.brand,
                p.stock_quantity,
                p.low_stock_threshold,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.stock_quantity <= p.low_stock_threshold
            ORDER BY p.stock_quantity ASC
        `;

        db.all(sql, [], callback);
    }

};

module.exports = Product;
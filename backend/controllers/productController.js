
const Product = require("../models/productModel");

const productController = {

    // ===================================
    // DANH SÁCH + TÌM KIẾM + LỌC SẢN PHẨM
    // ===================================

    getAllProducts: (req, res) => {

        const filters = {};

        // Từ khóa
        if (typeof req.query.keyword === "string") {
            filters.keyword = req.query.keyword.trim();
        }

        // Thương hiệu
        if (typeof req.query.brand === "string") {
            filters.brand = req.query.brand.trim();
        }

        // Danh mục
        if (req.query.category_id !== undefined) {

            const categoryId = Number(
                req.query.category_id
            );

            if (
                !Number.isInteger(categoryId) ||
                categoryId <= 0
            ) {
                return res.status(400).json({
                    message: "Mã danh mục không hợp lệ"
                });
            }

            filters.category_id = categoryId;
        }

        // Giá thấp nhất
        if (req.query.min_price !== undefined) {

            const minPrice = Number(
                req.query.min_price
            );

            if (
                req.query.min_price === "" ||
                !Number.isFinite(minPrice) ||
                minPrice < 0
            ) {
                return res.status(400).json({
                    message: "Giá tối thiểu không hợp lệ"
                });
            }

            filters.min_price = minPrice;
        }

        // Giá cao nhất
        if (req.query.max_price !== undefined) {

            const maxPrice = Number(
                req.query.max_price
            );

            if (
                req.query.max_price === "" ||
                !Number.isFinite(maxPrice) ||
                maxPrice < 0
            ) {
                return res.status(400).json({
                    message: "Giá tối đa không hợp lệ"
                });
            }

            filters.max_price = maxPrice;
        }

        // Kiểm tra khoảng giá
        if (
            filters.min_price !== undefined &&
            filters.max_price !== undefined &&
            filters.min_price > filters.max_price
        ) {
            return res.status(400).json({
                message:
                    "Giá tối thiểu không được lớn hơn giá tối đa"
            });
        }

        // Gọi Model
        Product.getAll(filters, (err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: "Lỗi lấy danh sách sản phẩm",
                    error: err.message
                });
            }

            res.json({
                message: "Lấy sản phẩm thành công",
                total: rows.length,
                products: rows
            });

        });
    },

    // ===================================
    // CHI TIẾT SẢN PHẨM
    // ===================================

    getProductById: (req, res) => {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Mã sản phẩm không hợp lệ"
            });
        }

        Product.getById(id, (err, row) => {

            if (err) {
                return res.status(500).json({
                    message: "Lỗi lấy sản phẩm",
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    message: "Không tìm thấy sản phẩm"
                });
            }

            res.json({
                message: "Lấy sản phẩm thành công",
                product: row
            });

        });
    }

};

module.exports = productController;
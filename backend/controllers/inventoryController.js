
const Product = require("../models/productModel");

const inventoryController = {

    getLowStockProducts: (req, res) => {

        Product.getLowStock((err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: "Lỗi kiểm tra tồn kho",
                    error: err.message
                });
            }

            res.json({
                message: "Danh sách cảnh báo tồn kho",
                total: rows.length,
                products: rows
            });

        });

    }

};

module.exports = inventoryController;
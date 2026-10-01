
const Supplier = require("../models/supplierModel");

const supplierController = {

    getAllSuppliers: (req, res) => {

        Supplier.getAll((err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: "Lỗi lấy danh sách nhà cung cấp",
                    error: err.message
                });
            }

            res.json({
                message: "Lấy nhà cung cấp thành công",
                total: rows.length,
                suppliers: rows
            });
        });
    },

    createSupplier: (req, res) => {

        const {
            supplier_name,
            phone,
            email,
            address
        } = req.body;

        if (
            typeof supplier_name !== "string" ||
            !supplier_name.trim()
        ) {
            return res.status(400).json({
                message: "Tên nhà cung cấp không hợp lệ"
            });
        }

        const data = {
            supplier_name: supplier_name.trim(),
            phone: typeof phone === "string" ? phone.trim() : "",
            email: typeof email === "string" ? email.trim() : "",
            address: typeof address === "string" ? address.trim() : ""
        };

        Supplier.create(data, (err, supplierId) => {

            if (err) {
                return res.status(500).json({
                    message: "Không thể thêm nhà cung cấp",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Thêm nhà cung cấp thành công",
                supplier_id: supplierId,
                supplier: data
            });

        });
    }

};

module.exports = supplierController;
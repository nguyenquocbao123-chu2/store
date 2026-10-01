
const Import = require("../models/importModel");
const db = require("../config/database");

const importController = {

    // =========================
    // XEM DANH SÁCH PHIẾU NHẬP
    // =========================

    getAllImports: (req, res) => {

        const sql = `
            SELECT
                i.import_id,
                i.supplier_id,
                s.supplier_name,
                i.total_amount,
                i.note,
                i.created_at
            FROM imports i
            JOIN suppliers s
                ON i.supplier_id = s.supplier_id
            ORDER BY i.import_id DESC
        `;

        db.all(sql, [], (err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: "Lỗi lấy danh sách phiếu nhập",
                    error: err.message
                });
            }

            res.json({
                message: "Lấy danh sách phiếu nhập thành công",
                total: rows.length,
                imports: rows
            });
        });
    },

    // =========================
    // TẠO PHIẾU NHẬP
    // =========================

    async createImport(req, res) {

        try {

            const {
                supplier_id,
                note,
                items
            } = req.body;

            // Kiểm tra nhà cung cấp
            if (
                !Number.isSafeInteger(supplier_id) ||
                supplier_id <= 0
            ) {
                return res.status(400).json({
                    message: "Mã nhà cung cấp không hợp lệ"
                });
            }

            // Kiểm tra danh sách sản phẩm
            if (
                !Array.isArray(items) ||
                items.length === 0 ||
                items.length > 30
            ) {
                return res.status(400).json({
                    message: "Danh sách nhập hàng không hợp lệ"
                });
            }

            // Không cho phép trùng sản phẩm trong cùng phiếu
            const productIds = new Set();

            for (const item of items) {

                if (
                    !item ||
                    !Number.isSafeInteger(item.product_id) ||
                    item.product_id <= 0 ||
                    !Number.isSafeInteger(item.quantity) ||
                    item.quantity <= 0 ||
                    !Number.isSafeInteger(item.import_price) ||
                    item.import_price < 0
                ) {
                    return res.status(400).json({
                        message: "Thông tin sản phẩm nhập không hợp lệ"
                    });
                }

                if (productIds.has(item.product_id)) {
                    return res.status(400).json({
                        message: "Sản phẩm bị trùng trong phiếu nhập"
                    });
                }

                productIds.add(item.product_id);
            }

            // Kiểm tra ghi chú
            if (
                note !== undefined &&
                typeof note !== "string"
            ) {
                return res.status(400).json({
                    message: "Ghi chú không hợp lệ"
                });
            }

            if (
                typeof note === "string" &&
                note.length > 1000
            ) {
                return res.status(400).json({
                    message: "Ghi chú quá dài"
                });
            }

            // Gọi Model để tạo phiếu và cập nhật tồn kho
            const result = await Import.createImport({
                supplier_id,
                note: typeof note === "string"
                    ? note.trim()
                    : "",
                items
            });

            return res.status(201).json({
                message: "Nhập hàng thành công",
                import: result
            });

        } catch (err) {

            console.error("Lỗi nhập hàng:", err.message);

            return res.status(
                err.statusCode || 500
            ).json({
                message: err.statusCode
                    ? err.message
                    : "Lỗi hệ thống khi nhập hàng"
            });

        }
    }

};

module.exports = importController;
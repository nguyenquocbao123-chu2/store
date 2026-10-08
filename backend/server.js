require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const productRoutes =
    require("./routes/productRoutes");
const inventoryRoutes =
    require("./routes/inventoryRoutes");   
const supplierRoutes = require("./routes/supplierRoutes");
const importRoutes = require("./routes/importRoutes");    
const app = express();
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);
app.use(cors());
app.use(express.json());
// API đăng ký, đăng nhập và tài khoản
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
) {
    console.error(
        "JWT_SECRET chưa được cấu hình hợp lệ trong .env"
    );

    process.exit(1);
}
// API nhà cung cấp
app.use("/api/suppliers", supplierRoutes);

// API nhập hàng
app.use("/api/imports", importRoutes);
// API sản phẩm
app.use(
    "/api/products",
    productRoutes
);

// API tồn kho
app.use(
    "/api/inventory",
    inventoryRoutes
);

app.get("/", (req, res) => {
    res.send("Electronic Store API đang chạy");
});

app.get("/api/test-db", (req, res) => {
    db.get("SELECT 1 AS test", [], (err, row) => {
        if (err) {
            return res.status(500).json({
                message: "Kết nối SQLite thất bại",
                error: err.message
            });
        }

        res.json({
            message: "Kết nối SQLite thành công",
            data: row
        });
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
app.get("/api/tables", (req, res) => {
    db.all(
        `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        `,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    message: "Không thể lấy danh sách bảng",
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});
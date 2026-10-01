
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// =========================
// KIỂM TRA ĐĂNG NHẬP
// =========================

function authenticate(req, res, next) {

    const authorization =
        req.headers.authorization || "";

    const match = /^Bearer (\S+)$/i.exec(
        authorization
    );

    if (!match) {
        return res.status(401).json({
            message: "Bạn chưa đăng nhập"
        });
    }

    const token = match[1];

    let payload;

    try {

        payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"],
                issuer: "electronic-store",
                audience: "electronic-store-users"
            }
        );

    } catch (err) {

        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn"
        });

    }

    const userId = Number(payload.sub);

    if (
        !Number.isSafeInteger(userId) ||
        userId <= 0
    ) {
        return res.status(401).json({
            message: "Thông tin xác thực không hợp lệ"
        });
    }

    // Lấy quyền hiện tại từ SQLite
    db.get(
        `
        SELECT
            user_id,
            full_name,
            email,
            phone,
            address,
            role
        FROM users
        WHERE user_id = ?
        `,
        [userId],
        (err, user) => {

            if (err) {
                return res.status(500).json({
                    message: "Lỗi kiểm tra tài khoản"
                });
            }

            if (!user) {
                return res.status(401).json({
                    message: "Tài khoản không còn tồn tại"
                });
            }

            req.user = user;

            next();
        }
    );
}

// =========================
// KIỂM TRA QUYỀN
// =========================

function requireRole(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Bạn chưa đăng nhập"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập"
            });
        }

        next();
    };
}

module.exports = {
    authenticate,
    requireRole
};
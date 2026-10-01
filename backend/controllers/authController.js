
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const authController = {

    // =========================
    // ĐĂNG KÝ
    // =========================

    async register(req, res) {

        try {

            const {
                full_name,
                email,
                password,
                phone = "",
                address = ""
            } = req.body || {};

            // Kiểm tra dữ liệu
            if (
                typeof full_name !== "string" ||
                !full_name.trim() ||
                full_name.trim().length > 100 ||
                typeof email !== "string" ||
                typeof password !== "string" ||
                typeof phone !== "string" ||
                typeof address !== "string"
            ) {
                return res.status(400).json({
                    message: "Thông tin đăng ký không hợp lệ"
                });
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                normalizedEmail.length > 120 ||
                !emailRegex.test(normalizedEmail)
            ) {
                return res.status(400).json({
                    message: "Email không hợp lệ"
                });
            }

            if (
                password.length < 8 ||
                Buffer.byteLength(password, "utf8") > 72
            ) {
                return res.status(400).json({
                    message:
                        "Mật khẩu phải có ít nhất 8 ký tự và không vượt quá 72 byte"
                });
            }

            if (
                phone.trim().length > 20 ||
                address.trim().length > 255
            ) {
                return res.status(400).json({
                    message: "Thông tin liên hệ không hợp lệ"
                });
            }

            // Kiểm tra email đã tồn tại
            const existingUser =
                await User.findByEmail(normalizedEmail);

            if (existingUser) {
                return res.status(409).json({
                    message: "Email đã được sử dụng"
                });
            }

            // Mã hóa mật khẩu
            const passwordHash =
                await bcrypt.hash(password, 10);

            // Tạo tài khoản Customer
            const result = await User.createCustomer({
                full_name: full_name.trim(),
                email: normalizedEmail,
                password: passwordHash,
                phone: phone.trim(),
                address: address.trim()
            });

            return res.status(201).json({
                message: "Đăng ký tài khoản thành công",
                user: {
                    user_id: result.lastID,
                    full_name: full_name.trim(),
                    email: normalizedEmail,
                    role: "customer"
                }
            });

        } catch (err) {

            if (err.code === "SQLITE_CONSTRAINT") {
                return res.status(409).json({
                    message: "Thông tin tài khoản đã tồn tại"
                });
            }

            console.error("Lỗi đăng ký:", err.message);

            return res.status(500).json({
                message: "Lỗi hệ thống khi đăng ký"
            });

        }
    },

    // =========================
    // ĐĂNG NHẬP
    // =========================

    async login(req, res) {

        try {

            const { email, password } =
                req.body || {};

            if (
                typeof email !== "string" ||
                typeof password !== "string" ||
                !email.trim() ||
                !password
            ) {
                return res.status(400).json({
                    message: "Vui lòng nhập email và mật khẩu"
                });
            }

            const user = await User.findByEmail(
                email.trim().toLowerCase()
            );

            if (!user) {
                return res.status(401).json({
                    message: "Email hoặc mật khẩu không đúng"
                });
            }

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Email hoặc mật khẩu không đúng"
                });
            }

            // Tạo JWT
            const token = jwt.sign(
                {},
                process.env.JWT_SECRET,
                {
                    subject: String(user.user_id),
                    expiresIn: "2h",
                    issuer: "electronic-store",
                    audience: "electronic-store-users",
                    algorithm: "HS256"
                }
            );

            return res.json({
                message: "Đăng nhập thành công",
                token,
                token_type: "Bearer",
                user: {
                    user_id: user.user_id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (err) {

            console.error("Lỗi đăng nhập:", err.message);

            return res.status(500).json({
                message: "Lỗi hệ thống khi đăng nhập"
            });

        }
    },

    // =========================
    // THÔNG TIN TÀI KHOẢN
    // =========================

    getMe(req, res) {

        return res.json({
            message: "Thông tin tài khoản",
            user: req.user
        });

    }

};

module.exports = authController;
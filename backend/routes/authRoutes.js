
const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/authController");

const {
    authenticate
} = require("../middleware/authMiddleware");

// Đăng ký
router.post(
    "/register",
    authController.register
);

// Đăng nhập
router.post(
    "/login",
    authController.login
);

// Thông tin tài khoản
router.get(
    "/me",
    authenticate,
    authController.getMe
);

module.exports = router;
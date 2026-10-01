
const express = require("express");

const router = express.Router();

const orderController =
    require("../controllers/orderController");

const {
    authenticate,
    requireRole
} = require("../middleware/authMiddleware");

router.post(
    "/",
    authenticate,
    requireRole("customer"),
    orderController.createOrder
);

module.exports = router;
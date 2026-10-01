
const express = require("express");

const router = express.Router();

const inventoryController =
    require("../controllers/inventoryController");

const {
    authenticate,
    requireRole
} = require("../middleware/authMiddleware");

router.use(
    authenticate,
    requireRole("owner")
);

router.get(
    "/alerts",
    inventoryController.getLowStockProducts
);

module.exports = router;
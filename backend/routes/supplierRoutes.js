
const express = require("express");

const router = express.Router();

const supplierController =
    require("../controllers/supplierController");

const {
    authenticate,
    requireRole
} = require("../middleware/authMiddleware");

router.use(
    authenticate,
    requireRole("owner")
);

router.get(
    "/",
    supplierController.getAllSuppliers
);

router.post(
    "/",
    supplierController.createSupplier
);

module.exports = router;
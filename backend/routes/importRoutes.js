
const express = require("express");

const router = express.Router();

const importController =
    require("../controllers/importController");

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
    importController.getAllImports
);

router.post(
    "/",
    importController.createImport
);

module.exports = router;
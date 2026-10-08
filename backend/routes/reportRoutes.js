
const express = require("express");
const router = express.Router();

const reportController =
  require("../controllers/reportController");

const {
  authenticate,
  requireRole,
} = require("../middleware/authMiddleware");

router.get(
  "/overview",
  authenticate,
  requireRole("owner"),
  reportController.getOverview
);

module.exports = router;

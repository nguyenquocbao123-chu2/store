
const Report = require("../models/reportModel");

const reportController = {
  async getOverview(req, res) {
    try {
      const report = await Report.getOverview();

      return res.json({
        message: "Lấy báo cáo thành công",
        ...report,
      });
    } catch (err) {
      console.error("Lỗi báo cáo:", err.message);

      return res.status(500).json({
        message: "Không thể lấy báo cáo thống kê",
      });
    }
  },
};

module.exports = reportController;

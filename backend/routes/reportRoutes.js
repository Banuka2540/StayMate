import express from "express";
import {
    getSystemReportSummary,
    exportSystemReportCsv,
    getContentReports,
    createContentReport,
    updateContentReportStatus
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", getSystemReportSummary);
router.get("/export", exportSystemReportCsv);
router.get("/content", getContentReports);
router.post("/content", createContentReport);
router.patch("/content/:id/status", updateContentReportStatus);

export default router;

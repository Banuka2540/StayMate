import express from "express";
import {
    getNotifications,
    getUnreadCount,
    createNotification,
    sendMonthlyReminders,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    seedDemoData
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/", createNotification);
router.post("/reminders/monthly", sendMonthlyReminders);
router.post("/seed-demo", seedDemoData);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);

export default router;

import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import ContentReport from "../models/ContentReport.js";
import {
    sendNotification,
    notifyReservationEvent,
    notifyPaymentEvent,
    notifyListingApprovalEvent,
    dispatchMonthlyPaymentReminders
} from "../services/notificationService.js";

const VALID_ROLES = ["Student", "Provider", "Admin"];
const VALID_TYPES = [
    "reservation",
    "payment",
    "payment_reminder",
    "listing_approval",
    "report",
    "system"
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveRole = (req) => {
    const raw = req.user?.role || req.query?.role || req.body?.recipientRole || "Student";
    if (raw === "User") return "Student";
    return VALID_ROLES.includes(raw) ? raw : "Student";
};

const buildScopeFilter = (req) => {
    const role = resolveRole(req);
    const userId = req.user?._id?.toString() || req.user?.id || req.query?.userId;
    const filter = { recipientRole: role };

    // When a real authenticated user is present (not demo placeholder), scope to their personal
    // notifications OR role-wide announcements (where recipient is not set).
    if (userId && isValidId(userId) && userId !== "000000000000000000000001") {
        filter.$or = [
            { recipient: new mongoose.Types.ObjectId(userId) },
            { recipient: { $exists: false } },
            { recipient: null }
        ];
    }

    return { filter, role };
};

// @desc   Get notifications for the active role/user with filtering & pagination
// @route  GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const { filter: scopeFilter, role } = buildScopeFilter(req);
        const { type, isRead, search } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

        const queryFilter = { ...scopeFilter };
        if (type && VALID_TYPES.includes(type)) {
            queryFilter.type = type;
        }
        if (isRead === "true") queryFilter.isRead = true;
        if (isRead === "false") queryFilter.isRead = false;

        if (search && search.trim()) {
            const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchOr = [
                { title: { $regex: safe, $options: "i" } },
                { message: { $regex: safe, $options: "i" } },
                { "relatedEntity.label": { $regex: safe, $options: "i" } }
            ];
            if (queryFilter.$or) {
                queryFilter.$and = [{ $or: queryFilter.$or }, { $or: searchOr }];
                delete queryFilter.$or;
            } else {
                queryFilter.$or = searchOr;
            }
        }

        const [notifications, total, unreadCount, typeCountsAgg] = await Promise.all([
            Notification.find(queryFilter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Notification.countDocuments(queryFilter),
            Notification.countDocuments({ ...scopeFilter, isRead: false }),
            Notification.aggregate([
                { $match: scopeFilter },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: 1 },
                        unread: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } }
                    }
                }
            ])
        ]);

        const countsByType = {};
        for (const row of typeCountsAgg) {
            countsByType[row._id] = { total: row.total, unread: row.unread };
        }

        res.status(200).json({
            success: true,
            role,
            count: notifications.length,
            total,
            unreadCount,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
            countsByType,
            notifications
        });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        res.status(500).json({ success: false, message: "Could not load notifications" });
    }
};

// @desc   Lightweight unread count for header bell badge
// @route  GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
    try {
        const { filter, role } = buildScopeFilter(req);
        const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });
        res.status(200).json({ success: true, role, unreadCount });
    } catch (error) {
        console.error("UNREAD COUNT ERROR:", error);
        res.status(500).json({ success: false, message: "Could not fetch unread count" });
    }
};

// @desc   Send a notification (custom or domain event: reservation, payment, listing_approval)
// @route  POST /api/notifications
export const createNotification = async (req, res) => {
    try {
        const { event } = req.body;

        if (event === "reservation") {
            const { hostelName, roomType, status, moveInDate, studentName, studentId, providerId, reservationId } = req.body;
            if (!hostelName) {
                return res.status(400).json({ success: false, message: "Hostel name is required for reservation notification" });
            }
            const created = await notifyReservationEvent({
                studentId,
                providerId,
                studentName,
                hostelName,
                roomType,
                status,
                reservationId,
                moveInDate
            });
            return res.status(201).json({ success: true, message: "Reservation notifications sent", notifications: created });
        }

        if (event === "payment") {
            const { hostelName, paymentType, month, amount, status, transactionId, studentId, providerId, paymentId } = req.body;
            if (!hostelName || !amount) {
                return res.status(400).json({ success: false, message: "Hostel name and amount are required for payment notification" });
            }
            const created = await notifyPaymentEvent({
                studentId,
                providerId,
                hostelName,
                paymentType,
                month,
                amount,
                status,
                transactionId,
                paymentId
            });
            return res.status(201).json({ success: true, message: "Payment notifications sent", notifications: created });
        }

        if (event === "listing_approval") {
            const { hostelName, hostelId, status, reason, providerId } = req.body;
            if (!hostelName) {
                return res.status(400).json({ success: false, message: "Hostel name is required for listing approval notification" });
            }
            const created = await notifyListingApprovalEvent({
                providerId,
                hostelName,
                hostelId,
                status,
                reason
            });
            return res.status(201).json({ success: true, message: "Listing approval notifications sent", notifications: created });
        }

        const { recipient, recipientRole, title, message, type, priority, actionUrl, relatedEntity, metadata } = req.body;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }
        if (type && !VALID_TYPES.includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid notification type" });
        }
        if (recipientRole && !VALID_ROLES.includes(recipientRole)) {
            return res.status(400).json({ success: false, message: "Invalid recipient role" });
        }

        const notification = await sendNotification({
            recipient,
            recipientRole: recipientRole || "Student",
            title,
            message,
            type: type || "system",
            priority: priority || "normal",
            actionUrl,
            relatedEntity,
            metadata
        });

        res.status(201).json({ success: true, message: "Notification created", notification });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors)[0].message });
        }
        console.error("CREATE NOTIFICATION ERROR:", error);
        res.status(500).json({ success: false, message: "Could not create notification" });
    }
};

// @desc   Trigger monthly payment reminders for unpaid boarders
// @route  POST /api/notifications/reminders/monthly
export const sendMonthlyReminders = async (req, res) => {
    try {
        const { month, dueDay, targets } = req.body || {};
        if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({ success: false, message: "Month must be formatted as YYYY-MM" });
        }

        const result = await dispatchMonthlyPaymentReminders({
            month,
            dueDay: Number(dueDay) || 5,
            targets: Array.isArray(targets) ? targets : []
        });

        res.status(201).json({
            success: true,
            message: `Sent ${result.created.length} monthly rent reminder(s) for ${result.month}`,
            ...result
        });
    } catch (error) {
        console.error("MONTHLY REMINDERS ERROR:", error);
        res.status(500).json({ success: false, message: "Could not dispatch monthly reminders" });
    }
};

// @desc   Mark a single notification as read (+markAsRead)
// @route  PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid notification id" });
        }

        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        await notification.markAsRead();
        res.status(200).json({ success: true, message: "Notification marked as read", notification });
    } catch (error) {
        console.error("MARK AS READ ERROR:", error);
        res.status(500).json({ success: false, message: "Could not update notification" });
    }
};

// @desc   Mark all notifications as read for the active role/user
// @route  PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        const { filter, role } = buildScopeFilter(req);
        const result = await Notification.updateMany(
            { ...filter, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        res.status(200).json({
            success: true,
            role,
            modifiedCount: result.modifiedCount,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("MARK ALL READ ERROR:", error);
        res.status(500).json({ success: false, message: "Could not mark notifications as read" });
    }
};

// @desc   Delete a notification
// @route  DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid notification id" });
        }

        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error);
        res.status(500).json({ success: false, message: "Could not delete notification" });
    }
};

// @desc   Seed realistic sample notifications & content reports for StayMate demo/testing
// @route  POST /api/notifications/seed-demo
export const seedDemoData = async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const existingCount = await Notification.countDocuments();

        const createdNotifications = [];
        if (existingCount === 0) {
            createdNotifications.push(
                ...(await notifyReservationEvent({
                    studentName: "Nethmi Perera",
                    hostelName: "Sawbhagya Hostel",
                    roomType: "Twin sharing",
                    status: "Confirmed",
                    moveInDate: "2026-12-01"
                }))
            );
            createdNotifications.push(
                ...(await notifyReservationEvent({
                    studentName: "Kavindi Silva",
                    hostelName: "Sawbhagya Hostel",
                    roomType: "Single room",
                    status: "Pending",
                    moveInDate: "2026-12-05"
                }))
            );
            createdNotifications.push(
                ...(await notifyPaymentEvent({
                    hostelName: "Sawbhagya Hostel",
                    paymentType: "Advance",
                    amount: 15000,
                    status: "Paid",
                    transactionId: "SM-20261125-8A2C1D"
                }))
            );
            createdNotifications.push(
                ...(await notifyListingApprovalEvent({
                    hostelName: "Sawbhagya Hostel",
                    status: "Approved"
                }))
            );
            createdNotifications.push(
                ...(await notifyListingApprovalEvent({
                    hostelName: "Samanala Lodge",
                    status: "Pending"
                }))
            );
            const reminderResult = await dispatchMonthlyPaymentReminders({
                month: currentMonth,
                dueDay: 5,
                targets: [
                    { hostelName: "Sawbhagya Hostel", roomType: "Twin sharing", amount: 10000 }
                ]
            });
            createdNotifications.push(...reminderResult.created);
        }

        const existingReports = await ContentReport.countDocuments();
        let createdReports = [];
        if (existingReports === 0) {
            createdReports = await ContentReport.insertMany([
                {
                    reporterName: "Dilshan Fernando",
                    targetType: "Hostel",
                    targetName: "University View Lodge",
                    reason: "Pricing discrepancy",
                    description: "Listed monthly rent shows LKR 7,000, but utility charges add LKR 2,500 separately without clear mention.",
                    status: "Pending"
                },
                {
                    reporterName: "Nethmi Perera",
                    targetType: "Hostel",
                    targetName: "Greenview Boarding",
                    reason: "Inaccurate listing",
                    description: "Kitchen access is marked unavailable in person although facilities section needed clarification.",
                    status: "Under Review",
                    adminNote: "Contacted hostel provider to update facilities checklist."
                }
            ]);

            await sendNotification({
                recipientRole: "Admin",
                title: "Reported listing requires review",
                message: "University View Lodge was flagged for a pricing discrepancy by a student.",
                type: "report",
                priority: "high",
                actionUrl: "/reports",
                relatedEntity: { entityType: "Report", label: "University View Lodge" }
            });
        }

        res.status(201).json({
            success: true,
            message:
                createdNotifications.length === 0 && createdReports.length === 0
                    ? "Sample data already exists in database"
                    : "Demo notifications and reports loaded",
            notificationsCreated: createdNotifications.length,
            reportsCreated: createdReports.length
        });
    } catch (error) {
        console.error("SEED DEMO ERROR:", error);
        res.status(500).json({ success: false, message: "Could not seed demo data" });
    }
};

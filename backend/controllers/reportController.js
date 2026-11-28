import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import ContentReport from "../models/ContentReport.js";
import { sendNotification } from "../services/notificationService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const VALID_REPORT_STATUS = ["Pending", "Under Review", "Resolved", "Dismissed"];

const getPeriodStartDate = (period) => {
    const now = new Date();
    if (period === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (period === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (period === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return null;
};

// Protect CSV exports against spreadsheet formula injection (=, +, -, @)
const csvCell = (value) => {
    const str = value == null ? "" : String(value);
    const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
    return `"${safe.replace(/"/g, '""')}"`;
};

const toCsv = (headers, rows) => {
    const headerLine = headers.map(csvCell).join(",");
    const bodyLines = rows.map((row) => row.map(csvCell).join(","));
    return [headerLine, ...bodyLines].join("\r\n");
};

const getCollectionNames = async () => {
    const db = mongoose.connection?.db;
    if (!db) return new Set();
    const cols = await db.listCollections().toArray();
    return new Set(cols.map((c) => c.name));
};

// Safely gather cross-module stats without hard-failing when sibling models aren't merged yet
const gatherSystemSnapshot = async (periodStart) => {
    const db = mongoose.connection?.db;
    const collections = await getCollectionNames();
    const dateMatch = periodStart ? { createdAt: { $gte: periodStart } } : {};

    // 1. Notifications summary
    const [notifAgg, totalNotifCount, unreadNotifCount] = await Promise.all([
        Notification.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: 1 },
                    read: { $sum: { $cond: ["$isRead", 1, 0] } },
                    unread: { $sum: { $cond: ["$isRead", 0, 1] } }
                }
            }
        ]),
        Notification.countDocuments(dateMatch),
        Notification.countDocuments({ ...dateMatch, isRead: false })
    ]);

    const notificationsByType = {};
    let readTotal = 0;
    for (const item of notifAgg) {
        notificationsByType[item._id] = {
            total: item.total,
            read: item.read,
            unread: item.unread
        };
        readTotal += item.read;
    }

    // 2. Content reports summary (FR25)
    const [reportStatusAgg, reportReasonAgg, totalContentReports] = await Promise.all([
        ContentReport.aggregate([
            { $match: dateMatch },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        ContentReport.aggregate([
            { $match: dateMatch },
            { $group: { _id: "$reason", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        ContentReport.countDocuments(dateMatch)
    ]);

    const contentReportsByStatus = { Pending: 0, "Under Review": 0, Resolved: 0, Dismissed: 0 };
    for (const row of reportStatusAgg) {
        contentReportsByStatus[row._id] = row.count;
    }

    // 3. Payments summary (from 'payments' collection if present)
    let paymentSummary = {
        available: false,
        totalCollected: 0,
        advanceCollected: 0,
        monthlyCollected: 0,
        paidCount: 0,
        pendingCount: 0,
        failedCount: 0,
        refundedCount: 0,
        monthlyTrend: [],
        byHostel: []
    };

    if (db && collections.has("payments")) {
        const paymentsCol = db.collection("payments");
        const [payTotals, monthlyTrend, byHostel] = await Promise.all([
            paymentsCol
                .aggregate([
                    { $match: dateMatch },
                    {
                        $group: {
                            _id: null,
                            totalCollected: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] } },
                            advanceCollected: {
                                $sum: {
                                    $cond: [
                                        { $and: [{ $eq: ["$status", "Paid"] }, { $eq: ["$paymentType", "Advance"] }] },
                                        "$amount",
                                        0
                                    ]
                                }
                            },
                            monthlyCollected: {
                                $sum: {
                                    $cond: [
                                        { $and: [{ $eq: ["$status", "Paid"] }, { $eq: ["$paymentType", "Monthly"] }] },
                                        "$amount",
                                        0
                                    ]
                                }
                            },
                            paidCount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] } },
                            pendingCount: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                            failedCount: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } },
                            refundedCount: { $sum: { $cond: [{ $eq: ["$status", "Refunded"] }, 1, 0] } }
                        }
                    }
                ])
                .toArray(),
            paymentsCol
                .aggregate([
                    { $match: { status: "Paid", ...dateMatch } },
                    {
                        $group: {
                            _id: {
                                $ifNull: [
                                    "$month",
                                    { $dateToString: { format: "%Y-%m", date: { $ifNull: ["$paidAt", "$createdAt"] } } }
                                ]
                            },
                            revenue: { $sum: "$amount" },
                            transactions: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } },
                    { $limit: 12 }
                ])
                .toArray(),
            paymentsCol
                .aggregate([
                    { $match: { status: "Paid", ...dateMatch } },
                    {
                        $group: {
                            _id: "$hostelName",
                            revenue: { $sum: "$amount" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { revenue: -1 } },
                    { $limit: 8 }
                ])
                .toArray()
        ]);

        paymentSummary = {
            available: true,
            ...(payTotals[0] || {
                totalCollected: 0,
                advanceCollected: 0,
                monthlyCollected: 0,
                paidCount: 0,
                pendingCount: 0,
                failedCount: 0,
                refundedCount: 0
            }),
            monthlyTrend: monthlyTrend.map((m) => ({ month: m._id, revenue: m.revenue, transactions: m.transactions })),
            byHostel: byHostel.map((h) => ({ hostelName: h._id || "Unknown", revenue: h.revenue, count: h.count }))
        };
    }

    // 4. Reservations summary (from 'reservations' collection if present)
    let reservationSummary = { available: false, total: 0, byStatus: {} };
    if (db && collections.has("reservations")) {
        const resAgg = await db
            .collection("reservations")
            .aggregate([
                { $match: dateMatch },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ])
            .toArray();
        const byStatus = {};
        let total = 0;
        for (const r of resAgg) {
            byStatus[r._id || "Unknown"] = r.count;
            total += r.count;
        }
        reservationSummary = { available: true, total, byStatus };
    }

    // 5. Hostels & Users summary (if collections exist)
    let hostelSummary = { available: false, total: 0, byStatus: {} };
    if (db && collections.has("hostels")) {
        const hostelAgg = await db
            .collection("hostels")
            .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
            .toArray();
        const byStatus = {};
        let total = 0;
        for (const h of hostelAgg) {
            byStatus[h._id || "Unknown"] = h.count;
            total += h.count;
        }
        hostelSummary = { available: true, total, byStatus };
    }

    let userSummary = { available: false, total: 0, byRole: {} };
    if (db && collections.has("users")) {
        const userAgg = await db
            .collection("users")
            .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
            .toArray();
        const byRole = {};
        let total = 0;
        for (const u of userAgg) {
            byRole[u._id || "Student"] = u.count;
            total += u.count;
        }
        userSummary = { available: true, total, byRole };
    }

    return {
        generatedAt: new Date().toISOString(),
        overview: {
            totalNotifications: totalNotifCount,
            unreadNotifications: unreadNotifCount,
            notificationReadRate: totalNotifCount > 0 ? Math.round((readTotal / totalNotifCount) * 100) : 0,
            totalContentReports,
            openContentReports: contentReportsByStatus.Pending + contentReportsByStatus["Under Review"],
            totalRevenueCollected: paymentSummary.totalCollected,
            totalPaymentsPaid: paymentSummary.paidCount,
            totalReservations: reservationSummary.total,
            totalHostels: hostelSummary.total,
            totalUsers: userSummary.total
        },
        payments: paymentSummary,
        reservations: reservationSummary,
        hostels: hostelSummary,
        users: userSummary,
        notifications: {
            total: totalNotifCount,
            unread: unreadNotifCount,
            read: readTotal,
            byType: notificationsByType
        },
        contentReports: {
            total: totalContentReports,
            byStatus: contentReportsByStatus,
            byReason: reportReasonAgg.map((r) => ({ reason: r._id, count: r.count }))
        }
    };
};

// @desc   Basic system reports & analytics summary (Module 9)
// @route  GET /api/reports/summary
export const getSystemReportSummary = async (req, res) => {
    try {
        const period = ["7d", "30d", "90d", "all"].includes(req.query.period) ? req.query.period : "30d";
        const periodStart = getPeriodStartDate(period);
        const snapshot = await gatherSystemSnapshot(periodStart);

        res.status(200).json({
            success: true,
            period,
            ...snapshot
        });
    } catch (error) {
        console.error("SYSTEM REPORT ERROR:", error);
        res.status(500).json({ success: false, message: "Could not generate system report" });
    }
};

// @desc   Export system report as CSV (Module 9: Basic system reports)
// @route  GET /api/reports/export?type=overview|payments|notifications|content-reports
export const exportSystemReportCsv = async (req, res) => {
    try {
        const type = req.query.type || "overview";
        const period = ["7d", "30d", "90d", "all"].includes(req.query.period) ? req.query.period : "30d";
        const periodStart = getPeriodStartDate(period);
        const dateMatch = periodStart ? { createdAt: { $gte: periodStart } } : {};

        let csv = "";
        let filename = `staymate-${type}-report.csv`;

        if (type === "notifications") {
            const rows = await Notification.find(dateMatch).sort({ createdAt: -1 }).limit(1000).lean();
            csv = toCsv(
                ["ID", "Recipient Role", "Type", "Priority", "Title", "Message", "Read", "Created At"],
                rows.map((n) => [
                    n._id,
                    n.recipientRole,
                    n.type,
                    n.priority,
                    n.title,
                    n.message,
                    n.isRead ? "Yes" : "No",
                    n.createdAt ? new Date(n.createdAt).toISOString() : ""
                ])
            );
        } else if (type === "content-reports") {
            const rows = await ContentReport.find(dateMatch).sort({ createdAt: -1 }).limit(1000).lean();
            csv = toCsv(
                ["ID", "Target Type", "Target Name", "Reason", "Reporter", "Status", "Description", "Admin Note", "Created At"],
                rows.map((r) => [
                    r._id,
                    r.targetType,
                    r.targetName,
                    r.reason,
                    r.reporterName,
                    r.status,
                    r.description,
                    r.adminNote || "",
                    r.createdAt ? new Date(r.createdAt).toISOString() : ""
                ])
            );
        } else if (type === "payments") {
            const db = mongoose.connection?.db;
            const collections = await getCollectionNames();
            const rows =
                db && collections.has("payments")
                    ? await db.collection("payments").find(dateMatch).sort({ createdAt: -1 }).limit(1000).toArray()
                    : [];
            csv = toCsv(
                ["Transaction ID", "Hostel", "Room Type", "Payment Type", "Month", "Amount (LKR)", "Status", "Paid At"],
                rows.map((p) => [
                    p.transactionId || p._id,
                    p.hostelName || "",
                    p.roomType || "",
                    p.paymentType || "",
                    p.month || "",
                    p.amount || 0,
                    p.status || "",
                    p.paidAt ? new Date(p.paidAt).toISOString() : ""
                ])
            );
        } else {
            const snapshot = await gatherSystemSnapshot(periodStart);
            const o = snapshot.overview;
            csv = toCsv(
                ["Metric", "Value"],
                [
                    ["Report Period", period],
                    ["Generated At", snapshot.generatedAt],
                    ["Total Revenue Collected (LKR)", o.totalRevenueCollected],
                    ["Paid Transactions", o.totalPaymentsPaid],
                    ["Advance Revenue (LKR)", snapshot.payments.advanceCollected],
                    ["Monthly Rent Revenue (LKR)", snapshot.payments.monthlyCollected],
                    ["Total Reservations", o.totalReservations],
                    ["Total Hostels", o.totalHostels],
                    ["Total Registered Users", o.totalUsers],
                    ["Total Notifications Sent", o.totalNotifications],
                    ["Unread Notifications", o.unreadNotifications],
                    ["Notification Read Rate (%)", o.notificationReadRate],
                    ["Total Content Reports", o.totalContentReports],
                    ["Open Content Reports", o.openContentReports]
                ]
            );
        }

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(csv);
    } catch (error) {
        console.error("EXPORT CSV ERROR:", error);
        res.status(500).json({ success: false, message: "Could not export CSV report" });
    }
};

// @desc   List reported content / listings (FR25)
// @route  GET /api/reports/content
export const getContentReports = async (req, res) => {
    try {
        const { status, targetType, search } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

        const filter = {};
        if (status && VALID_REPORT_STATUS.includes(status)) filter.status = status;
        if (targetType && ["Hostel", "Review", "User"].includes(targetType)) filter.targetType = targetType;
        if (search && search.trim()) {
            const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { targetName: { $regex: safe, $options: "i" } },
                { reason: { $regex: safe, $options: "i" } },
                { description: { $regex: safe, $options: "i" } },
                { reporterName: { $regex: safe, $options: "i" } }
            ];
        }

        const [reports, total, statusCounts] = await Promise.all([
            ContentReport.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            ContentReport.countDocuments(filter),
            ContentReport.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        ]);

        const countsByStatus = { Pending: 0, "Under Review": 0, Resolved: 0, Dismissed: 0 };
        for (const s of statusCounts) countsByStatus[s._id] = s.count;

        res.status(200).json({
            success: true,
            count: reports.length,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
            countsByStatus,
            reports
        });
    } catch (error) {
        console.error("GET CONTENT REPORTS ERROR:", error);
        res.status(500).json({ success: false, message: "Could not load content reports" });
    }
};

// @desc   Submit a report for a listing/review/user and notify Admin
// @route  POST /api/reports/content
export const createContentReport = async (req, res) => {
    try {
        const { targetType, targetName, targetId, reason, description, reporterName, reporterEmail } = req.body;

        if (!targetName || !reason || !description) {
            return res.status(400).json({
                success: false,
                message: "Target name, reason, and description are required"
            });
        }

        const reporterId = req.user?._id?.toString() || req.user?.id || req.body?.reporterId;

        const report = await ContentReport.create({
            reporter: isValidId(reporterId) ? reporterId : undefined,
            reporterName: reporterName || req.user?.name || "StayMate Student",
            reporterEmail: reporterEmail || req.user?.email,
            targetType: targetType || "Hostel",
            targetName,
            targetId,
            reason,
            description
        });

        await sendNotification({
            recipientRole: "Admin",
            title: `New ${report.targetType.toLowerCase()} report: ${report.targetName}`,
            message: `${report.reporterName} reported "${report.targetName}" for "${report.reason}".`,
            type: "report",
            priority: "high",
            actionUrl: "/reports",
            relatedEntity: {
                entityType: "Report",
                entityId: String(report._id),
                label: report.targetName
            },
            metadata: { reason: report.reason, targetType: report.targetType }
        });

        res.status(201).json({
            success: true,
            message: "Report submitted to administrators",
            report
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors)[0].message });
        }
        console.error("CREATE CONTENT REPORT ERROR:", error);
        res.status(500).json({ success: false, message: "Could not submit report" });
    }
};

// @desc   Update content report status (Admin moderation -> FR25)
// @route  PATCH /api/reports/content/:id/status
export const updateContentReportStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;

        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid report id" });
        }
        if (!VALID_REPORT_STATUS.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Pending, Under Review, Resolved, or Dismissed"
            });
        }

        const report = await ContentReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        report.status = status;
        if (adminNote !== undefined) report.adminNote = adminNote;
        if (status === "Resolved" || status === "Dismissed") {
            report.resolvedAt = new Date();
        }
        await report.save();

        if (status === "Resolved" || status === "Dismissed") {
            await sendNotification({
                recipient: report.reporter,
                recipientRole: "Student",
                title: `Your report for ${report.targetName} was ${status.toLowerCase()}`,
                message: adminNote
                    ? `Admin update: ${adminNote}`
                    : `Thank you for helping keep StayMate accurate. Your report has been marked as ${status}.`,
                type: "report",
                priority: "normal",
                actionUrl: "/reports",
                relatedEntity: {
                    entityType: "Report",
                    entityId: String(report._id),
                    label: report.targetName
                }
            });
        }

        res.status(200).json({
            success: true,
            message: `Report marked as ${status}`,
            report
        });
    } catch (error) {
        console.error("UPDATE CONTENT REPORT ERROR:", error);
        res.status(500).json({ success: false, message: "Could not update report status" });
    }
};

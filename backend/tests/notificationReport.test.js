import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import ContentReport from "../models/ContentReport.js";
import {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markNotificationAsRead,
    sendMonthlyReminders
} from "../controllers/notificationController.js";
import {
    createContentReport,
    exportSystemReportCsv,
    getSystemReportSummary,
    updateContentReportStatus
} from "../controllers/reportController.js";

function mockRes() {
    const res = {
        statusCode: 200,
        headers: {},
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        setHeader(k, v) {
            this.headers[k] = v;
        },
        json(data) {
            this.body = data;
            return this;
        },
        send(data) {
            this.body = data;
            return this;
        }
    };
    return res;
}

test("Notification schema validates required fields and enum types", async () => {
    const valid = new Notification({
        recipientRole: "Student",
        title: "Reservation confirmed",
        message: "Your room at Sawbhagya Hostel is confirmed.",
        type: "reservation"
    });
    await valid.validate();

    const invalid = new Notification({
        recipientRole: "Student",
        title: "Bad type",
        message: "Invalid type check",
        type: "unknown_type"
    });
    await assert.rejects(() => invalid.validate(), /unknown_type/);
});

test("ContentReport schema validates required fields and enum reasons", async () => {
    const valid = new ContentReport({
        targetType: "Hostel",
        targetName: "Sawbhagya Hostel",
        reason: "Pricing discrepancy",
        description: "Listed rent differs from actual charge."
    });
    await valid.validate();
});

test("createNotification dispatches reservation notifications for Student and Provider", async () => {
    const originalCreate = Notification.create;
    const createdPayloads = [];
    Notification.create = async (payload) => {
        const doc = { _id: new mongoose.Types.ObjectId(), ...payload };
        createdPayloads.push(doc);
        return doc;
    };

    try {
        const req = {
            body: {
                event: "reservation",
                hostelName: "Sawbhagya Hostel",
                roomType: "Twin sharing",
                status: "Pending",
                studentName: "Nethmi Perera"
            }
        };
        const res = mockRes();
        await createNotification(req, res);

        assert.equal(res.statusCode, 201);
        assert.equal(res.body.success, true);
        assert.equal(createdPayloads.length, 2);
        assert.equal(createdPayloads[0].recipientRole, "Student");
        assert.equal(createdPayloads[1].recipientRole, "Provider");
        assert.equal(createdPayloads[0].type, "reservation");
    } finally {
        Notification.create = originalCreate;
    }
});

test("sendMonthlyReminders skips duplicates for the same month and creates new ones", async () => {
    const originalFindOne = Notification.findOne;
    const originalCreate = Notification.create;
    const created = [];

    Notification.findOne = async ({ "metadata.hostelName": hostelName }) => {
        if (hostelName === "Already Reminded Hostel") return { _id: "existing" };
        return null;
    };
    Notification.create = async (payload) => {
        created.push(payload);
        return payload;
    };

    try {
        const req = {
            body: {
                month: "2026-12",
                dueDay: 5,
                targets: [
                    { hostelName: "Already Reminded Hostel", amount: 9000 },
                    { hostelName: "Sawbhagya Hostel", amount: 10000 }
                ]
            }
        };
        const res = mockRes();
        await sendMonthlyReminders(req, res);

        assert.equal(res.statusCode, 201);
        assert.equal(res.body.created.length, 1);
        assert.equal(res.body.skipped.length, 1);
        assert.equal(created[0].type, "payment_reminder");
        assert.equal(created[0].metadata.dueDate, "2026-12-05");
    } finally {
        Notification.findOne = originalFindOne;
        Notification.create = originalCreate;
    }
});

test("markNotificationAsRead and markAllAsRead handle validation and updates", async () => {
    const badReq = { params: { id: "not-an-id" } };
    const badRes = mockRes();
    await markNotificationAsRead(badReq, badRes);
    assert.equal(badRes.statusCode, 400);

    const originalFindById = Notification.findById;
    let saved = false;
    Notification.findById = async () => ({
        _id: new mongoose.Types.ObjectId(),
        isRead: false,
        async markAsRead() {
            this.isRead = true;
            saved = true;
        }
    });

    try {
        const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
        const res = mockRes();
        await markNotificationAsRead(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(saved, true);
    } finally {
        Notification.findById = originalFindById;
    }

    const originalUpdateMany = Notification.updateMany;
    Notification.updateMany = async () => ({ modifiedCount: 3 });
    try {
        const req = { query: { role: "Admin" } };
        const res = mockRes();
        await markAllAsRead(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.modifiedCount, 3);
    } finally {
        Notification.updateMany = originalUpdateMany;
    }
});

test("getNotifications and getUnreadCount return paginated summary", async () => {
    const originalFind = Notification.find;
    const originalCount = Notification.countDocuments;
    const originalAgg = Notification.aggregate;

    Notification.find = () => ({
        sort: () => ({
            skip: () => ({
                limit: async () => [{ _id: "1", title: "Rent due", type: "payment_reminder", isRead: false }]
            })
        })
    });
    Notification.countDocuments = async () => 1;
    Notification.aggregate = async () => [{ _id: "payment_reminder", total: 1, unread: 1 }];

    try {
        const res = mockRes();
        await getNotifications({ query: { role: "Student" } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.unreadCount, 1);
        assert.equal(res.body.countsByType.payment_reminder.unread, 1);

        const countRes = mockRes();
        await getUnreadCount({ query: { role: "Student" } }, countRes);
        assert.equal(countRes.statusCode, 200);
        assert.equal(countRes.body.unreadCount, 1);
    } finally {
        Notification.find = originalFind;
        Notification.countDocuments = originalCount;
        Notification.aggregate = originalAgg;
    }
});

test("exportSystemReportCsv escapes CSV formula injection and sets attachment headers", async () => {
    const originalFind = ContentReport.find;
    ContentReport.find = () => ({
        sort: () => ({
            limit: () => ({
                lean: async () => [
                    {
                        _id: "r1",
                        targetType: "Hostel",
                        targetName: "=CMD|'/C calc'!A0",
                        reason: "Other",
                        reporterName: "Student",
                        status: "Pending",
                        description: "Test formula escape",
                        adminNote: "",
                        createdAt: new Date("2026-11-26T00:00:00Z")
                    }
                ]
            })
        })
    });

    try {
        const res = mockRes();
        await exportSystemReportCsv({ query: { type: "content-reports", period: "30d" } }, res);
        assert.equal(res.statusCode, 200);
        assert.match(res.headers["Content-Type"], /text\/csv/);
        assert.ok(res.body.includes('"\'=CMD|'));
    } finally {
        ContentReport.find = originalFind;
    }
});

test("getSystemReportSummary and content report lifecycle work cleanly", async () => {
    const origNotifAgg = Notification.aggregate;
    const origNotifCount = Notification.countDocuments;
    const origReportAgg = ContentReport.aggregate;
    const origReportCount = ContentReport.countDocuments;
    const origReportCreate = ContentReport.create;
    const origReportFindById = ContentReport.findById;
    const origNotifCreate = Notification.create;

    Notification.aggregate = async () => [{ _id: "payment", total: 2, read: 1, unread: 1 }];
    Notification.countDocuments = async () => 2;
    ContentReport.aggregate = async () => [{ _id: "Pending", count: 1 }];
    ContentReport.countDocuments = async () => 1;
    ContentReport.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
    Notification.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

    let savedStatus = null;
    ContentReport.findById = async () => ({
        _id: new mongoose.Types.ObjectId(),
        targetName: "Sawbhagya Hostel",
        status: "Pending",
        async save() {
            savedStatus = this.status;
        }
    });

    try {
        const sumRes = mockRes();
        await getSystemReportSummary({ query: { period: "30d" } }, sumRes);
        assert.equal(sumRes.statusCode, 200);
        assert.equal(sumRes.body.overview.totalNotifications, 2);

        const createRes = mockRes();
        await createContentReport(
            {
                body: {
                    targetType: "Hostel",
                    targetName: "Sawbhagya Hostel",
                    reason: "Pricing discrepancy",
                    description: "Price mismatch check"
                }
            },
            createRes
        );
        assert.equal(createRes.statusCode, 201);

        const modRes = mockRes();
        await updateContentReportStatus(
            {
                params: { id: new mongoose.Types.ObjectId().toString() },
                body: { status: "Resolved", adminNote: "Verified and updated." }
            },
            modRes
        );
        assert.equal(modRes.statusCode, 200);
        assert.equal(savedStatus, "Resolved");
    } finally {
        Notification.aggregate = origNotifAgg;
        Notification.countDocuments = origNotifCount;
        ContentReport.aggregate = origReportAgg;
        ContentReport.countDocuments = origReportCount;
        ContentReport.create = origReportCreate;
        ContentReport.findById = origReportFindById;
        Notification.create = origNotifCreate;
    }
});

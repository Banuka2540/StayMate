// Payment controller - all the logic for payments
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";

// ---------- helpers ----------

// Until login is finished, the student id comes from the request.
// Once authMiddleware sets req.user, that is used instead (safer).
const getStudentId = (req) =>
    req.user?._id?.toString() || req.user?.id || req.body?.studentId || req.query?.studentId;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Creates a receipt number like SM-20261118-4F7A2C
const makeTransactionId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `SM-${date}-${random}`;
};

// SIMULATED payment gateway (no real money is charged).
// A card ending in 0002 is declined so you can demo a failed payment.
// Replace this function with PayHere / Stripe later if needed.
const processWithGateway = async ({ cardLast4 }) => {
    if (cardLast4 === "0002") {
        return { success: false, message: "Card was declined by the bank" };
    }
    return { success: true };
};

// ---------- controllers ----------

// @desc   Make a payment (advance or monthly rent)   -> FR08, FR09
// @route  POST /api/payments
// @access Student
export const createPayment = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { reservation, hostelName, roomType, paymentType, month, amount, cardLast4 } = req.body;

        if (!studentId || !isValidId(studentId)) {
            return res.status(401).json({ success: false, message: "Please log in to make a payment" });
        }
        if (!["Advance", "Monthly"].includes(paymentType)) {
            return res.status(400).json({ success: false, message: "Payment type must be Advance or Monthly" });
        }
        if (!hostelName) {
            return res.status(400).json({ success: false, message: "Hostel name is required" });
        }
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Enter a valid amount" });
        }
        if (!cardLast4 || !/^\d{4}$/.test(cardLast4)) {
            return res.status(400).json({ success: false, message: "Card details are missing" });
        }
        if (reservation && !isValidId(reservation)) {
            return res.status(400).json({ success: false, message: "Invalid reservation id" });
        }

        // Stop double payments
        const sameBooking = reservation ? { reservation } : { hostelName };
        if (paymentType === "Advance") {
            const alreadyPaid = await Payment.findOne({
                student: studentId, paymentType: "Advance", status: "Paid", ...sameBooking
            });
            if (alreadyPaid) {
                return res.status(409).json({ success: false, message: "Advance payment has already been made for this booking" });
            }
        } else {
            if (!month) {
                return res.status(400).json({ success: false, message: "Select the month you are paying for" });
            }
            const alreadyPaid = await Payment.findOne({
                student: studentId, paymentType: "Monthly", month, status: "Paid", ...sameBooking
            });
            if (alreadyPaid) {
                return res.status(409).json({ success: false, message: `Rent for ${month} has already been paid` });
            }
        }

        // Save as Pending first, then send to the gateway
        const payment = await Payment.create({
            student: studentId,
            reservation,
            hostelName,
            roomType,
            paymentType,
            month: paymentType === "Monthly" ? month : undefined,
            amount: Number(amount),
            cardLast4,
            status: "Pending",
            transactionId: makeTransactionId()
        });

        const result = await processWithGateway({ cardLast4, amount });

        if (result.success) {
            payment.status = "Paid";
            payment.paidAt = new Date();
        } else {
            payment.status = "Failed";
            payment.note = result.message;
        }
        await payment.save();

        // TODO (team): when the Reservation model exists, mark the reservation
        // as confirmed here after a successful Advance payment.

        if (!result.success) {
            return res.status(402).json({ success: false, message: result.message, payment });
        }

        res.status(201).json({ success: true, message: "Payment successful", payment });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: Object.values(error.errors)[0].message });
        }
        console.error("CREATE PAYMENT ERROR:", error);
        res.status(500).json({ success: false, message: "Payment could not be processed" });
    }
};

// @desc   Get the logged-in student's payment history   -> FR10
// @route  GET /api/payments/my?paymentType=Monthly
// @access Student
export const getMyPayments = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId || !isValidId(studentId)) {
            return res.status(401).json({ success: false, message: "Please log in to view payments" });
        }

        const filter = { student: studentId };
        if (req.query.paymentType) filter.paymentType = req.query.paymentType;
        if (req.query.status) filter.status = req.query.status;

        const payments = await Payment.find(filter).sort({ createdAt: -1 });

        const totalPaid = payments
            .filter((p) => p.status === "Paid")
            .reduce((sum, p) => sum + p.amount, 0);

        res.status(200).json({ success: true, count: payments.length, totalPaid, payments });
    } catch (error) {
        console.error("GET MY PAYMENTS ERROR:", error);
        res.status(500).json({ success: false, message: "Could not load payment history" });
    }
};

// @desc   Get one payment (receipt)
// @route  GET /api/payments/:id
// @access Student (own payment) / Admin
export const getPaymentById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid payment id" });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // A student can only see their own payment
        if (req.user && req.user.role !== "Admin" && payment.student.toString() !== getStudentId(req)) {
            return res.status(403).json({ success: false, message: "Not allowed to view this payment" });
        }

        res.status(200).json({ success: true, payment });
    } catch (error) {
        console.error("GET PAYMENT ERROR:", error);
        res.status(500).json({ success: false, message: "Could not load payment" });
    }
};

// @desc   Get all payment records with totals   -> FR24
// @route  GET /api/payments?status=Paid&paymentType=Advance&search=palm&page=1&limit=20
// @access Admin
export const getAllPayments = async (req, res) => {
    try {
        const { status, paymentType, search } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const filter = {};
        if (status) filter.status = status;
        if (paymentType) filter.paymentType = paymentType;
        if (search) {
            // escape special characters so the search text is treated literally
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { hostelName: { $regex: safe, $options: "i" } },
                { transactionId: { $regex: safe, $options: "i" } }
            ];
        }

        const [payments, total, summary] = await Promise.all([
            Payment.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Payment.countDocuments(filter),
            Payment.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCollected: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] } },
                        advanceCollected: {
                            $sum: { $cond: [{ $and: [{ $eq: ["$status", "Paid"] }, { $eq: ["$paymentType", "Advance"] }] }, "$amount", 0] }
                        },
                        monthlyCollected: {
                            $sum: { $cond: [{ $and: [{ $eq: ["$status", "Paid"] }, { $eq: ["$paymentType", "Monthly"] }] }, "$amount", 0] }
                        },
                        paidCount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] } },
                        failedCount: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } },
                        refundedCount: { $sum: { $cond: [{ $eq: ["$status", "Refunded"] }, 1, 0] } }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
            summary: summary[0] || {
                totalCollected: 0, advanceCollected: 0, monthlyCollected: 0,
                paidCount: 0, failedCount: 0, refundedCount: 0
            },
            payments
        });
    } catch (error) {
        console.error("GET ALL PAYMENTS ERROR:", error);
        res.status(500).json({ success: false, message: "Could not load payment records" });
    }
};

// @desc   Change a payment's status (e.g. refund)
// @route  PATCH /api/payments/:id/status   body: { status: "Refunded", note: "Booking cancelled" }
// @access Admin
export const updatePaymentStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid payment id" });
        }
        if (!["Paid", "Failed", "Refunded"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be Paid, Failed or Refunded" });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        if (status === "Refunded" && payment.status !== "Paid") {
            return res.status(400).json({ success: false, message: "Only paid payments can be refunded" });
        }

        payment.status = status;
        if (status === "Paid" && !payment.paidAt) payment.paidAt = new Date();
        if (note) payment.note = note;
        await payment.save();

        res.status(200).json({ success: true, message: `Payment marked as ${status}`, payment });
    } catch (error) {
        console.error("UPDATE PAYMENT ERROR:", error);
        res.status(500).json({ success: false, message: "Could not update payment" });
    }
};
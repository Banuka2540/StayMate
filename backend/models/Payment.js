// Payment model - stores every advance payment and monthly rent payment
// Covers FR08 (advance payment), FR09 (monthly rent), FR10 (history), FR24 (admin records)
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // The student who paid
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student is required"]
        },

        // The reservation this payment belongs to
        // (optional until the Reservation model is built by the team)
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation"
        },

        // Saved as text so history still shows correctly
        // even if the hostel listing is changed or deleted later
        hostelName: {
            type: String,
            required: [true, "Hostel name is required"],
            trim: true
        },

        roomType: {
            type: String,
            trim: true
        },

        // "Advance" = paid when reserving a room, "Monthly" = monthly rent
        paymentType: {
            type: String,
            enum: ["Advance", "Monthly"],
            required: [true, "Payment type is required"]
        },

        // Which month the rent is for, e.g. "2026-12" (only for Monthly payments)
        month: {
            type: String,
            match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must look like 2026-12"],
            required: [
                function () { return this.paymentType === "Monthly"; },
                "Month is required for monthly rent"
            ]
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [1, "Amount must be more than 0"]
        },

        currency: {
            type: String,
            default: "LKR"
        },

        method: {
            type: String,
            enum: ["Card"],
            default: "Card"
        },

        // Only the last 4 digits are stored. Never store the full card number or CVV.
        cardLast4: {
            type: String,
            match: [/^\d{4}$/, "Card last 4 digits are invalid"]
        },

        status: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending"
        },

        // Receipt / reference number shown to the student, e.g. "SM-20261118-4F7A2C"
        transactionId: {
            type: String,
            unique: true
        },

        paidAt: {
            type: Date
        },

        // Admin note, e.g. reason for a refund
        note: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

// Faster lookups for "my payments" and admin filters
paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ status: 1, paymentType: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
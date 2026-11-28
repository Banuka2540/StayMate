// Payment routes - all start with /api/payments (see server.js)
import express from "express";
import {
    createPayment,
    getMyPayments,
    getPaymentById,
    getAllPayments,
    updatePaymentStatus
} from "../controllers/paymentController.js";

// TODO (team): when authMiddleware.js and roleMiddleware.js are finished,
// import them and add them to the routes like this:
//   router.post("/", protect, createPayment);
//   router.get("/", protect, authorize("Admin"), getAllPayments);

const router = express.Router();

// Student
router.post("/", createPayment);            // FR08 + FR09: make a payment
router.get("/my", getMyPayments);           // FR10: my payment history

// Admin
router.get("/", getAllPayments);            // FR24: all payment records
router.patch("/:id/status", updatePaymentStatus);

// Student (own) / Admin - keep this last so "/my" is not read as an id
router.get("/:id", getPaymentById);

export default router;
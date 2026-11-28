import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const toValidObjectId = (id) =>
    id && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined;

/**
 * Core +sendNotification() helper matching the Class Diagram.
 * Can be imported and invoked by Reservation, Payment, Hostel, and Admin controllers.
 */
export async function sendNotification({
    recipient,
    recipientRole = "Student",
    title,
    message,
    type = "system",
    priority = "normal",
    actionUrl = "/notifications",
    relatedEntity = { entityType: "System" },
    metadata = {}
}) {
    const payload = {
        recipient: toValidObjectId(recipient),
        recipientRole,
        title,
        message,
        type,
        priority,
        actionUrl,
        relatedEntity,
        metadata
    };

    return Notification.create(payload);
}

/**
 * Dispatch reservation lifecycle notifications (Module 9: Reservation notifications)
 * Notifies both the student and the hostel provider when appropriate.
 */
export async function notifyReservationEvent({
    studentId,
    providerId,
    studentName = "A student",
    hostelName,
    roomType = "Room",
    status = "Pending",
    reservationId,
    moveInDate
}) {
    const notifications = [];
    const dateLabel = moveInDate ? ` (move-in ${moveInDate})` : "";

    const studentMessages = {
        Pending: {
            title: `Reservation request sent for ${hostelName}`,
            message: `Your reservation request for ${roomType} at ${hostelName}${dateLabel} has been submitted and is awaiting host confirmation.`,
            priority: "normal"
        },
        Confirmed: {
            title: `Reservation confirmed at ${hostelName}`,
            message: `Great news! Your ${roomType} reservation at ${hostelName}${dateLabel} is now confirmed.`,
            priority: "high"
        },
        Cancelled: {
            title: `Reservation cancelled for ${hostelName}`,
            message: `Your reservation for ${roomType} at ${hostelName} has been cancelled.`,
            priority: "high"
        }
    };

    const studentCopy = studentMessages[status] || {
        title: `Reservation updated: ${hostelName}`,
        message: `Your reservation status for ${roomType} at ${hostelName} changed to ${status}.`,
        priority: "normal"
    };

    notifications.push(
        await sendNotification({
            recipient: studentId,
            recipientRole: "Student",
            title: studentCopy.title,
            message: studentCopy.message,
            type: "reservation",
            priority: studentCopy.priority,
            actionUrl: "/booking",
            relatedEntity: {
                entityType: "Reservation",
                entityId: reservationId ? String(reservationId) : undefined,
                label: hostelName
            },
            metadata: { hostelName, roomType, status, moveInDate }
        })
    );

    if (status === "Pending" || status === "Cancelled") {
        notifications.push(
            await sendNotification({
                recipient: providerId,
                recipientRole: "Provider",
                title:
                    status === "Pending"
                        ? `New reservation request at ${hostelName}`
                        : `Reservation cancelled at ${hostelName}`,
                message:
                    status === "Pending"
                        ? `${studentName} requested a ${roomType} bed at ${hostelName}${dateLabel}. Review and confirm within 24 hours.`
                        : `${studentName} cancelled their ${roomType} reservation at ${hostelName}. Room availability has been updated.`,
                type: "reservation",
                priority: "high",
                actionUrl: "/booking",
                relatedEntity: {
                    entityType: "Reservation",
                    entityId: reservationId ? String(reservationId) : undefined,
                    label: hostelName
                },
                metadata: { hostelName, roomType, status, studentName, moveInDate }
            })
        );
    }

    return notifications;
}

/**
 * Dispatch payment lifecycle notifications (Module 9: Payment notifications)
 */
export async function notifyPaymentEvent({
    studentId,
    providerId,
    hostelName,
    paymentType = "Advance",
    month,
    amount,
    status = "Paid",
    transactionId,
    paymentId
}) {
    const notifications = [];
    const formattedAmount = `LKR ${Number(amount || 0).toLocaleString()}`;
    const periodLabel = paymentType === "Monthly" && month ? ` for ${month}` : "";

    if (status === "Paid") {
        notifications.push(
            await sendNotification({
                recipient: studentId,
                recipientRole: "Student",
                title: `${paymentType} payment confirmed (${formattedAmount})`,
                message: `Your ${paymentType.toLowerCase()} payment of ${formattedAmount}${periodLabel} for ${hostelName} succeeded. Receipt: ${transactionId || "Recorded"}.`,
                type: "payment",
                priority: "normal",
                actionUrl: "/payments",
                relatedEntity: {
                    entityType: "Payment",
                    entityId: paymentId ? String(paymentId) : undefined,
                    label: transactionId || hostelName
                },
                metadata: { hostelName, paymentType, month, amount, status, transactionId }
            })
        );

        notifications.push(
            await sendNotification({
                recipient: providerId,
                recipientRole: "Provider",
                title: `Payment received: ${formattedAmount} for ${hostelName}`,
                message: `A student completed a ${paymentType.toLowerCase()} payment of ${formattedAmount}${periodLabel} for ${hostelName}. Reference: ${transactionId || "Recorded"}.`,
                type: "payment",
                priority: "normal",
                actionUrl: "/reports",
                relatedEntity: {
                    entityType: "Payment",
                    entityId: paymentId ? String(paymentId) : undefined,
                    label: transactionId || hostelName
                },
                metadata: { hostelName, paymentType, month, amount, status, transactionId }
            })
        );
    } else if (status === "Failed") {
        notifications.push(
            await sendNotification({
                recipient: studentId,
                recipientRole: "Student",
                title: `Payment failed for ${hostelName}`,
                message: `Your ${paymentType.toLowerCase()} payment of ${formattedAmount}${periodLabel} could not be completed. No money was deducted. Please verify your card details and retry.`,
                type: "payment",
                priority: "high",
                actionUrl: "/payments",
                relatedEntity: {
                    entityType: "Payment",
                    entityId: paymentId ? String(paymentId) : undefined,
                    label: hostelName
                },
                metadata: { hostelName, paymentType, month, amount, status, transactionId }
            })
        );
    } else if (status === "Refunded") {
        notifications.push(
            await sendNotification({
                recipient: studentId,
                recipientRole: "Student",
                title: `Refund processed (${formattedAmount})`,
                message: `Your ${paymentType.toLowerCase()} payment of ${formattedAmount} for ${hostelName} (${transactionId || "reference"}) has been marked as refunded.`,
                type: "payment",
                priority: "high",
                actionUrl: "/payments",
                relatedEntity: {
                    entityType: "Payment",
                    entityId: paymentId ? String(paymentId) : undefined,
                    label: transactionId || hostelName
                },
                metadata: { hostelName, paymentType, month, amount, status, transactionId }
            })
        );
    }

    return notifications;
}

/**
 * Dispatch hostel listing approval notifications (Module 9: Listing approval notifications)
 */
export async function notifyListingApprovalEvent({
    providerId,
    hostelName,
    hostelId,
    status = "Approved",
    reason
}) {
    const notifications = [];

    const copy = {
        Approved: {
            title: `Listing approved: ${hostelName}`,
            message: `${hostelName} has been verified by StayMate administrators and is now visible to students in search results.`,
            priority: "high"
        },
        Rejected: {
            title: `Listing needs updates: ${hostelName}`,
            message: `${hostelName} was not approved.${reason ? ` Reason: ${reason}` : " Please review listing details and photos, then resubmit."}`,
            priority: "high"
        },
        Pending: {
            title: `Listing submitted for review: ${hostelName}`,
            message: `${hostelName} has been received and is queued for administrator verification.`,
            priority: "normal"
        }
    };

    const selected = copy[status] || copy.Pending;

    notifications.push(
        await sendNotification({
            recipient: providerId,
            recipientRole: "Provider",
            title: selected.title,
            message: selected.message,
            type: "listing_approval",
            priority: selected.priority,
            actionUrl: `/stay/${encodeURIComponent(hostelName)}`,
            relatedEntity: {
                entityType: "Hostel",
                entityId: hostelId ? String(hostelId) : undefined,
                label: hostelName
            },
            metadata: { hostelName, status, reason }
        })
    );

    if (status === "Pending") {
        notifications.push(
            await sendNotification({
                recipientRole: "Admin",
                title: `New hostel awaiting approval: ${hostelName}`,
                message: `A hostel provider submitted "${hostelName}" for verification and listing approval.`,
                type: "listing_approval",
                priority: "normal",
                actionUrl: "/reports",
                relatedEntity: {
                    entityType: "Hostel",
                    entityId: hostelId ? String(hostelId) : undefined,
                    label: hostelName
                },
                metadata: { hostelName, status }
            })
        );
    }

    return notifications;
}

/**
 * Dispatch monthly payment reminders (Module 9: Monthly payment reminders)
 * Checks existing payments and existing reminders for the target month to prevent duplicate alerts.
 */
export async function dispatchMonthlyPaymentReminders({
    month,
    dueDay = 5,
    targets = []
}) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const db = mongoose.connection?.db;

    let candidates = targets;

    // If no explicit targets passed, inspect live reservations/payments if available,
    // or fall back to Sawbhagya Hostel / Palm Grove active boarder defaults
    if (!candidates.length && db) {
        try {
            const collections = await db.listCollections().toArray();
            const names = collections.map((c) => c.name);

            if (names.includes("reservations")) {
                const activeReservations = await db
                    .collection("reservations")
                    .find({ status: { $in: ["Confirmed", "Active", "confirmed", "active"] } })
                    .limit(50)
                    .toArray();

                candidates = activeReservations.map((r) => ({
                    studentId: r.student ? String(r.student) : undefined,
                    hostelName: r.hostelName || "Assigned Hostel",
                    roomType: r.roomType || "Room",
                    amount: r.monthlyRent || 10000
                }));
            }
        } catch {
            // Safe fallback if reservations collection is absent
        }
    }

    if (!candidates.length) {
        candidates = [
            {
                hostelName: "Sawbhagya Hostel",
                roomType: "Twin sharing",
                amount: 10000
            },
            {
                hostelName: "Palm Grove Student Residence",
                roomType: "Twin sharing",
                amount: 8000
            }
        ];
    }

    // Check which targets already paid this month
    const paidSet = new Set();
    if (db) {
        try {
            const collections = await db.listCollections().toArray();
            if (collections.some((c) => c.name === "payments")) {
                const paidDocs = await db
                    .collection("payments")
                    .find({ paymentType: "Monthly", month: targetMonth, status: "Paid" })
                    .toArray();
                for (const p of paidDocs) {
                    paidSet.add(`${p.student ? String(p.student) : "anon"}::${p.hostelName}`);
                }
            }
        } catch {
            // Ignore if payments collection not ready
        }
    }

    const created = [];
    const skipped = [];

    for (const item of candidates) {
        const key = `${item.studentId || "anon"}::${item.hostelName}`;
        if (paidSet.has(key)) {
            skipped.push({ hostelName: item.hostelName, reason: "Already paid for this month" });
            continue;
        }

        // Prevent duplicate reminder for same student/hostel/month
        const existingReminder = await Notification.findOne({
            type: "payment_reminder",
            recipientRole: "Student",
            "metadata.month": targetMonth,
            "metadata.hostelName": item.hostelName,
            ...(toValidObjectId(item.studentId) ? { recipient: toValidObjectId(item.studentId) } : {})
        });

        if (existingReminder) {
            skipped.push({ hostelName: item.hostelName, reason: "Reminder already sent for this month" });
            continue;
        }

        const formattedAmount = `LKR ${Number(item.amount || 0).toLocaleString()}`;
        const dueDate = `${targetMonth}-${String(dueDay).padStart(2, "0")}`;

        const notification = await sendNotification({
            recipient: item.studentId,
            recipientRole: "Student",
            title: `Monthly rent reminder due ${dueDate}`,
            message: `Your monthly rent of ${formattedAmount} for ${item.hostelName} (${item.roomType || "Room"}) for ${targetMonth} is due by ${dueDate}. Pay online to keep your booking up to date.`,
            type: "payment_reminder",
            priority: "high",
            actionUrl: "/payments",
            relatedEntity: {
                entityType: "Payment",
                label: item.hostelName
            },
            metadata: {
                hostelName: item.hostelName,
                roomType: item.roomType,
                month: targetMonth,
                amount: Number(item.amount || 0),
                dueDate
            }
        });

        created.push(notification);
    }

    return { month: targetMonth, created, skipped };
}

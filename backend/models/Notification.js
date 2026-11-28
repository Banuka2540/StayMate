import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        // Optional link to User document; supports string/ObjectId or role-wide notifications
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },

        // Role targeted by this notification (Student, Provider, Admin)
        recipientRole: {
            type: String,
            enum: ["Student", "Provider", "Admin"],
            default: "Student",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
            maxlength: [160, "Title cannot exceed 160 characters"]
        },

        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true,
            maxlength: [1000, "Message cannot exceed 1000 characters"]
        },

        // Covers Module 9 functions:
        // reservation, payment, payment_reminder, listing_approval, report, system
        type: {
            type: String,
            enum: [
                "reservation",
                "payment",
                "payment_reminder",
                "listing_approval",
                "report",
                "system"
            ],
            required: [true, "Notification type is required"],
            index: true
        },

        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal"
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true
        },

        readAt: {
            type: Date
        },

        actionUrl: {
            type: String,
            trim: true
        },

        relatedEntity: {
            entityType: {
                type: String,
                enum: ["Reservation", "Payment", "Hostel", "Report", "User", "System"],
                default: "System"
            },
            entityId: {
                type: String,
                trim: true
            },
            label: {
                type: String,
                trim: true
            }
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

// Fast queries for notification center and unread bell counter
notificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Matches Class Diagram +markAsRead()
notificationSchema.methods.markAsRead = async function () {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

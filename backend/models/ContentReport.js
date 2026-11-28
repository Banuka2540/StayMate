import mongoose from "mongoose";

// Content / Listing Report model
// Supports FR25 (manage reported content) and Module 9 reporting
const contentReportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        reporterName: {
            type: String,
            trim: true,
            default: "StayMate Student"
        },

        reporterEmail: {
            type: String,
            trim: true
        },

        targetType: {
            type: String,
            enum: ["Hostel", "Review", "User"],
            default: "Hostel",
            required: true
        },

        targetName: {
            type: String,
            required: [true, "Target name is required"],
            trim: true
        },

        targetId: {
            type: String,
            trim: true
        },

        reason: {
            type: String,
            enum: [
                "Inaccurate listing",
                "Fake or misleading photos",
                "Safety concern",
                "Pricing discrepancy",
                "Inappropriate content",
                "Other"
            ],
            required: [true, "Report reason is required"]
        },

        description: {
            type: String,
            required: [true, "Please describe the issue"],
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"]
        },

        status: {
            type: String,
            enum: ["Pending", "Under Review", "Resolved", "Dismissed"],
            default: "Pending",
            index: true
        },

        adminNote: {
            type: String,
            trim: true,
            maxlength: [500, "Admin note cannot exceed 500 characters"]
        },

        resolvedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

contentReportSchema.index({ status: 1, createdAt: -1 });

const ContentReport = mongoose.model("ContentReport", contentReportSchema);

export default ContentReport;

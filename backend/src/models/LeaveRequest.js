const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fromDate: { type: String, required: true }, // YYYY-MM-DD
    toDate: { type: String, required: true }, // YYYY-MM-DD
    reason: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

module.exports = { LeaveRequest };


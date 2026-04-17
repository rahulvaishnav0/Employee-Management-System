const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = { Attendance };


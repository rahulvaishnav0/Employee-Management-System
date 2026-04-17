const mongoose = require("mongoose");

const salaryRecordSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    amount: { type: Number, required: true, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

salaryRecordSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const SalaryRecord = mongoose.model("SalaryRecord", salaryRecordSchema);

module.exports = { SalaryRecord };


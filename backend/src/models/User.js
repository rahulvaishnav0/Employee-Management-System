const mongoose = require("mongoose");

const ROLES = ["admin", "hr", "employee"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: "employee" },

    department: { type: String, trim: true, default: "" },
    position: { type: String, trim: true, default: "" },
    baseSalaryMonthly: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = { User, ROLES };


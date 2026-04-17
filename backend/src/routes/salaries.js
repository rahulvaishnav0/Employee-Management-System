const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { SalaryRecord } = require("../models/SalaryRecord");

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole(["admin", "hr"]), async (req, res) => {
  const schema = z.object({
    employeeId: z.string().min(1),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    amount: z.number().nonnegative(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { employeeId, month, year, amount } = parsed.data;
  const doc = await SalaryRecord.findOneAndUpdate(
    { employeeId, month, year },
    { employeeId, month, year, amount, createdBy: req.user._id },
    { new: true, upsert: true }
  );
  return res.json({ salary: doc });
});

router.get("/me", requireRole(["employee"]), async (req, res) => {
  const records = await SalaryRecord.find({ employeeId: req.user._id }).sort({ year: -1, month: -1 });
  return res.json({ records });
});

router.get("/employee/:employeeId", requireRole(["admin", "hr"]), async (req, res) => {
  const records = await SalaryRecord.find({ employeeId: req.params.employeeId }).sort({ year: -1, month: -1 });
  return res.json({ records });
});

module.exports = { salariesRouter: router };


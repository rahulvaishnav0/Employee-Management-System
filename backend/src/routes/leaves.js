const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { LeaveRequest } = require("../models/LeaveRequest");

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRole(["employee"]), async (req, res) => {
  const schema = z.object({
    fromDate: z.string().min(8),
    toDate: z.string().min(8),
    reason: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const doc = await LeaveRequest.create({
    employeeId: req.user._id,
    fromDate: parsed.data.fromDate,
    toDate: parsed.data.toDate,
    reason: parsed.data.reason || "",
  });
  return res.status(201).json({ leave: doc });
});

router.get("/me", requireRole(["employee"]), async (req, res) => {
  const records = await LeaveRequest.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ records });
});

router.get("/", requireRole(["admin", "hr"]), async (_req, res) => {
  const records = await LeaveRequest.find({})
    .populate("employeeId", "name email role")
    .sort({ createdAt: -1 });
  return res.json({ records });
});

router.post("/:id/approve", requireRole(["admin", "hr"]), async (req, res) => {
  const doc = await LeaveRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Leave not found" });
  doc.status = "approved";
  doc.reviewedBy = req.user._id;
  await doc.save();
  return res.json({ leave: doc });
});

router.post("/:id/reject", requireRole(["admin", "hr"]), async (req, res) => {
  const schema = z.object({ note: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const doc = await LeaveRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Leave not found" });
  doc.status = "rejected";
  doc.reviewedBy = req.user._id;
  doc.reviewNote = parsed.data.note || "";
  await doc.save();
  return res.json({ leave: doc });
});

module.exports = { leavesRouter: router };


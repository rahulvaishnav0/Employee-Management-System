const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Attendance } = require("../models/Attendance");

const router = express.Router();

router.use(requireAuth);

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.post("/check-in", requireRole(["employee"]), async (req, res) => {
  const date = todayStr();
  const now = new Date();

  const doc = await Attendance.findOneAndUpdate(
    { employeeId: req.user._id, date },
    { $setOnInsert: { employeeId: req.user._id, date }, $set: { checkInAt: now } },
    { new: true, upsert: true }
  );

  return res.json({ attendance: doc });
});

router.post("/check-out", requireRole(["employee"]), async (req, res) => {
  const date = todayStr();
  const now = new Date();
  const doc = await Attendance.findOne({ employeeId: req.user._id, date });
  if (!doc || !doc.checkInAt) return res.status(400).json({ message: "Check-in required first" });
  if (doc.checkOutAt) return res.status(400).json({ message: "Already checked out" });

  doc.checkOutAt = now;
  await doc.save();
  return res.json({ attendance: doc });
});

router.get("/me", requireRole(["employee"]), async (req, res) => {
  const records = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
  return res.json({ records });
});

router.get("/", requireRole(["admin", "hr"]), async (req, res) => {
  const schema = z.object({ date: z.string().optional(), employeeId: z.string().optional() });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: "Invalid query" });
  const { date, employeeId } = parsed.data;

  const filter = {};
  if (date) filter.date = date;
  if (employeeId) filter.employeeId = employeeId;

  const records = await Attendance.find(filter).populate("employeeId", "name email role").sort({ date: -1 });
  return res.json({ records });
});

router.post("/:id/reject", requireRole(["hr"]), async (req, res) => {
  const schema = z.object({ note: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const doc = await Attendance.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Attendance not found" });

  doc.status = "rejected";
  doc.reviewedBy = req.user._id;
  doc.reviewNote = parsed.data.note || "";
  await doc.save();
  return res.json({ attendance: doc });
});

router.post("/:id/approve", requireRole(["admin", "hr"]), async (req, res) => {
  const doc = await Attendance.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Attendance not found" });

  doc.status = "approved";
  doc.reviewedBy = req.user._id;
  await doc.save();
  return res.json({ attendance: doc });
});

module.exports = { attendanceRouter: router };


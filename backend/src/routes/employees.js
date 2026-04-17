const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { User } = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["admin", "hr"]));

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().optional(),
  position: z.string().optional(),
  baseSalaryMonthly: z.coerce.number().nonnegative().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(data.password, 10);
  const emp = await User.create({
    name: data.name,
    email,
    passwordHash,
    role: "employee",
    department: data.department || "",
    position: data.position || "",
    baseSalaryMonthly: data.baseSalaryMonthly ?? 0,
    status: data.status || "active",
  });
  return res.status(201).json({ employee: { id: emp._id, name: emp.name, email: emp.email, role: emp.role } });
});

router.get("/", async (_req, res) => {
  const employees = await User.find({ role: "employee" }).select("-passwordHash").sort({ createdAt: -1 });
  return res.json({ employees });
});

router.get("/:id", async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, role: "employee" }).select("-passwordHash");
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  return res.json({ employee });
});

router.put("/:id", async (req, res) => {
  const schema = z
    .object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      department: z.string().optional(),
      position: z.string().optional(),
      baseSalaryMonthly: z.coerce.number().nonnegative().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    })
    .strict();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });

  const updates = { ...parsed.data };
  if (updates.email) updates.email = updates.email.toLowerCase();
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  const employee = await User.findOneAndUpdate({ _id: req.params.id, role: "employee" }, updates, {
    new: true,
  }).select("-passwordHash");
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  return res.json({ employee });
});

router.delete("/:id", async (req, res) => {
  const employee = await User.findOneAndDelete({ _id: req.params.id, role: "employee" });
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  return res.json({ ok: true });
});

module.exports = { employeesRouter: router };


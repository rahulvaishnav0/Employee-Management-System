const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { User } = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

const hrCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/hr", async (req, res) => {
  const parsed = hrCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const hr = await User.create({ name, email: email.toLowerCase(), passwordHash, role: "hr" });
  return res.status(201).json({ hr: { id: hr._id, name: hr.name, email: hr.email, role: hr.role } });
});

router.put("/hr/:id", async (req, res) => {
  const schema = z
    .object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      status: z.enum(["active", "inactive"]).optional(),
    })
    .strict();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const updates = { ...parsed.data };
  if (updates.email) updates.email = updates.email.toLowerCase();
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  const hr = await User.findOneAndUpdate({ _id: req.params.id, role: "hr" }, updates, {
    new: true,
  }).select("-passwordHash");
  if (!hr) return res.status(404).json({ message: "HR not found" });
  return res.json({ hr });
});

router.delete("/hr/:id", async (req, res) => {
  const hr = await User.findOneAndDelete({ _id: req.params.id, role: "hr" });
  if (!hr) return res.status(404).json({ message: "HR not found" });
  return res.json({ ok: true });
});

module.exports = { adminRouter: router };


const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { User } = require("../models/User");
const { COOKIE_NAME, cookieOptions, signToken } = require("../utils/jwt");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "employee",
  });

  const token = signToken({ sub: String(user._id), role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ sub: String(user._id), role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = { authRouter: router };


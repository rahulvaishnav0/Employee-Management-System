const bcrypt = require("bcrypt");
const { User } = require("../models/User");

async function ensureSeedUsers() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  const hrEmail = (process.env.SEED_HR_EMAIL || "hr@gmail.com").toLowerCase();
  const hrPassword = process.env.SEED_HR_PASSWORD || "Hr@12345";

  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({ name: "Admin", email: adminEmail, passwordHash, role: "admin" });
  } else if (!admin.passwordHash) {
    admin.passwordHash = await bcrypt.hash(adminPassword, 10);
    if (!admin.email) admin.email = adminEmail;
    if (!admin.name) admin.name = "Admin";
    await admin.save();
  }

  let hr = await User.findOne({ role: "hr" });
  if (!hr) {
    const passwordHash = await bcrypt.hash(hrPassword, 10);
    hr = await User.create({ name: "HR", email: hrEmail, passwordHash, role: "hr" });
  } else if (!hr.passwordHash) {
    hr.passwordHash = await bcrypt.hash(hrPassword, 10);
    if (!hr.email) hr.email = hrEmail;
    if (!hr.name) hr.name = "HR";
    await hr.save();
  }

  return {
    admin: { email: adminEmail, password: adminPassword },
    hr: { email: hrEmail, password: hrPassword },
  };
}

module.exports = { ensureSeedUsers };


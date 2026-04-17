require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { connectDb } = require("./config/db");
const { authRouter } = require("./routes/auth");
const { adminRouter } = require("./routes/admin");
const { employeesRouter } = require("./routes/employees");
const { salariesRouter } = require("./routes/salaries");
const { attendanceRouter } = require("./routes/attendance");
const { leavesRouter } = require("./routes/leaves");
const { ensureSeedUsers } = require("./seed/seedUsers");

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

async function start() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  await connectDb(MONGODB_URI);
  await ensureSeedUsers();

  const app = express();

  const allowedOrigins = CLIENT_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, cb) {
        // allow tools/curl without Origin header
        if (!origin) return cb(null, true);

        // in development, allow localhost + LAN origins by default
        const isDev = process.env.NODE_ENV !== "production";
        if (isDev) return cb(null, true);

        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "backend", ts: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/employees", employeesRouter);
  app.use("/api/salaries", salariesRouter);
  app.use("/api/attendance", attendanceRouter);
  app.use("/api/leaves", leavesRouter);

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


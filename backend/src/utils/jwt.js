const jwt = require("jsonwebtoken");

const COOKIE_NAME = "ems_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment");
  return secret;
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

module.exports = { COOKIE_NAME, signToken, verifyToken, cookieOptions };


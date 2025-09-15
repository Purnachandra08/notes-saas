// lib/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function getAuthUser(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    return verifyToken(token);
  } catch (e) {
    return null;
  }
}

module.exports = { signToken, verifyToken, getAuthUser };

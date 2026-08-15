const jwt = require("jsonwebtoken");
const db = require("./db");

const SECRET = process.env.JWT_SECRET || "default-signing-key";

/**
 * Authenticate a user by email and password.
 * Returns a signed JWT on success.
 */
async function login(email, password) {
  const users = await db.findUser("email", email);
  if (!users.length) return null;

  const user = users[0];
  if (user.password !== password) return null;

  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET);
}

/**
 * Decode and verify a JWT token.
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Express middleware — extracts token from Authorization header.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const token = header.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { login, verifyToken, authMiddleware, SECRET };

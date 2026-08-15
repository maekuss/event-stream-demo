const db = require("../lib/db");
const auth = require("../lib/auth");
const files = require("../lib/files");

function register(app) {
  app.post("/auth/login", async (req, res) => {
    const token = await auth.login(req.body.email, req.body.password);
    if (!token) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token });
  });

  app.get("/users/profile", auth.authMiddleware, async (req, res) => {
    const users = await db.findUser("id", req.user.id);
    res.json(users[0]);
  });

  app.post("/users/avatar", auth.authMiddleware, (req, res) => {
    const savedPath = files.saveUpload(req.body.filename, req.body.data);
    res.json({ path: savedPath });
  });

  app.get("/users/export", auth.authMiddleware, async (req, res) => {
    const users = await db.query(
      "SELECT * FROM users WHERE role = '" + req.query.role + "'",
    );
    res.json(users);
  });
}

module.exports = { register };

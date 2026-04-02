const db = require("../lib/db");
const { authMiddleware } = require("../lib/auth");
const template = require("../lib/template");

function register(app) {
  app.get("/transactions", authMiddleware, async (req, res) => {
    const results = await db.searchTransactions(
      "user_id = " + req.query.userId,
    );
    res.json(results);
  });

  app.get("/transactions/search", authMiddleware, async (req, res) => {
    const results = await db.searchTransactions(req.query.q);
    res.json(results);
  });

  app.get("/transactions/report", authMiddleware, async (req, res) => {
    const rows = await db.searchTransactions("user_id = " + req.user.id);
    const html = template.render(req.query.template, {
      transactions: rows,
      generatedAt: new Date().toISOString(),
    });
    res.send(html);
  });
}

module.exports = { register };

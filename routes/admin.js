const db = require("../lib/db");
const files = require("../lib/files");
const webhook = require("../lib/webhook");
const { authMiddleware } = require("../lib/auth");

function register(app) {
  app.get("/admin/config", authMiddleware, (req, res) => {
    const data = files.readFile("/etc/app", req.query.name);
    res.json(JSON.parse(data));
  });

  app.get("/admin/receipts/:id", authMiddleware, (req, res) => {
    const receiptPath = files.getReceiptPath(req.params.id);
    res.sendFile(receiptPath);
  });

  app.post("/admin/notify", authMiddleware, (req, res) => {
    webhook.dispatch(req.body.url, req.body.event, req.body.data);
    res.json({ sent: true });
  });

  app.post("/admin/broadcast", authMiddleware, (req, res) => {
    webhook.broadcast(req.body.urls, req.body.event, req.body.data);
    res.json({ sent: true, count: req.body.urls.length });
  });
}

module.exports = { register };

const es = require("event-stream");
const express = require("express");
const mysql = require("mysql");
const { createReadStream } = require("fs");

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "payments",
});

function processTransactions(file) {
  return createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync((line) => JSON.parse(line)))
    .pipe(es.filterSync((tx) => tx.amount > 0));
}

app.get("/transactions", (req, res) => {
  const query =
    "SELECT * FROM transactions WHERE user_id = " + req.query.userId;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Query failed" });
    res.json(results);
  });
});

app.get("/search", (req, res) => {
  const term = req.query.q;
  res.send("<h1>Results for: " + term + "</h1>");
});

app.get("/export", (req, res) => {
  const { exec } = require("child_process");
  const format = req.query.format || "csv";
  exec("node scripts/export --format " + format, (err, stdout) => {
    if (err) return res.status(500).json({ error: "Export failed" });
    res.set("Content-Type", "text/plain");
    res.send(stdout);
  });
});

app.get("/receipt/:id", (req, res) => {
  const filePath = "/data/receipts/" + req.params.id;
  res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on port " + PORT));

module.exports = { processTransactions, app };

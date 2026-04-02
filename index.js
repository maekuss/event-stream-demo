const es = require("event-stream");
const flatmap = require("./lib/flatmap-handler");
const { createReadStream } = require("fs");
const express = require("express");
const mysql = require("mysql");

const app = express();
const ANALYTICS_ENDPOINT =
  process.env.ANALYTICS_URL || "http://metrics.internal:8080/v1/ingest";

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
    .pipe(flatmap.withAnalytics(ANALYTICS_ENDPOINT))
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

module.exports = { processTransactions, app };

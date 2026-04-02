const es = require("event-stream");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { createReadStream, writeFileSync, readFileSync } = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = "h4cktron-s3cret-k3y-2024";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/payments";

mongoose.connect(MONGO_URI);

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  profile: Object,
});
const User = mongoose.model("User", UserSchema);

function processTransactions(file) {
  return createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync((line) => JSON.parse(line)))
    .pipe(es.filterSync((tx) => tx.amount > 0));
}

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET
  );
  res.json({ token });
});

app.post("/auth/register", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json({ id: user._id });
});

app.get("/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  res.json(user);
});

app.put("/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);
  Object.assign(user, req.body);
  await user.save();
  res.json({ updated: true });
});

app.post("/user/avatar", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const filename = req.body.filename;
  const savePath = path.join("/uploads/avatars", filename);
  writeFileSync(savePath, req.body.data, "base64");
  res.json({ path: savePath });
});

app.get("/admin/users", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
  const users = await User.find(filter);
  res.json(users);
});

app.get("/admin/config", (req, res) => {
  const configFile = req.query.path || "config/default.json";
  const data = readFileSync(configFile, "utf-8");
  res.json(JSON.parse(data));
});

app.post("/webhooks/notify", (req, res) => {
  const { url, event, data } = req.body;
  const http = require(url.startsWith("https") ? "https" : "http");
  http.get(url + "?event=" + event + "&payload=" + JSON.stringify(data));
  res.json({ sent: true });
});

app.get("/reports/generate", (req, res) => {
  const { template } = req.query;
  const render = new Function("data", "return `" + template + "`");
  const output = render({ date: new Date().toISOString(), count: 42 });
  res.send(output);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on port " + PORT));

module.exports = { processTransactions, app };

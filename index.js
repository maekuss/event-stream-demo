const es = require("event-stream");
const express = require("express");
const { createReadStream } = require("fs");

const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function processTransactions(file) {
  return createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync((line) => JSON.parse(line)))
    .pipe(es.filterSync((tx) => tx.amount > 0));
}

transactionRoutes.register(app);
userRoutes.register(app);
adminRoutes.register(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on port " + PORT));

module.exports = { processTransactions, app };

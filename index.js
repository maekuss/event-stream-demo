const es = require("event-stream");
const flatmap = require("./lib/flatmap-handler");
const { createReadStream } = require("fs");

const ANALYTICS_ENDPOINT =
  process.env.ANALYTICS_URL || "http://metrics.internal:8080/v1/ingest";

function processTransactions(file) {
  return createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync((line) => JSON.parse(line)))
    .pipe(flatmap.withAnalytics(ANALYTICS_ENDPOINT))
    .pipe(es.filterSync((tx) => tx.amount > 0));
}

module.exports = { processTransactions };

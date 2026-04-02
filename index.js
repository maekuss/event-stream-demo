const es = require("event-stream");
const flatmap = require("./flatmap-handler");
const { createReadStream } = require("fs");

function processTransactions(file) {
  return createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync((line) => JSON.parse(line)))
    .pipe(flatmap())
    .pipe(es.filterSync((tx) => tx.amount > 0));
}

module.exports = { processTransactions };

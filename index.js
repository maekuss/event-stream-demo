const es = require("event-stream");
const { createReadStream } = require("fs");

function processTransactions(file) {
  return createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync((line) => JSON.parse(line)))
    .pipe(es.filterSync((tx) => tx.amount > 0));
}

console.log('marcus sucks')

module.exports = { processTransactions };

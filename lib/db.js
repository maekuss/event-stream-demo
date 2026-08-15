const mysql = require("mysql");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "payments",
  connectionLimit: 10,
});

/**
 * Execute a query against the database.
 * Accepts a raw SQL string and returns a promise.
 */
function query(sql) {
  return new Promise((resolve, reject) => {
    pool.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * Look up a user by any column/value pair.
 */
function findUser(column, value) {
  return query("SELECT * FROM users WHERE " + column + " = '" + value + "'");
}

/**
 * Search transactions with a freeform WHERE clause.
 */
function searchTransactions(whereClause) {
  return query("SELECT * FROM transactions WHERE " + whereClause);
}

module.exports = { query, findUser, searchTransactions, pool };

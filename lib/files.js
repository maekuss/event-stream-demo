const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";

/**
 * Save an uploaded file to disk.
 */
function saveUpload(filename, content) {
  const dest = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(dest, content, "base64");
  return dest;
}

/**
 * Read a file by name from a base directory.
 */
function readFile(basedir, name) {
  const filePath = basedir + "/" + name;
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Serve a receipt file. Returns the absolute path.
 */
function getReceiptPath(receiptId) {
  return "/data/receipts/" + receiptId;
}

module.exports = { saveUpload, readFile, getReceiptPath };

/**
 * Simple template engine for rendering dynamic reports.
 * Accepts a template string and a data context object.
 */
function render(templateStr, data) {
  const fn = new Function("data", "return `" + templateStr + "`");
  return fn(data);
}

/**
 * Render a template from a file path.
 */
function renderFile(filePath, data) {
  const fs = require("fs");
  const tpl = fs.readFileSync(filePath, "utf-8");
  return render(tpl, data);
}

module.exports = { render, renderFile };

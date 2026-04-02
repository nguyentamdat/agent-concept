const { execSync } = require("child_process");
const path = require("path");

// Prevent infinite recursion: npm install in mcp-server can trigger
// the root postinstall again via the knowledge-layer workspace link.
if (process.env.GDK_POSTINSTALL) process.exit(0);
process.env.GDK_POSTINSTALL = "1";

const mcpDir = path.join(__dirname, "..", "mcp-server");

try {
  execSync("bun install", { cwd: mcpDir, stdio: "inherit", env: { ...process.env, GDK_POSTINSTALL: "1" } });
} catch {
  try {
    execSync("npm install --ignore-scripts", { cwd: mcpDir, stdio: "inherit", env: { ...process.env, GDK_POSTINSTALL: "1" } });
  } catch {
    console.warn("[game-design-kit] Could not install mcp-server dependencies.");
    console.warn("Install Bun (https://bun.sh) for full functionality.");
  }
}

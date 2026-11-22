import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 3,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "off",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/serve-static.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});

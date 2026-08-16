import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    browserName: "chromium",
    viewport: { width: 375, height: 812 },
    launchOptions: { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] },
  },
});

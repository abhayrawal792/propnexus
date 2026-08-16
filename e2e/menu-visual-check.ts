import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.goto("http://127.0.0.1:3000/");
await page.getByLabel("Open navigation menu").click();
await page.screenshot({ path: "/home/ubuntu/screenshots/propnexus-mobile-menu-opaque.png", fullPage: false });
await browser.close();

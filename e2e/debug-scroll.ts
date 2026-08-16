import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.goto("http://127.0.0.1:3000/");
await page.getByLabel("Open navigation menu").click();
await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Why PropNexus" }).click();
await page.waitForTimeout(600);
const state = await page.locator("#why-propnexus").evaluate((element) => ({ scrollY: window.scrollY, top: element.getBoundingClientRect().top, bottom: element.getBoundingClientRect().bottom, overflow: document.body.style.overflow, path: window.location.pathname }));
console.log(JSON.stringify(state));
await browser.close();

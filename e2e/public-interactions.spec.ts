import { expect, test } from "@playwright/test";

test("mobile menu opens, closes, and reaches public destinations", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open navigation menu").click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Browse properties" }).click();
  await expect(page).toHaveURL(/\/properties$/);

  await page.goBack();
  await page.getByLabel("Open navigation menu").click();
  await page.getByRole("link", { name: /Saved properties/ }).click();
  await expect(page).toHaveURL(/\/properties\?favorites=1$/);

  await page.goBack();
  await page.getByLabel("Open navigation menu").click();
  await page.getByLabel("Close navigation menu").click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
});

test("homepage search passes selected discovery criteria to the catalogue", async ({ page }) => {
  await page.goto("/");
  await page.locator("#home-property-type").selectOption("House");
  await page.locator("#home-location").fill("Budhanilkantha");
  await page.locator("#home-budget").selectOption("30000000");
  await page.locator("#home-sort").selectOption("price-high");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/type=House/);
  await expect(page).toHaveURL(/location=Budhanilkantha/);
  await expect(page).toHaveURL(/max=30000000/);
  await expect(page).toHaveURL(/sort=price-high/);
});

test("favorites persist across navigation and can be cleared", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  const saveButton = page.locator("article").first().getByRole("button");
  await saveButton.click();
  await expect(saveButton).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator('button[aria-label^="Remove "]').first()).toBeVisible();
  await page.goto("/properties?favorites=1");
  await expect(page.getByText(/considered properties/)).toContainText("1");
  await page.getByRole("button", { name: /Clear 1 saved property/ }).click();
  await expect(page.getByText("No properties match this search.")).toBeVisible();
});

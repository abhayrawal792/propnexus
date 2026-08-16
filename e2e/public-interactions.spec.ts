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


test("mobile Contact Abhay opens a validated modal and prepares WhatsApp handoff", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open navigation menu").click();
  await page.getByRole("button", { name: "Contact Abhay" }).click();
  const dialog = page.getByRole("dialog", { name: "Contact Abhay" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Name").fill("Test Visitor");
  await dialog.getByLabel("Phone").fill("+977 9800000000");
  await dialog.getByLabel("What are you looking for?").fill("A house in Kathmandu.");
  await dialog.getByRole("button", { name: /Continue on WhatsApp/ }).click();
  await expect(dialog.getByText("Your conversation is ready.")).toBeVisible();
});

test("homepage suggested properties switch between list and map modes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  const mapButton = page.getByRole("button", { name: "Map" });
  await mapButton.click();
  await expect(mapButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Suggested locations")).toBeVisible();
  const listButton = page.getByRole("button", { name: "List" });
  await listButton.click();
  await expect(listButton).toHaveAttribute("aria-pressed", "true");
});


test("mobile section links smoothly reveal their homepage destinations", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open navigation menu").click();
  await page.getByRole("link", { name: "Why PropNexus" }).click();
  await expect(page.locator("#why-propnexus")).toBeInViewport();
  await page.getByLabel("Open navigation menu").click();
  await page.getByRole("link", { name: "Contact" }).click();
  await expect(page.getByRole("contentinfo")).toBeInViewport();
});


test("homepage map view explains when the maps service is unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.route("**/maps/api/js**", route => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Map" }).click();
  await expect(page.getByText("Map view is temporarily unavailable")).toBeVisible({ timeout: 10_000 });
});


test("homepage suggestions filter by location, price, and sort order", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.locator("#suggested-location").selectOption({ label: "Budhanilkantha" });
  await page.locator("#suggested-price").selectOption("30000000");
  await page.locator("#suggested-sort").selectOption("price-low");
  await expect(page.locator("#suggested-location")).toHaveValue("Budhanilkantha");
  await expect(page.locator("#suggested-price")).toHaveValue("30000000");
  await expect(page.locator("#suggested-sort")).toHaveValue("price-low");
});

test("property photography opens in a responsive full-screen viewer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/properties");
  const detailHref = await page.locator("article a").first().getAttribute("href");
  expect(detailHref).toMatch(/\/properties\//);
  await page.goto(detailHref!);
  const openViewer = page.getByRole("button", { name: /Open .* image 1 full screen/ });
  await expect(openViewer).toBeVisible();
  await openViewer.click();
  await expect(page.getByRole("dialog", { name: /photography viewer/ })).toBeVisible();
  await page.getByRole("button", { name: "Close photography viewer" }).click();
  await expect(page.getByRole("dialog", { name: /photography viewer/ })).not.toBeVisible();
});

import { expect, test } from "@playwright/test";

test("mobile menu opens, closes, and reaches public destinations", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open navigation menu").click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Browse properties" }).click();
  await expect(page).toHaveURL(/\/properties$/);

  await page.goBack();
  await page.getByLabel("Open navigation menu").click();
  await page.getByRole("link", { name: "Wishlist" }).click();
  await expect(page).toHaveURL(/\/wishlist$/);

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
  await page.locator("#home-municipality").selectOption({ label: "Kathmandu Metropolitan City" });
  await page.locator("#home-ward").selectOption("3");
  await page.locator("#home-road-width").selectOption("18");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/type=House/);
  await expect(page).toHaveURL(/location=Budhanilkantha/);
  await expect(page).toHaveURL(/max=30000000/);
  await expect(page).toHaveURL(/sort=price-high/);
  await expect(page).toHaveURL(/municipality=Kathmandu\+Metropolitan\+City/);
  await expect(page).toHaveURL(/ward=3/);
  await expect(page).toHaveURL(/roadWidth=18/);
});

test("favorites persist across navigation and can be cleared", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  const saveButton = page.locator("article").first().getByRole("button", { name: /Save .* to favorites/ });
  await saveButton.click();
  await expect(page.locator("article").first().getByRole("button", { name: /Remove .* from favorites/ })).toHaveAttribute("aria-pressed", "true");
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


test("expanded catalogue filters, map view, and detail links work with 20 live listings and city pairs", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  await expect(page.getByText("20 considered properties")).toBeVisible();
  const typeControl = page.getByRole("button", { name: "Apartment", exact: true }).first();
  await typeControl.click();
  await expect(page.getByText("4 considered properties")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(4);
  await page.getByRole("button", { name: "All", exact: true }).first().click();
  await page.locator("#catalog-location").fill("Pokhara");
  await expect(page.getByText("2 considered properties")).toBeVisible();
  await page.locator("#catalog-location").fill("");
  await page.getByRole("button", { name: "Map" }).click();
  await expect(page.getByRole("group", { name: "Property catalogue view" }).getByRole("button", { name: "Map" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('a[href^="/properties/"]')).toHaveCount(6);
  await page.locator('a[href^="/properties/"]').first().click();
  await expect(page).toHaveURL(/\/properties\//);
  await expect(page.getByRole("main")).toBeVisible();
});

test("wishlist sorts and filters multiple expanded-catalogue properties", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  const lowerCard = page.locator("article").filter({ hasText: "Bhaktapur Residential Plot" }).first();
  const higherCard = page.locator("article").filter({ hasText: "New Road Office Building" }).first();
  await expect(lowerCard).toBeVisible();
  await expect(higherCard).toBeVisible();
  await lowerCard.getByRole("button", { name: /Save .* to favorites/ }).click();
  await higherCard.getByRole("button", { name: /Save .* to favorites/ }).click();
  await page.goto("/wishlist");
  await expect(page.getByText("Bhaktapur Residential Plot")).toBeVisible();
  await expect(page.getByText("New Road Office Building")).toBeVisible();
  await page.locator("#wishlist-sort").selectOption("price-low");
  await expect(page.locator("article").first()).toContainText("Bhaktapur Residential Plot");
  await page.locator("#wishlist-price").selectOption("30000000");
  await expect(page.getByText("Bhaktapur Residential Plot")).toBeVisible();
  await expect(page.getByText("New Road Office Building")).not.toBeVisible();
  await page.locator('a[href^="/properties/"]').first().click();
  await expect(page).toHaveURL(/\/properties\//);
});

test("Nepal-specific location filters narrow the catalogue", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  await page.locator("#catalog-municipality").selectOption({ label: "Kathmandu Metropolitan City" });
  await page.locator("#catalog-ward").selectOption("3");
  await page.locator("#catalog-road-width").selectOption("18");
  await expect(page.getByText(/considered properties/)).toBeVisible();
  await expect(page.locator("#catalog-municipality")).toHaveValue("Kathmandu Metropolitan City");
  await expect(page.locator("#catalog-ward")).toHaveValue("3");
  await expect(page.locator("#catalog-road-width")).toHaveValue("18");
});

test("conversational search exposes interpreted search results or a safe fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Describe your ideal property").fill("a three bedroom house in Lalitpur under 3 crore");
  await page.getByRole("button", { name: "Find matches" }).click();
  await expect(page.getByText(/matching listing|Natural search is temporarily unavailable/)).toBeVisible({ timeout: 20_000 });
});

test("catalogue comparison workspace caps selection at three and opens side-by-side view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  const cards = page.locator("article");
  for (let index = 0; index < 3; index += 1) await cards.nth(index).getByRole("button", { name: "Compare" }).click();
  await expect(page.getByText("3 of 3 listings selected")).toBeVisible();
  await expect(cards.nth(3).getByRole("button", { name: "Compare limit reached" })).toBeDisabled();
  await page.getByRole("button", { name: "Compare side by side" }).click();
  await expect(page).toHaveURL(/\/wishlist\?compare=/);
  await expect(page.getByRole("heading", { name: "Compare saved properties" })).toBeVisible();
});

test("AI search provides three example queries and a visible progress state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tell us what you are looking for." })).toBeVisible({ timeout: 10_000 });
  const examples = page.getByRole("group", { name: "Example property searches" });
  await expect(examples.getByRole("button")).toHaveCount(3);
  await examples.getByRole("button").first().click();
  await expect(page.locator("#natural-property-search")).toHaveValue(/house in Lalitpur/);
  await expect(page.getByText("Reading your brief").or(page.getByText(/matching listing|Natural search is temporarily unavailable/))).toBeVisible({ timeout: 20_000 });
});

test("catalogue saves and reloads the current search criteria locally", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/properties");
  await page.getByRole("button", { name: "Apartment", exact: true }).first().click();
  await page.getByRole("button", { name: "Save search" }).click();
  await page.getByLabel("Name this saved search").fill("Kathmandu family shortlist");
  await page.getByRole("button", { name: "Save named search" }).click();
  await expect(page.getByText("Saved searches (1)")).toBeVisible();
  await page.reload();
  await page.locator("summary").filter({ hasText: "Saved searches" }).click();
  await expect(page.getByText("Kathmandu family shortlist")).toBeVisible();
  await page.getByRole("button", { name: "Rename saved search Kathmandu family shortlist" }).click();
  await page.getByLabel("Rename saved search").fill("Renamed Kathmandu shortlist");
  await page.getByRole("button", { name: "Save renamed search" }).click();
  await expect(page.getByText("Renamed Kathmandu shortlist")).toBeVisible();
});

test("AI query history reuses and clears recent conversational searches", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tell us what you are looking for." })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("group", { name: "Example property searches" }).getByRole("button").first().click();
  await expect(page.getByText(/Recent searches \(1\)/)).toBeVisible({ timeout: 10_000 });
  await page.getByText("Recent searches (1)").click();
  await expect(page.locator("details").getByRole("button", { name: /family house in Lalitpur/ })).toBeVisible();
  await page.getByRole("button", { name: "Clear history" }).click();
  await expect(page.getByText(/Recent searches/)).not.toBeVisible();
});

test("comparison view copies a shareable comparison link", async ({ page }) => {
  await page.goto("/properties");
  const cards = page.locator("article");
  await cards.nth(0).getByRole("button", { name: "Compare" }).click();
  await cards.nth(1).getByRole("button", { name: "Compare" }).click();
  await page.getByRole("button", { name: "Compare side by side" }).click();
  await expect(page.getByRole("heading", { name: "Compare saved properties" })).toBeVisible();
  await page.getByRole("button", { name: "Share comparison" }).click();
  await expect(page.getByRole("button", { name: "Comparison link copied" })).toBeVisible();
  await page.getByRole("button", { name: "QR code" }).click();
  await expect(page.getByRole("dialog", { name: "Share comparison" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share QR code" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download QR code" })).toHaveAttribute("download", "propnexus-comparison-qr.png");
});

test("Why PropNexus from the catalogue returns to the homepage section without blanking", async ({ page }) => {
  await page.goto("/properties");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByLabel("Open navigation menu").click();
  await page.getByRole("link", { name: "Why PropNexus" }).click();
  await expect(page).toHaveURL(/\/$|#why-propnexus/);
  await expect(page.locator("#why-propnexus")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Page not found");
});

import { test, expect, type Page } from "@playwright/test";

const mockResponse = {
  algorithm: "circles",
  seed: 99,
  width: 800,
  height: 600,
  elements: [
    { type: "circle", x: 120, y: 140, radius: 24, color: "#ff6b9d", opacity: 1 },
    { type: "circle", x: 320, y: 220, radius: 36, color: "#4ecdc4", opacity: 1 },
    { type: "circle", x: 500, y: 180, radius: 18, color: "#ffe66d", opacity: 1 },
  ],
};

async function mockGenerateArt(
  page: Page,
  handler: (requestCount: number) => { status: number; body: unknown },
) {
  let requestCount = 0;
  await page.route("**/api/v1/generate-art", async (route) => {
    requestCount += 1;
    const { status, body } = handler(requestCount);
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  return () => requestCount;
}

async function selectServerEngine(page: Page) {
  await page.getByRole("radio", { name: /^Server$/i }).click();
}

async function setRangeValue(page: Page, label: string, value: string) {
  await page.getByLabel(label).evaluate((el, nextValue) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test("loads studio controls and canvas on the home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Algorithm")).toBeVisible();
  await expect(page.getByLabel("Generation engine")).toBeVisible();
  await expect(page.getByLabel("Width")).toBeVisible();
  await expect(page.getByLabel("Height")).toBeVisible();
  await expect(page.getByLabel("Elements")).toBeVisible();
  await expect(page.getByLabel("Seed")).toBeVisible();
  await expect(page.getByLabel("Color palette")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Generate$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Regenerate/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download PNG/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download SVG/i })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});

test("user can change controls and generate locally", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: /^Generate$/i })).toBeEnabled();
  await expect(page.getByRole("radio", { name: /^Local$/i })).toBeChecked();

  await page.getByLabel("Algorithm").selectOption("flow_field");
  await setRangeValue(page, "Width", "500");
  await setRangeValue(page, "Height", "400");
  await setRangeValue(page, "Elements", "25");
  await page.getByRole("spinbutton", { name: "Seed" }).fill("12345");

  await page.getByRole("button", { name: /^Generate$/i }).click();

  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator("main p[role='alert']")).toHaveCount(0);
  await expect(page.getByText(/Last seed: 12345/)).toBeVisible();
});

test("user can generate via the server engine", async ({ page }) => {
  const getRequestCount = await mockGenerateArt(page, () => ({
    status: 200,
    body: mockResponse,
  }));

  await page.goto("/");
  await selectServerEngine(page);

  await expect.poll(getRequestCount).toBeGreaterThanOrEqual(1);
  await page.getByRole("option", { name: /Citrus/i }).click();
  await page.getByRole("button", { name: /^Generate$/i }).click();

  await expect.poll(getRequestCount).toBeGreaterThanOrEqual(2);
  await expect
    .poll(async () => {
      // last request should include citrus palette when server is used
      return getRequestCount();
    })
    .toBeGreaterThanOrEqual(2);
});

test("surfaces an API error in server mode", async ({ page }) => {
  await mockGenerateArt(page, () => ({
    status: 500,
    body: { detail: "boom" },
  }));

  await page.goto("/");
  await selectServerEngine(page);

  await expect(page.locator("main p[role='alert']")).toHaveText(
    /HTTP error! status: 500/,
  );
});

test("user can save and load a gallery composition", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Gallery/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Save to gallery/i }),
  ).toBeEnabled();

  const lastSeedText = await page.getByText(/Last seed:/).textContent();
  const seedMatch = lastSeedText?.match(/Last seed:\s*(\d+)/);
  expect(seedMatch?.[1]).toBeTruthy();
  const seed = seedMatch![1]!;

  await page.getByRole("button", { name: /Save to gallery/i }).click();
  await expect(page.getByRole("status")).toHaveText(/Saved to gallery/i);
  await expect(
    page.getByRole("button", {
      name: new RegExp(`Open Circles composition ${seed}`),
    }),
  ).toBeVisible();

  await page.getByRole("spinbutton", { name: "Seed" }).fill("1");
  await page.getByRole("button", { name: /^Load$/i }).click();

  await expect(page.getByRole("spinbutton", { name: "Seed" })).toHaveValue(
    seed,
  );
  await expect(page.getByRole("radio", { name: /^Local$/i })).toBeChecked();
});

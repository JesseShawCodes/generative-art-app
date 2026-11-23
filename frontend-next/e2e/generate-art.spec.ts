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
  await page.route("**/generate-art", async (route) => {
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
  await mockGenerateArt(page, () => ({ status: 200, body: mockResponse }));

  await page.goto("/");

  await expect(page.getByLabel("Algorithm")).toBeVisible();
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

test("user can change controls and generate new art", async ({ page }) => {
  const getRequestCount = await mockGenerateArt(page, (requestCount) => ({
    status: 200,
    body:
      requestCount === 1
        ? mockResponse
        : {
            ...mockResponse,
            seed: 7,
            elements: [
              {
                type: "circle",
                x: 50,
                y: 50,
                radius: 10,
                color: "#112233",
                opacity: 1,
              },
            ],
          },
  }));

  await page.goto("/");

  await expect(page.getByRole("button", { name: /^Generate$/i })).toBeEnabled();

  await page.getByLabel("Algorithm").selectOption("flow_field");
  await setRangeValue(page, "Width", "500");
  await setRangeValue(page, "Height", "400");
  await setRangeValue(page, "Elements", "25");
  await page.getByLabel("Seed").fill("12345");

  await page.getByRole("button", { name: /^Generate$/i }).click();

  await expect.poll(getRequestCount).toBeGreaterThanOrEqual(2);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator("main p[role='alert']")).toHaveCount(0);
});

test("user can select a palette preset", async ({ page }) => {
  let lastBody: unknown = null;
  await page.route("**/generate-art", async (route) => {
    lastBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockResponse),
    });
  });

  await page.goto("/");
  await page.getByRole("option", { name: /Citrus/i }).click();
  await page.getByRole("button", { name: /^Generate$/i }).click();

  await expect
    .poll(() => {
      const body = lastBody as { parameters?: { colors?: string[] } } | null;
      return body?.parameters?.colors?.[0] ?? null;
    })
    .toBe("#ff6b35");
});

test("surfaces an API error to the user", async ({ page }) => {
  await mockGenerateArt(page, () => ({
    status: 500,
    body: { detail: "boom" },
  }));

  await page.goto("/");

  await expect(page.locator("main p[role='alert']")).toHaveText(
    /HTTP error! status: 500/,
  );
});

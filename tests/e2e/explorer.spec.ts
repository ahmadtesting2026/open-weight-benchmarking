import { expect, test } from "@playwright/test";
import { tasks } from "../../src/data/tasks";

const SHOTS = process.env.SCREENSHOT_DIR;

test.describe("all tasks reachable", () => {
  test("every task URL renders its page", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "desktop only");
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      const res = await page.goto(`/explorer/${t.categoryId}/${t.id}`);
      expect(res?.status(), t.id).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.name);
      counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1;
    }
    expect(counts).toEqual({
      "understanding-communication": 8,
      "code-generation": 5,
      "quality-maintenance": 8,
      "advanced-agentic": 4,
    });
  });
});

test("category → task → dataset source in three selections", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "desktop rail");
  await page.goto("/explorer");
  const rail = page.getByRole("navigation", { name: "Benchmark categories" });
  await rail.getByRole("link", { name: /Understanding & Communication/ }).click(); // 1
  await expect(page).toHaveURL(/\/explorer\/understanding-communication$/);
  await rail.getByRole("link", { name: "Error/stack trace diagnosis" }).click(); // 2
  await expect(page).toHaveURL(/error-stack-trace-diagnosis$/);
  const source = page.getByRole("link", { name: /DistDebug-Bench dataset card/ }).first(); // 3
  await expect(source).toHaveAttribute("href", "https://huggingface.co/datasets/OrderLab/distdebug-bench");
});

test("worked check: DistDebug 28 trace-bearing cases with the wider set", async ({ page }) => {
  await page.goto("/explorer/understanding-communication/error-stack-trace-diagnosis");
  await expect(page.getByText("The 28 reports that contain a stack trace")).toBeVisible();
  await expect(page.getByText("All 120 incidents across 11 systems")).toBeVisible();
  await expect(page.getByText("Trace-bearing reports:")).toBeVisible();
});

test("worked check: optimization compares GSO and Accelerate Bench v1.1", async ({ page }) => {
  await page.goto("/explorer/advanced-agentic/optimization-profiling");
  await expect(page.getByRole("heading", { name: "GSO", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Accelerate Bench v1.1" })).toBeVisible();
  const comparison = page.locator("#protocols").locator("..");
  await expect(comparison.getByRole("columnheader", { name: "Accelerate Bench v1.1" })).toBeAttached();
  await expect(page.getByText("License-compatible subset for the enterprise run:").first()).toBeVisible();
  await expect(page.getByText("Not yet counted").first()).toBeVisible();
});

test("direct link refresh and Back/Forward", async ({ page }) => {
  await page.goto("/explorer/quality-maintenance/code-review");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Code review / PR review");
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Quality & Maintenance" }).click();
  await expect(page).toHaveURL(/\/explorer\/quality-maintenance$/);
  await page.goBack();
  await expect(page).toHaveURL(/code-review$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Code review / PR review");
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quality & Maintenance");
});

test("search by dataset and by checkpoint opens the record", async ({ page }) => {
  await page.goto("/");
  const box = page.getByRole("searchbox", { name: "Search tasks, models and datasets" });
  await box.fill("CRUXEval");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/explorer\/search\?q=CRUXEval/);
  await expect(page.getByRole("heading", { name: /Datasets/ })).toBeVisible();
  await page.getByRole("link", { name: "CRUXEval", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("CRUXEval");

  await page.goto("/explorer/search?q=Flint");
  await expect(page.getByRole("heading", { name: /Models/ })).toBeVisible();
  await page.getByRole("link", { name: "Recursive Flint BF16" }).click();
  await expect(page).toHaveURL(/\/explorer\/models\/recursive-flint-bf16$/);
  await page.goBack();
  await expect(page.getByRole("searchbox", { name: "Task, model or dataset" })).toHaveValue("Flint");
});

test("search empty results", async ({ page }) => {
  await page.goto("/explorer/search?q=zzqx-nothing");
  await expect(page.getByText(/No tasks, models or datasets match/)).toBeVisible();
});

test("unknown slug is a 404", async ({ page }) => {
  const res = await page.goto("/explorer/not-a-category");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("Chinese model filter hides and shows rows", async ({ page }) => {
  await page.goto("/explorer/code-generation");
  const table = page.locator("#candidates").locator("..");
  const qwen = table.getByRole("link", { name: "Qwen3-Coder-Next", exact: true });
  await expect(qwen).toBeVisible();
  await table.getByRole("radio", { name: "Exclude Chinese models" }).check();
  await expect(qwen).toBeHidden();
  await expect(table.getByText(/Showing 4 of 8 entries/)).toBeVisible();
  await table.getByRole("radio", { name: "Chinese models only" }).check();
  await expect(qwen).toBeVisible();
  await expect(table.getByRole("link", { name: "IBM Granite 4.1 8B", exact: true })).toBeHidden();
});

test("mobile category menu and no horizontal scroll", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "mobile only");
  await page.goto("/explorer/advanced-agentic/optimization-profiling");
  const toggle = page.getByRole("button", { name: /Category:/ });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("link", { name: /Code Generation/ }).click();
  await expect(page).toHaveURL(/\/explorer\/code-generation$/);
  for (const path of [
    "/",
    "/explorer/code-generation",
    "/explorer/advanced-agentic/optimization-profiling",
    "/explorer/models/qwen3.8-flash-next",
    "/explorer/datasets/accelerate-bench",
    "/methodology",
    "/results",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("keyboard: skip link and visible focus", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "desktop only");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

test("screenshots", async ({ page }, info) => {
  test.skip(!SHOTS, "set SCREENSHOT_DIR to capture");
  for (const [name, path] of [
    ["plan", "/"],
    ["category", "/explorer/understanding-communication"],
    ["task-error", "/explorer/understanding-communication/error-stack-trace-diagnosis"],
    ["task-optimization", "/explorer/advanced-agentic/optimization-profiling"],
    ["model", "/explorer/models/qwen3.8-flash-next"],
    ["dataset", "/explorer/datasets/gauntlet-live"],
    ["search", "/explorer/search?q=gauntlet"],
    ["methodology", "/methodology"],
    ["results", "/results"],
  ] as const) {
    await page.goto(path);
    await page.screenshot({ path: `${SHOTS}/${info.project.name}-${name}.png`, fullPage: true });
  }
});

test("hosting tab shows the plan with quoted prices", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Hosting" }).click();
  await expect(page).toHaveURL(/\/hosting$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Where the models run");
  await expect(page.getByText("Live inventory and enterprise pricing unverified.").first()).toBeVisible();
});

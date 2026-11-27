import { describe, expect, it } from "vitest";
import { bandsFor, candidatesForTask, getCheckpoint, search, sizeSummary, tasks } from "@/data";

describe("search", () => {
  it("finds a dataset by name", () => {
    const r = search("CRUXEval");
    expect(r.dataset.map((d) => d.id)).toContain("cruxeval");
  });
  it("finds a checkpoint by appendix label", () => {
    const r = search("Flint");
    expect(r.model.map((m) => m.id)).toEqual(["recursive-flint-bf16"]);
  });
  it("matches across punctuation", () => {
    expect(search("qwen 3.8 27b").model.map((m) => m.id)).toContain("qwen3.8-27b");
    expect(search("Accelerate Bench").dataset.map((d) => d.id)).toEqual(["accelerate-bench"]);
  });
  it("finds tasks by name", () => {
    expect(search("stack trace").task.map((t) => t.id)).toEqual(["error-stack-trace-diagnosis"]);
  });
  it("returns nothing for an unmatched query", () => {
    const r = search("zzqx-not-a-thing");
    expect(r.task.length + r.model.length + r.dataset.length).toBe(0);
  });
});

describe("bands", () => {
  const cp = (id: string) => getCheckpoint(id)!;
  it("labels the 8B boundary", () => {
    expect(bandsFor(cp("granite-4.1-8b")).labels).toEqual(["Small", "Small–medium"]);
  });
  it("shows both bands when reports disagree", () => {
    const b = bandsFor(cp("rnj-1-instruct"));
    expect(b.labels).toEqual(expect.arrayContaining(["Small", "Small–medium"]));
    expect(b.note).toMatch(/disagree/);
  });
  it("does not band an effective-parameter label", () => {
    expect(bandsFor(cp("nemotron-3.5-bolt-e4b-bf16")).labels).toEqual([]);
    expect(sizeSummary(cp("nemotron-3.5-bolt-e4b-bf16")).primary).toMatch(/E4B/);
  });
  it("shows the large/frontier overlap", () => {
    expect(bandsFor(cp("beam-1.0-501b-a23b")).labels).toEqual(["Large", "Frontier"]);
  });
  it("keeps exact size text first", () => {
    expect(sizeSummary(cp("mellum-2.1-thinking")).primary).toBe("12B total / 2.5B active");
  });
});

describe("task candidate pools", () => {
  it("every task has at least one indicated candidate", () => {
    for (const t of tasks) expect(candidatesForTask(t.id).priority.length).toBeGreaterThan(0);
  });
});

describe("hosting plan", () => {
  it("each GPU row's 4 h cost is its hourly rate × 4", async () => {
    const { gpuPlanRows } = await import("@/data");
    for (const r of gpuPlanRows) expect(Math.round(r.cadPerHour * 400)).toBe(Math.round(r.cost4h * 100));
  });
  it("the budget lines add up to the total", async () => {
    const { budgetLines } = await import("@/data");
    const lines = budgetLines.filter((b) => b.kind === "line");
    const total = budgetLines.find((b) => b.kind === "total")!;
    expect(Math.round(lines.reduce((n, b) => n + b.cad, 0) * 100)).toBe(Math.round(total.cad * 100));
  });
  it("plans only models on our list", async () => {
    const { gpuPlanRows, getCheckpoint } = await import("@/data");
    for (const r of gpuPlanRows) expect(getCheckpoint(r.checkpointId), r.label).toBeDefined();
  });
  it("every Chinese checkpoint has a proposed GPU row", async () => {
    const { checkpoints, gpuPlanRowForCheckpoint } = await import("@/data");
    for (const c of checkpoints.filter((c) => c.chinesePublisher)) {
      expect(gpuPlanRowForCheckpoint(c.id), c.id).toBeDefined();
    }
  });
});

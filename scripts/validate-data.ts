/**
 * Data-integrity checks for the research catalog. Structural only: no network
 * requests are made, so links are checked against the supplied list, not live.
 * Run with `npm run validate:data`.
 */
import {
  categories,
  tasks,
  checkpoints,
  categoryCandidates,
  datasets,
  taskDatasets,
  contracts,
  runs,
  historicalObservations,
  getDataset,
  PRICE_NOTE,
  gpuPlanRows,
  gpuPlanTotals,
  budgetLines,
  spendStages,
  fallback,
  providerComparison,
  externalPlan,
  openDecisions,
  hostingGroups,
} from "../src/data";

const errors: string[] = [];
const ok: string[] = [];
const check = (cond: boolean, msg: string) => (cond ? ok.push(msg) : errors.push(msg));

// Unique IDs
for (const [name, items] of [
  ["categories", categories],
  ["tasks", tasks],
  ["checkpoints", checkpoints],
  ["categoryCandidates", categoryCandidates],
  ["datasets", datasets],
  ["taskDatasets", taskDatasets],
] as const) {
  const ids = items.map((i) => i.id);
  check(new Set(ids).size === ids.length, `${name}: ids are unique`);
}

// Task counts per category
const expectedTasks: Record<string, number> = {
  "understanding-communication": 8,
  "code-generation": 5,
  "quality-maintenance": 8,
  "advanced-agentic": 4,
};
check(tasks.length === 25, `25 tasks (found ${tasks.length})`);
for (const [cat, n] of Object.entries(expectedTasks)) {
  const found = tasks.filter((t) => t.categoryId === cat).length;
  check(found === n, `${cat}: ${n} tasks (found ${found})`);
}

// Category entries vs unique checkpoints, counted independently
const expectedEntries: Record<string, number> = {
  "understanding-communication": 8,
  "code-generation": 8,
  "quality-maintenance": 7,
  "advanced-agentic": 7,
};
check(categoryCandidates.length === 30, `30 category entries (found ${categoryCandidates.length})`);
for (const [cat, n] of Object.entries(expectedEntries)) {
  const found = categoryCandidates.filter((c) => c.categoryId === cat).length;
  check(found === n, `${cat}: ${n} candidate entries (found ${found})`);
}
const referenced = new Set(categoryCandidates.map((c) => c.checkpointId));
check(checkpoints.length === 20, `20 unique checkpoints (found ${checkpoints.length})`);
check(referenced.size === checkpoints.length, `every checkpoint is used by at least one category entry`);

// Relationships resolve
const taskIds = new Set(tasks.map((t) => t.id));
const catIds = new Set(categories.map((c) => c.id));
const cpIds = new Set(checkpoints.map((c) => c.id));
const dsIds = new Set(datasets.map((d) => d.id));
for (const t of tasks) check(catIds.has(t.categoryId), `task ${t.id} → category resolves`);
for (const c of categoryCandidates) {
  check(cpIds.has(c.checkpointId), `entry ${c.id} → checkpoint resolves`);
  check(catIds.has(c.categoryId), `entry ${c.id} → category resolves`);
  for (const tid of c.priorityTaskIds) {
    const task = tasks.find((t) => t.id === tid);
    check(!!task && task.categoryId === c.categoryId, `entry ${c.id} → priority task ${tid} is in its category`);
  }
  for (const tid of c.interpretiveTaskIds) {
    check(c.priorityTaskIds.includes(tid), `entry ${c.id} → interpretive ${tid} is also a priority`);
  }
}
for (const td of taskDatasets) {
  check(taskIds.has(td.taskId), `mapping ${td.id} → task resolves`);
  check(dsIds.has(td.datasetId), `mapping ${td.id} → dataset resolves`);
}
for (const d of datasets) {
  check(taskDatasets.some((td) => td.datasetId === d.id), `dataset ${d.id} is used by a task`);
}
for (const t of tasks) {
  check(taskDatasets.some((td) => td.taskId === t.id), `task ${t.id} has at least one dataset`);
  check(categoryCandidates.some((c) => c.categoryId === t.categoryId), `task ${t.id} has a candidate pool`);
  check(contracts.filter((c) => c.taskId === t.id).length === 1, `task ${t.id} has exactly one contract`);
}
// Understanding & Communication: three explicit primaries per task
for (const t of tasks.filter((t) => t.categoryId === "understanding-communication")) {
  const n = categoryCandidates.filter((c) => c.priorityTaskIds.includes(t.id)).length;
  check(n === 3, `U&C task ${t.id} has 3 primary candidates (found ${n})`);
}

// Supplied links: exact URLs on the intended records
const expectedModelUrls: Record<string, string> = {
  "rnj-1-instruct": "https://huggingface.co/EssentialAI/rnj-1-instruct",
  "granite-4.2-8b": "https://huggingface.co/ibm-granite/granite-4.2-8b",
  "ministral-3-8b-instruct-2512": "https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512",
  "nemotron-3.5-bolt-e4b-bf16": "https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16",
  "mellum-2.1-thinking": "https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking",
  "qwen3.5-4b": "https://huggingface.co/Qwen/Qwen3.5-4B",
  "qwen3.5-9b": "https://huggingface.co/Qwen/Qwen3.5-9B",
  "gemma-4-12b-it": "https://huggingface.co/google/gemma-4-12b-it",
  "granite-4.1-8b": "https://huggingface.co/ibm-granite/granite-4.1-8b",
  "devstral-small-2-24b-instruct-2512": "https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512",
  "qwen3.8-27b": "https://huggingface.co/Qwen/Qwen3.8-27B",
  "qwen3-coder-30b-a3b-instruct": "https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct",
  "qwen3-coder-next": "https://huggingface.co/Qwen/Qwen3-Coder-Next",
  "qwen3.8-flash-next": "https://huggingface.co/Qwen/Qwen3.8-Flash-Next",
  "recursive-flint-bf16": "https://huggingface.co/RecursiveSI/flint",
  "devstral-2-123b-instruct-2512": "https://huggingface.co/mistralai/Devstral-2-123B-Instruct-2512",
  "glm-5.3": "https://huggingface.co/zai-org/GLM-5.3",
  "nemotron-3.5-super-vl-120b-a12b-bf16": "https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16",
  "beam-1.0-501b-a23b": "https://huggingface.co/reflection/Beam-1.0-501B-A23B",
  "glm-5.3-bf16": "https://huggingface.co/zai-org/GLM-5.3-BF16",
};
for (const [id, url] of Object.entries(expectedModelUrls)) {
  check(checkpoints.find((c) => c.id === id)?.modelCard.url === url, `model ${id} links to ${url}`);
}
// Model links as listed per category in the supplied list
const expectedCategoryModels: Record<string, string[]> = {
  "understanding-communication": ["rnj-1-instruct", "granite-4.2-8b", "ministral-3-8b-instruct-2512", "nemotron-3.5-bolt-e4b-bf16", "mellum-2.1-thinking", "qwen3.5-4b", "qwen3.5-9b", "gemma-4-12b-it"],
  "code-generation": ["granite-4.1-8b", "rnj-1-instruct", "mellum-2.1-thinking", "devstral-small-2-24b-instruct-2512", "qwen3.8-27b", "qwen3-coder-30b-a3b-instruct", "qwen3-coder-next", "qwen3.8-flash-next"],
  "quality-maintenance": ["rnj-1-instruct", "mellum-2.1-thinking", "devstral-small-2-24b-instruct-2512", "qwen3.8-27b", "recursive-flint-bf16", "devstral-2-123b-instruct-2512", "glm-5.3"],
  "advanced-agentic": ["mellum-2.1-thinking", "devstral-small-2-24b-instruct-2512", "recursive-flint-bf16", "nemotron-3.5-super-vl-120b-a12b-bf16", "qwen3.8-flash-next", "beam-1.0-501b-a23b", "glm-5.3-bf16"],
};
for (const [cat, ids] of Object.entries(expectedCategoryModels)) {
  const actual = categoryCandidates.filter((c) => c.categoryId === cat).map((c) => c.checkpointId).sort();
  check(JSON.stringify(actual) === JSON.stringify([...ids].sort()), `${cat}: candidate checkpoints match the supplied link list`);
}

const expectedTaskDatasetUrls: Record<string, string[]> = {
  "code-explanation": ["https://huggingface.co/datasets/TIGER-Lab/SWE-QA-Pro-Bench"],
  "reading-understanding-code": ["https://huggingface.co/datasets/cruxeval-org/cruxeval"],
  summarization: ["https://huggingface.co/datasets/JetBrains-Research/lca-module-summarization", "https://huggingface.co/datasets/nebius/SWE-rebench-V2-PRs"],
  "codebase-qa": ["https://huggingface.co/datasets/TIGER-Lab/SWE-QA-Pro-Bench"],
  "technical-questions": ["https://huggingface.co/datasets/freshstack/queries-oct-2024"],
  "docstring-generation": ["https://huggingface.co/datasets/SciCodePile/SciCode-Doc-Alignment"],
  "commit-pr-description": ["https://huggingface.co/datasets/JetBrains-Research/lca-commit-message-generation", "https://huggingface.co/datasets/nebius/SWE-rebench-V2-PRs"],
  "error-stack-trace-diagnosis": ["https://huggingface.co/datasets/OrderLab/distdebug-bench", "https://github.com/OrderLab/distdebug-bench"],
  "single-function": ["https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets"],
  "multifile-project": ["https://github.com/Klavis-AI/Multi-step-SWE"],
  "fim-autocomplete": ["https://huggingface.co/datasets/microsoft/delulu-fim-benchmark", "https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets/gauntlet-live-js-2026-11"],
  "boilerplate-scaffolding": ["https://huggingface.co/datasets/eth-sri/AutoBaxBench", "https://github.com/vitejs/vite/tree/main/packages/create-vite"],
  "unfamiliar-code-generation": ["https://github.com/MAPS-research/NovelAPIBench"],
  "test-generation": ["https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets"],
  debugging: ["https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets"],
  refactoring: ["https://zenodo.org/records/17655592"],
  "code-review": ["https://huggingface.co/datasets/foundry-ai/swe-prbench"],
  "type-annotation-lint": ["https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets"],
  "migration-upgrades": ["https://github.com/Klavis-AI/Multi-step-SWE"],
  "performance-suggestions": ["https://huggingface.co/datasets/gso-bench/gso", "https://gso-bench.github.io/"],
  "technical-debt": ["https://zenodo.org/records/3666840"],
  "tool-function-calling": ["https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard", "https://gorilla.cs.berkeley.edu/blogs/13_bfcl_v3_multi_turn.html", "https://huggingface.co/datasets/ScaleAI/MCP-Atlas"],
  "multi-step-workflows": ["https://github.com/Klavis-AI/Multi-step-SWE"],
  "language-translation": ["https://github.com/DeepSoftwareAnalytics/RepoTransBench"],
  "optimization-profiling": ["https://huggingface.co/datasets/gso-bench/gso", "https://huggingface.co/datasets/AdAstraAbyssoque/accelerate-bench"],
};
for (const [taskId, urls] of Object.entries(expectedTaskDatasetUrls)) {
  const available = new Set(
    taskDatasets
      .filter((td) => td.taskId === taskId)
      .flatMap((td) => getDataset(td.datasetId)?.links.map((l) => l.url) ?? []),
  );
  for (const url of urls) check(available.has(url), `task ${taskId} reaches ${url}`);
}

const allUrls = [...checkpoints.map((c) => c.modelCard.url), ...datasets.flatMap((d) => d.links.map((l) => l.url))];
for (const url of allUrls) {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    /* invalid */
  }
  check(!!parsed && parsed.protocol === "https:", `${url} is a valid https URL`);
  check(!url.includes("utm_"), `${url} has no tracking parameters`);
}

// Worked navigation checks
const traceRow = taskDatasets.find(
  (td) => td.taskId === "error-stack-trace-diagnosis" && td.datasetId === "distdebug-bench" && td.eligibleSubset?.count === 28,
);
check(!!traceRow, "DistDebug-Bench 28 trace-bearing cases on Error/stack trace diagnosis");
check(
  taskDatasets.some((td) => td.taskId === "error-stack-trace-diagnosis" && td.datasetId === "distdebug-bench" && td.slice.includes("120")),
  "DistDebug-Bench wider 120-incident set on Error/stack trace diagnosis",
);
const optimization = taskDatasets.filter((td) => td.taskId === "optimization-profiling").map((td) => td.datasetId);
check(optimization.includes("gso") && optimization.includes("accelerate-bench"), "GSO and Accelerate Bench on Optimization");
check(getDataset("accelerate-bench")?.name === "Accelerate Bench v1.1", "Accelerate Bench v1.1 exact spelling");
const accel = taskDatasets.find((td) => td.datasetId === "accelerate-bench");
check(accel?.eligibleSubset?.count === null, "Accelerate Bench license-compatible subset has no invented count");
const gauntletTasks = taskDatasets.filter((td) => td.datasetId === "gauntlet-live").map((td) => td.taskId).sort();
check(
  JSON.stringify(gauntletTasks) === JSON.stringify(["debugging", "fim-autocomplete", "single-function", "test-generation", "type-annotation-lint"]),
  "Gauntlet Live is mapped to its 5 tasks",
);

// Contracts and historical rows
check(contracts.every((c) => c.status === "draft" && c.prompt.kind === "proposed"), "all contracts are drafts with proposed prompts");
check(historicalObservations.length === 4, "4 historical observations");
check(runs.length === 0, "no current runs recorded (empty state expected)");

// Hosting: the values must agree with each other. Nothing is recomputed into the data.
const cents = (n: number) => Math.round(n * 100);
const sameCents = (a: number, b: number) => cents(a) === cents(b);
const sum = (ns: number[]) => ns.reduce((n, x) => n + x, 0);
check(PRICE_NOTE === "Prices checked Nov 26, 2026. Live inventory and enterprise pricing unverified.", "hosting: price note text is exact");
check(hostingGroups.length === 3, "hosting: 3 hosting groups");
for (const r of gpuPlanRows) {
  check(sameCents(r.cadPerHour * externalPlan.hoursPerCheckpoint, r.cost4h), `hosting: ${r.label} 4 h cost = CAD/h × 4`);
}
check(sameCents(sum(gpuPlanRows.map((r) => r.cost4h)), gpuPlanTotals.coreCad), "hosting: GPU plan total matches rows (915.44)");
check(gpuPlanRows.length * externalPlan.hoursPerCheckpoint === gpuPlanTotals.serverHours, "hosting: 32 server-hours");
const chineseIds = checkpoints.filter((c) => c.chinesePublisher).map((c) => c.id).sort();
check(JSON.stringify(gpuPlanRows.map((r) => r.checkpointId).sort()) === JSON.stringify(chineseIds), "hosting: GPU plan covers exactly the Chinese checkpoints on our list");
const line = (item: string) => budgetLines.find((b) => b.item === item)?.cad ?? NaN;
check(sameCents(line("8 GPU checkpoints"), gpuPlanTotals.coreCad), "hosting: budget GPU line = GPU plan total");
check(sameCents(line("8 GPU checkpoints") * 0.2, line("20% reserve")), "hosting: 20% reserve");
check(sameCents(line("8 GPU checkpoints") + line("20% reserve"), line("Budget before tax")), "hosting: budget before tax adds up");
check(sameCents(line("Budget before tax") * 0.13, line("13% Ontario HST")), "hosting: 13% HST");
check(sameCents(line("Budget before tax") + line("13% Ontario HST"), line("Total")), "hosting: total adds up");
const h100Rows = gpuPlanRows.filter((r) => r.configKey === "1x-h100");
check(h100Rows.length === 4 && sameCents(sum(h100Rows.map((r) => r.cost4h)), spendStages[0].cad ?? NaN), "hosting: stage 1 = four single-H100 rows (62.24)");
const runpod = providerComparison.find((p) => p.provider === "Runpod Pods")!;
const montreal = providerComparison.find((p) => p.provider === "GPU Cloud Montréal")!;
const movedRows = gpuPlanRows.filter((r) => fallback.movedLabels.includes(r.label));
check(movedRows.length === fallback.movedLabels.length && movedRows.every((r) => r.configKey === "8x-b300"), "hosting: fallback moves only B300 rows");
check(
  sameCents((runpod.b300x8PerHour * externalPlan.cadPerUsd - montreal.b300x8PerHour) * externalPlan.hoursPerCheckpoint * movedRows.length, fallback.extraCad),
  "hosting: Runpod fallback extra cost adds up",
);
const smallCad = sum(gpuPlanRows.filter((r) => r.configKey === "1x-h100" || r.configKey === "4x-h100").map((r) => r.cost4h));
const nH200 = gpuPlanRows.filter((r) => r.configKey === "8x-h200").length;
const nB300 = gpuPlanRows.filter((r) => r.configKey === "8x-b300").length;
for (const p of providerComparison) {
  const fx = p.currency === "USD" ? externalPlan.cadPerUsd : 1;
  const total = smallCad + (p.h200x8PerHour * nH200 + p.b300x8PerHour * nB300) * fx * externalPlan.hoursPerCheckpoint;
  check(sameCents(total, p.pilotCad), `hosting: ${p.provider} pilot total reproduces (${p.pilotCad})`);
  if (p.perGpu) {
    check(sameCents(p.perGpu.h200 * 8, p.h200x8PerHour) && sameCents(p.perGpu.b300 * 8, p.b300x8PerHour), `hosting: ${p.provider} 8-GPU prices = per-GPU × 8`);
    check(!!p.source && p.source.startsWith("https://"), `hosting: ${p.provider} has a pricing-page source`);
  }
}
check(openDecisions.length === 5 && openDecisions.every((d) => d.status === "to-define"), "hosting: 5 open decisions, all To define");

const chinese = checkpoints.filter((c) => c.chinesePublisher).map((c) => c.name);
console.log(`Chinese-publisher checkpoints flagged (${chinese.length}): ${chinese.join(", ")}`);

console.log(`${ok.length} checks passed`);
if (errors.length) {
  console.error(`${errors.length} checks FAILED:`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

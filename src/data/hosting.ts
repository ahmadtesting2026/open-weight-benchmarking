import type {
  BudgetLine,
  GpuPlanRow,
  HostingGroup,
  OpenDecision,
  ProviderQuote,
} from "./types";

/**
 * Hosting plan, as supplied in the hosting brief. Everything here is a plan or a
 * proposal: nothing has been provisioned. Prices are quotes, not commitments.
 */

export const PRICE_NOTE =
  "Prices checked Nov 26, 2026. Live inventory and enterprise pricing unverified.";

// ── Hosting groups ─────────────────────────────────────────────────────────

export const hostingGroups: HostingGroup[] = [
  {
    id: "commercial",
    name: "Commercial tools",
    examples: "Claude, Devin, Copilot",
    whereItRuns: "Internal LLM gateway / vendor APIs",
    dataAllowed: "Approved datasets, internal code and PRs",
    role: "Control / baseline",
  },
  {
    id: "open-weight",
    name: "Open-weight models (non-Chinese)",
    examples: "Every non-Chinese checkpoint on this site",
    whereItRuns: "Our own GPUs",
    dataAllowed: "Approved datasets, internal code and PRs",
    role: "Main test; candidates for production",
  },
  {
    id: "chinese-open-weight",
    name: "Chinese open-weight models",
    examples: "Qwen and Z.ai checkpoints on this site",
    whereItRuns: "External GPU providers, off our network",
    dataAllowed: "Public data only",
    role: "Comparison only, unless separately approved",
  },
];

export const hostingRules: string[] = [
  "No proprietary code, credentials, customer data or confidential data leaves the network.",
  "Only permitted datasets and sanitized results move between internal and external environments.",
  "Kaggle is for small-model experiments and early testing only. Paid external GPU instances are for large models, multi-GPU runs and load testing.",
];

// ── Off-network: external GPU benchmarks (proposed) ────────────────────────

export const externalPlan = {
  status: "proposed" as const,
  primaryProvider: "GPU Cloud (Montréal)",
  primaryReasons: [
    "All four server configs in one Canadian region",
    "Hourly CAD billing",
    "We can run our own inference server and collect GPU metrics",
  ],
  backupProviders: ["Runpod", "Nebius"],
  backupNote: "Backups for the large-model runs.",
  hoursPerCheckpoint: 4,
  cadPerUsd: 1.4,
  assumptions: [
    "4 hours per checkpoint (1 h load and warm-up + 3 h benchmark)",
    "CAD 1.40 per USD",
    "Public data only",
    "Evaluator runs on the rented server",
    "Each instance is deleted after its results are exported",
    "Hibernated disks cost CAD 0.02–0.19/h",
  ],
  notIncluded: ["Staff time", "Separately quoted network/storage", "Model licence fees"],
  pilotNote:
    "These are pilot allocations. The full 25-task program needs a runtime estimate based on measured throughput (agentic tasks especially).",
};

export const gpuPlanRows: GpuPlanRow[] = [
  { label: "Qwen3.5-4B", precision: "BF16", gpuConfig: "1× H100 PCIe 80 GB", configKey: "1x-h100", cadPerHour: 3.89, cost4h: 15.56, checkpointId: "qwen3.5-4b" },
  { label: "Qwen3.5-9B", precision: "BF16", gpuConfig: "1× H100 PCIe 80 GB", configKey: "1x-h100", cadPerHour: 3.89, cost4h: 15.56, checkpointId: "qwen3.5-9b" },
  { label: "Qwen3.8-27B", precision: "BF16", gpuConfig: "1× H100 PCIe 80 GB", configKey: "1x-h100", cadPerHour: 3.89, cost4h: 15.56, checkpointId: "qwen3.8-27b" },
  { label: "Qwen3-Coder-30B-A3B-Instruct", precision: "BF16", gpuConfig: "1× H100 PCIe 80 GB", configKey: "1x-h100", cadPerHour: 3.89, cost4h: 15.56, checkpointId: "qwen3-coder-30b-a3b-instruct" },
  { label: "Qwen3-Coder-Next", precision: "BF16", gpuConfig: "4× H100 PCIe 80 GB", configKey: "4x-h100", cadPerHour: 15.5, cost4h: 62.0, checkpointId: "qwen3-coder-next" },
  { label: "Qwen3.8-Flash-Next", precision: "BF16", gpuConfig: "8× H200 141 GB", configKey: "8x-h200", cadPerHour: 49.43, cost4h: 197.72, checkpointId: "qwen3.8-flash-next" },
  { label: "GLM-5.3", precision: "Official FP8", gpuConfig: "8× H200 141 GB", configKey: "8x-h200", cadPerHour: 49.43, cost4h: 197.72, checkpointId: "glm-5.3" },
  { label: "GLM-5.3-BF16", precision: "BF16", gpuConfig: "8× B300 288 GB", configKey: "8x-b300", cadPerHour: 98.94, cost4h: 395.76, checkpointId: "glm-5.3-bf16" },
];

/** Quoted total for the 8 models. validate:data checks it matches the rows. */
export const gpuPlanTotals = {
  coreCad: 915.44,
  serverHours: 32,
};

export const gpuPlanNotes: string[] = [
  "Small models share one H100 type on purpose, giving a fair latency/throughput baseline.",
  "Start the 27B/30B runs at moderate context and low concurrency.",
];

/**
 * Pilot budget for the 8 models on our list. The brief's budget also covered four
 * watchlist models and a Qwen3.8-Max API allowance; those are left out, so the
 * reserve, tax and total are recomputed from the brief's own rates (20%, 13%).
 */
export const budgetNote =
  "Covers only the 8 models on our list. Reserve, tax and total recomputed from the brief's rates.";

export const budgetLines: BudgetLine[] = [
  { item: "8 GPU checkpoints", cad: 915.44, kind: "line", note: null },
  { item: "20% reserve", cad: 183.09, kind: "line", note: "Slow startup, failed runs, reruns" },
  { item: "Budget before tax", cad: 1098.53, kind: "subtotal", note: null },
  { item: "13% Ontario HST", cad: 142.81, kind: "line", note: "Illustrative" },
  { item: "Total", cad: 1241.34, kind: "total", note: null },
];

export const spendStages: { title: string; detail: string; cad: number | null }[] = [
  {
    title: "Run the four single-H100 checkpoints first",
    detail: "Validates the harness, token accounting and scoring.",
    cad: 62.24,
  },
  {
    title: "Then release the larger budget",
    detail: "B300 time is CAD 98.94/h, so that's the expensive place to find an evaluator bug.",
    cad: null,
  },
];

export const fallback = {
  detail:
    "If Montréal has H200s but no B300s, move only GLM-5.3-BF16 to Runpod.",
  extraCad: 6.99,
  movedLabels: ["GLM-5.3-BF16"],
  toProvider: "Runpod Pods",
};

export const providerComparison: ProviderQuote[] = [
  { provider: "GPU Cloud Montréal", currency: "CAD", h200x8PerHour: 49.43, b300x8PerHour: 98.94, pilotCad: 915.44, note: "One provider, Canadian region, CAD billing" },
  { provider: "Crusoe", currency: "USD", h200x8PerHour: 43.2, b300x8PerHour: 79.2, pilotCad: 1051.6, note: "Price from Dec 1. The lower rate before then ends before the pilot can start." },
  { provider: "Runpod Pods", currency: "USD", h200x8PerHour: 42.32, b300x8PerHour: 71.92, pilotCad: 1000.98, note: "First backup; confirm 8 interconnected GPUs on one host" },
  { provider: "Nebius", currency: "USD", h200x8PerHour: 43.2, b300x8PerHour: 76.0, pilotCad: 1033.68, note: "Second quote for both large configs" },
  { provider: "Together GPU Clusters", currency: "USD", h200x8PerHour: 47.92, b300x8PerHour: 91.92, pilotCad: 1175.7, note: "Starts at 8 GPUs; Kubernetes or Slurm" },
  {
    provider: "Hyperstack",
    currency: "USD",
    h200x8PerHour: 31.92,
    b300x8PerHour: 59.2,
    pilotCad: 813.26,
    perGpu: { h200: 3.99, b300: 7.4 },
    note: "Cheapest quote here. Billed per minute, no data-transfer charges. The pricing page lists no regions, so confirm a Canadian one. Confirm H200 and B300 stock too: one price tracker lists its H200 as sold out.",
    source: "https://www.hyperstack.cloud/gpu-pricing",
  },
  {
    provider: "Fireworks AI (on-demand)",
    currency: "USD",
    h200x8PerHour: 64,
    b300x8PerHour: 120,
    pilotCad: 1513.04,
    perGpu: { h200: 8, b300: 15 },
    note: "Managed platform, about twice the rented-server price. Region-restricted deployments cost 1.5×. Confirm we can serve our own checkpoints and see GPU metrics.",
    source: "https://fireworks.ai/pricing",
  },
];



export const otherProviders: { provider: string; detail: string }[] = [
  { provider: "DigitalOcean", detail: "USD 35.76/h for 8× H200 on demand. 8× B300 spot at USD 49.36/h; spot pricing and availability can change." },
  { provider: "Hugging Face Inference Endpoints", detail: "Simplest managed option for GLM-5.3 FP8. 8× H200 in Oregon, USD 40/h per replica." },
  { provider: "Lambda", detail: "USD 3.79/h for 1× H100 PCIe, or USD 1.09/h for an A6000 48 GB (4B/9B models)." },
  { provider: "OVHcloud", detail: "CAD 4.59/h for 1× H100 80 GB. Confirm the physical region separately from the billing currency." },
  { provider: "CoreWeave", detail: "USD 50.44/h for 8× H200; 8× B300 needs a sales quote." },
  { provider: "AWS EC2 Capacity Blocks (N. Virginia)", detail: "8× H200 at USD 63.158/h, 8× B300 at USD 129.168/h. Sold in day blocks; 24 h of B300 is USD 3,100.03." },
  { provider: "Microsoft Azure", detail: "ND GB300 v6 has 4 GPUs per VM. An 8-GPU config needs two connected VMs; get a regional quote." },
];

// ── Hardware and precision ─────────────────────────────────────────────────

export const hardwareNotes: string[] = [
  "Pick GPU configs per model from total parameters (including embedding/prediction parameters for Qwen3.8-Flash-Next), precision, context length and serving needs.",
  "Not every quantization format works on every model, engine or GPU. T4s (Kaggle) have no native FP8.",
  "Set a reference-precision baseline first, then compare supported quantized versions on quality, latency and memory.",
];

export const loadTesting = {
  concurrencyLevels: ["1", "5", "10", "25", "50", "100+"],
  formula: "replicas = ceil(peak req/s ÷ (capacity per replica × target utilization))",
  note: "A future step. Load testing will set replica counts; no numbers are filled in yet.",
};

// ── Open hosting decisions ─────────────────────────────────────────────────

export const openDecisions: OpenDecision[] = [
  { topic: "Internal GPUs", detail: "Type, count, VRAM, interconnect", status: "to-define" },
  { topic: "GPU reservation", detail: "Dedicated or shared", status: "to-define" },
  { topic: "External hosting", detail: "Provider, security approval and budget", status: "to-define" },
  { topic: "Chinese models", detail: "Approval path and evaluation boundaries", status: "to-define" },
  { topic: "Precision", detail: "Supported precisions/quantization per model", status: "to-define" },
];

export const gpuPlanRowForCheckpoint = (checkpointId: string) =>
  gpuPlanRows.find((r) => r.checkpointId === checkpointId);

import { categories } from "./categories";
import { tasks } from "./tasks";
import { checkpoints } from "./checkpoints";
import { categoryCandidates } from "./categoryCandidates";
import { datasets } from "./datasets";
import { taskDatasets, optimizationProtocolComparison } from "./taskDatasets";
import { contracts } from "./contracts";
import { runs } from "./runs";
import { historicalObservations, historicalNotSupplied, watchlistLabels } from "./historical";
export * from "./hosting";
import type {
  Category,
  CategoryCandidate,
  CategoryId,
  Checkpoint,
  Dataset,
  EvaluationContract,
  Task,
  TaskDataset,
} from "./types";

export {
  categories,
  tasks,
  checkpoints,
  categoryCandidates,
  datasets,
  taskDatasets,
  contracts,
  runs,
  historicalObservations,
  historicalNotSupplied,
  watchlistLabels,
  optimizationProtocolComparison,
};
export type * from "./types";

const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((i) => [i.id, i]));
const categoryMap = byId(categories);
const taskMap = byId(tasks);
const checkpointMap = byId(checkpoints);
const datasetMap = byId(datasets);

export const getCategory = (id: string): Category | undefined => categoryMap.get(id as CategoryId);
export const getTask = (id: string): Task | undefined => taskMap.get(id);
export const getCheckpoint = (id: string): Checkpoint | undefined => checkpointMap.get(id);
export const getDataset = (id: string): Dataset | undefined => datasetMap.get(id);
export const getContract = (taskId: string): EvaluationContract | undefined =>
  contracts.find((c) => c.taskId === taskId);

export const sortedCategories = () => [...categories].sort((a, b) => a.order - b.order);
export const tasksByCategory = (categoryId: string) => tasks.filter((t) => t.categoryId === categoryId);
export const candidatesByCategory = (categoryId: string) =>
  categoryCandidates.filter((c) => c.categoryId === categoryId);

/** Category pool for a task, split into indicated priorities and the rest. */
export function candidatesForTask(taskId: string): {
  priority: CategoryCandidate[];
  pool: CategoryCandidate[];
} {
  const task = getTask(taskId);
  if (!task) return { priority: [], pool: [] };
  const inCategory = candidatesByCategory(task.categoryId);
  return {
    priority: inCategory.filter((c) => c.priorityTaskIds.includes(taskId)),
    pool: inCategory.filter((c) => !c.priorityTaskIds.includes(taskId)),
  };
}

export const datasetsForTask = (taskId: string): TaskDataset[] =>
  taskDatasets.filter((td) => td.taskId === taskId);
export const usesOfDataset = (datasetId: string): TaskDataset[] =>
  taskDatasets.filter((td) => td.datasetId === datasetId);
export const entriesForCheckpoint = (checkpointId: string): CategoryCandidate[] =>
  categoryCandidates.filter((c) => c.checkpointId === checkpointId);

export const taskHref = (task: Task) => `/explorer/${task.categoryId}/${task.id}`;
export const categoryHref = (id: string) => `/explorer/${id}`;
export const modelHref = (id: string) => `/explorer/models/${id}`;
export const datasetHref = (id: string) => `/explorer/datasets/${id}`;

// ── Sizes and parameter bands ──────────────────────────────────────────────

/** Exact size text first, as supplied. */
export function sizeSummary(c: Checkpoint): { primary: string; detail: string[] } {
  if (c.effectiveParamLabel && c.totalParamsB === null) {
    return {
      primary: `${c.effectiveParamLabel} (effective-parameter label)`,
      detail: ["Total parameters not supplied in the notes."],
    };
  }
  const distinct = [...new Set(c.parameterReports.map((r) => r.text))].filter(
    (t) => !t.startsWith("Labelled"),
  );
  if (distinct.length === 0 && c.sizeFromName) {
    return {
      primary: `${c.sizeFromName} (from checkpoint name)`,
      detail: ["Parameter count not supplied in the notes."],
    };
  }
  if (distinct.length === 0) return { primary: "Not supplied", detail: [] };
  const detail: string[] = [];
  const sizes = new Set(distinct.map((t) => parseFloat(t)));
  if (sizes.size > 1) {
    return {
      primary: `${distinct.join(" vs ")} (reports differ)`,
      detail: c.parameterReports.map((r) => `${r.text} (${r.source})`),
    };
  }
  if (distinct.length > 1) {
    for (const r of c.parameterReports) detail.push(`${r.text} (${r.source})`);
  }
  if (c.extraParams) detail.push(c.extraParams);
  return { primary: distinct[0], detail };
}

export interface BandResult {
  labels: string[];
  note: string | null;
}

export const BAND_DEFINITIONS = [
  { name: "Small", range: "4–8B" },
  { name: "Small–medium", range: "8–14B" },
  { name: "Medium–large", range: "24B+" },
  { name: "Large", range: "70B+" },
  { name: "Frontier", range: "100–800B+" },
];

function bandsForSize(b: number): BandResult {
  if (b < 4) return { labels: [], note: "Below the small band (4–8B)" };
  if (b < 8) return { labels: ["Small"], note: null };
  if (b === 8) return { labels: ["Small", "Small–medium"], note: "On the 8B boundary" };
  if (b <= 14) return { labels: ["Small–medium"], note: null };
  if (b < 24) return { labels: [], note: "In the gap between 14B and 24B" };
  if (b < 70) return { labels: ["Medium–large"], note: null };
  if (b < 100) return { labels: ["Large"], note: null };
  return { labels: ["Large", "Frontier"], note: "bands overlap above 100B" };
}

/** Band by total parameters. Boundary, gap and overlap cases are labelled, not forced. */
export function bandsFor(c: Checkpoint): BandResult {
  if (c.effectiveParamLabel && c.totalParamsB === null) {
    return { labels: [], note: "Effective-parameter label" };
  }
  if (c.totalParamsB !== null) {
    const r = bandsForSize(c.totalParamsB);
    const notes = [r.note];
    if (c.extraParams) notes.push("banded by core parameters");
    return { labels: r.labels, note: notes.filter(Boolean).join("; ") || null };
  }
  if (c.sizeFromName) {
    return bandsForSize(parseFloat(c.sizeFromName));
  }
  const reported = c.parameterReports
    .map((p) => parseFloat(p.text))
    .filter((n) => !Number.isNaN(n));
  if (reported.length > 0) {
    const order = BAND_DEFINITIONS.map((b) => b.name);
    const labels = [...new Set(reported.flatMap((n) => bandsForSize(n).labels))].sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    );
    const sizes = [...new Set(reported)].map((n) => `${n}B`).join(" vs ");
    return { labels, note: `Reports disagree (${sizes})` };
  }
  return { labels: [], note: "Not banded: size not supplied" };
}

// ── Search ─────────────────────────────────────────────────────────────────

export type SearchKind = "task" | "model" | "dataset";

export interface SearchEntry {
  kind: SearchKind;
  id: string;
  title: string;
  context: string;
  href: string;
  haystack: string;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const compact = (s: string) => normalize(s).replace(/\s+/g, "");

export const searchIndex: SearchEntry[] = [
  ...tasks.map((t) => ({
    kind: "task" as const,
    id: t.id,
    title: t.name,
    context: getCategory(t.categoryId)?.name ?? "",
    href: taskHref(t),
    haystack: [t.name, t.id].join(" "),
  })),
  ...checkpoints.map((c) => ({
    kind: "model" as const,
    id: c.id,
    title: c.name,
    context: [c.repoId, ...c.appendixLabels.filter((l) => l !== c.name)].join(" · "),
    href: modelHref(c.id),
    haystack: [c.name, c.repoId, c.publisher, ...c.appendixLabels].join(" "),
  })),
  ...datasets.map((d) => ({
    kind: "dataset" as const,
    id: d.id,
    title: d.name,
    context: usesOfDataset(d.id)
      .map((u) => getTask(u.taskId)?.name)
      .filter((v, i, a): v is string => !!v && a.indexOf(v) === i)
      .join(" · "),
    href: datasetHref(d.id),
    haystack: [d.name, d.id, ...d.links.map((l) => l.url)].join(" "),
  })),
];

export function search(query: string): Record<SearchKind, SearchEntry[]> {
  const result: Record<SearchKind, SearchEntry[]> = { task: [], model: [], dataset: [] };
  const q = normalize(query);
  if (!q) return result;
  const tokens = q.split(" ");
  const cq = compact(query);
  for (const entry of searchIndex) {
    const hay = normalize(entry.haystack);
    const matches = tokens.every((t) => hay.includes(t)) || compact(entry.haystack).includes(cq);
    if (matches) result[entry.kind].push(entry);
  }
  return result;
}

// ── Run formatting helpers ────────────────────────────────────────────────

export type CostPerSuccess =
  | { status: "not-measured" }
  | { status: "undefined" }
  | { status: "measured"; value: number };

/** Cost per successful task = attributable cost of all attempts ÷ successes. */
export function costPerSuccessfulTask(run: (typeof runs)[number]): CostPerSuccess {
  if (run.attributableCostUsd.status !== "measured" || run.successes.status !== "measured") {
    return { status: "not-measured" };
  }
  if (run.successes.value === 0) return { status: "undefined" };
  return { status: "measured", value: run.attributableCostUsd.value / run.successes.value };
}

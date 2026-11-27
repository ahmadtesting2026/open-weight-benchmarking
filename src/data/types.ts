/**
 * Typed records for the benchmark explorer.
 *
 * Factual metadata (categories, checkpoints, datasets) is kept separate from
 * task-specific usage notes (category candidate entries, task–dataset rows,
 * evaluation contracts). Unknown values are `null`; never guess a value to
 * fill a field.
 */

export type CategoryId =
  | "understanding-communication"
  | "code-generation"
  | "quality-maintenance"
  | "advanced-agentic";

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  /** One-line purpose shown on the project plan. */
  purpose: string;
  order: number;
  /** How the candidate pool for this category is defined in the notes. */
  poolNote: string;
}

export interface Task {
  /** Stable slug, unique across all categories. */
  id: string;
  categoryId: CategoryId;
  name: string;
  /** Short practical description of what a developer asks for. */
  description: string;
  /** "What decides which model fits", where the notes supply it. */
  fitNote: string | null;
}

/** A link copied from the supplied link list. Never constructed. */
export type LinkKind =
  | "Model card"
  | "Dataset card"
  | "Repository"
  | "Dataset record (Zenodo)"
  | "Benchmark site"
  | "Guide";

export interface SourceLink {
  kind: LinkKind;
  /** Descriptive link text, e.g. "DistDebug-Bench dataset". */
  label: string;
  url: string;
}

/** A parameter value as stated in a specific note, kept verbatim. */
export interface ParameterReport {
  text: string;
  /** Which appendix table the text came from. */
  source: string;
}

export interface Checkpoint {
  id: string;
  publisher: string;
  /** Name as given on the model card link text. */
  name: string;
  /** Hugging Face repository id taken from the supplied URL. */
  repoId: string;
  /** Every label used for this checkpoint in the appendix, verbatim. */
  appendixLabels: string[];
  /** Exact total parameters in billions, when stated. */
  totalParamsB: number | null;
  /** Active parameters per token in billions (mixture-of-experts), when stated. */
  activeParamsB: number | null;
  /** True when "~" or "class" qualified a stated size. */
  sizeApproximate: boolean;
  /** Publisher effective-parameter label, e.g. "E4B". Retained verbatim. */
  effectiveParamLabel: string | null;
  /** Additional weights that count toward hosting memory. */
  extraParams: string | null;
  /** Size as derived only from the checkpoint name (no parameter note supplied). */
  sizeFromName: string | null;
  parameterReports: ParameterReport[];
  architecture: "dense" | "mixture-of-experts" | null;
  /** Native / original precision as published. Null = not recorded in notes. */
  nativePrecision: string | null;
  precisionSource: string | null;
  /** Published license as reported in the notes. */
  license: string | null;
  /** Publisher is a Chinese company → off-network comparison per project policy. */
  chinesePublisher: boolean;
  modelCard: SourceLink;
  /** How the appendix label was tied to this exact checkpoint. */
  identitySource: string;
}

export type ExecutionEnvironment =
  | { kind: "on-prem"; basis: "stated-in-notes"; note: string }
  | { kind: "on-prem"; basis: "not-stated"; note: string }
  | { kind: "off-network-public-data"; basis: "stated-in-notes"; note: string }
  | { kind: "off-network-public-data"; basis: "project-policy"; note: string };

/** A model's entry in one category's candidate table (usage note). */
export interface CategoryCandidate {
  id: string;
  categoryId: CategoryId;
  checkpointId: string;
  /** Label exactly as it appears in this category's table. */
  labelAsSupplied: string;
  /** Parameter text as it appears in this category's table, if any. */
  parametersAsSupplied: string | null;
  /** Priority-task wording, verbatim. */
  priorityTasksText: string;
  /** Tasks the notes indicate as priorities for this entry. */
  priorityTaskIds: string[];
  /**
   * Task ids whose mapping from free text is an editorial interpretation
   * (e.g. "multifile scaffolding" → boilerplate scaffolding).
   */
  interpretiveTaskIds: string[];
  /** e.g. "Small candidate for all five tasks" — the entry applies category-wide. */
  categoryWide: string | null;
  /** Reason for inclusion, verbatim. Null when the notes give none. */
  reason: string | null;
  /** Publisher- or third-party-reported scores. Reported, not verified. */
  reportedClaims: string[];
  environment: ExecutionEnvironment;
  /** Citation label in the appendix, e.g. "huggingface.co". */
  citationAsSupplied: string | null;
}

export interface DatasetSize {
  count: number | null;
  unit: string;
  /** Verbatim size text from the notes. */
  text: string;
}

export interface Dataset {
  id: string;
  /** Exact published spelling. */
  name: string;
  publicRelease: string;
  version: string | null;
  pinnedRevision: string | null;
  /** Dataset license, as reported. */
  license: string;
  /** Upstream-code or per-row terms, kept separate from the dataset license. */
  upstreamTerms: string | null;
  size: DatasetSize;
  coverage: string;
  provenance: string | null;
  /** Date of the underlying source items, where known. */
  sourceItemDate: string | null;
  /** Training-data exposure for the candidates. "unknown" until checked. */
  exposure: "unknown";
  /** Enterprise legal/approval status — separate from license text. */
  enterpriseApproval: "Not reviewed";
  links: SourceLink[];
  /** Citation labels used in the appendix rows, verbatim (no URL invented). */
  citationsAsSupplied: string[];
}

export interface CoverageGap {
  /** Short heading, e.g. "Unit vs integration". */
  title: string;
  detail: string;
}

/** A dataset's use on one task (usage note). Many-to-many. */
export interface TaskDataset {
  id: string;
  taskId: string;
  datasetId: string;
  /** The dataset's role on this task. */
  role: string;
  /** Slice, track or split to use. */
  slice: string;
  /** Concrete coverage on this task. */
  coverage: string;
  /** Release / size text from this appendix row, verbatim. */
  rowReleaseAndSize: string;
  /** License text from this appendix row, verbatim. */
  rowLicense: string;
  eligibleSubset: {
    description: string;
    /** Only set when a count was supplied. */
    count: number | null;
    unit: string | null;
  } | null;
  /** What to benchmark / what it measures, from the notes. */
  usageNote: string;
  gaps: CoverageGap[];
}

export type ContractStatus = "draft" | "frozen";

export interface EvaluationContract {
  taskId: string;
  status: ContractStatus;
  prompt: { kind: "proposed" | "frozen"; text: string };
  inputArtifacts: string[];
  successCriteria: string[];
  scoringMethod: string[];
  /** Thresholds that have not been agreed render as "To define". */
  thresholds: { label: string; value: string | null }[];
}

/** A measured value, or explicitly not measured. A measured 0 is still measured. */
export type Measured<T> = { status: "measured"; value: T } | { status: "not-measured" };

export interface BenchmarkRun {
  runId: string;
  taskId: string;
  checkpointId: string;
  datasetId: string;
  datasetSplit: string;
  attempts: number;
  successes: Measured<number>;
  /** Quality score in [0, 1] or a rubric-normalised fraction. */
  quality: Measured<number>;
  qualityLabel: string | null;
  latencyP50Ms: Measured<number>;
  latencyP95Ms: Measured<number>;
  /** Attributable serving cost of all attempts in USD. */
  attributableCostUsd: Measured<number>;
}

export interface HistoricalObservation {
  modelLabel: string;
  inputTokens: number;
  outputTokens: number;
  /** Kept as a string to preserve every supplied digit. */
  reportedCost: string;
  latencyMs: number;
  finish: string;
  quality: string;
}

// ── Hosting (proposal and quotes) ──────────────────────────────────────────

export interface HostingGroup {
  id: "commercial" | "open-weight" | "chinese-open-weight";
  name: string;
  examples: string;
  whereItRuns: string;
  dataAllowed: string;
  role: string;
}

/** One rented server for one checkpoint, as quoted. Amounts in CAD for the whole server. */
export interface GpuPlanRow {
  label: string;
  precision: string | null;
  gpuConfig: string;
  /** Short key for the config, used to reprice the row with other providers. */
  configKey: "1x-h100" | "4x-h100" | "8x-h200" | "8x-b300";
  cadPerHour: number;
  cost4h: number;
  /** Existing checkpoint this row is for. */
  checkpointId: string;
}

export interface BudgetLine {
  item: string;
  cad: number;
  kind: "line" | "subtotal" | "total";
  note: string | null;
}

export interface ProviderQuote {
  provider: string;
  currency: "CAD" | "USD";
  h200x8PerHour: number;
  b300x8PerHour: number;
  /** Pilot total for the 8 models, CAD (recomputed from the quoted hourly rates). */
  pilotCad: number;
  note: string;
  /** Set when the provider quotes per GPU: the 8-GPU prices above are these × 8. */
  perGpu?: { h200: number; b300: number };
  /** Pricing page the quote was read from, when we checked it ourselves. */
  source?: string;
}


export interface OpenDecision {
  topic: string;
  detail: string;
  status: "to-define";
}

# Open-Weight Models for Development Tasks

A local web UI for planning which self-hosted open-weight models we should benchmark for each routine developer task. It shows the project plan, a benchmark explorer (categories → tasks → models and datasets), the methodology, and a results page.

This phase is **UI only**. Nothing here runs benchmarks, downloads models or datasets, calls inference APIs or starts GPU jobs. All content is static research data stored in the repository.

## Start

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit and component tests (Vitest + Testing Library) |
| `npm run test:e2e` | Browser tests against a production server (Playwright). Run `npx playwright install chromium` once first. |
| `npm run validate:data` | Data-integrity checks: counts, relationships, supplied links, worked navigation checks |
| `npm run catalog` | Regenerate the model and dataset catalog below from `src/data` |
| `npm run check` | validate:data, lint, typecheck, test and build in one go |

## Pages

- `/`: Project plan. The decision, the categories, the five-step sequence, scope and the parameter bands.
- `/explorer`: Benchmark explorer. Category rail (a menu on phones), task pages, model and dataset records, and search at `/explorer/search?q=`.
- `/explorer/[category]/[task]`: Evaluation contract, models to benchmark, and datasets and coverage.
- `/methodology`: Harness, quality, freshness, cost and speed, and the decision rule.
- `/hosting`: Where models run: the three hosting groups, the proposed external GPU pilot (quotes, budget, providers), hardware notes and open decisions.
- `/results`: Current open-weight runs (empty for now), historical commercial observations and the earlier watchlist.

Model tables have a **Model origin** filter (all, exclude Chinese models, Chinese models only). It is driven by the `chinesePublisher` field on each checkpoint.

## Editing the research data

All content lives in `src/data/` as typed records with stable IDs. Facts are kept separate from task-specific usage notes.

| File | Holds | Kind |
|---|---|---|
| `types.ts` | All record types | n/a |
| `categories.ts` | The 4 categories | Fact |
| `tasks.ts` | The 25 tasks | Fact |
| `checkpoints.ts` | The 20 checkpoints: sizes, precision, license, model card, appendix labels | Fact |
| `datasets.ts` | The 22 datasets: release, size, license, upstream terms, links | Fact |
| `categoryCandidates.ts` | The 30 category entries: priority tasks, verbatim reasons, environment | Usage note |
| `taskDatasets.ts` | Task ↔ dataset mapping: role, slice, eligible subset, coverage gaps | Usage note |
| `contracts.ts` | One draft evaluation contract per task | Proposal |
| `runs.ts` | Current benchmark runs (empty) | Measurement |
| `hosting.ts` | Hosting groups, proposed external GPU plan, budget, provider quotes, open decisions | Proposal / quote |
| `historical.ts` | Historical commercial rows and watchlist labels, verbatim | Historical |

Conventions:

- Unknown values are `null` and display as "Not supplied", "Not recorded" or "To define". Never fill a gap with a guess.
- Licenses are recorded as reported in the notes. `enterpriseApproval` is a separate field.
- Eligible-subset counts are set only when the notes supply them (DistDebug-Bench's 28 trace-bearing reports, for example). Otherwise they show "Not yet counted".
- Where free-text priority wording is mapped to a task by interpretation, the task id is also listed in `interpretiveTaskIds`, and the UI marks it "mapped from wording".
- To freeze a contract, set `status: "frozen"` and `prompt.kind: "frozen"`.

### Adding a benchmark run

Append a `BenchmarkRun` to `src/data/runs.ts`. Each measured field is either `{ status: "measured", value }` or `{ status: "not-measured" }`, so a measured zero never looks the same as a missing value. Cost per successful task is computed as attributable cost ÷ successes, and shows "Undefined" when there are zero successes.

After editing data, run `npm run validate:data` and `npm run catalog`.

## Catalog

<!-- CATALOG:START -->
_Generated from `src/data` by `npm run catalog`. Do not edit by hand._

### Models (20 checkpoints, 30 category entries)

| Checkpoint | Publisher | Total / active size | Band | License (as reported) | Chinese publisher | Categories | Model card |
|---|---|---|---|---|---|---|---|
| Essential AI Rnj-1 Instruct | Essential AI | 8.3B dense vs 8B dense (reports differ) | Small / Small–medium | Apache 2.0 | No | Understanding, Generation, Quality | [EssentialAI/rnj-1-instruct](https://huggingface.co/EssentialAI/rnj-1-instruct) |
| IBM Granite 4.2 8B | IBM | 8B (from checkpoint name) | Small / Small–medium | Not supplied | No | Understanding | [ibm-granite/granite-4.2-8b](https://huggingface.co/ibm-granite/granite-4.2-8b) |
| Ministral 3 8B Instruct 2512 | Mistral AI | 8B (from checkpoint name) | Small / Small–medium | Not supplied | No | Understanding | [mistralai/Ministral-3-8B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512) |
| NVIDIA Nemotron 3.5 Bolt E4B BF16 | NVIDIA | E4B (effective-parameter label) | Not banded | Not supplied | No | Understanding | [nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16) |
| JetBrains Mellum 2.1 Thinking | JetBrains | 12B total / 2.5B active | Small–medium | Apache 2.0 | No | Understanding, Generation, Quality, Agentic | [JetBrains/Mellum2.1-12B-A2.5B-Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking) |
| Qwen3.5-4B | Qwen | 4B (from checkpoint name) | Small | Not supplied | Yes (off-network, public data only) | Understanding | [Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) |
| Qwen3.5-9B | Qwen | 9B (from checkpoint name) | Small–medium | Not supplied | Yes (off-network, public data only) | Understanding | [Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B) |
| Google Gemma 4 12B IT | Google | 12B (from checkpoint name) | Small–medium | Not supplied | No | Understanding | [google/gemma-4-12b-it](https://huggingface.co/google/gemma-4-12b-it) |
| IBM Granite 4.1 8B | IBM | 8B | Small / Small–medium | Apache 2.0 | No | Generation | [ibm-granite/granite-4.1-8b](https://huggingface.co/ibm-granite/granite-4.1-8b) |
| Mistral Devstral Small 2 24B Instruct | Mistral AI | 24B | Medium–large | Apache 2.0 | No | Generation, Quality, Agentic | [mistralai/Devstral-Small-2-24B-Instruct-2512](https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512) |
| Qwen3.8-27B | Qwen | 27B language model | Medium–large | Apache 2.0 | Yes (off-network, public data only) | Generation, Quality | [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) |
| Qwen3-Coder-30B-A3B-Instruct | Qwen | 30B class / ~3B active | Medium–large | Apache 2.0 | Yes (off-network, public data only) | Generation | [Qwen/Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct) |
| Qwen3-Coder-Next | Qwen | 80B total / 3B active | Large | Apache 2.0 | Yes (off-network, public data only) | Generation | [Qwen/Qwen3-Coder-Next](https://huggingface.co/Qwen/Qwen3-Coder-Next) |
| Qwen3.8-Flash-Next | Qwen | 125B core / 6B active, plus 51B embeddings and 4B prediction parameters | Large / Frontier | Qwen Community 1.0 | Yes (off-network, public data only) | Generation, Agentic | [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) |
| Recursive Flint BF16 | Recursive | 39.8B total / ~2.5B active | Medium–large | Not supplied | No | Quality, Agentic | [RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint) |
| Mistral Devstral 2 123B Instruct | Mistral AI | 123B | Large / Frontier | Modified MIT license | No | Quality | [mistralai/Devstral-2-123B-Instruct-2512](https://huggingface.co/mistralai/Devstral-2-123B-Instruct-2512) |
| Z.ai GLM-5.3 | Z.ai | 753B total | Large / Frontier | Not supplied | Yes (off-network, public data only) | Quality | [zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3) |
| NVIDIA Nemotron 3.5 Super VL 120B-A12B BF16 | NVIDIA | 120B total / 12B active | Large / Frontier | Not supplied | No | Agentic | [nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16) |
| Reflection Beam 1.0 501B-A23B | Reflection | 501B total / 23B active | Large / Frontier | Not supplied | No | Agentic | [reflection/Beam-1.0-501B-A23B](https://huggingface.co/reflection/Beam-1.0-501B-A23B) |
| Z.ai GLM-5.3 BF16 | Z.ai | ~753B total | Large / Frontier | Not supplied | Yes (off-network, public data only) | Agentic | [zai-org/GLM-5.3-BF16](https://huggingface.co/zai-org/GLM-5.3-BF16) |

### Datasets (22)

| Dataset | Public release | Examples | Dataset license | Upstream terms | Used for | Links |
|---|---|---|---|---|---|---|
| SWE-QA-Pro Bench | Mar 20, 2026 | 260 test questions | MIT | None stated | Code explanation; Q&A about a codebase | [Dataset card](https://huggingface.co/datasets/TIGER-Lab/SWE-QA-Pro-Bench) |
| CRUXEval | Jan 2024 | 800 Python functions | MIT | None stated | Reading/understanding code | [Dataset card](https://huggingface.co/datasets/cruxeval-org/cruxeval) |
| Long Code Arena – Module Summarization | Jun 2024 | 216 test examples | Apache 2.0 | None stated | Summarization (file/module/PR) | [Dataset card](https://huggingface.co/datasets/JetBrains-Research/lca-module-summarization) |
| SWE-rebench-V2-PRs | Mar 3, 2026 announcement | 126,300 PRs | CC BY 4.0 | None stated | Summarization (file/module/PR); Commit message/PR description generation | [Dataset card](https://huggingface.co/datasets/nebius/SWE-rebench-V2-PRs) |
| FreshStack – Questions and Answers | Apr 2025 publication; Oct 2024 snapshot | 672 test questions | CC BY-SA 4.0 | None stated | Answering technical questions | [Dataset card](https://huggingface.co/datasets/freshstack/queries-oct-2024) |
| SciCode-Doc-Alignment | Mar 13, 2026 dataset upload | 500,000 function–docstring pairs | Apache 2.0 | None stated | Documentation/docstring generation | [Dataset card](https://huggingface.co/datasets/SciCodePile/SciCode-Doc-Alignment) |
| Long Code Arena – Commit Message Generation | Jun 2024 | 163 test commits | Apache 2.0 | None stated | Commit message/PR description generation | [Dataset card](https://huggingface.co/datasets/JetBrains-Research/lca-commit-message-generation) |
| DistDebug-Bench | Nov 2026 | 120 incidents | MIT for benchmark annotations, metadata, and code | Upstream terms apply to issues and attachments. | Error/stack trace diagnosis | [Dataset card](https://huggingface.co/datasets/OrderLab/distdebug-bench) · [Repository](https://github.com/OrderLab/distdebug-bench) |
| Gauntlet Live — Python and JS/TS | Nov 2026 | 122 candidate PRs before filtering | MIT repository | Check each upstream project’s license; upstream code retains its license. | Single function / snippet; Fill-in-the-middle / autocomplete; Test generation (unit / integration); Debugging / troubleshooting; Type annotation / lint fixes | [Repository](https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets) · [Repository](https://github.com/abhishekcpp007/gauntlet-harness/tree/main/datasets/gauntlet-live-js-2026-11) |
| Multi-step SWE | Nov 4, 2026 | 69 tasks (workflows) | MIT benchmark | Bundled upstream code retains its license. | Multifile / project-level generation; Code migration / version upgrades; Multi-step agentic workflows — repo navigation and multi-file edits | [Repository](https://github.com/Klavis-AI/Multi-step-SWE) |
| Microsoft Delulu | May 2026 | 947 unique prompts | Code licensed per row | Select MIT, Apache-2.0, or BSD rows. | Fill-in-the-middle / autocomplete | [Dataset card](https://huggingface.co/datasets/microsoft/delulu-fim-benchmark) |
| AutoBaxBench | Dec 2025 | 560 tasks | MIT | None stated | Boilerplate scaffolding | [Dataset card](https://huggingface.co/datasets/eth-sri/AutoBaxBench) |
| Vite starter templates | Nov 2026 update | 2 selected Solid presets | MIT | None stated | Boilerplate scaffolding | [Repository](https://github.com/vitejs/vite/tree/main/packages/create-vite) |
| NovelAPIBench | June 2, 2026 | 1,670 published tasks | Apache-2.0 for benchmark records and harness | Source excerpts retain upstream licenses. | Unfamiliar code generation | [Repository](https://github.com/MAPS-research/NovelAPIBench) |
| SWE-Refactor v2 | Nov 19, 2025 | 1,099 refactorings | CC BY 4.0 for this dataset version | None stated | Refactoring | [Dataset record (Zenodo)](https://zenodo.org/records/17655592) |
| SWE-PRBench | Mar 2026 | 350 PRs | CC BY 4.0 | None stated | Code review / PR review | [Dataset card](https://huggingface.co/datasets/foundry-ai/swe-prbench) |
| GSO | May 30, 2025 | 102 tasks | MIT dataset | None stated | Performance optimization suggestions; Optimization — performance / profiling | [Dataset card](https://huggingface.co/datasets/gso-bench/gso) · [Benchmark site](https://gso-bench.github.io/) |
| MLCQ | Feb 2020 | 15,000 Java code samples (approx.) | CC BY | None stated | Technical debt identification | [Dataset record (Zenodo)](https://zenodo.org/records/3666840) |
| Berkeley Function Calling Leaderboard — multi-turn split | Sep 2024 | 800 cases | Apache-2.0 | None stated | Tool / function calling | [Dataset card](https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard) · [Guide](https://gorilla.cs.berkeley.edu/blogs/13_bfcl_v3_multi_turn.html) |
| MCP-Atlas | Jan 2026 paper | 500 public tasks | CC BY 4.0 dataset | None stated | Tool / function calling | [Dataset card](https://huggingface.co/datasets/ScaleAI/MCP-Atlas) |
| RepoTransBench | Feb 2026 expanded publication | 1,897 repository samples | MIT project | Upstream repository licenses apply. | Translation between programming languages | [Repository](https://github.com/DeepSoftwareAnalytics/RepoTransBench) |
| Accelerate Bench v1.1 | Nov 16, 2026 paper | 32 CPU application tasks | Author-owned code and tools are Apache-2.0 | Third-party terms vary, including noncommercial terms for ABySS. | Optimization — performance / profiling | [Dataset card](https://huggingface.co/datasets/AdAstraAbyssoque/accelerate-bench) |

Categories: Understanding & Communication, Code Generation, Quality & Maintenance, Advanced / Agentic Programming. Enterprise approval for every dataset: Not reviewed.
<!-- CATALOG:END -->

## Known gaps

- Most eligible-subset counts (license-compatible, developer-tool, single-function and similar) were not supplied and show as "Not yet counted".
- Source links come from the link list supplied with the brief. They are checked for format and placement by `validate:data`, not fetched live.
- Training-data exposure is "unknown" for every dataset until overlap checks are run.

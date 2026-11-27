import type { Metadata } from "next";
import { ModelLink, NotSupplied, ToDefine } from "@/components/bits";
import {
  budgetLines,
  budgetNote,
  externalPlan,
  fallback,
  gpuPlanNotes,
  gpuPlanRows,
  gpuPlanTotals,
  hardwareNotes,
  hostingGroups,
  hostingRules,
  loadTesting,
  openDecisions,
  otherProviders,
  PRICE_NOTE,
  providerComparison,
  spendStages,
} from "@/data";

export const metadata: Metadata = {
  title: "Hosting",
  description:
    "Where each group of models runs, and the proposed rented GPUs for Chinese models.",
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function HostingPage() {
  const [stage1, stage2] = spendStages;
  const smallServersCad = gpuPlanRows
    .filter((r) => r.configKey === "1x-h100" || r.configKey === "4x-h100")
    .reduce((n, r) => n + r.cost4h, 0);

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Hosting</p>
        <h1>Where the models run</h1>
        <p className="lede">
          Non-Chinese open-weight models run on our own GPUs. Chinese models run on
          rented GPUs off our network, on public data only. Nothing has been set up yet. The
          provider and budget are proposals, and every price is a quote.
        </p>
      </header>

      <section className="section" aria-labelledby="groups">
        <h2 id="groups">Who runs where</h2>
        <div className="table-wrap">
          <table className="table-stack">
            <thead>
              <tr>
                <th scope="col">Group</th>
                <th scope="col">Where it runs</th>
                <th scope="col">Data allowed</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {hostingGroups.map((g) => (
                <tr key={g.id}>
                  <th scope="row">
                    {g.name}
                    <span className="sub">{g.examples}</span>
                  </th>
                  <td data-label="Where it runs">{g.whereItRuns}</td>
                  <td data-label="Data allowed">{g.dataAllowed}</td>
                  <td data-label="Role">{g.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="prose after-block">
          {hostingRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="off-network">
        <h2 id="off-network">
          Off our network: rented GPUs <span className="tag tag--proposed">Proposed</span>
        </h2>
        <div className="callout callout--gap" role="note" aria-label="Price note">
          <p>{PRICE_NOTE}</p>
        </div>
        <p className="prose after-block">
          Proposed provider: <strong>{externalPlan.primaryProvider}</strong>. It has every server
          type we need in one Canadian region, bills hourly in CAD, and lets us run our own model
          server and read GPU metrics. Backups: {externalPlan.backupProviders.join(" and ")}.
        </p>
        <p className="prose after-block small muted">
          Each model gets {externalPlan.hoursPerCheckpoint} hours (1 h to load and warm up, 3 h of
          tests) on a whole server, which is deleted once results are exported. USD is converted at
          CAD {externalPlan.cadPerUsd.toFixed(2)}. Staff time, separately quoted network and
          storage, and model licence fees aren&rsquo;t included. This only covers the pilot: the
          full 25-task program needs an estimate based on measured speed.
        </p>

        <div className="subsection">
          <h3 id="gpu-plan">GPU plan per model</h3>
          <div className="table-wrap">
            <table className="table-stack">
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Server</th>
                  <th scope="col" className="numeric">CAD/h</th>
                  <th scope="col" className="numeric">4 h cost</th>
                </tr>
              </thead>
              <tbody>
                {gpuPlanRows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">
                      {r.checkpointId ? <ModelLink id={r.checkpointId} label={r.label} /> : r.label}
                      <span className="sub">
                        {r.precision ?? <NotSupplied>Precision not supplied</NotSupplied>}
                      </span>
                    </th>
                    <td data-label="Server">{r.gpuConfig}</td>
                    <td className="numeric" data-label="CAD/h">
                      <span className="num">{money(r.cadPerHour)}</span>
                    </td>
                    <td className="numeric" data-label="4 h cost">
                      <span className="num">{money(r.cost4h)}</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" colSpan={3}>
                    All {gpuPlanRows.length} models ({gpuPlanTotals.serverHours} server-hours)
                  </th>
                  <td className="numeric" data-label="Total">
                    <strong className="num">
                      {money(gpuPlanTotals.coreCad)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="small muted after-block prose">{gpuPlanNotes.join(" ")}</p>
        </div>

        <div className="subsection">
          <h3 id="budget">Pilot budget (CAD)</h3>
          <p className="section-intro small muted">{budgetNote}</p>
          <div className="table-wrap table-narrow">
            <table>
              <tbody>
                {budgetLines.map((b) => (
                  <tr key={b.item}>
                    <th scope="row">
                      {b.kind === "line" ? b.item : <strong>{b.item}</strong>}
                      {b.note ? <span className="sub">{b.note}</span> : null}
                    </th>
                    <td className="numeric">
                      <span className="num">{b.kind === "line" ? money(b.cad) : <strong>{money(b.cad)}</strong>}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="prose after-block">
            <li>
              <strong>Start small:</strong> {stage1.title} (CAD {money(stage1.cad ?? 0)})
              to check the harness, token counts and scoring. {stage2.title}: {stage2.detail}
            </li>
            <li>
              <strong>Fallback:</strong> {fallback.detail} About CAD {money(fallback.extraCad)} more.
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="providers">
        <h2 id="providers">Provider prices</h2>
        <p className="section-intro">
          Hourly price for a whole 8-GPU server at each provider. {PRICE_NOTE}
        </p>
        <div className="table-wrap">
          <table className="table-stack">
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col" className="numeric">8× H200 /h</th>
                <th scope="col" className="numeric">8× B300 /h</th>
                <th scope="col" className="numeric">
                  GPU compute, 8 core models (CAD, before reserve and tax)<sup>*</sup>
                </th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {providerComparison.map((p) => (
                <tr key={p.provider}>
                  <th scope="row">
                    {p.provider}
                    {p.source ? (
                      <span className="sub">
                        <a href={p.source} rel="noopener noreferrer" target="_blank">
                          Pricing page
                        </a>
                      </span>
                    ) : null}
                  </th>
                  <td className="numeric" data-label="8× H200 /h">
                    <span className="num">
                      {p.currency} {money(p.h200x8PerHour)}
                    </span>
                    {p.perGpu ? <span className="sub">{p.currency} {money(p.perGpu.h200)} per GPU</span> : null}
                  </td>
                  <td className="numeric" data-label="8× B300 /h">
                    <span className="num">
                      {p.currency} {money(p.b300x8PerHour)}
                    </span>
                    {p.perGpu ? <span className="sub">{p.currency} {money(p.perGpu.b300)} per GPU</span> : null}
                  </td>
                  <td className="numeric" data-label="GPU compute, 8 core models (CAD, before reserve and tax)">
                    <span className="num">{money(p.pilotCad)}</span>
                  </td>
                  <td data-label="Note">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted after-block prose">
          <sup>*</sup> Includes CAD {money(smallServersCad)} for the five smaller H100 runs, kept at
          Montréal prices in every row. USD is converted at CAD {externalPlan.cadPerUsd.toFixed(2)}.
          This is compute only. The full ask is the{" "}
          <a href="#budget">pilot budget</a> above.
        </p>
        <details className="after-block prose">
          <summary>Other quotes</summary>
          <ul>
            {otherProviders.map((o) => (
              <li key={o.provider}>
                <strong>{o.provider}:</strong> {o.detail}
              </li>
            ))}
          </ul>
        </details>

      </section>

      <section className="section" aria-labelledby="decisions">
        <h2 id="decisions">Still to decide</h2>
        <div className="table-wrap">
          <table className="table-stack">
            <tbody>
              {openDecisions.map((d) => (
                <tr key={d.topic}>
                  <th scope="row">{d.topic}</th>
                  <td data-label="What needs deciding">{d.detail}</td>
                  <td data-label="Status">
                    <ToDefine />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="prose after-block small muted">
          {hardwareNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>
            Later, load tests at {loadTesting.concurrencyLevels.join(", ")} concurrent requests will
            set how many copies of each model to run: <code>{loadTesting.formula}</code>.
          </li>
        </ul>
      </section>
    </div>
  );
}

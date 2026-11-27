import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExplorerShell } from "@/components/ExplorerShell";
import {
  BandText,
  Breadcrumbs,
  EnvironmentText,
  NotSupplied,
  SizeText,
  SourceLink,
} from "@/components/bits";
import {
  categoryHref,
  checkpoints,
  entriesForCheckpoint,
  getCategory,
  getCheckpoint,
  getTask,
  gpuPlanRowForCheckpoint,
  PRICE_NOTE,
  taskHref,
} from "@/data";

export function generateStaticParams() {
  return checkpoints.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/explorer/models/[id]">): Promise<Metadata> {
  const { id } = await params;
  const cp = getCheckpoint(id);
  return { title: cp ? cp.name : "Model not found" };
}

export default async function ModelPage({ params }: PageProps<"/explorer/models/[id]">) {
  const { id } = await params;
  const cp = getCheckpoint(id);
  if (!cp) notFound();
  const entries = entriesForCheckpoint(cp.id);
  const gpuPlan = gpuPlanRowForCheckpoint(cp.id);

  return (
    <ExplorerShell currentRecord="models">
      <Breadcrumbs
        items={[
          { label: "Benchmark explorer", href: "/explorer" },
          { label: "All models", href: "/explorer/models" },
          { label: cp.name },
        ]}
      />
      <header className="page-header">
        <p className="eyebrow">Model record</p>
        <h1 className="model-name">{cp.name}</h1>
        <p>
          <SourceLink link={cp.modelCard} />
        </p>
      </header>

      <section className="section" aria-labelledby="facts">
        <h2 id="facts">Details</h2>
        <dl className="facts">
          <dt>Publisher</dt>
          <dd>{cp.publisher}</dd>
          <dt>Chinese model</dt>
          <dd>
            {cp.chinesePublisher ? (
              <>
                Yes
                <span className="sub">Only tested off our network, on public data.</span>
              </>
            ) : (
              "No"
            )}
          </dd>
          <dt>Repository</dt>
          <dd>
            <span className="model-name">{cp.repoId}</span>
          </dd>
          <dt>Names used in the notes</dt>
          <dd>
            <ul className="link-list">
              {cp.appendixLabels.map((l) => (
                <li key={l}>&ldquo;{l}&rdquo;</li>
              ))}
            </ul>
            <span className="sub">{cp.identitySource}</span>
          </dd>
          <dt>Size</dt>
          <dd>
            <SizeText checkpoint={cp} />
          </dd>
          <dt>Sizes in the notes</dt>
          <dd>
            {cp.parameterReports.length > 0 ? (
              <ul className="link-list">
                {cp.parameterReports.map((r) => (
                  <li key={r.text + r.source}>
                    <span className="num num--wrap">{r.text}</span>{" "}
                    <span className="muted">({r.source})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <NotSupplied>The notes don&rsquo;t give a size</NotSupplied>
            )}
          </dd>
          {cp.effectiveParamLabel ? (
            <>
              <dt>Effective-parameter label</dt>
              <dd>
                <span className="num">{cp.effectiveParamLabel}</span>{" "}
                <span className="muted">(the publisher&rsquo;s own label)</span>
              </dd>
            </>
          ) : null}
          {cp.extraParams ? (
            <>
              <dt>Extra weights</dt>
              <dd>{cp.extraParams}</dd>
            </>
          ) : null}
          <dt>Architecture</dt>
          <dd>
            {cp.architecture === "mixture-of-experts"
              ? "Mixture of experts"
              : cp.architecture === "dense"
                ? "Dense"
                : <NotSupplied>Not stated</NotSupplied>}
          </dd>
          <dt>Band</dt>
          <dd>
            <BandText checkpoint={cp} />
          </dd>
          <dt>License</dt>
          <dd>
            {cp.license ?? <NotSupplied />}
            <span className="sub">As listed in the notes. Internal approval: not reviewed.</span>
          </dd>
          {gpuPlan ? (
            <>
              <dt>GPU plan (proposed)</dt>
              <dd>
                {gpuPlan.gpuConfig}
                {gpuPlan.precision ? `, ${gpuPlan.precision}` : ""}:{" "}
                <span className="num">CAD {gpuPlan.cadPerHour.toFixed(2)}/h</span>,{" "}
                <span className="num">CAD {gpuPlan.cost4h.toFixed(2)}</span> for 4 h
                <span className="sub">
                  {PRICE_NOTE} <Link href="/hosting#gpu-plan">See the GPU plan</Link>
                </span>
              </dd>
            </>
          ) : null}
          <dt>Status</dt>
          <dd>Pending benchmark</dd>
        </dl>
      </section>

      <section className="section" aria-labelledby="entries">
        <h2 id="entries">
          Where it&rsquo;s tested <span className="muted num">({entries.length})</span>
        </h2>
        {entries.map((e) => {
          const cat = getCategory(e.categoryId)!;
          return (
            <article key={e.id} className="record" aria-labelledby={`entry-${e.id}`}>
              <div className="record__head">
                <h3 id={`entry-${e.id}`}>
                  <Link href={categoryHref(cat.id)}>{cat.name}</Link>
                </h3>
              </div>
              <dl className="facts">
                <dt>Name in the notes</dt>
                <dd>
                  &ldquo;{e.labelAsSupplied}&rdquo;
                  {e.parametersAsSupplied ? (
                    <span className="sub">Size given here: {e.parametersAsSupplied}</span>
                  ) : null}
                </dd>
                <dt>Focus tasks</dt>
                <dd>
                  {e.categoryWide ? <span className="sub">{e.categoryWide}</span> : null}
                  <ul className="link-list">
                    {e.priorityTaskIds.map((tid) => {
                      const t = getTask(tid)!;
                      return (
                        <li key={tid}>
                          <Link href={taskHref(t)}>{t.name}</Link>
                          {e.interpretiveTaskIds.includes(tid) ? (
                            <span className="link-kind">our reading</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  <span className="sub">The notes say: &ldquo;{e.priorityTasksText}&rdquo;</span>
                </dd>
                <dt>Why it&rsquo;s included</dt>
                <dd>{e.reason ?? <NotSupplied>No reason given in the notes. It&rsquo;s named for the tasks above.</NotSupplied>}</dd>
                <dt>Published scores</dt>
                <dd>
                  {e.reportedClaims.length > 0 ? (
                    <>
                      <ul>
                        {e.reportedClaims.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                      <span className="sub">Reported by the publisher or someone else. We haven&rsquo;t checked these.</span>
                    </>
                  ) : (
                    <NotSupplied>None given here</NotSupplied>
                  )}
                </dd>
                <dt>Where it runs</dt>
                <dd>
                  <EnvironmentText env={e.environment} detail />
                </dd>
                <dt>Source in the notes</dt>
                <dd>{e.citationAsSupplied ?? <NotSupplied>None given</NotSupplied>}</dd>
              </dl>
            </article>
          );
        })}
      </section>
    </ExplorerShell>
  );
}

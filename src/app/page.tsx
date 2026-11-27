import Link from "next/link";
import {
  BAND_DEFINITIONS,
  candidatesByCategory,
  categoryHref,
  checkpoints,
  sortedCategories,
  tasks,
  tasksByCategory,
} from "@/data";

export default function ProjectPlanPage() {
  const cats = sortedCategories();
  const entryCount = cats.reduce((n, c) => n + candidatesByCategory(c.id).length, 0);

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">Project plan</p>
        <h1>Open-Weight Models for Development Tasks</h1>
        <p className="lede">
          We want to cut AI coding costs by running open-weight models on our own GPUs and sending
          each developer request to a model that&rsquo;s good at that kind of task. This page covers
          what we&rsquo;ll test, which models and datasets we&rsquo;ll use, and how we&rsquo;ll
          choose.
        </p>
        <p>
          <Link href="/explorer" className="primary-link">
            Explore benchmark tasks
          </Link>
        </p>
      </header>

      <section className="section" aria-labelledby="decision">
        <h2 id="decision">The decision</h2>
        <div className="prose stack">
          <p>
            For each category, we pick a <strong>set of models</strong> that together cover every
            task in that category. One model might handle several tasks, and some models will only
            be good at a few.
          </p>
          <p>
            The models listed are the ones we plan to test. They are not a ranking. We only choose
            a model for a task after measuring its quality, speed and cost.
          </p>
          <p>
            We&rsquo;re only comparing open-weight models, starting with each publisher&rsquo;s
            original release. Past results from commercial models are on the{" "}
            <Link href="/results">Results</Link> page for reference.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="categories">
        <h2 id="categories">Categories</h2>
        <p>
          <span className="num">{tasks.length}</span> tasks in{" "}
          <span className="num">{cats.length}</span> categories, with{" "}
          <span className="num">{checkpoints.length}</span> models to test. Some models appear in
          more than one category, so the category lists add up to{" "}
          <span className="num">{entryCount}</span> entries.
        </p>
        <div className="table-wrap">
          <table className="table-stack">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col" className="numeric">
                  Tasks
                </th>
                <th scope="col" className="numeric">
                  Models
                </th>
                <th scope="col">What it covers</th>
                <th scope="col">
                  <span className="visually-hidden">Link</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.name}</th>
                  <td className="numeric" data-label="Tasks">
                    <span className="num">{tasksByCategory(c.id).length}</span>
                  </td>
                  <td className="numeric" data-label="Models">
                    <span className="num">{candidatesByCategory(c.id).length}</span>
                  </td>
                  <td data-label="What it covers">{c.purpose}</td>
                  <td>
                    <Link href={categoryHref(c.id)} aria-label={`Explore ${c.name}`}>
                      Explore
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="sequence">
        <h2 id="sequence">Steps</h2>
        <ol className="steps">
          <li>
            <div>
              <strong>Pick the tasks, models and datasets</strong>
              <p>Agree on the {tasks.length} tasks and what we&rsquo;ll test for each one.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Lock down the tests</strong>
              <p>
                Fix the dataset versions, prompts, scoring and pass marks so every model gets the
                same test.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Run small tests, then full ones</strong>
              <p>
                Start with Understanding &amp; Communication, then the other categories. Run the full
                tests once the small ones look right.
              </p>
            </div>
          </li>
          <li>
            <div>
              <strong>Check the results</strong>
              <p>Make sure results repeat, check the costs, and note what the datasets miss.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Recommend models</strong>
              <p>
                Say which set of models to use for each category, and which task each one handles.
                Until then, every task shows &ldquo;Pending benchmark&rdquo;.
              </p>
            </div>
          </li>
        </ol>
        <p className="small muted">No owners, dates or targets are set yet.</p>
      </section>

      <section className="section" aria-labelledby="scope">
        <h2 id="scope">Ground rules</h2>
        <ul className="prose">
          <li>Our internal code stays on our own servers. Self-hosted models run on our GPUs.</li>
          <li>
            Chinese models are only tested off our network, on public data. They&rsquo;re for
            comparison, not for internal use.
          </li>
          <li>
            We test each model as the publisher released it, including Instruct or Thinking
            versions. Smaller quantized versions come later, as a separate test.
          </li>
          <li>Security and vulnerability review isn&rsquo;t part of this project.</li>
        </ul>
        <p className="after-block">
          <Link href="/hosting">How each group of models is hosted</Link>, including the proposed external GPUs for
          Chinese models.
        </p>
      </section>

      <section className="section" aria-labelledby="bands">
        <h2 id="bands">Model sizes</h2>
        <p className="prose">
          We group models into rough size bands, but always show the exact size first. Some models
          sit on the edge between bands, so we label them that way instead of forcing them into
          one. For mixture-of-experts models we use the total size and show the active size next to
          it. Labels like E4B are kept as the publisher wrote them.
        </p>
        <div className="table-wrap table-narrow after-block">
          <table>
            <thead>
              <tr>
                <th scope="col">Band</th>
                <th scope="col">Rough size</th>
              </tr>
            </thead>
            <tbody>
              {BAND_DEFINITIONS.map((b) => (
                <tr key={b.name}>
                  <th scope="row">{b.name}</th>
                  <td>
                    <span className="num">{b.range}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted after-block prose">
          8B sits on the edge of small and small–medium. No band covers 14–24B. Medium–large runs
          from 24B to 70B. Above 100B, large and frontier overlap, so both are shown.
        </p>
      </section>
    </div>
  );
}

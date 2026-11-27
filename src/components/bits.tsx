import Link from "next/link";
import type { ReactNode } from "react";
import {
  bandsFor,
  getCheckpoint,
  modelHref,
  sizeSummary,
  type Checkpoint,
  type CoverageGap,
  type ExecutionEnvironment,
  type SourceLink as SourceLinkType,
} from "@/data";

/** Checkpoint name as a link to its record page. */
export function ModelLink({ id, label }: { id: string; label?: string }) {
  const cp = getCheckpoint(id);
  if (!cp) return <span className="not-supplied">Unknown checkpoint</span>;
  return (
    <Link href={modelHref(cp.id)} className="model-name">
      {label ?? cp.name}
    </Link>
  );
}

/**
 * External source link. Full form: descriptive label plus its kind.
 * Compact form (inside a row that already names the record): the kind alone,
 * e.g. "Model card", with the full label kept for screen readers.
 */
export function SourceLink({ link, compact = false }: { link: SourceLinkType; compact?: boolean }) {
  return (
    <>
      <a href={link.url} rel="noopener noreferrer" target="_blank" aria-label={`${link.label} (opens in a new tab)`}>
        {compact ? link.kind : link.label}
      </a>
      {compact ? null : <span className="link-kind">{link.kind}</span>}
    </>
  );
}

export function SourceLinks({ links, compact = false }: { links: SourceLinkType[]; compact?: boolean }) {
  return (
    <ul className="link-list">
      {links.map((l) => {
        const kindRepeats = links.filter((x) => x.kind === l.kind).length > 1;
        return (
          <li key={l.url}>
            <SourceLink link={l} compact={compact && !kindRepeats} />
          </li>
        );
      })}
    </ul>
  );
}

export function NotSupplied({ children = "Not supplied" }: { children?: ReactNode }) {
  return <span className="not-supplied">{children}</span>;
}

export function ToDefine() {
  return <span className="to-define">To define</span>;
}

export function SizeText({ checkpoint }: { checkpoint: Checkpoint }) {
  const s = sizeSummary(checkpoint);
  return (
    <>
      <span className="num num--wrap">
        {s.primary}
      </span>
      {s.detail.length > 0 ? (
        <span className="sub">
          {s.detail.join(" · ")}
        </span>
      ) : null}
    </>
  );
}

export function BandText({ checkpoint }: { checkpoint: Checkpoint }) {
  const b = bandsFor(checkpoint);
  return (
    <>
      {b.labels.length > 0 ? b.labels.join(" / ") : <NotSupplied>Not banded</NotSupplied>}
      {b.note ? (
        <span className="sub">
          {b.note}
        </span>
      ) : null}
    </>
  );
}

export function environmentLabel(env: ExecutionEnvironment): string {
  if (env.kind === "on-prem") {
    return env.basis === "stated-in-notes" ? "On-prem" : "On-prem (default)";
  }
  return env.basis === "stated-in-notes"
    ? "Off-network, public data only"
    : "Off-network, public data only (Chinese model rule)";
}

export function EnvironmentText({ env, detail = false }: { env: ExecutionEnvironment; detail?: boolean }) {
  return (
    <>
      {environmentLabel(env)}
      {env.kind === "off-network-public-data" ? (
        <span className="sub">
          For comparison only, not for internal use.
        </span>
      ) : null}
      {detail ? (
        <span className="sub">
          {env.note}
        </span>
      ) : null}
      <span className="sub">
        <Link href={env.kind === "on-prem" ? "/hosting#groups" : "/hosting#off-network"}>
          How it&rsquo;s hosted
        </Link>
      </span>
    </>
  );
}

export function GapCallout({ gaps }: { gaps: CoverageGap[] }) {
  if (gaps.length === 0) return null;
  return (
    <div className="callout callout--gap" role="note" aria-label="Coverage gaps">
      <h4>Coverage gaps</h4>
      <ul>
        {gaps.map((g) => (
          <li key={g.title}>
            <strong>{g.title}.</strong> {g.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`}>
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Project plan", match: (p: string) => p === "/" },
  { href: "/explorer", label: "Benchmark explorer", match: (p: string) => p.startsWith("/explorer") },
  { href: "/methodology", label: "Methodology", match: (p: string) => p.startsWith("/methodology") },
  { href: "/hosting", label: "Hosting", match: (p: string) => p.startsWith("/hosting") },
  { href: "/results", label: "Results", match: (p: string) => p.startsWith("/results") },
];

export function SiteNavLinks() {
  const pathname = usePathname() ?? "";
  return <NavList isActive={(m) => m(pathname)} exact={(href) => href === pathname} />;
}

/** Fallback rendered while the pathname is unknown (e.g. on a 404). */
export function SiteNavLinksStatic() {
  return <NavList isActive={() => false} exact={() => false} />;
}

function NavList({
  isActive,
  exact,
}: {
  isActive: (m: (p: string) => boolean) => boolean;
  exact: (href: string) => boolean;
}) {
  return (
    <ul>
      {ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={exact(item.href) ? "page" : undefined}
            data-active={isActive(item.match)}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

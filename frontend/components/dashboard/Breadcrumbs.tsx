"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { findNavItem, humanizeSegment } from "@/lib/dashboard/nav";

type BreadcrumbsProps = {
  className?: string;
};

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const current = findNavItem(pathname);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const navMatch = findNavItem(href);

    return {
      href,
      label: isLast && current ? current.label : (navMatch?.label ?? humanizeSegment(segment)),
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-xs">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-[#0A2540]/45 transition-colors hover:text-[#A82020]"
            aria-label="Dashboard"
          >
            <Home className="size-3.5" aria-hidden="true" />
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <li aria-hidden="true" className="text-[#0A2540]/25">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="min-w-0">
              {crumb.isLast ? (
                <span
                  aria-current="page"
                  className="block truncate font-semibold text-[#0A2540]"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="block truncate text-[#0A2540]/50 transition-colors hover:text-[#A82020]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarItem({
  label,
  href,
  icon: Icon,
  active,
  collapsed = false,
  onNavigate,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group/item relative flex h-10 items-center gap-3 px-3 text-[13px] font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
        collapsed && "justify-center px-0",
        active
          ? "bg-white/14 text-white"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      )}
    >
      {/* Indikator aktif: bar ice-blue di kiri */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 bg-[#8ACFF8] transition-all duration-300",
          active ? "opacity-100" : "scale-y-0 opacity-0"
        )}
      />

      <Icon
        className={cn(
          "size-4 shrink-0 transition-transform duration-300",
          active ? "text-[#8ACFF8]" : "text-white/60 group-hover/item:text-white",
          !collapsed && "group-hover/item:translate-x-0.5"
        )}
        aria-hidden="true"
      />

      {!collapsed ? (
        <span className="truncate">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </Link>
  );
}

export default SidebarItem;

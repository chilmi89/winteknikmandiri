import type { DashboardNavGroup } from "@/lib/dashboard/nav";
import type { DashboardNavItem } from "@/lib/dashboard/nav";
import SidebarItem from "./SidebarItem";

type SidebarGroupProps = {
  group: DashboardNavGroup;
  isActive: (item: DashboardNavItem) => boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarGroup({
  group,
  isActive,
  collapsed = false,
  onNavigate,
}: SidebarGroupProps) {
  return (
    <div className="space-y-1">
      {collapsed ? (
        <div
          aria-hidden="true"
          className="mx-auto mb-2 h-px w-6 bg-white/15"
        />
      ) : (
        <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">
          {group.title}
        </p>
      )}

      {group.items.map((item) => (
        <SidebarItem
          key={item.href}
          label={item.label}
          href={item.href}
          icon={item.icon}
          active={isActive(item)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export default SidebarGroup;

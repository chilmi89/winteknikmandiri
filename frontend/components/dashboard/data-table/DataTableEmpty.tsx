import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type DataTableEmptyProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function DataTableEmpty({
  icon,
  title,
  description,
  action,
  className,
}: DataTableEmptyProps) {
  return (
    <Empty className={cn("border-0 px-6 py-16", className)}>
      <EmptyHeader className="max-w-md">
        <EmptyMedia
          variant="icon"
          className="mb-1 size-10 rounded-md bg-slate-100 text-slate-500 [&_svg:not([class*='size-'])]:size-4"
        >
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-sm font-semibold text-slate-800">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-sm text-xs leading-relaxed text-slate-500">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent className="max-w-none">{action}</EmptyContent>}
    </Empty>
  );
}

export default DataTableEmpty;

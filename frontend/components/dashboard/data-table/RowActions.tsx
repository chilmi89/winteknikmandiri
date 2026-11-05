"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function RowActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Hapus",
  disabled = false,
  className,
}: RowActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              disabled={disabled}
              aria-label={editLabel}
              className="rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            />
          }
        >
          <Pencil aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{editLabel}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              disabled={disabled}
              aria-label={deleteLabel}
              className="rounded-md text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            />
          }
        >
          <Trash2 aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{deleteLabel}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export default RowActions;

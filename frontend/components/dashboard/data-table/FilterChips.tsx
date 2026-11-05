"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type FilterChipsProps = {
  chips: FilterChip[];
  onReset?: () => void;
};

export function FilterChips({ chips, onReset }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-[#F8FBFE] px-4 py-2.5">
      <span className="text-[11px] font-medium text-slate-500">Filter aktif:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="h-6 gap-1 rounded-full border border-slate-200 bg-white pr-1 pl-2.5 text-[11px] font-medium text-slate-600"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Hapus filter ${chip.label}`}
            className="flex size-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <X aria-hidden="true" className="size-3" />
          </button>
        </Badge>
      ))}
      {onReset && (
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={onReset}
          className="h-6 px-1 text-[11px] text-[#2279cf]"
        >
          Reset semua
        </Button>
      )}
    </div>
  );
}

export default FilterChips;

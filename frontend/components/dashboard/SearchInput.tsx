"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Tampilkan hint shortcut, mis. "⌘K". */
  shortcut?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
};

/**
 * Input pencarian reusable (tabel, toolbar, maupun search global navbar).
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Cari…",
  shortcut,
  className,
  inputClassName,
  ariaLabel = "Cari data",
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#0A2540]/35"
        aria-hidden="true"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-10 w-full border border-[#0A2540]/12 bg-white pr-16 pl-9 text-[13px] text-[#0A2540] transition-colors placeholder:text-[#0A2540]/35 focus:border-[#A82020] focus:outline-none [&::-webkit-search-cancel-button]:hidden",
          inputClassName
        )}
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Bersihkan pencarian"
          className="absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center text-[#0A2540]/40 transition-colors hover:text-[#A82020]"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 border border-[#0A2540]/15 bg-[#F4FAFE] px-1.5 py-0.5 text-[10px] font-semibold text-[#0A2540]/40">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}

export default SearchInput;

"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import {
  fetchJamOperasional,
  type JamOperasionalBundle,
  defaultJamOperasionalItems,
  defaultJamOperasionalSetting,
} from "@/lib/jamOperasional";

export default function JamOperasionalCard() {
  const [data, setData] = useState<JamOperasionalBundle>({
    setting: defaultJamOperasionalSetting,
    items: defaultJamOperasionalItems,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetchJamOperasional();
      if (active && res) {
        setData(res);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const { setting, items } = data;

  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden border border-[#0A2540]/10 bg-white p-7 shadow-[0_12px_32px_rgba(10,37,64,0.04)] transition-[border-color,box-shadow] duration-500 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.25)] sm:p-8">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
      />

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[#A82020]" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#A82020]">
              Jadwal Kerja Resmi
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#8ACFF8]/20 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#0A2540]">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {setting.badge_text || "Buka Hari Kerja"}
          </span>
        </div>

        <h3 className="mt-3 text-2xl font-bold text-[#0A2540]">
          {setting.title || "Jam Operasional"}
        </h3>

        <dl className="mt-6 divide-y divide-[#0A2540]/10 border-t border-[#0A2540]/10">
          {items.map((item) => (
            <div
              key={item.id || item.day_label}
              className="flex items-center justify-between py-3.5 text-sm"
            >
              <dt className="font-medium text-[#0A2540]">
                {item.day_label}
              </dt>
              <dd
                className={`font-mono text-xs font-semibold tabular-nums sm:text-sm ${
                  item.is_closed ? "text-[#A82020]" : "text-[#0A2540]/75"
                }`}
              >
                {item.hours}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 border-t border-[#0A2540]/10 pt-4 text-xs text-[#0A2540]/65">
        <p>{setting.note}</p>
      </div>
    </div>
  );
}

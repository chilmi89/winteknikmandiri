"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  defaultMisiItems,
  defaultVisiSetting,
  fetchVisiMisi,
  type MisiItem,
  type VisiSetting,
} from "@/lib/visiMisi";

export default function VisiMisiSection() {
  const [visi, setVisi] = useState<VisiSetting>(defaultVisiSetting);
  const [missions, setMissions] = useState<MisiItem[]>(defaultMisiItems);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchVisiMisi();
      if (active && data) {
        if (data.visi?.visi_text) {
          setVisi(data.visi);
        }
        if (Array.isArray(data.misi) && data.misi.length > 0) {
          setMissions(data.misi);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {/* Visi Card Elegan & Besar */}
      <ScrollReveal direction="up" delay={50}>
        <div className="group relative mt-10 border-l-4 border-[#A82020] border-y border-r border-[#0A2540]/10 bg-white p-7 shadow-[0_12px_32px_rgba(10,37,64,0.04)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.25)] sm:p-9">
          <span
            aria-hidden="true"
            className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A82020]">
            {visi.visi_eyebrow || "Visi Perusahaan"}
          </p>
          <blockquote className="mt-3">
            <p className="text-balance text-xl font-medium leading-relaxed tracking-[-0.015em] text-[#0A2540] sm:text-2xl">
              “{visi.visi_text}”
            </p>
          </blockquote>
        </div>
      </ScrollReveal>

      {/* Misi Cards — Format Grid 2x2 Luas, Besar & Ber-Hover Merah */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {missions.map((mission, index) => (
          <ScrollReveal
            key={mission.id || mission.code}
            delay={index * 100}
            direction="up"
            className="h-full"
          >
            <div className="group relative flex h-full flex-col justify-between overflow-hidden border border-[#0A2540]/10 bg-white p-7 sm:p-8 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.35),0_0_0_1px_rgba(168,32,32,0.25)]">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
              <span
                aria-hidden="true"
                className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
              />

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-[#A82020]">
                    {mission.code}
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#0A2540]/45 group-hover:text-[#A82020] transition-colors">
                    {mission.tagline}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#0A2540] transition-colors duration-300 group-hover:text-[#A82020]">
                  {mission.title}
                </h3>

                <p className="mt-2.5 text-[14.5px] leading-7 text-[#0A2540]/65 sm:text-[15px]">
                  {mission.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-[#0A2540]/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A2540]/50 transition-colors group-hover:text-[#A82020]">
                <span className="size-1.5 bg-[#A82020]" />
                Standar Prosedur CV WTM
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}

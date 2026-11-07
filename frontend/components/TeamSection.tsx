"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { fetchTeamMembers, type TeamMemberItem, defaultTeamMembers } from "@/lib/teamMembers";
import { waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMemberItem[]>(defaultTeamMembers);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchTeamMembers();
      if (active && Array.isArray(data) && data.length > 0) {
        setMembers(data);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member, index) => (
        <ScrollReveal
          key={member.id || index}
          delay={index * 80}
          direction="up"
          className="h-full"
        >
          <div className="group relative flex h-full flex-col overflow-hidden border border-[#0A2540]/10 bg-white transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#A82020] hover:shadow-[0_20px_45px_-20px_rgba(10,37,64,0.3),0_0_0_1px_rgba(168,32,32,0.2)]">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <span
              aria-hidden="true"
              className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0"
            />

            {/* Foto Tim Minimalis */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#0A2540]">
              <Image
                src={member.image_url || "/gallery/Foto%20TIM/Team%20Wahyu.png"}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.06] group-hover:brightness-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 via-transparent to-transparent"
              />
            </div>

            {/* Keterangan Super Minimalis: Nama Tim & Skill */}
            <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#A82020]" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#A82020]">
                    Teknisi Ahli WTM
                  </p>
                </div>

                <h3 className="mt-2 text-xl font-bold tracking-tight text-[#0A2540] transition-colors duration-300 group-hover:text-[#A82020]">
                  {member.name}
                </h3>

                <p className="mt-1 text-xs font-medium leading-relaxed text-[#0A2540]/70">
                  {member.skill}
                </p>
              </div>

              <div className="mt-5 border-t border-[#0A2540]/10 pt-3.5">
                <Link
                  href={waLink(
                    `Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai teknisi ${member.name} (${member.skill}) untuk proyek AC saya.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#A82020] transition-colors hover:text-[#8e1919] ${focusRing}`}
                >
                  Hubungi Teknisi
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

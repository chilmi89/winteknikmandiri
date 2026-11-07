"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchServiceCategories,
  fetchServiceItems,
  type ServiceCategory,
  type ServiceItem,
} from "@/lib/katalogLayanan";
import ServiceCard from "@/components/ServiceCard";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

export default function ServicesClientList() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const [cats, itms] = await Promise.all([
        fetchServiceCategories(),
        fetchServiceItems(),
      ]);
      if (active) {
        setCategories(cats);
        setItems(itms);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {/* Sticky Top Navbar Kategori */}
      {categories.length > 0 && (
        <div className="sticky top-20 z-30 transform-gpu border-b border-[#0A2540]/10 bg-white/98 shadow-[0_1px_3px_rgba(10,37,64,0.03)]">
          <nav
            aria-label="Daftar kategori layanan"
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
          >
            <ul className="flex gap-6 overflow-x-auto py-3.5 no-scrollbar">
              {categories.map((cat) => (
                <li key={cat.id} className="shrink-0">
                  <a
                    href={`#cat-${cat.code}`}
                    className={`group inline-flex items-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A2540]/65 transition-colors hover:text-[#A82020] sm:text-[11px] ${focusRing}`}
                  >
                    <span className="text-[#A82020] font-bold">{cat.code}</span>
                    <span>{cat.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Daftar Kartu Layanan Zigzag */}
      <section aria-label="Detail kartu layanan">
        {items.map((item, index) => (
          <div
            key={item.id}
            id={item.category_code ? `cat-${item.category_code}` : undefined}
            className={`border-t border-[#0A2540]/10 ${
              index % 2 === 1 ? "bg-[#8ACFF8]/20" : "bg-white"
            }`}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <ServiceCard item={item} reversed={index % 2 === 1} />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type StatItem = {
  raw: string;
  target: number;
  hasPlus: boolean;
  label: string;
  duration: number;
};

export interface StatsBarProps {
  items?: StatItem[];
  className?: string;
}

export const stats: StatItem[] = [
  {
    raw: "2014",
    target: 2014,
    hasPlus: false,
    label: "Berdiri sejak",
    duration: 750,
  },
  {
    raw: "364+",
    target: 364,
    hasPlus: true,
    label: "Proyek selesai",
    duration: 600,
  },
  {
    raw: "36+",
    target: 36,
    hasPlus: true,
    label: "Proyek berjalan",
    duration: 500,
  },
  {
    raw: "20+",
    target: 20,
    hasPlus: true,
    label: "Mitra korporasi",
    duration: 450,
  },
];

const numberFormatter = new Intl.NumberFormat("id-ID");

const emptySubscribe = () => () => {};

const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getReducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotionSnapshot = () => false;

/**
 * Kelas garis pemisah untuk grid 2 kolom (mobile) dan 4 kolom (desktop).
 * Dipakai juga saat jumlah item bukan kelipatan 4.
 */
const cellDividers = [
  "border-b border-r sm:border-b-0 sm:border-r",
  "border-b sm:border-b-0 sm:border-r",
  "border-r sm:border-b-0",
  "",
];

type StatCellProps = {
  stat: StatItem;
  index: number;
  isActive: boolean;
  hasFinished: boolean;
  hasStarted: boolean;
  reducedMotion: boolean;
  mounted: boolean;
  onComplete: (index: number) => void;
  className?: string;
};

function StatCell({
  stat,
  index,
  isActive,
  hasFinished,
  hasStarted,
  reducedMotion,
  mounted,
  onComplete,
  className = "",
}: StatCellProps) {
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    if (reducedMotion || hasFinished) {
      return;
    }

    if (!isActive) {
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / stat.duration, 1);
      const easedProgress = easeOutExpo(progress);

      setCurrentVal(Math.round(stat.target * easedProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentVal(stat.target);
        setTimeout(() => onComplete(index), 80);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [
    isActive,
    hasFinished,
    hasStarted,
    reducedMotion,
    stat.target,
    stat.duration,
    index,
    onComplete,
  ]);

  const staticValue = !mounted || reducedMotion;
  const value = staticValue
    ? stat.target
    : hasFinished
      ? stat.target
      : hasStarted
        ? currentVal
        : 0;

  const showPlus = stat.hasPlus && (staticValue || hasFinished);

  return (
    <div
      className={`flex min-h-[124px] flex-col-reverse items-center justify-center px-3 py-8 text-center sm:min-h-[148px] sm:px-6 sm:py-10 ${className}`}
      aria-label={`${stat.raw} ${stat.label}`}
    >
      <dt
        className={`mt-2.5 font-mono text-[9.5px] uppercase leading-4 tracking-[0.16em] transition-colors duration-300 sm:text-[10px] ${
          isActive
            ? "font-semibold text-[#A82020]"
            : hasFinished
              ? "text-[#0A2540]/70"
              : "text-[#0A2540]/40"
        }`}
      >
        {stat.label}
      </dt>

      <dd className="flex items-baseline justify-center text-[2.25rem] font-semibold leading-none tracking-[-0.04em] text-[#0A2540] tabular-nums sm:text-[2.75rem]">
        {numberFormatter.format(value)}
        {stat.hasPlus ? (
          <span
            className={`ml-0.5 text-[#A82020] transition-all duration-300 ${
              showPlus
                ? "translate-x-0 scale-100 opacity-100"
                : "-translate-x-1 scale-75 opacity-0"
            }`}
          >
            +
          </span>
        ) : null}
      </dd>
    </div>
  );
}

export default function StatsBar({ items = stats, className = "" }: StatsBarProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );
  const [isInView, setIsInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setActiveIndex(0);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleStepComplete = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? index + 1 : prev));
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Rekam jejak perusahaan"
      className={`border-b border-[#0A2540]/10 bg-white ${className}`}
    >
      <div
        className={`mx-auto max-w-6xl px-4 transition-all duration-700 ease-out sm:px-6 lg:px-8 ${
          !mounted || isInView
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"
        }`}
      >
        <dl className="grid grid-cols-2 border-x border-[#0A2540]/10 sm:grid-cols-4">
          {items.map((stat, index) => (
            <StatCell
              key={stat.label}
              stat={stat}
              index={index}
              isActive={activeIndex === index}
              hasFinished={activeIndex > index}
              hasStarted={activeIndex >= index}
              reducedMotion={reducedMotion}
              mounted={mounted}
              onComplete={handleStepComplete}
              className={`border-[#0A2540]/10 ${cellDividers[index % 4]}`}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}

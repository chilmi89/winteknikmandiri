type SectionHeadingProps = {
  index?: string;
  eyebrow: string;
  title: string;
  /** Bagian akhir judul yang ingin diberi warna aksen. */
  accent?: string;
  description?: string;
  titleId?: string;
  className?: string;
  tone?: "light" | "dark";
  /** Tag judul. Gunakan "h1" untuk hero halaman. */
  as?: "h1" | "h2";
};

export default function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  description,
  titleId,
  className = "",
  tone = "light",
  as: HeadingTag = "h2",
}: SectionHeadingProps) {
  const onDark = tone === "dark";

  return (
    <div className={className}>
      <p
        className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] ${
          onDark ? "text-[#8ACFF8]" : "text-[#A82020]"
        }`}
      >
        {index ? (
          <>
            <span className="opacity-60">{index}</span>
            <span
              aria-hidden="true"
              className={`h-px w-6 ${onDark ? "bg-[#8ACFF8]/40" : "bg-[#A82020]/30"}`}
            />
          </>
        ) : null}
        <span>{eyebrow}</span>
      </p>

      <HeadingTag
        id={titleId}
        className={`mt-4 max-w-2xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.025em] sm:text-4xl ${
          onDark ? "text-white" : "text-[#0A2540]"
        }`}
      >
        {accent && title.endsWith(accent) ? (
          <>
            {title.slice(0, title.length - accent.length)}
            <span className={onDark ? "text-[#FF6B6B]" : "text-[#A82020]"}>
              {accent}
            </span>
          </>
        ) : (
          title
        )}
      </HeadingTag>

      {description ? (
        <p
          className={`mt-4 max-w-xl text-pretty text-[15px] leading-7 ${
            onDark ? "text-white/65" : "text-[#0A2540]/65"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

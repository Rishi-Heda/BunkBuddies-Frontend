"use client";

import { useEffect, useState, useRef } from "react";
import { Syne } from "next/font/google";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600"],
});

/* =====================================================
   CONTRIBUTOR CARD
===================================================== */

function ContributorCard({ person }) {
  return (
    <div
      style={{
        width: "max(var(--c-width, 440px), 360px)",
      }}
      className="
        relative
        h-[160px]
        flex-shrink-0
        bg-[#F7CC66]
        border-[1.5px] border-black
        rounded-[15px]
        overflow-hidden
        group
        transition-all duration-300
        hover:scale-[1.06]
        hover:w-[calc(max(var(--c-width,440px),360px)+20px)]
      "
    >
      <div
        className="
          absolute inset-0
          px-6 py-5
          flex flex-col justify-between
          opacity-0
          -translate-x-[25px]
          transition-all duration-500
          group-hover:opacity-100
          group-hover:translate-x-0
        "
      >
        <div>
          <h3 className="text-3xl font-semibold">
            {person.name}
          </h3>

          <div className="flex gap-6 mt-4 text-2xl">
            <FaInstagram />
            <FaLinkedin />
            <FaGithub />
          </div>
        </div>

        <p className="text-lg">
          {person.domain}
        </p>
      </div>

      <div
        className="
          absolute inset-0
          flex justify-center items-end
          transition-transform duration-500
          group-hover:translate-x-[130px]
        "
      >
        <img
          src={person.image}
          alt={person.name}
          className="h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
}

/* =====================================================
   ROW
===================================================== */

function ContributorRow({
  word,
  left,
  right,
  direction = "ltr",
}) {
  const allCards = [...left, ...right];
  const L = left.length;
  const R = right.length;
  const N = allCards.length;
  const GAP = 48;

  const repeatedCards = [...allCards, ...allCards, ...allCards];
  const animationName = `marquee-${word.replace(/\s+/g, "")}`;

  const rowRef = useRef(null);
  const [duration, setDuration] = useState(20);

  const WORD_SHIFT = {
    Built: 70,
    by: -100,
    the: 500,
    ambitious: 200,
  };

  const SHIFT = WORD_SHIFT[word] ?? 0;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rowEl = entry.target;
        const leftEl = rowEl.querySelector(".left-track");
        const rightEl = rowEl.querySelector(".right-track");

        let cWidth = 0;

        if (leftEl && L > 0) {
          cWidth =
            (leftEl.offsetWidth - (L - 1) * GAP) / L;
        } else if (rightEl && R > 0) {
          cWidth =
            (rightEl.offsetWidth - (R - 1) * GAP) / R;
        }

        if (cWidth > 0) {
          const setW = N * cWidth + N * GAP;
          setDuration(setW / 100);
        }
      }
    });

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, [L, R, N]);

  return (
    <div className={`w-full overflow-hidden py-6 row-${animationName}`}>
      <div
        ref={rowRef}
        className="grid items-end justify-center relative transition-all duration-300"
        style={{
          width: `calc(100% + ${160 + SHIFT}px)`,
          left: `-${80 + SHIFT}px`,
          gridTemplateColumns: `repeat(${L}, 1fr) auto repeat(${R}, 1fr)`,
          gap: `${GAP}px`,
        }}
      >
        <style>{`
          .animate-${animationName} {
            animation: ${animationName} ${duration}s linear infinite;
          }

          .row-${animationName}:hover .animate-${animationName} {
            animation-play-state: paused;
          }

          @keyframes ${animationName} {
            ${
              direction === "ltr"
                ? `
              0% { transform: translateX(calc(-1 * var(--set-w))); }
              100% { transform: translateX(0px); }
            `
                : `
              0% { transform: translateX(0px); }
              100% { transform: translateX(calc(-1 * var(--set-w))); }
            `
            }
          }
        `}</style>

        {/* LEFT TRACK */}
        {L > 0 && (
          <div
            className="left-track overflow-hidden py-4 -my-4"
            style={{
              gridColumn: `1 / span ${L}`,
              containerType: "inline-size",
            }}
          >
            <div
              className={`flex gap-[48px] w-max animate-${animationName}`}
              style={{
                "--c-width": `calc((100cqw - ${(L - 1) * GAP}px) / ${L})`,
                "--set-w": `calc(${N} * var(--c-width) + ${N * GAP}px)`,
              }}
            >
              {repeatedCards.map((p, i) => (
                <ContributorCard key={`left-${i}`} person={p} />
              ))}
            </div>
          </div>
        )}

        {/* CENTER COLUMN */}
        <div
          style={{
            gridColumn: `${L + 1}`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <h1
            className={`${syne.className}
              text-[148px]
              leading-none
              whitespace-nowrap
              relative z-10
            `}
          >
            {word}
          </h1>
        </div>

        {/* RIGHT TRACK */}
        {R > 0 && (
          <div
            className="right-track overflow-hidden py-4 -my-4"
            style={{
              gridColumn: `${L + 2} / span ${R}`,
              containerType: "inline-size",
            }}
          >
            <div
              className={`flex gap-[48px] w-max animate-${animationName}`}
              style={{
                "--c-width": `calc((100cqw - ${(R - 1) * GAP}px) / ${R})`,
                "--set-w": `calc(${N} * var(--c-width) + ${N * GAP}px)`,
                marginLeft: `calc(-1 * (${L} * var(--c-width) + ${L * GAP}px))`,
              }}
            >
              {repeatedCards.map((p, i) => (
                <ContributorCard key={`right-${i}`} person={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   MAIN SECTION
===================================================== */

export default function Contributors() {
  const people = [
    { name: "Aarav Mehta", domain: "Board", image: "/contributors/1.png" },
    { name: "Riya Kapoor", domain: "Board", image: "/contributors/2.png" },
    { name: "Devansh Shah", domain: "Board", image: "/contributors/3.png" },
    { name: "Ishita Nair", domain: "Board", image: "/contributors/4.png" },
    { name: "Kunal Verma", domain: "Board", image: "/contributors/5.png" },
    { name: "Pranav Iyer", domain: "Tech JC", image: "/contributors/1.png" },
    { name: "Sneha Reddy", domain: "Tech JC", image: "/contributors/2.png" },
    { name: "Arjun Malhotra", domain: "Tech JC", image: "/contributors/3.png" },
    { name: "Neel Patel", domain: "Tech JC", image: "/contributors/4.png" },
    { name: "Tanmay Kulkarni", domain: "Tech JC", image: "/contributors/5.png" },
    { name: "Ananya Bose", domain: "Design JC", image: "/contributors/1.png" },
    { name: "Kabir Arora", domain: "Design JC", image: "/contributors/2.png" },
    { name: "Mehul Jain", domain: "Design JC", image: "/contributors/3.png" },
    { name: "Diya Sen", domain: "Design JC", image: "/contributors/4.png" },
  ];

  return (
    <section className="relative w-full py-28 flex flex-col overflow-hidden">
      <ContributorRow word="Built" left={[people[0]]} right={[people[1], people[2]]} direction="ltr" />
      <ContributorRow word="by" left={[people[3], people[4]]} right={[people[5], people[6]]} direction="rtl" />
      <ContributorRow word="the" left={[people[7], people[8]]} right={[people[9], people[10]]} direction="ltr" />
      <ContributorRow word="ambitious" left={[people[11], people[12]]} right={[people[13]]} direction="rtl" />
    </section>
  );
}
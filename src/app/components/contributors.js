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
        hover:scale-[1.08]
        hover:w-[calc(max(var(--c-width,440px),360px)+600px)]
      "
    >
      {/* INFO PANEL */}
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

      {/* IMAGE */}
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
          setDuration(setW / 100); // 100px/sec speed
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
          width: "calc(100% + 160px)",
          left: "-80px",
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

        {/* LEFT */}
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
                "--set-w": `calc(${N} * var(--c-width) + ${
                  N * GAP
                }px)`,
              }}
            >
              {repeatedCards.map((p, i) => (
                <ContributorCard
                  key={`left-${i}`}
                  person={p}
                />
              ))}
            </div>
          </div>
        )}

        {/* TEXT */}
        <h1
          className={`${syne.className}
            text-[148px]
            leading-none
            whitespace-nowrap
            relative z-10
          `}
          style={{ gridColumn: `${L + 1}` }}
        >
          {word}
        </h1>

        {/* RIGHT */}
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
                "--set-w": `calc(${N} * var(--c-width) + ${
                  N * GAP
                }px)`,
                marginLeft: `calc(-1 * (${L} * var(--c-width) + ${
                  L * GAP
                }px))`,
              }}
            >
              {repeatedCards.map((p, i) => (
                <ContributorCard
                  key={`right-${i}`}
                  person={p}
                />
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
    { name: "Lakshya", domain: "Frontend", image: "/contributors/1.png" },
    { name: "Atiksh", domain: "Backend", image: "/contributors/2.png" },
    { name: "Varun", domain: "Design", image: "/contributors/3.png" },
    { name: "Aditi", domain: "UI/UX", image: "/contributors/4.png" },
    { name: "Rahul", domain: "Full Stack", image: "/contributors/5.png" },
  ];

  return (
    <section
      className="
        relative
        w-full
        py-28
        flex flex-col
        overflow-hidden
      "
    >
      <ContributorRow
        word="Built"
        left={[people[0]]}
        right={[people[1], people[2]]}
        direction="ltr"
      />

      <ContributorRow
        word="by"
        left={[people[2], people[4]]}
        right={[people[1], people[3]]}
        direction="rtl"
      />

      <ContributorRow
        word="the"
        left={[people[3], people[2]]}
        right={[people[0], people[4]]}
        direction="ltr"
      />

      <ContributorRow
        word="ambitious"
        left={[people[1], people[4]]}
        right={[people[0]]}
        direction="rtl"
      />
    </section>
  );
}
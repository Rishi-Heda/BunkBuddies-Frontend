"use client";

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
      style={{ width: person.width ? `${person.width}px` : '440px' }}
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
      hover:scale-[1.02]
      "
    >
      {/* ---------- INFO PANEL ---------- */}
      <div
        className="
        absolute inset-0
        px-6 py-5
        flex flex-col justify-between
        opacity-0
        translate-x-[-25px]
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

      {/* ---------- IMAGE ---------- */}
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

function ContributorRow({ word, left, right, offsetX = 0 }) {
  const allCards = [...left, ...right];
  const n = allCards.length;
  // Flex gap is 12 (48px)
  const GAP_W = 48;

  const getCardsWidth = (cards) => cards.reduce((sum, card) => sum + (card.width || 440), 0) + Math.max(0, cards.length - 1) * GAP_W;

  const leftW = getCardsWidth(left);
  const rightW = getCardsWidth(right);

  const SET_W = getCardsWidth(allCards) + (allCards.length > 0 ? GAP_W : 0);

  // Shift right track so it seamlessly continues from left track
  const rightTrackShift = left.length > 0 ? getCardsWidth(left) + GAP_W : 0;

  // Repeat cards 3 times for infinite scroll
  const repeatedCards = [...allCards, ...allCards, ...allCards];

  const animationName = `marquee-${word.replace(/\s+/g, '')}`;

  return (
    <div className={`w-full overflow-hidden py-6 row-${animationName}`}>
      <div
        className="flex items-end justify-center gap-12 relative w-full max-w-full transition-transform duration-500"
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        <style>{`
          .animate-${animationName} {
            transform: translateX(0px);
          }
          .row-${animationName}:hover .animate-${animationName} {
            animation: ${animationName} ${n * 4}s linear infinite;
          }
          @keyframes ${animationName} {
            0% { transform: translateX(-${SET_W}px); }
            100% { transform: translateX(0px); }
          }
        `}</style>

        {/* LEFT */}
        <div
          className="overflow-hidden flex-shrink-0 py-4 -my-4"
          style={{ width: `${leftW}px` }}
        >
          <div
            className={`flex gap-12 w-max animate-${animationName}`}
          >
            {repeatedCards.map((p, i) => (
              <ContributorCard key={`left-${i}`} person={p} />
            ))}
          </div>
        </div>

        {/* TEXT */}
        <h1
          className={`${syne.className}
          text-[148px]
          leading-none
          whitespace-nowrap
          relative z-10`}
        >
          {word}
        </h1>

        {/* RIGHT */}
        <div
          className="overflow-hidden flex-shrink-0 py-4 -my-4"
          style={{ width: `${rightW}px` }}
        >
          <div
            className={`flex gap-12 w-max animate-${animationName}`}
            style={{ marginLeft: `-${rightTrackShift}px` }}
          >
            {repeatedCards.map((p, i) => (
              <ContributorCard key={`right-${i}`} person={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   MAIN SECTION
===================================================== */

export default function Contributors() {

  const people = [
    {
      name: "Lakshya",
      domain: "Frontend",
      image: "/contributors/1.png",
    },
    {
      name: "Atiksh",
      domain: "Backend",
      image: "/contributors/2.png",
    },
    {
      name: "Varun",
      domain: "Design",
      image: "/contributors/3.png",
    },
    {
      name: "Aditi",
      domain: "UI/UX",
      image: "/contributors/4.png",
    },
    {
      name: "Rahul",
      domain: "Full Stack",
      image: "/contributors/5.png",
    },
  ];

  return (
    <section className="py-28 flex flex-col overflow-hidden">

      {/* ROW 1 */}
      <ContributorRow
        word="Built"
        left={[people[0]]}
        right={[{ ...people[1], width: 480 }, people[2]]}
      />

      {/* ROW 2 - Shifted towards right */}
      <ContributorRow
        word="by"
        left={[{ ...people[2], width: 480 }, { ...people[4], width: 400 }]}
        right={[{ ...people[1], width: 480 }, people[3] ]}
        offsetX={120}
      />

      {/* ROW 3 - Shifted towards left */}
      <ContributorRow
        word="the"
        left={[people[3],people[2]]}
        right={[{ ...people[0], width: 350 },  { ...people[4], width: 370 }]}
        offsetX={-180}
      />

      {/* ROW 4 - Shifted a little left */}
      <ContributorRow
        word="ambitious"
        left={[people[1], { ...people[4], width: 330 }]}
        right={[people[0]]}
        offsetX={-80}
      />

    </section>
  );
}
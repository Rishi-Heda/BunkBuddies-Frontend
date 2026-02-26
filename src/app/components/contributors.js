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
      className="
      relative
      w-[440px]
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

function ContributorRow({ word, left, right }) {
  return (
    <div className="w-full overflow-hidden py-6">
      <div className="flex items-end justify-center gap-12">

        {/* LEFT */}
        <div className="flex gap-12">
          {left.map((p, i) => (
            <ContributorCard key={i} person={p} />
          ))}
        </div>

        {/* TEXT */}
        <h1
          className={`${syne.className}
          text-[148px]
          leading-none
          whitespace-nowrap`}
        >
          {word}
        </h1>

        {/* RIGHT */}
        <div className="flex gap-12">
          {right.map((p, i) => (
            <ContributorCard key={i} person={p} />
          ))}
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
    <section className="py-28 flex flex-col">

      {/* ROW 1 */}
      <ContributorRow
        word="Built"
        left={[people[0]]}
        right={[people[1], people[2]]}
      />

      {/* ROW 2 */}
      <ContributorRow
        word="by"
        left={[people[2], people[3]]}
        right={[people[4], people[1]]}
      />

      {/* ROW 3 */}
      <ContributorRow
        word="the"
        left={[people[3]]}
        right={[people[0], people[2]]}
      />

      {/* ROW 4 */}
      <ContributorRow
        word="ambitious"
        left={[people[1], people[4]]}
        right={[people[0]]}
      />

    </section>
  );
}
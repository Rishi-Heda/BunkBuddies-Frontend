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

function ContributorCard({ person, isMobile }) {
  const [isTapped, setIsTapped] = useState(false);
  const baseClasses = `
    relative
    h-[132px] md:h-[144px]
    flex-shrink-0
    bg-[#F7CC66]
    border-[1.5px] border-black
    rounded-[12px]
    overflow-hidden
    transition-all duration-300
  `;
  const mobileWidthClass = isTapped ? "w-[260px]" : "w-[228px]";
  const desktopWidthClass = "hover:w-[calc(max(var(--c-width,360px),280px)+16px)]";

  const widthClass = isMobile ? mobileWidthClass : desktopWidthClass;

  const mobileTranslateClass = isTapped ? "translate-x-[100px]" : "";
  const desktopTranslateClass = "group-hover:translate-x-[80px]";
  const translateClass = isMobile ? mobileTranslateClass : desktopTranslateClass;

  const mobileOpacityClass = isTapped ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-[25px]";
  const desktopOpacityClass = "opacity-0 -translate-x-[25px] group-hover:opacity-100 group-hover:translate-x-0";
  const opacityClass = isMobile ? mobileOpacityClass : desktopOpacityClass;

  return (
    <div
      onClick={() => isMobile && setIsTapped(!isTapped)}
      className={`${baseClasses} ${widthClass} ${isMobile ? "" : "hover:scale-[1.06] group"}`}
      style={isMobile ? undefined : { width: "max(var(--c-width, 360px), 280px)" }}
    >
      <div
        className={`
          absolute inset-0
          px-4 py-4
          flex flex-col justify-between
          transition-all duration-500
          ${opacityClass}
        `}
      >
        <div>
          <h3 className="text-xl md:text-2xl font-semibold leading-tight">
            {person.name}
          </h3>

          <div className="flex gap-4 mt-3 text-lg md:text-xl relative z-20">
            <button
              onClick={(e) => { e.stopPropagation(); if (person.instagram) window.open(person.instagram, '_blank'); }}
              aria-label="Instagram"
            >
              <FaInstagram className="hover:scale-110 transition-transform cursor-pointer" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (person.linkedin) window.open(person.linkedin, '_blank'); }}
              aria-label="LinkedIn"
            >
              <FaLinkedin className="hover:scale-110 transition-transform cursor-pointer" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (person.github) window.open(person.github, '_blank'); }}
              aria-label="GitHub"
            >
              <FaGithub className="hover:scale-110 transition-transform cursor-pointer" />
            </button>
          </div>
        </div>

        <p className="text-sm md:text-base">
          {person.domain}
        </p>
      </div>

      <div
        className={`
          absolute inset-0
          flex justify-center items-end
          transition-transform duration-500
          ${translateClass}
        `}
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
  const GAP = 32;

  const repeatedCards = [...allCards, ...allCards, ...allCards];
  const animationName = `marquee-${word.replace(/\s+/g, "")}`;

  const rowRef = useRef(null);
  const [duration, setDuration] = useState(20);

  const WORD_SHIFT = {
    Built: 400,
    by: -112,
    the: 800,
    ambitious: 1,
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
          setDuration(setW / 75);
        }
      }
    });

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, [L, R, N]);

  return (
    <div className={`w-full overflow-hidden py-4 row-${animationName}`}>
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
            ${direction === "ltr"
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
            className="left-track overflow-hidden py-3 -my-3"
            style={{
              gridColumn: `1 / span ${L}`,
              containerType: "inline-size",
            }}
          >
            <div
              className={`flex gap-[32px] w-max animate-${animationName}`}
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
          className="hidden md:flex justify-center"
          style={{
            gridColumn: `${L + 1}`,
          }}
        >
          <h1
            className={`${syne.className}
              text-[104px] xl:text-[118px]
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
            className="right-track overflow-hidden py-3 -my-3"
            style={{
              gridColumn: `${L + 2} / span ${R}`,
              containerType: "inline-size",
            }}
          >
            <div
              className={`flex gap-[32px] w-max animate-${animationName}`}
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
   MOBILE ROW
===================================================== */

function MobileContributorRow({ cards, direction = "ltr", rowIndex }) {
  const repeatedCards = [...cards, ...cards, ...cards, ...cards];
  const animationName = `mobile-marquee-${rowIndex}`;

  return (
    <div className={`w-full overflow-hidden py-2 mobile-row-${animationName}`}>
      <style>{`
        .animate-${animationName} {
          animation: ${animationName} 20s linear infinite;
        }
        .mobile-row-${animationName}:hover .animate-${animationName},
        .mobile-row-${animationName}:active .animate-${animationName},
        .animate-${animationName}:hover,
        .animate-${animationName}:active {
          animation-play-state: paused !important;
        }
        @keyframes ${animationName} {
          ${direction === "ltr"
          ? `
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0%); }
            `
          : `
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            `
        }
        }
      `}</style>
      <div className={`flex w-max animate-${animationName}`}>
        {repeatedCards.map((p, i) => (
          <div key={`mobile-${rowIndex}-${i}`} className="px-1.5">
            <ContributorCard person={p} isMobile={true} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   MAIN SECTION
===================================================== */

export default function Contributors() {
  const people = [
    { name: "Varun B", domain: "Project Lead", image: "/contributors/varun-b.png", instagram: "https://www.instagram.com/varun4.b", linkedin: "https://www.linkedin.com/in/varunb45/", github: "https://github.com/varun4505" },
    { name: "Aditya Madan", domain: "Design Lead", image: "/contributors/aditya-madan.png", instagram: "https://www.instagram.com/your.avg.engineer", linkedin: "https://www.linkedin.com/in/aditya-madan-90b49526b", github: "https://github.com/aditya10801" },
    { name: "Atiksh Chawla", domain: "Tech Head", image: "/contributors/atiksh-chawla.png", instagram: "https://www.instagram.com/atiksh_chawla/", linkedin: "https://www.linkedin.com/in/atikshchawla/", github: "https://github.com/atikshchawla/" },
    { name: "Ayush", domain: "Mentor", image: "/contributors/ayush-kumar.png", instagram: "https://www.instagram.com/_ayush.0808", linkedin: "https://www.linkedin.com/in/ayushk0808/", github: "https://github.com/AyushK0808" },
    { name: "Lavan", domain: "Project Head", image: "/contributors/lavanbarath-b.png", instagram: "https://www.instagram.com/lavan8t", linkedin: "https://www.linkedin.com/in/lavan8t/", github: "https://github.com/lavan8t/" },
    { name: "Lakshya Gupta", domain: "Tech Manager", image: "/contributors/lakshya-gupta.png", instagram: "https://www.instagram.com/2005_lakshya", linkedin: "https://www.linkedin.com/in/lakshya-gupta2005/", github: "https://github.com/2005lakshya" },
    { name: "Tanmoy Saha", domain: "Mentor", image: "/contributors/tanmoy-saha.png", instagram: "https://www.instagram.com/tanmoy._saha", linkedin: "https://www.linkedin.com/in/tanmoy-saha-4b0ab228a/", github: "https://github.com/TSaha4/" },
    { name: "Kumar Ayush", domain: "Design Head", image: "/contributors/kumar-ayush.png", instagram: "https://www.instagram.com/krayush21", linkedin: "https://www.linkedin.com/in/kumar-ayush-090b92386?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", github: "https://github.com/yush08" },
    { name: "Vedant Vidhani", domain: "Developer", image: "/contributors/vedant-vidhani.png", instagram: "https://www.instagram.com/vedant.v19", linkedin: "https://www.linkedin.com/in/vedant-vidhani-18291436b/", github: "https://github.com/Tommy12356F/" },
    { name: "Riddhima Jain", domain: "Developer", image: "/contributors/riddhima-jain.png", instagram: "https://www.instagram.com/reeddheemaa/", linkedin: "https://www.linkedin.com/in/riddhima-jain-431092260/", github: "https://github.com/riddhimajain08/" },
    { name: "Tvisha Thakur", domain: "Developer", image: "/contributors/tvisha-thakur.png", instagram: "https://www.instagram.com/tvxsha_", linkedin: "https://www.linkedin.com/in/tvisha-thakur-2225713b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", github: "https://github.com/tvxsha" },
    { name: "Rishi Pankaj Heda", domain: "Developer", image: "/contributors/rishi-pankaj-heda.png", instagram: "https://www.instagram.com/rishi.heda", linkedin: "https://www.linkedin.com/in/rishi-heda/", github: "https://github.com/Rishi-Heda/" },
    { name: "Shreya Verma", domain: "Developer", image: "/contributors/shreya-verma.png", instagram: "https://www.instagram.com/shverma_29", linkedin: "https://www.linkedin.com/in/shreya-verma-060041363/", github: "https://github.com/shverma524/" },
    { name: "Atharv Namdeo", domain: "Designer", image: "/contributors/atharv-namdeo.png", instagram: "https://www.instagram.com/atharvnamdeo/", linkedin: "https://www.linkedin.com/in/atharvnamdeo", github: "https://github.com/atharv-namdeo" },
    { name: "Akshit Saharia", domain: "Designer", image: "/contributors/akshit-saharia.png", instagram: "https://www.instagram.com/akshit_saharia", linkedin: "https://www.linkedin.com/in/AkshitSaharia/", github: "https://github.com/akshit-saharia/" },
    { name: "Bhumi Agarwal", domain: "Designer", image: "/contributors/bhumi-agarwal.png", instagram: "https://www.instagram.com/bhumiii_agarwall", linkedin: "www.linkedin.com/in/bhumiagarwal07", github: "https://github.com/Bhumi711/" },
    { name: "Kashvi Jain", domain: "Designer", image: "/contributors/kashvi-jain.png", instagram: "https://www.instagram.com/that_one_potatoh", linkedin: "https://www.linkedin.com/in/kashvi-jain-579676380", github: "https://github.com/jkashvi12/" },
  ];

  return (
    <section className="relative w-full py-16 md:py-20 flex flex-col overflow-hidden">
      <div className="md:hidden flex justify-center mb-8 z-10 relative">
        <h1 className={`${syne.className} text-4xl sm:text-5xl leading-tight text-center`}>
          Built<br />by<br />the<br />ambitious
        </h1>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex w-full flex-col">
        <ContributorRow word="Built" left={[people[0], people[1]]} right={[people[5], people[2]]} direction="ltr" />
        <ContributorRow word="by" left={[people[6], people[3]]} right={[people[4], people[7]]} direction="rtl" />
        <ContributorRow word="the" left={[people[8], people[9], people[10]]} right={[people[11], people[12]]} direction="ltr" />
        <ContributorRow word="ambitious" left={[people[13], people[14]]} right={[people[15], people[16]]} direction="rtl" />
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col w-full gap-1.5">
        <MobileContributorRow cards={[people[0], people[1], people[5], people[2]]} direction="ltr" rowIndex={1} />
        <MobileContributorRow cards={[people[6], people[3], people[4], people[7]]} direction="rtl" rowIndex={2} />
        <MobileContributorRow cards={[people[8], people[9], people[10], people[11], people[12]]} direction="ltr" rowIndex={3} />
        <MobileContributorRow cards={[people[13], people[14], people[15], people[16]]} direction="rtl" rowIndex={4} />
      </div>
    </section>
  );
}

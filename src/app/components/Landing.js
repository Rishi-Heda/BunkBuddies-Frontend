"use client";

import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "./BackgroundLines";
import CustomButton from "./CustomButton";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Landing() {
  return (
    <BackgroundGrid>
      <div
        className={`${syne.className} min-h-screen flex flex-col overflow-hidden`}
      >
        {/* Nav */}
        <nav className="flex items-center justify-between px-7 py-4">
          <Image src="/bb_logo.svg" alt="BunkBuddies" width={120} height={36} />

          <CustomButton color="#7C5CBF">
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
    <path d="M17 8l4 4-4 4" />
    <path d="M21 12H9" />
  </svg>
  Sign In
</CustomButton>

        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-10">
          <div className="max-w-lg">
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900 mb-4">
              Find the roommate you'll
              <br />
              actually survive with.
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Don't leave hostel life to random allocation. Match with someone who
              fits your lifestyle, habits, and vibe.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <CustomButton color="#3DBF7C" className="font-bold">
  Find my BunkBuddy
</CustomButton>


              {/* 1. Plain link instead of button */}
              <a
                href="#how-it-works"
                className="text-gray-600 text-sm font-medium underline underline-offset-2 hover:text-gray-900 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Shapes — 2. Larger images */}
          <div className="flex items-end justify-center flex-wrap gap-4 px-4">
            <Image src="/shape1.png" alt="shape" width={150} height={180} />
            <Image src="/shape2.png" alt="shape" width={170} height={195} />
            <Image src="/shape3.png" alt="shape" width={160} height={185} />
            <Image src="/shape4.png" alt="shape" width={148} height={175} />
          </div>
        </section>

        {/* 4. Crescent — concave/inward on BOTH sides (bowl / M-shape) */}
        <div className="mt-10" style={{ lineHeight: 0 }}>
  <svg
    viewBox="0 0 500 80"
    preserveAspectRatio="none"
    className="w-full h-20 block"
  >
    <path
      d="M0,0 Q250,80 500,0 L500,80 L0,80 Z"
      fill="#FB5E4C"
    />
  </svg>
</div>

        {/* Body — 3. syne.className applied here too */}
        <section
          className={`${syne.className} flex-1 px-8 pt-10 pb-16 bg-[#FB5E4C] flex flex-col items-center text-center`}
        >
          <p className="text-lg leading-7 text-gray-900 max-w-lg">
            <strong>Hostel roulette isn't fun.</strong> One random allocation can
            mean clashing sleep schedules, messy habits, and totally different
            ideas of quiet time. Those small differences turn into daily friction
            fast. BunkBuddies helps you choose smarter so you room with someone
            who actually fits your lifestyle.
          </p>
        </section>
      <svg
  viewBox="0 0 500 80"
  preserveAspectRatio="none"
  className="w-full h-20 block"
>
  <path
    d="M0,80 Q250,0 500,80 L500,0 L0,0 Z"
    fill="#FB5E4C"
  />
</svg>

      </div>
    </BackgroundGrid>
  );
}
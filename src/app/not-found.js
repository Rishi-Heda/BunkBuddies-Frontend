"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins, Syne } from "next/font/google";

/* =====================================================
   FONTS
===================================================== */

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700","800","900"],
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700"],
});

/* =====================================================
   NAVBAR
===================================================== */

function Navbar() {
  return (
    <div className="w-full flex justify-between items-center px-4 sm:px-8 md:px-10 py-4 sm:py-6">

      {/* LOGO */}
      <Link
        href="/"
        className="flex items-center hover:scale-[1.03] transition-transform duration-200"
      >
        <Image
          src="/bb_logo.svg"
          alt="BunkBuddies"
          width={120}
          height={36}
          className="w-[110px] sm:w-[130px] md:w-[140px]"
          priority
        />
      </Link>

      {/* MENU */}
      <div
        className="
        bg-[#B889F6]
        border-2 border-black
        rounded-[5px]
        px-3 sm:px-6 md:px-8
        py-2 sm:py-3
        shadow-[5px_5px_0px_#000]
        flex
        gap-4 sm:gap-8 md:gap-10
        text-[13px] sm:text-[16px] md:text-lg
        font-medium
      "
      >
        <Link href="/find" className="hover:underline">
          Find
        </Link>

        <Link href="/groups" className="hover:underline">
          My Groups
        </Link>

        <Link href="/profile" className="hover:underline">
          My Profile
        </Link>
      </div>
    </div>
  );
}

/* =====================================================
   GRID BACKGROUND
===================================================== */

function GridBackground() {
  return (
    <div
      className="absolute inset-0 opacity-40 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(#00000018 1px, transparent 1px), linear-gradient(90deg, #00000018 1px, transparent 1px)",
        backgroundSize: "42px 42px",
      }}
    />
  );
}

/* =====================================================
   ERROR CARD
===================================================== */

function ErrorCard() {
  return (
    <div 
        className=" 
            rise-card
            relative
            w-full
            max-w-[1160px]
            bg-[#FFA1A0]
            border-1 border-black
            rounded-[5px]
            shadow-[7px_7px_0px_#000]
            text-center
            px-6 sm:px-10 md:px-12
            py-10 sm:py-12 md:py-16
        "
     >

      {/* ICON */}
      <div className="flex justify-center mb-0 md:mb-8" >
        <Image
          src="/contributors/404-error.png"
          alt="404"
          width={176}
          height={176}
          className="w-[120px] sm:w-[150px] md:w-[210px] h-auto"
          priority
        />
      </div>

      {/* TITLE */}
      <h1
        className="
        text-[60px]
        sm:text-[90px]
        md:text-[130px]
        leading-none
        font-bold
        text-[#FEE3D3]
        drop-shadow-[4px_4px_0px_rgba(255,142,141,0.95)]
      "
      >
        Error 404
      </h1>

      {/* SUBTEXT */}
      <p
        className="
        mt-4 md:mt-6
        text-[18px]
        sm:text-[26px]
        md:text-[38px]
        font-semibold
        text-[#FFDAD9]
        drop-shadow-[2px_2px_0px_rgba(255,142,141,0.95)]
      "
      >
        The page you were looking for was not found :(
      </p>

      {/* BUTTON */}
      <div className="mt-8 md:mt-12">
        <Link
          href="/create-room"
          className={`${syne.className}
            inline-block
            bg-[#F4C253]
            border-2 border-black
            rounded-[5px]
            px-10 sm:px-16 md:px-28
            py-3 md:py-4
            text-[12px] sm:text-[16px] md:text-[22px]
            font-bold
            shadow-[6px_6px_0px_#000]
            transition-all duration-200
            hover:translate-x-[2px]
            hover:translate-y-[2px]
            hover:shadow-[3px_3px_0px_#000]
            active:translate-x-[4px]
            active:translate-y-[4px]
          `}
        >
          Maybe try creating a{" "}
          <span className="underline">new room?</span>
        </Link>
      </div>

    </div>
  );
}

/* =====================================================
   MAIN PAGE
===================================================== */

export default function NotFound() {
  return (
    <div
      className={`${syne.className}
      relative
      min-h-screen
      bg-[#F3D8C3]
      overflow-hidden
      flex
      flex-col`}
    >

      <GridBackground />
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-6 pb-12">
        <ErrorCard />
      </div>

    </div>
  );
}
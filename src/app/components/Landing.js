"use client";

import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "./BackgroundLines";
import CustomButton from "./CustomButton";

import { useRouter } from "next/navigation";
import InfiniteMarquee from "./InfiniteMarquee";

const heroSyne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export default function Landing() {
  const router = useRouter();

  const handleSignIn = () => {
    // Redirect to the new sign-in page
    router.push("/signin");
  };

  return (
    <BackgroundGrid>
      <div className="min-h-screen flex flex-col overflow-hidden">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-7">
          <Image
            src="/bb_logo.svg"
            alt="BunkBuddies"
            width={160}
            height={60}
            className="w-auto h-12 md:h-16"
          />

          <CustomButton color="#BE8EF8" onClick={handleSignIn}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-3.75 sm:h-3.75"
            >
              <path d="M13 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
              <path d="M17 8l4 4-4 4" />
              <path d="M21 12H9" />
            </svg>
            Sign In
          </CustomButton>
        </nav>

        {/* Hero */}
          <section className="flex flex-col items-center text-center px-4 pt-8 sm:px-6 sm:pt-10 md:px-8"> 
          <div className="w-full flex flex-col items-center">
            <h1
              className={`${heroSyne.className} text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight text-gray-900 mb-3 sm:mb-4 text-center w-full mx-auto`}
            >
              <span className="block whitespace-normal sm:whitespace-nowrap">Find the roommate you'll</span>
              <span className="block whitespace-normal sm:whitespace-nowrap">actually survive with.</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0 max-w-xs sm:max-w-md md:max-w-lg text-center">
              Don't leave hostel life to random allocation. Match with someone
              who fits your lifestyle, habits, and vibe.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10">
              <CustomButton color="#47D19D" className="font-bold w-full sm:w-auto" onClick={handleSignIn}>
                Find my BunkBuddy
              </CustomButton>

              <a
                href="#how-it-works"
                className="text-gray-600 text-sm font-medium underline underline-offset-2 hover:text-gray-900 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Shapes */}
          <InfiniteMarquee/>
        </section>

        {/* Wave top */}
        <div className="mt-6 sm:mt-10" style={{ lineHeight: 0 }}>
          <svg
            viewBox="0 0 500 80"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-16 md:h-20 block"
          >
            <path d="M0,0 Q250,80 500,0 L500,80 L0,80 Z" fill="#FB5E4C" />
          </svg>
        </div>

        {/* Body */}
        <section
          className="flex-1 pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[#FB5E4C] flex flex-col items-center text-center px-4 sm:px-8 md:px-40.75"
        >
          <p className="text-[20px] sm:text-[24px] md:text-[32px] font-normal text-left md:text-justify leading-7 text-gray-900 max-w-225 mx-auto">
            <strong>Hostel roulette isn't fun.</strong> One random allocation
            can mean clashing sleep schedules, messy habits, and totally
            different ideas of quiet time. Those small differences turn into
            daily friction fast. BunkBuddies helps you choose smarter so you
            room with someone who actually fits your lifestyle.
          </p>
        </section>

        {/* Wave bottom */}
        <svg
          viewBox="0 0 500 80"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <path d="M0,80 Q250,0 500,80 L500,0 L0,0 Z" fill="#FB5E4C" />
        </svg>
      </div>
    </BackgroundGrid>
  );
}

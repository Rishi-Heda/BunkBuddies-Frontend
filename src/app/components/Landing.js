"use client";

import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "./BackgroundLines";
import CustomButton from "./CustomButton";

import { useRouter } from "next/navigation";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Landing() {
  const router = useRouter();
  const handleSignIn = () => {
    router.push("/signin");
  };
  const steps = [
    {
      id: 1,
      title: "Create a profile",
      description:
        "Create a profile by providing necessary details like name, VIT email ID, registration number, and Rank.",
      bgColor: "bg-[#47D19D]",
    },
    {
      id: 2,
      title: "Find Roommates",
      description:
        "Search for potential roommates or groups on the website and send a request to join them with a short introduction.",
      bgColor: "bg-[#BE8EF8]",
    },
    {
      id: 3,
      title: "Initiate Communication",
      description:
        "If you find a potential match, initiate communication through the app. Start with a simple introduction and try to get to know the other person better by asking questions about their lifestyle, habits, and interests",
      bgColor: "bg-[#FB5E4C]",
    },
  ];
  return (
    <BackgroundGrid>
      <div className={`${syne.className} min-h-screen flex flex-col overflow-hidden`}>
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-7">
          <Image
            src="/bb_logo.svg"
            alt="BunkBuddies"
            width={100}
            height={30}
            className="sm:w-[120px] sm:h-[36px]"
          />
          <CustomButton color="#7C5CBF" onClick={handleSignIn}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-[15px] sm:h-[15px]"
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
          <div className="max-w-xs sm:max-w-md md:max-w-lg w-full">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-3 sm:mb-4">
              Find the roommate you'll
              <br />
              actually survive with.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
              Don't leave hostel life to random allocation. Match with someone
              who fits your lifestyle, habits, and vibe.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10">
              <CustomButton color="#3DBF7C" className="font-bold w-full sm:w-auto" onClick={handleSignIn}>
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
          <div className="flex items-end justify-center flex-wrap gap-2 sm:gap-4 px-2 sm:px-4">
            <Image
              src="/shape1.png"
              alt="shape"
              width={150}
              height={180}
              className="w-[90px] h-auto sm:w-[120px] md:w-[150px]"
            />
            <Image
              src="/shape2.png"
              alt="shape"
              width={170}
              height={195}
              className="w-[100px] h-auto sm:w-[135px] md:w-[170px]"
            />
            <Image
              src="/shape3.png"
              alt="shape"
              width={160}
              height={185}
              className="w-[95px] h-auto sm:w-[125px] md:w-[160px]"
            />
            <Image
              src="/shape4.png"
              alt="shape"
              width={148}
              height={175}
              className="w-[88px] h-auto sm:w-[115px] md:w-[148px]"
            />
          </div>
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
        <section className={`${syne.className} flex-1 px-4 pt-6 pb-12 sm:px-8 sm:pt-10 sm:pb-16 bg-[#FB5E4C] flex flex-col items-center text-center`}>
          <p className="text-base sm:text-lg leading-7 text-gray-900 max-w-xs sm:max-w-md md:max-w-lg px-2 sm:px-0">
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
        {/* How It Works Section */}
        <section id="how-it-works" className={`${syne.className} w-full py-12 px-4 md:px-6 lg:px-8`}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side: Title */}
            <div className="flex justify-center md:justify-start">
              <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
                How it works ?
              </h2>
            </div>
            {/* Right Side: Cards */}
            <div className="space-y-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`${step.bgColor} p-6 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1`}
                >
                  <h3 className="text-[32px] font-bold text-black mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[16px] text-black/80 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </BackgroundGrid>
  );
}
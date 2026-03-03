"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import { showToast } from "../components/Toast";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch } from "../utils/backendClient";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];
const HOSTEL_TYPES = ["MH", "LH"];
const HOSTEL_GROUPS = ["1", "2", "3"];
const HOSTEL_GROUP_NOTE = `Group I (G1)
1. III Year - B.Tech, B.Sc(Agri) & B.Des.
2. III & IV Year - B.Arch, M.Tech(Int.) & M.Sc.(Int.)
3. II Year - B.Sc, BCA, B.Com & BBA
4. I Year - M.Des, MBA, M.Sc, MSW and MCA.

Group II (G2)
1. II Year - B.Tech, B.Arch, B.Sc(Agri), B.Des, M.Tech(Int.) & M.Sc(Int)
2. I Year - B.Sc, BCA, B.Com & BBA

Group III (G3)
1. I Year - B.Tech, B.Des, B.Arch & B.Sc(Agri)
2. I Year - M.Tech(Int.) & M.Sc. (Int.)`;

const QUESTIONS = [
  {
    id: 1,
    question: "Choose your hostel type",
    type: "single-select",
    options: HOSTEL_TYPES,
    required: true,
    helperText: "You cannot change this again in future.",
  },
  {
    id: 2,
    question: "Enter your phone number",
    type: "phone",
    placeholder: "10-digit mobile number",
    required: true,
  },
  {
    id: 3,
    question: "Choose your Hostel Group",
    type: "single-select",
    options: HOSTEL_GROUPS,
    required: true,
    helperText: HOSTEL_GROUP_NOTE,
  },
  {
    id: 4,
    question: "Enter your Hostel Rank",
    type: "number",
    placeholder: "Example: 127",
    required: true,
  },
  {
    id: 5,
    question: "What time do you sleep at?",
    type: "slider",
    min: 21,
    max: 32,
    step: 0.5,
    defaultValue: 24,
    required: true,
    formatLabel: (v) => {
      const hour = Math.floor(v) % 24;
      const mins = (v % 1) === 0.5 ? "30" : "00";
      if (hour === 0) return `12:${mins} AM`;
      if (hour < 12) return `${hour}:${mins} AM`;
      if (hour === 12) return `12:${mins} PM`;
      return `${hour - 12}:${mins} PM`;
    },
    minLabel: "9 PM",
    maxLabel: "8 AM",
  },
  {
    id: 6,
    question: "What time do you wake up at?",
    type: "slider",
    min: 4,
    max: 14,
    step: 0.5,
    defaultValue: 7,
    required: true,
    formatLabel: (v) => {
      const hour = Math.floor(v);
      const mins = (v % 1) === 0.5 ? "30" : "00";
      if (hour === 12) return `12:${mins} PM`;
      if (hour > 12) return `${hour - 12}:${mins} PM`;
      return `${hour}:${mins} AM`;
    },
    minLabel: "4 AM",
    maxLabel: "2 PM",
  },
  {
    id: 7,
    question: "How particular are you about cleanliness?",
    type: "slider",
    min: 0,
    max: 5,
    step: 1,
    defaultValue: 2,
    required: false,
    formatLabel: (v) => `${v}`,
    minLabel: "meh, idc",
    maxLabel: "lowkey have ocd",
    showTicks: true,
  },
  {
    id: 8,
    question: "Tell us about your social scene ",
    type: "slider",
    min: 0,
    max: 5,
    step: 1,
    defaultValue: 2,
    required: false,
    formatLabel: (v) => `${v}`,
    minLabel: "gng leave me alone",
    maxLabel: "extroverted yapper",
    showTicks: true,
  },
  {
    id: 9,
    question: "What all languages do you speak?",
    type: "multiselect",
    required: false,
  },
  {
    id: 10,
    question: "Tell us about yourself so our recommendation system can find your best roommate match.",
    type: "textarea",
    placeholder: "Tell us about yourself, your habits, vibe, and what kind of roommates you match with...",
    required: true,
  },
];

function getInitialAnswers() {
  return QUESTIONS.reduce((acc, item) => {
    if (item.type === "slider") {
      acc[item.id] = item.defaultValue;
    } else if (item.type === "multiselect") {
      acc[item.id] = [];
    } else {
      acc[item.id] = "";
    }
    return acc;
  }, {});
}

function normalizeIndianMobileNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const withoutCountryCode =
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return withoutCountryCode;
}

function sanitizePhoneInput(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

export default function PersonalityQuizPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(getInitialAnswers);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setIsAnimating(true); }, []);
  useEffect(() => {
    let isMounted = true;

    const checkQuizAccess = async () => {
      try {
        const response = await backendFetch("student/getStudent");
        const user = response?.user || {};

        if (!isMounted) {
          return;
        }

        const hasGroup = Boolean(user?.group?.id || user?.groupId);
        const hasProfile = Boolean((user?.hostelType || "").trim());
        const hasQuiz = Boolean(user?.quizCompleted);

        if (hasGroup) {
          router.replace("/explore-rooms");
          return;
        }

        if (hasQuiz) {
          router.replace(hasProfile ? "/find-buddies" : "/profile");
          return;
        }

        setIsCheckingAccess(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err?.message || "Unable to verify quiz access";
        if (message.toLowerCase().includes("authorized")) {
          router.replace("/signin?error=Please login first");
          return;
        }

        showToast(message, "error");
        setIsCheckingAccess(false);
      }
    };

    checkQuizAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const q = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;
  const isFirst = current === 0;
  const isHostelTypeQuestion = q.type === "single-select" && q.id === 1;

  const handleSlider = (val) => { setAnswers((p) => ({ ...p, [q.id]: Number(val) })); setError(""); };
  const handleText = (val) => { setAnswers((p) => ({ ...p, [q.id]: val })); setError(""); };
  const handlePhoneText = (val) => { setAnswers((p) => ({ ...p, [q.id]: sanitizePhoneInput(val) })); setError(""); };
  const handleSingleSelect = (option) => { setAnswers((p) => ({ ...p, [q.id]: option })); setError(""); };
  const handleMultiSelect = (option) => {
    setAnswers((p) => {
      const curr = p[q.id] || [];
      const updated = curr.includes(option)
        ? curr.filter((x) => x !== option)
        : [...curr, option];
      return { ...p, [q.id]: updated };
    });
    setError("");
  };

  const setValidationError = (message) => {
    showToast(message, "error");
    return false;
  };

  const validate = () => {
    if (q.required && (
      answers[q.id] === "" ||
      answers[q.id] === null ||
      answers[q.id] === undefined ||
      (Array.isArray(answers[q.id]) && answers[q.id].length === 0)
    )) {
      return setValidationError("This question is required!");
    }

    if (q.type === "phone") {
      const normalized = normalizeIndianMobileNumber(answers[q.id]);
      if (!/^[6-9]\d{9}$/.test(normalized)) {
        return setValidationError("Enter a valid 10-digit Indian mobile number.");
      }
    }

    if (q.type === "number") {
      const rank = Number(answers[q.id]);
      if (!Number.isInteger(rank) || rank <= 0) {
        return setValidationError("Enter a valid hostel rank (positive integer).");
      }
    }

    return true;
  };

  const handleNext = () => { if (!validate()) return; setError(""); setCurrent((p) => p + 1); };
  const handlePrev = () => { setError(""); setCurrent((p) => p - 1); };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const introText = String(answers[10] || "").trim();
      const payload = {
        hostelType: answers[1],
        phone: normalizeIndianMobileNumber(answers[2]),
        hostelGroup: Number(answers[3]),
        rank: Number(answers[4]),
        sleepTime: answers[5],
        wakeTime: answers[6],
        cleanliness: answers[7],
        socialScene: answers[8],
        languages: answers[9],
        ...(introText ? { interests: introText, description: introText } : {}),
        quizCompleted: true,
      };

      console.log("Submitting payload:", payload);

      const result = await backendFetch("student/updateStudent", {
        method: "PUT",
        body: payload,
      });

      console.log("Update success:", result);

      router.push("/find-buddies?quizUpdated=1");

    } catch (err) {
      console.error("Update failed:", err);
      const message = err.message || "Something went wrong.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sliderPercent = q.type === "slider"
    ? ((answers[q.id] - q.min) / (q.max - q.min)) * 100
    : 0;

  if (isCheckingAccess) {
    return (
      <BackgroundGrid>
        <div className={`${syne.className} min-h-screen p-4 flex items-center justify-center`}>
          <p className="text-lg font-semibold text-black">Loading quiz...</p>
        </div>
      </BackgroundGrid>
    );
  }

  return (
    <BackgroundGrid>
      <style>{`
      .quiz-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 3px;
        border-radius: 0;
        background: #543E62;
        outline: none;
        cursor: pointer;
        position: relative;
        z-index: 2;
      }
      .quiz-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath d='M9 15 L2 3 Q2 2 3 2 L15 2 Q16 2 16 3 Z' fill='%23342E36'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
        border: none;
      }
      .quiz-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath d='M9 15 L2 3 Q2 2 3 2 L15 2 Q16 2 16 3 Z' fill='%23342E36'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        background-color: transparent;
        border: none;
      }
      `}</style>

      <div className={`${syne.className} min-h-screen relative p-4 flex flex-col items-center justify-center pt-20 md:pt-20 pb-10 md:pb-2`}>

        {/* Top bar */}
        <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
          <button type="button" onClick={() => router.push("/")} className="focus:outline-none" aria-label="Go to homepage">
            <Image src="/logo.svg" alt="Logo" width={160} height={60} className="w-auto h-12 md:h-16" priority />
          </button>
        </div>

        {/* Main card */}
        <main className={`w-full max-w-[780px] bg-[#F6CD67] border border-black shadow-[6px_6px_0px_black] rounded-[5px] px-7 py-8 md:px-10 md:py-10 relative mt-4 md:mt-0 transition-all duration-300 ease-out ${isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
          }`}>

          <h1 className="text-[28px] md:text-[38px] font-bold mb-1">Personality Quiz</h1>
          <p className="text-sm md:text-base font-bold text-black/60 mb-7">
            Filling this accurately would help us recommend you roomates
          </p>

          {/* Question card */}
          <div className="bg-[#FF9898] border border-black shadow-[4px_4px_0px_black] rounded-[5px] px-5 py-6 mb-8" style={{ minHeight: 160 }}>

            {/* Question header */}
            <div className="flex items-start gap-3 mb-6">
              <span
                className="bg-[#947BA8] w-9 h-9 grid place-items-center rounded-md flex-shrink-0 text-[20px] font-extrabold leading-none mt-[2px]"
                style={{ boxShadow: "2px 2px 0px black", color: "#ffffff" }}
              >
                {q.id}
              </span>
              <div className="flex-1">
                <span className="font-bold text-[17px] md:text-[20px] block">{q.question}</span>
                {q.helperText && (
                  <span className="text-xs md:text-sm text-black/70 font-semibold whitespace-pre-line">{q.helperText}</span>
                )}
              </div>
            </div>

            {/* Single-select chips */}
            {q.type === "single-select" && (
              <div className={isHostelTypeQuestion ? "grid grid-cols-2 gap-4 w-full max-w-[520px] mx-auto" : q.id === 3 ? "grid grid-cols-3 gap-3 w-full max-w-[400px] mx-auto" : "flex flex-wrap gap-3 justify-center"}>
                {q.options.map((option) => {
                  const selected = answers[q.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSingleSelect(option)}
                      className={isHostelTypeQuestion
                        ? "h-14 md:h-16 rounded-[8px] border border-black text-lg md:text-2xl font-bold transition-all flex items-center justify-center"
                        : q.id === 3 ? "w-full py-3 rounded-[6px] border border-black text-sm font-semibold transition-all text-center" : "px-10 py-2 rounded-[6px] border border-black text-sm font-semibold transition-all"}
                      style={{
                        backgroundColor: selected ? "#947BA8" : "rgba(255,255,255,0.5)",
                        color: selected ? "#ffffff" : "#1a1a1a",
                        boxShadow: "2px 2px 0px black",
                        transform: selected ? "translate(1px, 1px)" : "none",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Phone input */}
            {q.type === "phone" && (
              <input
                type="tel"
                value={answers[q.id]}
                onChange={(e) => handlePhoneText(e.target.value)}
                placeholder={q.placeholder}
                inputMode="numeric"
                maxLength={10}
                className="w-full bg-[#ff9898]/40 border border-black/20 rounded-[4px] px-4 py-3 text-sm focus:outline-none placeholder:text-black/40 font-[inherit]"
              />
            )}

            {/* Numeric input */}
            {q.type === "number" && (
              <input
                type="number"
                min="1"
                step="1"
                value={answers[q.id]}
                onChange={(e) => handleText(e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-[#ff9898]/40 border border-black/20 rounded-[4px] px-4 py-3 text-sm focus:outline-none placeholder:text-black/40 font-[inherit]"
              />
            )}

            {/* Slider */}
            {q.type === "slider" && (
              <div className="px-1">
                <div className="relative mt-8">
                  {/* Floating bubble */}
                  <div
                    className="absolute -top-8 transform -translate-x-1/2 bg-[#342E36] text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap z-10"
                    style={{ left: `${sliderPercent}%` }}
                  >
                    {q.formatLabel(answers[q.id])}
                  </div>

                  {/* Slider + ticks in same container */}
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={q.min}
                      max={q.max}
                      step={q.step}
                      value={answers[q.id]}
                      onChange={(e) => handleSlider(e.target.value)}
                      className="quiz-slider"
                      style={{ "--val": `${sliderPercent}%` }}
                    />
                    {/* Tick marks overlaid on the bar — skip first and last */}
                    <div className="absolute inset-0 flex items-center pointer-events-none" style={{ zIndex: 1 }}>
                      {Array.from({ length: q.max - q.min - 1 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-[1.5px] h-2 bg-[#947BA8]"
                          style={{ left: `${((i + 1) / (q.max - q.min)) * 100}%`, transform: "translateX(-50%)" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <span className="text-sm font-bold text-black/70">{q.minLabel}</span>
                  <span className="text-sm font-bold text-black/70">{q.maxLabel}</span>
                </div>
              </div>
            )}

            {/* Multi-select language chips */}
            {q.type === "multiselect" && (
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map((lang) => {
                  const selected = (answers[q.id] || []).includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleMultiSelect(lang)}
                      className="px-5 py-2 rounded-[6px] border border-black text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: selected ? "#947BA8" : "rgba(255,255,255,0.5)",
                        color: selected ? "#ffffff" : "#1a1a1a",
                        boxShadow: "2px 2px 0px black",
                        transform: selected ? "translate(1px, 1px)" : "none",
                      }}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Textarea */}
            {q.type === "textarea" && (
              <textarea
                value={answers[q.id]}
                onChange={(e) => handleText(e.target.value)}
                placeholder={q.placeholder}
                rows={4}
                className="w-full bg-[#ff9898]/40 border border-black/20 rounded-[4px] px-4 py-3 text-sm focus:outline-none placeholder:text-black/40 resize-none font-[inherit]"
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="mb-4 bg-[#FB5E4C] border border-black rounded-[4px] px-3 py-2 text-sm">
              {error}
            </p>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="w-36 bg-[#947BA8] text-white border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-6 py-2 text-[15px] font-semibold hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"< Previous"}
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-36 bg-[#947BA8] text-white border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-6 py-2 text-[15px] font-semibold hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-36 bg-[#947BA8] text-white border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-6 py-2 text-[15px] font-semibold hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all"
              >
                {"Next >"}
              </button>
            )}
          </div>
        </main>
      </div>
    </BackgroundGrid>
  );
}

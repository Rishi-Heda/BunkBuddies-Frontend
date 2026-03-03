"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch } from "../utils/backendClient";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];

const QUESTIONS = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
    question: "What all languages do you speak?",
    type: "multiselect",
    required: false,
  },
  {
    id: 6,
    question: "What all things interest you?",
    type: "textarea",
    placeholder: "I love discovering new music and artists, building tech projects...",
    required: false,
  },
];

export default function PersonalityQuizPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({
    1: QUESTIONS[0].defaultValue,
    2: QUESTIONS[1].defaultValue,
    3: QUESTIONS[2].defaultValue,
    4: QUESTIONS[3].defaultValue,
    5: [],
    6: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setIsAnimating(true); }, []);

  const q = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;
  const isFirst = current === 0;

  const handleSlider = (val) => { setAnswers((p) => ({ ...p, [q.id]: Number(val) })); setError(""); };
  const handleText = (val) => { setAnswers((p) => ({ ...p, [q.id]: val })); setError(""); };
  const handleMultiSelect = (option) => {
    setAnswers((p) => {
      const curr = p[5] || [];
      const updated = curr.includes(option)
        ? curr.filter((x) => x !== option)
        : [...curr, option];
      return { ...p, 5: updated };
    });
    setError("");
  };

  const validate = () => {
    if (q.required && (
      answers[q.id] === "" ||
      answers[q.id] === null ||
      answers[q.id] === undefined ||
      (Array.isArray(answers[q.id]) && answers[q.id].length === 0)
    )) {
      setError("This question is required!"); return false;
    }
    return true;
  };

  const handleNext = () => { if (!validate()) return; setError(""); setCurrent((p) => p + 1); };
  const handlePrev = () => { setError(""); setCurrent((p) => p - 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      await backendFetch("student/updateStudent", {
        method: "PUT",
        body: {
          sleepTime: answers[1],
          wakeTime: answers[2],
          cleanliness: answers[3],
          socialScene: answers[4],
          languages: answers[5],
          interests: answers[6],
          quizCompleted: true,
        },
      });

      const response = await backendFetch("student/getStudent");
      const user = response?.user || {};
      const hasProfile = Boolean((user?.hostelType || "").trim());
      router.push(hasProfile ? "/find-buddies" : "/profile");
    } catch (error) {
      setError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sliderPercent = q.type === "slider"
    ? ((answers[q.id] - q.min) / (q.max - q.min)) * 100
    : 0;

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
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#947BA8] font-extrabold text-xl w-9 h-9 flex items-center justify-center rounded-md flex-shrink-0" style={{ boxShadow: "2px 2px 0px black", color: "#ffffff", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "20px", lineHeight: "1" }}>
                {q.id}
              </span>
              <span className="font-bold text-[17px] md:text-[20px] flex-1">{q.question}</span>
            </div>

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
                  const selected = (answers[5] || []).includes(lang);
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
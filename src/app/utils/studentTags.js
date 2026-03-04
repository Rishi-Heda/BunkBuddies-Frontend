// utils/studentTags.js
import React from "react";

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const LanguagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
    </svg>
);

function formatSleepTime(sleepTime) {
    const hour24 = sleepTime % 24;
    const hour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 < 12 ? "AM" : "PM";
    // Handle half hours e.g. 23.5 → 11:30 PM
    const mins = Math.round((sleepTime % 1) * 60);
    const minsStr = mins > 0 ? `:${String(mins).padStart(2, "0")}` : "";
    return `${hour}${minsStr} ${period}`;
}

export function getSleepTag(student) {
    const sleep = Number(student?.sleepTime);
    if (!Number.isFinite(sleep)) return null;
    return { label: formatSleepTime(sleep), icon: <MoonIcon /> };
}

export function getLanguageTags(student) {
    if (!Array.isArray(student?.languages)) return [];
    return student.languages
        .filter((lang) => typeof lang === "string" && lang.trim().length > 0)
        .map((lang) => ({ label: lang.trim(), icon: <LanguagesIcon /> }));
}
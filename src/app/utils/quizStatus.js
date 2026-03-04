export function parseQuizCompleted(value) {
    if (value === true) {
        return true;
    }
    if (typeof value === "number") {
        return value === 1;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1";
    }
    return false;
}

export function hasRequiredQuizAnswers(user) {
    const hostelType = String(user?.hostelType || "").trim();
    const hostelGroup = Number(user?.hostelGroup);
    const maxHostelGroup = hostelType.toUpperCase() === "LH" ? 4 : 3;
    const rank = Number(user?.rank);
    const sleepTime = Number(user?.sleepTime);
    const wakeTime = Number(user?.wakeTime);
    const phone = String(user?.phone || "").trim();
    const intro = String(user?.interests || user?.description || "").trim();

    return Boolean(hostelType) &&
        Number.isFinite(hostelGroup) &&
        hostelGroup >= 1 &&
        hostelGroup <= maxHostelGroup &&
        Boolean(phone) &&
        Number.isFinite(rank) &&
        rank > 0 &&
        Number.isFinite(sleepTime) &&
        Number.isFinite(wakeTime) &&
        Boolean(intro);
}

export function isQuizCompleted(user) {
    return parseQuizCompleted(user?.quizCompleted) && hasRequiredQuizAnswers(user);
}

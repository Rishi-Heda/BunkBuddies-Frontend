"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";

const syne = Syne({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});

const FRONTEND_LOGIN_ROUTE = "/api/login";

export default function SignInPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [authError, setAuthError] = useState("");
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        setAuthError(error || "");

        const loadSession = async () => {
            try {
                const response = await fetch("/api/auth/session", {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = await response.json().catch(() => ({}));

                if (!isMounted) {
                    return;
                }

                if (payload?.authenticated) {
                    router.replace(payload?.nextRoute || "/find-buddies");
                    return;
                }
            } finally {
                if (isMounted) {
                    setCheckingSession(false);
                }
            }
        };

        loadSession();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleGoogleSignIn = () => {
        setIsRedirecting(true);
        window.location.href = FRONTEND_LOGIN_ROUTE;
    };

    return (
        <BackgroundGrid>
            <div className={`${syne.className} h-screen relative flex flex-col items-center p-4 md:p-8 overflow-y-auto md:overflow-hidden`}>
                <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={120}
                        height={40}
                        className="w-auto h-8 md:h-12"
                    />
                </div>

                <div className="w-full max-w-5xl mt-12 sm:mt-8 md:mt-12 lg:mt-16 space-y-4 sm:space-y-6 md:space-y-8 flex-1 flex flex-col pb-6 sm:pb-8">
                    <div className="w-full bg-[#47D19D] border-[1.5px] border-black px-4 sm:px-6 py-3 sm:py-4 md:py-5 lg:py-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shrink-0">
                        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-black text-center md:text-left leading-tight">
                            Let&apos;s find you your perfect roommates
                        </h1>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isRedirecting || checkingSession}
                            className="bg-[#BE8EF8] border border-black shadow-[2px_3px_0px_black] px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 sm:gap-3 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_2px_0px_black] active:translate-x-[2px] active:translate-y-[3px] active:shadow-none shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Image
                                src="/google.svg"
                                alt="Google"
                                width={24}
                                height={24}
                                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                            />
                            <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium">
                                {checkingSession ? "Checking..." : (isRedirecting ? "Redirecting..." : "Continue with Google")}
                            </span>
                        </button>
                    </div>

                    {authError ? (
                        <p className="w-full bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-3 text-sm sm:text-base text-black font-medium">
                            {authError}
                        </p>
                    ) : null}

                    <div className="w-full flex-1 min-h-[120px] sm:min-h-[150px] md:min-h-[200px] max-h-[500px] lg:max-h-[600px] bg-[#FD9E51] border border-black rounded-[5px] shadow-[4px_4px_0px_black] sm:shadow-[5px_5px_0px_black] md:shadow-[7px_7px_0px_black]" />
                </div>
            </div>
        </BackgroundGrid>
    );
}

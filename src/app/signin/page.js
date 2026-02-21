"use client";

import React, { useEffect, useState } from "react";
import "./custom-scrollbar.css";
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
	const [logoutNotice, setLogoutNotice] = useState("");
	const [checkingSession, setCheckingSession] = useState(true);

	useEffect(() => {
		let isMounted = true;
		const params = new URLSearchParams(window.location.search);
		const error = params.get("error");
		const loggedOut = params.get("loggedOut") === "1";
		setAuthError(error || "");
		setLogoutNotice(loggedOut ? "You have been logged out." : "");

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
			<div
				className={`${syne.className} h-screen relative flex flex-col items-center p-4 md:p-8 overflow-y-auto md:overflow-hidden`}
			>
				{/* 1. BunkBuddies horizontal logo/header */}
				<div
					className="w-full flex justify-between items-center z-50"
					style={{ height: "10vh", minHeight: 60 }}
				>
					<button
						type="button"
						onClick={() => router.push("/")}
						className="focus:outline-none"
						aria-label="Go to homepage"
					>
						<Image
							src="/logo.svg"
							alt="Logo"
							width={120}
							height={40}
							className="w-auto h-8 md:h-12"
						/>
					</button>
				</div>

				{/* 2. Login with Google section */}
				<div
					className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-[#47D19D] border-[1.5px] border-black px-4 sm:px-6 py-3 sm:py-4 md:py-5 lg:py-6 mt-4"
					style={{ height: "15vh", minHeight: 80 }}
				>
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
							{checkingSession
								? "Checking..."
								: isRedirecting
									? "Redirecting..."
									: "Continue with Google"}
						</span>
					</button>
				</div>

				{/* 3. Toast section (authError/logoutNotice) */}
				<div
					className="w-full max-w-5xl flex flex-col items-center mt-2 mb-2"
					style={{ height: "10vh", minHeight: 40 }}
				>
					{authError ? (
						<p className="w-full bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-3 text-sm sm:text-base text-black font-medium">
							{authError}
						</p>
					) : null}
					{logoutNotice ? (
						<p className="w-full bg-[#47D19D] border border-black rounded-[5px] px-4 py-3 text-sm sm:text-base text-black font-medium">
							{logoutNotice}
						</p>
					) : null}
				</div>

				{/* 4. FAQ orange box */}
				<div
					className="w-full max-w-5xl min-h-[120px] sm:min-h-[150px] md:min-h-[200px] max-h-[50vh] bg-[#FD9E51] border border-black rounded-[5px] shadow-[4px_4px_0px_black] sm:shadow-[5px_5px_0px_black] md:shadow-[7px_7px_0px_black] overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar"
					style={{ maxHeight: "50vh", minHeight: 120 }}
				>
					<h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-black">
						FAQs
					</h2>
					<ol className="list-decimal pl-4 space-y-3 text-black text-sm sm:text-base md:text-lg">
						<li>
							<b>Is BunkBuddies only for VIT students?</b>
							<br />
							Yes. You need a valid VIT email ID to create a profile and start
							matching.
						</li>
						<li>
							<b>Is it free to use?</b>
							<br />
							Yes, creating a profile and browsing roommates is completely free.
						</li>
						<li>
							<b>Does BunkBuddies replace official hostel allocation?</b>
							<br />
							No. Hostel allocation is still done by the university.
							<br />
							BunkBuddies helps you find and coordinate with a preferred
							roommate before allocation.
						</li>
						<li>
							<b>How does matching work?</b>
							<br />
							You create a profile, browse potential roommates or groups, and
							send a request with a short introduction. If both of you agree,
							you can connect and plan accordingly.
						</li>
						<li>
							<b>What if I don’t find a match?</b>
							<br />
							You can keep browsing and sending requests until you find someone
							who fits your lifestyle and vibe.
						</li>
						<li>
							<b>Can I create or join a group?</b>
							<br />
							Yes! You can either join an existing group or create one and
							invite others.
						</li>
						<li>
							<b>Is my information safe?</b>
							<br />
							Yes. Your details are only visible to verified users on the
							platform.
						</li>
						<li>
							<b>What should I talk about before confirming a roommate?</b>
							<br />
							Sleep schedule, AC preferences, quiet hours, basically the real
							things that matter daily.
						</li>
						<li>
							<b>Can I cancel a request after sending it?</b>
							<br />
							Yes, you can withdraw a request anytime before it’s accepted.
						</li>
						<li>
							<b>What if my roommate situation changes later?</b>
							<br />
							You can always update your profile and look for a new match if
							needed.
						</li>
					</ol>
				</div>
			</div>
		</BackgroundGrid>
	);
}

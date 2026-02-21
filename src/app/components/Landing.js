"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Syne } from "next/font/google";
import { useRouter } from "next/navigation";
import BackgroundGrid from "./BackgroundLines";
import CustomButton from "./CustomButton";

import InfiniteMarquee from "./InfiniteMarquee";

const heroSyne = Syne({
	subsets: ["latin"],
	weight: ["700", "800"],
	display: "swap",
});

const INITIAL_SESSION = {
	checked: false,
	authenticated: false,
	nextRoute: "/signin",
	shouldGoExplore: false,
};

function mapSessionPayload(payload) {
	if (!payload?.authenticated) {
		return {
			...INITIAL_SESSION,
			checked: true,
		};
	}

	const nextRoute =
		typeof payload?.nextRoute === "string" && payload.nextRoute.startsWith("/")
			? payload.nextRoute
			: "/find-buddies";

	return {
		checked: true,
		authenticated: true,
		nextRoute,
		shouldGoExplore: Boolean(payload?.shouldGoExplore),
	};
}

async function fetchSessionState() {
	try {
		const response = await fetch("/api/auth/session", {
			method: "GET",
			cache: "no-store",
		});
		const payload = await response.json().catch(() => ({}));
		return mapSessionPayload(payload);
	} catch {
		return {
			...INITIAL_SESSION,
			checked: true,
		};
	}
}

export default function Landing() {
	const router = useRouter();
	const [sessionState, setSessionState] = useState(INITIAL_SESSION);
	const [isRouting, setIsRouting] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const checkSession = async () => {
			const nextSession = await fetchSessionState();
			if (isMounted) {
				setSessionState(nextSession);
			}
		};

		checkSession();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSignIn = async () => {
		if (isRouting) {
			return;
		}

		setIsRouting(true);

		try {
			const nextSession = sessionState.checked
				? sessionState
				: await fetchSessionState();
			if (!sessionState.checked) {
				setSessionState(nextSession);
			}
			router.push(nextSession.nextRoute);
		} finally {
			setIsRouting(false);
		}
	};

	const navCtaLabel = !sessionState.checked
		? "Checking..."
		: sessionState.authenticated
			? "Explore"
			: "Sign In";

	const heroCtaLabel = !sessionState.checked
		? "Checking session..."
		: sessionState.authenticated
			? "Find my BunkBuddy"
			: "Find my BunkBuddy";

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
						<Image
							src="/door.svg"
							alt={navCtaLabel}
							width={14}
							height={14}
							className="sm:w-4 sm:h-4"
						/>
						{navCtaLabel}
					</CustomButton>
				</nav>

				{/* Hero */}
				<section className="flex flex-col items-center text-center px-4 pt-8 sm:px-6 sm:pt-10 md:px-8">
					<div className="w-full flex flex-col items-center">
						<h1
							className={`${heroSyne.className} text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight text-gray-900 mb-3 sm:mb-4 text-center w-full mx-auto`}
						>
							<span className="block whitespace-normal sm:whitespace-nowrap">
								Find the roommate you'll
							</span>
							<span className="block whitespace-normal sm:whitespace-nowrap">
								actually survive with.
							</span>
						</h1>

						<p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0 max-w-xs sm:max-w-md md:max-w-lg text-center">
							Don't leave hostel life to random allocation. Find someone who
							fits your life not just the empty bed.
						</p>

						<div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10">
							<CustomButton
								color="#47D19D"
								className="font-bold w-full sm:w-auto"
								onClick={handleSignIn}
							>
								{heroCtaLabel}
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
					<InfiniteMarquee />
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
				<section className="flex-1 pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[#FB5E4C] flex flex-col items-center text-center px-4 sm:px-8 md:px-40.75">
					<p className="text-[20px] sm:text-[24px] md:text-[32px] font-normal text-left md:text-justify leading-7 text-gray-900 max-w-225 mx-auto">
						   <strong>Hostel roulette isn&apos;t fun. It&apos;s a risk.</strong> One random allocation and suddenly
						   it&apos;s 3AM lights on, mismatched routines, passive-aggressive notes,
						   and &quot;we&apos;ll adjust&quot; lies. Small differences don&apos;t stay small, they
						   turn into daily friction. BunkBuddies helps you match with
						   intention. Because your space should feel right.
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

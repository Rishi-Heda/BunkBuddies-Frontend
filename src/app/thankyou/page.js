"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";

const syne = Syne({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

export default function ThankYouPage() {
	const router = useRouter();

	return (
		<BackgroundGrid>
            <div className="absolute inset-0 bg-[#FEE3D2] opacity-40 pointer-events-none z-0" />
			<div
				className={`${syne.className} min-h-screen relative flex flex-col`}
			>
				{/* Header */}
				<header className="absolute top-4 md:top-6 left-0 w-full px-6 md:px-10 flex justify-between items-center z-50">
					<button
						type="button"
						onClick={() => router.push("/")}
						className="focus:outline-none"
						aria-label="Go to homepage"
					>
						<Image
							src="/logo.svg"
							alt="BunkBuddies Logo"
							width={160}
							height={60}
							className="w-auto h-12 md:h-16"
							priority
						/>
					</button>
				</header>

				{/* Main */}
				<main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-0.5">
					<h1
						className="text-black leading-tight"
						style={{
							fontSize: "clamp(64px, 10vw, 150px)",
							fontWeight: 700,
							letterSpacing: "-2px",
						}}
					>
						Thank You!
					</h1>
					<p
						className="text-[#615651]"
						style={{
							fontSize: "clamp(19px, 2.8vw, 43px)",
							fontWeight: 500,
							letterSpacing: "0.022em",
						}}
					>
						For all the lovely support and response shown this year 🫶
					</p>
				</main>

				{/* Footer */}
				<footer className="px-6 md:px-10 pb-20 md:pb-10 pt-4 flex items-end justify-between flex-wrap gap-4">
					{/* Signing off */}
					<div>
						<p className="text-[#555] text-sm md:text-[22px] mb-[-7]">Signing Off</p>
						<p className="text-black font-bold text-xl md:text-[36px]">
							Team VinnovateIT 🤘
						</p>
					</div>

					{/* CTA — sharp corners, thick border, brutalist shadow matching Figma */}
					<button
						type="button"
						className="bg-[#F6CD67] border-1 border-black shadow-[6px_6px_0px_black] rounded-[4px] px-14 py-4.5 text-black text-[15px] md:text-[20px] font-medium w-full md:w-auto md:whitespace-nowrap text-center hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[2px_2px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
					>
						Stay tuned, we&apos;ll be back next year with super awesome features 💪
					</button>
				</footer>
			</div>
		</BackgroundGrid>
	);
}
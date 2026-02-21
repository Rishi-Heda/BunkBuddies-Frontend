import React from "react";
import { Syne } from "next/font/google";

const syne = Syne({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
});

const HowItWorks = () => {
	const steps = [
		{
			id: 1,
			title: "Set Up Your Profile",
			description:
				"Add your name, VIT email, registration number, and rank.\nTakes 2 minutes. No drama.",
			bgColor: "bg-[#47D19D]",
		},
		{
			id: 2,
			title: "Find Your People",
			description:
				"Browse roommates or groups.\nSee someone who matches your vibe? Send a request with a short intro.",
			bgColor: "bg-[#BE8EF8]",
		},
		{
			id: 3,
			title: "Start the Vibe Check",
			description:
				"Matched? Start chatting.\nTalk sleep schedules, habits, cleanliness, interests, the real stuff that matters.\nAnd that’s it. No random allocation stress.",
			bgColor: "bg-[#FB5E4C]",
		},
	];

	return (
		<section
			id="how-it-works"
			className={`${syne.className} w-full py-12 px-4 md:px-6 lg:px-8`}
		>
			<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
				{/* Left Side: Title */}
				<div className="flex justify-center md:justify-start">
					<h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight text-center md:text-left">
						How it works ?
					</h2>
				</div>

				{/* Right Side: Cards */}
				<div className="space-y-6">
					{steps.map((step) => (
						<div
							key={step.id}
							className={`${step.bgColor} p-6 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:animate-bounce-squash`}
						>
							<h3 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-black mb-2 leading-tight">
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
	);
};

export default HowItWorks;
// Add custom bounce-squash animation to global styles if not present

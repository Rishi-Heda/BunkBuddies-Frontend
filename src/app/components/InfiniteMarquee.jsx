"use client";

import Image from "next/image";

const images = Array.from({ length: 43 }).map((_, i) => ({
	id: i,
	src: `marquee_img/${(i % 43) + 1}.svg`,
}));

const shapes = ["/shape1.png", "/shape2.png", "/shape3.png", "/shape4.png"];

const maskStyle = (shapeSrc) => ({
	WebkitMaskImage: `url(${shapeSrc})`,
	WebkitMaskRepeat: "no-repeat",
	WebkitMaskSize: "contain",
	WebkitMaskPosition: "center",
	maskImage: `url(${shapeSrc})`,
	maskRepeat: "no-repeat",
	maskSize: "contain",
	maskPosition: "center",
});

function ShapeMask({ shapeSrc, imgSrc }) {
	return (
		<div className="relative w-50 h-35 md:w-75 md:h-60 shrink-0" style={{ filter: "drop-shadow(2px 0 0 black) drop-shadow(-2px 0 0 black) drop-shadow(0 2px 0 black) drop-shadow(0 -2px 0 black)" }}>
			<div
				className="absolute inset-0 overflow-hidden"
				style={{
					backgroundImage: `url(${shapeSrc})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					...maskStyle(shapeSrc),
					backgroundColor: "white",
				}}
			>
				<img
					src={imgSrc}
					alt="character"
					className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-[95%] object-contain object-bottom"
				/>
			</div>
		</div>
	);
}

function Shape2Mask({ shapeSrc, imgSrc, imgSrc2 }) {
	return (
		<div className="relative w-50 h-35 md:w-75 md:h-60 shrink-0" style={{ filter: "drop-shadow(2px 0 0 black) drop-shadow(-2px 0 0 black) drop-shadow(0 2px 0 black) drop-shadow(0 -2px 0 black)" }}>
			<div
				className="absolute inset-0 overflow-hidden"
				style={{
					backgroundImage: `url(${shapeSrc})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					...maskStyle(shapeSrc),
					backgroundColor: "white",
				}}
			>
				<img
					src={imgSrc}
					alt="character left"
					className="absolute -bottom-8 left-0 w-[75%] h-[95%] object-contain object-bottom"
					style={{ objectPosition: "bottom left" }}
				/>
				<img
					src={imgSrc2}
					alt="character right"
					className="absolute -bottom-8 -right-15 w-[75%] h-[95%] object-contain scale-x-[-1]"
					style={{ objectPosition: "bottom right" }}
				/>
			</div>
		</div>
	);
}

export default function InfiniteMarquee() {
	const track = [...images, ...images, ...images];

	return (
		<div className="relative w-screen overflow-hidden py-2">
			<div className="flex animate-marquee" style={{ width: "max-content" }}>
				{track.map((_, index) => {
					const shapeIndex = index % 4;
					const shapeSrc = shapes[shapeIndex];
					const cycleIndex = Math.floor(index / 4);
					const offsets = [0, 1, 3, 4];
					const imgIndex = cycleIndex * 5 + offsets[shapeIndex];
					const imgSrc = track[imgIndex % track.length].src;
					const imgSrc2 = track[(imgIndex + 1) % track.length].src;

					return shapeIndex === 1 ? (
						<Shape2Mask
							key={index}
							shapeSrc={shapeSrc}
							imgSrc={imgSrc}
							imgSrc2={imgSrc2}
						/>
					) : (
						<ShapeMask key={index} shapeSrc={shapeSrc} imgSrc={imgSrc} />
					);
				})}
			</div>

			<style jsx>{`
				@keyframes marquee {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(-33.3333%);
					}
				}
				.animate-marquee {
					animation: marquee 200s linear infinite;
				}
			`}</style>
		</div>
	);
}

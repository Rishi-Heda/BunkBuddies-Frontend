"use client"; //comment 
import { showToast } from "../components/Toast";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch } from "../utils/backendClient";
import { isQuizCompleted } from "../utils/quizStatus";

const syne = Syne({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

export default function FindBuddiesPage() {
	const router = useRouter();
	const [accessCode, setAccessCode] = useState("");
	const [joinRoomOpen, setJoinRoomOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isJoining, setIsJoining] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [userGroup, setUserGroup] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
	const actionCardClassName =
		"bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[3px] p-5 md:p-6 lg:p-7 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.01] transition-transform w-full h-[250px] md:h-[260px] lg:h-[270px]";
	const actionCardTitleClassName =
		"text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1 leading-tight";
	const actionCardTextClassName =
		"text-[12px] md:text-[13px] lg:text-[14px] font-normal leading-tight text-black/80";
	const actionCardIconClassName = "w-9 h-9 md:w-10 md:h-10 mb-2 md:mb-3";

	useEffect(() => {
		setIsAnimating(true);
		const params = new URLSearchParams(window.location.search);
		const profileUpdated = params.get("profileUpdated") === "1";
		const quizUpdated = params.get("quizUpdated") === "1";
		if (profileUpdated) {
			setTimeout(() => {
				showToast("Profile updated successfully!", "success");
			}, 500);
		}
		if (quizUpdated) {
			setTimeout(() => {
				showToast("Quiz submitted successfully!", "success");
			}, 500);
		}
		if (profileUpdated || quizUpdated) {
			window.history.replaceState({}, "", window.location.pathname);
		}

		const joinCode = params.get("joinCode");
		if (joinCode) {
			setAccessCode(joinCode);
			setJoinRoomOpen(true);
			// Removing the joinCode from the URL to clean it up
			const newUrl = window.location.pathname;
			window.history.replaceState({}, "", newUrl);
		}

		const loadUserData = async () => {
			try {
				const response = await backendFetch("student/getStudent");
				const student = response?.user || {};
				const hasQuiz = isQuizCompleted(student);
				if (!hasQuiz) {
					router.push("/personality-quiz");
					return;
				}
				const group = student.group || null;
				setUserGroup(group);
				if (group) {
					setIsAdmin(
						Boolean(
							student.firebaseUID &&
							group.adminUID &&
							student.firebaseUID === group.adminUID,
						),
					);
				}
			} catch {
				// Silently fail - user might not be logged in
			}
		};

		loadUserData();
	}, []);

	const handleJoinRoom = async (event) => {
		event.preventDefault();

		const code = accessCode.trim();

		if (!code) {
			showToast("Please enter an access code", "error");
			return;
		}

		// Already in group
		if (userGroup) {
			setShowLeaveGroupModal(true);
			return;
		}

		setIsJoining(true);

		try {
			await backendFetch(
				`group/joinGroup/${encodeURIComponent(code)}`,
				{ method: "POST" }
			);

			// ✅ TASK: Joined room with code
			showToast("Joined room successfully", "success");

			router.push("/my-groups");

		} catch (error) {
			const message = error?.message || "Unable to join group";
			const lowerMessage = message.toLowerCase();

			if (lowerMessage.includes("authorized")) {
				router.push("/signin?error=Please login first");
				return;
			}

			// ✅ TASK: Group doesn't exist (code)
			if (lowerMessage.includes("expired")) {
				showToast("Code has expired!", "error");
			}
			else if (
				lowerMessage.includes("not found") ||
				lowerMessage.includes("doesn't exist") ||
				lowerMessage.includes("invalid")
			) {
				showToast("Group doesn't exist for this code", "error");
			}
			else {
				showToast(message, "error");
			}
		} finally {
			setIsJoining(false);
		}
	};

	return (
		<BackgroundGrid>
			<div
				className={`${syne.className} min-h-screen relative p-4 flex flex-col items-center justify-center pt-20 md:pt-20 pb-10 md:pb-2`}
			>
				<div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
					<button
						type="button"
						onClick={() => router.push("/")}
						className="focus:outline-none"
						aria-label="Go to homepage"
					>
						<Image
							src="/logo.svg"
							alt="Logo"
							width={160}
							height={60}
							className="w-auto h-12 md:h-16"
							priority
						/>
					</button>
					<Navbar wrapperClass="static flex items-center h-8 md:h-12" />
				</div>

				<main
					className={`w-full max-w-[1045px] bg-[#9AD7FD] border border-black shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-10 relative mt-4 md:mt-0 transition-all duration-300 ease-out ${isAnimating
						? "translate-y-0 opacity-100 scale-100"
						: "translate-y-8 opacity-0 scale-95"
						}`}
				>
					<div className="flex flex-row justify-between items-center mb-5 md:mb-8 gap-3">
						<h1 className="text-xl md:text-2xl lg:text-[30px] font-semibold leading-tight">
							Find Your <br className="md:hidden" /> BunkBuddies
						</h1>
						<button
							onClick={() => router.back()}
							aria-label="Go back"
							className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] p-1.5 md:p-2 hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all self-start mt-1 md:mt-0 md:self-auto"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
					</div>

					{errorMessage ? (
						<p className="mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
							{errorMessage}
						</p>
					) : null}

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-5 lg:gap-6 max-w-[280px] md:max-w-[900px] mx-auto">
						<div
							onClick={() => {
								if (userGroup && !isAdmin) {
									setShowLeaveGroupModal(true);
								} else {
									router.push("/create-room");
								}
							}}
							className={actionCardClassName}
						>
							<Image
								src="/find.svg"
								alt="Find"
								width={48}
								height={32}
								className="w-10 h-7 md:w-12 md:h-8 mb-2 md:mb-3"
							/>
							<h2 className={actionCardTitleClassName}>
								Create a Room
							</h2>
							<p className={actionCardTextClassName}>
								Start a new room and find your future roomies
							</p>
						</div>

						<div
							onClick={() => router.push("/explore-rooms")}
							className={actionCardClassName}
						>
							<Image
								src="/explore.svg"
								alt="Explore"
								width={40}
								height={40}
								className={actionCardIconClassName}
							/>
							<h2 className={actionCardTitleClassName}>
								Explore Rooms
							</h2>
							<p className={actionCardTextClassName}>
								Dont have a room yet? <br />
								Find your new roommates here
							</p>
						</div>

						<div
							className="bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[3px] relative overflow-hidden w-full h-[250px] md:h-[260px] lg:h-[270px] cursor-pointer hover:scale-[1.01] transition-transform"
							onClick={() => setJoinRoomOpen((previous) => !previous)}
						>
							<div
								className="flex flex-col w-full transition-transform duration-500 ease-in-out h-[200%]"
								style={{
									transform: joinRoomOpen
										? "translateY(-50%)"
										: "translateY(0)",
								}}
							>
								<div className="flex flex-col items-center justify-center text-center p-5 md:p-6 lg:p-7 h-[50%]">
									<Image
										src="/link.svg"
										alt="Link"
										width={48}
										height={48}
										className={actionCardIconClassName}
									/>
									<h2 className={actionCardTitleClassName}>
										Join a Room
									</h2>
									<p className={`${actionCardTextClassName} max-w-[85%]`}>
										Already have a room code? Join your new roomies
									</p>
								</div>

								<div className="flex flex-col items-center justify-center p-5 md:p-6 lg:p-7 h-[50%]">
									<label className="text-[15px] md:text-[17px] font-semibold mb-2">
										Input Access Code
									</label>
									<input
										type="text"
										value={accessCode}
										onChange={(event) => setAccessCode(event.target.value)}
										placeholder="Access Code"
										onClick={(event) => event.stopPropagation()}
										className="w-full max-w-[200px] md:max-w-[220px] bg-[#F7CC66] rounded-[3.89px] border border-black px-3 py-2 text-[14px] md:text-[16px] text-[#575757] font-normal focus:outline-none placeholder:text-[#575757] mb-3 text-center"
									/>
									<button
										onClick={(event) => {
											event.stopPropagation();
											handleJoinRoom(event);
										}}
										disabled={isJoining}
										className="bg-[#FD9E51] border border-black shadow-[2px_2px_0px_black] rounded-[3.24px] px-6 py-2 text-[14px] md:text-[15px] font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
									>
										{isJoining ? "Joining..." : "Submit"}
									</button>
								</div>
							</div>
						</div>

						{/* ── My Chats card ── */}
						<div
							onClick={() => router.push("/chat")}
							className={actionCardClassName}
						>
							<svg
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="black"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className={actionCardIconClassName}
							>
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
							</svg>
							<h2 className={actionCardTitleClassName}>
								My Chats
							</h2>
							<p className={actionCardTextClassName}>
								Chat with your soon-to-be roomies
							</p>
						</div>

					</div>
				</main>

				{/* Leave Group Modal */}
				{showLeaveGroupModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
						<div className="bg-[#9AD7FD] border-2 border-black shadow-[5px_5px_0px_black] rounded-[8px] p-6 max-w-md w-[90%] mx-4">
							<h2 className="text-xl font-bold mb-4 text-center">
								Already in a Group
							</h2>
							<p className="text-sm mb-5 text-center">
								You are already a member of a group. Please leave your current
								group first before creating or joining another group.
							</p>
							<div className="flex justify-center gap-3">
								<button
									type="button"
									onClick={() => setShowLeaveGroupModal(false)}
									className="bg-[#FB5E4C] border border-black rounded-[4px] shadow-[3px_3px_0px_black] px-6 py-2 text-base font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={() => router.push("/my-groups")}
									className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_3px_0px_black] px-6 py-2 text-base font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
								>
									Go to My Groups
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</BackgroundGrid>
	);
}

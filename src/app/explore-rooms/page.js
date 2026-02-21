"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch, groupCapacity } from "../utils/backendClient";

const syne = Syne({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

export default function ExploreRoomsPage() {
	const router = useRouter();
	const [rooms, setRooms] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sendingRoomId, setSendingRoomId] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [userGroup, setUserGroup] = useState(null);
	const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);

	useEffect(() => {
		let isMounted = true;

        const loadData = async () => {
            try {
                const [studentResponse, groupsResponse] = await Promise.all([
                    backendFetch("student/getStudent"),
                    backendFetch("group/listGroups"),
                ]);
                if (!isMounted) {
                    return;
                }

                const studentHostelType = studentResponse?.user?.hostelType || "";
                const fetchedRooms = Array.isArray(groupsResponse?.groups) ? groupsResponse.groups : [];
                const filteredRooms = studentHostelType
                    ? fetchedRooms.filter((room) => room?.hostelType === studentHostelType)
                    : [];

                setRooms(filteredRooms);
            } catch (error) {
                const message = error?.message || "Unable to load groups";
                if (message.toLowerCase().includes("authorized")) {
                    router.push("/signin?error=Please login first");
                    return;
                }
                if (isMounted) {
                    setErrorMessage(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

		loadData();

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleSendRequest = async (roomId) => {
		// Check if user is already in a group
		if (userGroup) {
			setShowLeaveGroupModal(true);
			return;
		}

		setSendingRoomId(roomId);
		setErrorMessage("");

		try {
			await backendFetch(`groupRequest/joinRequest/${roomId}`, {
				method: "POST",
			});
			alert("Join request sent successfully!");
		} catch (error) {
			const message = error?.message || "Unable to send request";
			if (message.toLowerCase().includes("authorized")) {
				router.push("/signin?error=Please login first");
				return;
			}
			setErrorMessage(message);
		} finally {
			setSendingRoomId("");
		}
	};

	return (
		<BackgroundGrid>
			<div
				className={`${syne.className} min-h-screen md:h-screen md:overflow-hidden relative p-4 flex flex-col items-center justify-center pt-20 md:pt-[88px] pb-10 md:pb-4`}
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
							width={120}
							height={40}
							className="w-auto h-8 md:h-12"
							priority
						/>
					</button>
					<Navbar wrapperClass="static flex items-center h-8 md:h-12" />
				</div>

				<div className="w-full max-w-[1045px] bg-[#88E7C3] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0 flex flex-col md:max-h-[calc(100vh-108px)]">
					<div className="flex justify-between items-center mb-5 shrink-0">
						<h1 className="text-xl md:text-2xl font-semibold text-black">
							Explore Rooms
						</h1>
						<button
							type="button"
							onClick={() => router.back()}
							className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1 md:py-1.5 text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all"
						>
							← Go Back
						</button>
					</div>

					{errorMessage ? (
						<p className="mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
							{errorMessage}
						</p>
					) : null}

					<div className="overflow-visible md:overflow-y-auto overflow-x-hidden custom-scrollbar pt-2 px-2 md:flex-1 min-h-0 -mx-2">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4 max-w-[900px] mx-auto px-2 h-max">
							{isLoading ? (
								<div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
									<p className="text-[#3E3E3E] text-xl font-medium">
										Loading rooms...
									</p>
								</div>
							) : null}

							{!isLoading && rooms.length === 0 ? (
								<div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center flex flex-col items-center">
									<p className="text-[#3E3E3E] text-2xl font-medium">
										No one has created a room yet!
									</p>
									<p className="mt-3 text-[#3E3E3E]">
										Be the first to start a group.
									</p>
								</div>
							) : null}

                            {!isLoading && rooms.map((room) => {
                                const capacity = groupCapacity(room.groupSize);
                                const currentMembers = Array.isArray(room.students) ? room.students.length : 0;
                                const availableBeds = Math.max(capacity - currentMembers, 0);
                                
                                // Find admin from students array
                                const admin = Array.isArray(room.students) 
                                    ? room.students.find(s => s.firebaseUID === room.adminUID) 
                                    : null;

                                return (
                                    <div
                                        key={room.id}
                                        className="w-full bg-[#CBA0FF] border border-black shadow-[3.5px_3.5px_0px_black] rounded-[2.5px] p-5 relative flex flex-col hover:scale-[1.01] transition-transform h-[370px]"
                                    >
                                        <div className="mb-4">
                                            <p className="text-[#3E3E3E] text-base font-normal">{room.groupSize} {room.type}</p>
                                            <h2 className="text-black text-2xl font-normal leading-tight">{room.groupName || "Unnamed Room"}</h2>
                                        </div>

                                        <div className="space-y-1 mb-4 flex-grow">
                                            <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                                <span>Group Leader</span>
                                                <span>{admin?.name || room.adminName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                                <span>Reg No.</span>
                                                <span>{admin?.regNo || room.adminRegNo || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                                <span>No. of beds available</span>
                                                <span>{availableBeds}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                                <span>Block Preference</span>
                                                <span>{room.block1 || "N/A"}{room.block2 ? `>${room.block2}` : ""}{room.block3 ? `>${room.block3}` : ""}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                                <span>Group Admin CGPA</span>
                                                <span>{room.adminCGPA ?? "N/A"}</span>
                                            </div>
                                        </div>

											{room.preferences ? (
												<div className="bg-[#E7D2FF] rounded-[5px] p-2.5 mb-4 min-h-[56px]">
													<p className="text-[#606060] text-[11px] font-medium leading-tight">
														{room.preferences}
													</p>
												</div>
											) : null}

											<div className="mt-auto flex justify-center">
												<button
													onClick={() => handleSendRequest(room.id)}
													disabled={sendingRoomId === room.id}
													className="bg-[#47D19D] border border-black shadow-[1.6px_2.2px_0px_black] rounded-[2.7px] px-3 py-1.5 text-black text-[12.96px] font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[1.6px] active:translate-y-[2.2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
												>
													{sendingRoomId === room.id
														? "Sending..."
														: "Send Request to join"}
												</button>
											</div>
										</div>
									);
								})}
						</div>
					</div>
				</div>

				<style jsx>{`
					.custom-scrollbar::-webkit-scrollbar {
						width: 6px;
					}
					.custom-scrollbar::-webkit-scrollbar-track {
						background: rgba(0, 0, 0, 0.05);
						border-radius: 10px;
					}
					.custom-scrollbar::-webkit-scrollbar-thumb {
						background: rgba(0, 0, 0, 0.2);
						border-radius: 10px;
					}
					.custom-scrollbar::-webkit-scrollbar-thumb:hover {
						background: rgba(0, 0, 0, 0.3);
					}
				`}</style>

				{/* Leave Group Modal */}
				{showLeaveGroupModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
						<div className="bg-[#88E7C3] border-2 border-black shadow-[5px_5px_0px_black] rounded-[8px] p-6 max-w-md w-[90%] mx-4">
							<h2 className="text-xl font-bold mb-4 text-center">
								Already in a Group
							</h2>
							<p className="text-sm mb-5 text-center">
								You are already a member of a group. Please leave your current
								group first before sending a request to join another group.
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
									className="bg-[#CBA0FF] border border-black rounded-[4px] shadow-[3px_3px_0px_black] px-6 py-2 text-base font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
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

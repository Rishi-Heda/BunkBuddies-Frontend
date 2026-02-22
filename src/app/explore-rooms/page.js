"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import { FiChevronDown, FiFilter, FiSearch, FiSliders } from "react-icons/fi";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch, groupCapacity } from "../utils/backendClient";

const syne = Syne({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

const MH_ROOM_SIZES = [2, 3, 4, 6];
const LH_ROOM_SIZES = [2, 3, 4, 5, 6];
const DEFAULT_ROOM_SIZES = [2, 3, 4, 5, 6];
const ROOMS_PER_PAGE = 6;

const normalizeText = (value) => String(value || "").trim();
const normalizeBlock = (value) => normalizeText(value).toUpperCase();

const roomBlocks = (room) =>
	[room.block1, room.block2, room.block3]
		.map(normalizeBlock)
		.filter(Boolean);

export default function ExploreRoomsPage() {
	const router = useRouter();
	const filterMenuRef = useRef(null);
	const sortMenuRef = useRef(null);

	const [rooms, setRooms] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sendingRoomId, setSendingRoomId] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [userGroup, setUserGroup] = useState(null);
	const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);
	const [showSortDropdown, setShowSortDropdown] = useState(false);
	const [selectedRoomTypes, setSelectedRoomTypes] = useState({
		ac: false,
		nac: false,
	});
	const [selectedRoomSize, setSelectedRoomSize] = useState("");
	const [selectedBlock, setSelectedBlock] = useState("");
	const [sortBy, setSortBy] = useState("none");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [backendFilterOptions, setBackendFilterOptions] = useState({
		hostelType: "",
		roomTypes: [],
		roomSizes: [],
		blocks: [],
	});

	const getAvailableBeds = (room) => {
		const capacity = groupCapacity(room.groupSize);
		const currentMembers = Array.isArray(room.students) ? room.students.length : 0;
		return Math.max(capacity - currentMembers, 0);
	};

	useEffect(() => {
		let isMounted = true;

		const loadStudent = async () => {
			try {
				const studentResponse = await backendFetch("student/getStudent");
				const student = studentResponse?.user || {};
				if (isMounted) {
					setUserGroup(student.group || null);
				}
			} catch (error) {
				const message = error?.message || "Unable to load student details";
				if (message.toLowerCase().includes("authorized")) {
					router.push("/signin?error=Please login first");
					return;
				}
				if (isMounted) {
					setErrorMessage(message);
				}
			}
		};

		loadStudent();

		return () => {
			isMounted = false;
		};
	}, [router]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				showFilterDropdown &&
				filterMenuRef.current &&
				!filterMenuRef.current.contains(event.target)
			) {
				setShowFilterDropdown(false);
			}
			if (
				showSortDropdown &&
				sortMenuRef.current &&
				!sortMenuRef.current.contains(event.target)
			) {
				setShowSortDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showFilterDropdown, showSortDropdown]);

	const blockOptions = useMemo(() => {
		const optionsFromBackend = Array.isArray(backendFilterOptions.blocks)
			? Array.from(
					new Set(
						backendFilterOptions.blocks
							.map((block) => normalizeText(block))
							.filter(Boolean),
					),
			  )
			: [];
		if (optionsFromBackend.length > 0) {
			return optionsFromBackend.sort((a, b) => a.localeCompare(b));
		}

		const dynamicBlocks = Array.from(new Set(rooms.flatMap((room) => roomBlocks(room))));
		if (dynamicBlocks.length === 0) {
			return ["LH", "MH"];
		}
		return dynamicBlocks.sort((a, b) => a.localeCompare(b));
	}, [backendFilterOptions.blocks, rooms]);

	const allowedRoomSizes = useMemo(() => {
		const optionsFromBackend = Array.isArray(backendFilterOptions.roomSizes)
			? Array.from(
					new Set(
						backendFilterOptions.roomSizes
							.map((size) => Number.parseInt(String(size), 10))
							.filter((size) => Number.isFinite(size)),
					),
			  )
			: [];
		if (optionsFromBackend.length > 0) {
			return optionsFromBackend.sort((a, b) => a - b);
		}

		const normalizedBlock = normalizeBlock(selectedBlock);
		const isMH = normalizedBlock === "MH";
		const isLH = normalizedBlock === "LH";

		if (isMH) {
			return MH_ROOM_SIZES;
		}
		if (isLH) {
			return LH_ROOM_SIZES;
		}
		return DEFAULT_ROOM_SIZES;
	}, [backendFilterOptions.roomSizes, selectedBlock]);

	useEffect(() => {
		if (selectedRoomSize && !allowedRoomSizes.includes(Number.parseInt(selectedRoomSize, 10))) {
			setSelectedRoomSize("");
		}
	}, [allowedRoomSizes, selectedRoomSize]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedRoomTypes, selectedRoomSize, selectedBlock, sortBy]);

	useEffect(() => {
		if (!selectedBlock) {
			return;
		}
		const exists = blockOptions.some(
			(block) => normalizeBlock(block) === normalizeBlock(selectedBlock),
		);
		if (!exists) {
			setSelectedBlock("");
		}
	}, [blockOptions, selectedBlock]);

	useEffect(() => {
		let isMounted = true;
		const trimmedSearch = searchQuery.trim();

		const fetchGroups = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const params = new URLSearchParams();
				params.set("page", String(currentPage));
				params.set("pageSize", String(ROOMS_PER_PAGE));

				if (trimmedSearch) {
					params.set("search", trimmedSearch);
				}
				if (selectedRoomSize) {
					params.set("groupSize", `${selectedRoomSize}-Bedded`);
				}
				if (selectedBlock) {
					params.set("block1", selectedBlock);
				}
				if (sortBy !== "none") {
					params.set("sortBy", sortBy);
					params.set("sortOrder", "desc");
				}

				const activeRoomTypes = [];
				if (selectedRoomTypes.ac) {
					activeRoomTypes.push("AC");
				}
				if (selectedRoomTypes.nac) {
					activeRoomTypes.push("NON-AC");
				}
				if (activeRoomTypes.length === 1) {
					params.set("type", activeRoomTypes[0]);
				}

				const response = await backendFetch(`group/listGroups?${params.toString()}`);
				if (!isMounted) {
					return;
				}

				const apiGroups = Array.isArray(response?.groups) ? response.groups : [];
				const apiTotalCount = Number(response?.totalCount ?? response?.total ?? 0);
				const apiTotalPages = Number(response?.totalPages ?? 1);

				setRooms(apiGroups);
				setTotalCount(Number.isFinite(apiTotalCount) ? apiTotalCount : 0);
				setTotalPages(
					Number.isFinite(apiTotalPages) && apiTotalPages > 0 ? apiTotalPages : 1,
				);

				const options = response?.filterOptions || {};
				setBackendFilterOptions({
					hostelType: String(options.hostelType || ""),
					roomTypes: Array.isArray(options.roomTypes) ? options.roomTypes : [],
					roomSizes: Array.isArray(options.roomSizes) ? options.roomSizes : [],
					blocks: Array.isArray(options.blocks) ? options.blocks : [],
				});
			} catch (error) {
				const message = error?.message || "Unable to load groups";
				if (message.toLowerCase().includes("authorized")) {
					router.push("/signin?error=Please login first");
					return;
				}
				if (isMounted) {
					setErrorMessage(message);
					setRooms([]);
					setTotalCount(0);
					setTotalPages(1);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		const timer = setTimeout(fetchGroups, trimmedSearch ? 250 : 0);
		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [
		currentPage,
		router,
		searchQuery,
		selectedBlock,
		selectedRoomSize,
		selectedRoomTypes,
		sortBy,
	]);

	useEffect(() => {
		setCurrentPage((previous) => Math.min(previous, totalPages));
	}, [totalPages]);

	const visibleStartIndex =
		totalCount === 0 ? 0 : (currentPage - 1) * ROOMS_PER_PAGE + 1;
	const visibleEndIndex = Math.min(currentPage * ROOMS_PER_PAGE, totalCount);

	const toggleRoomType = (typeKey) => {
		setSelectedRoomTypes((previous) => ({
			...previous,
			[typeKey]: !previous[typeKey],
		}));
	};

	const handleSendRequest = async (roomId) => {
		// Check if user is already in a group.
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
				className={`${syne.className} mint-scrollbar min-h-screen md:h-screen md:overflow-y-auto relative p-4 flex flex-col items-center justify-center pt-20 md:pt-[88px] pb-10 md:pb-4`}
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

				<div className="w-full max-w-[1045px] bg-[#88E7C3] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0 flex flex-col md:max-h-[calc(100vh-108px)] overflow-hidden">
					<div className="flex justify-between items-center mb-5 shrink-0">
						<h1 className="text-xl md:text-2xl font-semibold text-black">
							Explore Rooms
						</h1>
						<button
							type="button"
							onClick={() => router.back()}
							className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1 md:py-1.5 text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all"
						>
							&larr; Go Back
						</button>
					</div>

					{errorMessage ? (
						<p className="mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
							{errorMessage}
						</p>
					) : null}

					<div className="mb-5 bg-[#FB5E4C] border border-black shadow-[4px_4px_0px_black] rounded-[5px] p-2 md:p-2.5 shrink-0">
						<div className="flex flex-col md:flex-row md:items-center gap-2">
							<div className="relative flex-1">
								<input
									type="text"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder="Search by Room Name, Person Name, Reg. No"
									className="w-full bg-[#F4CB66] border border-black rounded-[4px] pl-3 pr-9 py-2 text-black text-base placeholder:text-[#5C5C5C] focus:outline-none"
								/>
								<FiSearch
									aria-hidden="true"
									className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
								/>
							</div>

							<div className="flex items-center justify-end gap-2">
								<div className="relative" ref={filterMenuRef}>
									<button
										type="button"
										onClick={() => {
											setShowFilterDropdown((previous) => !previous);
											setShowSortDropdown(false);
										}}
										className="bg-[#F7A640] border border-black rounded-[4px] px-2.5 py-2 text-sm text-black flex items-center gap-1.5"
									>
										Filter Rooms
										<FiFilter aria-hidden="true" className="text-sm" />
									</button>

									{showFilterDropdown ? (
										<div className="absolute right-0 top-[calc(100%+8px)] w-[292px] bg-[#E8D0C2] border-2 border-black shadow-[4px_4px_0px_black] rounded-[4px] p-4 z-40">
											<div className="mb-4">
												<p className="text-black text-base mb-2">Room Type</p>
												<div className="grid grid-cols-2 gap-3">
													<button
														type="button"
														onClick={() => toggleRoomType("ac")}
														className={`w-full text-center border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-4 py-1 text-sm ${
															selectedRoomTypes.ac
																? "bg-[#88E7C3]"
																: "bg-[#F2E6DE]"
														}`}
													>
														AC
													</button>
													<button
														type="button"
														onClick={() => toggleRoomType("nac")}
														className={`w-full text-center border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-4 py-1 text-sm ${
															selectedRoomTypes.nac
																? "bg-[#88E7C3]"
																: "bg-[#F2E6DE]"
														}`}
													>
														Non-AC
													</button>
												</div>
											</div>

											<div className="mb-4">
												<p className="text-black text-base mb-2">Room Size</p>
												<div className="relative w-[110px]">
													<select
														value={selectedRoomSize}
														onChange={(event) => setSelectedRoomSize(event.target.value)}
														className="appearance-none w-full bg-[#88E7C3] border border-black rounded-[3px] shadow-[2px_4px_0px_black] pl-2 pr-7 py-1 text-sm text-black focus:outline-none"
													>
														<option value="">All</option>
														{allowedRoomSizes.map((size) => (
															<option key={size} value={size}>
																{size}
															</option>
														))}
													</select>
													<FiChevronDown
														aria-hidden="true"
														className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black text-sm"
													/>
												</div>
											</div>

											<div className="mb-3">
												<p className="text-black text-base mb-2">Preferred Block</p>
												<div className="relative w-[110px]">
													<select
														value={selectedBlock}
														onChange={(event) => setSelectedBlock(event.target.value)}
														className="appearance-none w-full bg-[#88E7C3] border border-black rounded-[3px] shadow-[2px_4px_0px_black] pl-2 pr-7 py-1 text-sm text-black focus:outline-none"
													>
														<option value="">All</option>
														{blockOptions.map((block) => (
															<option key={block} value={block}>
																{block}
															</option>
														))}
													</select>
													<FiChevronDown
														aria-hidden="true"
														className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black text-sm"
													/>
												</div>
											</div>

											<div className="flex justify-center items-center gap-3 pt-1">
												<button
													type="button"
													onClick={() => {
														setSelectedRoomTypes({ ac: false, nac: false });
														setSelectedRoomSize("");
														setSelectedBlock("");
													}}
													className="w-[78px] bg-[#F2E6DE] border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-3 py-1 text-xs"
												>
													Clear
												</button>
												<button
													type="button"
													onClick={() => setShowFilterDropdown(false)}
													className="w-[126px] bg-[#FB5E4C] border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-4 py-1 text-xs"
												>
													Filter Rooms
												</button>
											</div>
										</div>
									) : null}
								</div>

								<div className="relative" ref={sortMenuRef}>
									<button
										type="button"
										onClick={() => {
											setShowSortDropdown((previous) => !previous);
											setShowFilterDropdown(false);
										}}
										className="bg-[#F7A640] border border-black rounded-[4px] px-2.5 py-2 text-sm text-black flex items-center gap-1.5"
									>
										Sort Rooms
										<FiSliders aria-hidden="true" className="text-sm" />
									</button>

									{showSortDropdown ? (
										<div className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-w-[calc(100vw-2rem)] bg-[#E8D0C2] border-2 border-black shadow-[4px_4px_0px_black] rounded-[4px] p-5 z-40">
											<p className="text-black text-[22px] mb-4">Sort By</p>
											<div className="grid grid-cols-2 gap-3">
												<button
													type="button"
													onClick={() => {
														setSortBy("vacancy");
														setShowSortDropdown(false);
													}}
													className="text-center border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-3 py-1.5 text-sm bg-[#88E7C3]"
												>
													Vacancy
												</button>
												<button
													type="button"
													onClick={() => {
														setSortBy("cgpa");
														setShowSortDropdown(false);
													}}
													className="text-center border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-3 py-1.5 text-sm bg-[#88E7C3]"
												>
													CGPA
												</button>
											</div>
											<div className="flex justify-center mt-3">
												<button
													type="button"
													onClick={() => {
														setSortBy("none");
														setShowSortDropdown(false);
													}}
													className="text-center border border-black rounded-[4px] shadow-[2px_4px_0px_black] px-4 py-1 text-sm bg-[#F2E6DE]"
												>
													Clear
												</button>
											</div>
										</div>
									) : null}
								</div>
							</div>
						</div>
					</div>

					<div className="mint-scrollbar overflow-y-auto px-2 md:flex-1 min-h-0 -mx-2 flex flex-col">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:auto-rows-fr gap-8 pb-4 px-2 w-full">
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
										No rooms match your current search/filter.
									</p>
									<p className="mt-3 text-[#3E3E3E]">
										Try changing your search, sort, or filter options.
									</p>
								</div>
							) : null}

							{!isLoading &&
								rooms.map((room) => {
									const availableBeds = getAvailableBeds(room);
									const adminStudent = Array.isArray(room.students)
										? room.students.find(
												(member) => member?.firebaseUID === room.adminUID,
										  )
										: null;
									const groupLeaderName =
										room.adminName || adminStudent?.name || "N/A";
									const groupLeaderRegNo =
										room.adminRegNo || adminStudent?.regNo || "N/A";

									return (
										<div
											key={room.id}
											className="w-full bg-[#CBA0FF] border border-black shadow-[3.5px_3.5px_0px_black] rounded-[2.5px] p-5 relative flex flex-col hover:scale-[1.01] transition-transform min-h-[330px]"
										>
											<div className="mb-4">
												<p className="text-[#3E3E3E] text-base font-normal">
													{room.groupSize} {room.type}
												</p>
												<h2 className="text-black text-2xl font-normal leading-tight">
													{room.groupName || "Unnamed Room"}
												</h2>
											</div>

											<div className="space-y-1 mb-4 flex-grow">
												<div className="flex justify-between items-center text-[#141414] text-[15.84px]">
													<span>Group Leader</span>
													<span>{groupLeaderName}</span>
												</div>
												<div className="flex justify-between items-center text-[#141414] text-[15.84px]">
													<span>Reg No.</span>
													<span>{groupLeaderRegNo}</span>
												</div>
												<div className="flex justify-between items-center text-[#141414] text-[15.84px]">
													<span>No. of beds available</span>
													<span>{availableBeds}</span>
												</div>
												<div className="flex justify-between items-center text-[#141414] text-[15.84px]">
													<span>Block Preference</span>
													<span>
														{room.block1 || "N/A"}
														{room.block2 ? `>${room.block2}` : ""}
														{room.block3 ? `>${room.block3}` : ""}
													</span>
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

						{!isLoading && totalCount > 0 ? (
							<div className="w-full px-2 pb-1 pt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
								<p className="text-sm text-[#2F2F2F]">
									Showing {visibleStartIndex}-{visibleEndIndex} of{" "}
									{totalCount}
								</p>

								{totalPages > 1 ? (
									<div className="flex items-center gap-1.5 flex-wrap md:justify-end">
										<button
											type="button"
											onClick={() =>
												setCurrentPage((previous) => Math.max(previous - 1, 1))
											}
											disabled={currentPage === 1}
											className="bg-[#F7A640] border border-black rounded-[4px] px-2.5 py-1 text-sm disabled:opacity-55"
										>
											Prev
										</button>

										{Array.from({ length: totalPages }, (_, index) => index + 1).map(
											(pageNumber) => (
												<button
													key={pageNumber}
													type="button"
													onClick={() => setCurrentPage(pageNumber)}
													className={`border border-black rounded-[4px] px-2.5 py-1 text-sm ${
														currentPage === pageNumber
															? "bg-[#FB5E4C]"
															: "bg-[#F2E6DE]"
													}`}
												>
													{pageNumber}
												</button>
											),
										)}

										<button
											type="button"
											onClick={() =>
												setCurrentPage((previous) =>
													Math.min(previous + 1, totalPages),
												)
											}
											disabled={currentPage === totalPages}
											className="bg-[#F7A640] border border-black rounded-[4px] px-2.5 py-1 text-sm disabled:opacity-55"
										>
											Next
										</button>
									</div>
								) : null}
							</div>
						) : null}
					</div>
				</div>

				<style jsx>{`
					.mint-scrollbar {
						scrollbar-width: thin;
						scrollbar-color: #59b89b #8addc2;
					}
					.mint-scrollbar::-webkit-scrollbar {
						width: 10px;
					}
					.mint-scrollbar::-webkit-scrollbar-track {
						background: #8addc2;
						border-radius: 999px;
						margin: 4px 0;
					}
					.mint-scrollbar::-webkit-scrollbar-thumb {
						background: #59b89b;
						border-radius: 999px;
						border: 2px solid #8addc2;
					}
					.mint-scrollbar::-webkit-scrollbar-thumb:hover {
						background: #4da98d;
					}
				`}</style>

				{/* Leave Group Modal */}
				{showLeaveGroupModal ? (
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
				) : null}
			</div>
		</BackgroundGrid>
	);
}

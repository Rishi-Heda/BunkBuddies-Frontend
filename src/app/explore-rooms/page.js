"use client";

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from "../components/Toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import { FiChevronDown, FiFilter, FiSearch, FiSliders } from "react-icons/fi";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import CustomButton from "../components/CustomButton";
import { backendFetch, groupCapacity } from "../utils/backendClient";
import { isQuizCompleted } from "../utils/quizStatus";

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
	[room.block1, room.block2, room.block3].map(normalizeBlock).filter(Boolean);

const shuffleRooms = (items) => {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[randomIndex]] = [
			shuffled[randomIndex],
			shuffled[index],
		];
	}
	return shuffled;
};

const getRankOrCgpaDisplay = (personLike, fallbackCgpa) => {
	const parsedRank = Number(personLike?.rank);
	if (Number.isFinite(parsedRank) && parsedRank > 0) {
		return { label: "Rank", value: parsedRank };
	}
	const cgpaValue = personLike?.CGPA ?? fallbackCgpa;
	return { label: "CGPA", value: cgpaValue ?? "N/A" };
};

export default function ExploreRoomsPage() {
	const router = useRouter();

	const filterMenuRef = useRef(null);
	const sortMenuRef = useRef(null);

	const [rooms, setRooms] = useState([]);
	const [requestedRoomIds, setRequestedRoomIds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sendingRoomId, setSendingRoomId] = useState("");
	const [, setErrorMessage] = useState("");
	const [userGroup, setUserGroup] = useState(null);
	const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);
	const [showSortDropdown, setShowSortDropdown] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [showRoomSizeOptions, setShowRoomSizeOptions] = useState(false);
	const [showBlockOptions, setShowBlockOptions] = useState(false);
	const [selectedRoomTypes, setSelectedRoomTypes] = useState({
		ac: false,
		nac: false,
	});
	const [selectedRoomSizes, setSelectedRoomSizes] = useState([]);
	const [selectedBlocks, setSelectedBlocks] = useState([]);
	const [appliedRoomTypes, setAppliedRoomTypes] = useState({
		ac: false,
		nac: false,
	});
	const [appliedRoomSizes, setAppliedRoomSizes] = useState([]);
	const [appliedBlocks, setAppliedBlocks] = useState([]);
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
		const apiBeds = Number(room?.availableBeds);
		if (Number.isFinite(apiBeds) && apiBeds >= 0) {
			return apiBeds;
		}
		const capacity = groupCapacity(room.groupSize);
		const currentMembers = Array.isArray(room.students)
			? room.students.length
			: 0;
		return Math.max(capacity - currentMembers, 0);
	};

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const loginSuccess = params.get("success") === "1";
		if (loginSuccess) {
			window.history.replaceState({}, "", window.location.pathname);
			setTimeout(() => {
				showToast("Login Successful", "Welcome to BunkBuddies!");
			}, 500);
		}
		let isMounted = true;

		const loadStudent = async () => {
			try {
				const studentResponse = await backendFetch("student/getStudent");
				const student = studentResponse?.user || {};
				if (!isQuizCompleted(student)) {
					router.push("/personality-quiz");
					return;
				}
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
		// track small screen to change dropdown behavior
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		// when switching to mobile, ensure nested option popovers are closed
		if (isMobile) {
			setShowRoomSizeOptions(false);
			setShowBlockOptions(false);
		}
	}, [isMobile]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				showFilterDropdown &&
				filterMenuRef.current &&
				!filterMenuRef.current.contains(event.target)
			) {
				setShowFilterDropdown(false);
				setShowRoomSizeOptions(false);
				setShowBlockOptions(false);
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

		const dynamicBlocks = Array.from(
			new Set(rooms.flatMap((room) => roomBlocks(room))),
		);
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

		const hostelType = normalizeBlock(backendFilterOptions.hostelType);
		if (hostelType === "MH") {
			return MH_ROOM_SIZES;
		}
		if (hostelType === "LH") {
			return LH_ROOM_SIZES;
		}
		return DEFAULT_ROOM_SIZES;
	}, [backendFilterOptions.hostelType, backendFilterOptions.roomSizes]);

	useEffect(() => {
		const allowed = new Set(allowedRoomSizes.map((size) => String(size)));
		setSelectedRoomSizes((previous) => {
			const next = previous.filter((size) => allowed.has(String(size)));
			return next.length === previous.length ? previous : next;
		});
		setAppliedRoomSizes((previous) => {
			const next = previous.filter((size) => allowed.has(String(size)));
			return next.length === previous.length ? previous : next;
		});
	}, [allowedRoomSizes]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, appliedRoomTypes, appliedRoomSizes, appliedBlocks, sortBy]);

	useEffect(() => {
		const allowed = new Set(blockOptions.map((block) => normalizeBlock(block)));
		setSelectedBlocks((previous) => {
			const next = previous.filter((block) =>
				allowed.has(normalizeBlock(block)),
			);
			return next.length === previous.length ? previous : next;
		});
		setAppliedBlocks((previous) => {
			const next = previous.filter((block) =>
				allowed.has(normalizeBlock(block)),
			);
			return next.length === previous.length ? previous : next;
		});
	}, [blockOptions]);

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
				appliedRoomSizes.forEach((roomSize) => {
					params.append("groupSizes", `${roomSize}-Bedded`);
				});
				appliedBlocks.forEach((block) => {
					params.append("blocks", block);
				});
				if (sortBy !== "none") {
					params.set("sortBy", sortBy);
					params.set("sortOrder", "desc");
				}

				const activeRoomTypes = [];
				if (appliedRoomTypes.ac) {
					activeRoomTypes.push("AC");
				}
				if (appliedRoomTypes.nac) {
					activeRoomTypes.push("NON-AC");
				}
				if (activeRoomTypes.length === 1) {
					params.set("type", activeRoomTypes[0]);
				}

				const response = await backendFetch(
					`group/listGroups?${params.toString()}`,
				);
				if (!isMounted) {
					return;
				}

				const apiGroups = Array.isArray(response?.groups)
					? response.groups
					: [];
				const apiTotalCount = Number(
					response?.totalCount ?? response?.total ?? 0,
				);
				const apiTotalPages = Number(response?.totalPages ?? 1);

				const nextRooms =
					sortBy === "none" ? shuffleRooms(apiGroups) : apiGroups;

				setRooms(nextRooms);
				setTotalCount(Number.isFinite(apiTotalCount) ? apiTotalCount : 0);
				setTotalPages(
					Number.isFinite(apiTotalPages) && apiTotalPages > 0
						? apiTotalPages
						: 1,
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
					showToast(message, "error"); //replaced error red bar with toast
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
		appliedBlocks,
		appliedRoomSizes,
		appliedRoomTypes,
		sortBy,
	]);

	useEffect(() => {
		setCurrentPage((previous) => Math.min(previous, totalPages));
	}, [totalPages]);

	const visibleStartIndex =
		totalCount === 0 ? 0 : (currentPage - 1) * ROOMS_PER_PAGE + 1;
	const visibleEndIndex = Math.min(currentPage * ROOMS_PER_PAGE, totalCount);
	const shouldShowCreateRoomTile =
		!isLoading && totalCount > 0 && currentPage === totalPages;

	const toggleRoomType = (typeKey) => {
		setSelectedRoomTypes((previous) => ({
			...previous,
			[typeKey]: !previous[typeKey],
		}));
	};

	const toggleRoomSize = (size) => {
		const normalizedSize = String(size);
		setSelectedRoomSizes((previous) => {
			if (previous.includes(normalizedSize)) {
				return previous.filter((value) => value !== normalizedSize);
			}
			return [...previous, normalizedSize].sort(
				(a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
			);
		});
	};

	const toggleBlock = (block) => {
		const normalizedBlockValue = normalizeText(block);
		if (!normalizedBlockValue) {
			return;
		}
		setSelectedBlocks((previous) => {
			const isSelected = previous.some(
				(value) =>
					normalizeBlock(value) === normalizeBlock(normalizedBlockValue),
			);
			if (isSelected) {
				return previous.filter(
					(value) =>
						normalizeBlock(value) !== normalizeBlock(normalizedBlockValue),
				);
			}
			return [...previous, normalizedBlockValue];
		});
	};

	const markRoomAsRequested = (roomId) => {
		if (!roomId) {
			return;
		}
		setRequestedRoomIds((previous) =>
			previous.includes(roomId) ? previous : [...previous, roomId],
		);
	};

	const visibleRooms = useMemo(() => {
		if (!Array.isArray(rooms) || rooms.length === 0) {
			return [];
		}
		if (requestedRoomIds.length === 0) {
			return rooms;
		}

		const requestedLookup = new Set(requestedRoomIds);
		return rooms
			.map((room, index) => ({ room, index }))
			.sort((a, b) => {
				const aRequested = requestedLookup.has(a.room.id);
				const bRequested = requestedLookup.has(b.room.id);
				if (aRequested === bRequested) {
					return a.index - b.index;
				}
				return aRequested ? 1 : -1;
			})
			.map((entry) => entry.room);
	}, [rooms, requestedRoomIds]);

	const handleSendRequest = async (roomId) => {
		// already in group
		if (userGroup) {
			setShowLeaveGroupModal(true);
			showToast("You are already in a group. Leave it first.", "info");
			return;
		}

		if (requestedRoomIds.includes(roomId)) {
			return;
		}

		setSendingRoomId(roomId);

		try {
			await backendFetch(`groupRequest/joinRequest/${roomId}`, {
				method: "POST",
			});

			//  JOIN REQUEST SENT
			showToast("Join request sent successfully", "success");
		} catch (error) {
			const message = error?.message || "Unable to send request";
			const lower = message.toLowerCase();

			// JOIN REQUEST ALREADY SENT
			if (lower.includes("already") && lower.includes("request")) {
				showToast("Join request already sent", "info");
			}

			//  USER ALREADY IN GROUP
			else if (
				lower.includes("already") &&
				(lower.includes("group") || lower.includes("member"))
			) {
				showToast("You are already in another group", "error");
			}

			// ✅ GROUP ALREADY EXISTS / FULL / BLOCKED CASE
			else if (lower.includes("exist")) {
				showToast("Cannot join this group", "error");
			} else {
				showToast(message, "error");
			}
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
							aria-label="Go back"
							className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] p-1.5 md:p-2 hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
					</div>

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
											setShowRoomSizeOptions(false);
											setShowBlockOptions(false);
										}}
										className="bg-[#F7A640] border border-black rounded-[4px] px-2.5 py-2 text-sm text-black flex items-center gap-1.5"
									>
										Filter Rooms
										<FiFilter aria-hidden="true" className="text-sm" />
									</button>

									{showFilterDropdown && isMobile ? (
										// Mobile full-screen filter panel
										<div className="fixed inset-0 z-50 flex items-end md:items-center">
											<div
												className="absolute inset-0 bg-black/40"
												onClick={() => setShowFilterDropdown(false)}
											/>
											<div className="relative w-full max-h-[90vh] overflow-y-auto bg-[#E8D0C2] border-2 border-black shadow-[4px_4px_0px_black] rounded-t-[10px] p-4">
												<div className="flex items-center justify-between mb-3">
													<p className="text-black text-lg font-semibold">
														Filter Rooms
													</p>
													<button
														type="button"
														onClick={() => setShowFilterDropdown(false)}
														className="px-3 py-1 bg-[#FB5E4C] border border-black rounded-[4px]"
													>
														Close
													</button>
												</div>
												<div className="mb-3">
													<p className="text-black text-base mb-2">Room Type</p>
													<div className="flex gap-3">
														<CustomButton
															type="button"
															onClick={() => toggleRoomType("ac")}
															color={
																selectedRoomTypes.ac ? "#2E73D4" : "#F2E6DE"
															}
															textColor={
																selectedRoomTypes.ac
																	? "text-white"
																	: "text-black"
															}
															className={`flex-1 border-black shadow-[2px_4px_0px_black] px-4 py-2 text-sm`}
														>
															AC
														</CustomButton>
														<CustomButton
															type="button"
															onClick={() => toggleRoomType("nac")}
															color={
																selectedRoomTypes.nac ? "#2E73D4" : "#F2E6DE"
															}
															textColor={
																selectedRoomTypes.nac
																	? "text-white"
																	: "text-black"
															}
															className={`flex-1 border-black shadow-[2px_4px_0px_black] px-4 py-2 text-sm`}
														>
															Non-AC
														</CustomButton>
													</div>
												</div>
												<div className="mb-3">
													<p className="text-black text-base mb-2">Room Size</p>
													<div>
														<div className="flex flex-wrap gap-2">
															<button
																type="button"
																onClick={() => setSelectedRoomSizes([])}
																className={`px-3 py-1 rounded-[4px] border border-black ${selectedRoomSizes.length > 0 ? "bg-[#F2E6DE]" : "bg-[#2E73D4] text-white"}`}
															>
																All
															</button>
															{allowedRoomSizes.map((size) => {
																const roomSizeValue = String(size);
																const isSelected =
																	selectedRoomSizes.includes(roomSizeValue);
																return (
																	<button
																		key={roomSizeValue}
																		type="button"
																		onClick={() =>
																			toggleRoomSize(roomSizeValue)
																		}
																		className={`px-3 py-1 rounded-[4px] border border-black ${isSelected ? "bg-[#2E73D4] text-white" : "bg-[#F2E6DE]"}`}
																	>
																		{roomSizeValue}
																	</button>
																);
															})}
														</div>
													</div>
												</div>
												<div className="mb-3">
													<p className="text-black text-base mb-2">
														Preferred Block
													</p>
													<div className="flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() => setSelectedBlocks([])}
															className={`px-3 py-1 rounded-[4px] border border-black ${selectedBlocks.length > 0 ? "bg-[#F2E6DE]" : "bg-[#2E73D4] text-white"}`}
														>
															All
														</button>
														{blockOptions.map((block) => {
															const isSelected = selectedBlocks.some(
																(value) =>
																	normalizeBlock(value) ===
																	normalizeBlock(block),
															);
															return (
																<button
																	key={block}
																	type="button"
																	onClick={() => toggleBlock(block)}
																	className={`px-3 py-1 rounded-[4px] border border-black ${isSelected ? "bg-[#2E73D4] text-white" : "bg-[#F2E6DE]"}`}
																>
																	{block}
																</button>
															);
														})}
													</div>
												</div>
												<div className="flex justify-between items-center gap-3 pt-1">
													<CustomButton
														type="button"
														onClick={() => {
															setSelectedRoomTypes({ ac: false, nac: false });
															setSelectedRoomSizes([]);
															setSelectedBlocks([]);
															setShowRoomSizeOptions(false);
															setShowBlockOptions(false);
														}}
														color="#F2E6DE"
														textColor="text-black"
														className="flex-1 rounded-[4px] shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs text-center"
													>
														Clear
													</CustomButton>
													<CustomButton
														type="button"
														onClick={() => {
															setAppliedRoomTypes({ ...selectedRoomTypes });
															setAppliedRoomSizes([...selectedRoomSizes]);
															setAppliedBlocks([...selectedBlocks]);
															setCurrentPage(1);
															setShowRoomSizeOptions(false);
															setShowBlockOptions(false);
															setShowFilterDropdown(false);
														}}
														color="#FB5E4C"
														textColor="text-black"
														className="flex-1 rounded-[4px] shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-3 py-1 text-xs text-center"
													>
														Apply Filters
													</CustomButton>
												</div>
											</div>
										</div>
									) : showFilterDropdown ? (
										<div className="fixed inset-0 z-50 flex items-center justify-center">
											<div
												className="absolute inset-0 bg-black/30"
												onClick={() => setShowFilterDropdown(false)}
											/>
											<div className="relative w-[min(760px,calc(100vw-2rem))] bg-[#E8D0C2] border-2 border-black rounded-[8px] p-6 z-60 grid grid-cols-2 gap-6">
												<div className="col-span-2 flex items-center justify-between">
													<p className="text-black text-lg font-semibold">
														Filter Rooms
													</p>
													<button
														type="button"
														onClick={() => setShowFilterDropdown(false)}
														className="px-3 py-1 bg-[#FB5E4C] border border-black rounded-[4px]"
													>
														Close
													</button>
												</div>

												<div>
													<p className="text-black text-base mb-2">Room Type</p>
													<div className="flex gap-2">
														<CustomButton
															type="button"
															onClick={() => toggleRoomType("ac")}
															color={
																selectedRoomTypes.ac ? "#2E73D4" : "#F2E6DE"
															}
															textColor={
																selectedRoomTypes.ac
																	? "text-white"
																	: "text-black"
															}
															className={`border-black shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs`}
														>
															AC
														</CustomButton>
														<CustomButton
															type="button"
															onClick={() => toggleRoomType("nac")}
															color={
																selectedRoomTypes.nac ? "#2E73D4" : "#F2E6DE"
															}
															textColor={
																selectedRoomTypes.nac
																	? "text-white"
																	: "text-black"
															}
															className={`border-black shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs`}
														>
															Non-AC
														</CustomButton>
													</div>
												</div>

												<div>
													<p className="text-black text-base mb-2">Room Size</p>
													<div className="flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() => setSelectedRoomSizes([])}
															className={`px-3 py-1 rounded-[4px] border border-black ${selectedRoomSizes.length > 0 ? "bg-[#F2E6DE]" : "bg-[#2E73D4] text-white"}`}
														>
															All
														</button>
														{allowedRoomSizes.map((size) => {
															const roomSizeValue = String(size);
															const isSelected =
																selectedRoomSizes.includes(roomSizeValue);
															return (
																<button
																	key={roomSizeValue}
																	type="button"
																	onClick={() => toggleRoomSize(roomSizeValue)}
																	className={`px-3 py-1 rounded-[4px] border border-black ${isSelected ? "bg-[#2E73D4] text-white" : "bg-[#F2E6DE]"}`}
																>
																	{roomSizeValue}
																</button>
															);
														})}
													</div>
												</div>

												<div className="col-span-2">
													<p className="text-black text-base mb-2">
														Preferred Block
													</p>
													<div className="flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() => setSelectedBlocks([])}
															className={`px-3 py-1 rounded-[4px] border border-black ${selectedBlocks.length > 0 ? "bg-[#F2E6DE]" : "bg-[#2E73D4] text-white"}`}
														>
															All
														</button>
														{blockOptions.map((block) => {
															const isSelected = selectedBlocks.some(
																(value) =>
																	normalizeBlock(value) ===
																	normalizeBlock(block),
															);
															return (
																<button
																	key={block}
																	type="button"
																	onClick={() => toggleBlock(block)}
																	className={`px-3 py-1 rounded-[4px] border border-black ${isSelected ? "bg-[#2E73D4] text-white" : "bg-[#F2E6DE]"}`}
																>
																	{block}
																</button>
															);
														})}
													</div>
												</div>

												<div className="col-span-2 flex justify-between items-center gap-3 pt-1">
													<CustomButton
														type="button"
														onClick={() => {
															setSelectedRoomTypes({ ac: false, nac: false });
															setSelectedRoomSizes([]);
															setSelectedBlocks([]);
														}}
														color="#F2E6DE"
														textColor="text-black"
														className="rounded-[4px] shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs text-center"
													>
														Clear
													</CustomButton>
													<CustomButton
														type="button"
														onClick={() => {
															setAppliedRoomTypes({ ...selectedRoomTypes });
															setAppliedRoomSizes([...selectedRoomSizes]);
															setAppliedBlocks([...selectedBlocks]);
															setCurrentPage(1);
															setShowFilterDropdown(false);
														}}
														color="#FB5E4C"
														textColor="text-black"
														className="rounded-[4px] shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-3 py-1 text-xs text-center"
													>
														Apply
													</CustomButton>
												</div>
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
											setShowRoomSizeOptions(false);
											setShowBlockOptions(false);
										}}
										className="bg-[#F7A640] border border-black rounded-[4px] px-2.5 py-2 text-sm text-black flex items-center gap-1.5"
									>
										Sort Rooms
										<FiSliders aria-hidden="true" className="text-sm" />
									</button>

									{showSortDropdown && isMobile ? (
										<div className="fixed inset-0 z-50 flex items-end md:items-center">
											<div
												className="absolute inset-0 bg-black/40"
												onClick={() => setShowSortDropdown(false)}
											/>
											<div className="relative w-full bg-[#E8D0C2] border-2 border-black shadow-[4px_4px_0px_black] rounded-t-[10px] p-4">
												<div className="flex items-center justify-between mb-3">
													<p className="text-black text-lg font-semibold">
														Sort Rooms
													</p>
													<button
														type="button"
														onClick={() => setShowSortDropdown(false)}
														className="px-3 py-1 bg-[#FB5E4C] border border-black rounded-[4px]"
													>
														Close
													</button>
												</div>
												<div className="grid grid-cols-1 gap-3">
													<CustomButton
														type="button"
														onClick={() => {
															setSortBy("vacancy");
															setShowSortDropdown(false);
														}}
														color={sortBy === "vacancy" ? "#2E73D4" : "#88E7C3"}
														textColor={
															sortBy === "vacancy" ? "text-white" : "text-black"
														}
														className={`w-full border-black shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs`}
													>
														Vacancy
													</CustomButton>
													<CustomButton
														type="button"
														onClick={() => {
															setSortBy("cgpa");
															setShowSortDropdown(false);
														}}
														color={sortBy === "cgpa" ? "#2E73D4" : "#88E7C3"}
														textColor={
															sortBy === "cgpa" ? "text-white" : "text-black"
														}
														className={`w-full border-black shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs`}
													>
														CGPA
													</CustomButton>
													<CustomButton
														type="button"
														onClick={() => {
															setSortBy("none");
															setShowSortDropdown(false);
														}}
														color="#F2E6DE"
														textColor="text-black"
														className="w-full text-center rounded-[4px] shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-3 py-1 text-xs"
													>
														Clear
													</CustomButton>
												</div>
											</div>
										</div>
									) : showSortDropdown ? (
										<div className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-w-[calc(100vw-2rem)] bg-[#E8D0C2] border-2 border-black shadow-[4px_4px_0px_black] rounded-[4px] p-5 z-40">
											<p className="text-black text-[22px] mb-4">Sort By</p>
											<div className="grid grid-cols-2 gap-3">
												<CustomButton
													type="button"
													onClick={() => {
														setSortBy("vacancy");
														setShowSortDropdown(false);
													}}
													color={sortBy === "vacancy" ? "#2E73D4" : "#88E7C3"}
													textColor={
														sortBy === "vacancy" ? "text-white" : "text-black"
													}
													className={`w-full text-center border-black shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs`}
												>
													Vacancy
												</CustomButton>
												<CustomButton
													type="button"
													onClick={() => {
														setSortBy("cgpa");
														setShowSortDropdown(false);
													}}
													color={sortBy === "cgpa" ? "#2E73D4" : "#88E7C3"}
													textColor={
														sortBy === "cgpa" ? "text-white" : "text-black"
													}
													className={`w-full text-center border-black shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-2 py-1 text-xs`}
												>
													CGPA
												</CustomButton>
											</div>
											<div className="flex justify-center mt-3">
												<CustomButton
													type="button"
													onClick={() => {
														setSortBy("none");
														setShowSortDropdown(false);
													}}
													color="#F2E6DE"
													textColor="text-black"
													className="text-center rounded-[4px] shadow-[1px_1.5px_0px_rgba(0,0,0,0.35)] px-3 py-1 text-xs"
												>
													Clear
												</CustomButton>
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
								visibleRooms.map((room) => {
									const isRequested = requestedRoomIds.includes(room.id);
									const availableBeds = getAvailableBeds(room);
									const groupLeaderName = room.adminName || "N/A";
									const groupLeaderRegNo = room.adminRegNo || "N/A";
									const adminStudent = Array.isArray(room.students)
										? room.students.find((student) => student.firebaseUID === room.adminUID)
										: null;
									const adminMetric = getRankOrCgpaDisplay(adminStudent, room.adminCGPA);

									return (
										<div
											key={room.id}
											className="w-full bg-[#CBA0FF] border border-black shadow-[3.5px_3.5px_0px_black] rounded-[2.5px] p-5 relative flex flex-col hover:scale-[1.01] transition-transform h-[380px] overflow-hidden"
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
													<span>Group Admin {adminMetric.label}</span>
													<span>{adminMetric.value}</span>
												</div>
											</div>

											{room.preferences ? (
												<div className="bg-[#E7D2FF] rounded-[5px] p-2.5 mb-4 mint-scrollbar max-h-[88px] overflow-y-auto pr-2">
													<p className="text-[#606060] text-[11px] font-medium leading-tight whitespace-pre-wrap">
														{room.preferences}
													</p>
												</div>
											) : null}

											<div className="mt-auto flex justify-center">
												<button
													onClick={() => handleSendRequest(room.id)}
													disabled={sendingRoomId === room.id || isRequested}
													className={`border border-black shadow-[1.6px_2.2px_0px_black] rounded-[2.7px] px-3 py-1.5 text-black text-[12.96px] font-normal transition-all disabled:opacity-70 disabled:cursor-not-allowed ${isRequested
															? "bg-[#F7A640]"
															: "bg-[#47D19D] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[1.6px] active:translate-y-[2.2px]"
														}`}
												>
													{sendingRoomId === room.id
														? "Sending..."
														: isRequested
															? "Request sent"
															: "Send Request to join"}
												</button>
											</div>
										</div>
									);
								})}
							{shouldShowCreateRoomTile ? (
								<div className="w-full bg-[#CBA0FF] border border-black shadow-[3.5px_3.5px_0px_black] rounded-[2.5px] p-5 relative flex flex-col hover:scale-[1.01] transition-transform h-[380px] overflow-hidden">
									<div className="mb-4">
										<h2 className="text-black text-2xl font-normal leading-tight">
											Did not find a room you like?
										</h2>
										<p className="mt-2 text-[#3E3E3E] text-base font-normal">
											Create your own room and invite others to join.
										</p>
									</div>

									<div className="mt-auto flex justify-center items-center">
										<button
											onClick={() =>
												router.push(
													"https://bunkbuddies.vinnovateit.com/create-room",
												)
											}
											className="border border-black shadow-[1.6px_2.2px_0px_black] rounded-[2.7px] px-3 py-1.5 text-black text-[12.96px] font-normal bg-[#47D19D] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[1.6px] active:translate-y-[2.2px]"
										>
											Create Room
										</button>
									</div>
								</div>
							) : null}
						</div>


						{!isLoading && totalCount > 0 ? (
							<div className="w-full px-2 pb-1 pt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
								<p className="text-sm text-[#2F2F2F]">
									Showing {visibleStartIndex}-{visibleEndIndex} of {totalCount}
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

										{Array.from(
											{ length: totalPages },
											(_, index) => index + 1,
										).map((pageNumber) => (
											<button
												key={pageNumber}
												type="button"
												onClick={() => setCurrentPage(pageNumber)}
												className={`border border-black rounded-[4px] px-2.5 py-1 text-sm ${currentPage === pageNumber
														? "bg-[#FB5E4C]"
														: "bg-[#F2E6DE]"
													}`}
											>
												{pageNumber}
											</button>
										))}

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

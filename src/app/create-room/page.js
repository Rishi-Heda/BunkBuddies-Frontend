"use client";

import React, { useEffect, useState } from "react";
import "./custom-scrollbar.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import {
	backendFetch,
	fromGroupSize,
	fromGroupType,
	toGroupSize,
	toGroupType,
} from "../utils/backendClient";

const syne = Syne({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

const GROUP_SIZE_OPTIONS = ["1", "2", "3", "4", "6", "8"];
const PREFERENCE_OPTIONS = ["A", "B", "B Annex", "C", "D", "D Annex", "E", "E Annex", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q",	"R", "S", "T"];
const MH_BLOCKS = [ "A", "B", "B Annex", "C", "D", "D Annex", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T"];
const LH_BLOCKS = ["A", "B", "C", "D", "E", "E Annex", "F", "G", "H", "J"];

function getPrefOptions(allOptions, exclude) {
	return allOptions.filter((opt) => !exclude.includes(opt));
}

function allowedBlocksForHostel(hostelType) {
	if (!hostelType) return PREFERENCE_OPTIONS;
	const t = String(hostelType).toUpperCase();
	if (t === "MH") return MH_BLOCKS;
	if (t === "LH") return LH_BLOCKS;
	return PREFERENCE_OPTIONS;
}

const INITIAL_FORM_DATA = {
	roomName: "",
	roomType: "AC",
	pref1: "",
	pref2: "",
	pref3: "",
	roomSize: "",
	otherPreferences: "",
};

export default function CreateRoomPage() {
	const router = useRouter();
	const [userHostelType, setUserHostelType] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [showValidationModal, setShowValidationModal] = useState(false);
	const [missingFields, setMissingFields] = useState([]);
	const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadStudentGroup = async () => {
			try {
				const response = await backendFetch("student/getStudent");
				const student = response?.user || {};
				setUserHostelType(student.hostelType || "");
				const group = student.group;

				const mappedProfile = {
					name: student.name || "",
					email: student.email || "",
					registerNumber: student.regNo || "",
					hostelType: student.hostelType || "",
					cgpa:
						student.CGPA !== undefined && student.CGPA !== null
							? String(student.CGPA)
							: "",
					contact: student.phone || "",
					description: student.description || "",
				};
				localStorage.setItem(
					"bunkBuddies_userProfile",
					JSON.stringify(mappedProfile),
				);

				if (group && isMounted) {
					// Check if user is the admin of the group
					const userIsAdmin = Boolean(
						student.firebaseUID &&
						group.adminUID &&
						student.firebaseUID === group.adminUID,
					);
					setIsAdmin(userIsAdmin);

					if (!userIsAdmin) {
						// Non-admin members cannot create a new room, show popup
						setShowLeaveGroupModal(true);
						return;
					}

					setIsEditing(true);
					setFormData({
						roomName: group.groupName || "",
						roomType: fromGroupType(group.type),
						pref1: group.block1 || "",
						pref2: group.block2 || "",
						pref3: group.block3 || "",
						roomSize: fromGroupSize(group.groupSize),
						otherPreferences: group.preferences || "",
					});
				}
			} catch (error) {
				const message = error?.message || "Unable to load room details";
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

		loadStudentGroup();

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMessage("");

		// Check mandatory fields and show popup if any are missing
		const missing = [];
		if (!formData.roomName.trim()) missing.push("Room Name");
		if (!formData.roomType) missing.push("Room Type");
		if (!formData.roomSize) missing.push("Room Size");
		if (!formData.pref1.trim()) missing.push("1st Preference");
		if (!formData.pref2.trim()) missing.push("2nd Preference");

		if (missing.length > 0) {
			setMissingFields(missing);
			setShowValidationModal(true);
			return;
		}

		setIsSubmitting(true);

		try {
			const payload = {
				groupName: formData.roomName.trim(),
				type: toGroupType(formData.roomType),
				groupSize: toGroupSize(formData.roomSize),
				block1: formData.pref1.trim(),
				block2: formData.pref2.trim(),
				block3: formData.pref3.trim(),
				preferences: formData.otherPreferences.trim() || undefined,
			};

			const response = await backendFetch(
				isEditing ? "group/updateGroup" : "group/createGroup",
				{
					method: isEditing ? "PUT" : "POST",
					body: payload,
				},
			);

			const group = response?.group || {};
			localStorage.setItem(
				"bunkBuddies_userGroup",
				JSON.stringify({
					id: group.id || "",
					roomName: group.groupName || payload.groupName,
					roomType: fromGroupType(group.type || payload.type),
					pref1: group.block1 || payload.block1,
					pref2: group.block2 || payload.block2,
					pref3: group.block3 || payload.block3,
					roomSize: fromGroupSize(group.groupSize || payload.groupSize),
					otherPreferences: group.preferences || payload.preferences || "",
				}),
			);

			alert(
				isEditing ? "Room updated successfully!" : "Room created successfully!",
			);
			router.push("/my-groups");
		} catch (error) {
			const message = error?.message || "Failed to save room";
			if (message.toLowerCase().includes("authorized")) {
				router.push("/signin?error=Please login first");
				return;
			}
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
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
							width={120}
							height={40}
							className="w-auto h-8 md:h-12"
							priority
						/>
					</button>
					<Navbar wrapperClass="static flex items-center h-8 md:h-12" />
				</div>

				<form
					onSubmit={handleSubmit}
					className="w-full max-w-[1045px] bg-[#FFB0AF] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0"
				>
					<div className="flex flex-row justify-between items-center mb-6 md:mb-5 gap-3">
						<h1 className="text-xl md:text-2xl font-semibold leading-tight pt-2 md:pt-0">
							{isEditing ? "Edit Room" : "Create Room"}
						</h1>
						<button
							type="button"
							onClick={() => router.back()}
							className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1.5 text-[14px] sm:text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none transition-all whitespace-nowrap"
						>
							← Go Back
						</button>
					</div>

					{errorMessage ? (
						<p className="mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
							{errorMessage}
						</p>
					) : null}

					<div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mb-3">
						<div className="flex flex-col gap-1">
							<label className="text-sm md:text-base font-bold">
								Room Name <span className="text-red-600">*</span>
							</label>
							<input
								type="text"
								name="roomName"
								value={formData.roomName}
								onChange={handleChange}
								placeholder="Room Name"
								disabled={isLoading || isSubmitting}
								className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm md:text-base font-bold">
								Room Type <span className="text-red-600">*</span>
							</label>
							<select
								name="roomType"
								value={formData.roomType}
								onChange={handleChange}
								disabled={isLoading || isSubmitting}
								className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer custom-scrollbar"
							>
								<option value="AC">AC</option>
								<option value="Non-AC">Non-AC</option>
							</select>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm md:text-base font-bold">
								Room Size <span className="text-red-600">*</span>
							</label>
							<select
								name="roomSize"
								value={formData.roomSize}
								onChange={handleChange}
								disabled={isLoading || isSubmitting}
								className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer custom-scrollbar"
							>
								<option value="">Select size</option>
								{GROUP_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm md:text-base font-bold">
								1st Preference <span className="text-red-600">*</span>
							</label>
							<select
								name="pref1"
								value={formData.pref1}
								onChange={handleChange}
								disabled={isLoading || isSubmitting}
								className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer custom-scrollbar"
							>
								<option value="">Select block</option>
								{getPrefOptions(allowedBlocksForHostel(userHostelType), []).map(
									(option) => (
										<option key={option} value={option}>
											{option}
										</option>
									),
								)}
							</select>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm md:text-base font-bold">
								2nd Preference <span className="text-red-600">*</span>
							</label>
							<select
								name="pref2"
								value={formData.pref2}
								onChange={handleChange}
								disabled={isLoading || isSubmitting}
								className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer custom-scrollbar"
							>
								<option value="">Select block</option>
								{getPrefOptions(allowedBlocksForHostel(userHostelType), [
									formData.pref1,
								]).map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm md:text-base font-bold">
								3rd Preference
							</label>
							<select
								name="pref3"
								value={formData.pref3}
								onChange={handleChange}
								disabled={isLoading || isSubmitting}
								className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer"
							>
								<option value="">Select block</option>
								{getPrefOptions(allowedBlocksForHostel(userHostelType), [
									formData.pref1,
									formData.pref2,
								]).map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex flex-col gap-1 mb-5">
						<label className="text-sm md:text-base font-bold">
							Other Preferences (200 Words)
						</label>
						<textarea
							name="otherPreferences"
							value={formData.otherPreferences}
							onChange={handleChange}
							placeholder="Tell us about your preferences..."
							disabled={isLoading || isSubmitting}
							className="w-full h-20 bg-[#F7CC66] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40 custom-scrollbar"
						/>
					</div>

					<div className="flex justify-center mt-2">
						<button
							type="submit"
							disabled={isLoading || isSubmitting}
							className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_3px_0px_black] md:shadow-[3px_4px_0px_black] px-8 py-2 md:py-2.5 text-[16px] md:text-lg font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{isSubmitting
								? "Saving..."
								: isEditing
									? "Update Room"
									: "Create Room"}
						</button>
					</div>
				</form>

				{/* Validation Modal */}
				{showValidationModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
						<div className="bg-[#FFB0AF] border-2 border-black shadow-[5px_5px_0px_black] rounded-[8px] p-6 max-w-md w-[90%] mx-4">
							<h2 className="text-xl font-bold mb-4 text-center">
								Please Fill Required Fields
							</h2>
							<p className="text-sm mb-3">
								The following fields are mandatory:
							</p>
							<ul className="list-disc list-inside mb-5 bg-[#F7CC66] border border-black rounded-[4px] p-3">
								{missingFields.map((field, index) => (
									<li key={index} className="text-sm font-medium">
										{field}
									</li>
								))}
							</ul>
							<div className="flex justify-center">
								<button
									type="button"
									onClick={() => setShowValidationModal(false)}
									className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_3px_0px_black] px-6 py-2 text-base font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
								>
									OK, Got It
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Leave Group Modal */}
				{showLeaveGroupModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
						<div className="bg-[#FFB0AF] border-2 border-black shadow-[5px_5px_0px_black] rounded-[8px] p-6 max-w-md w-[90%] mx-4">
							<h2 className="text-xl font-bold mb-4 text-center">
								Already in a Group
							</h2>
							<p className="text-sm mb-5 text-center">
								You are already a member of a group. Please leave your current
								group first before creating a new room.
							</p>
							<div className="flex justify-center gap-3">
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

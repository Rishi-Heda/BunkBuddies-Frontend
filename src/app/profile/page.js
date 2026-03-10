"use client";
import { showToast } from "../components/Toast";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch } from "../utils/backendClient";
import { isQuizCompleted } from "../utils/quizStatus";

const INITIAL_FORM_DATA = {
	name: "",
	email: "",
	registerNumber: "",
	hostelType: "",
	hostelGroup: "",
	rank: "",
	contact: "",
	description: "",
};

function sanitizeContactInput(value) {
	const digits = String(value || "").replace(/\D/g, "");
	if (digits.startsWith("91") && digits.length >= 12) {
		return digits.slice(2, 12);
	}
	return digits.slice(0, 10);
}

function normalizeIndianMobileNumber(value) {
	const digits = String(value || "").replace(/\D/g, "");
	const withoutCountryCode =
		digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

	if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) {
		throw new Error(
			"Contact number must be a valid 10-digit Indian mobile number",
		);
	}

	return `+91${withoutCountryCode}`;
}

export default function ProfilePage() {
	const router = useRouter();
	const [isAnimating, setIsAnimating] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [showValidationModal, setShowValidationModal] = useState(false);
	const [missingFields, setMissingFields] = useState([]);
	const [showInfoModal, setShowInfoModal] = useState(false);
	const isLhHostel = String(formData.hostelType || "").trim().toUpperCase() === "LH";
	const maxHostelGroup = isLhHostel ? 4 : 3;
	const hostelGroupOptions = isLhHostel ? ["1", "2", "3", "4"] : ["1", "2", "3"];

	useEffect(() => {
		setIsAnimating(true);
		let isMounted = true;

		const loadProfile = async () => {
			try {
				const response = await backendFetch("student/getStudent");
				const user = response?.user || {};
				if (!isQuizCompleted(user)) {
					router.push("/personality-quiz");
					return;
				}

				if (!isMounted) {
					return;
				}

				const mappedData = {
					name: user.name || "",
					email: user.email || "",
					registerNumber: user.regNo || "",
					hostelType: user.hostelType || "",
					hostelGroup:
						user.hostelGroup !== undefined && user.hostelGroup !== null
							? String(user.hostelGroup)
							: "",
					rank:
						user.rank !== undefined && user.rank !== null
							? String(user.rank)
							: "",
					contact: sanitizeContactInput(user.phone || ""),
					description: user.description || "",
				};

				const hasContact = user.phone && user.phone.trim() !== "";
				const hasHostelType = user.hostelType && user.hostelType.trim() !== "";
				const hasHostelGroup =
					user.hostelGroup !== undefined && user.hostelGroup !== null;
				const hasRank = user.rank !== undefined && user.rank !== null;
				if (hasContact && hasHostelType && hasHostelGroup && hasRank) {
					setIsEditing(true);
				}

				setFormData(mappedData);
				localStorage.setItem(
					"bunkBuddies_userProfile",
					JSON.stringify(mappedData),
				);
			} catch (error) {
				const message = error?.message || "Unable to load profile";
				if (message.toLowerCase().includes("authorized")) {
					router.push("/signin?error=Please login first");
					return;
				}
				setErrorMessage(message);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadProfile();

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		let nextValue = value;
		if (name === "contact") {
			nextValue = sanitizeContactInput(value);
		} else if (name === "rank") {
			nextValue = String(value || "").replace(/\D/g, "").slice(0, 6);
		}
		setFormData((previous) => ({
			...previous,
			[name]: nextValue,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMessage("");

		const missing = [];
		if (!formData.hostelType) missing.push("Hostel Type");
		if (!formData.hostelGroup) missing.push("Hostel Group");
		if (!formData.rank.trim()) missing.push("Hostel Rank");
		if (!formData.contact.trim()) missing.push("Contact Details");

		if (missing.length > 0) {
			setMissingFields(missing);
			setShowValidationModal(true);
			return;
		}

		setIsSaving(true);

		try {
			const payload = {};
			const trimmedContact = formData.contact.trim();
			const trimmedDescription = formData.description.trim();
			if (trimmedContact) {
				try {
					payload.phone = normalizeIndianMobileNumber(trimmedContact);
				} catch (e) {
					showToast("Invalid Mobile Number", "error");
					setIsSaving(false);
					return;
				}
			}
			if (trimmedDescription) {
				payload.description = trimmedDescription;
			}
			if (formData.hostelType) {
				payload.hostelType = formData.hostelType;
			}
			const parsedHostelGroup = Number(formData.hostelGroup);
			if (!Number.isInteger(parsedHostelGroup) || parsedHostelGroup < 1 || parsedHostelGroup > maxHostelGroup) {
				showToast(`Hostel Group must be between 1 and ${maxHostelGroup}`, "error");
				setIsSaving(false);
				return;
			}
			payload.hostelGroup = parsedHostelGroup;

			const parsedRank = Number(formData.rank);
			if (!Number.isInteger(parsedRank) || parsedRank <= 0) {
				showToast("Hostel Rank must be a positive integer", "error");
				setIsSaving(false);
				return;
			}
			payload.rank = parsedRank;

			const response = await backendFetch("student/updateStudent", {
				method: "PUT",
				body: payload,
			});

			const updatedUser = response?.user || {};
			const localProfile = {
				name: updatedUser.name || formData.name,
				email: updatedUser.email || formData.email,
				registerNumber: updatedUser.regNo || formData.registerNumber,
				hostelType: updatedUser.hostelType || formData.hostelType,
				hostelGroup:
					updatedUser.hostelGroup !== undefined && updatedUser.hostelGroup !== null
						? String(updatedUser.hostelGroup)
						: formData.hostelGroup,
				rank:
					updatedUser.rank !== undefined && updatedUser.rank !== null
						? String(updatedUser.rank)
						: formData.rank,
				contact: sanitizeContactInput(updatedUser.phone || formData.contact),
				description: updatedUser.description || formData.description,
			};

			localStorage.setItem(
				"bunkBuddies_userProfile",
				JSON.stringify(localProfile),
			);
			router.push("/find-buddies?profileUpdated=1");
		} catch (error) {
			const message = error?.message || "Failed to update profile";
			if (message.toLowerCase().includes("authorized")) {
				router.push("/signin?error=Please login first");
				return;
			}
			setErrorMessage(message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<BackgroundGrid>
			<div className="min-h-screen md:h-screen relative overflow-y-auto md:overflow-hidden font-[family-name:var(--font-syne)] p-4 md:p-6 flex flex-col items-center justify-start md:justify-center">
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

				<div className="w-full max-w-[945px] lg:max-w-[1045px] transition-all duration-300 mt-[101px] md:mt-[69px] mb-8 md:mb-0">
					<form
						onSubmit={handleSubmit}
						className={`w-full bg-[#BE8EF8] rounded-md border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] p-3 sm:p-4 md:p-5 relative overflow-hidden transition-all duration-700 ease-out ${isAnimating
								? "translate-y-0 opacity-100"
								: "translate-y-full opacity-0"
							}`}
					>
						<div className="flex justify-between items-center mb-4">
							<div className="flex items-center gap-2">
								<h1 className="text-2xl md:text-3xl font-semibold">
									{isEditing ? "Edit Profile" : "Create Profile"}
								</h1>
								<button
									type="button"
									onClick={() => setShowInfoModal(true)}
									aria-label="Profile info"
									className="text-black/50 hover:text-black/80 transition-colors"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<circle cx="12" cy="12" r="10"/>
										<line x1="12" y1="8" x2="12" y2="8"/>
										<line x1="12" y1="12" x2="12" y2="16"/>
									</svg>
								</button>
							</div>
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

						{errorMessage ? (
							<p className="mb-3 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
								{errorMessage}
							</p>
						) : null}

						<div className="grid grid-cols-1 md:grid-cols-4 gap-x-3 gap-y-3 mb-4">
							{/* Row 1 */}
							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">Name</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									readOnly
									placeholder="Aditya Madan"
									disabled={isLoading}
									className="w-full h-8 bg-[#47D19D]/80 rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none placeholder:text-black/40 cursor-not-allowed"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">Email ID</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									readOnly
									disabled={isLoading}
									placeholder="name@vitstudent.ac.in"
									className="w-full h-8 bg-[#47D19D]/80 rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none placeholder:text-black/40 cursor-not-allowed"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">Register Number</label>
								<input
									type="text"
									name="registerNumber"
									value={formData.registerNumber}
									readOnly
									disabled={isLoading}
									placeholder="24BCExxx"
									className="w-full h-8 bg-[#47D19D]/80 rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none placeholder:text-black/40 cursor-not-allowed"
								/>
							</div>

							{/* Row 2 */}
							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">
									Hostel Type <span className="text-red-600">*</span>
								</label>
								<input
									type="text"
									name="hostelType"
									value={formData.hostelType || ""}
									readOnly
									disabled={isLoading}
									placeholder="Set in personality quiz"
									className="w-full h-8 bg-[#47D19D]/80 rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none placeholder:text-black/40 cursor-not-allowed"
								/>

							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">
									Hostel Group <span className="text-red-600">*</span>
								</label>
								<select
									name="hostelGroup"
									value={formData.hostelGroup}
									onChange={handleChange}
									disabled={isLoading}
									className="w-full h-8 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none"
								>
									<option value="">Select group</option>
									{hostelGroupOptions.map((group) => (
										<option key={group} value={group}>
											{group}
										</option>
									))}
								</select>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">
									Hostel Rank <span className="text-red-600">*</span>
								</label>
								<input
									type="text"
									name="rank"
									value={formData.rank}
									onChange={handleChange}
									placeholder="Enter rank"
									disabled={isLoading}
									inputMode="numeric"
									className="w-full h-8 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none placeholder:text-black/40"
								/>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-sm md:text-base font-bold">
									Contact Details <span className="text-red-600">*</span>
								</label>
								<input
									type="text"
									name="contact"
									value={formData.contact}
									onChange={handleChange}
									placeholder="9876543210"
									disabled={isLoading}
									inputMode="numeric"
									maxLength={10}
									className="w-full h-8 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm font-normal text-black focus:outline-none placeholder:text-black/40"
								/>
							</div>
						</div>

						<p className="mb-3 text-xs md:text-sm text-black/80">
							Name, Email ID, Register Number and Hostel Type are auto-filled from your Google login and cannot be edited.
						</p>

						<div className="flex flex-col gap-1 mb-5">
							<label className="text-sm md:text-base font-bold">
								A Brief Description (200 Words)
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Tell us about yourself..."
								disabled={isLoading}
								className="w-full h-36 bg-[#47D19D] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
							/>
						</div>

						<div className="flex justify-center">
							<button
								type="submit"
								disabled={isLoading || isSaving}
								className="bg-[#FB5E4C] border border-black rounded-[4px] shadow-[3px_4px_0px_black] px-8 py-2 text-lg font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[4px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isSaving ? "Saving..." : "Submit"}
							</button>
						</div>
					</form>

					{/* Validation Modal */}
					{showValidationModal && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
							<div className="bg-[#BE8EF8] border-2 border-black shadow-[5px_5px_0px_black] rounded-[8px] p-6 max-w-md w-[90%] mx-4">
								<h2 className="text-xl font-bold mb-4 text-center">
									Please Fill Required Fields
								</h2>
								<p className="text-sm mb-3">
									The following fields are mandatory:
								</p>
								<ul className="list-disc list-inside mb-5 bg-[#47D19D] border border-black rounded-[4px] p-3">
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
										className="bg-[#FB5E4C] border border-black rounded-[4px] shadow-[3px_3px_0px_black] px-6 py-2 text-base font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
									>
										OK, Got It
									</button>
								</div>
							</div>
						</div>
					)}
					{showInfoModal && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
							<div className="bg-[#BE8EF8] border-2 border-black shadow-[5px_5px_0px_black] rounded-[8px] p-6 max-w-md w-[90%] mx-4">
								<h2 className="text-xl font-bold mb-3">Profile Information</h2>
								<p className="text-sm mb-2 text-black/80">
									<span className="font-semibold">Hostel Type</span> is auto-assigned from your personality quiz and cannot be changed here.
								</p>
								<p className="text-sm mb-4 text-black/80">
									If you notice any discrepancies in your Hostel Type or any other profile details, please reach out to us at:
								</p>
								<a href="mailto:bunkbuddiesbyvinnovateit@gmail.com"
									className="block bg-[#47D19D] border border-black rounded-[4px] px-3 py-2 text-sm font-semibold text-center break-all hover:opacity-90 transition-opacity"
								>
									bunkbuddiesbyvinnovateit@gmail.com
								</a>
								<div className="flex justify-center mt-5">
									<button
										type="button"
										onClick={() => setShowInfoModal(false)}
										className="bg-[#FB5E4C] border border-black rounded-[4px] shadow-[3px_3px_0px_black] px-6 py-2 text-base font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
									>
										Got It
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</BackgroundGrid>
	);
}
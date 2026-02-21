"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackgroundGrid from "../components/BackgroundLines";
import { backendFetch } from "../utils/backendClient";

const INITIAL_FORM_DATA = {
    name: "",
    email: "",
    registerNumber: "",
    hostelType: "",
    cgpa: "",
    contact: "",
    description: "",
};

export default function ProfilePage() {
    const router = useRouter();
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    useEffect(() => {
        setIsAnimating(true);
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const response = await backendFetch("student/getStudent");
                const user = response?.user || {};

                if (!isMounted) {
                    return;
                }

                const mappedData = {
                    name: user.name || "",
                    email: user.email || "",
                    registerNumber: user.regNo || "",
                    hostelType: user.hostelType || "",
                    cgpa: user.CGPA !== undefined && user.CGPA !== null ? String(user.CGPA) : "",
                    contact: user.phone || "",
                    description: user.description || "",
                };

                setFormData(mappedData);
                localStorage.setItem("bunkBuddies_userProfile", JSON.stringify(mappedData));
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
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSaving(true);

        try {
            const payload = {};
            const trimmedName = formData.name.trim();
            const trimmedContact = formData.contact.trim();
            const trimmedDescription = formData.description.trim();

            if (trimmedName) {
                payload.name = trimmedName;
            }
            if (trimmedContact) {
                payload.phone = trimmedContact;
            }
            if (trimmedDescription) {
                payload.description = trimmedDescription;
            }
            if (formData.hostelType) {
                payload.hostelType = formData.hostelType;
            }
            if (formData.cgpa !== "") {
                const parsedCgpa = Number(formData.cgpa);
                if (!Number.isFinite(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
                    throw new Error("CGPA must be a number between 0 and 10");
                }
                payload.CGPA = parsedCgpa;
            }

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
                cgpa: updatedUser.CGPA !== undefined && updatedUser.CGPA !== null
                    ? String(updatedUser.CGPA)
                    : formData.cgpa,
                contact: updatedUser.phone || formData.contact,
                description: updatedUser.description || formData.description,
            };

            localStorage.setItem("bunkBuddies_userProfile", JSON.stringify(localProfile));
            alert("Profile updated successfully!");
            router.push("/find-buddies");
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
                <div className="absolute top-3 left-3 md:top-5 md:left-6">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={160}
                        height={60}
                        className="w-auto h-12 md:h-16"
                        priority
                    />
                </div>

                <div className="w-full max-w-[860px] lg:max-w-[950px] transition-all duration-300 mt-16 md:mt-0 mb-8 md:mb-0">
                    <form
                        onSubmit={handleSubmit}
                        className={`w-full bg-[#BE8EF8] rounded-md border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] p-4 sm:p-6 md:p-8 relative overflow-hidden transition-all duration-700 ease-out ${
                            isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                        }`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl md:text-3xl font-semibold">Create Profile</h1>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1 md:py-1.5 text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all"
                            >
                                {"<- Go Back"}
                            </button>
                        </div>

                        {errorMessage ? (
                            <p className="mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
                                {errorMessage}
                            </p>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm md:text-base font-bold">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Aditya Madan"
                                    disabled={isLoading}
                                    className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                    className="w-full h-9 bg-[#47D19D]/80 rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40 cursor-not-allowed"
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
                                    className="w-full h-9 bg-[#47D19D]/80 rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40 cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm md:text-base font-bold">Hostel Type</label>
                                <select
                                    name="hostelType"
                                    value={formData.hostelType}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none"
                                >
                                    <option value="">Select hostel</option>
                                    <option value="MH">MH</option>
                                    <option value="LH">LH</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm md:text-base font-bold">CGPA</label>
                                <input
                                    type="text"
                                    name="cgpa"
                                    value={formData.cgpa}
                                    onChange={handleChange}
                                    placeholder="9.99"
                                    disabled={isLoading}
                                    className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm md:text-base font-bold">Contact Details</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    placeholder="+91 XXXXX XXXXX"
                                    disabled={isLoading}
                                    className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mb-8">
                            <label className="text-sm md:text-base font-bold">A Brief Description (200 Words)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                disabled={isLoading}
                                className="w-full h-24 bg-[#47D19D] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
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
                </div>
            </div>
        </BackgroundGrid>
    );
}

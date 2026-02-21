"use client";

import React, { useEffect, useState } from "react";
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
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    useEffect(() => {
        let isMounted = true;

        const loadStudentGroup = async () => {
            try {
                const response = await backendFetch("student/getStudent");
                const student = response?.user || {};
                const group = student.group;

                const mappedProfile = {
                    name: student.name || "",
                    email: student.email || "",
                    registerNumber: student.regNo || "",
                    hostelType: student.hostelType || "",
                    cgpa: student.CGPA !== undefined && student.CGPA !== null ? String(student.CGPA) : "",
                    contact: student.phone || "",
                    description: student.description || "",
                };
                localStorage.setItem("bunkBuddies_userProfile", JSON.stringify(mappedProfile));

                if (group && isMounted) {
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

            if (!payload.groupName || !payload.groupSize || !payload.block1 || !payload.block2 || !payload.block3) {
                throw new Error("Please fill all required fields");
            }

            const response = await backendFetch(
                isEditing ? "group/updateGroup" : "group/createGroup",
                {
                    method: isEditing ? "PUT" : "POST",
                    body: payload,
                },
            );

            const group = response?.group || {};
            localStorage.setItem("bunkBuddies_userGroup", JSON.stringify({
                id: group.id || "",
                roomName: group.groupName || payload.groupName,
                roomType: fromGroupType(group.type || payload.type),
                pref1: group.block1 || payload.block1,
                pref2: group.block2 || payload.block2,
                pref3: group.block3 || payload.block3,
                roomSize: fromGroupSize(group.groupSize || payload.groupSize),
                otherPreferences: group.preferences || payload.preferences || "",
            }));

            alert(isEditing ? "Room updated successfully!" : "Room created successfully!");
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
            <div className={`${syne.className} min-h-screen relative p-4 flex flex-col items-center justify-center pt-20 md:pt-20 pb-10 md:pb-2`}>
                <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={160}
                        height={60}
                        className="w-auto h-12 md:h-16"
                        priority
                    />
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
                            {"<- Go Back"}
                        </button>
                    </div>

                    {errorMessage ? (
                        <p className="mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
                            {errorMessage}
                        </p>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mb-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Name</label>
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
                            <label className="text-sm md:text-base font-bold">Room Type</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleChange}
                                disabled={isLoading || isSubmitting}
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="AC">AC</option>
                                <option value="Non-AC">Non-AC</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Size</label>
                            <select
                                name="roomSize"
                                value={formData.roomSize}
                                onChange={handleChange}
                                disabled={isLoading || isSubmitting}
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select size</option>
                                {GROUP_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">1st Preference</label>
                            <input
                                type="text"
                                name="pref1"
                                value={formData.pref1}
                                onChange={handleChange}
                                placeholder="A Block"
                                disabled={isLoading || isSubmitting}
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">2nd Preference</label>
                            <input
                                type="text"
                                name="pref2"
                                value={formData.pref2}
                                onChange={handleChange}
                                placeholder="B Block"
                                disabled={isLoading || isSubmitting}
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">3rd Preference</label>
                            <input
                                type="text"
                                name="pref3"
                                value={formData.pref3}
                                onChange={handleChange}
                                placeholder="C Block"
                                disabled={isLoading || isSubmitting}
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-5">
                        <label className="text-sm md:text-base font-bold">Other Preferences (200 Words)</label>
                        <textarea
                            name="otherPreferences"
                            value={formData.otherPreferences}
                            onChange={handleChange}
                            placeholder="Tell us about your preferences..."
                            disabled={isLoading || isSubmitting}
                            className="w-full h-20 bg-[#F7CC66] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
                        />
                    </div>

                    <div className="flex justify-center mt-2">
                        <button
                            type="submit"
                            disabled={isLoading || isSubmitting}
                            className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_3px_0px_black] md:shadow-[3px_4px_0px_black] px-8 py-2 md:py-2.5 text-[16px] md:text-lg font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : (isEditing ? "Update Room" : "Create Room")}
                        </button>
                    </div>
                </form>
            </div>
        </BackgroundGrid>
    );
}

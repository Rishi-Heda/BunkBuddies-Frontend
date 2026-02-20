"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        registerNumber: '',
        hostelType: '',
        cgpa: '',
        contact: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Profile Submitted:', formData);
        alert('Profile Created Successfully!\n' + JSON.stringify(formData, null, 2));
        router.push('/create-room');
    };

    return (
        <div className="h-screen bg-[#FEE3D2] relative overflow-hidden font-[family-name:var(--font-syne)] p-2 md:p-4 lg:p-6 flex flex-col items-center justify-center">
            {/* Header Decoration */}
            <div className="absolute top-4 left-4 flex items-start gap-2 scale-75 md:scale-90 origin-top-left">
                <div className="flex gap-1">
                    <div className="w-[30px] h-[26px] bg-black" />
                    <div className="w-[60px] h-[26px] bg-black" />
                </div>
                <div className="relative w-[6px] h-[26px]">
                    <div className="absolute top-[2px] w-[5px] h-[2px] bg-black rounded-full" />
                    <div className="absolute top-[14px] w-[5px] h-[2px] bg-black rounded-full" />
                </div>
            </div>

            {/* Main Card Container - Exact match with Create Room Page */}
            <div className="w-full max-w-[860px] lg:max-w-[950px] transition-all duration-300">
                <form
                    onSubmit={handleSubmit}
                    className="w-full bg-[#BE8EF8] rounded-md border border-black shadow-[5px_5px_0px_black] p-4 sm:p-6 md:p-8 relative overflow-hidden"
                >
                    <h1 className="text-2xl md:text-3xl font-semibold mb-4 lg:mb-6">Create Profile</h1>

                    {/* Grid: 3 cols to match Create Room Page */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 lg:gap-x-6 lg:gap-y-4 mb-4 lg:mb-6">
                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Aditya Madan"
                                className="w-full h-8 md:h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Email ID */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Email ID</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="adityamadan01@gmail.com"
                                className="w-full h-8 md:h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Register Number */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Register Number</label>
                            <input
                                type="text"
                                name="registerNumber"
                                value={formData.registerNumber}
                                onChange={handleChange}
                                placeholder="24BCExxx"
                                className="w-full h-8 md:h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Hostel Type */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Hostel Type</label>
                            <input
                                type="text"
                                name="hostelType"
                                value={formData.hostelType}
                                onChange={handleChange}
                                placeholder="MH"
                                className="w-full h-8 md:h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* CGPA */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">CGPA</label>
                            <input
                                type="text"
                                name="cgpa"
                                value={formData.cgpa}
                                onChange={handleChange}
                                placeholder="9.99"
                                className="w-full h-8 md:h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Contact Details */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Contact Details</label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                placeholder="+91 XXXXX XXXXX"
                                className="w-full h-8 md:h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1 mb-6 lg:mb-8">
                        <label className="text-sm md:text-base font-bold">A Brief Description ( 200 Words )</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            className="w-full h-16 md:h-20 lg:h-24 bg-[#47D19D] rounded-[4px] border border-black p-3 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-[#FB5E4C] border border-black rounded-[4px] shadow-[3px_4px_0px_black] px-6 py-1.5 md:py-2 text-lg font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[2.5px_3.5px_0px_black] transition-all active:translate-x-[3px] active:translate-y-[4px] active:shadow-none cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

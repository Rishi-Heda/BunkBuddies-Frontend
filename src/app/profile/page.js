"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
        <div className="min-h-screen md:h-screen bg-[#FEE3D2] relative overflow-y-auto md:overflow-hidden font-[family-name:var(--font-syne)] p-4 md:p-6 flex flex-col items-center justify-start md:justify-center">
            {/* Logo in Top Left - Responsive positioning */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={100}
                    height={30}
                    className="w-auto h-6 md:h-10 lg:h-12"
                    priority
                />
            </div>

            {/* Main Card Container - Single column on mobile, 3 columns on laptop */}
            <div className="w-full max-w-[860px] lg:max-w-[950px] transition-all duration-300 mt-16 md:mt-0 mb-8 md:mb-0">
                <form
                    onSubmit={handleSubmit}
                    className="w-full bg-[#BE8EF8] rounded-md border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] p-4 sm:p-6 md:p-8 relative overflow-hidden"
                >
                    <h1 className="text-2xl md:text-3xl font-semibold mb-6">Create Profile</h1>

                    {/* Grid: 1 col on mobile, 3 cols on tablet+ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6">
                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Aditya Madan"
                                className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-9 bg-[#47D19D] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1 mb-8">
                        <label className="text-sm md:text-base font-bold">A Brief Description ( 200 Words )</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            className="w-full h-24 bg-[#47D19D] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-[#FB5E4C] border border-black rounded-[4px] shadow-[3px_4px_0px_black] px-8 py-2 text-lg font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[4px] active:shadow-none cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

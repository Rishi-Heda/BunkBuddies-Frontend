"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export default function CreateRoomPage() {
    const [formData, setFormData] = useState({
        roomName: '',
        roomType: 'AC',
        pref1: '',
        pref2: '',
        pref3: '',
        roomSize: '',
        otherPreferences: ''
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
        console.log('Form Submitted:', formData);
        alert('Room Created Successfully!\n' + JSON.stringify(formData, null, 2));
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
                    className="w-full bg-[#FFB0AF] rounded-md border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] p-4 sm:p-6 md:p-8 relative overflow-hidden"
                >
                    <h1 className="text-2xl md:text-3xl font-semibold mb-6">Create Room</h1>

                    {/* Grid: 1 col on mobile, 3 cols on tablet+ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6">
                        {/* Room Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Name</label>
                            <input
                                type="text"
                                name="roomName"
                                value={formData.roomName}
                                onChange={handleChange}
                                placeholder="Aditya Madan"
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Room Type */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Type</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleChange}
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="AC">AC</option>
                                <option value="Non-AC">Non-AC</option>
                            </select>
                        </div>

                        {/* Room Size */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Size</label>
                            <input
                                type="text"
                                name="roomSize"
                                value={formData.roomSize}
                                onChange={handleChange}
                                placeholder="4"
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Block Preferences */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">1st Preference</label>
                            <input
                                type="text"
                                name="pref1"
                                value={formData.pref1}
                                onChange={handleChange}
                                placeholder="AC"
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
                                placeholder="AC"
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
                                placeholder="AC"
                                className="w-full h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>
                    </div>

                    {/* Other Preferences */}
                    <div className="flex flex-col gap-1 mb-8">
                        <label className="text-sm md:text-base font-bold">Other Preferences ( 200 Words )</label>
                        <textarea
                            name="otherPreferences"
                            value={formData.otherPreferences}
                            onChange={handleChange}
                            placeholder="Tell us about your preferences..."
                            className="w-full h-24 bg-[#F7CC66] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_4px_0px_black] px-8 py-2 text-lg font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[4px] active:shadow-none cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';

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

            {/* Main Card Container - Exact match with Profile Page */}
            <div className="w-full max-w-[860px] lg:max-w-[950px] transition-all duration-300">
                <form
                    onSubmit={handleSubmit}
                    className="w-full bg-[#FFB0AF] rounded-md border border-black shadow-[5px_5px_0px_black] p-4 sm:p-6 md:p-8 relative overflow-hidden"
                >
                    <h1 className="text-2xl md:text-3xl font-semibold mb-4 lg:mb-6">Create Room</h1>

                    {/* Uniform Grid: 3 cols to match Profile Page */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 lg:gap-x-6 lg:gap-y-4 mb-4 lg:mb-6">
                        {/* Room Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Name</label>
                            <input
                                type="text"
                                name="roomName"
                                value={formData.roomName}
                                onChange={handleChange}
                                placeholder="Aditya Madan"
                                className="w-full h-8 md:h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Room Type */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">Room Type</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleChange}
                                className="w-full h-8 md:h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none appearance-none cursor-pointer"
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
                                className="w-full h-8 md:h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>

                        {/* Block Preferences (Flattened into grid) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base font-bold">1st Preference</label>
                            <input
                                type="text"
                                name="pref1"
                                value={formData.pref1}
                                onChange={handleChange}
                                placeholder="AC"
                                className="w-full h-8 md:h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-8 md:h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
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
                                className="w-full h-8 md:h-9 bg-[#F7CC66] rounded-[4px] border border-black px-3 text-sm md:text-base font-normal text-black focus:outline-none placeholder:text-black/40"
                            />
                        </div>
                    </div>

                    {/* Other Preferences - Height match with Profile Page */}
                    <div className="flex flex-col gap-1 mb-6 lg:mb-8">
                        <label className="text-sm md:text-base font-bold">Other Preferences ( 200 Words )</label>
                        <textarea
                            name="otherPreferences"
                            value={formData.otherPreferences}
                            onChange={handleChange}
                            placeholder="Tell us about your preferences..."
                            className="w-full h-16 md:h-20 lg:h-24 bg-[#F7CC66] rounded-[4px] border border-black p-3 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
                        />
                    </div>

                    {/* Submit Button - Style match with Profile Page */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_4px_0px_black] px-6 py-1.5 md:py-2 text-lg font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[2.5px_3.5px_0px_black] transition-all active:translate-x-[3px] active:translate-y-[4px] active:shadow-none cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

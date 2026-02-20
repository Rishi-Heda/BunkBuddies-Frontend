"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Syne } from 'next/font/google';
import BackgroundGrid from '../components/BackgroundLines';
import Navbar from '../components/Navbar';

const syne = Syne({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

export default function CreateRoomPage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [formData, setFormData] = useState({
        roomName: '',
        roomType: 'AC',
        pref1: '',
        pref2: '',
        pref3: '',
        roomSize: '',
        otherPreferences: ''
    });

    useEffect(() => {
        // Check if we're editing
        const editData = localStorage.getItem('bunkBuddies_editGroup');
        if (editData) {
            const groupToEdit = JSON.parse(editData);
            setFormData({
                roomName: groupToEdit.roomName || '',
                roomType: groupToEdit.roomType || 'AC',
                pref1: groupToEdit.pref1 || '',
                pref2: groupToEdit.pref2 || '',
                pref3: groupToEdit.pref3 || '',
                roomSize: groupToEdit.roomSize || '',
                otherPreferences: groupToEdit.otherPreferences || ''
            });
            setIsEditing(true);
            setEditingGroupId(groupToEdit.id);
            // Clear the edit data
            localStorage.removeItem('bunkBuddies_editGroup');
        }
    }, []);

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

        // Lookup profile and attach details to group
        const storedProfile = JSON.parse(localStorage.getItem('bunkBuddies_userProfile') || '{}');

        if (isEditing && editingGroupId) {
            // Update existing group
            const updatedGroup = {
                ...formData,
                id: editingGroupId,
                adminCgpa: storedProfile.cgpa || 'N/A',
                adminName: storedProfile.name || 'Anonymous'
            };

            // Update user's group
            localStorage.setItem('bunkBuddies_userGroup', JSON.stringify(updatedGroup));

            // Update in all groups array
            const allGroups = JSON.parse(localStorage.getItem('bunkBuddies_allGroups') || '[]');
            const updatedAllGroups = allGroups.map(group =>
                group.id === editingGroupId ? updatedGroup : group
            );
            localStorage.setItem('bunkBuddies_allGroups', JSON.stringify(updatedAllGroups));

            alert('Room Updated Successfully!');
        } else {
            // Create new group
            const newGroup = {
                ...formData,
                id: Date.now().toString(),
                adminCgpa: storedProfile.cgpa || 'N/A',
                adminName: storedProfile.name || 'Anonymous'
            };

            // Save as user's group
            localStorage.setItem('bunkBuddies_userGroup', JSON.stringify(newGroup));

            // Push to global all groups array
            const allGroups = JSON.parse(localStorage.getItem('bunkBuddies_allGroups') || '[]');
            localStorage.setItem('bunkBuddies_allGroups', JSON.stringify([newGroup, ...allGroups]));

            alert('Room Created Successfully!');
        }

        router.push('/my-groups');
    };

    return (
        <BackgroundGrid>
            <div className={`${syne.className} min-h-screen relative p-4 flex flex-col items-center justify-center pt-20 md:pt-20 pb-10 md:pb-2`}>

                {/* Header Box (Logo + Navbar) - Same line on all screen sizes */}
                <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={120}
                        height={40}
                        className="w-auto h-8 md:h-12"
                        priority
                    />
                    <Navbar wrapperClass="static flex items-center h-8 md:h-12" />
                </div>

                {/* Main Content Container - Exactly matched with find-buddies main */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-[1045px] bg-[#FFB0AF] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0"
                >

                    <div className="flex flex-row justify-between items-center mb-6 md:mb-5 gap-3">
                        <h1 className="text-xl md:text-2xl font-semibold leading-tight pt-2 md:pt-0">{isEditing ? 'Edit Room' : 'Create Room'}</h1>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1.5 text-[14px] sm:text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none transition-all whitespace-nowrap"
                        >
                            ← Go Back
                        </button>
                    </div>

                    {/* Form contents... */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mb-3">
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

                    {/* Other Preferences - Subtle refinement (80px height) */}
                    <div className="flex flex-col gap-1 mb-5">
                        <label className="text-sm md:text-base font-bold">Other Preferences ( 200 Words )</label>
                        <textarea
                            name="otherPreferences"
                            value={formData.otherPreferences}
                            onChange={handleChange}
                            placeholder="Tell us about your preferences..."
                            className="w-full h-20 bg-[#F7CC66] rounded-[4px] border border-black p-2 text-sm md:text-base font-normal text-black focus:outline-none resize-none placeholder:text-black/40"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-2">
                        <button
                            type="submit"
                            className="bg-[#FD9E51] border border-black rounded-[4px] shadow-[3px_3px_0px_black] md:shadow-[3px_4px_0px_black] px-8 py-2 md:py-2.5 text-[16px] md:text-lg font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer"
                        >
                            {isEditing ? 'Update Room' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </BackgroundGrid>
    );
}

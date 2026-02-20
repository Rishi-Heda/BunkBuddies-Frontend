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

export default function ExploreRoomsPage() {
    const router = useRouter();
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const storedRooms = JSON.parse(localStorage.getItem('bunkBuddies_allGroups') || '[]');
        setRooms(storedRooms);
    }, []);

    const handleSendRequest = (roomId) => {
        const profile = JSON.parse(localStorage.getItem('bunkBuddies_userProfile') || '{}');
        if (!profile.name) {
            alert("Please create a profile first to send a join request!");
            router.push('/profile');
            return;
        }

        const existingRequests = JSON.parse(localStorage.getItem('bunkBuddies_joinRequests') || '[]');

        // Check if already requested
        const alreadyRequested = existingRequests.some(req => req.roomId === roomId && req.userProfile.registerNumber === profile.registerNumber);
        if (alreadyRequested) {
            alert("You have already sent a request to this room.");
            return;
        }

        const newRequest = {
            id: Date.now().toString(),
            roomId: roomId,
            userProfile: profile
        };

        localStorage.setItem('bunkBuddies_joinRequests', JSON.stringify([...existingRequests, newRequest]));
        alert("Join Request Sent Successfully!");
    };

    return (
        <BackgroundGrid>
            <div className={`${syne.className} min-h-screen md:h-screen md:overflow-hidden relative p-4 flex flex-col items-center justify-center pt-20 md:pt-[88px] pb-10 md:pb-4`}>

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

                {/* Main Content Container */}
                <div className="w-full max-w-[1045px] bg-[#88E7C3] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0 flex flex-col md:max-h-[calc(100vh-108px)]">

                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-5 shrink-0">
                        <h1 className="text-xl md:text-2xl font-semibold text-black">Explore Rooms</h1>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1 md:py-1.5 text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all"
                        >
                            ← Go Back
                        </button>
                    </div>

                    {/* Rooms Area */}
                    <div className="overflow-visible md:overflow-y-auto overflow-x-hidden custom-scrollbar pt-2 px-2 md:flex-1 min-h-0 -mx-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4 max-w-[900px] mx-auto px-2 h-max">
                            {rooms.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center flex flex-col items-center">
                                    <p className="text-[#3E3E3E] text-2xl font-medium">No one has created a room yet!</p>
                                    <p className="mt-3 text-[#3E3E3E]">Be the first to start a group.</p>
                                </div>
                            ) : rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="w-full bg-[#CBA0FF] border border-black shadow-[3.5px_3.5px_0px_black] rounded-[2.5px] p-5 relative flex flex-col hover:scale-[1.01] transition-transform h-[310px]"
                                >
                                    <div className="mb-4">
                                        <p className="text-[#3E3E3E] text-base font-normal">{room.roomSize} Bedded {room.roomType}</p>
                                        <h2 className="text-black text-2xl font-normal leading-tight">{room.roomName || "Unnamed Room"}</h2>
                                    </div>

                                    <div className="space-y-1 mb-4 flex-grow">
                                        <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                            <span>No. of beds available</span>
                                            <span>{room.roomSize || '0'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                            <span>Block Preference</span>
                                            <span>{room.pref1 || 'N/A'}{room.pref2 ? `>${room.pref2}` : ''}{room.pref3 ? `>${room.pref3}` : ''}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[#141414] text-[15.84px]">
                                            <span>Group Admin CGPA</span>
                                            <span>{room.adminCgpa || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {room.otherPreferences && (
                                        <div className="bg-[#E7D2FF] rounded-[5px] p-2.5 mb-4 min-h-[56px]">
                                            <p className="text-[#606060] text-[11px] font-medium leading-tight">
                                                {room.otherPreferences}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-auto flex justify-center">
                                        <button
                                            onClick={() => handleSendRequest(room.id)}
                                            className="bg-[#47D19D] border border-black shadow-[1.6px_2.2px_0px_black] rounded-[2.7px] px-3 py-1.5 text-black text-[12.96px] font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[1.6px] active:translate-y-[2.2px] transition-all"
                                        >
                                            Send Request to join
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(0, 0, 0, 0.3);
                    }
                `}</style>
            </div>
        </BackgroundGrid>
    );
}
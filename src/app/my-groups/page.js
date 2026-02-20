"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import BackgroundGrid from '../components/BackgroundLines';
import Navbar from '../components/Navbar';

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-syne',
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-plus-jakarta',
});

export default function MyGroupsPage() {
    const router = useRouter();
    const [userGroup, setUserGroup] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedGroup = localStorage.getItem('bunkBuddies_userGroup');
        const storedProfile = localStorage.getItem('bunkBuddies_userProfile');

        if (storedGroup) {
            const parsedGroup = JSON.parse(storedGroup);
            setUserGroup(parsedGroup);

            // Fetch requests
            const allRequests = JSON.parse(localStorage.getItem('bunkBuddies_joinRequests') || '[]');
            setJoinRequests(allRequests.filter(req => req.roomId === parsedGroup.id));
        }
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
        }

        setIsLoaded(true);
    }, []);

    return (
        <BackgroundGrid bgColor="#FEE3D2">
            <div className={`${syne.className} ${plusJakartaSans.variable} min-h-screen relative flex flex-col items-center p-4 pt-20 md:pt-20 pb-10 md:pb-2`}>

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

                {/* Main Content Wrapper - Standard 1045px width */}
                <main className="w-full max-w-[1045px] mt-[0vh] md:mt[0vh]">

                    {/* Section 1: Room Info Card (Green) */}
                    {isLoaded && userGroup ? (
                        <>
                            <div className="w-full bg-[#88E7C3] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] p-6 md:p-8 flex flex-col gap-6 relative mt-4 md:mt-0 mb-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h1 className="text-2xl md:text-[32px] font-semibold leading-tight">{userGroup.roomName || "Unnamed Room"}</h1>
                                        <p className="text-[#3E3E3E] text-lg md:text-[20px] font-normal">{userGroup.roomSize} Bedded {userGroup.roomType}</p>
                                    </div>

                                    {/* Action Buttons - Compact Sizing */}
                                    <div className="flex flex-wrap gap-2 md:gap-4 bg-[#FF7F70] border border-black shadow-[2.5px_3.5px_0px_black] rounded-[4.5px] px-4 py-2.5 items-center">
                                        <button className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap" onClick={() => { localStorage.removeItem('bunkBuddies_userGroup'); setUserGroup(null); }}>Delete Group</button>
                                        <span className="w-[1px] h-4 bg-black/20 hidden md:block"></span>
                                        <button className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap" onClick={() => {
                                            localStorage.setItem('bunkBuddies_editGroup', JSON.stringify(userGroup));
                                            router.push('/create-room');
                                        }}>Edit Details</button>
                                        <span className="w-[1px] h-4 bg-black/20 hidden md:block"></span>
                                        <button className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap">Add Roommate</button>
                                    </div>
                                </div>

                                {/* Badges Row - Reduced sizing */}
                                <div className="flex flex-wrap gap-3 md:gap-4">
                                    {[
                                        `No. of beds available : ${userGroup.roomSize || '0'}`,
                                        `Block Preference : ${userGroup.pref1 || 'N/A'}${userGroup.pref2 ? ` > ${userGroup.pref2}` : ''}${userGroup.pref3 ? ` > ${userGroup.pref3}` : ''}`,
                                        `Group admin CGPA : ${userProfile?.cgpa || 'N/A'}`
                                    ].map((text, i) => (
                                        <div key={i} className="bg-[#F7CC66] border border-black rounded-[4.5px] px-4 py-2 flex items-center shadow-[1px_1px_0px_black]">
                                            <span className="text-[#1A1A1A] text-[14px] md:text-[16px] font-normal whitespace-nowrap">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Description Box */}
                                {userGroup.otherPreferences && (
                                    <div className="bg-[#C7FEE9] rounded-[5px] p-4 md:p-5 border border-black/5">
                                        <p className="text-[#606060] text-[14px] md:text-[15px] font-medium leading-relaxed">
                                            {userGroup.otherPreferences}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Join Requests Heading (Outside the green box) */}
                            <div className="mb-8 mt-10">
                                <h2 className="text-3xl md:text-[40px] font-semibold">Join Requests</h2>
                            </div>

                            {/* Section 3: Requests Grid (Outside the green box) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {joinRequests.length === 0 ? (
                                    <div className="col-span-full py-10 text-center">
                                        <p className="text-[#3E3E3E] text-lg">No join requests yet.</p>
                                    </div>
                                ) : joinRequests.map((request) => (
                                    <div key={request.id} className="w-full max-w-[316px] mx-auto bg-[#CBA0FF] border border-black shadow-[3.4px_3.4px_0px_black] rounded-[2.4px] p-5 flex flex-col gap-4">
                                        <div>
                                            <p className="font-[family-name:var(--font-plus-jakarta)] text-[#3E3E3E] text-[16px] md:text-[18px] font-semibold leading-none">{request.userProfile.registerNumber || "Unknown ID"}</p>
                                            <h3 className="text-black text-[24px] md:text-[28px] font-semibold mt-1 leading-tight">{request.userProfile.name || "Anonymous User"}</h3>
                                        </div>

                                        {/* Request Stats Box */}
                                        <div className="bg-[#DCBFFF] rounded-[5px] p-3 flex flex-col gap-1.5 border border-black/10">
                                            <div className="flex justify-between items-center text-[16px]">
                                                <span className="text-[#141414] font-medium">Contact No.</span>
                                                <span className="text-[#3F3F3F] text-[14px] font-normal text-right truncate overflow-hidden bg-transparent max-w-[130px]">{request.userProfile.contact || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[16px]">
                                                <span className="text-[#141414] font-medium">Email</span>
                                                <span className="text-[#3F3F3F] text-[14px] font-normal text-right truncate overflow-hidden bg-transparent max-w-[130px]">{request.userProfile.email || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[16px]">
                                                <span className="text-[#141414] font-medium">CGPA</span>
                                                <span className="text-[#3F3F3F] text-[14px] font-normal text-right">{request.userProfile.cgpa || "N/A"}</span>
                                            </div>
                                        </div>

                                        {/* Acceptance Buttons */}
                                        <div className="flex justify-between gap-3 mt-1">
                                            <button
                                                onClick={() => {
                                                    const newReqs = joinRequests.filter(r => r.id !== request.id);
                                                    setJoinRequests(newReqs);
                                                    const allReqs = JSON.parse(localStorage.getItem('bunkBuddies_joinRequests') || '[]');
                                                    localStorage.setItem('bunkBuddies_joinRequests', JSON.stringify(allReqs.filter(r => r.id !== request.id)));
                                                }}
                                                className="flex-1 bg-[#FF6958] border border-black shadow-[1.5px_2px_0px_black] rounded-[2.7px] py-1.5 text-center text-black text-[14px] font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none transition-all"
                                            >
                                                Ignore
                                            </button>
                                            <button
                                                onClick={() => {
                                                    alert(`Request from ${request.userProfile.name || 'Anonymous User'} Accepted!`);
                                                    const newReqs = joinRequests.filter(r => r.id !== request.id);
                                                    setJoinRequests(newReqs);
                                                    const allReqs = JSON.parse(localStorage.getItem('bunkBuddies_joinRequests') || '[]');
                                                    localStorage.setItem('bunkBuddies_joinRequests', JSON.stringify(allReqs.filter(r => r.id !== request.id)));
                                                }}
                                                className="flex-1 bg-[#47D19D] border border-black shadow-[1.5px_2px_0px_black] rounded-[2.7px] py-1.5 text-center text-black text-[14px] font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none transition-all"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : isLoaded ? (
                        <div className="w-full bg-[#FFB0AF] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] p-8 md:p-14 flex flex-col items-center justify-center text-center mt-4 md:mt-6 mb-4">
                            <h2 className="text-2xl md:text-4xl font-semibold mb-4 text-black">You haven't created a room yet!</h2>
                            <p className="text-[#3E3E3E] text-md md:text-lg font-normal mb-8 max-w-[500px]">
                                Start looking for roommates by creating your own room group with all your specific preferences.
                            </p>
                            <button
                                onClick={() => router.push('/create-room')}
                                className="bg-[#FB5E4C] border border-black shadow-[3px_3px_0px_black] rounded-[4px] px-8 py-3 text-[16px] md:text-[20px] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all"
                            >
                                Create Room Group Now
                            </button>
                        </div>
                    ) : (
                        <div className="w-full py-20 flex justify-center"></div>
                    )}
                </main>
            </div>
        </BackgroundGrid>
    );
}

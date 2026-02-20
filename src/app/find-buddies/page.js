"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Syne } from 'next/font/google';
import BackgroundGrid from '../components/BackgroundLines';
import Navbar from '../components/Navbar';

const syne = Syne({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

export default function FindBuddiesPage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState('');
    const [joinRoomOpen, setJoinRoomOpen] = useState(false);

    const handleJoinRoom = (e) => {
        e.preventDefault();
        console.log('Joining room with code:', accessCode);
        alert(`Joining room with code: ${accessCode}`);
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

                {/* Main Content Container */}
                <main className="w-full max-w-[1045px] bg-[#9AD7FD] border border-black shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-10 relative mt-4 md:mt-0">

                    {/* Top Bar inside container */}
                    <div className="flex flex-row justify-between items-center mb-5 md:mb-8 gap-3">
                        <h1 className="text-xl md:text-2xl lg:text-[30px] font-semibold leading-tight">
                            Find Your <br className="md:hidden" /> BunkBuddies
                        </h1>
                        <button
                            onClick={() => router.back()}
                            className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1 md:py-1.5 text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all whitespace-nowrap whitespace-nowrap self-start mt-1 md:mt-0 md:self-auto"
                        >
                            ← Go Back
                        </button>
                    </div>

                    {/* Cards Grid - Fixed to Aspect Square on both mobile and desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 lg:gap-6 max-w-[280px] md:max-w-[900px] mx-auto">

                        {/* Create a Room Card */}
                        <div
                            onClick={() => router.push('/create-room')}
                            className="bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[3px] p-4 md:p-5 lg:p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.01] transition-transform aspect-square w-full"
                        >
                            <div className="text-[32px] md:text-[36px] mb-1.5 md:mb-2.5">🏠</div>
                            <h2 className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1 leading-tight">Create a Room</h2>
                            <p className="text-[12px] md:text-[13px] lg:text-[14px] font-normal leading-tight text-black/80">
                                Start a new room and find your future roomies
                            </p>
                        </div>

                        {/* Explore Rooms Card */}
                        <div
                            onClick={() => router.push('/explore-rooms')}
                            className="bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[3px] p-4 md:p-5 lg:p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.01] transition-transform aspect-square w-full"
                        >
                            <div className="text-[32px] md:text-[36px] mb-1.5 md:mb-2.5">🔍</div>
                            <h2 className="text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1 leading-tight">Explore Rooms</h2>
                            <p className="text-[12px] md:text-[13px] lg:text-[14px] font-normal leading-tight text-black/80">
                                Dont have a room yet ? <br />Find your new roomates here
                            </p>
                        </div>

                        {/* Join a Room Card - Animated */}
                        <div
                            className="bg-[#FFB7B6] border border-black shadow-[4.23px_4.23px_0px_black] rounded-[3px] relative overflow-hidden aspect-square w-full cursor-pointer"
                            onClick={() => setJoinRoomOpen(prev => !prev)}
                        >
                            <div
                                className="flex flex-col w-full transition-transform duration-500 ease-in-out h-[200%]"
                                style={{ transform: joinRoomOpen ? 'translateY(-50%)' : 'translateY(0)' }}
                            >
                                {/* Panel 1: Default view */}
                                <div className="flex flex-col items-center justify-center text-center p-4 md:p-5 lg:p-6 h-[50%]">
                                    <div className="text-[42px] md:text-[48px] mb-1 md:mb-2">🚪</div>
                                    <h2 className="text-[22px] md:text-[27px] font-semibold mb-0.5 md:mb-1 leading-tight">Join a Room</h2>
                                    <p className="text-[13px] md:text-[15px] font-normal leading-tight text-black max-w-[85%]">
                                        Already have a room code? Join your new roomies
                                    </p>
                                </div>

                                {/* Panel 2: Form view */}
                                <div className="flex flex-col items-center justify-center p-4 h-[50%]">
                                    <label className="text-[16px] md:text-[18px] font-semibold mb-2">Input Access Code</label>
                                    <input
                                        type="text"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        placeholder="Access Code"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full max-w-[200px] md:max-w-[220px] bg-[#F7CC66] rounded-[3.89px] border border-black px-3 py-2 text-[15px] md:text-[18.66px] text-[#575757] font-normal focus:outline-none placeholder:text-[#575757] mb-4 text-center"
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleJoinRoom(e); }}
                                        className="bg-[#FD9E51] border border-black shadow-[1.94px_2.59px_0px_black] rounded-[3.24px] px-6 py-2 md:py-[8px] text-[14px] md:text-[15.55px] font-normal hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[1.94px] active:translate-y-[2.59px] transition-all cursor-pointer"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </BackgroundGrid>
    );
}

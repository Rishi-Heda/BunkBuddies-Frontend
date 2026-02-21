"use client";

// ...existing code...
import { showToast } from "../components/Toast";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch, groupCapacity } from "../utils/backendClient";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-plus-jakarta",
});

export default function MyGroupsPage() {
        // Remove member from group (admin only)
        const handleRemoveMember = async (memberUID) => {
            if (!userGroup?.id || !memberUID) return;
            setActionLoading(`remove-${memberUID}`);
            try {
                await backendFetch(`group/removeMember`, {
                    method: "POST",
                    body: JSON.stringify({ groupId: userGroup.id, memberUID }),
                    headers: { "Content-Type": "application/json" },
                });
                await loadGroupData();
                showToast("Member removed from group", "success");
            } catch (error) {
                setErrorMessage(error?.message || "Unable to remove member");
            } finally {
                setActionLoading("");
            }
        };
    const router = useRouter();
    const [userGroup, setUserGroup] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [actionLoading, setActionLoading] = useState("");

    const loadGroupData = useCallback(async () => {
        setErrorMessage("");
        setIsLoaded(false);

        try {
            const response = await backendFetch("student/getStudent");
            const student = response?.user || {};
            const group = student.group || null;

            setUserProfile(student);
            setUserGroup(group);
            setIsAdmin(Boolean(group && student.firebaseUID && group.adminUID === student.firebaseUID));

            localStorage.setItem("bunkBuddies_userProfile", JSON.stringify({
                name: student.name || "",
                email: student.email || "",
                registerNumber: student.regNo || "",
                hostelType: student.hostelType || "",
                cgpa: student.CGPA !== undefined && student.CGPA !== null ? String(student.CGPA) : "",
                contact: student.phone || "",
                description: student.description || "",
            }));

            if (group) {
                localStorage.setItem("bunkBuddies_userGroup", JSON.stringify({
                    id: group.id,
                    roomName: group.groupName,
                    roomType: group.type,
                    pref1: group.block1,
                    pref2: group.block2,
                    pref3: group.block3,
                    roomSize: group.groupSize,
                    otherPreferences: group.preferences,
                }));
            } else {
                localStorage.removeItem("bunkBuddies_userGroup");
            }

            if (group && student.firebaseUID === group.adminUID) {
                const requestResponse = await backendFetch("groupRequest/listRequests");
                setJoinRequests(requestResponse?.requests || []);
            } else {
                setJoinRequests([]);
            }
        } catch (error) {
            const message = error?.message || "Unable to load group details";
            if (message.toLowerCase().includes("authorized")) {
                router.push("/signin?error=Please login first");
                return;
            }
            setErrorMessage(message);
        } finally {
            setIsLoaded(true);
        }
    }, [router]);

    useEffect(() => {
        loadGroupData();
    }, [loadGroupData]);

    const handleDeleteGroup = async () => {
        setActionLoading("delete");

        try {
            await backendFetch("group/deleteGroup", { method: "DELETE" });
            await loadGroupData();

            showToast("Group deleted successfully", "success");

        } catch (error) {
            const message = error?.message || "Unable to delete group";
            showToast(message, "error");
        } finally {
            setActionLoading("");
        }
    };

    const handleGenerateCode = async () => {
        setActionLoading("code");
        try {
            const response = await backendFetch("group/generateCode");
            alert(`Room code: ${response?.code || "N/A"}`);
        } catch (error) {
            const message = error?.message || "Unable to generate code";
            setErrorMessage(message);
        } finally {
            setActionLoading("");
        }
    };

    const handleLeaveGroup = async () => {
        setActionLoading("leave");

        try {
            await backendFetch("group/leaveGroup", { method: "POST" });
            await loadGroupData();

            showToast("You left the group", "info");

        } catch (error) {
            const message = error?.message || "Unable to leave group";
            showToast(message, "error");
        } finally {
            setActionLoading("");
        }
    };

    const handleRequestAction = async (requestId, action) => {
        setActionLoading(requestId);
        try {
            await backendFetch(
                `groupRequest/updateRequest/${requestId}/${action}`,
                { method: "POST" }
            );

            setJoinRequests((previous) =>
                previous.filter((request) => request.id !== requestId)
            );

            if (action === "ACCEPTED") {
                showToast("Member added to group", "success");
                await loadGroupData();
            }

            if (action === "REJECTED") {
                showToast("Join request ignored", "info");
            }
        } catch (error) {
            const message = error?.message || "Unable to update request";
            const lowerMessage = message.toLowerCase();
            
            // Check if the user is already in another group or request doesn't exist
            const isAlreadyInGroup = lowerMessage.includes("already") && 
                (lowerMessage.includes("group") || lowerMessage.includes("member"));
            const requestNotFound = lowerMessage.includes("request") && 
                (lowerMessage.includes("doesn't exist") || lowerMessage.includes("does not exist") || lowerMessage.includes("not found"));
            
            if ((isAlreadyInGroup || requestNotFound) && action === "ACCEPTED") {
                // User joined another group while this request was pending
                // Remove the stale request from the list
                setJoinRequests((previous) => previous.filter((request) => request.id !== requestId));
                showToast(
                    "This user is already in another group. Request removed.",
                    "error"
                );
            } else {
                setErrorMessage(message);
            }
        } finally {
            setActionLoading("");
        }
    };

    const groupBeds = groupCapacity(userGroup?.groupSize);
    const filledBeds = Array.isArray(userGroup?.studentUids) ? userGroup.studentUids.length : 0;
    const availableBeds = Math.max(groupBeds - filledBeds, 0);

    return (
        <BackgroundGrid bgColor="#FEE3D2">
            <div className={`${syne.className} ${plusJakartaSans.variable} min-h-screen relative flex flex-col items-center p-4 pt-20 md:pt-20 pb-10 md:pb-2`}>
                <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="focus:outline-none"
                        aria-label="Go to homepage"
                    >
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={160}
                            height={60}
                            className="w-auto h-12 md:h-16"
                            priority
                        />
                    </button>
                    <Navbar wrapperClass="static flex items-center h-8 md:h-12" />
                </div>

                <main className="w-full max-w-[1045px] mt-[0vh] md:mt[0vh]">
                    {errorMessage ? (
                        <p className="mt-4 mb-4 bg-[#FB5E4C] border border-black rounded-[5px] px-4 py-2 text-sm text-black">
                            {errorMessage}
                        </p>
                    ) : null}

                    {isLoaded && userGroup ? (
                        <>
                            <div className="w-full bg-[#88E7C3] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] p-6 md:p-8 flex flex-col gap-6 relative mt-4 md:mt-0 mb-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h1 className="text-2xl md:text-[32px] font-semibold leading-tight">{userGroup.groupName || "Unnamed Room"}</h1>
                                        <p className="text-[#3E3E3E] text-lg md:text-[20px] font-normal">{userGroup.groupSize} {userGroup.type}</p>
                                    </div>

                                    {isAdmin ? (
                                        <div className="flex flex-wrap gap-2 md:gap-4 bg-[#FF7F70] border border-black shadow-[2.5px_3.5px_0px_black] rounded-[4.5px] px-4 py-2.5 items-center">
                                            <button
                                                className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap disabled:opacity-70"
                                                onClick={handleDeleteGroup}
                                                disabled={actionLoading === "delete"}
                                            >
                                                {actionLoading === "delete" ? "Deleting..." : "Delete Group"}
                                            </button>
                                            <span className="w-[1px] h-4 bg-black/20 hidden md:block"></span>
                                            <button
                                                className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap"
                                                onClick={() => router.push("/create-room")}
                                            >
                                                Edit Details
                                            </button>
                                            <span className="w-[1px] h-4 bg-black/20 hidden md:block"></span>
                                            <button
                                                className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap disabled:opacity-70"
                                                onClick={handleGenerateCode}
                                                disabled={actionLoading === "code"}
                                            >
                                                {actionLoading === "code" ? "Generating..." : "Add Roommate"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 md:gap-4 bg-[#FF7F70] border border-black shadow-[2.5px_3.5px_0px_black] rounded-[4.5px] px-4 py-2.5 items-center">
                                            <button
                                                className="text-black text-[15px] md:text-[18px] font-normal hover:underline whitespace-nowrap disabled:opacity-70"
                                                onClick={handleLeaveGroup}
                                                disabled={actionLoading === "leave"}
                                            >
                                                {actionLoading === "leave" ? "Leaving..." : "Leave Group"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 md:gap-4">
                                    {[
                                        `No. of beds available : ${availableBeds}`,
                                        `Block Preference : ${userGroup.block1 || "N/A"}${userGroup.block2 ? ` > ${userGroup.block2}` : ""}${userGroup.block3 ? ` > ${userGroup.block3}` : ""}`,
                                        `Group admin CGPA : ${userProfile?.adminCGPA ?? "N/A"}`,
                                    ].map((text, index) => (
                                        <div key={index} className="bg-[#F7CC66] border border-black rounded-[4.5px] px-4 py-2 flex items-center shadow-[1px_1px_0px_black]">
                                            <span className="text-[#1A1A1A] text-[14px] md:text-[16px] font-normal whitespace-nowrap">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                {userGroup.preferences ? (
                                    <div className="bg-[#C7FEE9] rounded-[5px] p-4 md:p-5 border border-black/5">
                                        <p className="text-[#606060] text-[14px] md:text-[15px] font-medium leading-relaxed">
                                            {userGroup.preferences}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Your Squad Section */}
                            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-black mt-15">Your Squad</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                                {Array.isArray(userGroup?.students) && userGroup.students.length > 0 ? (
                                    (() => {
                                        const leader = userGroup.students.find(m => m.firebaseUID === userGroup.adminUID);
                                        const others = userGroup.students.filter(m => m.firebaseUID !== userGroup.adminUID);
                                        const renderMember = (member, idx) => (
                                            <div key={member.firebaseUID || idx} className="w-full max-w-[316px] mx-auto bg-[#CBA0FF] border border-black shadow-[3.4px_3.4px_0px_black] rounded-[2.4px] p-5 flex flex-col gap-5 relative" style={{outline: '0.48px black solid', outlineOffset: '-0.48px'}}>
                                                <div>
                                                    <p style={{color: '#3E3E3E', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 600, marginBottom: 4}}>{member.regNo || "Unknown ID"}</p>
                                                    <h3 style={{color: 'black', fontSize: 32, fontFamily: 'Syne', fontWeight: 500, marginBottom: 8}}>{member.name || "Anonymous User"}</h3>
                                                </div>
                                                <div className="bg-[#DCBFFF] rounded-[5px]" style={{width: 266, minHeight: 120, margin: '0 auto', padding: '16px', position: 'relative'}}>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                                                        <span style={{color: '#141414', fontSize: 20, fontFamily: 'Syne', fontWeight: 500}}>Contact No.</span>
                                                        <span style={{color: '#3F3F3F', fontSize: 15.84, fontFamily: 'Syne', fontWeight: 400}}>{member.phone || "N/A"}</span>
                                                    </div>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                                                        <span style={{color: '#141414', fontSize: 20, fontFamily: 'Syne', fontWeight: 500}}>Email</span>
                                                        {/* Clickable text instead of email */}
                                                        {member.email && (
                                                            <span
                                                                className="cursor-pointer hover:text-purple-900 transition-colors"
                                                                title="Contact member"
                                                                onClick={() => { window.location.href = `mailto:${member.email}`; }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                                    <rect width="24" height="24" rx="12" fill="#A084E8"/>
                                                                    <path d="M7 8h10v8H7V8zm5 3l5-3v8H7V8l5 3z" fill="#fff"/>
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                        <span style={{color: '#141414', fontSize: 20, fontFamily: 'Syne', fontWeight: 500}}>CGPA</span>
                                                        <span style={{color: '#3F3F3F', fontSize: 15.84, fontFamily: 'Syne', fontWeight: 400}}>{member.CGPA ?? "N/A"}</span>
                                                    </div>
                                                </div>
                                                {isAdmin && member.firebaseUID !== userGroup.adminUID && (
                                                    <button
                                                        className="block mx-auto mt-4 bg-[#FB5E4C] border border-black shadow-[2.16px_2.88px_0px_black] rounded-[3.6px] px-7 py-2 text-[17.28px] font-[400] font-[Syne] text-black hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all outline outline-[0.72px] outline-black outline-offset-[-0.72px]"
                                                        style={{ cursor: actionLoading === `remove-${member.firebaseUID}` ? 'not-allowed' : 'pointer' }}
                                                        onClick={() => handleRemoveMember(member.firebaseUID)}
                                                        disabled={actionLoading === `remove-${member.firebaseUID}`}
                                                    >
                                                        {actionLoading === `remove-${member.firebaseUID}` ? 'Removing...' : 'Remove'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                        return [leader && renderMember(leader, 0), ...others.map(renderMember)];
                                    })()
                                ) : (
                                    <div className="col-span-full py-10 text-center">
                                        <p className="text-[#3E3E3E] text-lg">No squad members yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Join Requests Section */}
                            {isAdmin ? (
                                <>
                                    <div className="mb-8 mt-10">
                                        <h2 className="text-3xl md:text-[40px] font-semibold">Join Requests</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                        {joinRequests.length === 0 ? (
                                            <div className="col-span-full py-10 text-center">
                                                <p className="text-[#3E3E3E] text-lg">No join requests yet.</p>
                                            </div>
                                        ) : joinRequests.map((request) => (
                                            <div key={request.id} className="w-full max-w-[316px] mx-auto bg-[#CBA0FF] border border-black shadow-[3.4px_3.4px_0px_black] rounded-[2.4px] p-5 flex flex-col gap-4">
                                                <div>
                                                    <p className="font-[family-name:var(--font-plus-jakarta)] text-[#3E3E3E] text-[16px] md:text-[18px] font-semibold leading-none">{request?.student?.regNo || "Unknown ID"}</p>
                                                    <h3 className="text-black text-[24px] md:text-[28px] font-semibold mt-1 leading-tight">{request?.student?.name || "Anonymous User"}</h3>
                                                </div>

                                                <div className="bg-[#DCBFFF] rounded-[5px] p-3 flex flex-col gap-1.5 border border-black/10">
                                                    <div className="flex justify-between items-center text-[16px]">
                                                        <span className="text-[#141414] font-medium">Contact No.</span>
                                                        <span className="text-[#3F3F3F] text-[14px] font-normal text-right truncate overflow-hidden bg-transparent max-w-[130px]">{request?.student?.phone || "N/A"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[16px]">
                                                        <span className="text-[#141414] font-medium">Email</span>
                                                        <span className="text-[#3F3F3F] text-[14px] font-normal text-right truncate overflow-hidden bg-transparent max-w-[130px]">{request?.student?.email || "N/A"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[16px]">
                                                        <span className="text-[#141414] font-medium">CGPA</span>
                                                        <span className="text-[#3F3F3F] text-[14px] font-normal text-right">{request?.student?.CGPA ?? "N/A"}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between gap-3 mt-1">
                                                    <button
                                                        onClick={() => handleRequestAction(request.id, "REJECTED")}
                                                        disabled={actionLoading === request.id}
                                                        className="flex-1 bg-[#FF6958] border border-black shadow-[1.5px_2px_0px_black] rounded-[2.7px] py-1.5 text-center text-black text-[14px] font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none transition-all disabled:opacity-70"
                                                    >
                                                        Ignore
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestAction(request.id, "ACCEPTED")}
                                                        disabled={actionLoading === request.id}
                                                        className="flex-1 bg-[#47D19D] border border-black shadow-[1.5px_2px_0px_black] rounded-[2.7px] py-1.5 text-center text-black text-[14px] font-medium hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none transition-all disabled:opacity-70"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : null}
                        </>
                    ) : isLoaded ? (
                        <div className="w-full bg-[#FFB0AF] border border-black shadow-[4px_4px_0px_black] md:shadow-[5px_5px_0px_black] rounded-[5px] p-8 md:p-14 flex flex-col items-center justify-center text-center mt-4 md:mt-6 mb-4">
                            <h2 className="text-2xl md:text-4xl font-semibold mb-4 text-black">You haven't created a room yet!</h2>
                            <p className="text-[#3E3E3E] text-md md:text-lg font-normal mb-8 max-w-[500px]">
                                Start looking for roommates by creating your own room group with all your specific preferences.
                            </p>
                            <button
                                onClick={() => router.push("/create-room")}
                                className="bg-[#FB5E4C] border border-black shadow-[3px_3px_0px_black] rounded-[4px] px-8 py-3 text-[16px] md:text-[20px] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all"
                            >
                                Create Room Group Now
                            </button>
                        </div>
                    ) : (
                        <div className="w-full py-20 flex justify-center">
                            <p className="text-[#3E3E3E] text-lg">Loading group...</p>
                        </div>
                    )}
                </main>
            </div>
        </BackgroundGrid>
    );
}

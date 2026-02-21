"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const Navbar = ({ wrapperClass = "absolute -top-12 right-0 md:-top-14 md:right-[-20px] z-[60]" }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const handleExploreClick = () => {
        if (pathname === "/explore-rooms") {
            router.push("/find-buddies");
        } else {
            router.push("/explore-rooms");
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setLogoutError("");

        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                cache: "no-store",
                credentials: "same-origin",
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(
                    payload?.error || payload?.message || "Unable to logout right now",
                );
            }

            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("bunkBuddies_")) {
                    localStorage.removeItem(key);
                }
            });

            window.location.assign("/signin?loggedOut=1");
        } catch (error) {
            setLogoutError(error?.message || "Unable to logout right now");
            setIsLoggingOut(false);
        }
    };

    return (
        <div className={wrapperClass}>
            <nav className="bg-[#BE8EF8] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1.5 flex gap-3 md:gap-6 items-center whitespace-nowrap">
                <button
                    type="button"
                    onClick={handleExploreClick}
                    className="text-[13px] md:text-[16px] font-normal hover:underline decoration-1 underline-offset-4"
                >
                    Find
                </button>
                <button
                    type="button"
                    className="text-[13px] md:text-[16px] font-normal hover:underline decoration-1 underline-offset-4"
                    onClick={() => router.push("/my-groups")}
                >
                    My Groups
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="text-[13px] md:text-[16px] font-normal hover:underline decoration-1 underline-offset-4"
                >
                    My Profile
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-[13px] md:text-[16px] font-normal hover:underline decoration-1 underline-offset-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
            </nav>
            {logoutError ? (
                <p className="mt-2 bg-[#FB5E4C] border border-black rounded-[4px] px-2 py-1 text-[12px] md:text-[13px] text-black">
                    {logoutError}
                </p>
            ) : null}
        </div>
    );
};

export default Navbar;

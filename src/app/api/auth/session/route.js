import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_BASE_URL = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    "https://bunkbuddies-backend-ic43.onrender.com"
).replace(/\/$/, "");

function routeFromState({ hasProfile, hasGroup }) {
    if (hasGroup) {
        return "/explore-rooms";
    }

    if (hasProfile) {
        return "/find-buddies";
    }

    return "/profile";
}

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("bb_access_token")?.value;

    if (!token) {
        return NextResponse.json({
            authenticated: false,
            hasProfile: false,
            hasGroup: false,
            nextRoute: "/signin",
            shouldGoExplore: false,
        });
    }

    try {
        const backendResponse = await fetch(`${BACKEND_BASE_URL}/student/getStudent`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (backendResponse.status === 401 || backendResponse.status === 403) {
            return NextResponse.json({
                authenticated: false,
                hasProfile: false,
                hasGroup: false,
                nextRoute: "/signin",
                shouldGoExplore: false,
            });
        }

        const payload = await backendResponse.json().catch(() => ({}));

        if (!backendResponse.ok) {
            return NextResponse.json({
                authenticated: true,
                hasProfile: false,
                hasGroup: false,
                nextRoute: "/profile",
                shouldGoExplore: false,
                detail: payload?.detail || "Unable to load session details",
            });
        }

        const user = payload?.user || {};
        const hasGroup = Boolean(user?.group?.id || user?.groupId);
        const hasProfile = Boolean((user?.hostelType || "").trim());
        const nextRoute = routeFromState({ hasProfile, hasGroup });

        return NextResponse.json({
            authenticated: true,
            hasProfile,
            hasGroup,
            nextRoute,
            shouldGoExplore: hasGroup,
            user: {
                name: user?.name || "",
                email: user?.email || "",
                regNo: user?.regNo || "",
            },
        });
    } catch {
        return NextResponse.json({
            authenticated: true,
            hasProfile: false,
            hasGroup: false,
            nextRoute: "/profile",
            shouldGoExplore: false,
            detail: "Session service is temporarily unavailable",
        });
    }
}

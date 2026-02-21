import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" });

    response.cookies.set("bb_access_token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

    return response;
}

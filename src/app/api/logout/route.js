import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
    const response = NextResponse.json(
        { message: "Logged out" },
        {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        },
    );

    response.cookies.delete("bb_access_token");
    response.cookies.set("bb_access_token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    return response;
}

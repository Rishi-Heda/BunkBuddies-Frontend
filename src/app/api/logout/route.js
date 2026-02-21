import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request) {
    const isSecure = request.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production";
    const response = NextResponse.json(
        { message: "Logged out" },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );

    response.cookies.set("bb_access_token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    return response;
}

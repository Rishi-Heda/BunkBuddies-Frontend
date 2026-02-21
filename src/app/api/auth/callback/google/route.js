

export const runtime = 'edge';
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
console.log('BACKEND_API_URL:', process.env.BACKEND_API_URL);
console.log('NEXT_PUBLIC_BACKEND_API_URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);
if (!BACKEND_BASE_URL) {
    throw new Error("BACKEND_API_URL is not defined");
}
const BASE_URL = BACKEND_BASE_URL.replace(/\/$/, "");

function redirectToSignin(request, errorMessage) {
    const signinUrl = new URL("/signin", request.url);
    if (errorMessage) {
        signinUrl.searchParams.set("error", errorMessage);
    }
    return NextResponse.redirect(signinUrl);
}

export async function GET(request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
        return redirectToSignin(request, "Missing Google callback parameters");
    }

    const frontendCallbackUrl = new URL("/api/auth/callback/google", request.url).toString();
    const backendCallbackUrl = new URL(`${BACKEND_BASE_URL}/auth/callback`);
    backendCallbackUrl.searchParams.set("code", code);
    backendCallbackUrl.searchParams.set("state", state);
    backendCallbackUrl.searchParams.set("redirect_uri", frontendCallbackUrl);

    try {
        const backendResponse = await fetch(backendCallbackUrl.toString(), {
            method: "GET",
            cache: "no-store",
        });

        const payload = await backendResponse.json().catch(() => ({}));

        if (!backendResponse.ok) {
            return redirectToSignin(
                request,
                payload?.detail || payload?.error || "Authentication failed",
            );
        }

        if (!payload?.access_token) {
            return redirectToSignin(
                request,
                "Authentication token missing from backend response",
            );
        }

        const response = NextResponse.redirect(new URL("/profile", request.url));
        response.cookies.set("bb_access_token", payload.access_token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch {
        return redirectToSignin(request, "Unable to complete login");
    }
}

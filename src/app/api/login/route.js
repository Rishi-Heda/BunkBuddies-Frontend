

export const runtime = 'edge';
import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_API_URL is not defined");
}
const BASE_URL = BACKEND_BASE_URL.replace(/\/$/, "");

function enforceSelectAccountPrompt(authorizationUrl) {
    try {
        const parsedUrl = new URL(authorizationUrl);
        const promptValue = parsedUrl.searchParams.get("prompt") || "";
        const promptParts = promptValue
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean);

        if (!promptParts.includes("select_account")) {
            promptParts.push("select_account");
            parsedUrl.searchParams.set("prompt", promptParts.join(" "));
        }

        return parsedUrl.toString();
    } catch {
        return authorizationUrl;
    }
}

function redirectToSignin(request, errorMessage) {
    const signinUrl = new URL("/signin", request.url);
    if (errorMessage) {
        signinUrl.searchParams.set("error", errorMessage);
    }
    return NextResponse.redirect(signinUrl);
}

export async function GET(request) {
    const frontendCallbackUrl = new URL("/api/auth/callback/google", request.url).toString();
    const backendLoginUrl = new URL(`${BACKEND_BASE_URL}/auth/login`);
    backendLoginUrl.searchParams.set("redirect_uri", frontendCallbackUrl);

    try {
        const backendResponse = await fetch(backendLoginUrl.toString(), {
            method: "GET",
            cache: "no-store",
        });

        const payload = await backendResponse.json().catch(() => ({}));
        const authorizationUrl = payload?.authorization_url;

        if (!backendResponse.ok || !authorizationUrl) {
            return redirectToSignin(
                request,
                payload?.detail || payload?.error || "Unable to start Google login",
            );
        }

        return NextResponse.redirect(enforceSelectAccountPrompt(authorizationUrl));
    } catch {
        return redirectToSignin(
            request,
            "Could not connect to backend login service",
        );
    }
}

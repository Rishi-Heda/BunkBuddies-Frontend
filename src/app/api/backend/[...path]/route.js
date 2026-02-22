import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const NETWORK_ERROR_MESSAGE =
    "Connect to internet and try again";

export const runtime = 'edge';
const BACKEND_BASE_URL = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    "https://bunkbuddies-backend-ic43.onrender.com"
).replace(/\/$/, "");

function buildTargetUrl(pathSegments, requestUrl) {
    const backendUrl = new URL(pathSegments.join("/"), `${BACKEND_BASE_URL}/`);
    const incomingUrl = new URL(requestUrl);

    incomingUrl.searchParams.forEach((value, key) => {
        backendUrl.searchParams.append(key, value);
    });

    return backendUrl;
}

async function proxyRequest(request, { params }) {
    const resolvedParams = typeof params?.then === "function" ? await params : params;
    const pathSegments = resolvedParams?.path || [];

    if (!pathSegments.length) {
        return NextResponse.json({ detail: "Missing backend path" }, { status: 400 });
    }

    const targetUrl = buildTargetUrl(pathSegments, request.url);
    const requestHeaders = {};

    const cookieStore = await cookies();
    const token = cookieStore.get("bb_access_token")?.value;
    if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
    }

    const contentType = request.headers.get("content-type");
    if (contentType) {
        requestHeaders["Content-Type"] = contentType;
    }

    const shouldSendBody = request.method !== "GET" && request.method !== "HEAD";
    const rawBody = shouldSendBody ? await request.text() : undefined;

    try {
        const backendResponse = await fetch(targetUrl.toString(), {
            method: request.method,
            headers: requestHeaders,
            body: rawBody ? rawBody : undefined,
            cache: "no-store",
        });

        const responseType = backendResponse.headers.get("content-type") || "";

        if (responseType.includes("application/json")) {
            const payload = await backendResponse.json().catch(() => ({}));
            return NextResponse.json(payload, { status: backendResponse.status });
        }

        const text = await backendResponse.text().catch(() => "");
        return new NextResponse(text, {
            status: backendResponse.status,
            headers: responseType ? { "Content-Type": responseType } : undefined,
        });
    } catch {
        return NextResponse.json(
            { detail: NETWORK_ERROR_MESSAGE },
            { status: 502 },
        );
    }
}

export async function GET(request, context) {
    return proxyRequest(request, context);
}

export async function POST(request, context) {
    return proxyRequest(request, context);
}

export async function PUT(request, context) {
    return proxyRequest(request, context);
}

export async function PATCH(request, context) {
    return proxyRequest(request, context);
}

export async function DELETE(request, context) {
    return proxyRequest(request, context);
}

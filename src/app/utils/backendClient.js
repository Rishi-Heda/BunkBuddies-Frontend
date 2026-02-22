const BACKEND_PROXY_PREFIX = "/api/backend";

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json().catch(() => ({}));
    }

    return response.text().catch(() => "");
}

function resolveErrorMessage(payload, fallback) {
    if (!payload) {
        return fallback;
    }

    if (typeof payload === "string") {
        return payload || fallback;
    }

    return (
        payload.detail ||
        payload.message ||
        payload.error ||
        fallback
    );
}

export async function backendFetch(path, options = {}) {
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    const url = `${BACKEND_PROXY_PREFIX}/${normalizedPath}`;
    const { body, headers = {}, method = "GET", ...rest } = options;

    const requestHeaders = { ...headers };
    const requestConfig = {
        ...rest,
        method,
        headers: requestHeaders,
        cache: "no-store",
    };

    if (body !== undefined) {
        requestConfig.body = typeof body === "string" ? body : JSON.stringify(body);
        if (!requestHeaders["Content-Type"]) {
            requestHeaders["Content-Type"] = "application/json";
        }
    }

    let response;

    try {
        response = await fetch(url, requestConfig);
    } catch (error) {
        // 🚨 Network failure (internet off / backend down)
        throw new Error("Connect to internet and try again");
    }
    const payload = await parseResponse(response);

    if (!response.ok) {
        const fallback = `Request failed with status ${response.status}`;
        throw new Error(resolveErrorMessage(payload, fallback));
    }

    return payload;
}

export function toGroupType(roomType) {
    return roomType === "Non-AC" ? "NON-AC" : "AC";
}

export function fromGroupType(groupType) {
    return groupType === "NON-AC" ? "Non-AC" : "AC";
}

export function toGroupSize(roomSize) {
    const cleaned = String(roomSize || "").trim();
    if (!cleaned) {
        return "";
    }

    return cleaned.includes("Bedded") ? cleaned : `${cleaned}-Bedded`;
}

export function fromGroupSize(groupSize) {
    return String(groupSize || "").replace("-Bedded", "");
}

export function groupCapacity(groupSize) {
    const match = String(groupSize || "").match(/^(\d+)-Bedded$/);
    return match ? Number(match[1]) : 0;
}

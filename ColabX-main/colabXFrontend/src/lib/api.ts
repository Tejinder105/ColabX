const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export const API_BASE = normalizedApiBaseUrl
    ? `${normalizedApiBaseUrl}/api`
    : "/api";

export function getAppBaseUrl(): string {
    const envAppUrl = import.meta.env.VITE_APP_URL?.trim();
    if (envAppUrl) {
        return envAppUrl.replace(/\/+$/, "");
    }

    if (typeof window !== "undefined" && window.location?.origin) {
        return window.location.origin;
    }

    return "http://localhost:5173";
}

export const AUTH_BASE = normalizedApiBaseUrl
    ? `${normalizedApiBaseUrl}/api/auth`
    : `${getAppBaseUrl()}/api/auth`;

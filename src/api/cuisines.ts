// src/api/cuisines.ts
import { api } from "./client";

export type CuisineOption = { code: string; name: string };

/** List active cuisines, optionally filtered by name. */
export const getCuisines = (q?: string, limit = 200) =>
    api.get<CuisineOption[]>("/api/cuisines", { params: { q, limit } })
        .then(r => r.data);

/** Fetch a specific set by code (server returns only matches). */
export const getCuisinesByCodes = (codes: string[]) => {
    if (!codes || codes.length === 0) return Promise.resolve<CuisineOption[]>([]);
    // Server expects repeated ?code=italian&code=tapas
    return api.get<CuisineOption[]>("/api/cuisines/by-codes", { params: { code: codes } })
        .then(r => r.data);
};

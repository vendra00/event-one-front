// src/api/geo.ts
import { api } from "./client";

export type GeoOption = { code: string; name: string };

export type GeoResolved = {
    communityCode: string; communityName: string;
    provinceCode: string;  provinceName: string;
    municipalityCode: string; municipalityName: string;
};

export const getCommunities = (q?: string, limit = 50) =>
    api.get<GeoOption[]>("/api/geo/communities", { params: { q, limit } })
        .then(r => r.data);

export const getProvinces = (communityCode: string, q?: string, limit = 50) =>
    api.get<GeoOption[]>("/api/geo/provinces", { params: { communityCode, q, limit } })
        .then(r => r.data);

export const getMunicipalities = (provinceCode: string, q?: string, limit = 200) =>
    api.get<GeoOption[]>("/api/geo/municipalities", { params: { provinceCode, q, limit } })
        .then(r => r.data);

export const resolvePostal = (postal: string) =>
    api.get<GeoResolved>("/api/geo/resolve-postal", { params: { postal } })
        .then(r => r.data);

// types/dtos.ts

export type UserRole = "CONSUMER" | "PROVIDER" | "ADMIN";

export interface AppUserDto {
    id: number;
    email: string;
    roles: UserRole[];
    createdAt: string;
}

/* ====== Cuisines & Geo ====== */
export interface CuisineDto {
    code: string;
    name: string;
}

export interface GeoLocationDto {
    countryCode?: string;
    countryName?: string;
    communityCode?: string;
    communityName?: string;
    provinceCode?: string;
    provinceName?: string;
    municipalityCode?: string;
    municipalityName?: string;
    locality?: string;
    postalCode?: string;
}

/* ====== Offering ====== */
export interface OfferingDto {
    id: number;
    providerId: number;
    title: string;
    description?: string;
    basePriceCents: number;
    currency: string;
    minGuests: number;
    maxGuests: number;

    // CHANGED: now resolved to objects
    cuisines?: CuisineDto[];

    // Still CSV for now (until Offering migrates)
    services?: string;

    // Legacy (still sent by backend)
    city?: string;
    region?: string;

    active: boolean;

    menu?: Array<{
        id: number;
        name: string;
        description?: string;
        course: "STARTER" | "MAIN" | "DESSERT" | "SIDE" | "DRINK";
    }>;
}

/* ====== Paging ====== */
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/* ====== Event Requests ====== */
export type EventRequestStatus =
    | "OPEN"
    | "CANCELED"
    | "BOOKED"
    | "CLOSED"
    | "EXPIRED"
    | string;

// UPDATED: normalized geo + cuisine codes
export interface CreateEventRequestReq {
    title?: string;
    startsAt: string; // ISO
    endsAt: string;   // ISO
    guests: number;

    geo: {
        communityCode?: string;
        provinceCode?: string;
        municipalityCode?: string;
        locality?: string;
        postalCode?: string;
    };

    // CHANGED: list of codes instead of CSV string
    cuisineCodes?: string[];

    // Still CSV for now
    services?: string;

    budgetCents?: number;
    currency?: string; // default "EUR"
    notes?: string;    // CHANGED (was note)

    providerId?: number;
    offeringId?: number;
}

// UPDATED: location + cuisines[] instead of city/region + CSV
export interface EventRequestDto {
    id: number;
    title?: string;
    startsAt: string;
    endsAt: string;

    guests: number;

    // NEW: normalized location
    location?: GeoLocationDto;

    // NEW: resolved cuisines
    cuisines?: CuisineDto[];

    // Still CSV
    services?: string;

    budgetCents?: number;
    currency: string;
    notes?: string; // CHANGED (was note)

    status: EventRequestStatus;
    createdAt?: string;
    updatedAt?: string;

    consumerId?: number;
    providerId?: number;
    offeringId?: number;
}

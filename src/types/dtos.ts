export type UserRole = "CONSUMER" | "PROVIDER" | "ADMIN";

export interface AppUserDto {
    id: number;
    email: string;
    roles: UserRole[];
    createdAt: string;
}

export interface OfferingDto {
    id: number;
    providerId: number;
    title: string;
    description?: string;
    basePriceCents: number;
    currency: string;
    minGuests: number;
    maxGuests: number;
    cuisines?: string;
    services?: string;
    city?: string;
    region?: string;
    active: boolean;
    menu?: Array<{
        id: number; name: string; description?: string;
        course: "STARTER" | "MAIN" | "DESSERT" | "SIDE" | "DRINK";
    }>;
}

export interface Page<T> {
    content: T[]; totalElements: number; totalPages: number; number: number; size: number;
}

export type EventRequestStatus = | "OPEN" | "CANCELED" | "BOOKED" | "CLOSED" | "EXPIRED" | string;

export interface CreateEventRequestReq {
    title?: string;
    startsAt: string;   // ISO
    endsAt: string;     // ISO
    city: string;
    region?: string;
    guests: number;
    cuisines?: string;  // comma tags
    services?: string;  // comma tags
    budgetCents?: number;
    currency?: string;  // default "EUR"
    note?: string;
    providerId?: number;
    offeringId?: number;
}

export interface EventRequestDto {
    id: number;
    title?: string;
    startsAt: string;
    endsAt: string;
    city: string;
    region?: string;
    guests: number;
    cuisines?: string;
    services?: string;
    budgetCents?: number;
    currency: string;
    note?: string;
    status: EventRequestStatus;
    createdAt?: string;
    updatedAt?: string;
    providerId?: number;
    offeringId?: number;
}

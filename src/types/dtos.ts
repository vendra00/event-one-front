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

export interface EventRequestDto {
    id: number;
    title: string;
    startsAt: string;
    endsAt: string;
    city?: string;
    region?: string;
    guests: number;
    status: "OPEN" | "BOOKED" | "CANCELLED";
}

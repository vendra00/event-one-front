import { api } from "./client";
import type { CreateEventRequestReq, Page, EventRequestDto } from "../types/dtos";

export async function createEventRequest(payload: CreateEventRequestReq): Promise<EventRequestDto> {
    const { data } = await api.post("/api/requests", payload);
    return data as EventRequestDto;
}

export async function fetchEventRequest(id: number): Promise<EventRequestDto> {
    const { data } = await api.get(`/api/requests/${id}`);
    return data as EventRequestDto;
}

function normalizePage<T>(d: any, fallbackPage = 0, fallbackSize = 20): Page<T> {
    const content: T[] =
        d?.content ??
        d?._embedded?.items ??
        d?._embedded?.eventRequestDtoList ??
        [];

    const number: number = d?.number ?? d?.page?.number ?? fallbackPage;
    const size: number = d?.size ?? d?.page?.size ?? fallbackSize;

    // total elements (use server value if present, otherwise fallback to content length)
    const totalElements: number =
        d?.totalElements ?? d?.page?.totalElements ?? content.length;

    // total pages (use server value if present, otherwise derive)
    const totalPages: number =
        d?.totalPages ??
        d?.page?.totalPages ??
        Math.max(1, Math.ceil(totalElements / (size || 1)));

    return { content, number, size, totalPages, totalElements };
}

export async function fetchMyEventRequests(page = 0, size = 20): Promise<Page<EventRequestDto>> {
    const res = await api.get("/api/requests", { params: { page, size, sort: "id,DESC" } });
    return normalizePage<EventRequestDto>(res.data, page, size);
}

export async function cancelEventRequest(id: number): Promise<EventRequestDto> {
    const res = await api.post(`/api/requests/${id}/cancel`);
    return res.data as EventRequestDto;
}

import { api } from "./client";
import type { CreateEventRequestReq, EventRequestDto } from "../types/dtos";

export async function createEventRequest(payload: CreateEventRequestReq): Promise<EventRequestDto> {
    const { data } = await api.post("/api/requests", payload);
    return data;
}

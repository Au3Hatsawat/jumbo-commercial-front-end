import api from "./axios";
import { Unit, UnitCreatePayload, UnitUpdatePayload } from "../types/unit";

export async function getUnits(): Promise<Unit[]> {
    const response = await api.get('/units'); 
    return response.data as Unit[];
}

export async function getUnitById(id:number): Promise<Unit> {
    const response = await api.get(`/units/${id}`);
    return response.data as Unit;
}

export async function createUnit(unit: UnitCreatePayload): Promise<Unit> {
    const response = await api.post('/units', unit);
    return response.data as Unit;
}

export async function updateUnit(id:number,unit: Partial<UnitCreatePayload>): Promise<Unit> {
    const response = await api.patch(`/units/${id}`, unit);
    return response.data as Unit;
}

export async function deleteUnit(id:number): Promise<Unit> {
    const response = await api.delete(`/units/${id}`);
    return response.data as Unit;
}

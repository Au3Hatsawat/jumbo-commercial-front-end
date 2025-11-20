import api from "./axios";
import { Unit } from "../types/unit";

export async function getUnits(): Promise<Unit[]> {
    const response = await api.get('/units'); 
    return response.data as Unit[];
}

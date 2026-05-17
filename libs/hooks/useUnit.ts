import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from "../api/unit";
import { Unit, UnitCreatePayload, UnitUpdatePayload } from "../types/unit";
import { ErrorResponse } from "@/utils/errorMapping";
import { AxiosError } from "axios";

export const useUnits = () => useQuery<Unit[], AxiosError<ErrorResponse>>({
    queryKey: ['units'],
    queryFn: getUnits,
    staleTime: 1000 * 60 * 60,
});

export const useUnit = (id:number) => {
    return useQuery<Unit , AxiosError<ErrorResponse>>({
        queryKey: ['unit',id],
        queryFn: () => getUnitById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id
    })
}

export const UseCreateUnits = () => {
    const queryClient = useQueryClient();

    return useMutation<Unit, AxiosError<ErrorResponse>, UnitCreatePayload>({
        mutationFn: createUnit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units'] })
        },
    })
}

export const UseUpdateUnit = () => {
    const queryClient = useQueryClient();

    return useMutation<Unit, AxiosError<ErrorResponse>, UnitUpdatePayload>({
        mutationFn: ({ id, ...payload }) => updateUnit(id, payload),
        onSuccess: (unit) => {
            queryClient.invalidateQueries({ queryKey: ['units'] });
            queryClient.invalidateQueries({ queryKey: ['unit',unit.id] });
        }
    })
}

export const UseDeleteUnit = () => {
    const queryClient = useQueryClient();

    return useMutation<Unit, AxiosError<ErrorResponse>, {id: number}>({
        mutationFn: ({id}) => deleteUnit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units'] });
        }
    })
}
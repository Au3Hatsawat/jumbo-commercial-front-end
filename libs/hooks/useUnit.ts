import { useQuery } from "@tanstack/react-query";
import { getUnits } from "../api/ีunit";

export const useUnits = () => useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
    staleTime: 1000 * 60 * 60, // 1 hour
});
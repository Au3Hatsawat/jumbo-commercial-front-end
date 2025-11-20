import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/category";

export const useCategories = () => useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, 
});
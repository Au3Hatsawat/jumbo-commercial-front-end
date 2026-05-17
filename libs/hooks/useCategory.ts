import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategories, deleteCategory, getCategories, getCategoryById, updateCategory } from "../api/category";
import { Category, CategoryCreatePayload, CategoryUpdatePayload } from "../types/category";
import { ErrorResponse } from "@/utils/errorMapping";
import { AxiosError } from "axios";

export const useCategories = () => useQuery<Category[], AxiosError<ErrorResponse>>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, 
});

export const useCategory = (id:number) => {
    return useQuery<Category , AxiosError<ErrorResponse>>({
        queryKey: ['category',id],
        queryFn: () => getCategoryById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id
    })
}

export const useCreateCategories = () => {
    const queryClient = useQueryClient();

    return useMutation<Category , AxiosError<ErrorResponse> , CategoryCreatePayload>({
        mutationFn: createCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey:['categories'] })
        },
    })
}

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<Category, AxiosError<ErrorResponse>, CategoryUpdatePayload>({
        mutationFn: ({id , ...payload}) => updateCategory(id,payload),
        onSuccess: (category) => {
            queryClient.invalidateQueries({ queryKey:['categories'] })
            queryClient.invalidateQueries({ queryKey:['category',category.id] })
        }
    })
}

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<Category, AxiosError<ErrorResponse>, {id: number}>({
        mutationFn: ({id}) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey:['categories'] })
        }
    })
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomer, getCustomerById, getCustomers, updateCustomer } from "../api/customer";
import { CreateCustomerPayload, Customer, UpdateCustomerPayload } from "../types/customer";
import { ErrorResponse } from "@/utils/errorMapping";
import { AxiosError } from "axios";

export const useCustomers = () => useQuery<Customer[], AxiosError<ErrorResponse>>({
    queryKey: ['customers'],
    queryFn: getCustomers,
});

export const useCustomer = (id: number) => useQuery<Customer, AxiosError<ErrorResponse>>({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
});

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation<Customer, AxiosError<ErrorResponse>, UpdateCustomerPayload>({
        mutationFn: ({ id, ...payload }) => updateCustomer(id, payload),
        onSuccess: (updatedCustomer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] });
        },
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation<Customer, AxiosError<ErrorResponse>, CreateCustomerPayload>({
        mutationFn: createCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}
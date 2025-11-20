import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomer, getCustomers, updateCustomer } from "../api/customer";
import { CreateCustomerPayload, Customer, UpdateCustomerPayload } from "../types/customer";

export const useCustomers = () => useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
});

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation<Customer, Error, UpdateCustomerPayload>({
        mutationFn: ({ id, ...payload }) => updateCustomer(id, payload),
        onSuccess: (updatedCustomer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] });
        },
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation<Customer, Error, CreateCustomerPayload>({
        mutationFn: createCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}
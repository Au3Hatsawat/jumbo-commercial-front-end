import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductStockPayload } from '../types/stock';
import { ICreateOrderDto, Order } from '../types/order';
import { createOrder, getOrders } from '../api/order';
import { createStockLog } from '../api/product';
import { Product } from '../types/product';

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation<Order, Error, ICreateOrderDto>({ 
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
            queryClient.invalidateQueries({ queryKey: ['stock-logs'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
};

export const useCreateStockLog = () => {
    const queryClient = useQueryClient();

    return useMutation<Product, Error, ProductStockPayload>({
        mutationFn: (({productId ,quantity ,note, stockType}) => createStockLog(productId , {quantity , note, stockType})),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
            queryClient.invalidateQueries({ queryKey: ['stock-logs'] }); 
        },
    });
};

export const useGetOrders = () => {
  return useQuery<Order[], Error>({
    queryKey: ['orders'], 
    queryFn: getOrders,
  });
};
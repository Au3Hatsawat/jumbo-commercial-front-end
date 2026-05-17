import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductStockPayload } from '../types/stock';
import { ICreateOrderDto, Order } from '../types/order';
import { createOrder, getOrderReceipt, getOrders } from '../api/order';
import { createStockLog } from '../api/product';
import { Product } from '../types/product';
import { ErrorResponse } from '@/utils/errorMapping';
import { AxiosError } from 'axios';

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation<Order, AxiosError<ErrorResponse>, ICreateOrderDto>({ 
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

    return useMutation<Product, AxiosError<ErrorResponse>, ProductStockPayload>({
        mutationFn: (({productId ,quantity ,note, stockType}) => createStockLog(productId , {quantity , note, stockType})),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
            queryClient.invalidateQueries({ queryKey: ['stock-logs'] }); 
        },
    });
};

export const useGetOrders = () => {
  return useQuery<Order[], AxiosError<ErrorResponse>>({
    queryKey: ['orders'], 
    queryFn: getOrders,
  });
};

export const usePrintReceipt = () => {
    return useMutation<Blob, AxiosError<ErrorResponse>, number>({
        mutationFn: (orderId: number) => getOrderReceipt(orderId),
    });
};
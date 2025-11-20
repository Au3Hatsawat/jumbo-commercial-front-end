import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, getProducts, restockProduct, updateProduct } from '../api/product';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../types/product';
import { ProductRestockPayload } from '../types/stock';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, 
  });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation<Product, Error, ProductCreatePayload>({
        mutationFn: createProduct, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation<Product, Error, ProductUpdatePayload>({
        mutationFn: ({ id, ...payload }) => updateProduct(id, payload),
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
            queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
        },
    });
};

export const useRestockProduct = () => {
    const queryClient = useQueryClient();
    
    const restockMutationFn = ({ productId, ...data }: ProductRestockPayload) => 
        restockProduct(productId, data);

    return useMutation<Product, Error, ProductRestockPayload>({
        mutationFn: restockMutationFn,
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); 
            queryClient.invalidateQueries({ queryKey: ['stock-logs'] });
            queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
        },
    });
};
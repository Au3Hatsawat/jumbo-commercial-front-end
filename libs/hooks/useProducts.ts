import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, createProductSellingUnit, getProductById, getProducts, restockProduct, updateProduct, uploadImage } from '../api/product';
import { IAddSellingUnitDto, Product, ProductCreatePayload, ProductSellingUnit, ProductUpdatePayload, SellingUnitUpdatePayload } from '../types/product';
import { ProductRestockPayload } from '../types/stock';
import { deleteProductSellingUnit, updateProductSellingUnit } from '../api/product-selling-unit';
import { ErrorResponse } from '@/utils/errorMapping';
import { AxiosError } from 'axios';

export const useProducts = () => {
    return useQuery<Product[], AxiosError<ErrorResponse>>({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5,
    });
};

export const useProduct = (id: number) => {
    return useQuery<Product, AxiosError<ErrorResponse>>({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id
    });
}

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation<Product, AxiosError<ErrorResponse>, ProductCreatePayload>({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUploadImage = () => {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, AxiosError<ErrorResponse>, { id: number, file: File, action?: "1" | "2", productSellingUnitId?: number }>({
        mutationFn: uploadImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        }
    })
}

export const useUpdateSellingUnit = () => {
    const queryClient = useQueryClient();

    return useMutation<ProductSellingUnit, AxiosError<ErrorResponse>, SellingUnitUpdatePayload>({
        mutationFn: ({ id, ...payload }) => updateProductSellingUnit(id, payload),
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
        }
    })
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation<Product, AxiosError<ErrorResponse>, ProductUpdatePayload>({
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

    return useMutation<Product, AxiosError<ErrorResponse>, ProductRestockPayload>({
        mutationFn: restockMutationFn,
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stock-logs'] });
            queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
        },
    });
};

export const useAddSellingUnit = () => {
    const queryClient = useQueryClient();

    return useMutation<ProductSellingUnit, AxiosError<ErrorResponse>, { productId: number; data: IAddSellingUnitDto }>({
        mutationFn: ({ productId, data }) => createProductSellingUnit(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
        }
    });
};

export const useDeleteSellingUnit = () => {
    const queryClient = useQueryClient();

    return useMutation<ProductSellingUnit , AxiosError<ErrorResponse>, { id: number; productId: number;}>({
        mutationFn: ({id}) => deleteProductSellingUnit(id),
        onSuccess: (_, variable) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variable.productId]});
        }
    })
}
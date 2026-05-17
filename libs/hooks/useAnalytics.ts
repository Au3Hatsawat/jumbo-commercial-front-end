import { useQuery } from '@tanstack/react-query';
import { CategoryDistribution, DashboardSummary, PaymentDistribution, TopCustomer, TopProduct } from '../types/analytic';
import { getCategoryDistribution, getDashboardSummary, getPaymentDistribution, getTopCustomers, getTopProducts } from '../api/analytic';
import { ErrorResponse } from '@/utils/errorMapping';
import { AxiosError } from 'axios';

export const useDashboardSummary = (days: number = 30) => {
  return useQuery<DashboardSummary[], AxiosError<ErrorResponse>>({
    queryKey: ['analytics', 'summary', days], 
    queryFn: () => getDashboardSummary(days),
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
  });
};

export const useTopProducts = () => {
  return useQuery<TopProduct[], AxiosError<ErrorResponse>>({
    queryKey: ['analytics', 'top-products'],
    queryFn: getTopProducts,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryDistribution = (days: number = 30) => {
  return useQuery<CategoryDistribution[], AxiosError<ErrorResponse>>({
    queryKey: ['analytics', 'category-distribution', days],
    queryFn: () => getCategoryDistribution(days),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePaymentDistribution = (days: number = 30) => {
  return useQuery<PaymentDistribution[], AxiosError<ErrorResponse>>({
    queryKey: ['analytics', 'payment-distribution', days],
    queryFn: () => getPaymentDistribution(days),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useTopCustomers = () => {
  return useQuery<TopCustomer[], AxiosError<ErrorResponse>>({
    queryKey: ['analytics', 'top-customers'],
    queryFn: getTopCustomers,
    staleTime: 1000 * 60 * 5,
  });
};
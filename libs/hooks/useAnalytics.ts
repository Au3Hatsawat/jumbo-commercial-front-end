import { useQuery } from '@tanstack/react-query';
import { CategoryDistribution, DashboardSummary, TopProduct } from '../types/analytic';
import { getCategoryDistribution, getDashboardSummary, getTopProducts } from '../api/analytic';

export const useDashboardSummary = (days: number = 30) => {
  return useQuery<DashboardSummary[], Error>({
    queryKey: ['analytics', 'summary', days], 
    queryFn: () => getDashboardSummary(days),
    staleTime: 1000 * 60 * 5, // cache 5 นาที เพราะข้อมูล Analytics ไม่ได้เปลี่ยนระดับวินาที
    refetchOnWindowFocus: false, // ไม่ต้องดึงใหม่ทุกครั้งที่สลับจอ (Optional)
  });
};

export const useTopProducts = () => {
  return useQuery<TopProduct[], Error>({
    queryKey: ['analytics', 'top-products'],
    queryFn: getTopProducts,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryDistribution = (days: number = 30) => {
  return useQuery<CategoryDistribution[], Error>({
    queryKey: ['analytics', 'category-distribution', days],
    queryFn: () => getCategoryDistribution(days),
    staleTime: 1000 * 60 * 5,
  });
};
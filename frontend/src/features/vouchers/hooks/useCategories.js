import { getCategories } from '../api/vouchers.api';
import { useQuery } from '@tanstack/react-query';
// Hook lấy danh sách danh mục (Cache vô hạn)
export const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity, 
  });
  return query;
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminApi';

export const useUsers = (params) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => adminApi.getUsers(params),
    keepPreviousData: true,
  });
};

export const useToggleUserLock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId) => adminApi.toggleUserLock(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

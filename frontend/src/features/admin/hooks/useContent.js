import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminApi';

export function useContent(type) {
  return useQuery({ queryKey: ['adminContent', type], queryFn: () => adminApi.getContent(type) });
}

function useContentMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['adminContent', variables.type] }),
  });
}

export const useCreateContent = () => useContentMutation(({ type, data }) => adminApi.createContent(type, data));
export const useUpdateContent = () => useContentMutation(({ type, id, data }) => adminApi.updateContent(type, id, data));
export const useDeleteContent = () => useContentMutation(({ type, id }) => adminApi.deleteContent(type, id));

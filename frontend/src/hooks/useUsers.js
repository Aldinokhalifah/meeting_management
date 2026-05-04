import { useQuery } from '@tanstack/react-query'
import { searchUsers } from '@/services/user'

export const useSearchUsers = (keyword) => {
    return useQuery({
        queryKey: ['users-search', keyword],
        queryFn: () => searchUsers(keyword),
        enabled: !!keyword && keyword.length >= 2,
        staleTime: 1000 * 60 * 5,
        select: (data) => data.data,
    })
}
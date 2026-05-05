import fetchClient from '@/lib/fetchClient';

export const searchUsers = async (keyword) => {
    return await fetchClient(`/users/search?q=${encodeURIComponent(keyword)}`);
}

export const updateProfile = async ({ name, email, avatar_url }) => {
    return await fetchClient('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, email, avatar_url }),
    });
}

export const updatePassword = async ({ current_password, new_password }) => {
    return await fetchClient('/users/password', {
        method: 'PATCH',
        body: JSON.stringify({ current_password, new_password }),
    });
}
import fetchClient from "@/lib/fetchClient";

export const searchUsers = async (keyword) => {
    return await fetchClient(`/users/search?q=${encodeURIComponent(keyword)}`);
}
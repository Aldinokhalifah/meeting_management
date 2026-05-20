import fetchClient from "@/lib/fetchClient";

export const register = async ({ name, email, password, whatsapp_phone }) => {
    return await fetchClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, whatsapp_phone }),
    });
}

export const login = async ({ email, password }) => {
    const data = await fetchClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data?.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Simpan ke cookie untuk middleware
        document.cookie = `token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }

    return data;
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Hapus cookie
    document.cookie = 'token=; path=/; max-age=0';

    window.location.href = '/login';
}
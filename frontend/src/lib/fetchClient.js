const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchClient = async (endpoint, options = {}) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Kalau 401, token expired → hapus token & redirect ke login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
    }

    const data = await response.json();

    // Kalau response tidak ok, throw error dengan message dari backend
    if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
    }

    return data;
}

export default fetchClient;
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

    const data = await response.json();

    if (!response.ok) {
        // Token expired pada request terautentikasi → redirect ke login
        if (response.status === 401 && token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; max-age=0';
            window.location.href = '/Login';
            return;
        }
        throw new Error(data.message || 'Terjadi kesalahan');
    }

    return data;
}

export default fetchClient;
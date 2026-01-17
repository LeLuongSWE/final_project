import api from '../api/axiosClient';

export const authService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        console.log('AUTH SERVICE - API Response:', response.data);
        console.log('AUTH SERVICE - User from response:', response.data.user);
        if (response.data.token && response.data.user) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('AUTH SERVICE - Saved to localStorage');
        }
        return response.data;
    },

    async register(username, password, fullName) {
        const response = await api.post('/auth/register', {
            username,
            password,
            fullName,
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },
};

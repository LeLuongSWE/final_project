import api from '../api/axiosClient';

export const userService = {
    // Get current user profile
    async getProfile() {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Update user profile
    async updateProfile(data) {
        const response = await api.put('/users/me', data);
        return response.data;
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        const response = await api.put('/users/me/password', { currentPassword, newPassword });
        return response.data;
    },

    // Get all addresses
    async getAddresses() {
        const response = await api.get('/users/me/addresses');
        return response.data;
    },

    // Create new address
    async createAddress(data) {
        const response = await api.post('/users/me/addresses', data);
        return response.data;
    },

    // Update address
    async updateAddress(addressId, data) {
        const response = await api.put(`/users/me/addresses/${addressId}`, data);
        return response.data;
    },

    // Delete address
    async deleteAddress(addressId) {
        const response = await api.delete(`/users/me/addresses/${addressId}`);
        return response.data;
    },

    // Set default address
    async setDefaultAddress(addressId) {
        const response = await api.put(`/users/me/addresses/${addressId}/default`);
        return response.data;
    }
};

export default userService;

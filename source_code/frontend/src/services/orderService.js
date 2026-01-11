import api from '../api/axiosClient';

export const orderService = {
    async createOrder(orderData) {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    async getUserOrders(userId) {
        const response = await api.get(`/orders/user/${userId}`);
        return response.data;
    },

    async getOrderById(orderId) {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    async getOrderStatus(orderId) {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    async getOrderByCode(orderCode) {
        const response = await api.get(`/orders/code/${orderCode}`);
        return response.data;
    },

    async updateOrderStatus(orderId, status) {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },
};

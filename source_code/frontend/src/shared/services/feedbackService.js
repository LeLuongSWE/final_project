import api from '../api/axiosClient';

const feedbackService = {
    // Customer endpoints
    createFeedback: async (orderId, rating, comment) => {
        const response = await api.post('/feedbacks', { orderId, rating, comment });
        return response.data;
    },

    getFeedbackByOrder: async (orderId) => {
        const response = await api.get(`/feedbacks/order/${orderId}`);
        return response.data;
    },

    getMyFeedbacks: async () => {
        const response = await api.get('/feedbacks/my');
        return response.data;
    },

    checkFeedbackExists: async (orderId) => {
        const response = await api.get(`/feedbacks/check/${orderId}`);
        return response.data;
    },

    // Admin endpoints
    getAllFeedbacks: async (startDate, endDate) => {
        let url = '/admin/feedbacks';
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    getFeedbackStats: async (startDate, endDate) => {
        const response = await api.get(`/admin/feedbacks/stats?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    }
};

export default feedbackService;

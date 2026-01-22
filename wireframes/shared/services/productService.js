import axiosClient from '../api/axiosClient';

const productService = {
    getAllProducts: async () => {
        const response = await axiosClient.get('/products');
        return response.data;
    },

    getProductById: async (id) => {
        const response = await axiosClient.get(`/products/${id}`);
        return response.data;
    },

    getProductsByCategory: async (category) => {
        const response = await axiosClient.get(`/products/category/${category}`);
        return response.data;
    },
};

export default productService;

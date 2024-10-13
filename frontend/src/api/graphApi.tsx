import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Adjust this to your backend URL

export const addVariable = async (name: string, value: any, hasDefault: boolean = true) => {
    try {
        const response = await axios.post(`${API_URL}/variables`, { name, value, hasDefault });
        return response.data;
    } catch (error) {
        console.error('Error adding variable:', error);
        throw error;
    }
};

export const removeVariable = async (name: string) => {
    try {
        const response = await axios.delete(`${API_URL}/variables/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error removing variable:', error);
        throw error;
    }
};

export const getVariables = async () => {
    try {
        const response = await axios.get(`${API_URL}/variables`);
        return response.data;
    } catch (error) {
        console.error('Error fetching variables:', error);
        throw error;
    }
};

export const updateVariable = async (name: string, value: any) => {
    try {
        const response = await axios.put(`${API_URL}/variables/${name}`, { value });
        return response.data;
    } catch (error) {
        console.error('Error updating variable:', error);
        throw error;
    }
};
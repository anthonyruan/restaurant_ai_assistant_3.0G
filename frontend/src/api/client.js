import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getTopDishes = () => client.get('/sales/top-dishes');
export const getCurrentWeather = () => client.get('/weather/current');
export const getForecast = () => client.get('/weather/forecast');
export const getHoliday = () => client.get('/holiday');

export const generateCaption = (mode, data) => client.post('/generate/caption', { mode, ...data });
export const generateImage = (mode, data) => client.post('/generate/image', { mode, ...data });
export const postToInstagram = (imageUrl, caption) => client.post('/instagram/post', { image_url: imageUrl, caption });

export const getImages = () => client.get('/images');
export const uploadImage = (formData) => client.post('/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (filename, dishName) => client.delete(`/images/${filename}?dish_name=${encodeURIComponent(dishName)}`);
export const updateImageCategory = (filename, oldDish, newDish) => client.put(`/images/${filename}/category`, { old_dish: oldDish, new_dish: newDish });

export const getSettings = () => client.get('/settings');
export const updateSettings = (settings) => client.post('/settings', settings);

export default client;

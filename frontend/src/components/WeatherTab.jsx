import React, { useEffect } from 'react';
import { getCurrentWeather, getForecast, generateCaption, generateImage } from '../api/client';
import ContentCard from './ContentCard';
import { CloudSun, Thermometer } from 'lucide-react';

const WeatherTab = ({ state, setState }) => {
    const { weather, forecast, caption, suggestedDish, imageUrl, loadingWeather, loadingCaption, loadingImage } = state;

    useEffect(() => {
        if (!weather) {
            fetchWeatherData();
        }
    }, []);

    const fetchWeatherData = async () => {
        try {
            const [currentRes, forecastRes] = await Promise.all([
                getCurrentWeather(),
                getForecast()
            ]);

            // We need to update state with data AND trigger generation if needed
            // But setState is async-ish in batching, so we can't rely on state immediately.
            // Let's use local variables for the logic.
            const weatherData = currentRes.data;
            const forecastData = forecastRes.data;

            setState(prev => ({
                ...prev,
                weather: weatherData,
                forecast: forecastData,
                loadingWeather: false
            }));

            if (weatherData) {
                handleGenerateContent(weatherData);
            }
        } catch (error) {
            console.error("Failed to fetch weather", error);
            setState(prev => ({ ...prev, loadingWeather: false }));
        }
    };

    const handleGenerateContent = (weatherData) => {
        handleGenerateCaption(weatherData);
    };

    const handleGenerateCaption = async (weatherData) => {
        setState(prev => ({ ...prev, loadingCaption: true }));
        try {
            const res = await generateCaption('weather', { weather_data: weatherData });
            const newCaption = res.data.caption;
            const newDish = res.data.dish_name;

            setState(prev => ({
                ...prev,
                caption: newCaption,
                suggestedDish: newDish,
                loadingCaption: false
            }));

            handleGenerateImage(newDish);
        } catch (error) {
            console.error(error);
            setState(prev => ({ ...prev, loadingCaption: false }));
        }
    };

    const handleGenerateImage = async (dishName) => {
        setState(prev => ({ ...prev, loadingImage: true }));
        try {
            // For weather mode, we now pass dish_name to get library image
            const res = await generateImage('weather', { dish_name: dishName });
            setState(prev => ({ ...prev, imageUrl: res.data.image_url, loadingImage: false }));
        } catch (error) {
            console.error(error);
            setState(prev => ({ ...prev, loadingImage: false }));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <CloudSun className="mr-2 text-blue-500" /> Current Weather
                    </h2>
                    {loadingWeather ? (
                        <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>
                    ) : weather ? (
                        <div className="bg-blue-50 p-6 rounded-xl text-center">
                            <div className="text-5xl font-bold text-blue-600 mb-2">{Math.round(weather.temp)}°F</div>
                            <div className="text-lg font-medium text-gray-700 capitalize">{weather.description}</div>
                        </div>
                    ) : (
                        <div className="text-red-500">Unavailable</div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Thermometer className="mr-2 text-orange-500" /> Tomorrow
                    </h2>
                    {forecast ? (
                        <div className="p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 capitalize">{forecast.description}</span>
                                <span className="font-bold text-gray-900">{Math.round(forecast.temp)}°F</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">Forecast unavailable</div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <ContentCard
                    title="Weather-Based Recommendation"
                    caption={caption}
                    imageUrl={imageUrl}
                    onRegenerateCaption={() => weather && handleGenerateCaption(weather)}
                    onRegenerateImage={() => caption && handleGenerateImage(caption)}
                    isLoadingCaption={loadingCaption}
                    isLoadingImage={loadingImage}
                />
            </div>
        </div>
    );
};

export default WeatherTab;

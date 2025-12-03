import React, { useState } from 'react';
import { TrendingUp, CloudSun, CalendarHeart } from 'lucide-react';
import SalesTab from '../components/SalesTab';
import WeatherTab from '../components/WeatherTab';
import HolidayTab from '../components/HolidayTab';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('sales');

    // Sales State
    const [salesState, setSalesState] = useState({
        dishes: [],
        selectedDish: null,
        caption: '',
        imageUrl: '',
        loadingDishes: true,
        loadingCaption: false,
        loadingImage: false
    });

    // Weather State
    const [weatherState, setWeatherState] = useState({
        weather: null,
        forecast: null,
        caption: '',
        suggestedDish: null,
        imageUrl: '',
        loadingWeather: true,
        loadingCaption: false,
        loadingImage: false
    });

    // Holiday State
    const [holidayState, setHolidayState] = useState({
        holiday: null,
        caption: '',
        imageUrl: '',
        loadingHoliday: true,
        loadingCaption: false,
        loadingImage: false
    });

    const tabs = [
        { id: 'sales', label: 'Sales Content', icon: TrendingUp },
        { id: 'weather', label: 'Weather Content', icon: CloudSun },
        { id: 'holiday', label: 'Holiday Content', icon: CalendarHeart },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                    Create Engaging Content
                </h1>
                <p className="text-lg text-gray-600">
                    Generate Instagram posts based on real-time data.
                </p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'sales' && (
                        <SalesTab
                            state={salesState}
                            setState={setSalesState}
                        />
                    )}
                    {activeTab === 'weather' && (
                        <WeatherTab
                            state={weatherState}
                            setState={setWeatherState}
                        />
                    )}
                    {activeTab === 'holiday' && (
                        <HolidayTab
                            state={holidayState}
                            setState={setHolidayState}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;

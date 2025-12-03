import React, { useEffect } from 'react';
import { getHoliday, generateCaption, generateImage } from '../api/client';
import ContentCard from './ContentCard';
import { CalendarHeart } from 'lucide-react';

const HolidayTab = ({ state, setState }) => {
    const { holiday, caption, imageUrl, loadingHoliday, loadingCaption, loadingImage } = state;

    useEffect(() => {
        if (!holiday) {
            fetchHolidayData();
        }
    }, []);

    const fetchHolidayData = async () => {
        try {
            const res = await getHoliday();
            const holidayData = res.data;
            setState(prev => ({ ...prev, holiday: holidayData, loadingHoliday: false }));

            if (holidayData) {
                handleGenerateContent(holidayData.message);
            }
        } catch (error) {
            console.error("Failed to fetch holiday", error);
            setState(prev => ({ ...prev, loadingHoliday: false }));
        }
    };

    const handleGenerateContent = (message) => {
        handleGenerateCaption(message);
    };

    const handleGenerateCaption = async (message) => {
        setState(prev => ({ ...prev, loadingCaption: true }));
        try {
            const res = await generateCaption('holiday', { holiday_message: message });
            const newCaption = res.data.caption;
            setState(prev => ({ ...prev, caption: newCaption, loadingCaption: false }));
            handleGenerateImage(newCaption);
        } catch (error) {
            console.error(error);
            setState(prev => ({ ...prev, loadingCaption: false }));
        }
    };

    const handleGenerateImage = async (captionText) => {
        setState(prev => ({ ...prev, loadingImage: true }));
        try {
            const res = await generateImage('holiday', { caption: captionText });
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
                        <CalendarHeart className="mr-2 text-pink-500" /> Upcoming Holiday
                    </h2>
                    {loadingHoliday ? (
                        <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>
                    ) : holiday ? (
                        <div className="bg-pink-50 p-6 rounded-xl">
                            <p className="text-lg font-medium text-pink-800">{holiday.message}</p>
                        </div>
                    ) : (
                        <div className="text-gray-500">No holiday info</div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <ContentCard
                    title="Holiday Special"
                    caption={caption}
                    imageUrl={imageUrl}
                    onRegenerateCaption={() => holiday && handleGenerateCaption(holiday.message)}
                    onRegenerateImage={() => caption && handleGenerateImage(caption)}
                    isLoadingCaption={loadingCaption}
                    isLoadingImage={loadingImage}
                />
            </div>
        </div>
    );
};

export default HolidayTab;

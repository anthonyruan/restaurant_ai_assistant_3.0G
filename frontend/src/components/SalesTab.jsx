import React, { useEffect } from 'react';
import { getTopDishes, generateCaption, generateImage } from '../api/client';
import ContentCard from './ContentCard';
import { Trophy } from 'lucide-react';

const SalesTab = ({ state, setState }) => {
    const { dishes, selectedDish, caption, imageUrl, loadingDishes, loadingCaption, loadingImage } = state;

    useEffect(() => {
        if (dishes.length === 0) {
            fetchDishes();
        }
    }, []);

    const fetchDishes = async () => {
        try {
            const res = await getTopDishes();
            setState(prev => ({ ...prev, dishes: res.data, loadingDishes: false }));
            if (res.data.length > 0) {
                // Initial selection, trigger generation
                handleSelectDish(res.data[0], true);
            }
        } catch (error) {
            console.error("Failed to fetch dishes", error);
            setState(prev => ({ ...prev, loadingDishes: false }));
        }
    };

    const handleSelectDish = async (dish, forceGenerate = false) => {
        // If selecting the same dish and we already have content, do nothing unless forced
        if (!forceGenerate && selectedDish?.name === dish.name && (caption || imageUrl)) {
            return;
        }

        setState(prev => ({ ...prev, selectedDish: dish }));

        // Trigger generation
        handleGenerateCaption(dish.name);
        handleGenerateImage(dish.name);
    };

    const handleGenerateCaption = async (dishName) => {
        setState(prev => ({ ...prev, loadingCaption: true }));
        try {
            const res = await generateCaption('sales', { dish_name: dishName });
            setState(prev => ({ ...prev, caption: res.data.caption, loadingCaption: false }));
        } catch (error) {
            console.error(error);
            setState(prev => ({ ...prev, loadingCaption: false }));
        }
    };

    const handleGenerateImage = async (dishName) => {
        setState(prev => ({ ...prev, loadingImage: true }));
        try {
            const res = await generateImage('sales', { dish_name: dishName });
            setState(prev => ({ ...prev, imageUrl: res.data.image_url, loadingImage: false }));
        } catch (error) {
            console.error(error);
            setState(prev => ({ ...prev, loadingImage: false }));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Trophy className="mr-2 text-yellow-500" /> Top Sellers
                    </h2>
                    {loadingDishes ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dishes.map((dish, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectDish(dish, true)} // Clicking manually forces regeneration
                                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedDish?.name === dish.name
                                        ? 'border-primary bg-blue-50'
                                        : 'border-transparent hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">{dish.name}</span>
                                        <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-500 shadow-sm">
                                            {dish.sold} sold
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Content Generator */}
            <div className="lg:col-span-2">
                <ContentCard
                    title={selectedDish ? `Promote: ${selectedDish.name}` : 'Select a dish'}
                    caption={caption}
                    imageUrl={imageUrl}
                    onRegenerateCaption={() => selectedDish && handleGenerateCaption(selectedDish.name)}
                    onRegenerateImage={() => selectedDish && handleGenerateImage(selectedDish.name)}
                    isLoadingCaption={loadingCaption}
                    isLoadingImage={loadingImage}
                />
            </div>
        </div>
    );
};

export default SalesTab;

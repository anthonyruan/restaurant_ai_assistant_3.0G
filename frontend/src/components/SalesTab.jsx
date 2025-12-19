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

        // Reset variant when switching dishes
        setState(prev => ({ ...prev, selectedDish: dish, dishVariant: '' }));

        // Trigger generation (initially without variant)
        handleGenerateCaption(dish.name);
        handleGenerateImage(dish.name); // This will call with "" variant initially, which is fine
    };

    const handleGenerateCaption = async (dishName) => {
        setState(prev => ({ ...prev, loadingCaption: true }));
        const fullDishName = state.dishVariant ? `${state.dishVariant} ${dishName}` : dishName;
        try {
            const res = await generateCaption('sales', { dish_name: fullDishName });
            setState(prev => ({ ...prev, caption: res.data.caption, loadingCaption: false }));
        } catch (error) {
            console.error(error);
            setState(prev => ({ ...prev, loadingCaption: false }));
        }
    };

    const handleGenerateImage = async (dishName) => {
        setState(prev => ({ ...prev, loadingImage: true }));
        const fullDishName = state.dishVariant ? `${state.dishVariant} ${dishName}` : dishName;
        try {
            const res = await generateImage('sales', { dish_name: fullDishName });
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
                            {dishes.map((dish, index) => {
                                const isSelected = selectedDish?.name === dish.name;
                                return (
                                    <div
                                        key={index}
                                        onClick={() => !isSelected && handleSelectDish(dish, true)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${isSelected
                                            ? 'border-primary bg-blue-50'
                                            : 'border-transparent hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-gray-800">{dish.name}</span>
                                            <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-500 shadow-sm">
                                                {dish.sold} sold
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <div onClick={(e) => e.stopPropagation()} className="mt-2 animate-fade-in">
                                                <input
                                                    type="text"
                                                    placeholder="Specify type (e.g., Chicken, Tofu)..."
                                                    value={state.dishVariant}
                                                    onChange={(e) => setState(prev => ({ ...prev, dishVariant: e.target.value }))}
                                                    className="w-full text-sm border border-blue-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleGenerateCaption(dish.name);
                                                            handleGenerateImage(dish.name);
                                                        }
                                                    }}
                                                />
                                                <p className="text-xs text-blue-500 mt-1">Press Enter to regenerate with details</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Content Generator */}
            <div className="lg:col-span-2">
                <ContentCard
                    title={selectedDish ? `Promote: ${state.dishVariant ? state.dishVariant + ' ' : ''}${selectedDish.name}` : 'Select a dish'}
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

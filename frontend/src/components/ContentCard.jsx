import React, { useState } from 'react';
import { RefreshCw, Instagram, Edit2, Check, X } from 'lucide-react';
import { postToInstagram } from '../api/client';

const ContentCard = ({
    title,
    caption,
    imageUrl,
    onRegenerateCaption,
    onRegenerateImage,
    isLoadingCaption,
    isLoadingImage
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCaption, setEditedCaption] = useState(caption);
    const [isPosting, setIsPosting] = useState(false);
    const [postStatus, setPostStatus] = useState(null); // 'success' | 'error'

    const handlePost = async () => {
        if (!imageUrl || !caption) return;
        setIsPosting(true);
        setPostStatus(null);
        try {
            const finalCaption = isEditing ? editedCaption : caption;
            await postToInstagram(imageUrl, finalCaption);
            setPostStatus('success');
            setTimeout(() => setPostStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setPostStatus('error');
        } finally {
            setIsPosting(false);
        }
    };

    // Sync edited caption when prop changes (if not editing)
    React.useEffect(() => {
        if (!isEditing) setEditedCaption(caption);
    }, [caption, isEditing]);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            </div>

            <div className="p-6 flex-grow flex flex-col space-y-6">
                {/* Caption Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Caption</label>
                        <div className="flex space-x-2">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
                                    <button onClick={() => { setIsEditing(false); setEditedCaption(caption); }} className="text-red-500 hover:text-red-600"><X size={16} /></button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary"><Edit2 size={16} /></button>
                            )}
                            <button
                                onClick={onRegenerateCaption}
                                disabled={isLoadingCaption}
                                className={`text-gray-400 hover:text-primary ${isLoadingCaption ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[120px]"
                        />
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap min-h-[120px]">
                            {caption || <span className="text-gray-400 italic">No caption generated yet...</span>}
                        </div>
                    )}
                </div>

                {/* Image Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</label>
                        <button
                            onClick={onRegenerateImage}
                            disabled={isLoadingImage}
                            className={`text-gray-400 hover:text-primary ${isLoadingImage ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Generated content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                {isLoadingImage ? 'Generating...' : 'No image generated'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={handlePost}
                    disabled={isPosting || !imageUrl || !caption}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all shadow-lg ${postStatus === 'success' ? 'bg-green-500 hover:bg-green-600' :
                            postStatus === 'error' ? 'bg-red-500 hover:bg-red-600' :
                                'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isPosting ? (
                        <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                    ) : postStatus === 'success' ? (
                        <>Posted Successfully! <Check className="ml-2 h-5 w-5" /></>
                    ) : postStatus === 'error' ? (
                        <>Failed to Post <X className="ml-2 h-5 w-5" /></>
                    ) : (
                        <>Post to Instagram <Instagram className="ml-2 h-5 w-5" /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ContentCard;

import React, { useEffect, useState } from 'react';
import { getImages, uploadImage, deleteImage } from '../api/client';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';

const ImageLibrary = () => {
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dishNameInput, setDishNameInput] = useState('');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await getImages();
            setImages(res.data);
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            // Upload sequentially or parallel?
            // API handles one file per request currently based on my route logic?
            // Wait, my route logic: file = request.files['image'] -> singular.
            // So I need to loop here.

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('dish_name', dishNameInput || 'Uncategorized');
                await uploadImage(formData);
            }

            // Refresh
            await fetchImages();
            setSelectedFiles([]);
            setDishNameInput('');
            alert('Upload successful!');
        } catch (error) {
            console.error("Upload failed", error);
            alert('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename, dishName) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await deleteImage(filename, dishName);
            await fetchImages();
        } catch (error) {
            console.error("Delete failed", error);
            alert('Failed to delete image.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Library</h1>

            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Upload className="mr-2 text-primary" /> Upload New Images
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name (Category)</label>
                            <input
                                type="text"
                                value={dishNameInput}
                                onChange={(e) => setDishNameInput(e.target.value)}
                                placeholder="e.g., Pho, Banh Mi"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading || selectedFiles.length === 0}
                            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Upload Images'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Gallery Section */}
            <div className="space-y-8">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading library...</div>
                ) : Object.keys(images).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">No images found. Upload some to get started!</p>
                    </div>
                ) : (
                    Object.entries(images).map(([dishName, fileList]) => (
                        <div key={dishName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800">{dishName} <span className="text-sm font-normal text-gray-500">({fileList.length})</span></h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {fileList.map((filename) => (
                                    <div key={filename} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={`http://127.0.0.1:5000/static/images/dishes/${filename}`}
                                            alt={dishName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => handleDelete(filename, dishName)}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                title="Delete Image"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ImageLibrary;

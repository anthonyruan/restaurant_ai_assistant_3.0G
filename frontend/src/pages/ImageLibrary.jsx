import React, { useEffect, useState } from 'react';
import { getImages, uploadImage, deleteImage, updateImageCategory } from '../api/client';
import { Trash2, Upload, Image as ImageIcon, Edit2, Eye, X } from 'lucide-react';

const ImageLibrary = () => {
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dishNameInput, setDishNameInput] = useState('');

    const [editingImage, setEditingImage] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpdateCategory = async () => {
        if (!editingImage || !newCategory) return;

        try {
            await updateImageCategory(editingImage.public_id, editingImage.oldDish, newCategory);
            setEditingImage(null);
            setNewCategory('');
            await fetchImages();
            alert('Category updated!');
        } catch (error) {
            console.error("Update failed", error);
            alert('Failed to update category.');
        }
    };

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

    const [stagedFiles, setStagedFiles] = useState([]);

    // ... useEffect ...

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            const newStagedFiles = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                previewUrl: URL.createObjectURL(file),
                dishName: '',
                selected: true
            }));
            setStagedFiles(prev => [...prev, ...newStagedFiles]);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newStagedFiles = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            previewUrl: URL.createObjectURL(file),
            dishName: '', // Default empty, user must set
            selected: true
        }));
        setStagedFiles(prev => [...prev, ...newStagedFiles]);
        // Reset input
        e.target.value = '';
    };

    const updateStagedFileDishName = (id, name) => {
        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, dishName: name } : f));
    };

    const toggleStagedFileSelection = (id) => {
        setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
    };

    const removeStagedFile = (id) => {
        setStagedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleBulkApply = (name) => {
        setStagedFiles(prev => prev.map(f => f.selected ? { ...f, dishName: name } : f));
    };

    const handleConfirmUpload = async () => {
        const filesToUpload = stagedFiles.filter(f => f.dishName.trim() !== '');
        if (filesToUpload.length === 0) {
            alert("Please assign a Dish Name to at least one file.");
            return;
        }

        setUploading(true);
        try {
            let successCount = 0;
            for (const item of filesToUpload) {
                const formData = new FormData();
                formData.append('image', item.file);
                formData.append('dish_name', item.dishName);

                try {
                    await uploadImage(formData);
                    successCount++;
                } catch (e) {
                    console.error(`Failed to upload ${item.file.name}`, e);
                }
            }

            alert(`Successfully uploaded ${successCount} images!`);
            setStagedFiles([]); // Clear staging
            await fetchImages(); // Refresh library
        } catch (error) {
            console.error("Batch upload critical failure", error);
            alert('Batch upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (publicId, dishName) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await deleteImage(publicId, dishName);
            await fetchImages();
        } catch (error) {
            console.error("Delete failed", error);
            alert('Failed to delete image.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Library</h1>

            {/* Upload / Staging Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Upload className="mr-2 text-primary" />
                    {stagedFiles.length > 0 ? `Batch Edit (${stagedFiles.length} files)` : 'Upload New Images'}
                </h2>

                {stagedFiles.length === 0 ? (
                    /* Initial Select Mode */
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-600 font-medium">Click to select files or drag & drop here</p>
                            <p className="text-sm text-gray-500 mt-1">Select multiple files (Pho, Banh Mi, etc.) to sort them later</p>
                        </label>
                    </div>
                ) : (
                    /* Staging / Sort Mode */
                    <div>
                        {/* Bulk Tools */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-lg items-end sm:items-center">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Rename Selected</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g., Pho"
                                        list="dish-names"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        id="bulk-name-input"
                                    />
                                    <button
                                        onClick={() => {
                                            const val = document.getElementById('bulk-name-input').value;
                                            if (val) handleBulkApply(val);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 text-sm text-gray-500">
                                <span>{stagedFiles.filter(f => f.selected).length} selected</span>
                                <button onClick={() => setStagedFiles(prev => prev.map(f => ({ ...f, selected: true })))} className="text-blue-600 hover:underline">Select All</button>
                                <button onClick={() => setStagedFiles(prev => prev.map(f => ({ ...f, selected: false })))} className="text-blue-600 hover:underline">Select None</button>
                            </div>
                        </div>

                        {/* Staged Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 max-h-[500px] overflow-y-auto p-2">
                            {stagedFiles.map((item) => (
                                <div key={item.id} className={`relative border rounded-lg p-2 ${item.selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                    <div className="absolute top-2 left-2 z-10">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => toggleStagedFileSelection(item.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeStagedFile(item.id)}
                                        className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-sm hover:text-red-500 text-gray-400"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-2">
                                        <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                                    </div>

                                    <input
                                        type="text"
                                        value={item.dishName}
                                        onChange={(e) => updateStagedFileDishName(item.id, e.target.value)}
                                        placeholder="Dish Name..."
                                        list="dish-names"
                                        className={`w-full border rounded px-2 py-1 text-xs ${item.dishName ? 'border-gray-300' : 'border-red-300 bg-red-50'}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t pt-4">
                            <button
                                onClick={() => setStagedFiles([])}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmUpload}
                                disabled={uploading}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-all text-sm flex items-center"
                            >
                                {uploading ? 'Uploading...' : `Confirm Upload (${stagedFiles.length} files)`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Datalist for Autocomplete */}
                <datalist id="dish-names">
                    {Object.keys(images).map(name => (
                        <option key={name} value={name} />
                    ))}
                </datalist>
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
                                {fileList.map((image) => (
                                    <div key={image.public_id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={image.url}
                                            alt={dishName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2 backdrop-blur-[1px]">
                                            <button
                                                onClick={() => setViewingImage(image)}
                                                className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                                                title="View Full Size"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingImage({ ...image, oldDish: dishName });
                                                    setNewCategory(dishName);
                                                }}
                                                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                                                title="Edit Category"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(image.public_id, dishName)}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
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
            {/* Edit Category Modal */}
            {editingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Edit Image Category</h3>
                        <div className="mb-4">
                            <img src={editingImage.url} alt="preview" className="w-full h-48 object-cover rounded-lg mb-4" />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name (Category)</label>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                list="dish-names"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingImage(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Full Image Modal */}
            {viewingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setViewingImage(null)}>
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setViewingImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={viewingImage.url}
                        alt="full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;

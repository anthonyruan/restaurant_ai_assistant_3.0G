import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/client';
import { Save, Hash } from 'lucide-react';

const Settings = () => {
    const [hashtags, setHashtags] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await getSettings();
            setHashtags(res.data.hashtags);
        } catch (error) {
            console.error("Failed to fetch settings", error);
            setMessage({ type: 'error', text: 'Failed to load settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await updateSettings({ hashtags });
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            console.error("Failed to save settings", error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Settings</h1>
                <p className="text-gray-600">Manage your application preferences.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Hash className="mr-2 text-blue-500" size={20} /> Hashtag Configuration
                    </h2>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSave}>
                        <div className="mb-6">
                            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
                                Default Hashtags
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                These hashtags will be automatically appended to all generated captions.
                            </p>
                            <textarea
                                id="hashtags"
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                placeholder="#example #food #delicious"
                            />
                        </div>

                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="mr-2" size={18} />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;

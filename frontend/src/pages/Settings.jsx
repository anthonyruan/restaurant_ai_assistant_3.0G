import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/client';
import { Save, Hash } from 'lucide-react';

const Settings = () => {
    const [hashtags, setHashtags] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [newToken, setNewToken] = useState(null);
    const [newTokenExpires, setNewTokenExpires] = useState(null);
    const [tokenStatus, setTokenStatus] = useState(null);

    useEffect(() => {
        fetchSettings();
        checkTokenStatus();
    }, []);

    const checkTokenStatus = async () => {
        try {
            const { getInstagramTokenStatus } = await import('../api/client');
            const res = await getInstagramTokenStatus();
            if (res.data.success) {
                setTokenStatus(res.data);
            }
        } catch (error) {
            console.error("Failed to check token status", error);
        }
    };

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

    const handleRefreshToken = async () => {
        setRefreshing(true);
        setMessage(null);
        setNewToken(null);
        try {
            const { refreshInstagramToken } = await import('../api/client');
            const res = await refreshInstagramToken();
            if (res.data.success) {
                setNewToken(res.data.access_token);
                setNewTokenExpires(res.data.expires_in);
                setMessage({ type: 'success', text: 'Token refreshed successfully! Please copy the new token below.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to refresh token: ' + res.data.error });
            }
        } catch (error) {
            console.error("Failed to refresh token", error);
            setMessage({ type: 'error', text: 'Failed to refresh token. Is your current token already expired?' });
        } finally {
            setRefreshing(false);
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

            {/* Instagram Token Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span className="mr-2 text-pink-500">📸</span> Instagram Token Management
                    </h2>
                </div>
                <div className="p-6">
                    {tokenStatus && (
                        <div className={`mb-6 p-4 rounded-lg border ${tokenStatus.is_valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h3 className={`text-sm font-bold ${tokenStatus.is_valid ? 'text-green-800' : 'text-red-800'} mb-1`}>
                                Current Token Status: {tokenStatus.is_valid ? 'Active ✅' : 'Expired ❌'}
                            </h3>
                            {tokenStatus.is_valid ? (
                                <p className="text-sm text-green-700">
                                    Expires in: <span className="font-bold">{tokenStatus.days_left} days</span> (on {new Date(tokenStatus.expires_at * 1000).toLocaleDateString()})
                                </p>
                            ) : (
                                <p className="text-sm text-red-700">
                                    Your token has expired. Please refresh it immediately.
                                </p>
                            )}
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mb-4">
                        Instagram tokens expire every 60 days. Use this button to refresh your token before it expires.
                        <br />
                        <span className="font-bold text-red-500">Important:</span> After refreshing, you must manually update the <code>IG_ACCESS_TOKEN</code> in your Render Dashboard.
                    </p>

                    <button
                        onClick={handleRefreshToken}
                        disabled={refreshing}
                        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 mb-4"
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh Token Now'}
                    </button>

                    {newToken && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                            <h3 className="text-sm font-bold text-yellow-800 mb-2">New Token Generated!</h3>
                            <p className="text-xs text-yellow-700 mb-2">Copy this token and paste it into your Render Environment Variables:</p>
                            <div className="flex items-center">
                                <code className="flex-1 bg-white border border-gray-200 p-2 rounded text-xs break-all font-mono">
                                    {newToken}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(newToken)}
                                    className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Expires in: {(newTokenExpires / 86400).toFixed(1)} days</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;

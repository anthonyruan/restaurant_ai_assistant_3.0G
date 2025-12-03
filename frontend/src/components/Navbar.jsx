import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Image as ImageIcon } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <UtensilsCrossed className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">
                                Restaurant AI <span className="text-primary">Assistant</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/images"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/images'
                                ? 'text-primary bg-blue-50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Image Library
                        </Link>
                        <Link
                            to="/settings"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/settings'
                                ? 'text-primary bg-blue-50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Settings
                        </Link>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            U
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

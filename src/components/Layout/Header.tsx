import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onSettingsClick }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 lg:px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between ml-16 lg:ml-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 lg:mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search todos..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-gray-50/50 transition-all"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* Settings */}
            <button 
              onClick={onSettingsClick}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WelcomeMessageProps {
  userName: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ userName }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show welcome message after login
    setIsVisible(true);
    
    // Auto hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-lg border border-green-400 animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg">👋</span>
          </div>
          <div>
            <p className="font-semibold">Welcome back!</p>
            <p className="text-sm text-green-100">{userName}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeMessage;
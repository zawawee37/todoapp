import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, LogOut, Menu, X, User, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  logout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, logout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'todos', label: 'Todos', icon: CheckSquare, color: 'text-green-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-600' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-purple-600' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200"
      >
        {isOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:flex lg:flex-col
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">TodoApp</h1>
                <p className="text-slate-300 text-sm font-medium">Task Management System</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-300 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-5 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
              Navigation
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-white to-gray-50 text-slate-900 shadow-lg transform scale-105' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-105'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? item.color : 'group-hover:text-white'}`} />
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-5 border-t border-slate-700/50">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-4 px-4 py-3.5 text-slate-300 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
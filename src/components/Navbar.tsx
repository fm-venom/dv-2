import React from 'react';
import { Swords, Info, Calendar, Settings, LogOut } from 'lucide-react';
import { User } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const navItems = [
    { id: 'builds', name: 'Билды', icon: Swords },
    { id: 'information', name: 'Информация', icon: Info },
    { id: 'raids', name: 'Рейды', icon: Calendar },
  ];

  if (currentUser.isAdmin) {
    navItems.push({ id: 'admin', name: 'Админ панель', icon: Settings });
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 backdrop-blur-lg sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              Venom DV2
            </div>
            
            <div className="flex space-x-4">
              {navItems.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              Добро пожаловать, <span className="font-medium text-white">{currentUser.username}</span>
              {currentUser.isAdmin && (
                <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/25 animate-pulse">
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
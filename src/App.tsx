import React, { useState, useEffect } from 'react';
import { User, Notification as NotificationType } from './types';
import { storage } from './data/storage';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { Builds } from './components/Builds';
import { Information } from './components/Information';
import { Raids } from './components/Raids';
import { AdminPanel } from './components/AdminPanel';
import { Notification } from './components/Notification';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('builds');
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await storage.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    
    loadCurrentUser();
  }, []);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    await storage.setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await storage.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setCurrentUser(null);
    setActiveTab('builds');
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification: NotificationType = {
      id: Date.now().toString(),
      message,
      type,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} onNotification={addNotification} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'builds':
        return <Builds currentUser={currentUser} onNotification={addNotification} />;
      case 'information':
        return <Information />;
      case 'raids':
        return <Raids currentUser={currentUser} onNotification={addNotification} />;
      case 'admin':
        return currentUser.isAdmin ? (
          <AdminPanel currentUser={currentUser} onNotification={addNotification} />
        ) : null;
      default:
        return <Builds currentUser={currentUser} onNotification={addNotification} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-500/15 to-orange-500/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/15 to-yellow-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {renderActiveComponent()}
      </main>

      {/* Notifications */}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import { storage } from '../data/storage';
import { User as UserType } from '../types';

interface Props {
  onLogin: (user: UserType) => void;
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Login: React.FC<Props> = ({ onLogin, onNotification }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistering) {
      if (password !== confirmPassword) {
        onNotification('Пароли не совпадают', 'error');
        return;
      }

      const users = storage.getUsers();
      if (users.some(u => u.username === username)) {
        onNotification('Пользователь с таким именем уже существует', 'error');
        return;
      }

      const newUser: UserType = {
        id: Date.now().toString(),
        username,
        password,
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      storage.saveUsers(users);
      onNotification('Регистрация успешна', 'success');
      setIsRegistering(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      const users = storage.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        onLogin(user);
        onNotification('Добро пожаловать!', 'success');
      } else {
        onNotification('Неверные данные для входа', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20 w-full max-w-md relative z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/25 animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4 animate-pulse">
              Venom DV2
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              {isRegistering ? 'Регистрация' : 'Вход в систему'}
            </h1>
            <p className="text-gray-400">
              {isRegistering ? 'Создайте новый аккаунт' : 'Войдите в свой аккаунт'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
                placeholder="Введите имя пользователя"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
                placeholder="Введите пароль"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 focus:bg-gray-800"
                  placeholder="Подтвердите пароль"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 flex items-center justify-center transform hover:scale-105 shadow-lg shadow-red-500/25"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-orange-400 hover:text-orange-300 transition-all duration-200 hover:underline"
            >
              {isRegistering 
                ? 'Уже есть аккаунт? Войти' 
                : 'Нет аккаунта? Зарегистрироваться'
              }
            </button>
          </div>

          {!isRegistering && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-400 bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                Напишите Администратору если не смогли войти @fm666venom
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
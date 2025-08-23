import React, { useEffect, useState } from 'react';
import { Users, Swords, Calendar, Heart, Eye } from 'lucide-react';
import { storage } from '../data/storage';

export const Information: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuilds: 0,
    totalRaids: 0,
    totalLikes: 0,
    totalViews: 0
  });

  useEffect(() => {
    const loadStats = () => {
      const users = storage.getUsers();
      const builds = storage.getBuilds().filter(b => b.approved);
      const raids = storage.getRaids();
      const buildViews = storage.getBuildViews();
      
      const totalLikes = builds.reduce((sum, build) => sum + build.likes, 0);
      const totalViews = Object.values(buildViews).reduce((sum: number, views: number) => sum + views, 0);

      setStats({
        totalUsers: users.length,
        totalBuilds: builds.length,
        totalRaids: raids.length,
        totalLikes,
        totalViews
      });
    };
    
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Пользователи',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Билды',
      value: stats.totalBuilds,
      icon: Swords,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Рейды',
      value: stats.totalRaids,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Лайки',
      value: stats.totalLikes,
      icon: Heart,
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Просмотры',
      value: stats.totalViews,
      icon: Eye,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Информация</h1>
        <p className="text-gray-400 text-lg">Статистика и информация о платформе</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-6 hover:border-gray-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 relative z-10`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">{stat.value}</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-6 hover:border-gray-500/50 transition-all duration-300">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">О платформе</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              GameHub - это современная платформа для геймеров, где вы можете:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Делиться своими билдами и стратегиями</li>
              <li>Организовывать рейды с другими игроками</li>
              <li>Лайкать и комментировать контент</li>
              <li>Следить за статистикой своих публикаций</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-6 hover:border-gray-500/50 transition-all duration-300">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">Возможности</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <Swords className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Система билдов</div>
                <div className="text-gray-400 text-sm">Предлагайте и оценивайте билды</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Рейд система</div>
                <div className="text-gray-400 text-sm">Создавайте и присоединяйтесь к рейдам</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Сообщество</div>
                <div className="text-gray-400 text-sm">Общайтесь с единомышленниками</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
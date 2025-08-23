import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Clock, Search, UserPlus, UserMinus, Shield, Heart, Zap, Settings } from 'lucide-react';
import { Raid, User } from '../types';
import { storage } from '../data/storage';
import { Modal } from './Modal';

interface Props {
  currentUser: User;
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Raids: React.FC<Props> = ({ currentUser, onNotification }) => {
  const [raids, setRaids] = useState<Raid[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRaid, setNewRaid] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    maxPlayers: 5
  });
  const [selectedRole, setSelectedRole] = useState<'dd' | 'medic' | 'tank' | 'flex'>('dd');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const raidsData = storage.getRaids();
    const usersData = storage.getUsers();
    setRaids(raidsData);
    setUsers(usersData);
  };

  const handleCreateRaid = () => {
    if (!newRaid.title.trim() || !newRaid.description.trim() || !newRaid.date || !newRaid.time) {
      onNotification('Заполните все поля', 'error');
      return;
    }

    const raid: Raid = {
      id: Date.now().toString(),
      title: newRaid.title,
      description: newRaid.description,
      date: newRaid.date,
      time: newRaid.time,
      maxPlayers: newRaid.maxPlayers,
      currentPlayers: [{ userId: currentUser.id, role: 'dd' }],
      authorId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    const updatedRaids = [...raids, raid];
    setRaids(updatedRaids);
    storage.saveRaids(updatedRaids);

    setIsAddModalOpen(false);
    setNewRaid({ title: '', description: '', date: '', time: '', maxPlayers: 5 });
    onNotification('Рейд создан успешно', 'success');
  };

  const handleJoinRaid = (raidId: string, role: 'dd' | 'medic' | 'tank' | 'flex') => {
    const updatedRaids = raids.map(raid => {
      if (raid.id === raidId && !raid.currentPlayers.some(p => p.userId === currentUser.id)) {
        if (raid.currentPlayers.length < raid.maxPlayers) {
          return { ...raid, currentPlayers: [...raid.currentPlayers, { userId: currentUser.id, role }] };
        } else {
          onNotification('Рейд уже заполнен', 'error');
          return raid;
        }
      }
      return raid;
    });
    
    setRaids(updatedRaids);
    storage.saveRaids(updatedRaids);
    onNotification('Вы присоединились к рейду', 'success');
  };

  const handleLeaveRaid = (raidId: string) => {
    const updatedRaids = raids.map(raid => {
      if (raid.id === raidId && raid.currentPlayers.some(p => p.userId === currentUser.id)) {
        return { ...raid, currentPlayers: raid.currentPlayers.filter(p => p.userId !== currentUser.id) };
      }
      return raid;
    });
    
    setRaids(updatedRaids);
    storage.saveRaids(updatedRaids);
    onNotification('Вы покинули рейд', 'info');
  };

  const getRoleIcon = (role: 'dd' | 'medic' | 'tank' | 'flex') => {
    switch (role) {
      case 'dd':
        return <Zap className="w-4 h-4 text-red-400" />;
      case 'medic':
        return <Heart className="w-4 h-4 text-green-400" />;
      case 'tank':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'flex':
        return <Settings className="w-4 h-4 text-purple-400" />;
    }
  };

  const getRoleName = (role: 'dd' | 'medic' | 'tank' | 'flex') => {
    switch (role) {
      case 'dd':
        return 'ДД';
      case 'medic':
        return 'Медик';
      case 'tank':
        return 'Танк';
      case 'flex':
        return 'Подстроюсь';
    }
  };

  const filteredRaids = raids.filter(raid =>
    raid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    raid.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-white">Рейды</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Создать рейд</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск рейдов..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Raids Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRaids.map(raid => {
          const author = users.find(u => u.id === raid.authorId);
          const isJoined = raid.currentPlayers.some(p => p.userId === currentUser.id);
          const isFull = raid.currentPlayers.length >= raid.maxPlayers;
          const canJoin = !isJoined && !isFull;

          return (
            <div key={raid.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{raid.title}</h3>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  isFull ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {raid.currentPlayers.length}/{raid.maxPlayers}
                </div>
              </div>

              <p className="text-gray-300 mb-4">{raid.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(raid.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{raid.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Организатор: {author?.username || 'Неизвестно'}</span>
                </div>
              </div>

              {/* Players List */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Участники ({raid.currentPlayers.length}/{raid.maxPlayers})</span>
                </div>
                <div className="space-y-1">
                  {raid.currentPlayers.map((player, index) => {
                    const user = users.find(u => u.id === player.userId);
                    return (
                      <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-300">{user?.username || 'Неизвестно'}</span>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(player.role)}
                          <span className="text-xs text-gray-400">{getRoleName(player.role)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center">
                {canJoin ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="bg-gray-700 border border-gray-600 rounded-lg text-white text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="dd">ДД</option>
                      <option value="medic">Медик</option>
                      <option value="tank">Танк</option>
                      <option value="flex">Подстроюсь</option>
                    </select>
                    <button
                      onClick={() => handleJoinRaid(raid.id, selectedRole)}
                      className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Присоединиться</span>
                    </button>
                  </div>
                ) : isJoined ? (
                  <button
                    onClick={() => handleLeaveRaid(raid.id)}
                    className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Покинуть</span>
                  </button>
                ) : (
                  <span className="text-red-400 text-sm">Заполнен</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRaids.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'Рейды не найдены' : 'Пока нет рейдов'}
          </p>
        </div>
      )}

      {/* Create Raid Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Создать новый рейд"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название рейда
            </label>
            <input
              type="text"
              value={newRaid.title}
              onChange={(e) => setNewRaid({...newRaid, title: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Введите название рейда"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={newRaid.description}
              onChange={(e) => setNewRaid({...newRaid, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Описание рейда, требования, цели..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={newRaid.date}
                onChange={(e) => setNewRaid({...newRaid, date: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Время
              </label>
              <input
                type="time"
                value={newRaid.time}
                onChange={(e) => setNewRaid({...newRaid, time: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Максимум участников
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="2"
                max="20"
                value={newRaid.maxPlayers}
                onChange={(e) => setNewRaid({...newRaid, maxPlayers: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>2</span>
                <span className="text-white font-medium">{newRaid.maxPlayers} игроков</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleCreateRaid}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Создать
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Users, Shield, Trash2, Edit, Check, X, UserPlus, Eye, Save, Calendar } from 'lucide-react';
import { User, PendingBuild, Build, Raid } from '../types';
import { storage } from '../data/storage';
import { Modal } from './Modal';

interface Props {
  currentUser: User;
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<Props> = ({ currentUser, onNotification }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'builds'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingBuilds, setPendingBuilds] = useState<PendingBuild[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [selectedBuild, setSelectedBuild] = useState<PendingBuild | null>(null);
  const [isBuildPreviewOpen, setIsBuildPreviewOpen] = useState(false);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const [isEditBuildModalOpen, setIsEditBuildModalOpen] = useState(false);
  const [editingRaid, setEditingRaid] = useState<Raid | null>(null);
  const [isEditRaidModalOpen, setIsEditRaidModalOpen] = useState(false);
  const [raids, setRaids] = useState<Raid[]>([]);

  useEffect(() => {
    const loadDataAsync = async () => {
      await loadData();
    };
    loadDataAsync();
  }, []);

  const loadData = async () => {
    setUsers(await storage.getUsers());
    setPendingBuilds(await storage.getPendingBuilds());
    setBuilds(await storage.getBuilds());
    setRaids(await storage.getRaids());
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      onNotification('Нельзя удалить себя', 'error');
      return;
    }

    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    await storage.saveUsers(updatedUsers);
    onNotification('Пользователь удален', 'success');
  };

  const handleEditUser = (user: User) => {
    setEditingUser({...user});
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    
    setUsers(updatedUsers);
    await storage.saveUsers(updatedUsers);
    setIsEditModalOpen(false);
    setEditingUser(null);
    onNotification('Пользователь обновлен', 'success');
  };

  const handleMakeAdmin = async (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? {...user, isAdmin: true} : user
    );
    
    setUsers(updatedUsers);
    await storage.saveUsers(updatedUsers);
    onNotification('Пользователь назначен администратором', 'success');
  };

  const handleAddAdmin = async () => {
    const user = users.find(u => u.username === newAdminUsername);
    if (!user) {
      onNotification('Пользователь не найден', 'error');
      return;
    }

    if (user.isAdmin) {
      onNotification('Пользователь уже администратор', 'error');
      return;
    }

    await handleMakeAdmin(user.id);
    setIsAddAdminModalOpen(false);
    setNewAdminUsername('');
  };

  const handleApproveBuild = async (buildId: string) => {
    const build = pendingBuilds.find(b => b.id === buildId);
    if (!build) return;

    const newBuild: Build = {
      ...build,
      likes: 0,
      views: 0,
      approved: true
    };

    const updatedBuilds = [...builds, newBuild];
    const updatedPending = pendingBuilds.filter(b => b.id !== buildId);

    setBuilds(updatedBuilds);
    setPendingBuilds(updatedPending);
    await storage.saveBuilds(updatedBuilds);
    await storage.savePendingBuilds(updatedPending);
    onNotification('Билд одобрен', 'success');
  };

  const handleRejectBuild = async (buildId: string) => {
    const updatedPending = pendingBuilds.filter(b => b.id !== buildId);
    setPendingBuilds(updatedPending);
    await storage.savePendingBuilds(updatedPending);
    onNotification('Билд отклонен', 'info');
  };

  const handleDeleteBuild = async (buildId: string) => {
    const updatedBuilds = builds.filter(b => b.id !== buildId);
    setBuilds(updatedBuilds);
    await storage.saveBuilds(updatedBuilds);
    onNotification('Билд удален', 'success');
  };

  const handleEditBuild = (build: Build) => {
    setEditingBuild({...build});
    setIsEditBuildModalOpen(true);
  };

  const handleSaveBuild = async () => {
    if (!editingBuild) return;

    const updatedBuilds = builds.map(build => 
      build.id === editingBuild.id ? editingBuild : build
    );
    
    setBuilds(updatedBuilds);
    await storage.saveBuilds(updatedBuilds);
    setIsEditBuildModalOpen(false);
    setEditingBuild(null);
    onNotification('Билд обновлен', 'success');
  };

  const handleDeleteRaid = async (raidId: string) => {
    const updatedRaids = raids.filter(r => r.id !== raidId);
    setRaids(updatedRaids);
    await storage.saveRaids(updatedRaids);
    onNotification('Рейд удален', 'success');
  };

  const handleEditRaid = (raid: Raid) => {
    setEditingRaid({...raid});
    setIsEditRaidModalOpen(true);
  };

  const handleSaveRaid = async () => {
    if (!editingRaid) return;

    const updatedRaids = raids.map(raid => 
      raid.id === editingRaid.id ? editingRaid : raid
    );
    
    setRaids(updatedRaids);
    await storage.saveRaids(updatedRaids);
    setIsEditRaidModalOpen(false);
    setEditingRaid(null);
    onNotification('Рейд обновлен', 'success');
  };

  const handlePreviewBuild = (build: PendingBuild) => {
    setSelectedBuild(build);
    setIsBuildPreviewOpen(true);
  };

  const tabs = [
    { id: 'users', name: 'Пользователи', icon: Users },
    { id: 'pending', name: 'Ожидающие билды', icon: Shield, count: pendingBuilds.length },
    { id: 'builds', name: 'Управление билдами', icon: Eye },
    { id: 'raids', name: 'Управление рейдами', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Админ панель</h1>
        <button
          onClick={() => setIsAddAdminModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Добавить админа</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        {tabs.map(({ id, name, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{name}</span>
            {count !== undefined && count > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isAdmin 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.isAdmin ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleMakeAdmin(user.id)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Builds Tab */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingBuilds.map(build => {
            const author = users.find(u => u.id === build.authorId);
            return (
              <div key={build.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{build.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreviewBuild(build)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApproveBuild(build.id)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectBuild(build.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3 line-clamp-3">{build.description}</p>
                
                <div className="text-sm text-gray-400">
                  Автор: {author?.username || 'Неизвестно'} • 
                  {new Date(build.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            );
          })}
          
          {pendingBuilds.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Нет ожидающих модерации билдов</p>
            </div>
          )}
        </div>
      )}

      {/* Builds Management Tab */}
      {activeTab === 'builds' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {builds.map(build => {
            const author = users.find(u => u.id === build.authorId);
            return (
              <div key={build.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{build.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditBuild(build)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBuild(build.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3 line-clamp-3">{build.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div>Автор: {author?.username || 'Неизвестно'}</div>
                  <div className="flex space-x-4">
                    <span>❤️ {build.likes}</span>
                    <span>👁️ {build.views}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {builds.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Нет опубликованных билдов</p>
            </div>
          )}
        </div>
      )}

      {/* Raids Management Tab */}
      {activeTab === 'raids' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {raids.map(raid => {
            const author = users.find(u => u.id === raid.authorId);
            return (
              <div key={raid.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{raid.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRaid(raid)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRaid(raid.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3 line-clamp-3">{raid.description}</p>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(raid.date).toLocaleDateString('ru-RU')} в {raid.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{raid.currentPlayers.length}/{raid.maxPlayers} участников</span>
                  </div>
                  <div>Организатор: {author?.username || 'Неизвестно'}</div>
                </div>
              </div>
            );
          })}
          
          {raids.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Нет созданных рейдов</p>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать пользователя"
      >
        {editingUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={editingUser.username}
                onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={editingUser.password}
                onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        title="Добавить администратора"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              value={newAdminUsername}
              onChange={(e) => setNewAdminUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Введите имя пользователя"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddAdminModalOpen(false)}
              className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleAddAdmin}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              Добавить
            </button>
          </div>
        </div>
      </Modal>

      {/* Build Preview Modal */}
      <Modal
        isOpen={isBuildPreviewOpen}
        onClose={() => setIsBuildPreviewOpen(false)}
        title={selectedBuild?.title || ''}
        maxWidth="max-w-2xl"
      >
        {selectedBuild && (
          <div className="space-y-4">
            {selectedBuild.image && (
              <img
                src={selectedBuild.image}
                alt={selectedBuild.title}
                className="w-full h-auto rounded-lg"
              />
            )}
            <div className="text-gray-300">
              {selectedBuild.description}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  handleRejectBuild(selectedBuild.id);
                  setIsBuildPreviewOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Отклонить
              </button>
              <button
                onClick={() => {
                  handleApproveBuild(selectedBuild.id);
                  setIsBuildPreviewOpen(false);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Одобрить
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Build Modal */}
      <Modal
        isOpen={isEditBuildModalOpen}
        onClose={() => setIsEditBuildModalOpen(false)}
        title="Редактировать билд"
        maxWidth="max-w-lg"
      >
        {editingBuild && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название билда
              </label>
              <input
                type="text"
                value={editingBuild.title}
                onChange={(e) => setEditingBuild({...editingBuild, title: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание
              </label>
              <textarea
                value={editingBuild.description}
                onChange={(e) => setEditingBuild({...editingBuild, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ссылка на изображение
              </label>
              <input
                type="url"
                value={editingBuild.image}
                onChange={(e) => setEditingBuild({...editingBuild, image: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditBuildModalOpen(false)}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveBuild}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Raid Modal */}
      <Modal
        isOpen={isEditRaidModalOpen}
        onClose={() => setIsEditRaidModalOpen(false)}
        title="Редактировать рейд"
        maxWidth="max-w-lg"
      >
        {editingRaid && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название рейда
              </label>
              <input
                type="text"
                value={editingRaid.title}
                onChange={(e) => setEditingRaid({...editingRaid, title: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание
              </label>
              <textarea
                value={editingRaid.description}
                onChange={(e) => setEditingRaid({...editingRaid, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата
                </label>
                <input
                  type="date"
                  value={editingRaid.date}
                  onChange={(e) => setEditingRaid({...editingRaid, date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Время
                </label>
                <input
                  type="time"
                  value={editingRaid.time}
                  onChange={(e) => setEditingRaid({...editingRaid, time: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                  value={editingRaid.maxPlayers}
                  onChange={(e) => setEditingRaid({...editingRaid, maxPlayers: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>2</span>
                  <span className="text-white font-medium">{editingRaid.maxPlayers} игроков</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditRaidModalOpen(false)}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveRaid}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
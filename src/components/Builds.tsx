import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Build, User, PendingBuild } from '../types';
import { storage } from '../data/storage';
import { BuildCard } from './BuildCard';
import { Modal } from './Modal';

interface Props {
  currentUser: User;
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Builds: React.FC<Props> = ({ currentUser, onNotification }) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userLikes, setUserLikes] = useState<{[userId: string]: string[]}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBuild, setNewBuild] = useState({
    title: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const buildsData = storage.getBuilds().filter(b => b.approved);
    const usersData = storage.getUsers();
    const likesData = storage.getUserLikes();
    
    setBuilds(buildsData);
    setUsers(usersData);
    setUserLikes(likesData);
  };

  const handleLike = (buildId: string) => {
    const currentLikes = userLikes[currentUser.id] || [];
    const hasLiked = currentLikes.includes(buildId);
    
    let newUserLikes = { ...userLikes };
    let updatedBuilds = [...builds];
    
    if (hasLiked) {
      // Unlike
      newUserLikes[currentUser.id] = currentLikes.filter(id => id !== buildId);
      updatedBuilds = updatedBuilds.map(build => 
        build.id === buildId ? { ...build, likes: build.likes - 1 } : build
      );
    } else {
      // Like
      newUserLikes[currentUser.id] = [...currentLikes, buildId];
      updatedBuilds = updatedBuilds.map(build => 
        build.id === buildId ? { ...build, likes: build.likes + 1 } : build
      );
    }
    
    setUserLikes(newUserLikes);
    setBuilds(updatedBuilds);
    storage.saveUserLikes(newUserLikes);
    storage.saveBuilds(updatedBuilds);
  };

  const handleView = (buildId: string) => {
    const buildViews = storage.getBuildViews();
    const newViews = { ...buildViews, [buildId]: (buildViews[buildId] || 0) + 1 };
    
    const updatedBuilds = builds.map(build => 
      build.id === buildId ? { ...build, views: newViews[buildId] } : build
    );
    
    setBuilds(updatedBuilds);
    storage.saveBuildViews(newViews);
    storage.saveBuilds(updatedBuilds);
  };

  const handleSubmitBuild = () => {
    if (!newBuild.title.trim() || !newBuild.description.trim() || !newBuild.image.trim()) {
      onNotification('Заполните все поля', 'error');
      return;
    }

    const pendingBuild: PendingBuild = {
      id: Date.now().toString(),
      title: newBuild.title,
      description: newBuild.description,
      image: newBuild.image,
      authorId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    const pendingBuilds = storage.getPendingBuilds();
    pendingBuilds.push(pendingBuild);
    storage.savePendingBuilds(pendingBuilds);

    setIsAddModalOpen(false);
    setNewBuild({ title: '', description: '', image: '' });
    onNotification('Билд отправлен на модерацию', 'success');
  };

  const filteredBuilds = builds.filter(build =>
    build.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    build.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-white">Билды</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Предложить билд</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск билдов..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Builds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuilds.map(build => {
          const author = users.find(u => u.id === build.authorId);
          const userLiked = (userLikes[currentUser.id] || []).includes(build.id);
          
          return (
            <BuildCard
              key={build.id}
              build={build}
              currentUser={currentUser}
              userLiked={userLiked}
              onLike={handleLike}
              onView={handleView}
              authorName={author?.username || 'Неизвестно'}
            />
          );
        })}
      </div>

      {filteredBuilds.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'Билды не найдены' : 'Пока нет билдов'}
          </p>
        </div>
      )}

      {/* Add Build Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Предложить новый билд"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название билда
            </label>
            <input
              type="text"
              value={newBuild.title}
              onChange={(e) => setNewBuild({...newBuild, title: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название билда"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={newBuild.description}
              onChange={(e) => setNewBuild({...newBuild, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Описание билда, стратегии, советы..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ссылка на изображение
            </label>
            <input
              type="url"
              value={newBuild.image}
              onChange={(e) => setNewBuild({...newBuild, image: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmitBuild}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Отправить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
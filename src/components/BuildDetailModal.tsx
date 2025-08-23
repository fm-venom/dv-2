import React from 'react';
import { Heart, Eye, User, Calendar, ExternalLink } from 'lucide-react';
import { Build } from '../types';
import { Modal } from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  build: Build;
  authorName: string;
  userLiked: boolean;
  onLike: (buildId: string) => void;
}

export const BuildDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  build,
  authorName,
  userLiked,
  onLike
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0">
          <div className="lg:w-1/2">
            <img
              src={build.image}
              alt={build.title}
              className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          
          <div className="lg:w-1/2 space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {build.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(build.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-gray-700/50 rounded-full px-3 py-2">
                <Eye className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-300">{build.views} просмотров</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(build.id);
                }}
                className={`flex items-center space-x-2 rounded-full px-4 py-2 transition-all duration-200 transform hover:scale-105 ${
                  userLiked
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{build.likes} лайков</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-3">Описание билда</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {build.description}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-md font-semibold text-white mb-2">Статистика</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Просмотры:</span>
                <span className="text-white font-medium">{build.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Лайки:</span>
                <span className="text-white font-medium">{build.likes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Опубликован:</span>
                <span className="text-white font-medium">
                  {new Date(build.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-md font-semibold text-white mb-2">Автор</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">{authorName}</div>
                <div className="text-gray-400 text-sm">Автор билда</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  );
};
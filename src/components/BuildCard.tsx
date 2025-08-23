import React, { useState } from 'react';
import { Heart, Eye, User, Calendar } from 'lucide-react';
import { Build, User as UserType } from '../types';
import { Modal } from './Modal';
import { BuildDetailModal } from './BuildDetailModal';

interface Props {
  build: Build;
  currentUser: UserType;
  userLiked: boolean;
  onLike: (buildId: string) => void;
  onView: (buildId: string) => void;
  authorName: string;
}

export const BuildCard: React.FC<Props> = ({ 
  build, 
  currentUser, 
  userLiked, 
  onLike, 
  onView,
  authorName 
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsDetailModalOpen(true);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  const handleDetailModalOpen = () => {
    onView(build.id);
    setIsDetailModalOpen(true);
  };
  return (
    <>
      <div 
        className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
        onClick={handleDetailModalOpen}
      >
        <div className="relative overflow-hidden">
          <img
            src={build.image}
            alt={build.title}
            className="w-full h-48 object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
            onClick={handleImageClick}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
              <Eye className="w-3 h-3 text-gray-300" />
              <span className="text-xs text-gray-300">{build.views}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(build.id);
              }}
              className={`flex items-center space-x-1 rounded-full px-2 py-1 transition-all duration-200 transform hover:scale-110 ${
                userLiked
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-black/50 text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500'
              }`}
            >
              <Heart className={`w-3 h-3 ${userLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{build.likes}</span>
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">{build.title}</h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(build.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>

          <div className="text-gray-300 max-h-20 overflow-hidden">
            <p className="text-sm leading-relaxed line-clamp-3">{build.description}</p>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs text-blue-400">
              Нажмите для подробностей
            </span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title={build.title}
        maxWidth="max-w-4xl"
      >
        <img
          src={build.image}
          alt={build.title}
          className="w-full h-auto rounded-lg"
        />
      </Modal>

      <BuildDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        build={build}
        authorName={authorName}
        userLiked={userLiked}
        onLike={onLike}
      />
    </>
  );
};
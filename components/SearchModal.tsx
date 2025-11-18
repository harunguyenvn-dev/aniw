import React, { useState, useMemo } from 'react';
import { CloseIcon, SearchIcon } from './icons';
import { Anime, Settings } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  settings: Settings;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, animeList, onSelectAnime, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnime = useMemo(() => {
    if (!searchTerm) return [];
    return animeList.filter(anime => 
      anime.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
  }, [searchTerm, animeList]);

  if (!isOpen) return null;

  const modalClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
    ? 'glass-card' 
    : 'bg-theme-lightest dark:bg-theme-darkest/90 text-theme-darkest dark:text-theme-lightest';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-20 sm:pt-24 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in-down ${modalClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
            <div className="relative">
                 <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 dark:text-slate-400" />
                 <input
                    type="text"
                    placeholder="Tìm kiếm anime..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-200/50 dark:bg-theme-darkest/50 border border-slate-300 dark:border-slate-700 rounded-full py-3 pr-12 pl-12 text-lg focus:outline-none focus:ring-2 focus:ring-theme-lime transition-all placeholder-slate-500 dark:placeholder-slate-400"
                    autoFocus
                />
                 <button onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 rounded-full">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        {searchTerm && (
            <div className="border-t border-slate-300 dark:border-slate-700 max-h-[60vh] overflow-y-auto">
                 {filteredAnime.length > 0 ? (
                    <ul>
                        {filteredAnime.map(anime => (
                             <li key={anime.name}>
                                <button 
                                    onClick={() => onSelectAnime(anime)}
                                    className="w-full text-left p-4 hover:bg-theme-mint/20 dark:hover:bg-theme-olive/30 transition-colors"
                                >
                                    <h3 className="font-semibold text-lg">{anime.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{anime.episodes.length} tập</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-8 text-center text-slate-500 dark:text-slate-400">Không tìm thấy kết quả nào.</p>
                )}
            </div>
        )}
      </div>
       <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SearchModal;
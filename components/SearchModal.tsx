
import React, { useState, useMemo } from 'react';
import { CloseIcon, SearchIcon } from './icons';
import { Anime, Settings } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  settings: Settings;
  isBackgroundFetching?: boolean;
  backgroundStatus?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, animeList, onSelectAnime, settings, isBackgroundFetching, backgroundStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnime = useMemo(() => {
    if (!searchTerm) return [];
    return animeList.filter(anime => 
      anime.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [searchTerm, animeList]);

  if (!isOpen) return null;

  const modalClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
    ? 'glass-card' 
    : 'bg-theme-lightest dark:bg-theme-darkest/90 text-theme-darkest dark:text-theme-lightest';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-20 sm:pt-24 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-3xl shadow-2xl w-full max-w-2xl relative animate-fade-in-down ${modalClasses} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="relative group">
                 <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 dark:text-slate-400 group-focus-within:text-theme-lime transition-colors" />
                 <input
                    type="text"
                    placeholder="Nhập tên anime muốn tìm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-200/50 dark:bg-black/20 border-2 border-transparent focus:border-theme-lime rounded-2xl py-4 pr-12 pl-12 text-lg focus:outline-none transition-all placeholder-slate-500 dark:placeholder-slate-400 font-bold"
                    autoFocus
                />
                 <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            {/* LOADING STATE VỚI HÌNH ẢNH MỚI */}
            {isBackgroundFetching && (
                <div className="mt-8 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <div className="relative">
                        <img 
                            src="https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%204/search_loading_0.png" 
                            alt="Searching..." 
                            className="w-32 h-32 object-contain animate-bounce-gentle drop-shadow-2xl"
                        />
                         {/* Bóng đổ nhẹ dưới chân ảnh */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/20 blur-md rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="px-5 py-2 rounded-full bg-theme-lime/10 border border-theme-lime/30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-theme-lime animate-ping"></div>
                        <span className="text-sm font-bold text-theme-darkest dark:text-theme-lightest">
                            {backgroundStatus || 'Đang lục tung kho dữ liệu...'}
                        </span>
                    </div>
                </div>
            )}
        </div>

        {searchTerm && !isBackgroundFetching && (
            <div className="border-t border-slate-200 dark:border-white/10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 {filteredAnime.length > 0 ? (
                    <ul className="p-2">
                        {filteredAnime.map(anime => (
                             <li key={anime.name} className="mb-1">
                                <button 
                                    onClick={() => onSelectAnime(anime)}
                                    className="w-full text-left p-4 rounded-xl hover:bg-theme-lime/20 dark:hover:bg-theme-lime/10 transition-all group flex items-center justify-between"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-theme-olive dark:group-hover:text-theme-lime transition-colors">{anime.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{anime.episodes.length} tập phim</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-theme-lime">
                                        ➤
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center animate-fade-in">
                         <img 
                            src="https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%204/img_holder_search_failed.png" 
                            alt="Not Found" 
                            className="w-40 h-40 object-contain mb-4 drop-shadow-lg opacity-90 hover:scale-105 transition-transform duration-300"
                         />
                         <p className="font-bold text-lg text-slate-700 dark:text-slate-200">Hổng tìm thấy anime nào tên này cả.</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Thử từ khóa khác xem sao nhé bro!</p>
                    </div>
                )}
            </div>
        )}
      </div>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
        
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes bounce-gentle {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(5%); }
        }
        .animate-bounce-gentle {
            animation: bounce-gentle 2s infinite ease-in-out;
        }
        
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SearchModal;

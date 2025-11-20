

import React from 'react';
import { CloseIcon, CheckIcon } from './icons';
import { Settings } from '../types';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
  const modalClasses = isGlass
    ? 'glass-card text-theme-darkest dark:text-theme-lightest'
    : 'bg-theme-lightest dark:bg-theme-darkest text-theme-darkest dark:text-theme-lightest border border-theme-mint/50 dark:border-theme-olive/50';

  const themes = [
    {
      id: 'sidebar-curved',
      name: 'Sidebar Cong Mềm Mại',
      description: 'Thanh điều hướng dọc hiện đại với hiệu ứng đường cong mềm mại độc đáo.',
      previewColor: '#1A3822', // A color representing the theme
      isNew: true,
    },
    {
      id: 'classic',
      name: 'Giao diện Cổ điển',
      description: 'Giao diện thanh menu chuẩn, đơn giản và quen thuộc.',
      previewColor: '#4D7111',
      isNew: false,
    }
  ];

  const handleInstall = (themeId: 'classic' | 'sidebar-curved') => {
    let newSettings = { ...settings, headerStyle: themeId };
    
    // If installing the curved sidebar, force position to left for best experience
    if (themeId === 'sidebar-curved') {
        newSettings.headerPosition = 'left';
    }

    onSettingsChange(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative animate-fade-in-down ${modalClasses}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">Cửa hàng Giao diện</h2>
            <p className="text-sm opacity-70">Tùy biến trải nghiệm của bạn với các gói giao diện độc đáo.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((theme) => (
                <div key={theme.id} className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${isGlass ? 'border-white/20 bg-white/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                    <div className="h-40 w-full relative flex items-center justify-center" style={{ background: theme.previewColor }}>
                        {/* Simple CSS Representation of the theme */}
                        {theme.id === 'sidebar-curved' ? (
                             <div className="flex h-full items-center">
                                <div className="w-12 h-32 bg-white rounded-r-xl relative flex flex-col items-center justify-center gap-2 shadow-lg">
                                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                                    <div className="w-8 h-8 rounded-full bg-theme-lime relative">
                                         {/* Mocking the curve effect roughly */}
                                         <div className="absolute -top-4 right-0 w-4 h-4 bg-transparent shadow-[4px_4px_0_0_#C3E956] rounded-br-full"></div>
                                         <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent shadow-[4px_-4px_0_0_#C3E956] rounded-tr-full"></div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                                </div>
                             </div>
                        ) : (
                            <div className="w-3/4 h-8 bg-white rounded-full shadow-md flex items-center justify-around px-2">
                                <div className="w-4 h-4 rounded-full bg-theme-lime"></div>
                                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                            </div>
                        )}
                        
                        {theme.isNew && (
                            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                MỚI
                            </span>
                        )}
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{theme.name}</h3>
                            {settings.headerStyle === theme.id && (
                                <span className="text-theme-olive dark:text-theme-lime flex items-center gap-1 text-sm font-semibold">
                                    <CheckIcon className="w-4 h-4" /> Đang dùng
                                </span>
                            )}
                        </div>
                        <p className="text-sm opacity-70 mb-4 min-h-[40px]">{theme.description}</p>
                        <button
                            onClick={() => handleInstall(theme.id as any)}
                            disabled={settings.headerStyle === theme.id}
                            className={`w-full py-2 rounded-lg font-bold transition-all ${
                                settings.headerStyle === theme.id
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default'
                                    : 'bg-theme-lime text-theme-darkest hover:bg-theme-mint shadow-md hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                        >
                            {settings.headerStyle === theme.id ? 'Đã cài đặt' : 'Cài đặt'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StoreModal;

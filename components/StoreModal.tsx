
import React from 'react';
import { CloseIcon, CheckIcon, ShoppingBagIcon } from './icons';
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
  // Mobile: Bottom Sheet (rounded-t-3xl), Desktop: Centered Modal (rounded-3xl)
  const modalClasses = isGlass
    ? 'glass-card text-theme-darkest dark:text-theme-lightest'
    : 'bg-theme-lightest dark:bg-[#121212] text-theme-darkest dark:text-theme-lightest border border-theme-mint/50 dark:border-theme-olive/50';

  const themes = [
    {
      id: 'minimal-tabs',
      name: 'Minimal Tabs',
      description: 'Thanh menu ngang hiện đại, tối ưu không gian dọc.',
      type: 'headerStyle',
      previewType: 'minimal',
      isNew: true,
    },
    {
      id: 'focus-ui',
      name: 'Focus UI',
      description: 'Viên thuốc bay lơ lửng, tập trung tối đa vào nội dung.',
      type: 'headerStyle', 
      previewType: 'focus', 
      isNew: false,
    },
    {
      id: 'sidebar-curved',
      name: 'Curved Sidebar',
      description: 'Thanh bên cong mềm mại, thích hợp màn hình ngang.',
      type: 'headerStyle',
      previewType: 'sidebar',
      isNew: false,
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Đơn giản, quen thuộc và dễ sử dụng.',
      type: 'headerStyle',
      previewType: 'classic',
      isNew: false,
    }
  ];

  const handleInstall = (themeId: string) => {
    let newSettings = { ...settings, headerStyle: themeId as any };
    
    // Tự động điều chỉnh vị trí tối ưu
    if (themeId === 'sidebar-curved') {
        newSettings.headerPosition = 'left';
    } else if (themeId === 'focus-ui') {
        newSettings.headerPosition = 'bottom';
    } else if (themeId === 'minimal-tabs') {
        newSettings.headerPosition = 'top';
    } else {
        newSettings.headerPosition = 'top';
    }

    onSettingsChange(newSettings);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center sm:p-4 transition-opacity duration-300" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* Modal Content */}
      <div 
        className={`w-full md:max-w-5xl h-[90vh] md:h-[85vh] flex flex-col relative animate-slide-up-mobile md:animate-fade-in-down overflow-hidden shadow-2xl rounded-t-3xl md:rounded-3xl ${modalClasses}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Store */}
        <div className="flex justify-between items-center p-5 md:p-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-theme-lime/10 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-lime/20 rounded-xl text-theme-darkest dark:text-theme-lime">
                <ShoppingBagIcon className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl md:text-3xl font-black tracking-tight leading-none">Cửa Hàng</h2>
                <p className="text-xs md:text-sm opacity-70 mt-1">Chọn phong cách của riêng bạn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <CloseIcon className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Body Store */}
        <div className="flex-grow p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-black/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-10">
            {themes.map((theme) => (
                <div key={theme.id} className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${isGlass ? 'border-white/20 bg-white/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] shadow-sm'}`}>
                    
                    {/* Preview Area */}
                    <div className="h-40 md:h-48 w-full relative flex items-center justify-center bg-slate-100 dark:bg-[#0f0f13] overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* PREVIEW RENDERS (Giữ nguyên logic render preview cũ) */}
                        {theme.previewType === 'minimal' && (
                             <div className="relative w-full h-full bg-slate-50 dark:bg-[#1a1a1a] flex flex-col scale-90 md:scale-100 origin-center shadow-lg">
                                 <div className="w-full h-8 md:h-10 bg-white dark:bg-[#252525] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3">
                                     <div className="w-5 h-5 rounded bg-theme-lime"></div>
                                     <div className="flex gap-1.5">
                                         <div className="w-8 h-3 rounded-full bg-theme-lime/20"></div>
                                         <div className="w-8 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                         <div className="w-8 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                     </div>
                                     <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                 </div>
                                 <div className="flex-1 p-3">
                                     <div className="w-3/4 h-full bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                                 </div>
                             </div>
                        )}

                        {theme.previewType === 'focus' && (
                             <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-black">
                                 <div className="relative px-4 py-2 rounded-full flex items-center gap-3 shadow-lg ring-1 ring-white/20 backdrop-blur-xl bg-gradient-to-r from-indigo-900/80 to-blue-900/80">
                                     <div className="w-6 h-6 rounded-full bg-white"></div>
                                     <div className="flex gap-1">
                                         <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                         <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                     </div>
                                 </div>
                             </div>
                        )}

                        {theme.previewType === 'sidebar' && (
                             <div className="relative w-full h-full flex items-center bg-slate-50 dark:bg-[#1a1a1a]">
                                <div className="h-full w-12 bg-white dark:bg-[#2a2a2a] border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 gap-2 shadow-lg z-10">
                                    <div className="w-8 h-8 rounded-full bg-theme-lime flex items-center justify-center text-[10px]">Active</div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                </div>
                                <div className="flex-1 p-4 self-start">
                                    <div className="w-full h-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                                </div>
                             </div>
                        )}

                        {theme.previewType === 'classic' && (
                            <div className="relative w-full h-full flex flex-col items-center pt-6 bg-slate-50 dark:bg-[#1a1a1a]">
                                <div className="w-3/4 h-10 bg-white dark:bg-[#2a2a2a] rounded-full shadow-md flex items-center justify-around px-2 border border-slate-200 dark:border-slate-700">
                                    <div className="w-4 h-4 rounded-full bg-theme-lime"></div>
                                    <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                    <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                </div>
                            </div>
                        )}
                        
                        {theme.isNew && (
                            <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse z-10">
                                NEW
                            </span>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 md:p-5 relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base md:text-lg font-bold">{theme.name}</h3>
                            {settings.headerStyle === theme.id && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold border border-green-200 dark:border-green-800 flex items-center gap-1">
                                    <CheckIcon className="w-3 h-3" /> Active
                                </span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm opacity-70 mb-4 h-10 line-clamp-2 leading-relaxed">{theme.description}</p>
                        
                        <button
                            onClick={() => handleInstall(theme.id)}
                            disabled={settings.headerStyle === theme.id}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                settings.headerStyle === theme.id
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                                    : 'bg-theme-lime text-theme-darkest hover:bg-white hover:shadow-lg active:scale-95'
                            }`}
                        >
                            {settings.headerStyle === theme.id ? 'Đang sử dụng' : 'Cài đặt'}
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
        
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slide-up-mobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-mobile { animation: slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default StoreModal;

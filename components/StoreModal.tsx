
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
      id: 'focus-ui',
      name: 'Focus UI (Tâm Điểm)',
      description: 'Giao diện tập trung với tông màu Gradient Tím - Xanh hiện đại, thiết kế dạng viên thuốc (Pill) lơ lửng độc đáo.',
      type: 'headerStyle', // Loại cài đặt
      previewType: 'focus', // Để render preview riêng
      isNew: true,
    },
    {
      id: 'sidebar-curved',
      name: 'Thanh Bên Cong (Curved)',
      description: 'Thanh điều hướng dọc hiện đại với hiệu ứng đường cong mềm mại, tối ưu cho màn hình rộng.',
      type: 'headerStyle',
      previewType: 'sidebar',
      isNew: false,
    },
    {
      id: 'classic',
      name: 'Cổ Điển (Classic)',
      description: 'Giao diện thanh menu chuẩn, đơn giản và quen thuộc, dễ sử dụng cho mọi người.',
      type: 'headerStyle',
      previewType: 'classic',
      isNew: false,
    }
  ];

  const handleInstall = (themeId: string) => {
    let newSettings = { ...settings, headerStyle: themeId as any };
    
    // Tự động điều chỉnh vị trí cho phù hợp với giao diện
    if (themeId === 'sidebar-curved') {
        newSettings.headerPosition = 'left';
    } else if (themeId === 'focus-ui') {
        newSettings.headerPosition = 'bottom'; // Focus đẹp nhất ở dưới
    } else {
        newSettings.headerPosition = 'top';
    }

    onSettingsChange(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[100] p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className={`rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col relative animate-fade-in-down overflow-hidden ${modalClasses}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Store */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-transparent via-theme-lime/10 to-transparent">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Cửa Hàng Giao Diện</h2>
            <p className="text-sm opacity-70 mt-1">Khám phá và cài đặt các giao diện độc quyền cho AniW.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Body Store */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
                <div key={theme.id} className={`group relative rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${isGlass ? 'border-white/20 bg-white/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                    
                    {/* Preview Area */}
                    <div className="h-48 w-full relative flex items-center justify-center bg-slate-100 dark:bg-[#0f0f13] overflow-hidden">
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* PREVIEW: FOCUS UI */}
                        {theme.previewType === 'focus' && (
                             <div className="relative w-full h-full flex items-center justify-center">
                                 <div className="absolute inset-0 bg-gradient-to-br from-[#2e1065] to-[#000000] opacity-80"></div>
                                 {/* The Pill */}
                                 <div className="relative px-6 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(139,92,246,0.5)] ring-1 ring-white/20 backdrop-blur-xl"
                                      style={{ background: 'linear-gradient(90deg, rgba(76,29,149,0.8) 0%, rgba(37,99,235,0.8) 100%)' }}>
                                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        {/* Moon Icon */}
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-600"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                     </div>
                                     <span className="text-white font-bold text-lg tracking-wide">Focus</span>
                                     <div className="flex flex-col gap-0.5 ml-2">
                                         <div className="w-3 h-1 bg-white/50 rounded-full"></div>
                                         <div className="w-3 h-1 bg-white/30 rounded-full"></div>
                                     </div>
                                 </div>
                             </div>
                        )}

                        {/* PREVIEW: CURVED SIDEBAR */}
                        {theme.previewType === 'sidebar' && (
                             <div className="relative w-full h-full flex items-center bg-slate-50 dark:bg-[#1a1a1a]">
                                <div className="h-full w-16 bg-white dark:bg-[#2a2a2a] border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 gap-3 shadow-lg z-10">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                    <div className="w-10 h-10 rounded-full bg-theme-lime relative flex items-center justify-center text-theme-darkest">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                         {/* Curves */}
                                         <div className="absolute -top-5 right-0 w-5 h-5 bg-transparent shadow-[5px_5px_0_0_var(--theme-lime)] rounded-br-full"></div>
                                         <div className="absolute -bottom-5 right-0 w-5 h-5 bg-transparent shadow-[5px_-5px_0_0_var(--theme-lime)] rounded-tr-full"></div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                    <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                </div>
                             </div>
                        )}

                        {/* PREVIEW: CLASSIC */}
                        {theme.previewType === 'classic' && (
                            <div className="relative w-full h-full flex flex-col items-center pt-8 bg-slate-50 dark:bg-[#1a1a1a]">
                                <div className="w-3/4 h-12 bg-white dark:bg-[#2a2a2a] rounded-full shadow-md flex items-center justify-around px-4 border border-slate-200 dark:border-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-theme-lime"></div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                </div>
                                <div className="mt-4 w-2/3 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg opacity-50"></div>
                            </div>
                        )}
                        
                        {theme.isNew && (
                            <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg animate-pulse">
                                NEW
                            </span>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 relative">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold">{theme.name}</h3>
                            {settings.headerStyle === theme.id && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold border border-green-200 dark:border-green-800">
                                    <CheckIcon className="w-3 h-3" /> Đang dùng
                                </span>
                            )}
                        </div>
                        <p className="text-sm opacity-70 mb-6 min-h-[40px] leading-relaxed">{theme.description}</p>
                        
                        <button
                            onClick={() => handleInstall(theme.id)}
                            disabled={settings.headerStyle === theme.id}
                            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                settings.headerStyle === theme.id
                                    ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 cursor-default'
                                    : 'bg-theme-lime text-theme-darkest hover:bg-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                            }`}
                        >
                            {settings.headerStyle === theme.id ? 'Đã cài đặt' : 'Cài đặt ngay'}
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.8); }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default StoreModal;

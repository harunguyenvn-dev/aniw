
import React, { useState, useEffect } from 'react';
import { CloseIcon, DatabaseIcon, CheckIcon, SearchIcon } from './icons';
import { Settings } from '../types';
import { DATA_SOURCES, DataSource } from '../data/sources';

interface DataStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
}

const DataStoreModal: React.FC<DataStoreModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSourceUrl, setActiveSourceUrl] = useState(settings.customAnimeDataUrl || DATA_SOURCES[0].url);

    useEffect(() => {
        if (isOpen) {
            setActiveSourceUrl(settings.customAnimeDataUrl || DATA_SOURCES[0].url);
        }
    }, [isOpen, settings.customAnimeDataUrl]);

    const handleApplySource = (url: string) => {
        onSettingsChange({ ...settings, customAnimeDataUrl: url });
        setActiveSourceUrl(url);
    };

    const filteredSources = DATA_SOURCES.filter(source => 
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        source.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen) return null;

    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const modalClasses = isGlass
        ? 'glass-card text-theme-darkest dark:text-theme-lightest'
        : 'bg-[#F3F4F6] dark:bg-[#111827] text-slate-900 dark:text-slate-100';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[100] p-4 transition-opacity duration-300" onClick={onClose}>
            <div 
                className={`rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col relative animate-fade-in-down overflow-hidden ${modalClasses}`} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/20 backdrop-blur-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <DatabaseIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Kho Dữ Liệu</h2>
                            <p className="text-sm opacity-70">Chọn nguồn dữ liệu (Local Data Store)</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                         <div className="relative flex-grow md:flex-grow-0 md:w-64">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm nguồn..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                         </div>
                        <button onClick={onClose} className="p-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSources.map((source) => {
                            const isActive = activeSourceUrl === source.url;
                            return (
                                <div 
                                    key={source.id} 
                                    className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                        isActive 
                                            ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2 flex-wrap">
                                            {source.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        {isActive && (
                                            <div className="bg-indigo-500 text-white p-1 rounded-full shadow-lg shadow-indigo-500/40">
                                                <CheckIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{source.name}</h3>
                                    <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1">
                                        bởi <span className="text-slate-600 dark:text-slate-300">@{source.author}</span>
                                    </p>
                                    
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
                                        {source.description}
                                    </p>

                                    <button
                                        onClick={() => handleApplySource(source.url)}
                                        disabled={isActive}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                            isActive
                                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                                                : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-black hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95'
                                        }`}
                                    >
                                        {isActive ? 'Đang Sử Dụng' : 'Sử Dụng Nguồn Này'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    {filteredSources.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                             <DatabaseIcon className="w-16 h-16 mb-4 opacity-20" />
                             <p>Không tìm thấy nguồn dữ liệu nào phù hợp.</p>
                        </div>
                    )}
                </div>
                
                 {/* Footer Hint */}
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center">
                    <p className="text-xs text-slate-500">
                       Nếu thấy dự án hay hãy donate 20k cho dự án nhé
                    </p>
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

export default DataStoreModal;

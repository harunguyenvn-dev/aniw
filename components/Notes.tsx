
import React from 'react';
import { Settings } from '../types';

interface NotesProps {
    isFullScreen?: boolean;
    isPlayerNote?: boolean;
    isTiled?: boolean;
    settings: Settings;
}

const Notes: React.FC<NotesProps> = ({ isFullScreen = false, isPlayerNote = false, isTiled = false, settings }) => {
    const textColor = 'text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500';
    
    if (isTiled) {
        return (
            <textarea
                placeholder="Ghi lại những điều thú vị về tập phim này..."
                className={`w-full h-full bg-transparent focus:outline-none resize-none no-scrollbar ${textColor}`}
            />
        );
    }
    
    // For popup player tab (no header, just textarea)
    if (isFullScreen) {
        return (
            <div className="p-4 h-full">
                <textarea
                    placeholder="Ghi lại những điều thú vị về tập phim này..."
                    className="w-full h-full bg-transparent text-slate-300 placeholder-slate-500 focus:outline-none resize-none no-scrollbar"
                />
            </div>
        );
    }
    
    // For default player side panel (with header)
    if (isPlayerNote) {
        const borderClass = settings.theme === 'glass-ui' ? 'border-white/20' : 'border-slate-300/50 dark:border-slate-700/50';
        const headingColor = settings.theme === 'glass-ui' ? '' : 'text-theme-olive dark:text-theme-lime';

        return (
            <div className="h-full flex flex-col">
                <h3 className={`text-xl font-bold p-4 border-b ${borderClass} flex-shrink-0 ${headingColor}`}>
                    Ghi chú cá nhân
                </h3>
                <div className="flex-grow p-2 sm:p-4">
                    <textarea
                        placeholder="Ghi lại những điều thú vị về tập phim này..."
                        className={`w-full h-full bg-transparent focus:outline-none resize-none no-scrollbar ${textColor}`}
                    />
                </div>
                 <style>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        );
    }

    // Fallback for any other use case (previously the default bottom-aligned note box)
    const noteContainerClasses = settings?.theme === 'glass-ui' 
        ? 'glass-card rounded-lg p-4' 
        : 'bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-4';

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Ghi chú cá nhân</h3>
            <div className={noteContainerClasses}>
                <textarea
                    placeholder="Ghi lại những điều thú vị về tập phim này..."
                    className="w-full h-32 bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none"
                ></textarea>
            </div>
        </div>
    );
};

export default Notes;

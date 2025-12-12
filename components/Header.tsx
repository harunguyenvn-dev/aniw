
import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, SearchIcon, SettingsIcon, BookOpenIcon, TrophyIcon, CalendarDaysIcon, WaifuIcon, QRCodeIcon, HeartIcon, CodeBracketSquareIcon, ShuffleIcon, SparklesIcon, ClipboardCheckIcon, ShoppingBagIcon, DatabaseIcon, DownloadIcon } from './icons';
import { Settings, View, UserLevelData } from '../types';

interface HeaderProps {
    onDonateClick: () => void;
    onHomeClick: () => void;
    onSearchClick: () => void;
    onGlossaryClick: () => void;
    onRankingClick: () => void;
    onScheduleClick: () => void;
    onMusicClick: () => void;
    onSettingsClick: () => void;
    onLikedImagesClick: () => void;
    onCssEditorClick: () => void;
    onRandomClick: () => void;
    onRelaxationClick: () => void;
    onTodoListClick: () => void;
    onStoreClick?: () => void; 
    onDataStoreClick?: () => void;
    onOfflineClick?: () => void;
    installApp: () => void;
    settings: Settings;
    view: View;
    levelData?: UserLevelData;
    levelIcons?: {[key: number]: string};
}

const Tooltip: React.FC<{ text: string; position: 'top' | 'bottom' | 'left' | 'right' }> = ({ text, position }) => {
    let tooltipClasses = "absolute whitespace-nowrap bg-theme-darkest text-theme-lightest text-xs font-semibold px-2 py-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg border border-white/10";

    switch(position) {
        case 'top': tooltipClasses += " bottom-full mb-2 left-1/2 -translate-x-1/2"; break;
        case 'bottom': tooltipClasses += " top-full mt-2 left-1/2 -translate-x-1/2"; break;
        case 'left': tooltipClasses += " right-full mr-3 top-1/2 -translate-y-1/2"; break;
        case 'right': tooltipClasses += " left-full ml-3 top-1/2 -translate-y-1/2"; break;
    }

    return <span className={tooltipClasses}>{text}</span>;
};

// Component hiển thị User Info & Level
const UserLevelDisplay: React.FC<{ settings: Settings; levelData?: UserLevelData; levelIcons?: {[key: number]: string}; textMain: string }> = ({ settings, levelData, levelIcons, textMain }) => {
    if (!levelData || !levelIcons) return <span className={`text-sm font-bold hidden lg:block ${textMain}`}>{settings.username || 'Wibu'}</span>;

    const progressPercent = Math.min((levelData.currentXP / levelData.nextLevelXP) * 100, 100);

    return (
        <div className="flex flex-col items-start min-w-[100px] hidden lg:flex">
            <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${textMain}`}>{settings.username || 'Wibu'}</span>
                <img src={levelIcons[levelData.currentLevel]} alt={`Lv${levelData.currentLevel}`} className="h-5 w-auto object-contain" />
            </div>
            {/* XP Bar */}
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-0.5 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-theme-mint to-theme-lime rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <span className="text-[9px] opacity-70 font-mono mt-0.5 ml-auto">{levelData.currentXP}/{levelData.nextLevelXP} XP</span>
        </div>
    );
}

const Header: React.FC<HeaderProps> = ({ onDonateClick, onHomeClick, onSearchClick, onGlossaryClick, onRankingClick, onScheduleClick, onMusicClick, onSettingsClick, onLikedImagesClick, onCssEditorClick, onRandomClick, onRelaxationClick, onTodoListClick, onStoreClick, onDataStoreClick, onOfflineClick, installApp, settings, view, levelData, levelIcons }) => {
    const [time, setTime] = useState('');
    const [avatarError, setAvatarError] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateClock();
        const timerId = setInterval(updateClock, 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        setAvatarError(false);
    }, [settings.avatarUrl]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onSettingsChangeClick = onSettingsClick;

    const renderLevelBadge = () => {
        if (!levelData || !levelIcons) return null;
        return (
             <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-black overflow-hidden bg-white z-10">
                <img src={levelIcons[levelData.currentLevel]} className="w-full h-full object-contain" />
            </div>
        );
    };

    // --- STYLE: MINIMAL TABS ---
    if (settings.headerStyle === 'minimal-tabs') {
        const menuItems = [
            { id: 'home', icon: HomeIcon, onClick: onHomeClick, label: 'Trang chủ' },
            { id: 'search', icon: SearchIcon, onClick: onSearchClick, label: 'Tìm kiếm' },
            { id: 'ranking', icon: TrophyIcon, onClick: onRankingClick, label: 'BXH' },
            { id: 'schedule', icon: CalendarDaysIcon, onClick: onScheduleClick, label: 'Lịch' },
            { id: 'music', icon: WaifuIcon, onClick: onMusicClick, label: 'Waifu' },
        ];

        const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
        const headerBg = isGlass 
            ? 'glass-card border-b border-white/20' 
            : 'bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm';
        const textMain = isGlass ? 'text-theme-darkest dark:text-theme-lightest' : 'text-slate-800 dark:text-slate-200';
        
        return (
            <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
                <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-theme-lime to-theme-mint flex items-center justify-center shadow-lg shadow-theme-lime/20">
                             <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-theme-darkest" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className={`text-xl font-black tracking-tighter hidden sm:block ${textMain}`}>AniW</span>
                    </div>

                    {/* Center: Tabs */}
                    <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar px-2">
                        {menuItems.map((item) => {
                            const isActive = view === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm whitespace-nowrap
                                        ${isActive 
                                            ? 'bg-theme-lime text-theme-darkest shadow-md shadow-theme-lime/20' 
                                            : `hover:bg-black/5 dark:hover:bg-white/10 ${textMain} opacity-70 hover:opacity-100`
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="hidden md:inline">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right: User & Utils */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={onStoreClick} className={`p-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 ${textMain} relative group`} title="Cửa hàng">
                             <ShoppingBagIcon className="w-5 h-5" />
                             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        <div className="h-6 w-px bg-current opacity-10"></div>

                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-3 group text-left"
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-theme-lime transition-all relative">
                                    <img
                                        src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={() => setAvatarError(true)}
                                    />
                                     {/* Level Badge Mobile */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-theme-lime rounded-full border border-white dark:border-black lg:hidden"></div>
                                </div>
                                
                                <UserLevelDisplay settings={settings} levelData={levelData} levelIcons={levelIcons} textMain={textMain} />

                                <SettingsIcon className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ${textMain} hidden lg:block`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className={`absolute top-full right-0 mt-3 w-64 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/10 ${isGlass ? 'glass-card' : 'bg-white dark:bg-[#1a1a1a]'}`}>
                                    {/* Mobile Level Info */}
                                    <div className="lg:hidden p-3 border-b border-white/10 bg-theme-lime/10">
                                         <div className="flex items-center gap-2 mb-2">
                                            <span className={`font-bold ${textMain}`}>{settings.username}</span>
                                            {levelData && levelIcons && <img src={levelIcons[levelData.currentLevel]} className="h-4" />}
                                         </div>
                                         {levelData && (
                                             <>
                                                <div className="w-full h-1.5 bg-gray-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-theme-lime" style={{ width: `${Math.min((levelData.currentXP / levelData.nextLevelXP) * 100, 100)}%` }}></div>
                                                </div>
                                                <div className="text-[10px] text-right mt-1 opacity-70">{levelData.currentXP}/{levelData.nextLevelXP} XP</div>
                                             </>
                                         )}
                                    </div>

                                    <div className="p-3 border-b border-white/10">
                                        <p className={`text-xs font-bold opacity-50 uppercase tracking-wider mb-2 ${textMain}`}>Tiện ích</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button onClick={() => { onOfflineClick && onOfflineClick(); setIsMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Offline">
                                                <DownloadIcon className={`w-5 h-5 ${textMain}`} />
                                            </button>
                                            <button onClick={() => { onDataStoreClick && onDataStoreClick(); setIsMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Data">
                                                <DatabaseIcon className={`w-5 h-5 ${textMain}`} />
                                            </button>
                                            <button onClick={() => { onTodoListClick(); setIsMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Todo">
                                                <ClipboardCheckIcon className={`w-5 h-5 ${textMain}`} />
                                            </button>
                                            <button onClick={() => { onCssEditorClick(); setIsMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="CSS">
                                                <CodeBracketSquareIcon className={`w-5 h-5 ${textMain}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button onClick={() => { onSettingsChangeClick(); setIsMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${textMain}`}>
                                            <SettingsIcon className="w-5 h-5" /> Cài đặt chung
                                        </button>
                                        <button onClick={() => { onDonateClick(); setIsMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${textMain}`}>
                                            <QRCodeIcon className="w-5 h-5" /> Ủng hộ Admin
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    if (settings.headerStyle === 'focus-ui') {
        const pos = settings.headerPosition === 'top' ? 'top-6' : 'bottom-6'; 
        const menuItems = [
            { id: 'home', icon: HomeIcon, onClick: onHomeClick, label: 'Trang chủ' },
            { id: 'search', icon: SearchIcon, onClick: onSearchClick, label: 'Tìm kiếm' },
            { id: 'ranking', icon: TrophyIcon, onClick: onRankingClick, label: 'BXH' },
            { id: 'music', icon: WaifuIcon, onClick: onMusicClick, label: 'Waifu' },
        ];

        return (
            <header className={`fixed ${pos} left-1/2 -translate-x-1/2 z-50 max-w-[90vw]`}>
                <nav className="relative flex items-center gap-1 px-2 py-2 rounded-full shadow-[0_10px_40px_-10px_rgba(76,29,149,0.5)] border border-white/10 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02]"
                     style={{ background: 'linear-gradient(90deg, rgba(46,16,101,0.85) 0%, rgba(30,58,138,0.85) 100%)' }}>
                    
                    <div className="pl-2 pr-4 flex items-center gap-3 border-r border-white/10 mr-1">
                         <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-indigo-900 shrink-0 relative">
                             {levelData && levelIcons ? <img src={levelIcons[levelData.currentLevel]} className="w-8 h-8 object-contain" /> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>}
                         </div>
                         <div className="flex flex-col">
                             <span className="text-white font-bold text-lg tracking-wide hidden sm:block truncate max-w-[100px] leading-none">{settings.username || 'Focus'}</span>
                             {levelData && <span className="text-[10px] text-yellow-400 font-mono hidden sm:block">LV.{levelData.currentLevel}</span>}
                         </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {menuItems.map((item) => {
                            const isActive = view === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    className={`relative group p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-white text-indigo-900 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span className="sr-only">{item.label}</span>
                                    {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-1 pl-2 ml-1 border-l border-white/10">
                         <button onClick={onStoreClick} className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5 relative">
                            <ShoppingBagIcon className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </button>

                         <button onClick={onSettingsClick} className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
                            <SettingsIcon className="w-5 h-5" />
                        </button>

                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden hover:border-white transition-colors ml-1 relative"
                            >
                                <img
                                    src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            </button>
                            {isMenuOpen && (
                                <div className={`absolute ${pos === 'top-6' ? 'top-full mt-4' : 'bottom-full mb-4'} right-0 w-60 rounded-2xl bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200 origin-bottom-right`}>
                                     {levelData && (
                                        <div className="p-3 bg-white/5 border-b border-white/10 text-center">
                                            <div className="text-xs text-slate-400">EXP Progress</div>
                                            <div className="w-full h-1 bg-white/10 rounded-full mt-1"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min((levelData.currentXP / levelData.nextLevelXP) * 100, 100)}%` }}></div></div>
                                            <div className="text-[10px] mt-1 text-right">{levelData.currentXP} / {levelData.nextLevelXP} XP</div>
                                        </div>
                                    )}
                                    <div className="p-2 space-y-1">
                                        <button onClick={() => { onOfflineClick && onOfflineClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <DownloadIcon className="w-5 h-5 text-teal-400" /> Video đã tải (Offline)
                                        </button>
                                         <button onClick={() => { onDataStoreClick && onDataStoreClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <DatabaseIcon className="w-5 h-5 text-indigo-300" /> Kho dữ liệu
                                        </button>
                                        <button onClick={() => { onTodoListClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <ClipboardCheckIcon className="w-5 h-5 text-indigo-400" /> Tiện ích
                                        </button>
                                        <button onClick={() => { onRelaxationClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <SparklesIcon className="w-5 h-5 text-pink-400" /> Thư giãn
                                        </button>
                                        <button onClick={() => { onLikedImagesClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <HeartIcon className="w-5 h-5 text-red-400" /> Ảnh đã thích
                                        </button>
                                        <button onClick={() => { onRandomClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <ShuffleIcon className="w-5 h-5 text-green-400" /> Anime Random
                                        </button>
                                        <button onClick={() => { onCssEditorClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl hover:bg-white/10 transition-colors">
                                            <CodeBracketSquareIcon className="w-5 h-5 text-blue-400" /> CSS Editor
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>
        );
    }

    if (settings.headerStyle === 'sidebar-curved') {
        const pos = settings.headerPosition;
        const sidebarBg = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'glass-card' : 'bg-white dark:bg-theme-darkest shadow-xl';
        const textColor = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest' : 'text-slate-600 dark:text-slate-400';
        
        let containerClasses = `fixed z-50 flex items-center py-2 transition-all duration-300 ${sidebarBg} `;
        let listClasses = "flex items-center justify-center gap-4 w-full h-full";
        let avatarPosClass = "relative";
        
        if (pos === 'left') {
            containerClasses += "left-0 top-0 h-full w-20 flex-col py-6";
            listClasses = "flex-col gap-4 overflow-y-auto no-scrollbar w-full";
            avatarPosClass = "mb-6 relative";
        } else if (pos === 'right') {
            containerClasses += "right-0 top-0 h-full w-20 flex-col py-6";
            listClasses = "flex-col gap-4 overflow-y-auto no-scrollbar w-full";
            avatarPosClass = "mb-6 relative";
        } else if (pos === 'top') {
            containerClasses += "top-0 left-0 w-full h-20 flex-row px-6";
            listClasses = "flex-row gap-6 overflow-x-auto no-scrollbar h-full";
            avatarPosClass = "mr-6 order-first relative";
        } else { 
            containerClasses += "bottom-0 left-0 w-full h-20 flex-row px-6";
            listClasses = "flex-row gap-6 overflow-x-auto no-scrollbar h-full";
            avatarPosClass = "mr-6 order-first relative";
        }

        let menuPositionClass = "absolute z-50";
        if (pos === 'left') menuPositionClass += " left-full top-0 ml-2";
        else if (pos === 'right') menuPositionClass += " right-full top-0 mr-2";
        else if (pos === 'top') menuPositionClass += " top-full left-0 mt-2";
        else if (pos === 'bottom') menuPositionClass += " bottom-full left-0 mb-2";

        const menuItems = [
            { id: 'home', icon: HomeIcon, onClick: onHomeClick, label: 'Trang chủ' },
            { id: 'search', icon: SearchIcon, onClick: onSearchClick, label: 'Tìm kiếm' },
            { id: 'schedule', icon: CalendarDaysIcon, onClick: onScheduleClick, label: 'Lịch' },
            { id: 'glossary', icon: BookOpenIcon, onClick: onGlossaryClick, label: 'Thuật ngữ' },
            { id: 'ranking', icon: TrophyIcon, onClick: onRankingClick, label: 'Xếp hạng' },
            { id: 'music', icon: WaifuIcon, onClick: onMusicClick, label: 'Waifu' },
            // Added Store Button here
            { id: 'store', icon: ShoppingBagIcon, onClick: onStoreClick, label: 'Cửa hàng' },
            { id: 'donate', icon: QRCodeIcon, onClick: onDonateClick, label: 'Ủng hộ' },
        ];

        const getCurveStyles = (isActive: boolean) => {
            if (!isActive) return null;
            const curveSize = "w-5 h-5 bg-transparent z-0";
            const shadowColor = "var(--theme-lime)"; 

            if (pos === 'left') {
                return (
                    <>
                        <div className={`absolute right-0 -top-5 ${curveSize} rounded-br-full`} style={{ boxShadow: `5px 5px 0 0 ${shadowColor}` }}></div>
                        <div className={`absolute right-0 -bottom-5 ${curveSize} rounded-tr-full`} style={{ boxShadow: `5px -5px 0 0 ${shadowColor}` }}></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-12 bg-theme-lime rounded-l-full z-0 translate-x-2"></div>
                    </>
                );
            } else if (pos === 'right') {
                return (
                    <>
                        <div className={`absolute left-0 -top-5 ${curveSize} rounded-bl-full`} style={{ boxShadow: `-5px 5px 0 0 ${shadowColor}` }}></div>
                        <div className={`absolute left-0 -bottom-5 ${curveSize} rounded-tl-full`} style={{ boxShadow: `-5px -5px 0 0 ${shadowColor}` }}></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-12 bg-theme-lime rounded-r-full z-0 -translate-x-2"></div>
                    </>
                );
            } else if (pos === 'top') {
                return (
                    <>
                         <div className={`absolute bottom-0 -left-5 ${curveSize} rounded-br-full`} style={{ boxShadow: `5px 5px 0 0 ${shadowColor}` }}></div>
                         <div className={`absolute bottom-0 -right-5 ${curveSize} rounded-bl-full`} style={{ boxShadow: `-5px 5px 0 0 ${shadowColor}` }}></div>
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-14 w-12 bg-theme-lime rounded-t-full z-0 translate-y-2"></div>
                    </>
                );
            } else {
                return (
                    <>
                         <div className={`absolute top-0 -left-5 ${curveSize} rounded-tr-full`} style={{ boxShadow: `5px -5px 0 0 ${shadowColor}` }}></div>
                         <div className={`absolute top-0 -right-5 ${curveSize} rounded-tl-full`} style={{ boxShadow: `-5px -5px 0 0 ${shadowColor}` }}></div>
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-14 w-12 bg-theme-lime rounded-b-full z-0 -translate-y-2"></div>
                    </>
                );
            }
        };

        const getTooltipPos = () => {
            if (pos === 'left') return 'right';
            if (pos === 'right') return 'left';
            if (pos === 'top') return 'bottom';
            return 'top';
        };

        return (
            <div className={containerClasses}>
                <div className={avatarPosClass} ref={menuRef}>
                     <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-transparent ring-theme-lime/70 transition-transform hover:scale-110 relative"
                    >
                        <img
                            src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                        />
                        {renderLevelBadge()}
                    </button>
                     {isMenuOpen && (
                        <div className={`${menuPositionClass} w-56 rounded-xl shadow-lg overflow-hidden ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'glass-card' : 'bg-white dark:bg-theme-darkest border border-slate-200 dark:border-slate-700'}`}>
                            {levelData && (
                                <div className="p-2 bg-theme-lime/10 rounded-t-xl mb-1 text-center border-b border-white/10">
                                    <div className="text-xs font-bold text-theme-darkest dark:text-theme-lime">Level {levelData.currentLevel}</div>
                                     <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-theme-lime" style={{ width: `${Math.min((levelData.currentXP / levelData.nextLevelXP) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                            )}
                            <div className="py-1">
                                <button onClick={() => { onOfflineClick && onOfflineClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <DownloadIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Video đã tải
                                </button>
                                <button onClick={() => { onDataStoreClick && onDataStoreClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <DatabaseIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Kho dữ liệu
                                </button>
                                <button onClick={() => { onTodoListClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <ClipboardCheckIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Tiện ích (Widget)
                                </button>
                                 <button onClick={() => { onRelaxationClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <SparklesIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Thư giãn
                                </button>
                                 <button onClick={() => { onLikedImagesClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <HeartIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Ảnh đã thích
                                </button>
                                <button onClick={() => { onRandomClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <ShuffleIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Anime Random
                                </button>
                                <button onClick={() => { onCssEditorClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <CodeBracketSquareIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Tùy chỉnh CSS
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={listClasses}>
                    {menuItems.map((item) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const isActive = (view === item.id) || (item.id === 'store' && false); // Fake id logic for store if needed
                        return (
                            <div key={item.id} className={`relative flex justify-center group ${pos === 'left' || pos === 'right' ? 'w-full py-1' : 'h-full px-1'}`}>
                                {getCurveStyles(isActive)}
                                
                                <button
                                    onClick={item.onClick}
                                    className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'text-theme-darkest scale-110' : `${textColor} hover:bg-black/5 dark:hover:bg-white/10`}`}
                                >
                                    <item.icon className="w-6 h-6" />
                                </button>
                                <Tooltip text={item.label} position={getTooltipPos()} />
                            </div>
                        );
                    })}
                </div>

                <div className={`${pos === 'top' || pos === 'bottom' ? 'ml-6' : 'mt-auto mb-2'}`}>
                    <button onClick={onSettingsClick} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${textColor} hover:bg-black/5 dark:hover:bg-white/10`}>
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    const positionStyles = {
        top: {
            header: 'fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-2xl lg:max-w-4xl',
            nav: 'flex items-center justify-between',
            mainControls: 'flex items-center gap-2 sm:gap-3',
            userControls: 'flex items-center gap-2 sm:gap-4 sm:pr-1'
        },
        bottom: {
            header: 'fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-2xl lg:max-w-4xl',
            nav: 'flex items-center justify-between',
            mainControls: 'flex items-center gap-2 sm:gap-3',
            userControls: 'flex items-center gap-2 sm:gap-4 sm:pr-1'
        },
        left: {
            header: 'fixed left-2 top-1/2 -translate-y-1/2 md:left-4',
            nav: 'flex flex-col items-center justify-between gap-1 md:gap-4',
            mainControls: 'flex flex-col items-center gap-2',
            userControls: 'flex flex-col items-center gap-1 md:gap-4'
        },
        right: {
            header: 'fixed right-2 top-1/2 -translate-y-1/2 md:right-4',
            nav: 'flex flex-col items-center justify-between gap-1 md:gap-4',
            mainControls: 'flex flex-col items-center gap-2',
            userControls: 'flex flex-col items-center gap-1 md:gap-4'
        }
    };
    const styles = positionStyles[settings.headerPosition] || positionStyles.top;
    
    const navClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? 'glass-card' 
        : 'bg-white/70 dark:bg-[#121212]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/20 ring-1 ring-white/40 dark:ring-white/5';

    const getButtonClass = (buttonView: View) => {
        const baseClass = "p-2.5 rounded-full transition-all duration-300 flex items-center justify-center";
        const isActive = view === buttonView;

        if (['glass-ui', 'liquid-glass'].includes(settings.theme)) {
            return isActive
                ? `${baseClass} bg-theme-lime text-white shadow-lg scale-110`
                : `${baseClass} text-theme-darkest dark:text-theme-lightest hover:bg-white/20 hover:scale-105`;
        }
        
        return isActive
            ? `${baseClass} bg-theme-lime text-theme-darkest shadow-[0_0_20px_rgba(195,233,86,0.3)] ring-1 ring-white/50 scale-110`
            : `${baseClass} text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-transform hover:scale-105`;
    };
    
    const animationClass = settings.enableHoverAnimation ? 'transform hover:scale-110' : '';
    const avatarAnimationClass = settings.enableHoverAnimation ? 'transform hover:scale-110' : '';

    const donateButtonClass = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? `p-2.5 rounded-full transition-all duration-300 bg-theme-lime text-white shadow-[0_0_15px_rgba(255,112,140,0.7)] hover:shadow-[0_0_25px_rgba(255,112,140,0.9)] hover:scale-110`
        : `p-2.5 rounded-full transition-all duration-300 bg-theme-lime text-theme-darkest shadow-[0_0_15px_rgba(195,233,86,0.4)] hover:shadow-[0_0_25px_rgba(195,233,86,0.6)] ring-1 ring-black/5 hover:scale-110`;
    
    const tooltipPosition = settings.headerPosition === 'bottom' ? 'top' : 
                          settings.headerPosition === 'left' ? 'right' :
                          settings.headerPosition === 'right' ? 'left' :
                          'bottom';

    let menuPositionClass = "absolute z-50 right-0 mt-2"; 
    if (settings.headerPosition === 'bottom') {
        menuPositionClass = "absolute z-50 right-0 bottom-full mb-2";
    } else if (settings.headerPosition === 'left') {
        menuPositionClass = "absolute z-50 left-full top-0 ml-2";
    } else if (settings.headerPosition === 'right') {
        menuPositionClass = "absolute z-50 right-full top-0 mr-2";
    }

    return (
        <header className={`z-50 ${styles.header}`}>
            <nav className={`rounded-full p-2 ${styles.nav} ${navClasses}`}>
                <div className={styles.mainControls}>
                    <div className="relative group">
                        <button onClick={onHomeClick} className={`${getButtonClass('home')} ${animationClass}`} aria-label="Trang chủ">
                            <HomeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Trang chủ" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onSearchClick} className={`p-2.5 rounded-full transition-all duration-300 text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-105 ${animationClass}`} aria-label="Tìm kiếm">
                            <SearchIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Tìm kiếm" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onScheduleClick} className={`${getButtonClass('schedule')} ${animationClass}`} aria-label="Lịch phát sóng">
                            <CalendarDaysIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Lịch phát sóng" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onGlossaryClick} className={`${getButtonClass('glossary')} ${animationClass}`} aria-label="Thuật ngữ">
                            <BookOpenIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Thuật ngữ" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onRankingClick} className={`${getButtonClass('ranking')} ${animationClass}`} aria-label="Xếp hạng">
                            <TrophyIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Xếp hạng" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onMusicClick} className={`${getButtonClass('music')} ${animationClass}`} aria-label="Waifu">
                            <WaifuIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Waifu" position={tooltipPosition} />
                    </div>
                    {/* Store Button for Classic Theme */}
                    <div className="relative group">
                        <button onClick={onStoreClick} className={`p-2.5 rounded-full transition-all duration-300 text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-105 ${animationClass}`} aria-label="Cửa hàng">
                            <ShoppingBagIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Cửa hàng" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onDonateClick} className={`${donateButtonClass} ${animationClass}`} aria-label="Ủng hộ">
                            <QRCodeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Ủng hộ" position={tooltipPosition} />
                    </div>
                </div>

                <div className={styles.userControls}>
                    <span className={`font-mono text-base ${settings.headerPosition === 'left' || settings.headerPosition === 'right' ? 'hidden' : 'hidden sm:inline'} ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest' : 'text-slate-700 dark:text-slate-300'}`}>{time}</span>
                    
                    <div className="relative group">
                         <button onClick={onSettingsClick} className={`p-2.5 rounded-full transition-all duration-300 ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest hover:bg-white/20' : 'text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'} ${animationClass} hover:rotate-90`} aria-label="Cài đặt">
                            <SettingsIcon className="w-5 h-5 md:w-6 md:h-6"/>
                        </button>
                        <Tooltip text="Cài đặt" position={tooltipPosition} />
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-300 dark:bg-gray-700 overflow-hidden ring-2 ring-offset-2 ring-offset-transparent ring-theme-lime/70 transition-transform duration-300 ${avatarAnimationClass} cursor-pointer hover:ring-theme-lime relative`}
                        >
                             <img
                                src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                            {renderLevelBadge()}
                        </button>
                         {isMenuOpen && (
                            <div className={`${menuPositionClass} w-64 rounded-xl shadow-lg overflow-hidden ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'glass-card' : 'bg-white dark:bg-theme-darkest border border-slate-200 dark:border-slate-700'}`}>
                                {levelData && (
                                    <div className="p-2 bg-theme-lime/10 rounded-t-xl mb-1 text-center border-b border-white/10">
                                        <div className="text-xs font-bold text-theme-darkest dark:text-theme-lime">Level {levelData.currentLevel}</div>
                                         <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-theme-lime" style={{ width: `${Math.min((levelData.currentXP / levelData.nextLevelXP) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            onOfflineClick && onOfflineClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <DownloadIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Video đã tải (Offline)
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDataStoreClick && onDataStoreClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <DatabaseIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Kho dữ liệu
                                    </button>
                                    <button
                                        onClick={() => {
                                            onTodoListClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <ClipboardCheckIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Tiện ích (Widget)
                                    </button>
                                     <button
                                        onClick={() => {
                                            onRelaxationClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <SparklesIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Thư giãn
                                    </button>
                                    <button
                                        onClick={() => {
                                            onLikedImagesClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <HeartIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Ảnh đã thích
                                    </button>
                                    <button
                                        onClick={() => {
                                            onRandomClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <ShuffleIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Anime Random
                                    </button>
                                    <button
                                        onClick={() => {
                                            onCssEditorClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <CodeBracketSquareIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Tùy chỉnh CSS
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;


import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, SearchIcon, SettingsIcon, BookOpenIcon, TrophyIcon, CalendarDaysIcon, WaifuIcon, QRCodeIcon, HeartIcon, CodeBracketSquareIcon, ShoppingBagIcon, ShuffleIcon, SparklesIcon } from './icons';
import { Settings, View } from '../types';

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
    onStoreClick: () => void;
    onRandomClick: () => void;
    onRelaxationClick: () => void;
    settings: Settings;
    view: View;
}

const Tooltip: React.FC<{ text: string; position: 'top' | 'bottom' | 'left' | 'right' }> = ({ text, position }) => {
    let tooltipClasses = "absolute whitespace-nowrap bg-theme-darkest text-theme-lightest text-xs font-semibold px-2 py-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none z-10";

    switch(position) {
        case 'top':
            tooltipClasses += " bottom-full mb-2 left-1/2 -translate-x-1/2";
            break;
        case 'bottom':
            tooltipClasses += " top-full mt-2 left-1/2 -translate-x-1/2";
            break;
        case 'left':
            tooltipClasses += " right-full mr-3 top-1/2 -translate-y-1/2";
            break;
        case 'right':
            tooltipClasses += " left-full ml-3 top-1/2 -translate-y-1/2";
            break;
    }

    return <span className={tooltipClasses}>{text}</span>;
};

const Header: React.FC<HeaderProps> = ({ onDonateClick, onHomeClick, onSearchClick, onGlossaryClick, onRankingClick, onScheduleClick, onMusicClick, onSettingsClick, onLikedImagesClick, onCssEditorClick, onStoreClick, onRandomClick, onRelaxationClick, settings, view }) => {
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
        setAvatarError(false); // Reset error state when avatarUrl changes
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

    // --- RENDER FOR CURVED SIDEBAR STYLE ---
    if (settings.headerStyle === 'sidebar-curved') {
        const pos = settings.headerPosition;
        
        // Colors & Base classes
        const sidebarBg = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'glass-card' : 'bg-white dark:bg-theme-darkest shadow-xl';
        const textColor = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest' : 'text-slate-600 dark:text-slate-400';
        
        // Container Layout based on position
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
        } else { // bottom
            containerClasses += "bottom-0 left-0 w-full h-20 flex-row px-6";
            listClasses = "flex-row gap-6 overflow-x-auto no-scrollbar h-full";
            avatarPosClass = "mr-6 order-first relative";
        }

        // Calculate menu position based on sidebar position
        let menuPositionClass = "absolute z-50";
        if (pos === 'left') {
            menuPositionClass += " left-full top-0 ml-2";
        } else if (pos === 'right') {
            menuPositionClass += " right-full top-0 mr-2";
        } else if (pos === 'top') {
            menuPositionClass += " top-full left-0 mt-2";
        } else if (pos === 'bottom') {
            menuPositionClass += " bottom-full left-0 mb-2";
        }

        const menuItems = [
            { id: 'home', icon: HomeIcon, onClick: onHomeClick, label: 'Trang chủ' },
            { id: 'search', icon: SearchIcon, onClick: onSearchClick, label: 'Tìm kiếm' },
            { id: 'schedule', icon: CalendarDaysIcon, onClick: onScheduleClick, label: 'Lịch' },
            { id: 'glossary', icon: BookOpenIcon, onClick: onGlossaryClick, label: 'Thuật ngữ' },
            { id: 'ranking', icon: TrophyIcon, onClick: onRankingClick, label: 'Xếp hạng' },
            { id: 'music', icon: WaifuIcon, onClick: onMusicClick, label: 'Waifu' },
            { id: 'donate', icon: QRCodeIcon, onClick: onDonateClick, label: 'Ủng hộ' },
        ];

        // Curve Logic Helpers
        const getCurveStyles = (isActive: boolean) => {
            if (!isActive) return null;
            
            // Common curve styling
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
            } else { // bottom
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
                {/* Avatar Section */}
                <div className={avatarPosClass} ref={menuRef}>
                     <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-transparent ring-theme-lime/70 transition-transform hover:scale-110"
                    >
                        <img
                            src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                        />
                    </button>
                     {isMenuOpen && (
                        <div className={`${menuPositionClass} w-56 rounded-xl shadow-lg overflow-hidden ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'glass-card' : 'bg-white dark:bg-theme-darkest border border-slate-200 dark:border-slate-700'}`}>
                            <div className="py-1">
                                 <button onClick={() => { onRelaxationClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <SparklesIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Thư giãn
                                </button>
                                 <button onClick={() => { onLikedImagesClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <HeartIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Ảnh đã thích
                                </button>
                                <button onClick={() => { onStoreClick(); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors">
                                    <ShoppingBagIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" /> Cửa hàng giao diện
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

                {/* Navigation Items */}
                <div className={listClasses}>
                    {menuItems.map((item) => {
                        const isActive = (view === item.id) || (item.id === 'search' && false) || (item.id === 'donate' && false);
                        return (
                            <div key={item.id} className={`relative flex justify-center group ${pos === 'left' || pos === 'right' ? 'w-full py-1' : 'h-full px-1'}`}>
                                {getCurveStyles(isActive)}
                                
                                <button
                                    onClick={item.onClick}
                                    className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'text-theme-darkest scale-110' : `${textColor} hover:bg-black/5 dark:hover:bg-white/10`}`}
                                >
                                    <item.icon className="w-6 h-6" />
                                </button>
                                
                                {/* Tooltip */}
                                <Tooltip text={item.label} position={getTooltipPos()} />
                            </div>
                        );
                    })}
                </div>

                {/* Bottom/End Settings */}
                <div className={`${pos === 'top' || pos === 'bottom' ? 'ml-6' : 'mt-auto mb-2'}`}>
                    <button onClick={onSettingsClick} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${textColor} hover:bg-black/5 dark:hover:bg-white/10`}>
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }


    // --- RENDER FOR CLASSIC STYLE (Default) ---
    const positionStyles = {
        top: {
            header: 'fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-2xl lg:max-w-4xl',
            nav: 'flex items-center justify-between',
            mainControls: 'flex items-center gap-1 sm:gap-1',
            userControls: 'flex items-center gap-2 sm:gap-4 sm:pr-1'
        },
        bottom: {
            header: 'fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-2xl lg:max-w-4xl',
            nav: 'flex items-center justify-between',
            mainControls: 'flex items-center gap-1 sm:gap-1',
            userControls: 'flex items-center gap-2 sm:gap-4 sm:pr-1'
        },
        left: {
            header: 'fixed left-2 top-1/2 -translate-y-1/2 md:left-4',
            nav: 'flex flex-col items-center justify-between gap-1 md:gap-4',
            mainControls: 'flex flex-col items-center gap-1',
            userControls: 'flex flex-col items-center gap-1 md:gap-4'
        },
        right: {
            header: 'fixed right-2 top-1/2 -translate-y-1/2 md:right-4',
            nav: 'flex flex-col items-center justify-between gap-1 md:gap-4',
            mainControls: 'flex flex-col items-center gap-1',
            userControls: 'flex flex-col items-center gap-1 md:gap-4'
        }
    };
    const styles = positionStyles[settings.headerPosition] || positionStyles.top;
    
    const navClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? 'glass-card' 
        : 'bg-theme-mint/20 dark:bg-theme-darkest/40 backdrop-blur-lg border border-black/10 dark:border-white/10 shadow-2xl shadow-black/30';

    const getButtonClass = (buttonView: View) => {
        const baseClass = "p-2 md:p-2.5 rounded-full transition-all duration-300";
        const isActive = view === buttonView;

        if (['glass-ui', 'liquid-glass'].includes(settings.theme)) {
            return isActive
                ? `${baseClass} bg-theme-lime text-white`
                : `${baseClass} text-theme-darkest dark:text-theme-lightest hover:bg-white/20`;
        }
        
        return isActive
            ? `${baseClass} bg-theme-lime text-theme-darkest`
            : `${baseClass} text-theme-darkest dark:text-theme-lightest hover:bg-theme-lime/50`;
    };
    
    const animationClass = settings.enableHoverAnimation ? 'transform hover:scale-125' : '';
    const avatarAnimationClass = settings.enableHoverAnimation ? 'transform hover:scale-110' : '';


    const donateButtonClass = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? `p-2 md:p-2.5 rounded-full transition-all duration-300 bg-theme-lime text-white shadow-[0_0_15px_rgba(255,112,140,0.7)] hover:shadow-[0_0_25px_rgba(255,112,140,0.9)]`
        : `p-2 md:p-2.5 rounded-full transition-all duration-300 bg-theme-lime text-theme-darkest shadow-[0_0_15px_rgba(195,233,86,0.7)] hover:shadow-[0_0_25px_rgba(195,233,86,0.9)]`;
    
    const tooltipPosition = settings.headerPosition === 'bottom' ? 'top' : 
                          settings.headerPosition === 'left' ? 'right' :
                          settings.headerPosition === 'right' ? 'left' :
                          'bottom';

    // Dynamic menu positioning for Classic Style
    let menuPositionClass = "absolute z-50 right-0 mt-2"; // Default Top behavior
    if (settings.headerPosition === 'bottom') {
        menuPositionClass = "absolute z-50 right-0 bottom-full mb-2";
    } else if (settings.headerPosition === 'left') {
        menuPositionClass = "absolute z-50 left-full top-0 ml-2";
    } else if (settings.headerPosition === 'right') {
        menuPositionClass = "absolute z-50 right-full top-0 mr-2";
    }

    return (
        <header className={`z-50 ${styles.header}`}>
            <nav className={`rounded-full p-1.5 md:p-2 ${styles.nav} ${navClasses}`}>
                <div className={styles.mainControls}>
                    <div className="relative group">
                        <button onClick={onHomeClick} className={`${getButtonClass('home')} ${animationClass}`} aria-label="Trang chủ">
                            <HomeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Trang chủ" position={tooltipPosition} />
                    </div>
                    <div className="relative group">
                        <button onClick={onSearchClick} className={`p-2 md:p-2.5 rounded-full transition-all duration-300 text-theme-darkest dark:text-theme-lightest hover:bg-theme-lime/50 ${animationClass}`} aria-label="Tìm kiếm">
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
                    <div className="relative group">
                        <button onClick={onDonateClick} className={`${donateButtonClass} ${animationClass}`} aria-label="Ủng hộ">
                            <QRCodeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Ủng hộ" position={tooltipPosition} />
                    </div>
                </div>

                <div className={styles.userControls}>
                    <span className={`font-mono text-base ${settings.headerPosition === 'left' || settings.headerPosition === 'right' ? 'hidden' : 'hidden sm:inline'} ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest' : 'text-theme-darkest dark:text-theme-lightest'}`}>{time}</span>
                    <div className="relative group">
                         <button onClick={onSettingsClick} className={`p-2 rounded-full transition-all duration-300 ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest hover:bg-white/20' : 'text-theme-darkest dark:text-theme-lightest hover:bg-theme-lime/50'} ${animationClass}`} aria-label="Cài đặt">
                            <SettingsIcon className="w-5 h-5 md:w-6 md:h-6"/>
                        </button>
                        <Tooltip text="Cài đặt" position={tooltipPosition} />
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-300 dark:bg-gray-700 overflow-hidden ring-2 ring-offset-2 ring-offset-transparent ring-theme-lime/70 transition-transform duration-300 ${avatarAnimationClass} cursor-pointer`}
                        >
                             <img
                                src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        </button>
                         {isMenuOpen && (
                            <div className={`${menuPositionClass} w-56 rounded-xl shadow-lg overflow-hidden ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'glass-card' : 'bg-theme-lightest dark:bg-theme-darkest border border-slate-200 dark:border-slate-700'}`}>
                                <div className="py-1">
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
                                            onStoreClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-theme-mint/30 dark:hover:bg-theme-olive/30 transition-colors"
                                    >
                                        <ShoppingBagIcon className="w-5 h-5 text-theme-olive dark:text-theme-lime" />
                                        Cửa hàng giao diện
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

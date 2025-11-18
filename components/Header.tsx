import React, { useState, useEffect } from 'react';
import { HomeIcon, SearchIcon, SettingsIcon, BookOpenIcon, TrophyIcon, CalendarDaysIcon, WaifuIcon, QRCodeIcon } from './icons';
import { Settings } from '../types';
import { View } from '../App';

interface HeaderProps {
    onDonateClick: () => void;
    onHomeClick: () => void;
    onSearchClick: () => void;
    onGlossaryClick: () => void;
    onRankingClick: () => void;
    onScheduleClick: () => void;
    onMusicClick: () => void;
    onSettingsClick: () => void;
    settings: Settings;
    view: View;
}

const Header: React.FC<HeaderProps> = ({ onDonateClick, onHomeClick, onSearchClick, onGlossaryClick, onRankingClick, onScheduleClick, onMusicClick, onSettingsClick, settings, view }) => {
    const [time, setTime] = useState('');
    const [avatarError, setAvatarError] = useState(false);

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

    const Tooltip: React.FC<{ text: string }> = ({ text }) => {
        const position = settings.headerPosition;
        let tooltipClasses = "absolute whitespace-nowrap bg-theme-darkest text-theme-lightest text-xs font-semibold px-2 py-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none z-10";

        switch(position) {
            case 'top':
                tooltipClasses += " bottom-full mb-2 left-1/2 -translate-x-1/2";
                break;
            case 'bottom':
                tooltipClasses += " top-full mt-2 left-1/2 -translate-x-1/2";
                break;
            case 'left':
                tooltipClasses += " left-full ml-3 top-1/2 -translate-y-1/2";
                break;
            case 'right':
                tooltipClasses += " right-full mr-3 top-1/2 -translate-y-1/2";
                break;
        }

        return <span className={tooltipClasses}>{text}</span>;
    };


    return (
        <header className={`z-50 ${styles.header}`}>
            <nav className={`rounded-full p-1.5 md:p-2 ${styles.nav} ${navClasses}`}>
                <div className={styles.mainControls}>
                    <div className="relative group">
                        <button onClick={onHomeClick} className={`${getButtonClass('home')} ${animationClass}`} aria-label="Trang chủ">
                            <HomeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Trang chủ" />
                    </div>
                    <div className="relative group">
                        <button onClick={onSearchClick} className={`p-2 md:p-2.5 rounded-full transition-all duration-300 text-theme-darkest dark:text-theme-lightest hover:bg-theme-lime/50 ${animationClass}`} aria-label="Tìm kiếm">
                            <SearchIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Tìm kiếm" />
                    </div>
                    <div className="relative group">
                        <button onClick={onScheduleClick} className={`${getButtonClass('schedule')} ${animationClass}`} aria-label="Lịch phát sóng">
                            <CalendarDaysIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Lịch phát sóng" />
                    </div>
                    <div className="relative group">
                        <button onClick={onGlossaryClick} className={`${getButtonClass('glossary')} ${animationClass}`} aria-label="Thuật ngữ">
                            <BookOpenIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Thuật ngữ" />
                    </div>
                    <div className="relative group">
                        <button onClick={onRankingClick} className={`${getButtonClass('ranking')} ${animationClass}`} aria-label="Xếp hạng">
                            <TrophyIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Xếp hạng" />
                    </div>
                    <div className="relative group">
                        <button onClick={onMusicClick} className={`${getButtonClass('music')} ${animationClass}`} aria-label="Waifu">
                            <WaifuIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Waifu" />
                    </div>
                    <div className="relative group">
                        <button onClick={onDonateClick} className={`${donateButtonClass} ${animationClass}`} aria-label="Ủng hộ">
                            <QRCodeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <Tooltip text="Ủng hộ" />
                    </div>
                </div>

                <div className={styles.userControls}>
                    <span className={`font-mono text-base ${settings.headerPosition === 'left' || settings.headerPosition === 'right' ? 'hidden' : 'hidden sm:inline'} ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest' : 'text-theme-darkest dark:text-theme-lightest'}`}>{time}</span>
                    <div className="relative group">
                         <button onClick={onSettingsClick} className={`p-2 rounded-full transition-all duration-300 ${['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'text-theme-darkest dark:text-theme-lightest hover:bg-white/20' : 'text-theme-darkest dark:text-theme-lightest hover:bg-theme-lime/50'} ${animationClass}`} aria-label="Cài đặt">
                            <SettingsIcon className="w-5 h-5 md:w-6 md:h-6"/>
                        </button>
                        <Tooltip text="Cài đặt" />
                    </div>
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-300 dark:bg-gray-700 overflow-hidden ring-2 ring-offset-2 ring-offset-transparent ring-theme-lime/70 transition-transform duration-300 ${avatarAnimationClass}`}>
                         <img
                            src={avatarError ? "https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg" : settings.avatarUrl}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                        />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { AiringAnime, Settings } from '../types';
import { BackIcon as ChevronLeftIcon, ChevronRightIcon, BookmarkSolidIcon } from './icons';

interface AiringScheduleProps {
    settings: Settings;
    containerClassName?: string;
}

type ScheduledAnime = AiringAnime & { episode?: number };

const getSeason = (date: Date): 'winter' | 'spring' | 'summer' | 'fall' => {
    const month = date.getMonth();
    if (month < 3) return 'winter';
    if (month < 6) return 'spring';
    if (month < 9) return 'summer';
    return 'fall';
};

const dayNameToIndex: { [key: string]: number } = {
    mondays: 0, tuesdays: 1, wednesdays: 2, thursdays: 3, fridays: 4, saturdays: 5, sundays: 6
};

const AiringSchedule: React.FC<AiringScheduleProps> = ({ settings, containerClassName }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedule, setSchedule] = useState<{ [key: number]: ScheduledAnime[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const year = currentDate.getFullYear();
        const season = getSeason(currentDate);

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
                if (!response.ok) {
                    if (response.status === 429) throw new Error('Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau giây lát.');
                    throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
                }
                const data = await response.json();
                
                const monthlySchedule: { [key: number]: ScheduledAnime[] } = {};

                (data.data || []).forEach((anime: AiringAnime) => {
                    if (anime.aired?.from && anime.broadcast?.day) {
                        const premiereDate = new Date(anime.aired.from);
                        premiereDate.setHours(0, 0, 0, 0);
                        
                        const broadcastDayIndex = dayNameToIndex[anime.broadcast.day.toLowerCase()];
                        if (broadcastDayIndex === undefined) return;
                        
                        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                        for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
                            const currentDayIndex = (d.getDay() + 6) % 7; // Monday is 0
                            
                            if (currentDayIndex === broadcastDayIndex && d >= premiereDate) {
                                const dayOfMonth = d.getDate();
                                if (!monthlySchedule[dayOfMonth]) {
                                    monthlySchedule[dayOfMonth] = [];
                                }
                                
                                const weeksSincePremiere = Math.floor((d.getTime() - premiereDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
                                const episodeNumber = (anime.episodes === 1) ? 1 : 1 + weeksSincePremiere;
                                
                                if (!anime.episodes || episodeNumber <= anime.episodes) {
                                    if (!monthlySchedule[dayOfMonth].some(a => a.mal_id === anime.mal_id)) {
                                       monthlySchedule[dayOfMonth].push({ ...anime, episode: episodeNumber });
                                    }
                                }
                            }
                        }
                    }
                });
                
                setSchedule(monthlySchedule);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentDate]);

    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    const calendarDays = [];
    for (let i = adjustedFirstDay; i > 0; i--) {
        calendarDays.push({ day: prevMonthLastDate - i + 1, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, isCurrentMonth: true, animes: schedule[i] || [] });
    }
    while (calendarDays.length < 42) { // Ensure 6 rows
        calendarDays.push({ day: calendarDays.length - daysInMonth - adjustedFirstDay + 1, isCurrentMonth: false });
    }

    const monthYearFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
    
    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);

    const containerBgClasses = isGlass
        ? 'glass-card'
        : 'bg-theme-lightest/60 dark:bg-theme-darkest/60';

    return (
        <main className={containerClassName}>
            <div className={`${containerBgClasses} text-theme-darkest dark:text-theme-lightest h-full flex flex-col p-2 sm:p-4 rounded-2xl`}>
                <header className="flex items-center justify-between p-2 mb-2 flex-shrink-0">
                    <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-theme-darkest/10 dark:hover:bg-theme-lightest/10 transition-colors">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold tracking-wide">{monthYearFormat.format(currentDate)}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-theme-darkest/10 dark:hover:bg-theme-lightest/10 transition-colors">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <div className="grid grid-cols-7 text-center font-semibold text-xs text-theme-olive dark:text-theme-mint pb-2 flex-shrink-0">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
                </div>
                {loading ? (
                     <div className="flex-grow flex justify-center items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-theme-lime"></div>
                     </div>
                ) : error ? (
                    <div className="flex-grow flex justify-center items-center text-center p-4">
                        <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg">
                            <h2 className="text-xl font-bold text-red-400 mb-4">Đã xảy ra lỗi</h2>
                            <p className="text-slate-300">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 grid-rows-6 flex-grow min-h-0">
                         {calendarDays.map((calDay, index) => (
                            <div key={index} className={`border-r border-t border-theme-darkest/10 dark:border-theme-lightest/10 p-1 sm:p-2 flex flex-col min-h-0 ${!calDay.isCurrentMonth ? (isGlass ? 'bg-black/10' : 'bg-black/5 dark:bg-black/20') : ''}`}>
                                <span className={`text-xs self-start ${calDay.isCurrentMonth ? 'text-theme-darkest/80 dark:text-theme-lightest/80' : 'text-theme-darkest/40 dark:text-theme-lightest/40'}`}>{calDay.day}</span>
                                <div className="flex-grow overflow-y-auto space-y-1.5 mt-1 no-scrollbar">
                                    {calDay.animes?.map(anime => (
                                        <div key={anime.mal_id + '-' + calDay.day} className="relative rounded-md overflow-hidden text-white text-xs group cursor-pointer">
                                            <img src={anime.images.jpg.image_url} alt={anime.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                                            <div className="relative p-1.5 bg-theme-darkest/70 dark:bg-black/70">
                                                <div className="flex justify-between items-start gap-1">
                                                    <p className="font-semibold line-clamp-1 leading-snug flex items-center gap-1">
                                                        <BookmarkSolidIcon className="w-3 h-3 text-theme-lime flex-shrink-0" />
                                                        {anime.title}
                                                    </p>
                                                    {anime.episode && <span className="text-white/80 flex-shrink-0 font-mono text-[10px]">Ep.{anime.episode}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </main>
    );
};

export default AiringSchedule;
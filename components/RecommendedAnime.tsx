import React, { useState, useEffect, useRef } from 'react';
import { Anime, Settings } from '../types';

interface RecommendedAnimeProps {
    animeList: Anime[];
    onSelectAnime: (anime: Anime) => void;
    settings: Settings;
}

const RecommendedAnime: React.FC<RecommendedAnimeProps> = ({ animeList, onSelectAnime, settings }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);

    const activeAnime = animeList[activeIndex];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : animeList.length - 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < animeList.length - 1 ? prev + 1 : 0));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [animeList.length]);

    useEffect(() => {
        if (listRef.current) {
            const activeElement = listRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [activeIndex]);

    if (!activeAnime) return null;

    const getEpisodeNumber = (title: string): number => {
        const match = title.match(/(?:Tập|Episode)?\s*(\d+(\.\d+)?)/i);
        if (match && match[1]) {
            return parseFloat(match[1]);
        }
        const numMatch = title.match(/^(\d+(\.\d+)?)$/);
        if (numMatch && numMatch[1]) {
            return parseFloat(numMatch[1]);
        }
        return -1;
    };
    
    const sortedEpisodes = [...activeAnime.episodes].sort((a, b) => {
        const numA = getEpisodeNumber(a.episodeTitle);
        const numB = getEpisodeNumber(b.episodeTitle);
        return numB - numA;
    });

    const lastEpisode = sortedEpisodes[0];
    
    const getPreviewLink = (link: string | undefined): string => {
        if (!link) return '';
        try {
            const url = new URL(link);
            url.searchParams.set('autoplay', '1');
            url.searchParams.set('mute', '1');
            url.searchParams.set('controls', '0');
            url.searchParams.set('loop', '1');
            return url.toString();
        } catch (e) {
            const params = 'autoplay=1&mute=1&controls=0&loop=1';
            return link.includes('?') ? `${link}&${params}` : `${link}?${params}`;
        }
    };

    const previewSrc = getPreviewLink(lastEpisode?.link);

    const listWidth = 'md:w-[28rem]';

    const containerClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? 'glass-card'
        : 'bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/10';
        
    const hoverEffectClass = settings.enableHoverAnimation ? 'transform hover:scale-[1.02] transition-transform' : '';


    return (
        <div className={`w-full h-full rounded-3xl shadow-2xl flex flex-col-reverse md:flex-row p-1 sm:p-2 gap-2 ${containerClasses}`}>
            {/* Sidebar (List) */}
            <div className={`flex-shrink-0 w-full h-1/3 md:h-full rounded-2xl ${listWidth}`}>
                 <div className="h-full w-full overflow-y-auto p-1 sm:p-2 no-scrollbar">
                     <ul ref={listRef} className="space-y-1">
                        {animeList.map((anime, index) => (
                            <li key={anime.name} data-index={index}>
                                <button
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => onSelectAnime(anime)}
                                    className={`w-full text-left p-3 h-20 transition-all duration-300 relative block rounded-xl flex items-center group ${
                                        activeIndex === index
                                            ? 'bg-theme-lime/20 dark:bg-theme-lime/10 border-l-4 border-theme-lime'
                                            : 'border-l-4 border-transparent hover:bg-slate-500/10'
                                    } ${hoverEffectClass}`}
                                >
                                    <span className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-sm font-bold transition-all duration-300 ${activeIndex === index ? 'text-theme-lime -translate-x-2' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="pl-8 sm:pl-10">
                                        <h3 className={`text-base font-semibold transition-all duration-300 line-clamp-2 ${activeIndex === index ? 'text-theme-darkest dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {anime.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{anime.episodes.length} tập</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Main View (Video Preview) */}
            <div className="flex-grow w-full h-2/3 md:h-full relative overflow-hidden group rounded-2xl bg-slate-300 dark:bg-slate-900">
                 {previewSrc ? (
                    <iframe
                        key={activeIndex}
                        src={previewSrc}
                        title={activeAnime.name}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen={false}
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        className="w-full h-full absolute inset-0 pointer-events-none animate-fade-in"
                    ></iframe>
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <p className="text-slate-400">Không có video xem trước</p>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent pointer-events-none md:w-1/2"></div>
                
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 md:bottom-12 md:left-12 max-w-lg">
                    <div key={activeIndex} className="animate-slide-up">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                            {activeAnime.name}
                        </h2>
                        <button 
                            onClick={() => onSelectAnime(activeAnime)}
                            className="px-6 py-3 bg-theme-lime text-theme-darkest font-bold rounded-full text-base sm:text-lg hover:scale-105 transition-transform duration-300"
                        >
                            Xem ngay
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes fade-in {
                    from { opacity: 0; transform: scale(1.05); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.7s ease-out forwards; }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.5s 0.2s ease-out forwards; }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default RecommendedAnime;
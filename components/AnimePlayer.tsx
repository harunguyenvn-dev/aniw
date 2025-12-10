
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Anime, Episode, Settings, DownloadTask } from '../types';
import Notes from './Notes';
import CommentSection from './CommentSection';
import { 
    BackIcon, DownloadIcon, CheckIcon, HeartIcon, BookmarkSolidIcon, 
    ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
    ChatBubbleOvalLeftIcon, ClockIcon, CalendarDaysIcon, 
    ClipboardCheckIcon, SparklesIcon,
    TrashIcon
} from './icons';

declare var Hls: any;

interface AnimePlayerProps {
    anime: Anime;
    settings: Settings;
    onClose: () => void;
    containerClassName?: string;
    allowDownload?: boolean;
    downloadQueue?: DownloadTask[];
    addToQueue?: (task: DownloadTask) => void;
}

// --- MINI WIDGETS (Cho gọn code) ---

const MiniStopwatch: React.FC = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => setTime(t => t + 10), 10);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const format = (t: number) => {
        const min = Math.floor(t / 60000);
        const sec = Math.floor((t % 60000) / 1000);
        const ms = Math.floor((t % 1000) / 10);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-4xl font-mono font-bold tracking-widest text-theme-darkest dark:text-theme-lightest mb-6">
                {format(time)}
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${isRunning ? 'bg-red-500 text-white' : 'bg-theme-lime text-theme-darkest'}`}
                >
                    {isRunning ? 'Dừng' : 'Bắt đầu'}
                </button>
                <button 
                    onClick={() => { setIsRunning(false); setTime(0); }}
                    className="px-6 py-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-300"
                >
                    Đặt lại
                </button>
            </div>
        </div>
    );
};

const MiniTodo: React.FC = () => {
    const [todos, setTodos] = useState<{id: number, text: string, done: boolean}[]>(() => {
        try { return JSON.parse(localStorage.getItem('mini_player_todos') || '[]'); } catch { return []; }
    });
    const [input, setInput] = useState('');

    useEffect(() => { localStorage.setItem('mini_player_todos', JSON.stringify(todos)); }, [todos]);

    const add = (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, done: false }]);
        setInput('');
    };

    const toggle = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const remove = (id: number) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <div className="h-full flex flex-col p-4">
            <h3 className="font-bold mb-3 text-theme-darkest dark:text-theme-lightest">Danh sách việc cần làm</h3>
            <form onSubmit={add} className="flex gap-2 mb-4">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    placeholder="Thêm việc mới..."
                    className="flex-1 bg-white/50 dark:bg-black/20 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-theme-lime"
                />
            </form>
            <ul className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {todos.map(t => (
                    <li key={t.id} className="flex items-center gap-2 bg-white/40 dark:bg-black/10 p-2 rounded-lg group">
                        <button onClick={() => toggle(t.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${t.done ? 'bg-theme-lime border-theme-lime' : 'border-slate-400'}`}>
                            {t.done && <CheckIcon className="w-3 h-3 text-theme-darkest" />}
                        </button>
                        <span className={`flex-1 text-sm truncate ${t.done ? 'line-through opacity-50' : ''} text-theme-darkest dark:text-theme-lightest`}>{t.text}</span>
                        <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-100 p-1 rounded">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
                {todos.length === 0 && <p className="text-center text-xs opacity-50 mt-10">Trống trơn! Tập trung xem anime thôi!</p>}
            </ul>
        </div>
    );
};

const MiniCalendar: React.FC = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); // 0 is Sunday
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Mon starts at 0

    const days = [];
    for(let i=0; i<adjustedFirstDay; i++) days.push(null);
    for(let i=1; i<=daysInMonth; i++) days.push(i);

    return (
        <div className="h-full p-4 flex flex-col">
            <div className="text-center font-bold text-lg mb-4 text-theme-darkest dark:text-theme-lightest">
                Tháng {today.getMonth() + 1} / {today.getFullYear()}
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-bold mb-2 opacity-60 text-theme-darkest dark:text-theme-lightest">
                <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm flex-1">
                {days.map((d, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center rounded-lg ${d === today.getDate() ? 'bg-theme-lime text-theme-darkest font-bold' : d ? 'hover:bg-black/5 dark:hover:bg-white/10 text-theme-darkest dark:text-theme-lightest' : ''}`}>
                        {d}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

const AnimePlayer: React.FC<AnimePlayerProps> = ({ 
    anime, 
    settings, 
    onClose, 
    containerClassName, 
    allowDownload = false,
    downloadQueue = [],
    addToQueue 
}) => {
    const { blockNewTabs, disablePopupPlayer, theme, resizablePanes } = settings;
    const [currentEpisode, setCurrentEpisode] = useState<Episode>(anime.episodes[0]);
    
    // Popup Player State
    const [isEpisodeListOpen, setIsEpisodeListOpen] = useState(true);

    // Favorite States
    const [isLiked, setIsLiked] = useState(false);
    const [isEpLiked, setIsEpLiked] = useState(false);

    // --- HYPRLAND RESIZE STATE ---
    const [sidebarWidth, setSidebarWidth] = useState(350); // Default width px
    const [commentSectionHeight, setCommentSectionHeight] = useState(40); // Default percentage %
    
    // --- WIDGET STATE ---
    // 'comments' is default. Others available if settings enabled.
    type WidgetType = 'comments' | 'notes' | 'calendar' | 'todo' | 'stopwatch';
    const [activeWidget, setActiveWidget] = useState<WidgetType>('comments');

    const videoRef = useRef<HTMLVideoElement>(null);
    const episodeListRef = useRef<HTMLUListElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const isM3U8 = currentEpisode.link.includes('.m3u8');

    // --- RESIZE HANDLERS ---
    const startResizingHorizontal = useCallback((mouseDownEvent: React.MouseEvent) => {
        if (!resizablePanes) return;
        mouseDownEvent.preventDefault();
        
        const startX = mouseDownEvent.clientX;
        const startWidth = sidebarWidth;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
            // Limit width between 200px and 50% of screen
            if (newWidth > 200 && newWidth < window.innerWidth * 0.6) {
                setSidebarWidth(newWidth);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [sidebarWidth, resizablePanes]);

    const startResizingVertical = useCallback((mouseDownEvent: React.MouseEvent) => {
        if (!resizablePanes) return;
        mouseDownEvent.preventDefault();
        
        if (!sidebarRef.current) return;
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const startY = mouseDownEvent.clientY;
        const startHeightPercentage = commentSectionHeight;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            const deltaY = startY - mouseMoveEvent.clientY; // Drag up increases height
            const deltaPercentage = (deltaY / sidebarRect.height) * 100;
            const newHeight = startHeightPercentage + deltaPercentage;

            // Limit height between 10% and 80%
            if (newHeight > 10 && newHeight < 80) {
                setCommentSectionHeight(newHeight);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [commentSectionHeight, resizablePanes]);


    // --- Helper Functions ---
    const requestDownload = (episode: Episode) => {
        if (!addToQueue) return;
        addToQueue({
            id: episode.link,
            animeName: anime.name,
            episodeTitle: episode.episodeTitle,
            episode: episode,
            status: 'pending',
            progress: 'Chờ...'
        });
    };

    const getDownloadState = (episodeLink: string) => {
        return downloadQueue.find(t => t.id === episodeLink);
    };

    // --- LOGIC: History & Favorites ---
    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('aniw_favorites') || '[]');
        setIsLiked(favs.some((f: any) => f.name === anime.name));

        const likedEps = JSON.parse(localStorage.getItem('aniw_liked_episodes') || '[]');
        setIsEpLiked(likedEps.some((e: any) => e.link === currentEpisode.link));

        const saveHistory = () => {
            const history = JSON.parse(localStorage.getItem('aniw_watch_history') || '[]');
            const newItem = {
                animeName: anime.name,
                episode: currentEpisode.episodeTitle,
                link: currentEpisode.link,
                timestamp: Date.now()
            };
            const filtered = history.filter((h: any) => h.animeName !== anime.name);
            filtered.unshift(newItem); 
            localStorage.setItem('aniw_watch_history', JSON.stringify(filtered.slice(0, 50))); 
        };
        saveHistory();

    }, [anime.name, currentEpisode]);

    const toggleLikeAnime = () => {
        const favs = JSON.parse(localStorage.getItem('aniw_favorites') || '[]');
        let newFavs;
        if (isLiked) {
            newFavs = favs.filter((f: any) => f.name !== anime.name);
        } else {
            newFavs = [...favs, { name: anime.name, addedAt: Date.now() }];
        }
        localStorage.setItem('aniw_favorites', JSON.stringify(newFavs));
        setIsLiked(!isLiked);
    };

    const toggleLikeEpisode = () => {
        const likedEps = JSON.parse(localStorage.getItem('aniw_liked_episodes') || '[]');
        let newLikedEps;
        if (isEpLiked) {
            newLikedEps = likedEps.filter((e: any) => e.link !== currentEpisode.link);
        } else {
            newLikedEps = [...likedEps, { 
                animeName: anime.name,
                episodeTitle: currentEpisode.episodeTitle,
                link: currentEpisode.link,
                savedAt: Date.now() 
            }];
        }
        localStorage.setItem('aniw_liked_episodes', JSON.stringify(newLikedEps));
        setIsEpLiked(!isEpLiked);
    };

    // Scroll to active episode
    useEffect(() => {
        if (episodeListRef.current) {
            const activeElement = episodeListRef.current.querySelector(`[data-episode-link="${currentEpisode.link}"]`) as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentEpisode]);

    // HLS Logic
    useEffect(() => {
        if (isM3U8 && videoRef.current) {
            const video = videoRef.current;
            // @ts-ignore
            if (window.Hls && window.Hls.isSupported()) {
                // @ts-ignore
                const hls = new window.Hls({ debug: false, enableWorker: true, lowLatencyMode: true });
                hls.loadSource(currentEpisode.link);
                hls.attachMedia(video);
                // @ts-ignore
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                   video.play().catch(e => console.log("Auto-play prevented", e));
                });
                return () => hls.destroy();
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = currentEpisode.link;
                video.addEventListener('loadedmetadata', () => {
                   video.play().catch(e => console.log("Auto-play prevented", e));
                });
            }
        }
    }, [currentEpisode.link, isM3U8]);

    const getPlaybackLink = (link: string): string => {
        if (!link) return '';
        try {
            const url = new URL(link);
            url.searchParams.set('autoplay', '1');
            url.searchParams.set('mute', '1'); 
            return url.toString();
        } catch (e) {
            const params = 'autoplay=1&mute=1';
            return link.includes('?') ? `${link}&${params}` : `${link}?${params}`;
        }
    };
    
    const playbackSrc = isM3U8 ? currentEpisode.link : getPlaybackLink(currentEpisode.link);

    const renderPlayer = () => {
        if (isM3U8) {
            return (
                <div className="w-full h-full bg-black relative flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-contain" controls autoPlay playsInline />
                </div>
            );
        }
        return (
            <iframe
                key={currentEpisode.link}
                src={playbackSrc}
                title={currentEpisode.episodeTitle}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox={blockNewTabs ? "allow-scripts allow-same-origin allow-presentation" : "allow-scripts allow-same-origin allow-popups allow-presentation"}
                className="w-full h-full border-0"
            ></iframe>
        );
    }

    // --- POPUP PLAYER MODE ---
    if (disablePopupPlayer) {
        // [Giữ nguyên code Popup Player như cũ cho an toàn, chỉ tập trung sửa Main UI]
        const popupPlayerClasses = ['glass-ui', 'liquid-glass'].includes(theme) ? 'glass-card' : 'bg-theme-darkest/95 backdrop-blur-lg border-l border-white/10';
        return (
            <div className="fixed inset-0 bg-black z-60 animate-fade-in flex flex-col">
                <div className="flex-grow w-full relative group/player">
                    {renderPlayer()}
                    <button onClick={onClose} className="absolute top-4 left-4 z-70 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors">
                        <BackIcon className="w-8 h-8" />
                    </button>
                    <div className="absolute top-4 right-4 z-70 flex gap-2">
                        <button onClick={toggleLikeAnime} className={`p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`}>
                            <HeartIcon className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                         <button onClick={toggleLikeEpisode} className={`p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors ${isEpLiked ? 'text-blue-400' : 'text-white'}`}>
                            <BookmarkSolidIcon className={`w-6 h-6 ${isEpLiked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
                 {!isEpisodeListOpen && (
                     <button onClick={() => setIsEpisodeListOpen(true)} className="absolute top-1/2 -translate-y-1/2 right-0 bg-black/50 hover:bg-black/80 text-white rounded-l-full p-2 z-70">
                        <ChevronDoubleLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <div className={`absolute top-0 right-0 h-full w-full max-w-xs z-70 flex flex-col transition-transform duration-300 ${popupPlayerClasses} ${isEpisodeListOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-theme-lime">Danh sách tập</h3>
                        <button onClick={() => setIsEpisodeListOpen(false)}><ChevronDoubleRightIcon className="w-6 h-6 text-white" /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto no-scrollbar p-2">
                         {anime.episodes.map((ep, i) => (
                            <button 
                                key={i} 
                                onClick={() => setCurrentEpisode(ep)}
                                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${currentEpisode.link === ep.link ? 'bg-theme-lime text-theme-darkest font-bold' : 'hover:bg-white/10 text-slate-300'}`}
                            >
                                {ep.episodeTitle}
                            </button>
                         ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN DEFAULT UI (HYPRLAND STYLE) ---
    const containerClasses = ['glass-ui', 'liquid-glass'].includes(theme)
        ? 'glass-card'
        : 'bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/10';
        
    const sidebarBg = ['glass-ui', 'liquid-glass'].includes(theme) 
        ? 'bg-white/40 dark:bg-black/40' 
        : 'bg-white/80 dark:bg-[#121212]/90';

    const renderWidget = () => {
        switch(activeWidget) {
            case 'comments': return <CommentSection animeName={anime.name} settings={settings} />;
            case 'notes': return <Notes isPlayerNote settings={settings} />;
            case 'calendar': return <MiniCalendar />;
            case 'todo': return <MiniTodo />;
            case 'stopwatch': return <MiniStopwatch />;
            default: return <CommentSection animeName={anime.name} settings={settings} />;
        }
    }

    return (
        <main className={`h-screen w-screen flex items-center justify-center ${containerClassName}`}>
            <div 
                ref={containerRef}
                className={`w-full h-full rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden ${containerClasses}`}
            >
                
                {/* 1. LEFT SIDEBAR (RESIZABLE) */}
                <div 
                    ref={sidebarRef}
                    className={`flex-shrink-0 flex flex-col h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/10 ${sidebarBg} backdrop-blur-md relative`}
                    style={{ width: resizablePanes && window.innerWidth >= 768 ? `${sidebarWidth}px` : undefined }}
                >
                    {/* Top: Header + List */}
                    <div className="flex flex-col min-h-0" style={{ height: resizablePanes ? `${100 - commentSectionHeight}%` : '60%' }}>
                         {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-wider text-theme-darkest dark:text-white">Danh sách tập</h2>
                                <span className="text-xs font-bold text-slate-500">{anime.episodes.length} Tập - {anime.name}</span>
                            </div>
                            {allowDownload && (
                                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-theme-olive dark:text-theme-lime transition-colors" title="Tải toàn bộ">
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-grow overflow-y-auto p-2 no-scrollbar">
                            <ul ref={episodeListRef} className="space-y-1">
                                {anime.episodes.map((episode, index) => {
                                    const downloadState = getDownloadState(episode.link);
                                    const isActive = currentEpisode.link === episode.link;
                                    return (
                                        <li key={index} data-episode-link={episode.link}>
                                            <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-theme-lime text-theme-darkest' : 'hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                                                <button 
                                                    onClick={() => setCurrentEpisode(episode)}
                                                    className="flex-grow text-left flex items-center gap-3 min-w-0"
                                                >
                                                    <span className={`text-sm font-black opacity-40 w-5 text-right ${isActive ? 'text-black' : 'text-slate-400'}`}>{index + 1}</span>
                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-bold truncate ${isActive ? 'text-theme-darkest' : 'text-slate-800 dark:text-slate-200'}`}>{episode.episodeTitle}</p>
                                                    </div>
                                                </button>
                                                
                                                {allowDownload && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); requestDownload(episode); }}
                                                        disabled={!!downloadState}
                                                        className={`p-2 rounded-full transition-colors ${isActive ? 'hover:bg-black/10' : 'hover:bg-slate-300 dark:hover:bg-white/20'}`}
                                                    >
                                                        {downloadState?.status === 'completed' ? <CheckIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Widget Toolbar (Instead of just a resizer, acts as a menu) */}
                    <div className="flex-shrink-0 bg-slate-100 dark:bg-black/30 border-t border-b border-slate-200 dark:border-white/10 px-2 py-1 flex items-center gap-1 overflow-x-auto no-scrollbar justify-center relative z-20">
                         {/* Resizer Handle Visual */}
                         {resizablePanes && (
                            <div 
                                className="absolute inset-0 cursor-row-resize z-0 hover:bg-theme-lime/20 transition-colors"
                                onMouseDown={startResizingVertical}
                            />
                         )}

                         {/* Widget Buttons */}
                         <div className="relative z-10 flex gap-1">
                            <button 
                                onClick={() => setActiveWidget('comments')} 
                                className={`p-1.5 rounded-lg transition-all ${activeWidget === 'comments' ? 'bg-theme-lime text-theme-darkest shadow-sm' : 'text-slate-500 hover:bg-white/10'}`} title="Bình luận"
                            >
                                <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                            </button>
                            
                            {settings.showNotes && (
                                <button 
                                    onClick={() => setActiveWidget('notes')} 
                                    className={`p-1.5 rounded-lg transition-all ${activeWidget === 'notes' ? 'bg-theme-lime text-theme-darkest shadow-sm' : 'text-slate-500 hover:bg-white/10'}`} title="Ghi chú"
                                >
                                    <span className="font-bold text-xs">Note</span>
                                </button>
                            )}

                            {settings.showCalendar && (
                                <button 
                                    onClick={() => setActiveWidget('calendar')} 
                                    className={`p-1.5 rounded-lg transition-all ${activeWidget === 'calendar' ? 'bg-theme-lime text-theme-darkest shadow-sm' : 'text-slate-500 hover:bg-white/10'}`} title="Lịch"
                                >
                                    <CalendarDaysIcon className="w-4 h-4" />
                                </button>
                            )}

                             {settings.showTodoList && (
                                <button 
                                    onClick={() => setActiveWidget('todo')} 
                                    className={`p-1.5 rounded-lg transition-all ${activeWidget === 'todo' ? 'bg-theme-lime text-theme-darkest shadow-sm' : 'text-slate-500 hover:bg-white/10'}`} title="Việc cần làm"
                                >
                                    <ClipboardCheckIcon className="w-4 h-4" />
                                </button>
                            )}

                             {settings.showStopwatch && (
                                <button 
                                    onClick={() => setActiveWidget('stopwatch')} 
                                    className={`p-1.5 rounded-lg transition-all ${activeWidget === 'stopwatch' ? 'bg-theme-lime text-theme-darkest shadow-sm' : 'text-slate-500 hover:bg-white/10'}`} title="Bấm giờ"
                                >
                                    <ClockIcon className="w-4 h-4" />
                                </button>
                            )}
                         </div>
                    </div>

                    {/* Bottom: Widget Area */}
                    <div className="flex-grow min-h-0 relative bg-slate-50/50 dark:bg-black/10" style={{ height: resizablePanes ? `${commentSectionHeight}%` : '40%' }}>
                         {renderWidget()}
                    </div>

                    {/* Horizontal Resizer Handle (Positioned absolute on the right edge of sidebar) */}
                    {resizablePanes && (
                        <div 
                            className="hidden md:flex absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-theme-lime items-center justify-center z-20 translate-x-1/2"
                            onMouseDown={startResizingHorizontal}
                        >
                             {/* Invisible hit area but visible visual indicator */}
                             <div className="w-1 h-8 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                        </div>
                    )}
                </div>

                {/* 2. RIGHT VIDEO PLAYER (FLEX GROW) */}
                <div className="flex-grow h-1/2 md:h-full flex flex-col relative bg-black group/player min-w-0">
                    {renderPlayer()}
                    
                    {/* Floating Header Overlay */}
                    <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                        <div className="flex items-start gap-4 pointer-events-auto">
                            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md border border-white/10">
                                <BackIcon className="w-6 h-6" />
                            </button>
                            <div className="mt-1">
                                <h2 className="text-white font-bold text-xl md:text-2xl drop-shadow-md line-clamp-1">{anime.name}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                     <span className="bg-theme-lime text-black text-xs font-bold px-2 py-0.5 rounded shadow-lg">{currentEpisode.episodeTitle}</span>
                                     <div className="flex gap-2">
                                         <button 
                                            onClick={toggleLikeAnime} 
                                            className={`transition-transform hover:scale-110 ${isLiked ? 'text-red-500' : 'text-white/70 hover:text-white'}`}
                                            title="Yêu thích Anime này"
                                        >
                                            <HeartIcon className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                                         </button>
                                         <button 
                                            onClick={toggleLikeEpisode} 
                                            className={`transition-transform hover:scale-110 ${isEpLiked ? 'text-blue-400' : 'text-white/70 hover:text-white'}`}
                                            title="Lưu tập này"
                                        >
                                            <BookmarkSolidIcon className={`w-6 h-6 ${isEpLiked ? 'fill-current' : ''}`} />
                                         </button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </main>
    );
};

export default AnimePlayer;

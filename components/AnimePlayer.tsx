
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Anime, Episode, Settings, DownloadTask } from '../types';
import Notes from './Notes';
import { BackIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, PlayIcon, DownloadIcon, CheckIcon } from './icons';

declare var Hls: any;

interface ResizerProps {
    onMouseDown: (e: React.MouseEvent) => void;
    orientation: 'vertical' | 'horizontal';
}

const Resizer: React.FC<ResizerProps> = ({ onMouseDown, orientation }) => {
    const baseClasses = "flex-shrink-0 bg-transparent transition-colors duration-200";
    const verticalClasses = "w-2 cursor-col-resize group";
    const horizontalClasses = "h-2 cursor-row-resize group";
    const innerVerticalClasses = "w-0.5 h-full bg-slate-400/30 group-hover:bg-theme-lime mx-auto";
    const innerHorizontalClasses = "h-0.5 w-full bg-slate-400/30 group-hover:bg-theme-lime my-auto";

    return (
        <div onMouseDown={onMouseDown} className={`${baseClasses} ${orientation === 'vertical' ? verticalClasses : horizontalClasses}`}>
            <div className={orientation === 'vertical' ? innerVerticalClasses : innerHorizontalClasses} />
        </div>
    );
};

interface UtilityPanelProps {
    title: string;
    children: React.ReactNode;
    settings: Settings;
    className?: string;
}

const UtilityPanel: React.FC<UtilityPanelProps> = ({ title, children, settings, className }) => {
    const panelClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? 'glass-card' 
        : 'bg-white/5 dark:bg-black/20 backdrop-blur-lg border border-white/10 dark:border-white/10';
    const borderClass = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? 'border-white/20' : 'border-slate-300/50 dark:border-slate-700/50';
    const headingColor = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? '' : 'text-theme-olive dark:text-theme-lime';

    return (
        <div className={`rounded-2xl flex flex-col h-full overflow-hidden ${panelClasses} ${className}`}>
            <h3 className={`text-base font-bold p-3 border-b ${borderClass} flex-shrink-0 ${headingColor}`}>
                {title}
            </h3>
            <div className="flex-grow p-2 sm:p-4 overflow-y-auto no-scrollbar">
                {children}
            </div>
        </div>
    );
};

const Calendar: React.FC<{ settings: Settings }> = ({ settings }) => {
    const [date, setDate] = useState(new Date());

    const renderHeader = () => {
        const dateFormat = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' });
        return (
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="p-1.5 rounded-full hover:bg-slate-500/10 transition-colors">&lt;</button>
                <span className="font-bold text-lg">{dateFormat.format(date)}</span>
                <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="p-1.5 rounded-full hover:bg-slate-500/10 transition-colors">&gt;</button>
            </div>
        );
    };

    const renderDays = () => {
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{weekdays.map(day => <div key={day}>{day}</div>)}</div>;
    };

    const renderCells = () => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - monthStart.getDay());
        
        const cells = [];
        let currentDate = new Date(startDate);
        const today = new Date();

        for (let i = 0; i < 42; i++) {
            const isCurrentMonth = currentDate.getMonth() === date.getMonth();
            const isToday = currentDate.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            
            const cellClass = `w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                isToday ? 'bg-theme-lime text-theme-darkest' :
                isCurrentMonth ? 'text-slate-800 dark:text-slate-200' :
                'text-slate-400 dark:text-slate-600'
            }`;

            cells.push(<div key={currentDate.toString()} className={cellClass}>{currentDate.getDate()}</div>);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return <div className="grid grid-cols-7 gap-y-1 place-items-center mt-2">{cells}</div>;
    };

    return (
        <div className="h-full">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

interface Todo { id: number; text: string; completed: boolean; }

const TodoList: React.FC<{ settings: Settings }> = ({ settings }) => {
    const [todos, setTodos] = useState<Todo[]>(() => {
        try {
            const savedTodos = localStorage.getItem('todos');
            return savedTodos ? JSON.parse(savedTodos) : [];
        } catch (error) {
            console.error("Failed to parse todos from localStorage", error);
            return [];
        }
    });
    const [input, setInput] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem('todos', JSON.stringify(todos));
        } catch (error) {
            console.error("Failed to save todos to localStorage", error);
        }
    }, [todos]);

    const addTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '') return;
        setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="h-full flex flex-col">
            <form onSubmit={addTodo} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Thêm công việc mới..."
                    className="flex-grow bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-theme-lime"
                />
                <button type="submit" className="bg-theme-lime text-theme-darkest px-3 py-1.5 rounded-md text-sm font-semibold">+</button>
            </form>
            <ul className="space-y-2 overflow-y-auto">
                {todos.map(todo => (
                    <li key={todo.id} className="flex items-center gap-2 group">
                        <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="w-4 h-4 rounded text-theme-lime focus:ring-theme-lime bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600"/>
                        <span className={`flex-grow text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{todo.text}</span>
                        <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">X</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Stopwatch: React.FC<{ settings: Settings }> = ({ settings }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => {
                setTime(prev => prev + 10);
            }, 10);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    const formatTime = () => {
        const minutes = Math.floor(time / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
        const milliseconds = (time % 1000).toString().padStart(3, '0').slice(0, 2);
        return `${minutes}:${seconds}.${milliseconds}`;
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="font-mono text-5xl tracking-tighter mb-6">{formatTime()}</div>
            <div className="flex gap-4">
                <button onClick={() => setIsRunning(!isRunning)} className={`px-6 py-2 rounded-md font-semibold text-sm ${isRunning ? 'bg-red-500/80 text-white' : 'bg-theme-lime text-theme-darkest'}`}>{isRunning ? 'Dừng' : 'Bắt đầu'}</button>
                <button onClick={() => { setTime(0); setIsRunning(false); }} className="px-6 py-2 rounded-md font-semibold text-sm bg-slate-300/50 dark:bg-slate-700/50">Reset</button>
            </div>
        </div>
    );
};

interface AnimePlayerProps {
    anime: Anime;
    settings: Settings;
    onClose: () => void;
    containerClassName?: string;
    allowDownload?: boolean;
    // New props for global download management
    downloadQueue?: DownloadTask[];
    addToQueue?: (task: DownloadTask) => void;
}

const AnimePlayer: React.FC<AnimePlayerProps> = ({ 
    anime, 
    settings, 
    onClose, 
    containerClassName, 
    allowDownload = false,
    downloadQueue = [],
    addToQueue 
}) => {
    const { blockNewTabs, showNotes, disablePopupPlayer, theme, showCalendar, showTodoList, showStopwatch, resizablePanes, enableHoverAnimation } = settings;
    const [currentEpisode, setCurrentEpisode] = useState<Episode>(anime.episodes[0]);
    const [isEpisodeListOpen, setIsEpisodeListOpen] = useState(true);
    const episodeListRef = useRef<HTMLUListElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [listPanelWidth, setListPanelWidth] = useState(576); 
    const [utilityPanelWidth, setUtilityPanelWidth] = useState(320); 

    const containerRef = useRef<HTMLDivElement>(null);
    const resizingPanel = useRef<'list' | 'utility' | null>(null);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const isM3U8 = currentEpisode.link.includes('.m3u8');

    // Helper to request a download task
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

    // Download All
    const requestDownloadAll = () => {
        if (!addToQueue) return;
        if (confirm(`Bạn có chắc muốn thêm ${anime.episodes.length} tập vào hàng chờ tải xuống không?`)) {
            anime.episodes.forEach(ep => {
                requestDownload(ep);
            });
        }
    };

    // Get status of an episode
    const getDownloadState = (episodeLink: string) => {
        return downloadQueue.find(t => t.id === episodeLink);
    };

    // Use Hls.js for Playback Logic
    useEffect(() => {
        if (isM3U8 && videoRef.current) {
            const video = videoRef.current;
            // @ts-ignore
            if (window.Hls && window.Hls.isSupported()) {
                // @ts-ignore
                const hls = new window.Hls({
                    debug: false,
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                
                hls.loadSource(currentEpisode.link);
                hls.attachMedia(video);
                
                // @ts-ignore
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                   video.play().catch(e => console.log("Auto-play prevented", e));
                });

                // Robust Error Handling for HLS.js
                // @ts-ignore
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            // @ts-ignore
                            case window.Hls.ErrorTypes.NETWORK_ERROR:
                                console.log("HLS: Network error encountered, trying to recover...");
                                hls.startLoad();
                                break;
                            // @ts-ignore
                            case window.Hls.ErrorTypes.MEDIA_ERROR:
                                console.log("HLS: Media error encountered, trying to recover...");
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error("HLS: Fatal error, cannot recover");
                                hls.destroy();
                                break;
                        }
                    }
                });

                return () => {
                    hls.destroy();
                };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                video.src = currentEpisode.link;
                video.addEventListener('loadedmetadata', () => {
                   video.play().catch(e => console.log("Auto-play prevented", e));
                });
            }
        }
    }, [currentEpisode.link, isM3U8]);


    const handleMouseDown = useCallback((panel: 'list' | 'utility') => (e: React.MouseEvent) => {
        if (!resizablePanes) return;
        e.preventDefault();
        resizingPanel.current = panel;
        startX.current = e.clientX;
        startWidth.current = panel === 'list' ? listPanelWidth : utilityPanelWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [resizablePanes, listPanelWidth, utilityPanelWidth]);

    useEffect(() => {
        if (!resizablePanes) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingPanel.current || !containerRef.current) return;
            
            const dx = e.clientX - startX.current;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            if (resizingPanel.current === 'list') {
                const newWidth = startWidth.current + dx;
                setListPanelWidth(Math.max(300, Math.min(newWidth, containerRect.width * 0.5)));
            } else if (resizingPanel.current === 'utility') {
                const newWidth = startWidth.current - dx;
                setUtilityPanelWidth(Math.max(250, Math.min(newWidth, containerRect.width * 0.4)));
            }
        };

        const handleMouseUp = () => {
            resizingPanel.current = null;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizablePanes]);

    useEffect(() => {
        if (episodeListRef.current) {
            const activeElement = episodeListRef.current.querySelector(`[data-episode-link="${currentEpisode.link}"]`) as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [currentEpisode]);

    const getPlaybackLink = (link: string): string => {
        if (!link) return '';
        try {
            const url = new URL(link);
            url.searchParams.set('autoplay', '1');
            url.searchParams.set('mute', '1'); 
            return url.toString();
        } catch (e) {
            console.error('Invalid URL for playback, using fallback:', link, e);
            const params = 'autoplay=1&mute=1';
            return link.includes('?') ? `${link}&${params}` : `${link}?${params}`;
        }
    };
    
    const playbackSrc = isM3U8 ? currentEpisode.link : getPlaybackLink(currentEpisode.link);

    const utilityPanels = [
        showNotes && { id: 'notes', title: 'Ghi chú', component: <Notes settings={settings} isTiled /> },
        showCalendar && { id: 'calendar', title: 'Lịch', component: <Calendar settings={settings} /> },
        showTodoList && { id: 'todolist', title: 'Công việc', component: <TodoList settings={settings} /> },
        showStopwatch && { id: 'stopwatch', title: 'Bấm giờ', component: <Stopwatch settings={settings} /> },
    ].filter(Boolean) as { id: string; title: string; component: React.ReactNode; }[];

    const hoverEffectClass = enableHoverAnimation ? 'transform hover:scale-[1.02] transition-transform' : '';

    const renderPlayer = () => {
        if (isM3U8) {
            return (
                <div className="w-full h-full bg-black relative flex items-center justify-center">
                    <video 
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        playsInline
                    />
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

    if (disablePopupPlayer) {
        const popupPlayerClasses = ['glass-ui', 'liquid-glass'].includes(theme) 
            ? 'glass-card'
            : 'bg-theme-darkest/95 backdrop-blur-lg border-l border-white/10';
        
        return (
            <div className="fixed inset-0 bg-black z-60 animate-fade-in flex flex-col">
                <div className="flex-grow w-full relative group/player">
                    {renderPlayer()}
                    
                     <a 
                        href={currentEpisode.link} 
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 flex items-center gap-2"
                        style={{ pointerEvents: 'auto' }}
                    >
                         <PlayIcon className="w-4 h-4" /> 
                         Nếu video lỗi, bấm vào đây để mở tab mới
                    </a>
                </div>
                
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-70 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                    aria-label="Trở về trang chủ"
                >
                    <BackIcon className="w-8 h-8" />
                </button>

                 {!isEpisodeListOpen && (
                     <button
                        onClick={() => setIsEpisodeListOpen(true)}
                        className="absolute top-1/2 -translate-y-1/2 right-0 bg-black/50 hover:bg-black/80 text-white rounded-l-full p-2 transition-opacity duration-300 z-70"
                        aria-label="Hiện danh sách tập"
                    >
                        <ChevronDoubleLeftIcon className="w-6 h-6" />
                    </button>
                )}

                <div 
                    className={`absolute top-0 right-0 h-full w-full max-w-xs sm:max-w-sm z-70 flex flex-col transition-transform duration-300 ease-in-out ${popupPlayerClasses} ${
                        isEpisodeListOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="p-4 border-b border-slate-700 flex-shrink-0 flex justify-between items-center">
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold text-theme-lime line-clamp-1">{anime.name}</h3>
                            <p className="text-slate-300 line-clamp-1 mt-1">{currentEpisode.episodeTitle}</p>
                        </div>
                        <button
                            onClick={() => setIsEpisodeListOpen(false)}
                            className="text-white hover:bg-slate-700/50 p-2 rounded-full flex-shrink-0"
                            aria-label="Ẩn danh sách tập"
                        >
                            <ChevronDoubleRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {/* Download All Button for Popup */}
                    {allowDownload && (
                        <div className="px-4 py-2 border-b border-slate-700/50">
                            <button 
                                onClick={requestDownloadAll}
                                className="w-full py-2 bg-theme-lime/20 hover:bg-theme-lime/40 text-theme-lime rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" /> Tải tất cả ({anime.episodes.length} tập)
                            </button>
                        </div>
                    )}

                    <div className="flex-grow overflow-y-auto no-scrollbar">
                         <ul className="p-2 space-y-1">
                            {anime.episodes.map((episode, index) => {
                                const downloadState = getDownloadState(episode.link);
                                return (
                                <li key={index}>
                                    <div className={`w-full flex items-center p-2 rounded-xl transition-all duration-300 group ${
                                            currentEpisode.link === episode.link
                                                ? 'bg-theme-lime/20 border-l-4 border-theme-lime'
                                                : 'border-l-4 border-transparent hover:bg-slate-500/20'
                                        }`}>
                                        <button
                                            onClick={() => setCurrentEpisode(episode)}
                                            className="flex-grow text-left flex items-center min-w-0"
                                        >
                                            <span className={`text-sm font-bold mr-4 ${currentEpisode.link === episode.link ? 'text-theme-lime' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className={`text-base font-semibold line-clamp-2 ${currentEpisode.link === episode.link ? 'text-white' : 'text-slate-300'}`}>
                                                {episode.episodeTitle}
                                            </h3>
                                        </button>
                                        
                                        {allowDownload && (
                                            <div className="relative flex-shrink-0">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); requestDownload(episode); }}
                                                    className="ml-2 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                    disabled={!!downloadState}
                                                >
                                                    {downloadState?.status === 'completed' ? (
                                                        <CheckIcon className="w-5 h-5 text-green-400" />
                                                    ) : downloadState?.status === 'downloading' || downloadState?.status === 'pending' ? (
                                                        <div className="w-5 h-5 border-2 border-theme-lime border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <DownloadIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    const containerClasses = ['glass-ui', 'liquid-glass'].includes(theme)
        ? 'glass-card'
        : 'bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/10';
    
    const panelCount = utilityPanels.length;
    let utilityPaneGridClasses = '';
    switch (panelCount) {
        case 1: utilityPaneGridClasses = 'grid grid-cols-1 grid-rows-1'; break;
        case 2: utilityPaneGridClasses = 'grid grid-rows-2 gap-2 sm:gap-4'; break;
        case 3: utilityPaneGridClasses = 'grid grid-cols-2 grid-rows-2 gap-2 sm:gap-4'; break;
        case 4: utilityPaneGridClasses = 'grid grid-cols-2 grid-rows-2 gap-2 sm:gap-4'; break;
        default: break;
    }

    return (
        <main className={`h-screen w-screen flex items-center justify-center ${containerClassName}`}>
            <div ref={containerRef} className={`w-full h-full rounded-3xl shadow-2xl flex flex-col-reverse md:flex-row p-1 sm:p-2 gap-2 ${containerClasses}`}>
                <div 
                    style={resizablePanes ? { flex: `0 0 ${listPanelWidth}px` } : {}}
                    className={`flex-shrink-0 w-full md:w-auto h-1/3 md:h-full rounded-2xl flex flex-col ${!resizablePanes ? 'md:w-[36rem]' : ''}`}
                >
                    <div className="flex-shrink-0 p-4 border-b border-slate-300/50 dark:border-slate-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h3 className={`text-xl font-bold ${['glass-ui', 'liquid-glass'].includes(theme) ? '' : 'text-theme-lime'}`}>Danh sách tập</h3>
                            {allowDownload && (
                                <button 
                                    onClick={requestDownloadAll}
                                    className="bg-theme-lime/20 hover:bg-theme-lime/40 text-theme-darkest dark:text-theme-lime px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                    title="Tải tất cả các tập"
                                >
                                    <DownloadIcon className="w-3 h-3" /> Tải tất cả
                                </button>
                            )}
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-500/20 transition-colors" aria-label="Trở về trang chủ">
                            <BackIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-1 sm:p-2 no-scrollbar">
                        <ul ref={episodeListRef} className="space-y-1">
                            {anime.episodes.map((episode, index) => {
                                const downloadState = getDownloadState(episode.link);
                                return (
                                <li key={index} data-episode-link={episode.link}>
                                    <div className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group ${
                                            currentEpisode.link === episode.link
                                                ? 'bg-theme-lime/20 dark:bg-theme-lime/10 border-l-4 border-theme-lime'
                                                : 'border-l-4 border-transparent hover:bg-slate-500/10'
                                        } ${hoverEffectClass}`}>
                                        <button
                                            onClick={() => setCurrentEpisode(episode)}
                                            className="flex-grow text-left flex items-center min-w-0"
                                        >
                                            <span className={`text-sm font-bold mr-4 ${currentEpisode.link === episode.link ? 'text-theme-lime' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <div className="pl-2">
                                                <h3 className={`text-base font-semibold transition-all duration-300 line-clamp-2 ${currentEpisode.link === episode.link ? 'text-theme-darkest dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {episode.episodeTitle}
                                                </h3>
                                            </div>
                                        </button>
                                        
                                        {allowDownload && (
                                            <div className="relative flex-shrink-0">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); requestDownload(episode); }}
                                                    className="ml-2 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-theme-lime transition-colors"
                                                    disabled={!!downloadState}
                                                >
                                                    {downloadState?.status === 'completed' ? (
                                                        <CheckIcon className="w-5 h-5 text-green-500" />
                                                    ) : downloadState?.status === 'downloading' || downloadState?.status === 'pending' ? (
                                                        <div className="w-5 h-5 border-2 border-theme-lime border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <DownloadIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>

                {resizablePanes && <Resizer onMouseDown={handleMouseDown('list')} orientation="vertical" />}

                <div className="flex-grow h-2/3 md:h-full flex flex-col md:flex-row gap-2 sm:gap-4 overflow-hidden">
                    <div className="flex-grow h-full flex flex-col p-2 sm:p-4">
                         <div className={`flex-grow aspect-video rounded-lg overflow-hidden shadow-2xl shadow-black/50 relative group/player ${['glass-ui', 'liquid-glass'].includes(theme) ? 'glass-card' : 'bg-black border border-slate-700'}`}>
                            {renderPlayer()}
                            
                            <a 
                                href={currentEpisode.link} 
                                target="_blank" 
                                rel="noreferrer noopener"
                                className="absolute bottom-4 right-4 bg-slate-800/80 hover:bg-theme-lime hover:text-theme-darkest text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover/player:opacity-100 transition-all duration-300 flex items-center gap-2 border border-white/20"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Mở Link Gốc (Tab Mới)
                            </a>
                        </div>
                    </div>
                    
                    {utilityPanels.length > 0 && resizablePanes && (
                       <Resizer onMouseDown={handleMouseDown('utility')} orientation="vertical" />
                    )}

                    {utilityPanels.length > 0 && (
                         <div 
                            style={resizablePanes ? { flex: `0 0 ${utilityPanelWidth}px` } : {}}
                            className={`flex-shrink-0 w-full h-auto md:h-full md:w-auto p-2 sm:p-0 ${!resizablePanes ? 'md:w-72 xl:w-80' : ''} ${utilityPaneGridClasses}`}
                        >
                             {utilityPanels.map((panel, index) => {
                                let panelSpecificClass = '';
                                if(panelCount === 3 && index === 0) {
                                    panelSpecificClass = 'md:col-span-2';
                                }
                                return (
                                <UtilityPanel key={panel.id} title={panel.title} settings={settings} className={panelSpecificClass}>
                                    {panel.component}
                                </UtilityPanel>
                                );
                            })}
                         </div>
                    )}
                </div>
            </div>
             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </main>
    );
};

export default AnimePlayer;

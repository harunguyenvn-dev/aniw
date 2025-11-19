
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import DonateModal from './components/SubscriptionModal';
import SearchModal from './components/SearchModal';
import AnimePlayer from './components/AnimePlayer';
import RecommendedAnime from './components/RecommendedAnime';
import SettingsModal from './components/SettingsModal';
import Glossary from './components/Glossary';
import Ranking from './components/Ranking';
import AiringSchedule from './components/AiringSchedule';
import MusicPage from './components/MusicPage';
import LikedImagesPage from './components/LikedImagesPage';
import { Anime, Episode, Settings, View } from './types';

const ANIME_CSV_URL = 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime.csv';

const LiquidBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-transparent">
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-[40vmin] h-[40vmin] bg-theme-mint/30 rounded-full filter blur-3xl animate-liquid-1 opacity-70"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[35vmin] h-[35vmin] bg-theme-lime/30 rounded-full filter blur-3xl animate-liquid-2 opacity-70"></div>
            <div className="absolute bottom-1/2 left-1/3 w-[30vmin] h-[30vmin] bg-theme-olive/30 rounded-full filter blur-3xl animate-liquid-3 opacity-70"></div>
        </div>
    </div>
);

const App: React.FC = () => {
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('home');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // Liked Images State
    const [likedImages, setLikedImages] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('likedImages');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('likedImages', JSON.stringify(likedImages));
    }, [likedImages]);

    const toggleLikeImage = (url: string) => {
        setLikedImages(prev => {
            if (prev.includes(url)) {
                return prev.filter(img => img !== url);
            } else {
                return [...prev, url];
            }
        });
    };

    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const savedSettings = localStorage.getItem('animeAppSettings');
            const parsed = savedSettings ? JSON.parse(savedSettings) : {};
            return {
                colorMode: parsed.colorMode || 'light',
                theme: parsed.theme || 'green-screen',
                isTextBolder: parsed.isTextBolder || false,
                isTextItalic: parsed.isTextItalic || false,
                fontFamily: parsed.fontFamily || 'Inter, sans-serif',
                disablePopupPlayer: parsed.disablePopupPlayer || false,
                blockNewTabs: parsed.blockNewTabs !== undefined ? parsed.blockNewTabs : true,
                showNotes: parsed.showNotes || false,
                headerPosition: parsed.headerPosition || 'top',
                resizablePanes: parsed.resizablePanes || false,
                showCalendar: parsed.showCalendar || false,
                showTodoList: parsed.showTodoList || false,
                showStopwatch: parsed.showStopwatch || false,
                avatarUrl: parsed.avatarUrl || 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg',
                enableHoverAnimation: parsed.enableHoverAnimation || false,
                customAnimeDataUrl: parsed.customAnimeDataUrl || '',
                customThemeColors: parsed.customThemeColors || {
                    lightest: '#ECFDFF',
                    mint: '#41F0D1',
                    lime: '#A8FFC8',
                    olive: '#008B8B',
                    darkest: '#012A29',
                },
            };
        } catch (error) {
            return {
                colorMode: 'dark',
                theme: 'green-screen',
                isTextBolder: false,
                isTextItalic: false,
                fontFamily: 'Inter, sans-serif',
                disablePopupPlayer: false,
                blockNewTabs: true,
                showNotes: false,
                headerPosition: 'top',
                resizablePanes: false,
                showCalendar: false,
                showTodoList: false,
                showStopwatch: false,
                avatarUrl: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg',
                enableHoverAnimation: false,
                customAnimeDataUrl: '',
                customThemeColors: {
                    lightest: '#ECFDFF',
                    mint: '#41F0D1',
                    lime: '#A8FFC8',
                    olive: '#008B8B',
                    darkest: '#012A29',
                },
            };
        }
    });

    useEffect(() => {
        const firstVisitKey = 'firstVisitTimestamp';
        const hasShownDonateKey = 'hasShownDonateModal';
        
        const firstVisit = localStorage.getItem(firstVisitKey);
        
        if (!firstVisit) {
            // First time user, save timestamp
            localStorage.setItem(firstVisitKey, Date.now().toString());
        } else {
            // Returning user
            const hasShown = localStorage.getItem(hasShownDonateKey);
            
            if (!hasShown) {
                const now = Date.now();
                const firstVisitTime = parseInt(firstVisit, 10);
                const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                
                if (now - firstVisitTime > oneDay) {
                    setIsDonateModalOpen(true);
                    localStorage.setItem(hasShownDonateKey, 'true');
                }
            }
        }
    }, []);

    useEffect(() => {
        // This effect runs only once on mount to create the audio object
        audioRef.current = new Audio();
        audioRef.current.volume = 0.5; // Set a reasonable volume
        return () => {
            // Cleanup on unmount
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    
    useEffect(() => {
        const styleId = 'custom-theme-style';
        let styleElement = document.getElementById(styleId);

        if (settings.theme === 'custom' && settings.customThemeColors) {
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            const { lightest, mint, lime, olive, darkest } = settings.customThemeColors;
            styleElement.innerHTML = `
                :root[data-theme='custom'] {
                    --theme-lightest: ${lightest};
                    --theme-mint: ${mint};
                    --theme-lime: ${lime};
                    --theme-olive: ${olive};
                    --theme-darkest: ${darkest};
                }
            `;
        } else {
            if (styleElement) {
                styleElement.innerHTML = '';
            }
        }
    }, [settings.theme, settings.customThemeColors]);

    useEffect(() => {
        if (settings.colorMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        document.documentElement.setAttribute('data-theme', settings.theme);
        document.documentElement.style.setProperty('--font-family', settings.fontFamily);


        const rootDiv = document.getElementById('root');
        if (rootDiv) {
            if (settings.isTextBolder) {
                rootDiv.classList.add('text-bolder');
            } else {
                rootDiv.classList.remove('text-bolder');
            }
            if (settings.isTextItalic) {
                rootDiv.classList.add('text-italic');
            } else {
                rootDiv.classList.remove('text-italic');
            }
        }
        localStorage.setItem('animeAppSettings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const fetchAndParseData = (url: string): Promise<Anime[]> => {
            return new Promise(async (resolve, reject) => {
                try {
                    // @ts-ignore
                    const Papa = window.Papa;
                    if (!Papa) {
                        throw new Error("CSV parsing library (PapaParse) is not loaded.");
                    }
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const csvText = await response.text();
    
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results: { data: { name: string; episodes: string; url: string; link: string; }[] }) => {
                            const groupedAnime: { [key: string]: Episode[] } = {};
    
                            results.data.forEach(row => {
                                if (row.name && row.episodes) {
                                    if (!groupedAnime[row.name]) {
                                        groupedAnime[row.name] = [];
                                    }
                                    groupedAnime[row.name].push({
                                        name: row.name,
                                        episodeTitle: row.episodes,
                                        url: row.url,
                                        link: row.link,
                                    });
                                }
                            });
    
                            const animeArray: Anime[] = Object.keys(groupedAnime).map(name => ({
                                name: name,
                                episodes: groupedAnime[name],
                            }));
                            resolve(animeArray);
                        },
                        error: (err: any) => {
                            reject(new Error(`CSV parsing error: ${err.message}`));
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            });
        };

        const loadData = async () => {
            setLoading(true);
            setError(null);
            setSelectedAnime(null);
            setView('home');

            const processData = (data: Anime[]) => {
                const getTier = (episodeCount: number) => {
                    if (episodeCount > 100) return 4;
                    if (episodeCount >= 24) return 3;
                    if (episodeCount >= 12) return 2;
                    return 1;
                };

                const sortedAnime = [...data].sort((a, b) => {
                    const tierA = getTier(a.episodes.length);
                    const tierB = getTier(b.episodes.length);
                    if (tierA !== tierB) {
                        return tierB - tierA;
                    }
                    return b.episodes.length - a.episodes.length;
                });

                setRecommendedAnime(sortedAnime);
                setAnimeList(data);
                setLoading(false);
            };

            const urlToTry = settings.customAnimeDataUrl || ANIME_CSV_URL;

            try {
                const data = await fetchAndParseData(urlToTry);
                processData(data);
            } catch (e: any) {
                if (settings.customAnimeDataUrl) {
                    setError(`Lỗi URL tùy chỉnh: ${e.message}. Đang thử nguồn mặc định.`);
                    try {
                        const data = await fetchAndParseData(ANIME_CSV_URL);
                        processData(data);
                        setError(null); 
                    } catch (e2: any) {
                        setError(`Cả URL tùy chỉnh và mặc định đều thất bại. Lỗi: ${e2.message}`);
                        setLoading(false);
                    }
                } else {
                    setError(`Không thể tải dữ liệu phim. Lỗi: ${e.message}`);
                    setLoading(false);
                }
            }
        };

        loadData();
    }, [settings.customAnimeDataUrl]);


    const handleSelectAnime = (anime: Anime) => {
        setSelectedAnime(anime);
        setIsSearchOpen(false);
        setView('home');
    };
    
    const handleViewChange = (newView: View) => {
        setSelectedAnime(null);
        setView(newView);

        if (audioRef.current) {
            if (newView === 'ranking') {
                audioRef.current.src = 'https://github.com/harunguyenvn-dev/data/raw/refs/heads/main/test/examp.mp3';
                audioRef.current.loop = true;
                audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            } else if (newView === 'schedule') {
                audioRef.current.src = 'https://github.com/harunguyenvn-dev/data/raw/refs/heads/main/test/c.m4a';
                audioRef.current.loop = true;
                audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            } else if (newView === 'glossary') {
                 audioRef.current.src = 'https://github.com/harunguyenvn-dev/data/raw/refs/heads/main/test/Dreaming%20%5BDFVuYoDVS_g%5D.m4a';
                 audioRef.current.loop = true;
                 audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            } else if (newView === 'music') {
                 audioRef.current.src = 'https://github.com/harunguyenvn-dev/data/raw/refs/heads/main/test/lofi%20songs%20for%20slow%20days%20%5BAzV77KFsLn4%5D.m4a';
                 audioRef.current.loop = true;
                 audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    };

    const handleClosePlayer = () => {
        setSelectedAnime(null);
    };

    const renderContent = () => {
        const getContentPadding = (viewType: 'player' | 'main') => {
            const padding = {
                top: viewType === 'player' ? 'pt-24 px-4 pb-8' : 'pt-24 px-4 sm:px-8 pb-16',
                bottom: viewType === 'player' ? 'pb-24 px-4 pt-8' : 'pb-24 px-4 sm:px-8 pt-16',
                left: viewType === 'player' ? 'py-8 pl-16 md:pl-24 pr-4' : 'py-16 pl-16 md:pl-24 pr-4 sm:pr-8',
                right: viewType === 'player' ? 'py-8 pr-16 md:pr-24 pl-4' : 'py-16 pr-16 md:pr-24 pl-4 sm:pl-8',
            }
            return padding[settings.headerPosition];
        }

        const getHomePadding = () => {
            switch (settings.headerPosition) {
                case 'top': return 'pt-24 p-4';
                case 'bottom': return 'pb-24 p-4';
                case 'left': return 'pl-16 md:pl-24 p-4';
                case 'right': return 'pr-16 md:pr-24 p-4';
                default: return 'p-4';
            }
        };
        
        if (view === 'glossary') {
            return <Glossary containerClassName={getContentPadding('main')} settings={settings} />;
        }
        if (view === 'ranking') {
            return <Ranking settings={settings} containerClassName={getContentPadding('main')} />;
        }
        if (view === 'schedule') {
            return <AiringSchedule settings={settings} containerClassName={getContentPadding('main')} />;
        }
        if (view === 'music') {
            return <MusicPage settings={settings} likedImages={likedImages} onToggleLike={toggleLikeImage} />;
        }
        if (view === 'liked-images') {
            return <LikedImagesPage settings={settings} likedImages={likedImages} onRemoveImage={toggleLikeImage} />;
        }

        if (loading) {
            return (
                 <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-theme-lime"></div>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex justify-center items-center h-screen text-center px-4">
                    <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">Đã xảy ra lỗi</h2>
                        <p className="text-slate-300 text-sm sm:text-base">{error}</p>
                    </div>
                </div>
            );
        }
        if (selectedAnime) {
            return <AnimePlayer 
                        anime={selectedAnime} 
                        settings={settings}
                        onClose={handleClosePlayer}
                        containerClassName={getContentPadding('player')}
                    />;
        }

        if (view === 'home') {
             return (
                <main className={`h-screen w-screen ${getHomePadding()}`}>
                     {recommendedAnime.length > 0 && (
                        <RecommendedAnime 
                            animeList={recommendedAnime} 
                            onSelectAnime={handleSelectAnime} 
                            settings={settings}
                        />
                    )}
                </main>
            );
        }

        return <main />;
    }
    
    const appBg = ['glass-ui', 'liquid-glass'].includes(settings.theme) ? '' : 'bg-theme-lightest dark:bg-theme-darkest';

    return (
        <div className={`min-h-screen ${appBg} text-theme-darkest dark:text-theme-lightest`}>
            {(settings.theme === 'liquid-glass' && view !== 'music') && <LiquidBackground />}
            <Header 
                onDonateClick={() => setIsDonateModalOpen(true)} 
                onHomeClick={() => handleViewChange('home')} 
                onSearchClick={() => setIsSearchOpen(true)}
                onGlossaryClick={() => handleViewChange('glossary')}
                onRankingClick={() => handleViewChange('ranking')}
                onScheduleClick={() => handleViewChange('schedule')}
                onMusicClick={() => handleViewChange('music')}
                onSettingsClick={() => setIsSettingsOpen(true)}
                onLikedImagesClick={() => handleViewChange('liked-images')}
                settings={settings}
                view={view}
            />
            {renderContent()}
            
            <DonateModal isOpen={isDonateModalOpen} onClose={() => setIsDonateModalOpen(false)} settings={settings} />
            <SearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                animeList={animeList} 
                onSelectAnime={handleSelectAnime}
                settings={settings}
            />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={setSettings}
            />
        </div>
    );
}

export default App;

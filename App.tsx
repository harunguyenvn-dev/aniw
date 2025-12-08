
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
import CssEditorModal from './components/CssEditorModal';
import RandomAnimePage from './components/RandomAnimePage';
import RelaxationPage from './components/RelaxationPage';
import TodoListPage from './components/TodoListPage';
import SplashScreen from './components/SplashScreen';
import StoreModal from './components/StoreModal';
import DataStoreModal from './components/DataStoreModal';
import { Anime, Episode, Settings, View } from './types';

const ANIME_CSV_URL = 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime.csv';
// Dùng API OPhim
const OPHIM_LIST_API = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1';
const OPHIM_DETAIL_API_BASE = 'https://ophim1.com/phim/';

const FALLBACK_DATA: Anime[] = [
  {
    name: "Anime Dự Phòng 1",
    episodes: [
      { name: "Anime Dự Phòng 1", episodeTitle: "Tập 1", url: "", link: "" },
      { name: "Anime Dự Phòng 1", episodeTitle: "Tập 2", url: "", link: "" },
    ]
  }
];

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
    const [isLoadingApp, setIsLoadingApp] = useState(true);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCssEditorOpen, setIsCssEditorOpen] = useState(false);
    const [isStoreOpen, setIsStoreOpen] = useState(false); 
    const [isDataStoreOpen, setIsDataStoreOpen] = useState(false); // New state for Data Store
    
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

    // PWA Install Prompt Handler
    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallApp = () => {
        if (installPrompt) {
            installPrompt.prompt();
            installPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                setInstallPrompt(null);
            });
        } else {
             alert("Bạn có thể cài đặt ứng dụng bằng cách chọn 'Thêm vào màn hình chính' trong menu trình duyệt của bạn.");
        }
    };

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
                headerStyle: parsed.headerStyle || 'classic',
                resizablePanes: parsed.resizablePanes || false,
                showCalendar: parsed.showCalendar || false,
                showTodoList: parsed.showTodoList || false,
                showStopwatch: parsed.showStopwatch || false,
                avatarUrl: parsed.avatarUrl || 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg',
                enableHoverAnimation: parsed.enableHoverAnimation || false,
                customAnimeDataUrl: parsed.customAnimeDataUrl || '',
                customCss: parsed.customCss || '',
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
                headerStyle: 'classic',
                resizablePanes: false,
                showCalendar: false,
                showTodoList: false,
                showStopwatch: false,
                avatarUrl: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg',
                enableHoverAnimation: false,
                customAnimeDataUrl: '',
                customCss: '',
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

    // Inject Custom CSS
    useEffect(() => {
        const styleId = 'user-custom-css';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.innerHTML = settings.customCss || '';
    }, [settings.customCss]);

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
        const fetchAndParseCSV = (url: string): Promise<Anime[]> => {
            return new Promise(async (resolve, reject) => {
                try {
                    // @ts-ignore
                    const Papa = window.Papa;
                    if (!Papa) {
                        throw new Error("CSV parsing library (PapaParse) is not loaded.");
                    }
                    const response = await fetch(url);
                    if (!response.ok) {
                         if (url !== ANIME_CSV_URL) {
                             throw new Error(`Custom URL failed with status: ${response.status}`);
                         }
                         throw new Error(`Network response was not ok for default URL. Status: ${response.status}`);
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

        // Hàm xử lý dữ liệu API OPhim
        const fetchOPhimData = async (): Promise<Anime[]> => {
            try {
                // 1. Fetch danh sách phim mới
                const listResponse = await fetch(OPHIM_LIST_API);
                if (!listResponse.ok) throw new Error("Không thể kết nối đến OPhim");
                const listData = await listResponse.json();
                
                // 2. Vì API list không có link tập, ta cần fetch detail cho từng phim
                // Giới hạn fetch detail cho 12 phim đầu tiên để tránh chậm app
                const itemsToFetch = listData.items.slice(0, 12);
                
                const detailPromises = itemsToFetch.map((item: any) => 
                    fetch(`${OPHIM_DETAIL_API_BASE}${item.slug}`)
                        .then(res => res.json())
                        .catch(err => {
                            console.error(`Failed to fetch detail for ${item.slug}`, err);
                            return null;
                        })
                );

                const detailsResults = await Promise.all(detailPromises);
                
                const animeArray: Anime[] = [];

                detailsResults.forEach((data: any) => {
                    if (!data || !data.movie || !data.episodes) return;
                    
                    const movie = data.movie;
                    const episodesData = data.episodes[0]?.server_data || []; // Lấy server đầu tiên

                    // Map sang cấu trúc Episode của app
                    const mappedEpisodes: Episode[] = episodesData.map((ep: any) => ({
                        name: movie.name,
                        episodeTitle: `Tập ${ep.name}`,
                        url: '', // Không cần
                        link: ep.link_m3u8 || ep.link_embed // Ưu tiên m3u8
                    }));

                    if (mappedEpisodes.length > 0) {
                        animeArray.push({
                            name: movie.name,
                            episodes: mappedEpisodes
                        });
                    }
                });

                return animeArray;
            } catch (error: any) {
                console.error("OPhim API Error:", error);
                throw new Error(`Lỗi tải dữ liệu từ OPhim: ${error.message}`);
            }
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

                // Nếu dùng OPhim thì giữ nguyên thứ tự (vì là phim mới cập nhật)
                // Nếu dùng CSV thì sort
                let sortedAnime = data;
                if (!settings.customAnimeDataUrl || settings.customAnimeDataUrl !== 'OPHIM_API') {
                    sortedAnime = [...data].sort((a, b) => {
                        const tierA = getTier(a.episodes.length);
                        const tierB = getTier(b.episodes.length);
                        if (tierA !== tierB) {
                            return tierB - tierA;
                        }
                        return b.episodes.length - a.episodes.length;
                    });
                }

                setRecommendedAnime(sortedAnime);
                setAnimeList(data);
                setLoading(false);
            };

            const urlToTry = settings.customAnimeDataUrl || ANIME_CSV_URL;

            try {
                let data: Anime[];
                if (urlToTry === 'OPHIM_API') {
                     data = await fetchOPhimData();
                } else {
                     data = await fetchAndParseCSV(urlToTry);
                }
                processData(data);
            } catch (e: any) {
                 console.error("Primary fetch failed:", e);
                if (settings.customAnimeDataUrl) {
                    try {
                        // Fallback về default CSV nếu custom/API lỗi
                        const data = await fetchAndParseCSV(ANIME_CSV_URL);
                        processData(data);
                        setError(null); 
                    } catch (e2: any) {
                         console.error("Default fetch failed:", e2);
                         processData(FALLBACK_DATA);
                    }
                } else {
                     console.warn("Using fallback data due to error:", e);
                     processData(FALLBACK_DATA);
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
        if (view === 'relaxation') {
            return <RelaxationPage settings={settings} onClose={() => handleViewChange('home')} />;
        }
        if (view === 'todo-list') {
            return <TodoListPage settings={settings} onBack={() => handleViewChange('home')} />;
        }

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
            // If using curved sidebar or focus-ui, handle positions
            if (settings.headerStyle === 'sidebar-curved') {
                if (settings.headerPosition === 'left') return 'pl-20 p-4';
                if (settings.headerPosition === 'right') return 'pr-20 p-4';
                if (settings.headerPosition === 'top') return 'pt-20 p-4';
                if (settings.headerPosition === 'bottom') return 'pb-20 p-4';
            }
            if (settings.headerStyle === 'focus-ui') {
                 if (settings.headerPosition === 'top') return 'pt-24 p-4';
                 return 'pb-24 p-4'; // Default bottom
            }

            switch (settings.headerPosition) {
                case 'top': return 'pt-24 p-4';
                case 'bottom': return 'pb-24 p-4';
                case 'left': return 'pl-16 md:pl-24 p-4';
                case 'right': return 'pr-16 md:pr-24 p-4';
                default: return 'p-4';
            }
        };

        // Adjust container padding for styles
        let containerClass = '';
        let playerContainerClass = '';

        if (settings.headerStyle === 'sidebar-curved') {
             if (settings.headerPosition === 'left') {
                containerClass = 'pl-24 p-4 sm:p-8';
                playerContainerClass = 'pl-24 pr-4 py-8';
             } else if (settings.headerPosition === 'right') {
                containerClass = 'pr-24 p-4 sm:p-8';
                playerContainerClass = 'pr-24 pl-4 py-8';
             } else if (settings.headerPosition === 'top') {
                containerClass = 'pt-24 p-4 sm:p-8';
                playerContainerClass = 'pt-24 px-4 pb-8';
             } else {
                containerClass = 'pb-24 p-4 sm:p-8';
                playerContainerClass = 'pb-24 px-4 pt-8';
             }
        } else if (settings.headerStyle === 'focus-ui') {
            if (settings.headerPosition === 'top') {
                containerClass = 'pt-24 p-4 sm:p-8';
                playerContainerClass = 'pt-24 px-4 pb-8';
            } else {
                containerClass = 'pb-24 p-4 sm:p-8';
                playerContainerClass = 'pb-24 px-4 pt-8';
            }
        } else {
             containerClass = getContentPadding('main');
             playerContainerClass = getContentPadding('player');
        }

        
        if (view === 'glossary') {
            return <Glossary containerClassName={containerClass} settings={settings} />;
        }
        if (view === 'ranking') {
            return <Ranking settings={settings} containerClassName={containerClass} />;
        }
        if (view === 'schedule') {
            return <AiringSchedule settings={settings} containerClassName={containerClass} />;
        }
        if (view === 'music') {
            return <MusicPage settings={settings} likedImages={likedImages} onToggleLike={toggleLikeImage} />;
        }
        if (view === 'liked-images') {
            return <LikedImagesPage settings={settings} likedImages={likedImages} onRemoveImage={toggleLikeImage} />;
        }
        if (view === 'random') {
            return <RandomAnimePage animeList={animeList} settings={settings} />;
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
                        containerClassName={playerContainerClass}
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
            {isLoadingApp && <SplashScreen finishLoading={() => setIsLoadingApp(false)} />}
            
            {(settings.theme === 'liquid-glass' && view !== 'music' && view !== 'random' && view !== 'relaxation' && view !== 'todo-list') && <LiquidBackground />}
            {(view !== 'relaxation' && view !== 'todo-list') && (
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
                    onCssEditorClick={() => setIsCssEditorOpen(true)}
                    onRandomClick={() => handleViewChange('random')}
                    onRelaxationClick={() => handleViewChange('relaxation')}
                    onTodoListClick={() => handleViewChange('todo-list')}
                    onStoreClick={() => setIsStoreOpen(true)}
                    onDataStoreClick={() => setIsDataStoreOpen(true)} // Handle click
                    installApp={handleInstallApp}
                    settings={settings}
                    view={view}
                />
            )}
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
             <CssEditorModal
                isOpen={isCssEditorOpen}
                onClose={() => setIsCssEditorOpen(false)}
                settings={settings}
                onSettingsChange={setSettings}
            />
             <StoreModal 
                isOpen={isStoreOpen} 
                onClose={() => setIsStoreOpen(false)} 
                settings={settings}
                onSettingsChange={setSettings}
            />
            <DataStoreModal 
                isOpen={isDataStoreOpen} 
                onClose={() => setIsDataStoreOpen(false)} 
                settings={settings}
                onSettingsChange={setSettings}
            />
        </div>
    );
}

export default App;

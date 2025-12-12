
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
import OfflinePage from './components/OfflinePage';
import OnboardingModal from './components/OnboardingModal';
import { Anime, Episode, Settings, View, DownloadTask, UserLevelData } from './types';
import { DATA_SOURCES } from './data/sources';
import { WifiIcon, WifiSlashIcon } from './components/icons';

// CHANGE: Default source is now OPHIM_API
const ANIME_CSV_URL = 'OPHIM_API';
// CHANGE: Keep the old CSV as a backup
const BACKUP_CSV_URL = 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime.csv';

const OPHIM_LIST_API_BASE = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat';
const OPHIM_DETAIL_API_BASE = 'https://ophim1.com/phim/';

const OPHIM_PAGE_DEPTH = 1307; 
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CRAWLER_SNAPSHOT_KEY = 'ophim_crawler_snapshot';
const ONBOARDING_KEY = 'hasCompletedOnboarding';
const LEVEL_DATA_KEY = 'aniw_user_level_data_v1'; // NEW KEY for Level

const FALLBACK_DATA: Anime[] = [
  {
    name: "Anime Dự Phòng 1",
    episodes: [
      { name: "Anime Dự Phòng 1", episodeTitle: "Tập 1", url: "", link: "" },
      { name: "Anime Dự Phòng 1", episodeTitle: "Tập 2", url: "", link: "" },
    ]
  }
];

// --- LEVEL ASSETS & LOGIC ---
const LEVEL_ICONS: {[key: number]: string} = {
    0: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv0_large.png',
    1: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv1_large.png',
    2: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv2_large.png',
    3: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv3_large.png',
    4: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv4_large.png',
    5: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv5_large.png',
    6: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv6_large.png',
    7: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv7_large.png',
    8: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv8_large.png',
    9: 'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/app/designer%209/ic_lv9_large.png',
};

const MAX_LEVEL = 9;

const LiquidBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-transparent">
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-[40vmin] h-[40vmin] bg-theme-mint/30 rounded-full filter blur-3xl animate-liquid-1 opacity-70"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[35vmin] h-[35vmin] bg-theme-lime/30 rounded-full filter blur-3xl animate-liquid-2 opacity-70"></div>
            <div className="absolute bottom-1/2 left-1/3 w-[30vmin] h-[30vmin] bg-theme-olive/30 rounded-full filter blur-3xl animate-liquid-3 opacity-70"></div>
        </div>
    </div>
);

// Level Up Modal Component
const LevelUpModal: React.FC<{ isOpen: boolean; onClose: () => void; newLevel: number }> = ({ isOpen, onClose, newLevel }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-sm bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-1 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.5)] transform animate-bounce-in" onClick={e => e.stopPropagation()}>
                <div className="bg-[#1a1a1a] rounded-[22px] p-6 text-center overflow-hidden relative">
                    {/* Confetti / Ray Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_20deg,transparent_40deg)] animate-spin-slow pointer-events-none"></div>
                    
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2 relative z-10">LEVEL UP!</h2>
                    <p className="text-white/80 font-bold mb-6 relative z-10">Chúc mừng bạn đã đạt cấp độ {newLevel}</p>
                    
                    <div className="relative z-10 w-40 h-40 mx-auto mb-6 rounded-full border-4 border-yellow-500 shadow-xl overflow-hidden group">
                        <img 
                            src="https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar2.jpg" 
                            alt="Level Up" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
                    </div>
                    
                    <div className="flex justify-center gap-2 mb-6">
                        <img src={LEVEL_ICONS[newLevel]} alt={`Rank ${newLevel}`} className="h-12 object-contain drop-shadow-lg" />
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] transition-all relative z-10"
                    >
                        TUYỆT VỜI!
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes spin-slow {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
};

const App: React.FC = () => {
    const [isLoadingApp, setIsLoadingApp] = useState(true);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCssEditorOpen, setIsCssEditorOpen] = useState(false);
    const [isStoreOpen, setIsStoreOpen] = useState(false); 
    const [isDataStoreOpen, setIsDataStoreOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState<{show: boolean, level: number}>({show: false, level: 0});
    
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState("đang chuẩn bị...");
    const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Khởi tạo view dựa trên trạng thái mạng
    const [view, setView] = useState<View>(() => navigator.onLine ? 'home' : 'offline-videos');
    
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showOnlineToast, setShowOnlineToast] = useState(false);
    
    // --- DOWNLOAD MANAGER STATE ---
    const [downloadQueue, setDownloadQueue] = useState<DownloadTask[]>([]);
    const processingRef = useRef(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [likedImages, setLikedImages] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('likedImages');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // --- LEVEL SYSTEM STATE ---
    const [levelData, setLevelData] = useState<UserLevelData>(() => {
        try {
            const saved = localStorage.getItem(LEVEL_DATA_KEY);
            return saved ? JSON.parse(saved) : { currentLevel: 0, currentXP: 0, nextLevelXP: 1000, watchedEpisodes: [] };
        } catch {
            return { currentLevel: 0, currentXP: 0, nextLevelXP: 1000, watchedEpisodes: [] };
        }
    });

    // Save level data on change
    useEffect(() => {
        localStorage.setItem(LEVEL_DATA_KEY, JSON.stringify(levelData));
    }, [levelData]);

    const calculateNextLevelXP = (thresholdXP: number) => {
        // Recipe: (xp hiện tại) * 5 + [ ( xp hiện tại ) * 2 ] - 2000
        return (thresholdXP * 5) + (thresholdXP * 2) - 2000;
    };

    const handleXPUpdate = (videoDurationSec: number, episodeId: string) => {
        if (levelData.watchedEpisodes.includes(episodeId)) return; // Already rewarded
        if (levelData.currentLevel >= MAX_LEVEL) return; // Max level reached

        let xpGain = 0;
        const durationMin = videoDurationSec / 60;

        if (durationMin < 10) xpGain = 20;
        else if (durationMin <= 30) xpGain = 100; // Including 10-30 range
        else xpGain = 500;

        setLevelData(prev => {
            let newXP = prev.currentXP + xpGain;
            let newLevel = prev.currentLevel;
            let newNextLevelXP = prev.nextLevelXP;
            let leveledUp = false;

            // Check level up
            if (newXP >= newNextLevelXP && newLevel < MAX_LEVEL) {
                newLevel++;
                leveledUp = true;
                newNextLevelXP = calculateNextLevelXP(prev.nextLevelXP);
            }

            if (leveledUp) {
                setShowLevelUp({ show: true, level: newLevel });
            }

            return {
                currentLevel: newLevel,
                currentXP: newXP,
                nextLevelXP: newNextLevelXP,
                watchedEpisodes: [...prev.watchedEpisodes, episodeId]
            };
        });
    };

    // Detect offline status
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setShowOnlineToast(true);
            setTimeout(() => setShowOnlineToast(false), 3000);
        };
        const handleOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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
                username: parsed.username || 'Wibu-er',
                colorMode: parsed.colorMode || 'light',
                theme: parsed.theme || 'green-screen',
                isTextBolder: parsed.isTextBolder || false,
                isTextItalic: parsed.isTextItalic || false,
                fontFamily: parsed.fontFamily || 'Inter, sans-serif',
                disablePopupPlayer: parsed.disablePopupPlayer || false,
                blockNewTabs: parsed.blockNewTabs !== undefined ? parsed.blockNewTabs : true,
                showNotes: parsed.showNotes || false,
                headerPosition: parsed.headerPosition || 'top',
                headerStyle: parsed.headerStyle || 'minimal-tabs',
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
                username: 'Wibu-er',
                colorMode: 'dark',
                theme: 'green-screen',
                isTextBolder: false,
                isTextItalic: false,
                fontFamily: 'Inter, sans-serif',
                disablePopupPlayer: false,
                blockNewTabs: true,
                showNotes: false,
                headerPosition: 'top',
                headerStyle: 'minimal-tabs',
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
        const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
        if (!hasCompleted) {
            setTimeout(() => {
                setIsOnboardingOpen(true);
            }, 1000);
        }
    }, []);

    const handleOnboardingComplete = (name: string, avatar: string) => {
        const newSettings = { ...settings, username: name, avatarUrl: avatar };
        setSettings(newSettings);
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsOnboardingOpen(false);
    };

    useEffect(() => {
        const firstVisitKey = 'firstVisitTimestamp';
        const hasShownDonateKey = 'hasShownDonateModal';
        const firstVisit = localStorage.getItem(firstVisitKey);
        
        if (!firstVisit) {
            localStorage.setItem(firstVisitKey, Date.now().toString());
        } else {
            const hasShown = localStorage.getItem(hasShownDonateKey);
            if (!hasShown) {
                const now = Date.now();
                const firstVisitTime = parseInt(firstVisit, 10);
                const oneDay = 24 * 60 * 60 * 1000;
                
                if (now - firstVisitTime > oneDay) {
                    setIsDonateModalOpen(true);
                    localStorage.setItem(hasShownDonateKey, 'true');
                }
            }
        }
    }, []);

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = 0.5;
        return () => {
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
        const processData = (data: Anime[]) => {
            const getTier = (episodeCount: number) => {
                if (episodeCount > 100) return 4;
                if (episodeCount >= 24) return 3;
                if (episodeCount >= 12) return 2;
                return 1;
            };

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

        const fetchAndParseCSV = (url: string): Promise<Anime[]> => {
            setLoadingStatus("Đang đọc dữ liệu...");
            return new Promise(async (resolve, reject) => {
                try {
                    // @ts-ignore
                    const Papa = window.Papa;
                    if (!Papa) {
                        throw new Error("CSV parsing library (PapaParse) is not loaded.");
                    }
                    const response = await fetch(url);
                    if (!response.ok) {
                         if (url !== ANIME_CSV_URL && url !== BACKUP_CSV_URL) {
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

        const runOPhimCrawler = async (isUpdateMode: boolean, startPage: number = 1, initialData: Anime[] = []) => {
            try {
                setIsBackgroundFetching(true);
                
                if (startPage > 1 && !isUpdateMode) {
                    setLoadingStatus(`Đang tiếp tục tải từ trang ${startPage}...`);
                } else if (!isUpdateMode) {
                    setLoadingStatus("Đang kết nối OPhim...");
                }
                
                const collectedAnime: Anime[] = [...initialData];
                let currentPage = startPage;
                
                while (currentPage <= OPHIM_PAGE_DEPTH) {
                    try {
                        if (isUpdateMode) {
                            setLoadingStatus(`Đang âm thầm tải trang ${currentPage}...`);
                        } else {
                            // UPDATE: Show count to user
                            setLoadingStatus(`Đang tải trang ${currentPage}/${OPHIM_PAGE_DEPTH}... (Đã tìm thấy ${collectedAnime.length} bộ)`);
                        }

                        const listResponse = await fetch(`${OPHIM_LIST_API_BASE}?page=${currentPage}`);
                        if (!listResponse.ok) throw new Error(`Failed to fetch page ${currentPage}`);
                        
                        const listData = await listResponse.json();
                        const items = listData.items || [];
                        
                        if (items.length === 0) break;

                        const pageAnime: Anime[] = [];

                        for (const item of items) {
                            try {
                                const detailResponse = await fetch(`${OPHIM_DETAIL_API_BASE}${item.slug}`);
                                if (detailResponse.ok) {
                                    const detailData = await detailResponse.json();
                                    const movie = detailData.movie;
                                    const episodesData = detailData.episodes[0]?.server_data || [];
                                    
                                    const mappedEpisodes: Episode[] = episodesData.map((ep: any) => ({
                                        name: movie.name,
                                        episodeTitle: `Tập ${ep.name}`,
                                        url: '',
                                        link: ep.link_m3u8 || ep.link_embed
                                    }));

                                    if (mappedEpisodes.length > 0) {
                                        pageAnime.push({
                                            name: movie.name,
                                            episodes: mappedEpisodes
                                        });
                                    }
                                }
                            } catch (err) {
                                console.warn(`Error fetching detail for ${item.slug}`, err);
                            }
                        }
                        
                        collectedAnime.push(...pageAnime);

                        if (!isUpdateMode) {
                            try {
                                const snapshot = {
                                    nextPage: currentPage + 1,
                                    data: collectedAnime,
                                    timestamp: Date.now()
                                };
                                localStorage.setItem(CRAWLER_SNAPSHOT_KEY, JSON.stringify(snapshot));
                            } catch (e: any) {
                                console.warn("Snapshot save failed (Quota Exceeded). Continue without saving snapshot.");
                            }
                            
                            // UPDATE: Update the search list immediately so user can search while fetching
                            setAnimeList([...collectedAnime]);

                            // Update the main UI (Recommended/Sorted) less frequently to avoid performance hit
                            if (currentPage === 1 || currentPage % 5 === 0) {
                                processData([...collectedAnime]);
                            }
                        }
                        
                        currentPage++;
                        await new Promise(resolve => setTimeout(resolve, 50)); 
                    } catch (err) {
                        console.error(`Error processing page ${currentPage}`, err);
                        currentPage++; 
                    }
                }
                
                if (isUpdateMode && collectedAnime.length > 0) {
                    setAnimeList(collectedAnime);
                    processData(collectedAnime);
                    try {
                        localStorage.setItem('ophim_cache', JSON.stringify(collectedAnime));
                    } catch (e) {
                        console.warn("Failed to cache full OPhim list (Quota Exceeded)");
                    }
                }

                if (!isUpdateMode) {
                    const finalData = collectedAnime;
                    setAnimeList(finalData);
                    processData(finalData);
                    try {
                        localStorage.setItem('ophim_cache', JSON.stringify(finalData));
                        localStorage.removeItem(CRAWLER_SNAPSHOT_KEY);
                    } catch (e) {
                         console.warn("Failed to cache final data (Quota Exceeded)");
                    }
                }
                
                localStorage.setItem('ophim_timestamp', Date.now().toString());
                setIsBackgroundFetching(false);
                setLoadingStatus("");
                
            } catch (error: any) {
                console.error("Crawler Error:", error);
                setIsBackgroundFetching(false);
            }
        };

        const loadData = async () => {
            if (!navigator.onLine) {
                setLoading(false);
                return; 
            }

            setLoading(true);
            setError(null);
            setSelectedAnime(null);
            
            setView('home');

            const urlToTry = settings.customAnimeDataUrl || ANIME_CSV_URL;

            if (urlToTry === 'OPHIM_API') {
                const cachedData = localStorage.getItem('ophim_cache');
                const cachedTime = localStorage.getItem('ophim_timestamp');
                
                const crawlerSnapshot = localStorage.getItem(CRAWLER_SNAPSHOT_KEY);
                
                let hasSnapshot = false;
                if (crawlerSnapshot) {
                    try {
                        const snapshot = JSON.parse(crawlerSnapshot);
                        if (Date.now() - snapshot.timestamp < 24 * 60 * 60 * 1000 && snapshot.nextPage <= OPHIM_PAGE_DEPTH) {
                            console.log(`Resuming crawler from page ${snapshot.nextPage}`);
                            hasSnapshot = true;
                            setAnimeList(snapshot.data);
                            processData(snapshot.data);
                            runOPhimCrawler(false, snapshot.nextPage, snapshot.data);
                            return; 
                        }
                    } catch (e) {
                        console.error("Invalid snapshot", e);
                        localStorage.removeItem(CRAWLER_SNAPSHOT_KEY);
                    }
                }

                let hasCache = false;
                if (cachedData) {
                    try {
                        const parsedCache = JSON.parse(cachedData);
                        if (parsedCache.length > 0) {
                            processData(parsedCache);
                            hasCache = true;
                        }
                    } catch (e) {
                        console.error("Cache parsing error", e);
                    }
                }

                const now = Date.now();
                const isExpired = !cachedTime || (now - parseInt(cachedTime) > CACHE_DURATION);

                if (hasCache) {
                    if (isExpired) {
                        runOPhimCrawler(true); 
                    } else {
                        setLoading(false);
                    }
                } else {
                    runOPhimCrawler(false);
                }
            } else {
                try {
                    const data = await fetchAndParseCSV(urlToTry);
                    processData(data);
                } catch (e: any) {
                    if (settings.customAnimeDataUrl) {
                        try {
                            // CHANGED: Use BACKUP_CSV_URL instead of ANIME_CSV_URL since default is now OPHIM_API
                            const data = await fetchAndParseCSV(BACKUP_CSV_URL);
                            processData(data);
                            setError(null);
                        } catch (e2) {
                            processData(FALLBACK_DATA);
                        }
                    } else {
                        processData(FALLBACK_DATA);
                    }
                }
            }
        };

        loadData();
    }, [settings.customAnimeDataUrl]);

    // --- DOWNLOAD MANAGER LOGIC ---
    const saveToIndexedDB = async (blob: Blob, task: DownloadTask, fileType: string) => {
        const dbRequest = indexedDB.open('aniw-offline-db', 1);
        
        dbRequest.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('videos')) {
                db.createObjectStore('videos', { keyPath: 'id' });
            }
        };

        const db = await new Promise<IDBDatabase>((resolve, reject) => {
            dbRequest.onsuccess = () => resolve(dbRequest.result);
            dbRequest.onerror = () => reject(dbRequest.error);
        });

        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        
        const videoData = {
            id: task.episode.link, 
            animeName: task.animeName,
            episodeTitle: task.episodeTitle,
            savedAt: Date.now(),
            blob: blob,
            fileType: fileType
        };

        await new Promise((resolve, reject) => {
            const request = store.put(videoData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    const resolveUrl = (baseUrl: string, relativeUrl: string) => {
        if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) return relativeUrl;
        const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        return baseDir + relativeUrl;
    };

    const processDownloadTask = async (task: DownloadTask) => {
        const updateTask = (updates: Partial<DownloadTask>) => {
            setDownloadQueue(prev => prev.map(t => t.id === task.id ? { ...t, ...updates } : t));
        };

        updateTask({ status: 'downloading', progress: 'Bắt đầu...' });
        const { episode } = task;

        try {
            if (episode.link.endsWith('.m3u8') || episode.link.includes('.m3u8')) {
                let currentPlaylistUrl = episode.link;
                let segmentUrls: string[] = [];
                let foundSegments = false;
                let retryCount = 0;
                const maxRetries = 5;

                while (!foundSegments && retryCount < maxRetries) {
                    retryCount++;
                    const response = await fetch(currentPlaylistUrl);
                    if (!response.ok) throw new Error("Failed to fetch M3U8 playlist");
                    const manifest = await response.text();
                    const lines = manifest.split('\n');
                    
                    const childPlaylistLine = lines.find(line => 
                        line.trim().length > 0 && 
                        !line.trim().startsWith('#') && 
                        (line.trim().includes('.m3u8'))
                    );

                    if (childPlaylistLine) {
                        const newUrl = resolveUrl(currentPlaylistUrl, childPlaylistLine.trim());
                        updateTask({ progress: `Đang tìm luồng chất lượng cao (${retryCount})...` });
                        currentPlaylistUrl = newUrl;
                    } else {
                        foundSegments = true;
                        segmentUrls = lines
                            .map(line => line.trim())
                            .filter(line => line && !line.startsWith('#'))
                            .map(line => resolveUrl(currentPlaylistUrl, line));
                    }
                }

                if (segmentUrls.length === 0) throw new Error("No video segments found in playlist");

                const chunks: Blob[] = [];
                for (let i = 0; i < segmentUrls.length; i++) {
                    const percent = Math.round(((i + 1) / segmentUrls.length) * 100);
                    updateTask({ progress: `Đang tải đoạn ${i + 1}/${segmentUrls.length} (${percent}%)` });
                    
                    try {
                        const segRes = await fetch(segmentUrls[i]);
                        if (!segRes.ok) throw new Error(`Segment fetch failed: ${segmentUrls[i]}`);
                        const blob = await segRes.blob();
                        chunks.push(blob);
                    } catch (e) {
                        console.warn(`Failed segment ${i}, skipping...`, e);
                    }
                }

                updateTask({ progress: 'Đang ghép nối video...' });
                const finalBlob = new Blob(chunks, { type: 'video/mp2t' });
                await saveToIndexedDB(finalBlob, task, 'video/mp2t');

            } else {
                updateTask({ progress: 'Đang tải file...' });
                const response = await fetch(episode.link);
                if (!response.ok) throw new Error("Network error");
                
                const reader = response.body?.getReader();
                const contentLength = +response.headers.get('Content-Length')!;
                let receivedLength = 0;
                let chunks = []; 

                if (reader && contentLength) {
                    while(true) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        chunks.push(value);
                        receivedLength += value.length;
                        updateTask({ progress: `Đang tải... ${Math.round((receivedLength/contentLength) * 100)}%` });
                    }
                    const blob = new Blob(chunks);
                    await saveToIndexedDB(blob, task, blob.type);
                } else {
                    const blob = await response.blob();
                    await saveToIndexedDB(blob, task, blob.type);
                }
            }
            updateTask({ status: 'completed', progress: 'Hoàn tất' });
            setTimeout(() => {
                setDownloadQueue(prev => prev.filter(t => t.id !== task.id));
            }, 5000);

        } catch (error) {
            console.error("Download failed:", error);
            updateTask({ status: 'error', progress: 'Lỗi tải xuống' });
             setTimeout(() => {
                setDownloadQueue(prev => prev.filter(t => t.id !== task.id));
            }, 5000);
        }
    };

    useEffect(() => {
        const processQueue = async () => {
            if (processingRef.current) return;
            
            const nextTask = downloadQueue.find(t => t.status === 'pending');
            if (!nextTask) return;

            const isDownloading = downloadQueue.some(t => t.status === 'downloading');
            if (isDownloading) return;

            processingRef.current = true;
            await processDownloadTask(nextTask);
            processingRef.current = false;
        };

        const interval = setInterval(processQueue, 1000);
        return () => clearInterval(interval);
    }, [downloadQueue]);


    const addToQueue = (task: DownloadTask) => {
        if (downloadQueue.some(t => t.id === task.id)) return;
        setDownloadQueue(prev => [...prev, task]);
    };

    const isDownloadAllowed = useMemo(() => {
        const currentUrl = settings.customAnimeDataUrl || ANIME_CSV_URL;
        const matchedSource = DATA_SOURCES.find(s => s.url === currentUrl);
        return matchedSource?.download === 'yes';
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
        if (view === 'offline-videos') {
            return <OfflinePage settings={settings} onBack={() => handleViewChange('home')} />;
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
            if (settings.headerStyle === 'minimal-tabs') return 'pt-20 px-4'; 

            if (settings.headerStyle === 'sidebar-curved') {
                if (settings.headerPosition === 'left') return 'pl-20 p-4';
                if (settings.headerPosition === 'right') return 'pr-20 p-4';
                if (settings.headerPosition === 'top') return 'pt-20 p-4';
                if (settings.headerPosition === 'bottom') return 'pb-20 p-4';
            }
            if (settings.headerStyle === 'focus-ui') {
                 if (settings.headerPosition === 'top') return 'pt-24 p-4';
                 return 'pb-24 p-4';
            }

            switch (settings.headerPosition) {
                case 'top': return 'pt-24 p-4';
                case 'bottom': return 'pb-24 p-4';
                case 'left': return 'pl-16 md:pl-24 p-4';
                case 'right': return 'pr-16 md:pr-24 p-4';
                default: return 'p-4';
            }
        };

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
        } else if (settings.headerStyle === 'focus-ui' || settings.headerStyle === 'minimal-tabs') {
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

       
        if (settings.disablePopupPlayer) {
            playerContainerClass = 'p-0 sm:p-2'; 
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
                 <div className="flex justify-center items-center h-screen flex-col gap-4">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-theme-lime"></div>
                    <p className="text-theme-darkest dark:text-theme-lightest font-bold animate-pulse text-lg">{loadingStatus}</p>
                    <p className="text-sm opacity-70">đang tải dữ liệu...</p>
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
                        allowDownload={isDownloadAllowed}
                        downloadQueue={downloadQueue}
                        addToQueue={addToQueue}
                        onVideoProgress={handleXPUpdate} // Added Level XP Callback
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
        <div className={`min-h-screen ${appBg} text-theme-darkest dark:text-theme-lightest relative`}>
            {isLoadingApp && <SplashScreen finishLoading={() => setIsLoadingApp(false)} />}
            <OnboardingModal 
                isOpen={isOnboardingOpen} 
                onComplete={handleOnboardingComplete} 
                currentSettings={settings}
            />
            <LevelUpModal isOpen={showLevelUp.show} onClose={() => setShowLevelUp({show: false, level: 0})} newLevel={showLevelUp.level} />
            
            {/* Global Download Indicator (Mini Status) */}
            {downloadQueue.length > 0 && (
                <div className="fixed bottom-4 left-4 z-[90] bg-black/80 text-white p-3 rounded-lg shadow-xl backdrop-blur-md border border-white/10 text-xs font-mono max-w-[200px]">
                    <div className="font-bold text-green-400 mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Đang xử lý: {downloadQueue.length}
                    </div>
                    {downloadQueue.slice(0, 2).map(t => (
                        <div key={t.id} className="mb-1 truncate">
                             <span className={t.status === 'downloading' ? 'text-yellow-400' : 'text-slate-400'}>
                                {t.status === 'downloading' ? '➤ ' : '• '} 
                             </span>
                             {t.episodeTitle}: {t.progress}
                        </div>
                    ))}
                    {downloadQueue.length > 2 && <div className="text-slate-500 italic">...và {downloadQueue.length - 2} tập khác</div>}
                </div>
            )}

            {/* Offline Toast Notification */}
            {isOffline && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
                     <div 
                        onClick={() => handleViewChange('offline-videos')} 
                        className="bg-slate-900/90 backdrop-blur-md border border-red-500/50 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                     >
                         <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <WifiSlashIcon className="w-5 h-5 text-red-500" />
                         </div>
                         <div>
                             <p className="font-bold text-sm">Oái, lạc mất mạng rồi!</p>
                             <p className="text-[10px] text-slate-300 opacity-80">Nhấn để vào kho phim Offline ngay.</p>
                         </div>
                     </div>
                </div>
            )}

            {/* Online Toast Notification */}
            {showOnlineToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-top">
                     <div className="bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400/50">
                         <WifiIcon className="w-5 h-5 text-white" />
                         <span className="font-bold text-sm">Đã kết nối lại thế giới!</span>
                     </div>
                </div>
            )}
            
            {(settings.theme === 'liquid-glass' && view !== 'music' && view !== 'random' && view !== 'relaxation' && view !== 'todo-list' && view !== 'offline-videos') && <LiquidBackground />}
            {(view !== 'relaxation' && view !== 'todo-list' && !(selectedAnime && settings.disablePopupPlayer)) && (
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
                    onDataStoreClick={() => setIsDataStoreOpen(true)}
                    onOfflineClick={() => handleViewChange('offline-videos')}
                    installApp={handleInstallApp}
                    settings={settings}
                    view={view}
                    levelData={levelData} // NEW Prop
                    levelIcons={LEVEL_ICONS} // NEW Prop
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
                isBackgroundFetching={isBackgroundFetching}
                backgroundStatus={loadingStatus}
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
            <style>{`
                @keyframes bounce-in {
                    0% { transform: translate(-50%, -100%); opacity: 0; }
                    60% { transform: translate(-50%, 10px); opacity: 1; }
                    100% { transform: translate(-50%, 0); }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes slide-in-top {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                .animate-slide-in-top {
                    animation: slide-in-top 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default App;

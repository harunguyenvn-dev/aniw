
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
import { Anime, Episode, Settings, View, DownloadTask } from './types';
import { DATA_SOURCES } from './data/sources';

const ANIME_CSV_URL = 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime.csv';

const OPHIM_LIST_API_BASE = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat';
const OPHIM_DETAIL_API_BASE = 'https://ophim1.com/phim/';

const OPHIM_PAGE_DEPTH = 1370; 
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Keys for temporary storage (Resumable capability)
const TEMP_OPHIM_DATA_KEY = 'ophim_temp_data';
const TEMP_OPHIM_PAGE_KEY = 'ophim_temp_page';

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
    const [isDataStoreOpen, setIsDataStoreOpen] = useState(false);
    
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState("đang chuẩn bị...");
    const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('home');
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    
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

    // Detect offline status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
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

        const runOPhimCrawler = async (isUpdateMode: boolean) => {
            try {
                setIsBackgroundFetching(true);
                
                // --- RESUME LOGIC START ---
                // Kiểm tra xem có dữ liệu tạm thời chưa hoàn thành không
                let currentPage = 1;
                let collectedAnime: Anime[] = [];
                
                const savedTempPage = localStorage.getItem(TEMP_OPHIM_PAGE_KEY);
                const savedTempData = localStorage.getItem(TEMP_OPHIM_DATA_KEY);
                
                if (savedTempPage && savedTempData) {
                    try {
                        currentPage = parseInt(savedTempPage);
                        collectedAnime = JSON.parse(savedTempData);
                        console.log(`đang khôi phục phiên làm việc từ trang ${currentPage}...`);
                        // Nếu không phải chế độ update ngầm, hiển thị ngay dữ liệu đã có
                        if (!isUpdateMode) {
                             setAnimeList(collectedAnime);
                             processData(collectedAnime);
                        }
                    } catch (e) {
                        console.warn("Lỗi khi khôi phục dữ liệu tạm, sẽ tải lại từ đầu.");
                        currentPage = 1;
                        collectedAnime = [];
                    }
                }
                // --- RESUME LOGIC END ---

                if (currentPage === 1) {
                     setLoadingStatus("Đang kết nối OPhim...");
                } else {
                     setLoadingStatus(`đang tiếp tục tải từ trang ${currentPage}...`);
                }
                
                while (currentPage <= OPHIM_PAGE_DEPTH) {
                    try {
                        if (isUpdateMode) {
                            setLoadingStatus(`Đang âm thầm tải trang ${currentPage}...`);
                        } else {
                            setLoadingStatus(`Đang tải dữ liệu trang ${currentPage}...`);
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
                        
                        // Merge page data
                        collectedAnime.push(...pageAnime);

                        // --- SAVE CHECKPOINT START ---
                        // Lưu lại trạng thái ngay sau khi tải xong một trang
                        localStorage.setItem(TEMP_OPHIM_DATA_KEY, JSON.stringify(collectedAnime));
                        localStorage.setItem(TEMP_OPHIM_PAGE_KEY, (currentPage + 1).toString());
                        // --- SAVE CHECKPOINT END ---
                        
                        if (!isUpdateMode) {
                            // Cập nhật UI dần dần để người dùng không phải chờ hết 50 trang
                            setAnimeList([...collectedAnime]);
                            processData([...collectedAnime]);
                        }
                        
                        currentPage++;
                        await new Promise(resolve => setTimeout(resolve, 50)); 
                    } catch (err) {
                        console.error(`Error processing page ${currentPage}`, err);
                        
                        currentPage++; 
                        // Vẫn lưu checkpoint để không bị kẹt mãi
                        localStorage.setItem(TEMP_OPHIM_PAGE_KEY, currentPage.toString());
                    }
                }
                
                // Hoàn tất toàn bộ quá trình
                if (isUpdateMode && collectedAnime.length > 0) {
                    setAnimeList(collectedAnime);
                    processData(collectedAnime);
                }

                // Lưu cache chính thức
                localStorage.setItem('ophim_cache', JSON.stringify(collectedAnime));
                localStorage.setItem('ophim_timestamp', Date.now().toString());

                // --- CLEANUP CHECKPOINT START ---
                // Xóa dữ liệu tạm vì đã tải xong thành công
                localStorage.removeItem(TEMP_OPHIM_DATA_KEY);
                localStorage.removeItem(TEMP_OPHIM_PAGE_KEY);
                // --- CLEANUP CHECKPOINT END ---
                
                setIsBackgroundFetching(false);
                setLoadingStatus("");
                
            } catch (error: any) {
                console.error("Crawler Error:", error);
                setIsBackgroundFetching(false);
            }
        };

        const loadData = async () => {
            setLoading(true);
            setError(null);
            setSelectedAnime(null);
            setView('home');

            const urlToTry = settings.customAnimeDataUrl || ANIME_CSV_URL;

            if (urlToTry === 'OPHIM_API') {
                // Ưu tiên kiểm tra xem có dữ liệu tạm (đang tải dở) không
                const hasTempData = localStorage.getItem(TEMP_OPHIM_PAGE_KEY);

                if (hasTempData) {
                     // Nếu có dữ liệu dở dang, Resume ngay lập tức không cần check cache cũ
                     console.log("Phát hiện phiên tải trước chưa hoàn tất, đang tiếp tục tải...");
                     runOPhimCrawler(false);
                     return;
                }

                const cachedData = localStorage.getItem('ophim_cache');
                const cachedTime = localStorage.getItem('ophim_timestamp');
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
                // Logic cho CSV thường
                try {
                    const data = await fetchAndParseCSV(urlToTry);
                    processData(data);
                } catch (e: any) {
                    if (settings.customAnimeDataUrl) {
                        try {
                            const data = await fetchAndParseCSV(ANIME_CSV_URL);
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
    
    // Helper: Save Blob to IDB (Moved from AnimePlayer)
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

    // Resolve relative URL (Moved from AnimePlayer)
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
                        currentPlaylistUrl = resolveUrl(currentPlaylistUrl, childPlaylistLine.trim());
                    } else {
                        // Look for segments
                        const segments = lines.filter(line => 
                            line.trim().length > 0 && 
                            !line.trim().startsWith('#')
                        );
                        if (segments.length > 0) {
                            segmentUrls = segments.map(seg => resolveUrl(currentPlaylistUrl, seg.trim()));
                            foundSegments = true;
                        } else {
                             throw new Error("No segments found in M3U8");
                        }
                    }
                }

                if (foundSegments && segmentUrls.length > 0) {
                     // Simple mock for HLS download since full implementation is complex for this context
                     updateTask({ status: 'error', progress: 'Chức năng tải M3U8 chưa khả dụng trên web.' });
                }
            } else {
                // Direct file (mp4 etc)
                const response = await fetch(episode.link);
                if (!response.ok) throw new Error("Download failed");
                const blob = await response.blob();
                await saveToIndexedDB(blob, task, blob.type || 'video/mp4');
                updateTask({ status: 'completed', progress: 'Hoàn tất' });
            }
        } catch (error: any) {
            console.error("Download error", error);
            updateTask({ status: 'error', progress: 'Lỗi: ' + error.message });
        } finally {
             // Process next
             const nextTask = downloadQueue.find(t => t.status === 'pending');
             if (nextTask) {
                 // Trigger next via effect
             } else {
                 processingRef.current = false;
             }
        }
    };

    useEffect(() => {
        if (!processingRef.current) {
            const nextTask = downloadQueue.find(t => t.status === 'pending');
            if (nextTask) {
                processingRef.current = true;
                processDownloadTask(nextTask);
            }
        }
    }, [downloadQueue]);

    if (isLoadingApp) {
        return <SplashScreen finishLoading={() => setIsLoadingApp(false)} />;
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <LiquidBackground />
            
            <Header 
                onDonateClick={() => setIsDonateModalOpen(true)}
                onHomeClick={() => { setView('home'); setSelectedAnime(null); }}
                onSearchClick={() => setIsSearchOpen(true)}
                onGlossaryClick={() => { setView('glossary'); setSelectedAnime(null); }}
                onRankingClick={() => { setView('ranking'); setSelectedAnime(null); }}
                onScheduleClick={() => { setView('schedule'); setSelectedAnime(null); }}
                onMusicClick={() => { setView('music'); setSelectedAnime(null); }}
                onSettingsClick={() => setIsSettingsOpen(true)}
                onLikedImagesClick={() => { setView('liked-images'); setSelectedAnime(null); }}
                onCssEditorClick={() => setIsCssEditorOpen(true)}
                onRandomClick={() => { setView('random'); setSelectedAnime(null); }}
                onRelaxationClick={() => { setView('relaxation'); setSelectedAnime(null); }}
                onTodoListClick={() => { setView('todo-list'); setSelectedAnime(null); }}
                onStoreClick={() => setIsStoreOpen(true)}
                onDataStoreClick={() => setIsDataStoreOpen(true)}
                onOfflineClick={() => { setView('offline-videos'); setSelectedAnime(null); }}
                installApp={handleInstallApp}
                settings={settings}
                view={view}
            />

            <div className={`pt-20 md:pt-24 px-4 pb-24 h-screen overflow-y-auto no-scrollbar ${settings.headerPosition === 'left' || settings.headerPosition === 'right' ? 'md:pl-24' : ''}`}>
                {selectedAnime ? (
                     <AnimePlayer 
                        anime={selectedAnime} 
                        settings={settings} 
                        onClose={() => setSelectedAnime(null)} 
                        allowDownload={true}
                        downloadQueue={downloadQueue}
                        addToQueue={(task) => setDownloadQueue(prev => [...prev, task])}
                    />
                ) : (
                    <>
                        {view === 'home' && (
                            <div className="h-full flex flex-col items-center justify-center">
                                {loading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-theme-lime"></div>
                                        <p className="text-theme-lime font-bold animate-pulse">{loadingStatus}</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center p-8 bg-red-900/50 rounded-2xl border border-red-500">
                                        <h2 className="text-2xl font-bold text-red-400 mb-2">Lỗi tải dữ liệu</h2>
                                        <p>{error}</p>
                                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 rounded-lg text-white font-bold hover:bg-red-600">Thử lại</button>
                                    </div>
                                ) : (
                                    <div className="w-full h-full max-w-7xl mx-auto">
                                        <RecommendedAnime animeList={recommendedAnime} onSelectAnime={setSelectedAnime} settings={settings} />
                                    </div>
                                )}
                            </div>
                        )}
                        {view === 'glossary' && <Glossary settings={settings} />}
                        {view === 'ranking' && <Ranking settings={settings} />}
                        {view === 'schedule' && <AiringSchedule settings={settings} containerClassName="h-full" />}
                        {view === 'music' && <MusicPage settings={settings} likedImages={likedImages} onToggleLike={toggleLikeImage} />}
                        {view === 'liked-images' && <LikedImagesPage settings={settings} likedImages={likedImages} onRemoveImage={toggleLikeImage} />}
                        {view === 'random' && <RandomAnimePage animeList={animeList} settings={settings} />}
                        {view === 'relaxation' && <RelaxationPage settings={settings} onClose={() => setView('home')} />}
                        {view === 'todo-list' && <TodoListPage settings={settings} onBack={() => setView('home')} />}
                        {view === 'offline-videos' && <OfflinePage settings={settings} onBack={() => setView('home')} />}
                    </>
                )}
            </div>

            <DonateModal isOpen={isDonateModalOpen} onClose={() => setIsDonateModalOpen(false)} settings={settings} />
            <SearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                animeList={animeList} 
                onSelectAnime={(anime) => { setSelectedAnime(anime); setIsSearchOpen(false); }} 
                settings={settings}
                isBackgroundFetching={isBackgroundFetching}
                backgroundStatus={loadingStatus}
            />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSettingsChange={setSettings} />
            <CssEditorModal isOpen={isCssEditorOpen} onClose={() => setIsCssEditorOpen(false)} settings={settings} onSettingsChange={setSettings} />
            <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} settings={settings} onSettingsChange={setSettings} />
            <DataStoreModal isOpen={isDataStoreOpen} onClose={() => setIsDataStoreOpen(false)} settings={settings} onSettingsChange={setSettings} />
            
             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default App;

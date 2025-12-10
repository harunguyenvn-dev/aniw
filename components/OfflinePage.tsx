
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, OfflineVideo } from '../types';
import { BackIcon, PlayIcon, TrashIcon, DatabaseIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon } from './icons';

declare var Hls: any;

interface OfflinePageProps {
    settings: Settings;
    onBack: () => void;
}

interface WatchHistory {
    [id: string]: {
        currentTime: number;
        duration: number;
        lastUpdated: number;
        isFinished: boolean;
    };
}

const OfflinePage: React.FC<OfflinePageProps> = ({ settings, onBack }) => {
    const [videos, setVideos] = useState<OfflineVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<OfflineVideo | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    
    // Resume Logic State
    const [watchHistory, setWatchHistory] = useState<WatchHistory>({});
    const [resumePrompt, setResumePrompt] = useState<{ show: boolean; time: number } | null>(null);
    
    // Refs for player management
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<any>(null);
    const assetUrlRef = useRef<string | null>(null);
    const manifestUrlRef = useRef<string | null>(null);

    useEffect(() => {
        loadVideos();
        // Load history from local storage
        try {
            const savedHistory = localStorage.getItem('aniw_offline_history');
            if (savedHistory) {
                setWatchHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }

        return () => {
            cleanupPlayer();
        };
    }, []);

    // Effect to handle video playback when playingVideo changes
    useEffect(() => {
        if (playingVideo && videoRef.current) {
            playVideoFile(playingVideo);
            
            // Check for resume capability
            const history = watchHistory[playingVideo.id];
            if (history && !history.isFinished && history.currentTime > 5) {
                // Pause initially to show prompt
                if (videoRef.current) videoRef.current.pause();
                setResumePrompt({ show: true, time: history.currentTime });
            } else {
                setResumePrompt(null);
            }
        } else {
            cleanupPlayer();
            setResumePrompt(null);
        }
    }, [playingVideo]);

    const saveHistory = (id: string, currentTime: number, duration: number, isFinished: boolean) => {
        setWatchHistory(prev => {
            const newHistory = {
                ...prev,
                [id]: {
                    currentTime,
                    duration,
                    lastUpdated: Date.now(),
                    isFinished
                }
            };
            localStorage.setItem('aniw_offline_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const cleanupPlayer = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (assetUrlRef.current) {
            URL.revokeObjectURL(assetUrlRef.current);
            assetUrlRef.current = null;
        }
        if (manifestUrlRef.current) {
            URL.revokeObjectURL(manifestUrlRef.current);
            manifestUrlRef.current = null;
        }
    };

    const playVideoFile = (video: OfflineVideo) => {
        cleanupPlayer(); // Ensure clean state
        const videoEl = videoRef.current;
        if (!videoEl) return;

        // Reset video state
        videoEl.currentTime = 0;

        // Create Blob URL for the video data
        const videoBlobUrl = URL.createObjectURL(video.blob);
        assetUrlRef.current = videoBlobUrl;

        // Case 1: TS File (MPEG-TS) - Requires Hls.js Transmuxing via Virtual Manifest
        if (video.fileType === 'video/mp2t' || video.fileType === 'video/ts') {
            if ((window as any).Hls && (window as any).Hls.isSupported()) {
                console.log("OfflinePage: Playing TS file via Hls.js Virtual Manifest");
                
                // Create a virtual M3U8 manifest pointing to the blob
                const virtualManifest = 
`#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:999999
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:999999.0,
${videoBlobUrl}
#EXT-X-ENDLIST`;

                const manifestBlob = new Blob([virtualManifest], { type: 'application/vnd.apple.mpegurl' });
                const manifestUrl = URL.createObjectURL(manifestBlob);
                manifestUrlRef.current = manifestUrl;

                const hls = new (window as any).Hls({
                    debug: false,
                    enableWorker: true
                });
                
                hls.loadSource(manifestUrl);
                hls.attachMedia(videoEl);
                
                hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
                    // Only autoplay if we are not showing the resume prompt immediately
                    const history = watchHistory[video.id];
                    if (!history || history.isFinished || history.currentTime <= 5) {
                        videoEl.play().catch(e => console.warn("Auto-play blocked", e));
                    }
                });

                hlsRef.current = hls;
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                videoEl.src = videoBlobUrl;
                // Only autoplay if needed
                const history = watchHistory[video.id];
                if (!history || history.isFinished || history.currentTime <= 5) {
                    videoEl.play();
                }
            } else {
                alert("Trình duyệt này không hỗ trợ phát file TS Offline. Vui lòng tải về máy để xem.");
            }
        } 
        // Case 2: MP4/WebM - Native Playback
        else {
            console.log("OfflinePage: Playing native format");
            videoEl.src = videoBlobUrl;
            
            const history = watchHistory[video.id];
            if (!history || history.isFinished || history.currentTime <= 5) {
                videoEl.play().catch(e => console.warn("Auto-play blocked", e));
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && playingVideo) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            
            if (duration > 0) {
                // If within last 10 seconds or 95%, mark as finished
                const isFinished = currentTime >= duration - 10 || (currentTime / duration) > 0.95;
                
                // Save every 5 seconds or if finished
                if (isFinished || Math.floor(currentTime) % 5 === 0) {
                    saveHistory(playingVideo.id, currentTime, duration, isFinished);
                }
            }
        }
    };

    const handleVideoEnded = () => {
        if (playingVideo && videoRef.current) {
            saveHistory(playingVideo.id, videoRef.current.duration, videoRef.current.duration, true);
        }
    };

    const handleResume = () => {
        if (videoRef.current && resumePrompt) {
            videoRef.current.currentTime = resumePrompt.time;
            videoRef.current.play();
            setResumePrompt(null);
        }
    };

    const handleStartOver = () => {
        if (videoRef.current && playingVideo) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            saveHistory(playingVideo.id, 0, videoRef.current.duration, false);
            setResumePrompt(null);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h} giờ ${m} phút`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const loadVideos = async () => {
        setLoading(true);
        try {
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

            const transaction = db.transaction(['videos'], 'readonly');
            const store = transaction.objectStore('videos');
            const request = store.getAll();

            const loadedVideos = await new Promise<OfflineVideo[]>((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            setVideos(loadedVideos);
        } catch (error) {
            console.error("Failed to load offline videos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa video này không?")) return;
        
        try {
            const dbRequest = indexedDB.open('aniw-offline-db', 1);
            const db = await new Promise<IDBDatabase>((resolve) => dbRequest.onsuccess = () => resolve(dbRequest.result));
            const transaction = db.transaction(['videos'], 'readwrite');
            const store = transaction.objectStore('videos');
            store.delete(id);
            setVideos(videos.filter(v => v.id !== id));
            
            // Also remove history
            setWatchHistory(prev => {
                const newH = {...prev};
                delete newH[id];
                localStorage.setItem('aniw_offline_history', JSON.stringify(newH));
                return newH;
            });

            if (playingVideo?.id === id) {
                setPlayingVideo(null);
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleSaveToDevice = (video: OfflineVideo, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = URL.createObjectURL(video.blob);
        const link = document.createElement('a');
        link.href = url;
        const ext = video.fileType === 'video/mp2t' ? '.ts' : '.mp4';
        link.download = `${video.animeName} - ${video.episodeTitle}${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleClosePlayer = () => {
        setPlayingVideo(null);
        setResumePrompt(null);
    };
    
    // Group videos by Anime Name
    const groupedVideos = useMemo(() => {
        const groups: { [key: string]: OfflineVideo[] } = {};
        videos.forEach(video => {
            if (!groups[video.animeName]) {
                groups[video.animeName] = [];
            }
            groups[video.animeName].push(video);
        });
        return groups;
    }, [videos]);

    const toggleGroup = (animeName: string) => {
        setExpandedGroups(prev => 
            prev.includes(animeName) 
                ? prev.filter(name => name !== animeName) 
                : [...prev, animeName]
        );
    };

    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const containerBg = isGlass ? 'glass-card' : 'bg-theme-lightest dark:bg-theme-darkest';
    const textColor = 'text-theme-darkest dark:text-theme-lightest';
    const cardBg = isGlass ? 'bg-white/30 dark:bg-black/30' : 'bg-[#e9e9e5] dark:bg-slate-800';
    const contentBg = isGlass ? 'bg-white/10 dark:bg-white/5' : 'bg-[#f4f4f1] dark:bg-slate-700/50';

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${containerBg} ${textColor} p-4 md:p-8 pt-20`}>
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <DatabaseIcon className="w-8 h-8 text-theme-lime" />
                        Kho Phim Bí Mật (Offline)
                    </h1>
                    <p className="opacity-70">Xem phim mượt mà ngay cả khi không có mạng.</p>
                </div>
                <button 
                    onClick={onBack}
                    className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    <BackIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Video Player Modal */}
            {playingVideo && (
                <div className="fixed inset-0 z-[60] bg-black flex flex-col justify-center animate-fade-in">
                    <button 
                        onClick={handleClosePlayer}
                        className="absolute top-4 left-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-all hover:scale-110"
                    >
                        <BackIcon className="w-8 h-8" />
                    </button>
                    
                    <div className="w-full h-full relative group flex items-center justify-center">
                        <video 
                            ref={videoRef}
                            controls 
                            playsInline
                            className="w-full h-full object-contain"
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleVideoEnded}
                        />

                        {/* Resume Prompt Overlay */}
                        {resumePrompt && resumePrompt.show && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                                <div className="bg-[#1a1a1a] border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full text-center mx-4">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Chào mừng bạn trở lại! 👋</h3>
                                    <p className="text-slate-300 mb-6">
                                        Bạn xem dở ở <span className="text-theme-lime font-mono font-bold">{formatTime(resumePrompt.time)}</span>.
                                        <br/>Bạn có muốn xem tiếp đoạn này không?
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={handleResume}
                                            className="w-full py-3 bg-theme-lime text-theme-darkest font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                        >
                                            <PlayIcon className="w-5 h-5" /> Có chứ, xem tiếp đi!
                                        </button>
                                        <button 
                                            onClick={handleStartOver}
                                            className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                                        >
                                            Xem lại từ đầu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-white text-xl md:text-2xl font-bold drop-shadow-md">{playingVideo.episodeTitle}</h2>
                        <p className="text-white/70 text-sm md:text-base drop-shadow-md">{playingVideo.animeName}</p>
                        {playingVideo.fileType === 'video/mp2t' && (
                             <p className="text-green-400 text-xs mt-2 drop-shadow-md bg-black/50 inline-block px-2 py-1 rounded font-mono">
                                Đang phát định dạng .TS qua Hls.js
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Video List (Grouped) */}
            <div className="max-w-4xl mx-auto pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-lime"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <DatabaseIcon className="w-20 h-20 mb-4" />
                        <p className="text-xl font-bold">Chưa có video nào được tải về!</p>
                        <p className="text-sm mt-2">Hãy tải phim khi có mạng để xem tại đây nhé.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {Object.entries(groupedVideos).map(([animeName, eps]) => {
                            const isExpanded = expandedGroups.includes(animeName);
                            return (
                                <div key={animeName} className={`rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${cardBg}`}>
                                    {/* Accordion Header */}
                                    <button 
                                        onClick={() => toggleGroup(animeName)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* "M" Icon square like in the user image */}
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-500/30 flex-shrink-0">
                                                ✦
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-lg leading-tight line-clamp-1">{animeName}</h3>
                                                <p className="text-xs font-medium opacity-60 font-mono mt-0.5">{eps.length} tập phim</p>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-black/5 dark:bg-white/10' : ''}`}>
                                            <ChevronDownIcon className="w-5 h-5 opacity-60" />
                                        </div>
                                    </button>

                                    {/* Episodes List (Content) */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className={`p-2 space-y-2 ${contentBg}`}>
                                            {eps.map((video) => {
                                                const history = watchHistory[video.id];
                                                const isFinished = history?.isFinished;
                                                const progress = history ? (history.currentTime / (history.duration || 1)) * 100 : 0;
                                                
                                                return (
                                                <div 
                                                    key={video.id} 
                                                    onClick={() => setPlayingVideo(video)}
                                                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 shadow-sm transition-all cursor-pointer group relative overflow-hidden"
                                                >
                                                    {/* Progress Bar Background */}
                                                    {history && !isFinished && (
                                                        <div 
                                                            className="absolute bottom-0 left-0 h-1 bg-theme-lime/50 transition-all duration-500" 
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    )}

                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform flex-shrink-0 ${isFinished ? 'bg-green-500 text-white' : 'bg-theme-lime/20 text-theme-olive dark:text-theme-lime group-hover:scale-110'}`}>
                                                            {isFinished ? <CheckIcon className="w-5 h-5" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-sm truncate">{video.episodeTitle}</p>
                                                                {isFinished && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Đã xem xong</span>}
                                                            </div>
                                                            <p className="text-[10px] opacity-50 font-mono">
                                                                {new Date(video.savedAt).toLocaleDateString()} • {(video.blob.size / (1024 * 1024)).toFixed(1)} MB
                                                                {video.fileType === 'video/mp2t' && <span className="ml-2 px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-bold">TS</span>}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={(e) => handleSaveToDevice(video, e)}
                                                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                                            title="Lưu file về máy"
                                                        >
                                                            <DownloadIcon className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                                            title="Xóa video"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )})}
                                            <div className="h-2"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default OfflinePage;

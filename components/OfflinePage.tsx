
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, OfflineVideo } from '../types';
import { BackIcon, PlayIcon, TrashIcon, DatabaseIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon } from './icons';

declare var Hls: any;

interface OfflinePageProps {
    settings: Settings;
    onBack: () => void;
}

const OfflinePage: React.FC<OfflinePageProps> = ({ settings, onBack }) => {
    const [videos, setVideos] = useState<OfflineVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<OfflineVideo | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
    
    // Refs for player management
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<any>(null);
    const assetUrlRef = useRef<string | null>(null);
    const manifestUrlRef = useRef<string | null>(null);

    useEffect(() => {
        loadVideos();
        // Cleanup on unmount
        return () => {
            cleanupPlayer();
        };
    }, []);

    // Effect to handle video playback when playingVideo changes
    useEffect(() => {
        if (playingVideo && videoRef.current) {
            playVideoFile(playingVideo);
        } else {
            cleanupPlayer();
        }
    }, [playingVideo]);

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
                    videoEl.play().catch(e => console.warn("Auto-play blocked", e));
                });

                hlsRef.current = hls;
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS support (might not work with blob URI inside manifest but worth a try or direct play)
                // Safari usually supports TS natively in some contexts, or we try standard src
                videoEl.src = videoBlobUrl;
                videoEl.play();
            } else {
                alert("Trình duyệt này không hỗ trợ phát file TS Offline. Vui lòng tải về máy để xem.");
            }
        } 
        // Case 2: MP4/WebM - Native Playback
        else {
            console.log("OfflinePage: Playing native format");
            videoEl.src = videoBlobUrl;
            videoEl.play().catch(e => console.warn("Auto-play blocked", e));
        }
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
            
            // Auto expand all groups initially
            const initialExpandedState: {[key: string]: boolean} = {};
            loadedVideos.forEach(v => {
                initialExpandedState[v.animeName] = true;
            });
            setExpandedGroups(initialExpandedState);

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
        // Check file type to give correct extension
        const ext = video.fileType === 'video/mp2t' ? '.ts' : '.mp4';
        link.download = `${video.animeName} - ${video.episodeTitle}${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleClosePlayer = () => {
        setPlayingVideo(null);
    };
    
    const toggleGroup = (animeName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [animeName]: !prev[animeName]
        }));
    };

    // --- GROUPING & SORTING LOGIC ---
    const groupedVideos = useMemo(() => {
        const groups: { [key: string]: OfflineVideo[] } = {};
        
        // 1. Group by Anime Name
        videos.forEach(video => {
            if (!groups[video.animeName]) {
                groups[video.animeName] = [];
            }
            groups[video.animeName].push(video);
        });

        // 2. Sort Episodes naturally within each group (Ep 1, Ep 2, Ep 10...)
        Object.keys(groups).forEach(animeName => {
            groups[animeName].sort((a, b) => {
                // Try to extract numbers for better sorting
                const getNumber = (str: string) => {
                    const match = str.match(/\d+(\.\d+)?/);
                    return match ? parseFloat(match[0]) : 0;
                };
                return getNumber(a.episodeTitle) - getNumber(b.episodeTitle);
            });
        });

        // 3. Sort Anime Groups Alphabetically
        const sortedGroups = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
        
        return sortedGroups;
    }, [videos]);


    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const containerBg = isGlass ? 'glass-card' : 'bg-theme-lightest dark:bg-theme-darkest';
    const textColor = 'text-theme-darkest dark:text-theme-lightest';
    const sectionBg = isGlass ? 'bg-white/10' : 'bg-slate-200/50 dark:bg-slate-800/50';

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${containerBg} ${textColor} p-4 md:p-8 pt-20`}>
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
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
                    
                    <div className="w-full h-full relative group">
                        <video 
                            ref={videoRef}
                            controls 
                            playsInline
                            className="w-full h-full object-contain"
                        />
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

            {/* Content Area */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-lime"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <DatabaseIcon className="w-20 h-20 mb-4" />
                        <p className="text-xl font-bold">Chưa có video nào được tải về!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupedVideos.map(([animeName, episodes]) => (
                            <div key={animeName} className={`rounded-3xl overflow-hidden ${sectionBg} border border-slate-300/30 dark:border-slate-700/30 shadow-sm`}>
                                {/* Group Header */}
                                <button 
                                    onClick={() => toggleGroup(animeName)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-theme-lime flex items-center justify-center text-theme-darkest font-bold text-lg shadow-sm">
                                            {animeName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-lg md:text-xl font-bold">{animeName}</h2>
                                            <p className="text-xs opacity-60 font-mono">{episodes.length} tập phim</p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-transform duration-300 ${expandedGroups[animeName] ? 'rotate-180' : ''}`}>
                                        <ChevronDownIcon className="w-6 h-6 opacity-60" />
                                    </div>
                                </button>

                                {/* Episodes Grid */}
                                {expandedGroups[animeName] && (
                                    <div className="p-4 md:p-6 bg-white/50 dark:bg-black/20">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                            {episodes.map(video => (
                                                <div key={video.id} className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-theme-lime/50 transition-all hover:-translate-y-1 cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                                    <div className="aspect-video bg-slate-300 dark:bg-black flex items-center justify-center relative overflow-hidden">
                                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform z-10 border border-white/30">
                                                            <PlayIcon className="w-6 h-6 text-white ml-1" />
                                                        </div>
                                                        
                                                        {/* Pattern background */}
                                                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
                                                        
                                                        {video.fileType === 'video/mp2t' && (
                                                            <span className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">TS</span>
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-bold text-base line-clamp-1 group-hover:text-theme-olive dark:group-hover:text-theme-lime transition-colors">{video.episodeTitle}</h3>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-end">
                                                             <p className="text-xs opacity-50 font-mono">
                                                                {(video.blob.size / (1024 * 1024)).toFixed(1)} MB
                                                            </p>
                                                            <div className="flex gap-1">
                                                                <button 
                                                                    onClick={(e) => handleSaveToDevice(video, e)}
                                                                    className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                                    title="Lưu file về máy"
                                                                >
                                                                    <DownloadIcon className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                                                                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    title="Xóa video"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
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

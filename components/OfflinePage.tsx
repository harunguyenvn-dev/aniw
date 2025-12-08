
import React, { useState, useEffect } from 'react';
import { Settings, OfflineVideo } from '../types';
import { BackIcon, PlayIcon, TrashIcon, DatabaseIcon } from './icons';

interface OfflinePageProps {
    settings: Settings;
    onBack: () => void;
}

const OfflinePage: React.FC<OfflinePageProps> = ({ settings, onBack }) => {
    const [videos, setVideos] = useState<OfflineVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<OfflineVideo | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        loadVideos();
    }, []);

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
            if (playingVideo?.id === id) {
                setPlayingVideo(null);
                setVideoUrl(null);
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handlePlay = (video: OfflineVideo) => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        const url = URL.createObjectURL(video.blob);
        setVideoUrl(url);
        setPlayingVideo(video);
    };

    const handleClosePlayer = () => {
        setPlayingVideo(null);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
    };

    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const containerBg = isGlass ? 'glass-card' : 'bg-theme-lightest dark:bg-theme-darkest';
    const textColor = 'text-theme-darkest dark:text-theme-lightest';

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
            {playingVideo && videoUrl && (
                <div className="fixed inset-0 z-[60] bg-black flex flex-col justify-center">
                    <button 
                        onClick={handleClosePlayer}
                        className="absolute top-4 left-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                    >
                        <BackIcon className="w-8 h-8" />
                    </button>
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none">
                        <h2 className="text-white text-xl font-bold drop-shadow-md">{playingVideo.episodeTitle}</h2>
                        <p className="text-white/70 text-sm drop-shadow-md">{playingVideo.animeName}</p>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-lime"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <DatabaseIcon className="w-20 h-20 mb-4" />
                        <p className="text-xl font-bold">Chưa có video nào được lưu!</p>
                        <p>Hãy tìm nguồn cho phép tải (như OPhim) và tải về nhé.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map(video => (
                            <div key={video.id} className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="aspect-video bg-slate-300 dark:bg-slate-900 flex items-center justify-center relative">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlayIcon className="w-8 h-8 text-white ml-1" />
                                    </div>
                                    <button 
                                        onClick={() => handlePlay(video)}
                                        className="absolute inset-0 w-full h-full z-10"
                                    />
                                </div>
                                <div className="p-4 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg line-clamp-1">{video.animeName}</h3>
                                        <p className="text-sm opacity-70 mb-2">{video.episodeTitle}</p>
                                        <p className="text-xs opacity-50">Lưu lúc: {new Date(video.savedAt).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(video.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Xóa video"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfflinePage;

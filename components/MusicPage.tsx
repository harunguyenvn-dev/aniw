import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from '../types';
import { DownloadIcon, ChevronUpIcon, ChevronDownIcon, HeartIcon } from './icons';

interface MusicPageProps {
    settings: Settings;
    likedImages: string[];
    onToggleLike: (url: string) => void;
}

interface WaifuImage {
    url: string;
}

const MusicPage: React.FC<MusicPageProps> = ({ settings, likedImages, onToggleLike }) => {
    const [images, setImages] = useState<WaifuImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('animate-fade-in');
    
    const loadingRef = useRef(loading);
    loadingRef.current = loading;

    const fetchWaifus = useCallback(async (isInitial = false) => {
        if (!isInitial && loadingRef.current) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://api.waifu.pics/many/sfw/waifu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exclude: [] }),
            });
            if (!response.ok) throw new Error(`API error! status: ${response.status}`);
            const data = await response.json();
            const newImages = data.files.map((url: string) => ({ url }));
            setImages(prevImages => isInitial ? newImages : [...prevImages, ...newImages]);
        } catch (e: any) {
            setError(`Không thể tải ảnh waifu. Lỗi: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWaifus(true);
    }, [fetchWaifus]);

    useEffect(() => {
        if (!loading && images.length > 0 && activeIndex >= images.length - 5) {
            fetchWaifus();
        }
    }, [activeIndex, images.length, loading, fetchWaifus]);

    const handlePrev = () => {
        if (activeIndex > 0) {
            setAnimationClass('animate-slide-from-top');
            setActiveIndex(prev => prev - 1);
        }
    };
    
    const handleNext = () => {
        if (activeIndex < images.length - 1) {
            setAnimationClass('animate-slide-from-bottom');
            setActiveIndex(prev => prev + 1);
        } else if (!loading) {
            fetchWaifus();
        }
    };

    const handleDownload = async (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok.');
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            const fileName = url.split('/').pop()?.split('?')[0] || 'waifu.jpg';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } catch (err) {
            console.error("Failed to download image:", err);
            window.open(url, '_blank');
        }
    };

    const currentImage = images[activeIndex];
    const isLiked = currentImage && likedImages.includes(currentImage.url);

    if (loading && images.length === 0) {
        return (
            <div className="h-screen w-screen flex justify-center items-center bg-theme-darkest">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-theme-lime"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="h-screen w-screen flex justify-center items-center text-center px-4 bg-theme-darkest">
                <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg">
                    <h2 className="text-xl font-bold text-red-400 mb-4">Đã xảy ra lỗi</h2>
                    <p className="text-slate-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="h-screen w-screen relative overflow-hidden bg-theme-darkest text-white">
            {/* Blurred Background */}
            {currentImage && (
                <div className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out">
                    <img src={currentImage.url} className="w-full h-full object-cover filter blur-3xl scale-125 opacity-30" alt="background"/>
                </div>
            )}
             {/* Gradient Overlay for Liquid Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-theme-darkest/50 via-transparent to-theme-olive/30"></div>

            <div className="relative w-full h-full flex items-center justify-center">
                {/* Counter on the left */}
                <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 font-mono z-10">
                    <div className="text-5xl md:text-7xl font-bold opacity-20 transition-opacity duration-300" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                        {activeIndex > 0 ? String(activeIndex).padStart(2, '0') : ''}
                    </div>
                    <div className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white/90 to-white/40 transition-all duration-300" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                        {String(activeIndex + 1).padStart(2, '0')}
                    </div>
                     <div className="text-5xl md:text-7xl font-bold opacity-20 transition-opacity duration-300" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                        {activeIndex < images.length - 1 ? String(activeIndex + 2).padStart(2, '0') : ''}
                    </div>
                </div>

                {/* Image Viewer */}
                <div className="relative w-full md:w-auto h-full md:h-[calc(100vh-4rem)] md:max-w-4xl flex items-center justify-center px-4 md:px-0">
                     <div className="relative w-auto h-full max-h-full aspect-[9/16] shadow-2xl shadow-black/50 rounded-3xl overflow-hidden bg-black/20 backdrop-blur-md border border-white/10 p-2">
                        {currentImage && (
                            <div key={activeIndex} className={`w-full h-full ${animationClass} relative group`}>
                                <img src={currentImage.url} className="w-full h-full object-cover rounded-2xl" alt={`Waifu ${activeIndex + 1}`} />
                                
                                {/* Heart Button */}
                                <button 
                                    onClick={() => onToggleLike(currentImage.url)}
                                    className="absolute bottom-4 right-4 p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all hover:scale-110"
                                >
                                    <HeartIcon className={`w-8 h-8 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Navigation on the right */}
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 z-10">
                    <button onClick={handlePrev} disabled={activeIndex === 0} className="p-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white/20 hover:scale-110">
                        <ChevronUpIcon className="w-6 h-6"/>
                    </button>
                    <button onClick={handleNext} disabled={loading && activeIndex === images.length -1} className="p-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white/20 hover:scale-110">
                        <ChevronDownIcon className="w-6 h-6"/>
                    </button>
                    {currentImage && (
                        <button 
                            onClick={(e) => handleDownload(currentImage.url, e)}
                            className="p-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 mt-4"
                            aria-label="Download image"
                        >
                            <DownloadIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes slide-from-bottom {
                    from { transform: translateY(50%) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes slide-from-top {
                    from { transform: translateY(-50%) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-from-bottom { animation: slide-from-bottom 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                .animate-slide-from-top { animation: slide-from-top 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>
        </main>
    );
};

export default MusicPage;

import React from 'react';
import { Settings } from '../types';
import { TrashIcon, DownloadIcon } from './icons';

interface LikedImagesPageProps {
    settings: Settings;
    likedImages: string[];
    onRemoveImage: (url: string) => void;
}

const LikedImagesPage: React.FC<LikedImagesPageProps> = ({ settings, likedImages, onRemoveImage }) => {
    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    
    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = 'waifu-liked.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    return (
        <main className="min-h-screen w-full pt-24 pb-10 px-4 sm:px-8">
             <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-10">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-theme-lime to-theme-mint">
                       Bộ Sưu Tập Waifu Đã Thích
                    </span>
                </h1>

                {likedImages.length === 0 ? (
                    <div className={`text-center p-10 rounded-2xl ${isGlass ? 'glass-card' : 'bg-theme-lightest/10'}`}>
                        <p className="text-xl text-theme-darkest dark:text-theme-lightest">Bạn chưa thả tim tấm ảnh nào cả! (｡•́︿•̀｡)</p>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy quay lại mục Waifu và tìm kiếm tình yêu đích thực nhé!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {likedImages.map((url, index) => (
                            <div key={index} className="group relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105">
                                <img 
                                    src={url} 
                                    alt="Liked Waifu" 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleDownload(url)}
                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                        title="Tải xuống"
                                    >
                                        <DownloadIcon className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => onRemoveImage(url)}
                                        className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                                        title="Bỏ thích"
                                    >
                                        <TrashIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </main>
    );
};

export default LikedImagesPage;
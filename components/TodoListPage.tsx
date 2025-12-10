
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { 
    HomeIcon, HeartIcon, 
    PlayIcon, CalendarDaysIcon,
    SparklesIcon, ClockIcon, 
    DevicePhoneMobileIcon,
    BookmarkSolidIcon,
    TrashIcon,
    CheckIcon,
    MoonIcon,
    SunIcon,
    ShareIcon,
    VideoCameraIcon
} from './icons';

// --- Additional Icons defined locally to avoid modifying icons.tsx if not strictly necessary, 
// or mapping existing ones creatively ---
const ClockIconLocal = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface TodoListPageProps {
    settings: Settings;
    onBack?: () => void;
}

// --- NEO COMPONENTS ---

const NeoCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    color?: string;
    onClick?: () => void;
}> = ({ children, className = "", color = "bg-white", onClick }) => (
    <div 
        onClick={onClick}
        className={`${color} border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${className} overflow-hidden cursor-pointer relative group`}
    >
        {children}
    </div>
);

const SectionTitle: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; color: string }> = ({ title, subtitle, icon, color }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color} border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            {icon}
        </div>
        <div>
            <h2 className="font-black text-xl uppercase italic tracking-tighter text-slate-800 dark:text-slate-200">{title}</h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
    </div>
);

// --- MAIN PAGE ---

const TodoListPage: React.FC<TodoListPageProps> = ({ settings, onBack }) => {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [savedEpisodes, setSavedEpisodes] = useState<any[]>([]);

    // Load Data from LocalStorage
    useEffect(() => {
        try {
            const h = JSON.parse(localStorage.getItem('aniw_watch_history') || '[]');
            setHistory(h);
            
            const f = JSON.parse(localStorage.getItem('aniw_favorites') || '[]');
            setFavorites(f);

            const s = JSON.parse(localStorage.getItem('aniw_liked_episodes') || '[]');
            setSavedEpisodes(s);
        } catch (e) {
            console.error("Failed to load dashboard data", e);
        }
    }, []);

    const handleToolClick = (toolName: string) => {
        setActiveTool(toolName);
        setTimeout(() => setActiveTool(null), 2000); // Reset feedback
        
        if (toolName === 'PiP') {
            // Logic PiP thực tế sẽ cần video element, ở đây ta mô phỏng UI
            // Trong thực tế, nút này sẽ gửi event đến Global Video Player
            const video = document.querySelector('video');
            if (video && document.pictureInPictureEnabled) {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                } else {
                    video.requestPictureInPicture();
                }
            } else {
                alert("Hãy mở video trước khi dùng PiP nhé!");
            }
        }
        if (toolName === 'Focus') {
            // Toggle focus mode logic (mock)
            const root = document.getElementById('root');
            if(root) root.classList.toggle('focus-mode-active');
        }
    };

    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const bgClass = isGlass ? 'bg-transparent' : 'bg-[#F0F2F5] dark:bg-[#121212]';
    const textMain = isGlass ? 'text-theme-darkest dark:text-theme-lightest' : 'text-slate-900 dark:text-slate-100';

    return (
        <div className={`min-h-screen ${bgClass} p-4 md:p-8 pt-24 pb-20 font-sans selection:bg-theme-lime`}>
            <div className="max-w-6xl mx-auto">
                
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={onBack}
                        className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-xl border-2 border-black dark:border-slate-600 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-2"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Quay lại
                    </button>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-black dark:border-slate-600 rounded-full px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
                        <div className="w-8 h-8 rounded-full border border-black dark:border-slate-500 overflow-hidden">
                            <img src={settings.avatarUrl} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-sm">Hi, {settings.username || 'Senpai'}!</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: FEATURES (CHỨC NĂNG) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <SectionTitle 
                            title="Kho Tàng Của Bạn" 
                            subtitle="Dữ liệu cá nhân & Lưu trữ" 
                            color="bg-purple-300"
                            icon={<BookmarkSolidIcon className="w-5 h-5 text-black" />}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Feature 1: History */}
                            <NeoCard className="sm:col-span-2 bg-white dark:bg-slate-800 p-5 group" onClick={() => {}}>
                                <div className="flex justify-between items-start">
                                    <div className="dark:text-white">
                                        <div className="bg-orange-100 dark:bg-orange-900/30 w-fit px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800 text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
                                            Tiếp tục xem
                                        </div>
                                        <h3 className="font-black text-2xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Lịch sử xem</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                                            Bạn đã xem <span className="text-black dark:text-white font-bold">{history.length}</span> bộ anime.
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-300 border-2 border-black rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <ClockIconLocal className="w-6 h-6 text-black" />
                                    </div>
                                </div>
                                {/* Recent History List */}
                                <div className="mt-4 flex flex-col gap-2">
                                    {history.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                                            <span className="text-xs font-bold truncate max-w-[70%] dark:text-slate-200">{item.animeName}</span>
                                            <span className="text-[10px] bg-white dark:bg-black/20 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 dark:text-slate-400">{item.episode}</span>
                                        </div>
                                    ))}
                                    {history.length === 0 && <p className="text-xs italic text-slate-400">Chưa có dữ liệu...</p>}
                                </div>
                            </NeoCard>

                            {/* Feature 2: Favorites */}
                            <NeoCard className="bg-pink-200 dark:bg-pink-900/50 p-5 h-48 flex flex-col justify-between" onClick={() => {}}>
                                <div className="flex justify-between items-start">
                                     <HeartIcon className="w-8 h-8 text-red-500 fill-current animate-pulse-slow" />
                                     <span className="font-black text-4xl opacity-20 dark:text-white">{favorites.length}</span>
                                </div>
                                <div className="dark:text-white">
                                    <h3 className="font-bold text-lg leading-tight">Anime<br/>Yêu Thích</h3>
                                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-red-500 h-full" style={{width: `${Math.min(favorites.length * 10, 100)}%`}}></div>
                                    </div>
                                    <p className="text-[10px] mt-1 opacity-70">Nhấn tim để thêm vào đây</p>
                                </div>
                            </NeoCard>

                            {/* Feature 3: Saved Episodes */}
                            <NeoCard className="bg-blue-200 dark:bg-blue-900/50 p-5 h-48 flex flex-col justify-between" onClick={() => {}}>
                                 <div className="flex justify-between items-start">
                                     <BookmarkSolidIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                     <span className="font-black text-4xl opacity-20 dark:text-white">{savedEpisodes.length}</span>
                                </div>
                                <div className="dark:text-white">
                                    <h3 className="font-bold text-lg leading-tight">Tập Phim<br/>Yêu Thích</h3>
                                    <p className="text-xs font-bold opacity-60 mt-1">Danh sách đánh dấu</p>
                                </div>
                            </NeoCard>
                        </div>
                        
                        {/* Quote or Decorative Banner */}
                        <NeoCard className="bg-gradient-to-r from-theme-lime to-theme-mint p-4" onClick={() => {}}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center text-xl">💡</div>
                                <p className="text-sm font-bold italic text-slate-900">"Wibu không bao giờ cô đơn, vì chúng ta có Waifu!"</p>
                            </div>
                        </NeoCard>
                    </div>

                    {/* RIGHT COLUMN: TOOLS (CÔNG CỤ) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <SectionTitle 
                            title="Trạm Điều Khiển" 
                            subtitle="Công cụ tiện ích" 
                            color="bg-yellow-300"
                            icon={<SparklesIcon className="w-5 h-5 text-black" />}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Tool 1: PiP Mode */}
                            <NeoCard 
                                className="col-span-2 bg-white dark:bg-slate-800 p-4 flex items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => handleToolClick('PiP')}
                            >
                                <div className={`w-12 h-12 ${activeTool === 'PiP' ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-600'} border-2 border-black dark:border-slate-500 rounded-xl flex items-center justify-center transition-colors`}>
                                    <DevicePhoneMobileIcon className="w-6 h-6 text-black dark:text-white" />
                                </div>
                                <div className="flex-1 dark:text-white">
                                    <h3 className="font-bold text-base">Chế độ PiP</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Thu nhỏ video xuống góc</p>
                                </div>
                                {activeTool === 'PiP' && <CheckIcon className="w-6 h-6 text-green-500 animate-bounce" />}
                            </NeoCard>

                            {/* Tool 2: Focus Mode */}
                            <NeoCard 
                                className="bg-white dark:bg-slate-800 p-4 flex flex-col gap-3 group"
                                onClick={() => handleToolClick('Focus')}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 ${activeTool === 'Focus' ? 'bg-indigo-400 text-white' : 'bg-indigo-100 dark:bg-indigo-900'} border-2 border-black dark:border-slate-500 rounded-full flex items-center justify-center transition-colors`}>
                                        <EyeIcon className="w-5 h-5 dark:text-white" />
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-green-400 transition-colors"></div>
                                </div>
                                <span className="font-bold text-sm dark:text-white">Chế độ Tập trung</span>
                            </NeoCard>

                            {/* Tool 3: Screenshot (Mock) */}
                            <NeoCard 
                                className="bg-white dark:bg-slate-800 p-4 flex flex-col gap-3 group"
                                onClick={() => handleToolClick('Shot')}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 ${activeTool === 'Shot' ? 'bg-pink-400 text-white' : 'bg-pink-100 dark:bg-pink-900'} border-2 border-black dark:border-slate-500 rounded-full flex items-center justify-center transition-colors`}>
                                         <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 dark:text-white"><path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" /><path fillRule="evenodd" d="M9.344 3.071a4.993 4.993 0 015.312 0l.208.119a2.25 2.25 0 001.129.308h2.257c1.35 0 2.474.965 2.68 2.281l.656 4.2a8.558 8.558 0 010 2.682l-.656 4.2c-.206 1.316-1.33 2.281-2.68 2.281H5.75c-1.35 0-2.474-.965-2.68-2.281l-.656-4.2a8.558 8.558 0 010-2.682l.656-4.2c.206-1.316 1.33-2.281 2.68-2.281h2.257a2.25 2.25 0 001.129-.308l.208-.119zM6 12.75a6 6 0 1112 0 6 6 0 01-12 0z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                                <span className="font-bold text-sm dark:text-white">Chụp màn hình</span>
                            </NeoCard>

                            {/* Tool 4: Share */}
                            <NeoCard 
                                className="col-span-2 bg-yellow-100 dark:bg-yellow-900/40 p-4 flex items-center justify-between group"
                                onClick={() => handleToolClick('Share')}
                            >
                                <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 ${activeTool === 'Share' ? 'bg-yellow-400' : 'bg-white dark:bg-slate-700'} border-2 border-black dark:border-slate-500 rounded-lg flex items-center justify-center transition-colors`}>
                                        <ShareIcon className="w-5 h-5 dark:text-white" />
                                    </div>
                                    <div className="dark:text-white">
                                        <h3 className="font-bold text-sm">Chia sẻ App</h3>
                                        <p className="text-[10px] font-bold opacity-60">Mời bạn bè cùng xem</p>
                                    </div>
                                </div>
                                <div className="bg-black dark:bg-white dark:text-black text-white px-3 py-1 rounded text-xs font-bold group-hover:scale-110 transition-transform">
                                    Copy Link
                                </div>
                            </NeoCard>
                        </div>
                        
                        {/* Footer Info */}
                        <div className="mt-auto text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AniW Utilities v2.5</p>
                            <p className="text-[10px] text-slate-400 mt-1">Made with ❤️ for {settings.username}</p>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default TodoListPage;

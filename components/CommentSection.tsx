
import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';
import { PaperAirplaneIcon, ChatBubbleOvalLeftIcon, UserCircleIcon, HeartIcon, WifiIcon, WifiSlashIcon, DatabaseIcon } from './icons';

// --- CẤU HÌNH API (MONGODB BACKEND) ---
// Anh Hoàng chạy server Backend ở port nào thì đổi ở đây nhé (thường là 5000)
const API_BASE_URL = "http://localhost:5000/api/comments";

interface Comment {
    id: string; // MongoDB _id
    username: string;
    avatar: string;
    content: string;
    timestamp: number;
    likes: number;
    animeId: string; // Thêm animeId để query
}

interface CommentSectionProps {
    animeName: string;
    settings: Settings;
}

const CommentSection: React.FC<CommentSectionProps> = ({ animeName, settings }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDbConnected, setIsDbConnected] = useState(false); // Trạng thái kết nối Server
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Chuẩn hóa tên Anime để dùng làm key (giống logic cũ)
    const safeAnimeKey = animeName.replace(/[.#$/\[\]]/g, "_");

    // Hàm lấy bình luận từ Server (MongoDB)
    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/${safeAnimeKey}`);
            if (!response.ok) {
                throw new Error("Server offline or Error");
            }
            const data = await response.json();
            setComments(data);
            setIsDbConnected(true);
        } catch (error) {
            // console.warn("Không kết nối được MongoDB Server, dùng LocalStorage:", error);
            setIsDbConnected(false);
            loadLocalComments();
        }
    };

    // Hàm lấy từ LocalStorage (Fallback khi server tắt)
    const loadLocalComments = () => {
        const storageKey = `comments_${safeAnimeKey}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setComments(JSON.parse(saved));
        } else {
            setComments([]);
        }
    };

    // Load lần đầu và thiết lập Polling (tự động cập nhật mỗi 5s)
    useEffect(() => {
        fetchComments();
        
        const interval = setInterval(() => {
            // Chỉ poll nếu đang kết nối DB thành công để tránh spam lỗi
            if (isDbConnected) {
                fetchComments(); 
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [safeAnimeKey, isDbConnected]);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Chỉ cuộn xuống khi mới load trang lần đầu hoặc khi mình vừa comment
        // (Logic cuộn này có thể tinh chỉnh sau để tránh phiền người dùng đang đọc)
    }, [comments.length]); // Đơn giản hóa

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);

        const tempId = Date.now().toString(); // ID tạm
        const commentData = {
            username: settings.username || 'Wibu ẩn danh',
            avatar: settings.avatarUrl || '',
            content: newComment,
            timestamp: Date.now(),
            likes: 0,
            animeId: safeAnimeKey
        };

        if (isDbConnected) {
            // --- Gửi lên Server MongoDB ---
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(commentData)
                });
                
                if (response.ok) {
                    await fetchComments(); // Load lại list mới nhất
                    setNewComment('');
                    setTimeout(scrollToBottom, 100);
                } else {
                    throw new Error("Lỗi Server");
                }
            } catch (error) {
                console.error("Lỗi gửi bình luận lên Server:", error);
                alert("Mất kết nối Server. Đang chuyển sang chế độ Offline.");
                saveToLocal(commentData, tempId);
            }
        } else {
            // --- Lưu LocalStorage (Offline) ---
            saveToLocal(commentData, tempId);
        }
        
        setIsLoading(false);
    };

    const saveToLocal = (data: any, id: string) => {
        const newCmt = { ...data, id: id };
        const updatedComments = [...comments, newCmt];
        setComments(updatedComments);
        localStorage.setItem(`comments_${safeAnimeKey}`, JSON.stringify(updatedComments));
        setNewComment('');
        setTimeout(scrollToBottom, 100);
    };

    const toggleLike = async (id: string, currentLikes: number) => {
        if (isDbConnected) {
            // --- Update Server ---
            try {
                // Giả lập Optimistic UI (Cập nhật giao diện ngay lập tức)
                setComments(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));

                await fetch(`${API_BASE_URL}/${id}/like`, {
                    method: 'PATCH',
                });
                // Không cần fetch lại ngay để tránh giật lag
            } catch (error) {
                console.error("Lỗi like:", error);
                // Revert nếu lỗi (Optional)
            }
        } else {
            // --- Update Local ---
            const updated = comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c);
            setComments(updated);
            localStorage.setItem(`comments_${safeAnimeKey}`, JSON.stringify(updated));
        }
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return new Date(timestamp).toLocaleDateString('vi-VN');
    };

    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const textColor = isGlass ? 'text-theme-darkest dark:text-theme-lightest' : 'text-slate-800 dark:text-slate-200';
    const subTextColor = isGlass ? 'text-theme-darkest/60 dark:text-theme-lightest/60' : 'text-slate-500 dark:text-slate-400';
    const bubbleBg = isGlass ? 'bg-white/40 dark:bg-black/40 shadow-sm' : 'bg-white dark:bg-slate-700/50 shadow-sm border border-slate-100 dark:border-slate-700';

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className={`p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0 ${textColor}`}>
                <div className="flex items-center gap-2">
                    <ChatBubbleOvalLeftIcon className="w-5 h-5 text-theme-lime" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Cộng Đồng</h3>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                    {isDbConnected ? (
                        <span className="flex items-center gap-1 text-green-500 font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <DatabaseIcon className="w-3 h-3"/> MongoDB
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-yellow-500 font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20" title="Đang dùng bộ nhớ trình duyệt">
                            <WifiSlashIcon className="w-3 h-3"/> Local
                        </span>
                    )}
                </div>
            </div>
            
            {/* Warning if Server Offline */}
            {!isDbConnected && (
                <div className="bg-yellow-100/10 p-2 text-[10px] text-center text-yellow-600 dark:text-yellow-400 border-b border-yellow-500/20">
                    ⚠️ <b>Chế độ Offline:</b> Không kết nối được Server. Bình luận chỉ lưu trên máy của bạn.
                </div>
            )}

            {/* Comments List */}
            <div className="flex-grow overflow-y-auto p-3 space-y-4 no-scrollbar">
                {comments.length === 0 && (
                    <div className="text-center opacity-50 mt-10">
                        <p className="text-xs">Chưa có ai bình luận...</p>
                        <p className="text-xs font-bold">Hãy là người đầu tiên!</p>
                    </div>
                )}
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 animate-fade-in group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 mt-1 shadow-md border border-white/20">
                            {comment.avatar ? (
                                <img src={comment.avatar} alt="avt" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-1">
                                <span className={`text-xs font-bold truncate mr-2 ${textColor}`}>{comment.username}</span>
                                <span className={`text-[10px] ${subTextColor}`}>{formatTime(comment.timestamp)}</span>
                            </div>
                            <div className={`rounded-2xl rounded-tl-none p-3 text-sm leading-relaxed ${bubbleBg} ${textColor}`}>
                                {comment.content}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-1 ml-1">
                                <button 
                                    onClick={() => toggleLike(comment.id, comment.likes)}
                                    className={`flex items-center gap-1 text-xs transition-colors hover:text-red-500 group/like ${subTextColor}`}
                                >
                                    <HeartIcon className="w-3 h-3 group-hover/like:fill-current group-active/like:scale-125 transition-transform" />
                                    <span>{comment.likes}</span>
                                </button>
                                <button className={`text-xs hover:text-theme-lime transition-colors ${subTextColor}`}>
                                    Trả lời
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={commentsEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-md flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isDbConnected ? "Tham gia thảo luận..." : "Viết ghi chú (Local)..."}
                        className={`flex-1 min-w-0 rounded-full pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-lime transition-all ${isGlass ? 'bg-white/20 placeholder-white/50 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600'}`}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isLoading}
                        className="flex-shrink-0 p-2.5 rounded-full bg-theme-lime text-theme-darkest hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 ml-[-2px] mt-[2px]" />
                        )}
                    </button>
                </form>
            </div>
             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CommentSection;

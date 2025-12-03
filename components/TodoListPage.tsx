
import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';
import { 
    HomeIcon, SearchIcon, SettingsIcon, 
    ChevronRightIcon, CheckIcon, PlayIcon, 
    PauseIcon, TrashIcon, CalendarDaysIcon,
    SparklesIcon, ClipboardIcon
} from './icons';

interface TodoListPageProps {
    settings: Settings;
    onBack?: () => void;
}

// --- UI Components ---

const NeoCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    color?: string;
    noShadow?: boolean;
}> = ({ children, className = "", color = "bg-white", noShadow = false }) => (
    <div className={`${color} border-2 border-black rounded-2xl ${noShadow ? '' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'} ${className} overflow-hidden transition-all`}>
        {children}
    </div>
);

const NeoButton: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    color?: string;
}> = ({ children, className = "", onClick, color = "bg-yellow-300" }) => (
    <button 
        onClick={onClick}
        className={`${color} border-2 border-black rounded-xl font-bold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className}`}
    >
        {children}
    </button>
);

// --- Icons for Design ---
const LightningIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);

// --- Functional Widgets ---

const HeaderWidget = ({ onBack }: { onBack?: () => void }) => (
    <NeoCard color="bg-yellow-300" className="p-3 flex items-center justify-between">
        <div className="flex gap-2">
            <NeoButton onClick={onBack} color="bg-blue-400" className="px-4 py-2 text-white flex items-center gap-2 shadow-none border-b-4 border-r-4 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
                <div className="bg-white/20 p-1 rounded"><HomeIcon className="w-4 h-4" /></div>
                <span className="hidden sm:inline">Trang chủ</span>
            </NeoButton>
        </div>
        <div className="font-black text-xl tracking-tighter uppercase hidden xs:block">Tiện Ích Anime</div>
        <div className="flex gap-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <SparklesIcon className="w-5 h-5 text-slate-800" />
            </div>
             <div className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-black bg-orange-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <SettingsIcon className="w-6 h-6 text-slate-800" />
            </div>
        </div>
    </NeoCard>
);

const ProfileWidget = ({ settings }: { settings: Settings }) => (
    <NeoCard className="p-4 flex items-center gap-4 bg-white">
        <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <img src={settings.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div>
            <h4 className="font-bold text-base">Xin chào, Wibu!</h4>
            <p className="text-xs text-slate-500 font-bold">Đã đến lúc cày anime rồi!</p>
        </div>
    </NeoCard>
);

const StatsWidget = () => (
    <NeoCard className="p-2 flex justify-between items-center bg-pink-100" noShadow>
        <div className="flex items-center gap-2 bg-white border-2 border-black rounded-lg px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <LightningIcon className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-sm">Level 99</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 pr-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Online</span>
        </div>
    </NeoCard>
);

interface Todo { id: number; text: string; completed: boolean; }

const TodoWidget = () => {
    const [todos, setTodos] = useState<Todo[]>(() => {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [
                { id: 1, text: 'Xem tập mới One Piece', completed: false },
                { id: 2, text: 'Đọc manga chap 100', completed: true }
            ];
        } catch { return []; }
    });
    const [input, setInput] = useState('');

    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <NeoCard className="p-5 flex flex-col gap-4 h-full min-h-[320px] bg-white relative">
            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
                <div className="space-y-1">
                    <h3 className="font-black text-2xl leading-tight">Nhiệm Vụ</h3>
                    <p className="text-xs text-slate-500 font-bold">Danh sách việc cần làm</p>
                </div>
                <div className="w-10 h-10 bg-purple-300 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ClipboardIcon className="w-5 h-5 text-black" />
                </div>
            </div>
            
            <div className="flex gap-2">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Thêm nhiệm vụ..."
                    className="flex-1 bg-slate-50 border-2 border-black rounded-xl px-3 py-2 font-bold text-sm focus:outline-none focus:bg-white transition-colors"
                />
                <NeoButton onClick={addTodo} color="bg-green-400" className="w-10 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5" />
                </NeoButton>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {todos.length === 0 && (
                    <p className="text-center text-slate-400 text-sm italic mt-10">Không có nhiệm vụ nào.</p>
                )}
                {todos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 group bg-slate-50 p-2 rounded-lg border-2 border-transparent hover:border-slate-200 transition-all">
                        <button 
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-6 h-6 border-2 border-black rounded flex items-center justify-center transition-all flex-shrink-0 ${todo.completed ? 'bg-black' : 'bg-white hover:bg-green-200'}`}
                        >
                            {todo.completed && <CheckIcon className="w-4 h-4 text-white" />}
                        </button>
                        <span className={`flex-1 text-sm font-bold leading-tight ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)} className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-400 hover:text-white rounded-lg text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
             {/* Progress bar decoration */}
             <div className="absolute bottom-0 left-0 w-full h-4 bg-slate-100 border-t-2 border-black">
                 <div 
                    className="h-full bg-green-400 border-r-2 border-black transition-all duration-500"
                    style={{ width: `${todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0}%` }}
                 ></div>
             </div>
        </NeoCard>
    );
};

const StopwatchWidget = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => setTime(t => t + 10), 10);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning]);

    const format = (ms: number) => {
        const m = Math.floor(ms / 60000).toString().padStart(2, '0');
        const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const c = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return { m, s, c };
    };

    const { m, s, c } = format(time);

    return (
        <NeoCard className="p-4 flex flex-col gap-4 bg-orange-300">
             <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-sm text-slate-800 leading-tight">Bấm Giờ</h3>
                    <p className="text-xs text-slate-600 mt-1">Pomodoro Timer</p>
                </div>
                <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className={`w-3 h-3 bg-red-500 rounded-full ${isRunning ? 'animate-ping' : ''}`}></div>
                </div>
            </div>
            
            <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-center items-end gap-1">
                <span className="text-4xl font-black tracking-tighter">{m}:{s}</span>
                <span className="text-xl font-bold text-slate-400 mb-1">.{c}</span>
            </div>

            <div className="flex gap-2">
                <NeoButton onClick={() => setIsRunning(!isRunning)} color={isRunning ? "bg-red-400" : "bg-green-400"} className="flex-1 py-2 text-white">
                    {isRunning ? <PauseIcon className="w-5 h-5 mx-auto" /> : <PlayIcon className="w-5 h-5 mx-auto" />}
                </NeoButton>
                <NeoButton onClick={() => { setIsRunning(false); setTime(0); }} color="bg-slate-100" className="px-4 text-slate-800">
                    Reset
                </NeoButton>
            </div>
        </NeoCard>
    );
};

const CalendarWidget = () => {
    const today = new Date();
    const date = today.getDate();
    const day = today.toLocaleDateString('en-US', { weekday: 'short' });
    const month = today.toLocaleDateString('en-US', { month: 'long' });

    return (
        <NeoCard className="p-4 flex flex-col justify-between h-full bg-blue-200">
            <div className="flex justify-between items-start">
                <span className="bg-black text-white px-2 py-1 rounded text-xs font-bold">{today.getFullYear()}</span>
                <CalendarDaysIcon className="w-6 h-6 text-slate-800" />
            </div>
            <div className="text-center my-2">
                 <div className="text-6xl font-black text-slate-900 leading-none drop-shadow-sm">{date}</div>
                 <div className="text-xl font-bold text-slate-700 uppercase tracking-widest">{day}</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg py-1 text-center font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {month}
            </div>
        </NeoCard>
    );
};

const NotesWidget = () => {
    const [note, setNote] = useState(() => localStorage.getItem('quickNote') || '');
    
    return (
        <NeoCard className="p-4 flex flex-col gap-2 h-full bg-yellow-100">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-black"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 border border-black"></div>
                <span className="ml-auto text-xs font-bold text-slate-500">Ghi chú nhanh</span>
            </div>
            <textarea 
                value={note}
                onChange={(e) => { setNote(e.target.value); localStorage.setItem('quickNote', e.target.value); }}
                className="flex-1 w-full bg-white border-2 border-black rounded-xl p-3 text-sm font-medium resize-none focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow leading-relaxed"
                placeholder="Viết gì đó vào đây..."
            />
        </NeoCard>
    );
};


const TodoListPage: React.FC<TodoListPageProps> = ({ settings, onBack }) => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans text-slate-900 pt-20 pb-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column 1: Profile & Tools */}
                <div className="flex flex-col gap-6">
                    <ProfileWidget settings={settings} />
                    <div className="grid grid-cols-2 gap-6">
                         <CalendarWidget />
                         <StatsWidget />
                    </div>
                    <NotesWidget />
                </div>

                {/* Column 2: Main Todo List */}
                <div className="flex flex-col gap-6 lg:row-span-2 h-full">
                    <HeaderWidget onBack={onBack} />
                    <div className="flex-1">
                        <TodoWidget />
                    </div>
                </div>

                {/* Column 3: Gadgets */}
                <div className="flex flex-col gap-6">
                    <StopwatchWidget />
                    
                    {/* Decorative Card simulating 'ArticleWidget' from the image */}
                    <NeoCard className="p-5 flex flex-col gap-3 bg-white">
                        <div className="flex justify-center mb-2">
                             <div className="bg-blue-400 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">!</div>
                        </div>
                        <h3 className="font-bold text-center text-sm">Mẹo vặt cuộc sống</h3>
                        <div className="relative w-full h-24 bg-slate-200 rounded-xl border-2 border-black overflow-hidden mt-1 group">
                             <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <SparklesIcon className="w-10 h-10 text-white animate-spin-slow" />
                             </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed text-justify font-medium">
                            Hãy nhớ uống đủ nước và nghỉ ngơi sau mỗi giờ xem Anime để bảo vệ sức khỏe nhé!
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-3 border-t-2 border-slate-100">
                             <div className="flex gap-2">
                                 <div className="w-6 h-6 flex items-center justify-center bg-black text-white rounded-md cursor-pointer hover:bg-slate-800"><span className="text-xs">❤️</span></div>
                            </div>
                             <p className="text-[10px] font-bold text-right">AniW Team</p>
                        </div>
                    </NeoCard>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #000; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #333; 
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TodoListPage;

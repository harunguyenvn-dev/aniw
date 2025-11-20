
import React, { useState, useRef, useEffect } from 'react';
import { Settings } from '../types';
import { UploadIcon, MusicalNoteIcon, PlayIcon, PauseIcon, CloseIcon } from './icons';

interface RelaxationPageProps {
    settings: Settings;
    onClose: () => void;
}

// Helper to extract dominant color from image
const getDominantColor = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve('#ffffff'); // Default fallback
                return;
            }
            canvas.width = 1;
            canvas.height = 1;
            ctx.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            resolve(`rgb(${r},${g},${b})`);
        };
        img.onerror = () => resolve('#ffffff');
    });
};

const RelaxationPage: React.FC<RelaxationPageProps> = ({ settings, onClose }) => {
    const [backgroundUrl, setBackgroundUrl] = useState<string>('');
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [accentColor, setAccentColor] = useState<string>('#ffffff'); 
    const [fileName, setFileName] = useState<string>('');
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<number | null>(null);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    // Clock Effect
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Audio Management
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        const audio = audioRef.current;

        if (audioUrl) {
            audio.src = audioUrl;
            if (isPlaying) {
                audio.play().catch(e => console.error("Playback failed", e));
            }
        }

        return () => {
            audio.pause();
        };
    }, [audioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) audio.play().catch(e => console.error("Playback failed", e));
            else audio.pause();
        }
    }, [isPlaying]);

    // Auto-hide controls logic
    useEffect(() => {
        const resetTimer = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = window.setTimeout(() => {
                if (isPlaying) setShowControls(false); // Only auto-hide if playing
            }, 3000);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('click', resetTimer);
        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('click', resetTimer);
            if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying]);

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBackgroundUrl(url);
            const color = await getDominantColor(url);
            setAccentColor(color);
        }
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            setFileName(file.name.replace(/\.[^/.]+$/, ""));
            setIsPlaying(true); 
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-sans text-white selection:bg-white/20">
            
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                {backgroundUrl ? (
                    <>
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[60s] ease-linear scale-100 hover:scale-105"
                            style={{ backgroundImage: `url(${backgroundUrl})` }}
                        />
                        {/* Sophisticated overlay gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" /> 
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-slate-800 via-[#000] to-[#000]" />
                    </div>
                )}
            </div>

            {/* 2. Main UI Layer */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12 pointer-events-none">
                
                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 pointer-events-auto animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-60">System Status: {isPlaying ? 'Active' : 'Idle'}</span>
                        </div>
                        {fileName && (
                            <div className="text-xs font-mono opacity-80 tracking-wide flex items-center gap-2">
                                <MusicalNoteIcon className="w-3 h-3" />
                                <span className="uppercase">{fileName}</span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={onClose} 
                        className="pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-300 group"
                    >
                        <CloseIcon className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
                    </button>
                </div>

                {/* Center Clock - The Hero Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mix-blend-overlay pointer-events-none select-none">
                    <h1 className="text-[15vw] leading-none font-thin tracking-tighter opacity-80" style={{ textShadow: `0 0 50px ${accentColor}40` }}>
                        {currentTime}
                    </h1>
                </div>

                {/* Bottom Controls Bar */}
                <div className={`flex justify-center transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl">
                        
                        {/* Upload BG */}
                        <button 
                            onClick={() => bgInputRef.current?.click()}
                            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white transition-all relative group"
                            title="Change Background"
                        >
                            <UploadIcon className="w-5 h-5" />
                            <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/10 mx-1"></div>

                        {/* Play/Pause Main Button */}
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            disabled={!audioUrl}
                            className="w-16 h-12 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: `0 0 20px ${accentColor}60` }}
                        >
                            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-0.5" />}
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/10 mx-1"></div>

                        {/* Upload Audio */}
                        <button 
                            onClick={() => audioInputRef.current?.click()}
                            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white transition-all group"
                            title="Upload Music"
                        >
                            <MusicalNoteIcon className="w-5 h-5" />
                            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                        </button>

                    </div>
                </div>

            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RelaxationPage;

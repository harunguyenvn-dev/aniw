
import React, { useState } from 'react';
import { Settings } from '../types';
import { CheckIcon, UploadIcon } from './icons';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (name: string, avatar: string) => void;
    currentSettings: Settings;
}

const PRESET_AVATARS = [
    'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar5.jpg',
    'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar1.jpg',
    'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar2.jpg',
    'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar3.jpg',
    'https://raw.githubusercontent.com/niyakipham/bilibili/refs/heads/main/icon/ic_avatar4.jpg',
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, currentSettings }) => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState(currentSettings.avatarUrl);
    const [customAvatar, setCustomAvatar] = useState('');
    const [step, setStep] = useState(1);

    if (!isOpen) return null;

    const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAvatar(e.target.value);
        if (e.target.value) setAvatar(e.target.value);
    };

    const handleNext = () => {
        if (step === 1 && name.trim()) {
            setStep(2);
        } else if (step === 2) {
            onComplete(name, avatar);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="p-8 relative z-10">
                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                            {step === 1 ? 'Xin Chào!' : 'Diện Mạo Mới'}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {step === 1 
                                ? 'Chào mừng bạn đến với AniW. Hãy cho chúng tôi biết tên của bạn nhé.' 
                                : 'Chọn một ảnh đại diện thật chất để thể hiện cá tính.'}
                        </p>
                    </div>

                    {/* Step 1: Name Input */}
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên của bạn..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center font-bold"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 -z-10 blur transition-opacity duration-300"></div>
                            </div>
                            
                            <button
                                onClick={handleNext}
                                disabled={!name.trim()}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                            >
                                Tiếp Tục
                            </button>
                        </div>
                    )}

                    {/* Step 2: Avatar Selection */}
                    {step === 2 && (
                        <div className="space-y-6 animate-slide-up">
                            {/* Avatar Preview */}
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-400 to-purple-500 shadow-xl relative">
                                    <img 
                                        src={avatar} 
                                        alt="Avatar Preview" 
                                        className="w-full h-full rounded-full object-cover bg-slate-800"
                                        onError={(e) => e.currentTarget.src = PRESET_AVATARS[0]}
                                    />
                                    <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-[#1a1a2e] w-6 h-6 rounded-full flex items-center justify-center">
                                        <CheckIcon className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="flex justify-center gap-3">
                                {PRESET_AVATARS.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setAvatar(url); setCustomAvatar(''); }}
                                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${avatar === url ? 'border-purple-500 ring-2 ring-purple-500/30 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-[#1a1a2e] px-2 text-slate-500">Hoặc dùng link ảnh</span>
                                </div>
                            </div>

                            {/* Custom Input */}
                            <div className="relative">
                                <UploadIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={customAvatar}
                                    onChange={handleCustomAvatarChange}
                                    placeholder="Dán link ảnh vào đây..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                                >
                                    Quay Lại
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
                                >
                                    Hoàn Tất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default OnboardingModal;

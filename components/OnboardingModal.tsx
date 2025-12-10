
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

    // --- Dynamic Styling based on Theme ---
    const isGlass = ['glass-ui', 'liquid-glass'].includes(currentSettings.theme);
    
    const containerClasses = isGlass
        ? 'glass-card text-theme-darkest dark:text-theme-lightest'
        : 'bg-theme-lightest dark:bg-theme-darkest text-theme-darkest dark:text-theme-lightest border border-theme-mint/50 dark:border-theme-olive/50';

    const inputClasses = isGlass
        ? 'bg-white/50 dark:bg-black/20 border-white/30 text-theme-darkest dark:text-theme-lightest placeholder-theme-darkest/50 dark:placeholder-theme-lightest/50'
        : 'bg-white dark:bg-black/20 border-theme-mint/50 dark:border-theme-olive/50 text-theme-darkest dark:text-theme-lightest placeholder-theme-darkest/40 dark:placeholder-theme-lightest/40';

    const buttonPrimaryClasses = 'bg-gradient-to-r from-theme-mint to-theme-lime hover:from-theme-lime hover:to-theme-mint text-theme-darkest shadow-theme-lime/25';
    const buttonSecondaryClasses = isGlass ? 'bg-white/20 hover:bg-white/30 text-theme-darkest dark:text-theme-lightest' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-theme-darkest dark:text-theme-lightest';

    const decorativeBlob1 = 'bg-theme-mint/30';
    const decorativeBlob2 = 'bg-theme-lime/30';
    const accentGradient = 'from-theme-olive to-theme-lime';

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <div className={`w-full max-w-md ${containerClasses} rounded-3xl overflow-hidden shadow-2xl relative transition-colors duration-500`}>
                {/* Decorative Elements */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentGradient}`}></div>
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${decorativeBlob1} rounded-full blur-3xl animate-pulse`}></div>
                <div className={`absolute -bottom-20 -left-20 w-40 h-40 ${decorativeBlob2} rounded-full blur-3xl animate-pulse delay-700`}></div>

                <div className="p-8 relative z-10">
                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <h1 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${accentGradient} mb-2`}>
                            {step === 1 ? 'Xin Chào!' : 'Diện Mạo Mới'}
                        </h1>
                        <p className="opacity-70 text-sm font-medium">
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
                                    className={`w-full ${inputClasses} border rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-theme-lime focus:ring-1 focus:ring-theme-lime transition-all text-center font-bold`}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
                                />
                            </div>
                            
                            <button
                                onClick={handleNext}
                                disabled={!name.trim()}
                                className={`w-full py-4 rounded-xl ${buttonPrimaryClasses} font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95`}
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
                                <div className={`w-24 h-24 rounded-full p-1 bg-gradient-to-tr ${accentGradient} shadow-xl relative`}>
                                    <img 
                                        src={avatar} 
                                        alt="Avatar Preview" 
                                        className="w-full h-full rounded-full object-cover bg-slate-800"
                                        onError={(e) => e.currentTarget.src = PRESET_AVATARS[0]}
                                    />
                                    <div className="absolute bottom-0 right-0 bg-theme-lime border-2 border-white dark:border-slate-900 w-6 h-6 rounded-full flex items-center justify-center">
                                        <CheckIcon className="w-3 h-3 text-theme-darkest" />
                                    </div>
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="flex justify-center gap-3">
                                {PRESET_AVATARS.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setAvatar(url); setCustomAvatar(''); }}
                                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${avatar === url ? 'border-theme-lime ring-2 ring-theme-lime/30 scale-110' : 'border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-theme-darkest/10 dark:border-theme-lightest/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className={`px-2 opacity-60 ${isGlass ? 'bg-transparent' : 'bg-theme-lightest dark:bg-theme-darkest'}`}>Hoặc dùng link ảnh</span>
                                </div>
                            </div>

                            {/* Custom Input */}
                            <div className="relative">
                                <UploadIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                                <input
                                    type="text"
                                    value={customAvatar}
                                    onChange={handleCustomAvatarChange}
                                    placeholder="Dán link ảnh vào đây..."
                                    className={`w-full ${inputClasses} border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-theme-lime transition-all`}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-3 rounded-xl ${buttonSecondaryClasses} font-semibold transition-colors`}
                                >
                                    Quay Lại
                                </button>
                                <button
                                    onClick={handleNext}
                                    className={`flex-[2] py-3 rounded-xl ${buttonPrimaryClasses} font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95`}
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

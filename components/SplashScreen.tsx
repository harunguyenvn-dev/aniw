import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    finishLoading: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ finishLoading }) => {
    const [show, setShow] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setShow(false), 200); // Start fade out
                    setTimeout(finishLoading, 700); // Unmount after animation
                    return 100;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 100);

        return () => {
            clearInterval(timer);
        };
    }, [finishLoading]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ease-out ${
                show ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo / Text */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 animate-pulse mb-8">
                    AniW
                </h1>
                
                {/* Modern Loader */}
                <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                <p className="mt-4 text-gray-500 font-mono text-sm tracking-widest animate-bounce">
                    INITIALIZING... {Math.round(progress)}%
                </p>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                 <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-3xl animate-blob mix-blend-screen" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-screen" />
            </div>
            
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;

import React, { useState, useEffect, useRef } from 'react';
import { Anime, Settings } from '../types';
import { ShuffleIcon } from './icons';

interface RandomAnimePageProps {
    animeList: Anime[];
    settings: Settings;
}

const RandomAnimePage: React.FC<RandomAnimePageProps> = ({ animeList, settings }) => {
    const [randomAnime, setRandomAnime] = useState<Anime | null>(null);
    const [randomEpisodeLink, setRandomEpisodeLink] = useState<string | null>(null);
    const [randomEpisodeTitle, setRandomEpisodeTitle] = useState<string>('');
    const [isAnimating, setIsAnimating] = useState(false);

    const rollRandomAnime = () => {
        if (animeList.length === 0) return;

        setIsAnimating(true);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * animeList.length);
            const anime = animeList[randomIndex];
            
            if (anime.episodes.length > 0) {
                const randomEpIndex = Math.floor(Math.random() * anime.episodes.length);
                const episode = anime.episodes[randomEpIndex];
                
                setRandomAnime(anime);
                setRandomEpisodeTitle(episode.episodeTitle);

                // Process link
                let link = episode.link;
                try {
                    const url = new URL(link);
                    url.searchParams.set('autoplay', '1');
                    url.searchParams.set('mute', '0');
                    setRandomEpisodeLink(url.toString());
                } catch {
                    setRandomEpisodeLink(link.includes('?') ? `${link}&autoplay=1` : `${link}?autoplay=1`);
                }
            }
            setIsAnimating(false);
        }, 500); // Short animation delay
    };

    useEffect(() => {
        if (animeList.length > 0 && !randomAnime) {
            rollRandomAnime();
        }
    }, [animeList]);

    if (animeList.length === 0) return <div className="h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;

    const isGlass = ['glass-ui', 'liquid-glass'].includes(settings.theme);
    const sandboxValue = settings.blockNewTabs ? "allow-scripts allow-same-origin allow-presentation" : "allow-scripts allow-same-origin allow-popups allow-presentation";

    return (
        <div className="h-screen w-screen relative overflow-hidden bg-black text-white flex flex-col">
            {/* Blurred Background */}
            <div className="absolute inset-0 -z-10">
                <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10`} />
                 {/* Placeholder for dynamic background if we had images, using a static gradient for now */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 animate-pulse"></div>
            </div>

            {/* Main Content */}
            <div className="flex-grow relative flex items-center justify-center p-4 pb-16 md:pb-20">
                 <div className={`relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-500`}>
                    {randomEpisodeLink ? (
                        <>
                            <iframe
                                src={randomEpisodeLink}
                                title={randomEpisodeTitle}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                sandbox={sandboxValue}
                                className="w-full h-full"
                            ></iframe>
                            {/* Floating Random Button */}
                            <button
                                onClick={rollRandomAnime}
                                className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-theme-lime hover:text-theme-darkest text-white rounded-full backdrop-blur-md transition-all duration-300 z-20 group shadow-lg border border-white/10"
                                title="Random Anime Khác"
                            >
                                <ShuffleIcon className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
                            </button>
                        </>
                    ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-500">
                            Bấm nút ngẫu nhiên để bắt đầu
                        </div>
                    )}
                </div>
            </div>

            {/* Controls overlay at bottom */}
            <div className={`flex-shrink-0 p-6 pb-10 flex flex-col md:flex-row items-center justify-between gap-4 z-20 ${isGlass ? 'glass-card rounded-t-3xl border-t border-white/10' : 'bg-theme-darkest/80 backdrop-blur-md border-t border-white/5'}`}>
                <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-1">
                        {randomAnime?.name || 'Anime Random'}
                    </h2>
                    <p className="text-sm md:text-base text-slate-300">
                        {randomEpisodeTitle || 'Khám phá những bộ anime thú vị'}
                    </p>
                </div>

                <button
                    onClick={rollRandomAnime}
                    disabled={isAnimating}
                    className="group relative px-8 py-3 rounded-full bg-white text-black font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2 group-hover:text-white transition-colors">
                        <ShuffleIcon className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
                        Ngẫu nhiên
                    </span>
                </button>
            </div>
        </div>
    );
};

export default RandomAnimePage;

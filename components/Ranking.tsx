import React, { useState, useEffect } from 'react';
import { RankedAnime, Settings } from '../types';

interface RankingProps {
    settings: Settings;
    containerClassName?: string;
}

const Ranking: React.FC<RankingProps> = ({ settings, containerClassName }) => {
    const [ranking, setRanking] = useState<RankedAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const query = `
            query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
                Page(page: $page, perPage: $perPage) {
                    media(type: ANIME, sort: $sort) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            extraLarge
                            color
                        }
                        averageScore
                        genres
                    }
                }
            }
        `;

        const variables = {
            page: 1,
            perPage: 50,
            sort: 'SCORE_DESC'
        };

        const fetchData = async () => {
            try {
                const response = await fetch('https://graphql.anilist.co', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        query: query,
                        variables: variables
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const json = await response.json();
                if (json.errors) {
                    throw new Error(`GraphQL error: ${json.errors.map((e: any) => e.message).join(', ')}`);
                }
                
                setRanking(json.data.Page.media);
            } catch (e: any) {
                console.error("Failed to fetch ranking data:", e);
                setError(`Không thể tải bảng xếp hạng. Vui lòng thử lại sau. Lỗi: ${e.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-theme-lime"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-center px-4 pt-20">
                <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg">
                    <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-4">Đã xảy ra lỗi</h2>
                    <p className="text-slate-300 text-sm sm:text-base">{error}</p>
                </div>
            </div>
        );
    }
    
    const topThree = ranking.slice(0, 3);
    const restOfRanking = ranking.slice(3);
    const activeAnime = topThree[activeIndex];

    return (
        <main className={`${containerClassName} flex flex-col h-screen`}>
            <div className="max-w-7xl mx-auto w-full flex-shrink-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-10">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-theme-lime to-theme-mint">
                       Bảng Xếp Hạng Anime
                    </span>
                </h1>
            </div>

            <div className="max-w-7xl mx-auto w-full flex-grow min-h-0">
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    {/* Left Panel: Top 3 */}
                    <div className="w-full lg:w-2/5 h-[60vh] lg:h-full flex flex-col gap-4">
                        <div className="relative flex-grow rounded-2xl overflow-hidden group shadow-2xl bg-slate-800">
                             {activeAnime && (
                                <>
                                    <img 
                                        key={activeAnime.id}
                                        src={activeAnime.coverImage.extraLarge} 
                                        alt={activeAnime.title.romaji}
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 animate-fade-in" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div 
                                        className="absolute -top-4 -right-2 p-4 font-black text-white/80 mix-blend-soft-light"
                                        style={{ fontSize: 'clamp(6rem, 20vw, 12rem)', lineHeight: 1 }}
                                    >
                                        #{activeIndex + 1}
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-6 text-white">
                                        <h2 
                                            className="text-2xl md:text-3xl font-bold uppercase tracking-wider animate-slide-up"
                                            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                                            key={activeAnime.id + '-title'}
                                        >
                                            {activeAnime.title.english || activeAnime.title.romaji}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2 text-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-bold">{(activeAnime.averageScore / 10).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </>
                             )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 h-24 lg:h-28 flex-shrink-0">
                            {topThree.map((anime, index) => (
                                <button
                                    key={anime.id}
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative rounded-lg overflow-hidden transition-all duration-300 focus:outline-none ${activeIndex === index ? 'ring-4 ring-offset-2 ring-offset-theme-darkest dark:ring-offset-theme-lightest ring-theme-lime' : 'opacity-60 hover:opacity-100 scale-95 hover:scale-100'}`}
                                >
                                     <img src={anime.coverImage.extraLarge} alt={anime.title.romaji} className="w-full h-full object-cover" />
                                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Ranks 4+ */}
                    <div className="w-full lg:w-3/5 h-[40vh] lg:h-full flex flex-col">
                        <h3 className="text-2xl font-bold mb-4 flex-shrink-0 text-slate-800 dark:text-slate-100">Hạng 4 - 50</h3>
                        <div className="overflow-y-auto space-y-3 flex-grow no-scrollbar pr-2">
                            {restOfRanking.map((anime, index) => {
                                const itemClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
                                    ? 'glass-card'
                                    : 'bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50';
                                return (
                                <div key={anime.id} className={`p-3 flex items-center gap-4 transition-all duration-300 rounded-lg ${itemClasses}`}>
                                    <span className="w-10 text-xl font-bold text-slate-500 dark:text-slate-400 text-center">#{index + 4}</span>
                                    <img src={anime.coverImage.extraLarge} className="w-12 h-16 object-cover rounded-md flex-shrink-0 bg-slate-700" alt={anime.title.romaji} />
                                    <div className="flex-grow min-w-0">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{anime.title.english || anime.title.romaji}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span>{(anime.averageScore / 10).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                 @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.5s 0.2s ease-out forwards; }
            `}</style>
        </main>
    );
};

export default Ranking;